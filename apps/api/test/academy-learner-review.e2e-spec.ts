import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient, type Attempt } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";
import { MAX_ATTEMPTS_PER_ASSIGNMENT } from "../src/assignments/assignments.service";

/**
 * Post-completion learner surfaces, both compliance-sensitive:
 *
 *  1. Quiz REVIEW REVEAL POLICY — the answer key (correctIdx + explanations) is
 *     only returned once the learner has passed OR exhausted their attempts. A
 *     failed attempt with retries left must return correctness ONLY, so the
 *     certificate can't be earned by farming answers off a throwaway attempt.
 *  2. Certificate METADATA AUTHORIZATION — the in-app certificate view is owner-
 *     or-same-org-admin only; a different org's staff gets 403.
 *
 * Built on the C1 two-org fixtures (real Postgres + the real HTTP stack).
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;
// A second STAFF-level worker in Org A (not the certificate owner) — exercises
// the app-layer owns/admin gate (403) that the guardrail's 404 doesn't reach.
let aPeerAuth: string;

const DAY = 86_400_000;
const aWorker = () => fx.A.worker.externalAuthId;

async function freshAssignment() {
  return rawDb.assignment.create({
    data: {
      orgId: fx.A.orgId,
      staffId: fx.A.worker.staffId,
      moduleId: fx.moduleId,
      status: "ASSIGNED",
      dueAt: new Date(Date.now() + 10 * DAY),
    },
  });
}

async function firstQuestion() {
  const quiz = await rawDb.quiz.findUnique({ where: { moduleId: fx.moduleId } });
  const q = await rawDb.question.findFirst({
    where: { quizId: quiz!.id },
    orderBy: { position: "asc" },
  });
  return q!;
}

async function correctResponses() {
  const q = await firstQuestion();
  return [{ questionId: q.id, selectedIdx: q.correctIdx as number[] }];
}

async function wrongResponses() {
  const q = await firstQuestion();
  const correct = q.correctIdx as number[];
  const n = (q.choicesEn as string[]).length;
  const wrong = [...Array(n).keys()].find((i) => !correct.includes(i)) ?? 0;
  return [{ questionId: q.id, selectedIdx: [wrong] }];
}

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
  // Open the quiz gate for Org-A's worker by completing the READY lesson.
  await t.as(aWorker()).post(`/lessons/${fx.lessonId}/complete`).expect(201);

  // A same-org peer (STAFF, not the cert owner) for the 403 authorization case.
  const peerUser = await rawDb.user.create({
    data: {
      externalAuthId: "clerk_A_peer",
      email: "peer.a@example.com",
      name: "Peer A",
    },
  });
  await rawDb.staff.create({
    data: {
      userId: peerUser.id,
      orgId: fx.A.orgId,
      siteId: fx.A.siteId,
      roleCode: "NB_PCW",
      orgPermission: "STAFF",
    },
  });
  aPeerAuth = peerUser.externalAuthId!;
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("quiz review reveal policy", () => {
  it("a failed attempt with retries remaining does NOT reveal the answer key", async () => {
    const a = await freshAssignment();
    const start = await t.as(aWorker()).post(`/assignments/${a.id}/attempts`);
    expect(start.status).toBe(201);

    const submit = await t
      .as(aWorker())
      .post(`/assignments/attempts/${start.body.id}/submit`)
      .send({ responses: await wrongResponses() });

    expect(submit.status).toBe(201);
    expect(submit.body.passed).toBe(false);
    expect(submit.body.reviewRevealed).toBe(false);
    expect(submit.body.results[0].correct).toBe(false);
    // The key is withheld while attempts remain.
    expect(submit.body.results[0].correctIdx).toBeUndefined();
    expect(submit.body.results[0].explainEn).toBeUndefined();
  });

  it("a passing attempt reveals the answer key + explanations", async () => {
    const a = await freshAssignment();
    const start = await t.as(aWorker()).post(`/assignments/${a.id}/attempts`);

    const submit = await t
      .as(aWorker())
      .post(`/assignments/attempts/${start.body.id}/submit`)
      .send({ responses: await correctResponses() });

    expect(submit.status).toBe(201);
    expect(submit.body.passed).toBe(true);
    expect(submit.body.reviewRevealed).toBe(true);
    expect(submit.body.results[0].correct).toBe(true);
    expect(submit.body.results[0]).toHaveProperty("correctIdx");
  });

  it("a failed attempt reveals once all attempts are exhausted", async () => {
    const a = await freshAssignment();
    // Consume the whole attempt budget directly, then submit the last one wrong.
    const attempts: Attempt[] = [];
    for (let i = 0; i < MAX_ATTEMPTS_PER_ASSIGNMENT; i++) {
      attempts.push(
        await rawDb.attempt.create({
          data: { orgId: fx.A.orgId, assignmentId: a.id },
        }),
      );
    }
    const last = attempts[attempts.length - 1];

    const submit = await t
      .as(aWorker())
      .post(`/assignments/attempts/${last.id}/submit`)
      .send({ responses: await wrongResponses() });

    expect(submit.status).toBe(201);
    expect(submit.body.passed).toBe(false);
    // Failed, but no attempts left → review unlocks.
    expect(submit.body.reviewRevealed).toBe(true);
    expect(submit.body.results[0]).toHaveProperty("correctIdx");
  });
});

describe("certificate metadata authorization", () => {
  it("the owner can read their own certificate metadata", async () => {
    const res = await t
      .as(fx.A.worker.externalAuthId)
      .get(`/certificates/${fx.A.certificateId}`);
    expect(res.status).toBe(200);
    expect(res.body.learnerName).toBe("Worker A");
    expect(res.body.moduleTitleEn).toBe("C1 Test Module");
    expect(res.body.sha256).toBe("sha-A");
  });

  it("a same-org admin can read a worker's certificate metadata", async () => {
    const res = await t
      .as(fx.A.admin.externalAuthId)
      .get(`/certificates/${fx.A.certificateId}`);
    expect(res.status).toBe(200);
    expect(res.body.learnerName).toBe("Worker A");
  });

  it("a same-org non-admin peer is forbidden (403)", async () => {
    const res = await t
      .as(aPeerAuth)
      .get(`/certificates/${fx.A.certificateId}`);
    expect(res.status).toBe(403);
  });

  it("a different org's staff cannot see the certificate at all (404, tenant-scoped)", async () => {
    // The guardrail scopes the lookup to the caller's org, so Org-B's worker
    // gets 404 (not 403) — the certificate is invisible, not just forbidden.
    const res = await t
      .as(fx.B.worker.externalAuthId)
      .get(`/certificates/${fx.A.certificateId}`);
    expect(res.status).toBe(404);
  });

  it("an unknown certificate id is 404", async () => {
    const res = await t
      .as(fx.A.worker.externalAuthId)
      .get(`/certificates/does-not-exist`);
    expect(res.status).toBe(404);
  });
});
