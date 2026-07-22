import { PrismaClient, ModuleStatus } from "@prisma/client";
import { HOME_CARE_MODULES } from "./home-care-content";

/**
 * Seeds the home-care STARTER LIBRARY as global modules (orgId = null,
 * jurisdiction = null, PUBLISHED). Idempotent — safe to re-run. Agencies get
 * these by default and extend/replace them via the authoring UI (BYO content).
 * See home-care-content.ts for the positioning caveat (starter, SME-review).
 */
const prisma = new PrismaClient();

// Home-care role kinds (mirror src/auth/academy/eldercare-role-map.ts). Seeded
// for every Atlantic jurisdiction so an admin can define RequiredTraining for a
// role before any staff of that role have signed in. NS home support is the CCA
// path (B0). Codes match what SSO provisioning upserts.
const ROLE_KINDS = [
  { kind: "HSW", en: "Home Support Worker", fr: "Préposé(e) au soutien à domicile" },
  { kind: "RN", en: "Nurse", fr: "Infirmier(ère)" },
  { kind: "AH", en: "Allied Health", fr: "Professionnel(le) paramédical(e)" },
  { kind: "SUP", en: "Supervisor / Coordinator", fr: "Superviseur(e) / Coordonnateur(trice)" },
  { kind: "MGMT", en: "Management", fr: "Direction" },
  { kind: "OFFICE", en: "Office / Administration", fr: "Bureau / Administration" },
] as const;
const JURISDICTIONS = ["NB", "NS", "PE", "NL"] as const;

async function seedRoles() {
  let n = 0;
  for (const j of JURISDICTIONS) {
    for (const k of ROLE_KINDS) {
      const isNsCca = j === "NS" && k.kind === "HSW";
      const code = `${j}_${isNsCca ? "CCA" : k.kind}`;
      await prisma.role.upsert({
        where: { code },
        create: {
          code,
          labelEn: isNsCca ? "Continuing Care Assistant" : k.en,
          labelFr: isNsCca ? "Assistant(e) en soins continus" : k.fr,
          jurisdiction: j,
        },
        update: {},
      });
      n++;
    }
  }
  return n;
}

async function main() {
  const roleCount = await seedRoles();

  for (const m of HOME_CARE_MODULES) {
    const mod = await prisma.module.upsert({
      where: { slug: m.slug },
      update: {
        titleEn: m.titleEn,
        titleFr: m.titleFr,
        descriptionEn: m.descriptionEn,
        descriptionFr: m.descriptionFr,
        durationMin: m.durationMin,
      },
      create: {
        slug: m.slug,
        orgId: null,
        titleEn: m.titleEn,
        titleFr: m.titleFr,
        descriptionEn: m.descriptionEn,
        descriptionFr: m.descriptionFr,
        durationMin: m.durationMin,
        jurisdiction: null, // home-care best practice — all provinces
        status: ModuleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Lessons (idempotent on (moduleId, position); first lesson is preview).
    for (let i = 0; i < m.lessons.length; i++) {
      const l = m.lessons[i];
      await prisma.lesson.upsert({
        where: { moduleId_position: { moduleId: mod.id, position: i } },
        update: { titleEn: l.titleEn, titleFr: l.titleFr },
        create: {
          moduleId: mod.id,
          position: i,
          titleEn: l.titleEn,
          titleFr: l.titleFr,
          isPreview: i === 0,
        },
      });
    }

    // Quiz + questions (replace-on-rerun for clean re-seeding).
    const existingQuiz = await prisma.quiz.findUnique({
      where: { moduleId: mod.id },
    });
    if (existingQuiz) {
      await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
    }
    const quiz = existingQuiz
      ? await prisma.quiz.update({
          where: { id: existingQuiz.id },
          data: { passMark: m.passMark, randomize: true },
        })
      : await prisma.quiz.create({
          data: { moduleId: mod.id, passMark: m.passMark, randomize: true },
        });
    for (let i = 0; i < m.questions.length; i++) {
      const q = m.questions[i];
      await prisma.question.create({
        data: {
          quizId: quiz.id,
          position: i,
          promptEn: q.promptEn,
          promptFr: q.promptFr,
          type: q.type ?? "SINGLE",
          choicesEn: q.choicesEn,
          choicesFr: q.choicesFr,
          correctIdx: q.correctIdx,
          explainEn: q.explainEn ?? null,
          explainFr: q.explainFr ?? null,
        },
      });
    }
  }

  const lessons = HOME_CARE_MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const questions = HOME_CARE_MODULES.reduce((n, m) => n + m.questions.length, 0);
  // eslint-disable-next-line no-console
  console.log(
    `Seeded home-care starter library: ${roleCount} roles, ${HOME_CARE_MODULES.length} modules, ${lessons} lessons, ${questions} quiz questions.`,
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
