import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";

/**
 * The learner-facing assignment read must never ship the quiz answer key.
 * Before this fix, GET /assignments/:id included each question's correctIdx
 * and explain* fields, which the web quiz page then serialized into the HTML
 * sent to the learner — view-source gave away every answer.
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

describe("GET /assignments/:id — no answer key in the learner payload", () => {
  it("returns questions without correctIdx or explanations, but with the fields the quiz UI needs", async () => {
    const res = await t
      .as(fx.A.worker.externalAuthId)
      .get(`/assignments/${fx.A.assignmentId}`)
      .expect(200);

    const questions = res.body.module.quiz.questions;
    expect(questions.length).toBeGreaterThanOrEqual(1);
    for (const q of questions) {
      expect(q).not.toHaveProperty("correctIdx");
      expect(q).not.toHaveProperty("explainEn");
      expect(q).not.toHaveProperty("explainFr");
      expect(q).toHaveProperty("id");
      expect(q).toHaveProperty("promptEn");
      expect(q).toHaveProperty("promptFr");
      expect(q).toHaveProperty("type");
      expect(q).toHaveProperty("choicesEn");
      expect(q).toHaveProperty("choicesFr");
    }
  });

  it("scoring still works server-side after the strip (submit path re-reads the key internally)", async () => {
    // The C1 seed leaves each worker's seeded attempt unsubmitted — submit it
    // with the correct answer and expect a real score. The module's READY
    // lesson must be completed first or the quiz gate rejects the submit.
    await t
      .as(fx.A.worker.externalAuthId)
      .post(`/lessons/${fx.lessonId}/complete`)
      .expect(201);
    const quiz = await rawDb.quiz.findUnique({
      where: { moduleId: fx.moduleId },
    });
    const q = await rawDb.question.findFirst({ where: { quizId: quiz!.id } });
    const res = await t
      .as(fx.A.worker.externalAuthId)
      .post(`/assignments/attempts/${fx.A.attemptId}/submit`)
      .send({
        responses: [{ questionId: q!.id, selectedIdx: q!.correctIdx as number[] }],
      });
    expect(res.status).toBe(201);
    expect(res.body.scorePct).toBe(100);
    expect(res.body.passed).toBe(true);
  });
});
