import { PrismaClient } from "@prisma/client";
import { drainQueues } from "./drain-queues";

/**
 * Focused seed for the LMS-C2 flow tests (cert idempotency, attempt scoring,
 * materialization). Plain (unextended) client — these tests drive processors and
 * services that scope themselves, so the seed must not be guardrail-scoped.
 *
 * Wipes and rebuilds a single org with one site, an ORG_ADMIN + a STAFF worker,
 * and one module whose quiz has three questions of each scorable type:
 *   Q0 SINGLE      correctIdx [0]
 *   Q1 MULTIPLE    correctIdx [0,2]
 *   Q2 TRUE_FALSE  correctIdx [1]
 * passMark is 67, so 2/3 correct (67%) is exactly the pass boundary.
 */
export type C2Base = {
  orgId: string;
  siteId: string;
  workerStaffId: string;
  workerUserId: string;
  roleCode: string;
  moduleId: string;
  quizId: string;
  questionIds: string[];
  passMark: number;
};

const ROLE = "NB_PCW";

async function wipe(db: PrismaClient) {
  // A cert job from a previous test's passing submit can insert a Certificate
  // mid-wipe (FK violation on assignment.deleteMany) — quiesce workers first.
  await drainQueues();
  await db.recordAccessLog.deleteMany({});
  await db.auditEvent.deleteMany({});
  await db.lessonProgress.deleteMany({});
  await db.invitation.deleteMany({});
  await db.certificate.deleteMany({});
  await db.attempt.deleteMany({});
  await db.assignment.deleteMany({});
  await db.rosterImport.deleteMany({});
  await db.question.deleteMany({});
  await db.quiz.deleteMany({});
  await db.lesson.deleteMany({});
  await db.requiredTraining.deleteMany({});
  await db.staff.deleteMany({});
  await db.subscription.deleteMany({});
  await db.site.deleteMany({});
  await db.module.deleteMany({});
  await db.user.deleteMany({});
  await db.organization.deleteMany({});
  await db.role.deleteMany({});
}

export async function seedC2Base(db: PrismaClient): Promise<C2Base> {
  await wipe(db);

  await db.role.create({
    data: { code: ROLE, labelEn: ROLE, labelFr: ROLE, jurisdiction: "NB" },
  });

  const org = await db.organization.create({
    data: { name: "C2 Org", jurisdiction: "NB", preferredLocale: "en-CA" },
  });
  const site = await db.site.create({
    data: { orgId: org.id, name: "C2 Site" },
  });
  const user = await db.user.create({
    data: { externalAuthId: "clerk_c2_worker", email: "c2.worker@example.com", name: "C2 Worker" },
  });
  const worker = await db.staff.create({
    data: {
      userId: user.id,
      orgId: org.id,
      siteId: site.id,
      roleCode: ROLE,
      orgPermission: "STAFF",
    },
  });

  const mod = await db.module.create({
    data: {
      slug: "c2-module",
      orgId: null,
      titleEn: "C2 Module",
      titleFr: "Module C2",
      descriptionEn: "C2",
      descriptionFr: "C2",
      durationMin: 30,
      jurisdiction: "NB",
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  const quiz = await db.quiz.create({
    data: { moduleId: mod.id, passMark: 67, randomize: false },
  });
  const specs = [
    { type: "SINGLE", correctIdx: [0], choices: ["a", "b", "c"] },
    { type: "MULTIPLE", correctIdx: [0, 2], choices: ["a", "b", "c"] },
    { type: "TRUE_FALSE", correctIdx: [1], choices: ["True", "False"] },
  ];
  const questionIds: string[] = [];
  for (let i = 0; i < specs.length; i++) {
    const q = await db.question.create({
      data: {
        quizId: quiz.id,
        position: i,
        promptEn: `Q${i}`,
        promptFr: `Q${i}`,
        type: specs[i].type,
        choicesEn: specs[i].choices,
        choicesFr: specs[i].choices,
        correctIdx: specs[i].correctIdx,
      },
    });
    questionIds.push(q.id);
  }

  return {
    orgId: org.id,
    siteId: site.id,
    workerStaffId: worker.id,
    workerUserId: user.id,
    roleCode: ROLE,
    moduleId: mod.id,
    quizId: quiz.id,
    questionIds,
    passMark: 67,
  };
}
