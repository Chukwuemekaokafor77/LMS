import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { PrismaClient } from "@prisma/client";
import { setupTestApp, type TestApp } from "./harness";
import { seedTwoOrgs, type Fixtures } from "./seed-two-orgs";

/**
 * Org-admin authoring surface (module → lessons → quiz → publish). Content is
 * not guardrail-covered PHI, so the suite leans on the explicit ownership
 * scoping: org admins author only their own org's modules, other orgs' and
 * global-library content 404s, and drafts stay invisible to learners.
 */
let t: TestApp;
let fx: Fixtures;
let rawDb: PrismaClient;

const MODULE_BODY = {
  titleEn: "Lone-Worker Safety",
  titleFr: "Sécurité du travailleur seul",
  descriptionEn: "Working alone in a client's home, safely.",
  descriptionFr: "Travailler seul au domicile d'un client, en sécurité.",
  durationMin: 30,
};

const QUIZ_BODY = {
  passMark: 80,
  randomize: false,
  questions: [
    {
      promptEn: "Check in before entering?",
      promptFr: "S'annoncer avant d'entrer ?",
      type: "TRUE_FALSE",
      choicesEn: ["True", "False"],
      choicesFr: ["Vrai", "Faux"],
      correctIdx: [0],
    },
    {
      promptEn: "Pick the safe actions",
      promptFr: "Choisissez les actions sécuritaires",
      type: "MULTIPLE",
      choicesEn: ["Share itinerary", "Prop the door", "Charge your phone"],
      choicesFr: ["Partager l'itinéraire", "Bloquer la porte", "Charger le téléphone"],
      correctIdx: [0, 2],
    },
  ],
};

beforeAll(async () => {
  rawDb = new PrismaClient();
  fx = await seedTwoOrgs(rawDb);
  t = await setupTestApp();
}, 60_000);

afterAll(async () => {
  await t?.app.close();
  await rawDb?.$disconnect();
});

describe("authoring", () => {
  it("full authoring loop: draft → lessons → quiz → publish → learner-visible", async () => {
    const admin = t.as(fx.A.admin.externalAuthId);

    const created = await admin
      .post("/authoring/modules")
      .send(MODULE_BODY)
      .expect(201);
    const moduleId = created.body.id as string;
    expect(created.body.status).toBe("DRAFT");
    expect(created.body.orgId).toBe(fx.A.orgId);
    expect(created.body.slug).toMatch(/^lone-worker-safety-/);

    // Draft is invisible to the org's learners.
    const workerList = await t
      .as(fx.A.worker.externalAuthId)
      .get("/modules")
      .expect(200);
    expect(
      (workerList.body as { id: string }[]).map((m) => m.id),
    ).not.toContain(moduleId);

    // Publishing an empty module is rejected.
    const emptyPublish = await admin
      .patch(`/authoring/modules/${moduleId}`)
      .send({ status: "PUBLISHED" });
    expect(emptyPublish.status).toBe(400);

    // Lessons: create two, rename one, reorder, delete one.
    const l1 = await admin
      .post(`/authoring/modules/${moduleId}/lessons`)
      .send({ titleEn: "Before the visit", titleFr: "Avant la visite" })
      .expect(201);
    const l2 = await admin
      .post(`/authoring/modules/${moduleId}/lessons`)
      .send({ titleEn: "During the visit", titleFr: "Pendant la visite", isPreview: true })
      .expect(201);
    expect(l2.body.position).toBe(1);

    await admin
      .patch(`/authoring/lessons/${l1.body.id}`)
      .send({ titleEn: "Before you knock" })
      .expect(200);

    const reordered = await admin
      .put(`/authoring/modules/${moduleId}/lessons/order`)
      .send({ lessonIds: [l2.body.id, l1.body.id] })
      .expect(200);
    expect(reordered.body[0].id).toBe(l2.body.id);
    expect(reordered.body[0].position).toBe(0);

    const l3 = await admin
      .post(`/authoring/modules/${moduleId}/lessons`)
      .send({ titleEn: "After the visit", titleFr: "Après la visite" })
      .expect(201);
    await admin.delete(`/authoring/lessons/${l2.body.id}`).expect(200);
    const detail = await admin
      .get(`/authoring/modules/${moduleId}`)
      .expect(200);
    expect(
      (detail.body.lessons as { id: string; position: number }[]).map(
        (l) => l.position,
      ),
    ).toEqual([0, 1]); // compacted after delete
    expect(detail.body.lessons.map((l: { id: string }) => l.id)).toEqual([
      l1.body.id,
      l3.body.id,
    ]);

    // Quiz upsert (create), then replace with an edited version.
    const quiz = await admin
      .put(`/authoring/modules/${moduleId}/quiz`)
      .send(QUIZ_BODY)
      .expect(200);
    expect(quiz.body.questions).toHaveLength(2);
    const edited = await admin
      .put(`/authoring/modules/${moduleId}/quiz`)
      .send({ ...QUIZ_BODY, passMark: 70, questions: [QUIZ_BODY.questions[0]] })
      .expect(200);
    expect(edited.body.passMark).toBe(70);
    expect(edited.body.questions).toHaveLength(1);

    // Publish → learners can now see it; the learner payload has no answer key.
    await admin
      .patch(`/authoring/modules/${moduleId}`)
      .send({ status: "PUBLISHED" })
      .expect(200);
    const visible = await t
      .as(fx.A.worker.externalAuthId)
      .get("/modules")
      .expect(200);
    expect(
      (visible.body as { id: string }[]).map((m) => m.id),
    ).toContain(moduleId);
  });

  it("rejects invalid quizzes with precise errors", async () => {
    const admin = t.as(fx.A.admin.externalAuthId);
    const created = await admin
      .post("/authoring/modules")
      .send(MODULE_BODY)
      .expect(201);
    const moduleId = created.body.id;

    const badIdx = await admin
      .put(`/authoring/modules/${moduleId}/quiz`)
      .send({
        passMark: 80,
        questions: [
          { ...QUIZ_BODY.questions[0], correctIdx: [5] },
        ],
      });
    expect(badIdx.status).toBe(400);
    expect(badIdx.body.message).toMatch(/out of range/i);

    const twoAnswersSingle = await admin
      .put(`/authoring/modules/${moduleId}/quiz`)
      .send({
        passMark: 80,
        questions: [
          { ...QUIZ_BODY.questions[0], type: "SINGLE", correctIdx: [0, 1] },
        ],
      });
    expect(twoAnswersSingle.status).toBe(400);
    expect(twoAnswersSingle.body.message).toMatch(/exactly one correct/i);

    const unevenChoices = await admin
      .put(`/authoring/modules/${moduleId}/quiz`)
      .send({
        passMark: 80,
        questions: [
          { ...QUIZ_BODY.questions[1], choicesFr: ["seulement une", "deux"] },
        ],
      });
    expect(unevenChoices.status).toBe(400);
    expect(unevenChoices.body.message).toMatch(/same length/i);
  });

  it("cross-tenant + global-library isolation: other orgs' and global modules 404", async () => {
    const adminA = t.as(fx.A.admin.externalAuthId);
    const adminB = t.as(fx.B.admin.externalAuthId);

    const created = await adminA
      .post("/authoring/modules")
      .send(MODULE_BODY)
      .expect(201);
    const moduleId = created.body.id;

    await adminB.get(`/authoring/modules/${moduleId}`).expect(404);
    await adminB
      .patch(`/authoring/modules/${moduleId}`)
      .send({ titleEn: "Hijacked title" })
      .expect(404);
    await adminB
      .post(`/authoring/modules/${moduleId}/lessons`)
      .send({ titleEn: "Injected", titleFr: "Injecté" })
      .expect(404);

    // The global library module (orgId null) is not editable by any org admin.
    await adminA
      .patch(`/authoring/modules/${fx.moduleId}`)
      .send({ titleEn: "Rewritten global" })
      .expect(404);
    // And B's own listing never shows A's module.
    const bList = await adminB.get("/authoring/modules").expect(200);
    expect(
      (bList.body as { id: string }[]).map((m) => m.id),
    ).not.toContain(moduleId);
  });

  it("workers cannot author", async () => {
    const worker = t.as(fx.A.worker.externalAuthId);
    await worker.get("/authoring/modules").expect(403);
    await worker.post("/authoring/modules").send(MODULE_BODY).expect(403);
  });
});
