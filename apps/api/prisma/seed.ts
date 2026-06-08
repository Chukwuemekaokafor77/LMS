import { PrismaClient, Jurisdiction, ModuleStatus } from "@prisma/client";
import { MODULE_CONTENT } from "./module-content";

const prisma = new PrismaClient();

// NB occupational role taxonomy. Codes are namespaced by jurisdiction
// so future provinces (NS_CCA, PE_RCW, NL_PCA) coexist cleanly.
const NB_ROLES = [
  { code: "NB_RA", labelEn: "Resident Assistant", labelFr: "Préposé(e) aux résidents" },
  { code: "NB_PCW", labelEn: "Personal Care Worker", labelFr: "Préposé(e) aux soins personnels" },
  { code: "NB_RPN", labelEn: "Licensed Practical Nurse", labelFr: "Infirmier(ère) auxiliaire autorisé(e)" },
  { code: "NB_RN", labelEn: "Registered Nurse", labelFr: "Infirmier(ère) immatriculé(e)" },
  { code: "NB_ACTIVATION", labelEn: "Recreation / Activation", labelFr: "Animation / Loisirs" },
  { code: "NB_DIETARY", labelEn: "Dietary Aide", labelFr: "Préposé(e) à l'alimentation" },
  { code: "NB_HOUSEKEEPING", labelEn: "Housekeeping", labelFr: "Entretien ménager" },
  { code: "NB_ADMIN", labelEn: "Administration", labelFr: "Administration" },
];

const MODULES = [
  {
    slug: "ipac-fundamentals-nb",
    titleEn: "Infection Prevention and Control (IPAC)",
    titleFr: "Prévention et contrôle des infections",
    descriptionEn:
      "Hand hygiene, PPE, isolation precautions, and routine practices for long-term-care settings. Aligns with Public Health NB guidance.",
    descriptionFr:
      "Hygiène des mains, EPI, précautions d'isolement et pratiques de base pour les foyers de soins. Conforme aux directives de Santé publique Nouveau-Brunswick.",
    durationMin: 45,
    citations: { NB: ["Nursing Homes Act, s.5(1)", "Public Health NB IPAC Manual"] },
  },
  {
    slug: "fire-safety-emergency-codes-nb",
    titleEn: "Fire Safety & Emergency Codes",
    titleFr: "Sécurité incendie et codes d'urgence",
    descriptionEn:
      "RACE/PASS, evacuation procedures, and standardized emergency code response (Code Red, Code Green, Code White) for NB nursing homes.",
    descriptionFr:
      "RACE/PASS, procédures d'évacuation et codes d'urgence standardisés (Code rouge, Code vert, Code blanc) pour les foyers de soins du N.-B.",
    durationMin: 30,
    citations: { NB: ["Fire Prevention Act", "Nursing Homes Act, s.31"] },
  },
  {
    slug: "whmis-2015",
    titleEn: "WHMIS 2015 / GHS",
    titleFr: "SIMDUT 2015 / SGH",
    descriptionEn:
      "Federal hazardous-products communication: pictograms, SDS, labelling. Identical across Canada.",
    descriptionFr:
      "Communication des produits dangereux : pictogrammes, FDS, étiquetage. Identique partout au Canada.",
    durationMin: 40,
    citations: {
      NB: ["Hazardous Products Act (federal)", "Occupational Health and Safety Act (NB)"],
    },
  },
  {
    slug: "resident-rights-person-centred-care-nb",
    titleEn: "Resident Rights & Person-Centred Care",
    titleFr: "Droits des résidents et soins centrés sur la personne",
    descriptionEn:
      "Statutory resident rights under NB's Nursing Homes Act, dignity, choice, and culturally-safe care.",
    descriptionFr:
      "Droits statutaires des résidents en vertu de la Loi sur les foyers de soins du N.-B., dignité, choix et soins culturellement sécuritaires.",
    durationMin: 35,
    citations: { NB: ["Nursing Homes Act, Resident Bill of Rights"] },
  },
  {
    slug: "abuse-neglect-reporting-nb",
    titleEn: "Abuse, Neglect & Mandatory Reporting",
    titleFr: "Abus, négligence et signalement obligatoire",
    descriptionEn:
      "Recognizing abuse and neglect, and the mandatory-reporting duty to NB Department of Social Development.",
    descriptionFr:
      "Reconnaître l'abus et la négligence, et l'obligation de signaler au ministère du Développement social du N.-B.",
    durationMin: 30,
    citations: {
      NB: [
        "Adult Protection Act",
        "Family Services Act",
        "Nursing Homes Act, s.42 (mandatory reports)",
      ],
    },
  },
  {
    slug: "phipaa-privacy-nb",
    titleEn: "Privacy & Health Information (PHIPAA)",
    titleFr: "Confidentialité et renseignements sur la santé (LAPRPS)",
    descriptionEn:
      "Personal Health Information Privacy and Access Act (NB): collection limits, access rights, breach notification.",
    descriptionFr:
      "Loi sur l'accès et la protection en matière de renseignements personnels sur la santé (N.-B.) : limites de collecte, droits d'accès, notification des violations.",
    durationMin: 35,
    citations: { NB: ["PHIPAA, S.N.B. 2009, c. P-7.05"] },
  },
  {
    slug: "falls-prevention",
    titleEn: "Falls Prevention",
    titleFr: "Prévention des chutes",
    descriptionEn:
      "Risk screening, environmental hazards, post-fall assessment. Cross-jurisdictional best practice.",
    descriptionFr:
      "Dépistage des risques, dangers environnementaux, évaluation post-chute. Pratique exemplaire interprovinciale.",
    durationMin: 30,
    citations: null,
  },
  {
    slug: "responsive-behaviours-dementia-care",
    titleEn: "Responsive Behaviours & Dementia Care",
    titleFr: "Comportements réactifs et soins de la démence",
    descriptionEn:
      "P.I.E.C.E.S. framework, gentle persuasive approaches, and de-escalation. Widely adopted in Atlantic Canada.",
    descriptionFr:
      "Cadre P.I.E.C.E.S., approches de persuasion douce et désescalade. Largement adopté au Canada atlantique.",
    durationMin: 50,
    citations: null,
  },
];

async function main() {
  // Roles (NB only for v1; expand per province as we onboard)
  for (const r of NB_ROLES) {
    await prisma.role.upsert({
      where: { code: r.code },
      update: { labelEn: r.labelEn, labelFr: r.labelFr },
      create: { ...r, jurisdiction: Jurisdiction.NB },
    });
  }

  // Pilot design-partner: a fictional bilingual nursing home in Moncton.
  const org = await prisma.organization.upsert({
    where: { id: "seed-org-foyer-acadien" },
    update: {},
    create: {
      id: "seed-org-foyer-acadien",
      name: "Foyer Acadien de Moncton",
      jurisdiction: Jurisdiction.NB,
      primaryRegulator: "NB Department of Social Development",
      preferredLocale: "fr-CA",
    },
  });

  await prisma.site.upsert({
    where: { id: "seed-site-main" },
    update: {},
    create: {
      id: "seed-site-main",
      orgId: org.id,
      name: "Pavillon principal",
      address: "100 rue Main, Moncton, NB",
      regulatorLicenseNumber: "NB-LTC-DEMO-001",
    },
  });

  await prisma.site.upsert({
    where: { id: "seed-site-annex" },
    update: {},
    create: {
      id: "seed-site-annex",
      orgId: org.id,
      name: "Annexe Mémoire (Memory Care)",
      address: "102 rue Main, Moncton, NB",
      regulatorLicenseNumber: "NB-LTC-DEMO-002",
    },
  });

  // Global library modules — orgId null, jurisdiction NB.
  // (WHMIS and falls/dementia are jurisdiction-agnostic.)
  for (const m of MODULES) {
    const isCrossJurisdiction =
      m.slug === "whmis-2015" ||
      m.slug === "falls-prevention" ||
      m.slug === "responsive-behaviours-dementia-care";

    const mod = await prisma.module.upsert({
      where: { slug: m.slug },
      update: {},
      create: {
        slug: m.slug,
        orgId: null,
        titleEn: m.titleEn,
        titleFr: m.titleFr,
        descriptionEn: m.descriptionEn,
        descriptionFr: m.descriptionFr,
        durationMin: m.durationMin,
        jurisdiction: isCrossJurisdiction ? null : Jurisdiction.NB,
        regulatoryCitations: m.citations ?? undefined,
        status: ModuleStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    const content = MODULE_CONTENT.find((c) => c.slug === m.slug);
    if (content) {
      // Lessons (idempotent on (moduleId, position))
      for (let i = 0; i < content.lessons.length; i++) {
        const l = content.lessons[i];
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

      // Quiz + questions (replace-on-rerun for clean development)
      const existingQuiz = await prisma.quiz.findUnique({
        where: { moduleId: mod.id },
      });
      if (existingQuiz) {
        await prisma.question.deleteMany({ where: { quizId: existingQuiz.id } });
      }
      const quiz = existingQuiz
        ? await prisma.quiz.update({
            where: { id: existingQuiz.id },
            data: { passMark: content.passMark, randomize: true },
          })
        : await prisma.quiz.create({
            data: {
              moduleId: mod.id,
              passMark: content.passMark,
              randomize: true,
            },
          });
      for (let i = 0; i < content.questions.length; i++) {
        const q = content.questions[i];
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
  }

  // eslint-disable-next-line no-console
  console.log(
    `Seeded: 1 org (${org.name}), 2 sites, ${NB_ROLES.length} roles, ${MODULES.length} modules`,
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
