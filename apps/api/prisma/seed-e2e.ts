import { PrismaClient, ModuleStatus } from "@prisma/client";

/**
 * Minimal, deterministic fixture for the browser end-to-end suite
 * (apps/web/e2e). Creates one learner with an ASSIGNED module that has a single
 * readable lesson and a one-question quiz whose correct choice is literally
 * labelled "This is the correct answer" — so the Playwright test can pass it
 * without knowing the (server-side) answer key. Idempotent: re-running resets
 * the learner to a fresh, not-started state.
 */
const prisma = new PrismaClient();

const LEARNER_EXT = process.env.E2E_LEARNER_EXTERNAL_ID ?? "e2e_learner";
const MODULE_SLUG = "e2e-safety-basics";

async function main() {
  await prisma.role.upsert({
    where: { code: "NB_HSW" },
    update: {},
    create: {
      code: "NB_HSW",
      labelEn: "Home Support Worker",
      labelFr: "Préposé(e) au soutien à domicile",
      jurisdiction: "NB",
    },
  });

  let org = await prisma.organization.findFirst({ where: { name: "E2E Org" } });
  org ??= await prisma.organization.create({
    data: {
      name: "E2E Org",
      jurisdiction: "NB",
      primaryRegulator: "NB Department of Social Development",
      preferredLocale: "en-CA",
    },
  });

  let site = await prisma.site.findFirst({
    where: { orgId: org.id, name: "E2E Site" },
  });
  site ??= await prisma.site.create({
    data: { orgId: org.id, name: "E2E Site", address: "1 Test St" },
  });

  const user = await prisma.user.upsert({
    where: { externalAuthId: LEARNER_EXT },
    update: { name: "E2E Learner" },
    create: {
      externalAuthId: LEARNER_EXT,
      email: "e2e.learner@example.com",
      name: "E2E Learner",
    },
  });

  let staff = await prisma.staff.findFirst({
    where: { userId: user.id, orgId: org.id },
  });
  staff ??= await prisma.staff.create({
    data: {
      userId: user.id,
      orgId: org.id,
      siteId: site.id,
      roleCode: "NB_HSW",
      orgPermission: "STAFF",
    },
  });

  const mod = await prisma.module.upsert({
    where: { slug: MODULE_SLUG },
    update: { status: ModuleStatus.PUBLISHED },
    create: {
      slug: MODULE_SLUG,
      orgId: null,
      titleEn: "E2E Safety Basics",
      titleFr: "Bases de sécurité E2E",
      descriptionEn: "A minimal module used by the browser end-to-end test.",
      descriptionFr: "Un module minimal utilisé par le test de bout en bout.",
      durationMin: 5,
      jurisdiction: null,
      status: ModuleStatus.PUBLISHED,
      publishedAt: new Date(),
    },
  });

  await prisma.lesson.upsert({
    where: { moduleId_position: { moduleId: mod.id, position: 0 } },
    update: {},
    create: {
      moduleId: mod.id,
      position: 0,
      titleEn: "Read this lesson",
      titleFr: "Lisez cette leçon",
      bodyEn:
        "This is the lesson content. Read it, then mark it complete to unlock the quiz.",
      bodyFr:
        "Voici le contenu de la leçon. Lisez-le, puis marquez-le comme complété pour déverrouiller le quiz.",
      isPreview: false,
    },
  });

  const existingQuiz = await prisma.quiz.findUnique({
    where: { moduleId: mod.id },
  });
  if (existingQuiz) {
    await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
  }
  const quiz =
    existingQuiz ??
    (await prisma.quiz.create({
      data: { moduleId: mod.id, passMark: 80, randomize: false },
    }));
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      position: 0,
      promptEn: "Select the correct answer.",
      promptFr: "Sélectionnez la bonne réponse.",
      type: "SINGLE",
      choicesEn: ["This is the correct answer", "This is wrong"],
      choicesFr: ["Voici la bonne réponse", "Ceci est faux"],
      correctIdx: [0],
    },
  });

  // Reset the learner to a fresh, not-started assignment on every run.
  const existing = await prisma.assignment.findFirst({
    where: { staffId: staff.id, moduleId: mod.id },
  });
  if (existing) {
    await prisma.certificate.deleteMany({
      where: { assignmentId: existing.id },
    });
    await prisma.attempt.deleteMany({ where: { assignmentId: existing.id } });
    await prisma.lessonProgress.deleteMany({
      where: { staffId: staff.id, lesson: { moduleId: mod.id } },
    });
    await prisma.assignment.update({
      where: { id: existing.id },
      data: { status: "ASSIGNED", completedAt: null },
    });
  } else {
    await prisma.assignment.create({
      data: {
        orgId: org.id,
        staffId: staff.id,
        moduleId: mod.id,
        status: "ASSIGNED",
        dueAt: new Date(Date.now() + 30 * 86_400_000),
      },
    });
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded E2E fixture: learner "${LEARNER_EXT}" assigned to "${MODULE_SLUG}".`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
