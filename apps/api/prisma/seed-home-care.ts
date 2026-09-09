import { PrismaClient, ModuleStatus, Jurisdiction } from "@prisma/client";
import { HOME_CARE_MODULES, type HomeCareModule } from "./home-care-content";
import { HOME_CARE_PHASE_B_MODULES } from "./home-care-content-phase-b";

/** The whole starter library: the original 11 plus the Phase B expansion.
 *  One list so the loop below, and the counts it prints, stay honest. */
const ALL_MODULES: HomeCareModule[] = [
  ...HOME_CARE_MODULES,
  ...HOME_CARE_PHASE_B_MODULES,
];

/**
 * Seeds the home-care STARTER LIBRARY as global modules (orgId = null,
 * PUBLISHED). Jurisdiction is null (cross-province best practice) for every
 * module except the NS CCA prep track. Idempotent — safe to re-run. Agencies get
 * these by default and extend/replace them via the authoring UI (BYO content).
 * See home-care-content.ts for the positioning caveat (starter, SME-review).
 *
 * Each module also writes its sources and review state to
 * `Module.regulatoryCitations` as { sources, review }, so the
 * SME-review-required disclaimer and the machine-drafted-French flag travel
 * with the row rather than living only in the content file's header. Nothing
 * reads that JSON yet -- it is there for the human review pass and for audit.
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

  for (const m of ALL_MODULES) {
    // Province-scoped only for the NS CCA prep track; everything else is
    // cross-jurisdiction best practice (LMS_COMPLETION_PLAN.md B0 Finding 1).
    const jurisdiction = m.jurisdiction
      ? Jurisdiction[m.jurisdiction]
      : null;
    const regulatoryCitations =
      m.citations || m.review
        ? { sources: m.citations ?? [], review: m.review ?? null }
        : undefined;
    const mod = await prisma.module.upsert({
      where: { slug: m.slug },
      update: {
        titleEn: m.titleEn,
        titleFr: m.titleFr,
        descriptionEn: m.descriptionEn,
        descriptionFr: m.descriptionFr,
        durationMin: m.durationMin,
        jurisdiction,
        regulatoryCitations,
      },
      create: {
        slug: m.slug,
        orgId: null,
        titleEn: m.titleEn,
        titleFr: m.titleFr,
        descriptionEn: m.descriptionEn,
        descriptionFr: m.descriptionFr,
        durationMin: m.durationMin,
        jurisdiction,
        regulatoryCitations,
        status: ModuleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Lessons (idempotent on (moduleId, position); first lesson is preview).
    for (let i = 0; i < m.lessons.length; i++) {
      const l = m.lessons[i];
      await prisma.lesson.upsert({
        where: { moduleId_position: { moduleId: mod.id, position: i } },
        update: {
          titleEn: l.titleEn,
          titleFr: l.titleFr,
          bodyEn: l.bodyEn,
          bodyFr: l.bodyFr,
        },
        create: {
          moduleId: mod.id,
          position: i,
          titleEn: l.titleEn,
          titleFr: l.titleFr,
          bodyEn: l.bodyEn,
          bodyFr: l.bodyFr,
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

  const lessons = ALL_MODULES.reduce((n, m) => n + m.lessons.length, 0);
  const questions = ALL_MODULES.reduce((n, m) => n + m.questions.length, 0);
  const blocked = ALL_MODULES.filter((m) => m.review?.blocker).length;
  /* eslint-disable no-console */
  console.log(
    `Seeded home-care starter library: ${roleCount} roles, ${ALL_MODULES.length} modules, ${lessons} lessons, ${questions} quiz questions.`,
  );
  console.log(
    `All ${ALL_MODULES.length} are STARTER CONTENT pending SME review; every fr-CA body is a machine draft pending bilingual QA. ${blocked} module(s) carry an explicit blocker — see Module.regulatoryCitations.review.blocker and docs/CONTENT_SOURCE_NOTES.md.`,
  );
  /* eslint-enable no-console */
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
