import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { MAX_ATTEMPTS_PER_ASSIGNMENT } from "../src/assignments/assignments.service";

/**
 * Attempt cap (owner decision 2026-07-17): 5 quiz attempts per assignment,
 * consumed on start. The 6th start is rejected server-side; an already-started
 * attempt may still be submitted.
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("quiz attempt cap", () => {
  it(`allows ${MAX_ATTEMPTS_PER_ASSIGNMENT} starts, rejects the next, and still lets the last attempt submit`, async () => {
    const worker = fx.A.worker;
    // Satisfy the lesson gate first (the shared module has one READY lesson).
    await t
      .as(worker.clerkUserId)
      .post(`/lessons/${fx.lessonId}/complete`)
      .expect(201);

    const assignment = await rawDb.assignment.create({
      data: {
        orgId: fx.A.orgId,
        staffId: worker.staffId,
        moduleId: fx.moduleId,
        status: "ASSIGNED",
        dueAt: new Date(Date.now() + 20 * 86_400_000),
      },
    });

    let lastAttemptId = "";
    for (let i = 0; i < MAX_ATTEMPTS_PER_ASSIGNMENT; i++) {
      const res = await t
        .as(worker.clerkUserId)
        .post(`/assignments/${assignment.id}/attempts`);
      expect(res.status).toBe(201);
      lastAttemptId = res.body.id;
    }

    const blocked = await t
      .as(worker.clerkUserId)
      .post(`/assignments/${assignment.id}/attempts`);
    expect(blocked.status).toBe(400);
    expect(blocked.body.message).toMatch(/attempt limit reached/i);

    // The already-started 5th attempt is still submittable.
    const q = await rawDb.question.findFirst({
      where: { quiz: { moduleId: fx.moduleId } },
    });
    const submit = await t
      .as(worker.clerkUserId)
      .post(`/assignments/attempts/${lastAttemptId}/submit`)
      .send({
        responses: [
          { questionId: q!.id, selectedIdx: q!.correctIdx as number[] },
        ],
      });
    expect(submit.status).toBe(201);
    expect(submit.body.passed).toBe(true);
  });

  it("exposes maxAttempts on the learner assignment read", async () => {
    const res = await t
      .as(fx.B.worker.clerkUserId)
      .get(`/assignments/${fx.B.assignmentId}`)
      .expect(200);
    expect(res.body.maxAttempts).toBe(MAX_ATTEMPTS_PER_ASSIGNMENT);
  });
});
