import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { PrismaService } from "../src/prisma/prisma.service";
import { runAsSystem, runWithOrgContext } from "../src/tenant/tenant-context";

/**
 * Lesson-progress quiz gate — a learner must complete every READY lesson of a
 * module before starting or submitting a quiz attempt, enforced server-side
 * (Phase A: watch-lessons → unlock-quiz → pass → certificate). Also proves the
 * new LessonProgress PHI model is covered by the tenant guardrail.
 *
 * Uses the C1 two-org fixtures: the shared library module has one READY lesson,
 * so it is exactly the gated case. Seeded once — tests below are order-aware
 * (Org-A completes the lesson midway; later cases assert Org-B stays gated).
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;

const tok = {
  aAdmin: () => fx.A.admin.externalAuthId,
  aWorker: () => fx.A.worker.externalAuthId,
  bWorker: () => fx.B.worker.externalAuthId,
};

const DAY = 86_400_000;

async function freshAssignment(org: "A" | "B", daysOut: number) {
  const f = fx[org];
  return rawDb.assignment.create({
    data: {
      orgId: f.orgId,
      staffId: f.worker.staffId,
      moduleId: fx.moduleId,
      status: "ASSIGNED",
      dueAt: new Date(Date.now() + daysOut * DAY),
    },
  });
}

async function correctResponses() {
  const quiz = await rawDb.quiz.findUnique({ where: { moduleId: fx.moduleId } });
  const questions = await rawDb.question.findMany({
    where: { quizId: quiz!.id },
    orderBy: { position: "asc" },
  });
  return questions.map((q) => ({
    questionId: q.id,
    selectedIdx: q.correctIdx as number[],
  }));
}

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("lesson-progress quiz gate", () => {
  it("blocks starting an attempt while the READY lesson is incomplete", async () => {
    const a = await freshAssignment("A", 10);
    const res = await t.as(tok.aWorker()).post(`/assignments/${a.id}/attempts`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lessons must be completed/i);
  });

  it("blocks submitting a pre-created attempt too (no side door)", async () => {
    const a = await freshAssignment("A", 11);
    const attempt = await rawDb.attempt.create({
      data: { orgId: fx.A.orgId, assignmentId: a.id },
    });
    const res = await t
      .as(tok.aWorker())
      .post(`/assignments/attempts/${attempt.id}/submit`)
      .send({ responses: await correctResponses() });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lessons must be completed/i);
  });

  it("rejects completion of a non-preview lesson by staff without an assignment", async () => {
    await t
      .as(tok.aAdmin())
      .post(`/lessons/${fx.lessonId}/complete`)
      .expect(403);
  });

  it("completing the lesson unlocks start → submit → pass", async () => {
    await t
      .as(tok.aWorker())
      .post(`/lessons/${fx.lessonId}/complete`)
      .expect(201);

    const a = await freshAssignment("A", 12);
    const start = await t
      .as(tok.aWorker())
      .post(`/assignments/${a.id}/attempts`);
    expect(start.status).toBe(201);

    const submit = await t
      .as(tok.aWorker())
      .post(`/assignments/attempts/${start.body.id}/submit`)
      .send({ responses: await correctResponses() });
    expect(submit.status).toBe(201);
    expect(submit.body.passed).toBe(true);
    expect(submit.body.scorePct).toBe(100);
  });

  it("re-completing is idempotent (one progress row)", async () => {
    await t
      .as(tok.aWorker())
      .post(`/lessons/${fx.lessonId}/complete`)
      .expect(201);
    const rows = await rawDb.lessonProgress.findMany({
      where: { staffId: fx.A.worker.staffId, lessonId: fx.lessonId },
    });
    expect(rows).toHaveLength(1);
  });

  it("Org-A's progress does not unlock Org-B's worker", async () => {
    const b = await freshAssignment("B", 10);
    const res = await t.as(tok.bWorker()).post(`/assignments/${b.id}/attempts`);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/lessons must be completed/i);
  });

  it("GET /modules/:slug reflects per-staff completion and the unlock flag", async () => {
    const asA = await t.as(tok.aWorker()).get(`/modules/c1-test-module`).expect(200);
    expect(asA.body.lessons[0].completedAt).toBeTruthy();
    expect(asA.body.quizUnlocked).toBe(true);

    const asB = await t.as(tok.bWorker()).get(`/modules/c1-test-module`).expect(200);
    expect(asB.body.lessons[0].completedAt).toBeNull();
    expect(asB.body.quizUnlocked).toBe(false);
  });

  it("guardrail hides Org-A's progress rows from an Org-B context (system sees them)", async () => {
    const prisma = t.app.get(PrismaService);
    const asSystem = await runAsSystem(
      async () =>
        await prisma.lessonProgress.findMany({
          where: { lessonId: fx.lessonId },
        }),
    );
    expect(asSystem.length).toBeGreaterThanOrEqual(1);

    const asOrgB = await runWithOrgContext(
      fx.B.orgId,
      async () =>
        await prisma.lessonProgress.findMany({
          where: { lessonId: fx.lessonId },
        }),
    );
    expect(asOrgB).toHaveLength(0);
  });
});
