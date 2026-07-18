import { PrismaClient } from "@prisma/client";
import { drainQueues } from "./drain-queues";

/**
 * Seeds two complete, independent org graphs (A and B) for the cross-tenant
 * isolation suite (LMS-C1). Uses a *plain* PrismaClient (no tenant extension)
 * so the seed itself is not subject to the guardrail — the whole point is to
 * create Org-B data that an Org-A actor must never be able to reach.
 *
 * Every org gets: an org + site, an ORG_ADMIN and a STAFF user/staff pair, and
 * a full PHI graph for the worker (assignment → attempt → certificate) plus a
 * roster import. Two shared, jurisdiction-NB roles and one global library
 * module (with a READY lesson + quiz) are created once.
 */

export type OrgFixture = {
  orgId: string;
  siteId: string;
  admin: { userId: string; externalAuthId: string; staffId: string; email: string };
  worker: { userId: string; externalAuthId: string; staffId: string; email: string };
  assignmentId: string;
  attemptId: string;
  certificateId: string;
  rosterImportId: string;
};

export type Fixtures = {
  moduleId: string;
  lessonId: string;
  A: OrgFixture;
  B: OrgFixture;
};

const ADMIN_ROLE = "NB_ADMIN";
const WORKER_ROLE = "NB_PCW";

async function wipe(db: PrismaClient) {
  // Quiesce background workers first — a certificate job from a previous
  // suite's passing submit can insert rows mid-wipe (FK violation).
  await drainQueues();
  // FK-safe order. RecordAccessLog/AuditEvent are written by the PHI
  // interceptor during the suite, so clear them too for a clean slate.
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
  await db.site.deleteMany({});
  await db.module.deleteMany({});
  await db.user.deleteMany({});
  await db.organization.deleteMany({});
  await db.role.deleteMany({});
}

async function seedOrg(
  db: PrismaClient,
  tag: "A" | "B",
  moduleId: string,
): Promise<OrgFixture> {
  const org = await db.organization.create({
    data: {
      name: `Org ${tag}`,
      jurisdiction: "NB",
      primaryRegulator: "NB Department of Social Development",
      preferredLocale: "en-CA",
    },
  });
  const site = await db.site.create({
    data: { orgId: org.id, name: `Site ${tag}`, address: `${tag} St` },
  });

  const adminUser = await db.user.create({
    data: {
      externalAuthId: `clerk_${tag}_admin`,
      email: `admin.${tag.toLowerCase()}@example.com`,
      name: `Admin ${tag}`,
    },
  });
  const adminStaff = await db.staff.create({
    data: {
      userId: adminUser.id,
      orgId: org.id,
      siteId: site.id,
      roleCode: ADMIN_ROLE,
      orgPermission: "ORG_ADMIN",
    },
  });

  const workerUser = await db.user.create({
    data: {
      externalAuthId: `clerk_${tag}_worker`,
      email: `worker.${tag.toLowerCase()}@example.com`,
      name: `Worker ${tag}`,
    },
  });
  const workerStaff = await db.staff.create({
    data: {
      userId: workerUser.id,
      orgId: org.id,
      siteId: site.id,
      roleCode: WORKER_ROLE,
      orgPermission: "STAFF",
    },
  });

  const assignment = await db.assignment.create({
    data: {
      orgId: org.id,
      staffId: workerStaff.id,
      moduleId,
      status: "COMPLETED",
      dueAt: new Date(Date.now() + 30 * 86_400_000),
      completedAt: new Date(),
    },
  });
  const attempt = await db.attempt.create({
    data: {
      orgId: org.id,
      assignmentId: assignment.id,
      // left unsubmitted so the cross-tenant submit test has a live target
    },
  });
  const certificate = await db.certificate.create({
    data: {
      orgId: org.id,
      assignmentId: assignment.id,
      pdfS3Key: `certificates/${org.id}/${assignment.id}.pdf`,
      sha256: `sha-${tag}`,
    },
  });
  const rosterImport = await db.rosterImport.create({
    data: {
      orgId: org.id,
      uploadedById: adminStaff.id,
      fileS3Key: `roster-imports/${org.id}/seed.csv`,
      status: "DONE",
    },
  });

  return {
    orgId: org.id,
    siteId: site.id,
    admin: {
      userId: adminUser.id,
      externalAuthId: adminUser.externalAuthId!,
      staffId: adminStaff.id,
      email: adminUser.email,
    },
    worker: {
      userId: workerUser.id,
      externalAuthId: workerUser.externalAuthId!,
      staffId: workerStaff.id,
      email: workerUser.email,
    },
    assignmentId: assignment.id,
    attemptId: attempt.id,
    certificateId: certificate.id,
    rosterImportId: rosterImport.id,
  };
}

export async function seedTwoOrgs(db: PrismaClient): Promise<Fixtures> {
  await wipe(db);

  for (const code of [ADMIN_ROLE, WORKER_ROLE]) {
    await db.role.create({
      data: { code, labelEn: code, labelFr: code, jurisdiction: "NB" },
    });
  }

  // One global library module (orgId null) shared by both orgs, with a READY
  // lesson (for the video playback gate) and a quiz + question.
  const mod = await db.module.create({
    data: {
      slug: "c1-test-module",
      orgId: null,
      titleEn: "C1 Test Module",
      titleFr: "Module de test C1",
      descriptionEn: "Test module for the cross-tenant isolation suite.",
      descriptionFr: "Module de test pour la suite d'isolation inter-locataires.",
      durationMin: 30,
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });
  const lesson = await db.lesson.create({
    data: {
      moduleId: mod.id,
      position: 0,
      titleEn: "Lesson 1",
      titleFr: "Leçon 1",
      isPreview: false,
      videoStatus: "READY",
      muxPlaybackId: "pb_test",
    },
  });
  const quiz = await db.quiz.create({
    data: { moduleId: mod.id, passMark: 80, randomize: false },
  });
  await db.question.create({
    data: {
      quizId: quiz.id,
      position: 0,
      promptEn: "Q1",
      promptFr: "Q1",
      type: "SINGLE",
      choicesEn: ["a", "b"],
      choicesFr: ["a", "b"],
      correctIdx: [0],
    },
  });

  const A = await seedOrg(db, "A", mod.id);
  const B = await seedOrg(db, "B", mod.id);
  return { moduleId: mod.id, lessonId: lesson.id, A, B };
}
