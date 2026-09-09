/**
 * Home-care STARTER LIBRARY — Phase B expansion.
 *
 * Closes the gap between the 11 modules seeded in `home-care-content.ts` and
 * the core-module list in LMS_COMPLETION_PLAN.md §B0 ("Catalog architecture",
 * layer 1), plus the two items that list implies but never had a module:
 * WHMIS, and the NS CCA prep track (layer 2).
 *
 * ⚠️ POSITIONING — the same guardrails as `home-care-content.ts`, restated
 * because they are easy to lose in an expansion:
 *  - Every module here is **starter / example content**. None of it is a
 *    certified compliance curriculum, and none of it may be marketed as
 *    "provincially mandated" (§B0 Finding 1: NB/PE/NL have no province-wide
 *    mandated home-support training list — the standard is employer-driven).
 *  - The single exception to "cross-jurisdiction" is `ns-cca-certification-prep`,
 *    which is scoped `jurisdiction: "NS"` and is **exam-prep / continuing
 *    education only**. Per §B0 Finding 2 the Academy is not a licensed CCA
 *    education provider and an Academy certificate is never CCA certification.
 *  - Per §B0 Finding 3, externally issued credentials (First Aid, CPR,
 *    vulnerable-sector checks, the CCA certificate itself) are **not** built as
 *    Academy lessons. They are tracked via ElderCare's `StaffCertification`
 *    (Seam 3). `whmis-2015-home-care` deliberately sits on that line — read its
 *    `review.blocker` and docs/CONTENT_SOURCE_NOTES.md before promoting it.
 *
 * ⚠️ SOURCING — every EN body here is written from scratch against the cited
 * sources. Nothing is reproduced or adapted from them, because almost none of
 * the good Canadian sources permit it: CCOHS requires prior permission and
 * forbids edits, Public Health Ontario allows non-commercial reproduction only,
 * the NS CCA framework is "All Rights Reserved", and the BC health-care-assistant
 * OER is a non-commercial CC variant. Citations exist for traceability and
 * review, not as permission to quote. See `SeedCitation.licence`.
 *
 * ⚠️ FRENCH — every `bodyFr` and every French quiz string in this file is a
 * machine draft flagged `FR_MACHINE_DRAFT`. It exists to give a human fr-CA
 * reviewer something to correct (Phase E's open "bilingual fr-CA QA" item).
 * No module here is launch-ready until that review happens.
 */

import {
  FR_MACHINE_DRAFT,
  STARTER_NOTICE,
  type HomeCareModule,
  type SeedCitation,
} from "./home-care-content";

const ACCESSED = "2026-09-09";

// ── Shared source records (all URLs confirmed live on ACCESSED unless the
//    `unverified` field says otherwise) ──────────────────────────────────

const CCOHS_REUSE =
  "CCOHS requires PRIOR PERMISSION to reproduce its material and forbids editorial changes to reproduced text. Nothing here is reproduced or adapted - the content is original and cites CCOHS as a reference.";

const NS_CCA: SeedCitation = {
  organization: "Nova Scotia Department of Health and Wellness",
  title:
    "Continuing Care Assistant (CCA) Scope of Practice & Competency Framework (approved May 2019)",
  url: "https://novascotia.ca/dhw/ccs/documents/scope_of_practice_cca.pdf",
  accessed: ACCESSED,
  licence:
    "Copyright (c) All Rights Reserved, NS DHW 2019 - no open licence. Cited and paraphrased only; no text reproduced.",
};

const BC_OER: SeedCitation = {
  organization: "BCcampus / Thompson Rivers University",
  title: "Personal Care Skills for Health Care Assistants, 2nd Edition",
  url: "https://opentextbc.ca/hcalabtheoryandpractice/",
  accessed: ACCESSED,
  licence:
    "Creative Commons non-commercial variant (CC BY-NC-SA) per the BCcampus catalogue - NOT CC BY 4.0 as originally assumed. Background reading only; no text adapted.",
  unverified:
    "opentextbc.ca returned HTTP 403 to automated fetch on 2026-09-09; the licence was read from the BCcampus catalogue listing and search metadata, not from the book's own licence page. Confirm the exact licence before adapting anything from it.",
};

const BC_SUPP: SeedCitation = {
  organization: "BCcampus",
  title:
    "Health Care Assistant Program Supplement to the Provincial Curriculum 2023",
  url: "https://opentextbc.ca/hcasupplement/",
  accessed: ACCESSED,
  licence:
    "CC BY-SA 4.0 - commercial use permitted, but ShareAlike is viral. Background reading only; nothing adapted.",
  unverified:
    "opentextbc.ca returned HTTP 403 to automated fetch on 2026-09-09; licence read from search metadata rather than the licence page.",
};

const PHO_IPAC: SeedCitation = {
  organization: "Public Health Ontario",
  title:
    "Infection Prevention and Control for Home and Community Care, Manual, 1st Revision (November 2025)",
  url: "https://www.publichealthontario.ca/-/media/Documents/I/25/ipac-home-community-care.pdf",
  accessed: ACCESSED,
  licence:
    "(c) King's Printer for Ontario, 2025. Reproducible without permission for NON-COMMERCIAL purposes only and with no modifications - so nothing is reproduced here.",
};

const CCOHS_ALONE_PT: SeedCitation = {
  organization: "Canadian Centre for Occupational Health and Safety",
  title:
    "OSH Answers: Working Alone - Working with Patients (updated 2026-07-07)",
  url: "https://www.ccohs.ca/oshanswers/hsprograms/alone/workingalone_patients.html",
  accessed: ACCESSED,
  licence: CCOHS_REUSE,
};

const CCOHS_WHMIS_ED: SeedCitation = {
  organization: "Canadian Centre for Occupational Health and Safety",
  title: "OSH Answers: WHMIS - Education and Training",
  url: "https://www.ccohs.ca/oshanswers/chemicals/whmis_ghs/education_training.html",
  accessed: ACCESSED,
  licence: CCOHS_REUSE,
};

const CCOHS_WHMIS_COURSE: SeedCitation = {
  organization: "Canadian Centre for Occupational Health and Safety",
  title: "WHMIS for Workers (e-course) - CAD $19.95 per seat, 90 days access",
  url: "https://www.ccohs.ca/products/courses/whmis_workers",
  accessed: ACCESSED,
  licence:
    "Paid CCOHS course issuing its own printable certificate of completion. Referenced as the recommended external credential - this module does NOT replicate it.",
};

const OPC: SeedCitation = {
  organization: "Office of the Privacy Commissioner of Canada",
  title: "Privacy laws in Canada / PIPEDA guidance for organizations",
  url: "https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/",
  accessed: ACCESSED,
  licence:
    "Federal Crown content, Open Government Licence - Canada. Paraphrased with attribution.",
};

export const HOME_CARE_PHASE_B_MODULES: HomeCareModule[] = [
  // ── 12. Elder Care & Disability Care Basics ──────────────────────────
  {
    slug: "elder-care-disability-care-basics",
    titleEn: "Elder Care & Disability Care Basics",
    titleFr: "Notions de base : soins aux aînés et soins d'incapacité",
    descriptionEn:
      "How ageing and living with a disability actually change day-to-day life, and how to support a client without taking over.",
    descriptionFr:
      "Comment le vieillissement et la vie avec une incapacité changent réellement le quotidien, et comment soutenir un client sans prendre sa place.",
    durationMin: 30,
    passMark: 80,
    citations: [BC_OER, BC_SUPP, NS_CCA],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "Confirm the ageing-changes content is clinically accurate and current, and that the disability language matches how Atlantic-Canadian agencies and their clients prefer to speak about disability.",
    },
    lessons: [
      {
        titleEn: "What ageing actually changes",
        titleFr: "Ce que le vieillissement change réellement",
        bodyEn:
          "Ageing is not an illness. Most of the older adults you support are not sick — they are living with bodies that have changed. Skin gets thinner and bruises more easily. Balance and reaction time slow down. Hearing often fades at the higher pitches first, which is why a client may hear your voice but not catch your words. Thirst signals weaken, so an older client can be dehydrated without ever feeling thirsty.\n\nKnowing this changes how you work rather than how much you do. You slow your pace to match theirs, you face the person and lower your pitch instead of shouting, you offer fluids through the visit instead of waiting to be asked, and you handle skin gently during washing and dressing. None of that is extra work — it is the same work done in a way the body can accept.\n\nWhat ageing does not explain is sudden change. New confusion, a new fall, a sharp drop in appetite, or a client who is suddenly not themselves are not \"just old age.\" They are signals. Treat any abrupt change as something to document and report the same day, not something to accept as normal.",
        bodyFr:
          "Le vieillissement n'est pas une maladie. La plupart des aînés que vous soutenez ne sont pas malades — ils vivent avec un corps qui a changé. La peau s'amincit et se meurtrit plus facilement. L'équilibre et le temps de réaction ralentissent. L'audition faiblit souvent d'abord dans les sons aigus, ce qui explique qu'un client entende votre voix sans saisir vos mots. La sensation de soif s'atténue, si bien qu'un client âgé peut être déshydraté sans jamais avoir soif.\n\nSavoir cela change votre façon de travailler plutôt que la quantité de travail. Vous ralentissez votre rythme au sien, vous lui faites face et baissez le ton de votre voix au lieu de crier, vous offrez à boire tout au long de la visite au lieu d'attendre qu'on vous le demande, et vous manipulez la peau doucement pendant la toilette et l'habillage. Rien de tout cela n'est du travail supplémentaire — c'est le même travail, fait d'une manière que le corps peut accepter.\n\nCe que le vieillissement n'explique pas, c'est un changement soudain. Une nouvelle confusion, une nouvelle chute, une baisse marquée de l'appétit ou un client qui n'est soudainement plus lui-même, ce n'est pas « simplement l'âge ». Ce sont des signaux. Traitez tout changement brusque comme quelque chose à documenter et à signaler le jour même, et non comme une normalité à accepter.",
      },
      {
        titleEn: "Supporting a client with a disability",
        titleFr: "Soutenir un client vivant avec une incapacité",
        bodyEn:
          "Disability is not a single thing. A client may have a physical disability, a sensory one, an intellectual or developmental disability, a mental-health disability, or several at once. Some were born with it and have run their own lives for decades; others acquired it last year and are still adjusting. The person who has lived with a disability the longest is usually the expert on their own care — treat them that way.\n\nThe practical rule is to support, not substitute. Ask before you help, help with the part the person actually needs, and leave the rest to them. Doing a task faster yourself is not a kindness if it takes away something the client can still do. Independence lost through convenience is rarely regained.\n\nEquipment and set-up matter as much as hands-on help. A wheelchair, walker, transfer board, hearing aid, communication board, or grab bar is part of how the person functions, so keep it clean, charged, within reach, and exactly where they keep it. Moving someone's mobility aid across the room \"to tidy up\" can strand them. If a device is broken or unsafe, report it — don't improvise a substitute.",
        bodyFr:
          "L'incapacité n'est pas une réalité unique. Un client peut avoir une incapacité physique, sensorielle, intellectuelle ou développementale, ou liée à la santé mentale — parfois plusieurs à la fois. Certains sont nés avec et dirigent leur propre vie depuis des décennies; d'autres l'ont acquise l'an dernier et s'y adaptent encore. La personne qui vit avec son incapacité depuis le plus longtemps est habituellement l'experte de ses propres soins — traitez-la comme telle.\n\nLa règle pratique est de soutenir, non de remplacer. Demandez avant d'aider, aidez pour la partie dont la personne a réellement besoin et laissez-lui le reste. Faire une tâche plus vite à sa place n'est pas une gentillesse si cela lui retire quelque chose qu'elle peut encore faire. L'autonomie perdue par commodité se regagne rarement.\n\nL'équipement et l'aménagement comptent autant que l'aide directe. Un fauteuil roulant, une marchette, une planche de transfert, une prothèse auditive, un tableau de communication ou une barre d'appui font partie du fonctionnement de la personne : gardez-les propres, chargés, à portée de main et exactement là où elle les range. Déplacer l'aide à la mobilité de quelqu'un « pour ranger » peut l'immobiliser. Si un appareil est brisé ou non sécuritaire, signalez-le — n'improvisez pas de solution de rechange.",
      },
      {
        titleEn: "Living with chronic conditions",
        titleFr: "Vivre avec des maladies chroniques",
        bodyEn:
          "Most home-care clients live with more than one long-term condition — arthritis, diabetes, heart failure, COPD, stroke effects, or dementia are common. You are not expected to treat any of them. You are expected to know roughly what each one does to the person's day, and to notice when the usual pattern breaks.\n\nThat noticing is your real clinical contribution. You see the client more often than anyone on the care team. Swelling that is worse than last week, breathlessness on a walk that was fine before, a sore on the foot of a client with diabetes, a wet cough that was not there yesterday, or a person suddenly sleeping through the day — these are the observations the nurse needs and cannot make from an office.\n\nGood support is steady rather than dramatic: meals and fluids at the right times, the client moving as much as they safely can, rest respected, and the environment set up so the condition is not made worse. Combine that with prompt reporting and you will prevent more hospital admissions than any single heroic intervention ever would.",
        bodyFr:
          "La plupart des clients à domicile vivent avec plus d'une maladie de longue durée — arthrite, diabète, insuffisance cardiaque, MPOC, séquelles d'AVC ou démence sont fréquentes. On ne vous demande pas de les traiter. On vous demande de savoir en gros ce que chacune fait au quotidien de la personne, et de remarquer quand le portrait habituel change.\n\nCette observation est votre véritable apport clinique. Vous voyez le client plus souvent que quiconque dans l'équipe de soins. Une enflure pire que la semaine dernière, un essoufflement lors d'une marche auparavant facile, une plaie au pied chez un client diabétique, une toux grasse absente la veille, ou une personne qui dort soudainement toute la journée : voilà les observations dont l'infirmier a besoin et qu'il ne peut pas faire depuis un bureau.\n\nUn bon soutien est régulier plutôt que spectaculaire : des repas et des liquides aux bons moments, un client qui bouge autant qu'il le peut en sécurité, du repos respecté et un environnement aménagé pour ne pas aggraver la maladie. Combinez cela à un signalement rapide et vous préviendrez plus d'hospitalisations que n'importe quelle intervention héroïque isolée.",
      },
      {
        titleEn: "Dignity, ageism and assumptions",
        titleFr: "Dignité, âgisme et présomptions",
        bodyEn:
          "Ageism is the habit of assuming things about a person because of their age, and it shows up in small ways long before it shows up in big ones. Speaking to the family member instead of the client. Using a sing-song voice or calling an eighty-year-old \"sweetie.\" Deciding someone cannot understand a choice without ever offering it. Assuming an older client has no sexuality, no opinions about money, no plans.\n\nThe correction is simple and it is mostly about address: speak to the client first, use the name they ask you to use, explain what you are about to do before you do it, and offer the choice even when you expect it to be declined. If a family member answers on the client's behalf, gently bring the question back — \"Mrs. Boudreau, what would you like?\"\n\nThe same applies to disability. Do not assume a person who uses a wheelchair also has trouble hearing or thinking, and do not lean on their equipment or move them without asking. Dignity is not an add-on to the care task; it is the difference between care that a person accepts and care that a person endures.",
        bodyFr:
          "L'âgisme, c'est l'habitude de présumer des choses d'une personne à cause de son âge, et cela se manifeste par de petits gestes bien avant les grands. Parler au proche plutôt qu'au client. Prendre une voix chantante ou appeler « ma belle » une personne de quatre-vingts ans. Décider que quelqu'un ne peut pas comprendre un choix sans même le lui offrir. Présumer qu'un client âgé n'a ni sexualité, ni opinions sur l'argent, ni projets.\n\nLa correction est simple et tient surtout à la façon de s'adresser : parlez d'abord au client, utilisez le nom qu'il vous demande d'employer, expliquez ce que vous allez faire avant de le faire et offrez le choix même si vous vous attendez à un refus. Si un proche répond à la place du client, ramenez doucement la question : « Madame Boudreau, que préférez-vous? »\n\nLa même chose vaut pour l'incapacité. Ne présumez pas qu'une personne en fauteuil roulant entend ou comprend mal, et ne vous appuyez pas sur son équipement ni ne la déplacez sans demander. La dignité n'est pas un supplément à la tâche de soins; c'est ce qui distingue des soins qu'une personne accepte de soins qu'une personne subit.",
      },
    ],
    questions: [
      {
        promptEn:
          "A client who is normally alert is suddenly confused and unsteady today. What is the right interpretation?",
        promptFr:
          "Un client habituellement alerte est soudainement confus et instable aujourd'hui. Quelle est la bonne interprétation?",
        choicesEn: [
          "Normal ageing — note it at the end of the week",
          "A sudden change that must be documented and reported the same day",
          "Something only the family should be told about",
          "Expected after any bad night's sleep",
        ],
        choicesFr: [
          "Un vieillissement normal — à noter à la fin de la semaine",
          "Un changement soudain à documenter et à signaler le jour même",
          "Une chose à dire seulement à la famille",
          "Normal après toute mauvaise nuit de sommeil",
        ],
        correctIdx: [1],
        explainEn:
          "Ageing is gradual. Sudden confusion or instability is a signal of something new and needs same-day reporting.",
        explainFr:
          "Le vieillissement est graduel. Une confusion ou une instabilité soudaine signale quelque chose de nouveau et exige un signalement le jour même.",
      },
      {
        promptEn:
          "A client with a disability can dress their upper body but not their legs. What should you do?",
        promptFr:
          "Un client vivant avec une incapacité peut habiller le haut de son corps, mais pas ses jambes. Que devez-vous faire?",
        choicesEn: [
          "Dress them completely — it is faster",
          "Help only with the legs and let them do the rest",
          "Ask the family to take over dressing",
          "Leave dressing out of the visit",
        ],
        choicesFr: [
          "L'habiller complètement — c'est plus rapide",
          "N'aider que pour les jambes et le laisser faire le reste",
          "Demander à la famille de prendre en charge l'habillage",
          "Retirer l'habillage de la visite",
        ],
        correctIdx: [1],
        explainEn:
          "Support, don't substitute. Doing what the client can still do themselves erodes independence that is hard to get back.",
        explainFr:
          "Soutenir, non remplacer. Faire ce que le client peut encore faire lui-même érode une autonomie difficile à regagner.",
      },
      {
        promptEn:
          "Which of these are examples of ageism in daily care? (Select all that apply)",
        promptFr:
          "Lesquels de ces éléments sont des exemples d'âgisme dans les soins quotidiens? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Speaking to the family member instead of the client",
          "Calling an adult client \"sweetie\" without being invited to",
          "Explaining a task before doing it",
          "Deciding not to offer a choice because you assume it will be refused",
        ],
        choicesFr: [
          "Parler au proche plutôt qu'au client",
          "Appeler « ma belle » un client adulte sans y avoir été invité",
          "Expliquer une tâche avant de l'exécuter",
          "Décider de ne pas offrir un choix en présumant qu'il sera refusé",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Explaining a task first is good practice. The other three all substitute an assumption about age for the person's own voice.",
        explainFr:
          "Expliquer une tâche d'abord est une bonne pratique. Les trois autres remplacent la voix de la personne par une présomption liée à l'âge.",
      },
      {
        promptEn:
          "A client's walker is in the way while you clean, so you move it to the next room.",
        promptFr:
          "La marchette d'un client vous gêne pendant le ménage, alors vous la déplacez dans la pièce voisine.",
        type: "TRUE_FALSE",
        choicesEn: ["Acceptable", "Not acceptable"],
        choicesFr: ["Acceptable", "Inacceptable"],
        correctIdx: [1],
        explainEn:
          "A mobility aid is part of how the person functions. Moving it out of reach can strand them and cause a fall.",
        explainFr:
          "Une aide à la mobilité fait partie du fonctionnement de la personne. La mettre hors de portée peut l'immobiliser et provoquer une chute.",
      },
    ],
  },

  // ── 13. Convalescent Care Basics ─────────────────────────────────────
  {
    slug: "convalescent-care-basics",
    titleEn: "Convalescent Care Basics",
    titleFr: "Notions de base des soins de convalescence",
    descriptionEn:
      "Supporting a client recovering at home after surgery, illness or a hospital stay — what recovery needs, and which warning signs cannot wait.",
    descriptionFr:
      "Soutenir un client en rétablissement à domicile après une chirurgie, une maladie ou une hospitalisation — ce qu'exige la convalescence et quels signaux d'alerte ne peuvent pas attendre.",
    durationMin: 30,
    passMark: 80,
    citations: [BC_OER, BC_SUPP, PHO_IPAC],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "A nurse must confirm the warning-sign list and the wound/incision boundaries. The line between 'observe and report' and 'do not touch' is the whole safety story in this module and it is scope-sensitive.",
    },
    lessons: [
      {
        titleEn: "What convalescence is — and what it is not",
        titleFr: "Ce qu'est la convalescence — et ce qu'elle n'est pas",
        bodyEn:
          "Convalescent care is short-term support for someone recovering from surgery, a serious illness, or a hospital stay. Unlike ongoing home support, it has a direction: the client should be getting steadily stronger, and your visits should be needed a little less each week. If that is not happening, something is wrong and the team needs to know.\n\nRecovery is not simply rest. People who lie still after surgery lose strength fast, stiffen up, and are more likely to develop chest infections, pressure injuries and blood clots. The care plan will usually ask for a balance — planned rest, but also getting up, moving, eating properly and drinking enough. Your job is to make that balance happen on the days when the client does not feel like it.\n\nWhat convalescent care is not is nursing care. Discharge from hospital often comes with wound care, drains, catheters, injections or new medications, and those belong to the nurse or the client themselves. You may observe, you may support the set-up, and you must report — but you do not take on a clinical task because the client is home and the nurse is not there yet.",
        bodyFr:
          "Les soins de convalescence sont un soutien de courte durée offert à une personne qui se rétablit d'une chirurgie, d'une maladie grave ou d'une hospitalisation. Contrairement au soutien à domicile continu, ils ont une direction : le client devrait reprendre des forces de façon constante, et vos visites devraient être un peu moins nécessaires chaque semaine. Si ce n'est pas le cas, quelque chose ne va pas et l'équipe doit le savoir.\n\nLe rétablissement n'est pas simplement du repos. Les personnes qui restent immobiles après une chirurgie perdent rapidement leurs forces, s'ankylosent et risquent davantage les infections pulmonaires, les lésions de pression et les caillots sanguins. Le plan de soins demandera habituellement un équilibre : du repos planifié, mais aussi se lever, bouger, bien manger et boire suffisamment. Votre rôle est de faire vivre cet équilibre les jours où le client n'en a pas envie.\n\nCe que les soins de convalescence ne sont pas, ce sont des soins infirmiers. Un congé d'hôpital s'accompagne souvent de soins de plaie, de drains, de sondes, d'injections ou de nouveaux médicaments, et cela relève de l'infirmier ou du client lui-même. Vous pouvez observer, vous pouvez aider à préparer le matériel et vous devez signaler — mais vous n'assumez pas une tâche clinique parce que le client est à la maison et que l'infirmier n'est pas encore passé.",
      },
      {
        titleEn: "The first days home from hospital",
        titleFr: "Les premiers jours après le retour de l'hôpital",
        bodyEn:
          "The days right after discharge are the riskiest part of recovery. The client is tired, the routine has been disrupted, the medication list has usually changed, and the home may not yet be set up for how they move now. Readmissions cluster in this window, and a lot of what causes them is practical rather than medical.\n\nOn an early visit, look at the basics. Can they reach the bathroom safely on the route they will actually use at night? Is there food in the house that they can manage to eat? Do they have the new prescriptions in hand, or is one still sitting unfilled at the pharmacy? Is there a follow-up appointment, and can they get to it? These questions catch problems the discharge paperwork does not.\n\nExpect the client to be able to do less than they or their family assume. Someone who managed stairs a week ago may not manage them today. Take pain seriously — untreated pain keeps people from moving, and not moving is what causes the next complication. Report unrelieved pain rather than encouraging someone to push through it.",
        bodyFr:
          "Les jours qui suivent immédiatement le congé sont la période la plus risquée du rétablissement. Le client est fatigué, la routine a été bouleversée, la liste de médicaments a généralement changé et le domicile n'est peut-être pas encore adapté à sa façon de se déplacer maintenant. Les réadmissions se concentrent dans cette fenêtre, et beaucoup de leurs causes sont pratiques plutôt que médicales.\n\nLors d'une première visite, examinez les choses de base. Le client peut-il se rendre à la salle de bain en sécurité par le trajet qu'il empruntera vraiment la nuit? Y a-t-il à la maison de la nourriture qu'il est capable de manger? A-t-il ses nouvelles ordonnances en main, ou l'une d'elles dort-elle encore à la pharmacie? Y a-t-il un rendez-vous de suivi, et peut-il s'y rendre? Ces questions révèlent des problèmes que les documents de congé ne montrent pas.\n\nAttendez-vous à ce que le client puisse en faire moins que lui ou sa famille ne le supposent. Une personne qui montait l'escalier il y a une semaine peut ne pas y arriver aujourd'hui. Prenez la douleur au sérieux : une douleur non soulagée empêche de bouger, et l'immobilité est précisément ce qui cause la complication suivante. Signalez une douleur non soulagée plutôt que d'encourager quelqu'un à « prendre sur soi ».",
      },
      {
        titleEn: "Warning signs that cannot wait",
        titleFr: "Les signaux d'alerte qui ne peuvent pas attendre",
        bodyEn:
          "Most recovery problems announce themselves before they become emergencies, and you are the person most likely to see the announcement. Learn the short list and act on it the moment you see it, rather than waiting for the next scheduled call.\n\nEscalate the same visit for: a wound or incision that becomes red, hot, swollen, more painful, or starts to leak or smell; a fever or a client who is suddenly shivering; new or worsening shortness of breath; chest pain; a calf that is swollen, warm and painful on one side only; confusion in a client who was clear before; a client who cannot keep fluids down; or no urine output for an unusually long stretch. Call emergency services first for chest pain or serious breathing trouble, then your agency.\n\nAlso report — the same day, though not necessarily as an emergency — a client who is steadily eating less, losing weight, sleeping through the day, refusing to get up, or getting weaker rather than stronger. Recovery that is going backwards is itself a warning sign, even when no single symptom looks dramatic. Write what you saw in objective terms and say what time you saw it.",
        bodyFr:
          "La plupart des complications du rétablissement s'annoncent avant de devenir des urgences, et vous êtes la personne la plus susceptible de voir cette annonce. Apprenez la courte liste et agissez dès que vous la constatez, plutôt que d'attendre le prochain appel prévu.\n\nSignalez pendant la visite même : une plaie ou une incision devenue rouge, chaude, enflée, plus douloureuse, ou qui se met à couler ou à sentir mauvais; une fièvre ou un client qui frissonne soudainement; un essoufflement nouveau ou qui s'aggrave; une douleur à la poitrine; un mollet enflé, chaud et douloureux d'un seul côté; une confusion chez un client auparavant lucide; un client incapable de garder les liquides; ou une absence d'urine anormalement longue. Appelez d'abord les services d'urgence en cas de douleur thoracique ou de détresse respiratoire, puis votre agence.\n\nSignalez aussi — le jour même, sans être nécessairement une urgence — un client qui mange de moins en moins, perd du poids, dort toute la journée, refuse de se lever ou s'affaiblit au lieu de se renforcer. Un rétablissement qui recule est en soi un signal d'alerte, même si aucun symptôme pris isolément ne paraît dramatique. Écrivez ce que vous avez vu en termes objectifs et précisez l'heure.",
      },
      {
        titleEn: "Rebuilding strength and routine",
        titleFr: "Retrouver ses forces et sa routine",
        bodyEn:
          "As recovery progresses your role should shrink on purpose. The goal is not a comfortable client who depends on you; it is a client who no longer needs the visit. Each week, hand back a little more of the task — let them wash the parts they can reach, make their own tea, choose and start the meal — and adjust what you do as they improve.\n\nFood and fluids do more for healing than almost anything else you can influence. Tissue repair needs protein and calories, and appetite is usually poor after illness. Small, frequent, easy-to-eat food often works better than three full meals. Keep fluids visible and within reach through the visit. If someone is eating almost nothing several days in a row, that is a report, not a hurdle to push past.\n\nMovement is the other half. Follow whatever the care plan or therapist has set out — how far to walk, which exercises, which movements to avoid after that particular surgery — and don't invent your own programme. If the client is doing more than the plan allows, or refusing all of it, say so in your notes and to your supervisor so the plan can be adjusted rather than quietly ignored.",
        bodyFr:
          "À mesure que le rétablissement progresse, votre rôle devrait diminuer volontairement. Le but n'est pas un client confortable qui dépend de vous, mais un client qui n'a plus besoin de la visite. Chaque semaine, redonnez-lui un peu plus de la tâche — laissez-le laver les parties qu'il peut atteindre, préparer son thé, choisir et amorcer le repas — et ajustez ce que vous faites à mesure qu'il s'améliore.\n\nL'alimentation et l'hydratation font plus pour la guérison que presque tout ce que vous pouvez influencer. La réparation des tissus exige des protéines et des calories, et l'appétit est habituellement faible après une maladie. De petites portions fréquentes et faciles à manger fonctionnent souvent mieux que trois repas complets. Gardez les liquides visibles et à portée de main pendant la visite. Si une personne ne mange presque rien plusieurs jours de suite, cela se signale — ce n'est pas un obstacle à contourner.\n\nLe mouvement est l'autre moitié. Suivez ce que le plan de soins ou le thérapeute a établi — la distance à marcher, les exercices, les mouvements à éviter après cette chirurgie précise — et n'inventez pas votre propre programme. Si le client en fait plus que le plan ne le permet, ou refuse tout, écrivez-le dans vos notes et dites-le à votre superviseur afin que le plan soit ajusté plutôt que silencieusement ignoré.",
      },
    ],
    questions: [
      {
        promptEn:
          "Three days after surgery, a client's incision is red, hot and starting to smell. What do you do?",
        promptFr:
          "Trois jours après une chirurgie, l'incision d'un client est rouge, chaude et commence à sentir mauvais. Que faites-vous?",
        choicesEn: [
          "Clean and re-dress the wound yourself",
          "Observe, document, and report it to the nurse/supervisor the same visit",
          "Wait to see if it improves by the next visit",
          "Tell the family to buy an antiseptic",
        ],
        choicesFr: [
          "Nettoyer et refaire le pansement vous-même",
          "Observer, documenter et le signaler à l'infirmier/superviseur pendant la visite même",
          "Attendre de voir si cela s'améliore d'ici la prochaine visite",
          "Dire à la famille d'acheter un antiseptique",
        ],
        correctIdx: [1],
        explainEn:
          "Those are signs of a possible wound infection. Wound care is outside a home-support scope — observe, document and escalate immediately.",
        explainFr:
          "Ce sont des signes d'une infection possible de la plaie. Les soins de plaie dépassent le champ du soutien à domicile — observez, documentez et signalez immédiatement.",
      },
      {
        promptEn:
          "Which of these need the SAME-DAY attention of a nurse or emergency services? (Select all that apply)",
        promptFr:
          "Lesquels de ces signes exigent l'attention le JOUR MÊME d'un infirmier ou des services d'urgence? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "New shortness of breath",
          "A calf that is swollen, warm and painful on one side only",
          "A client who feels a little tired in the afternoon",
          "New confusion in a client who was clear yesterday",
        ],
        choicesFr: [
          "Un essoufflement nouveau",
          "Un mollet enflé, chaud et douloureux d'un seul côté",
          "Un client qui se sent un peu fatigué l'après-midi",
          "Une confusion nouvelle chez un client lucide la veille",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Breathlessness, a one-sided painful swollen calf and new confusion are all urgent. Ordinary afternoon tiredness during recovery is expected.",
        explainFr:
          "L'essoufflement, un mollet enflé et douloureux d'un seul côté et une confusion nouvelle sont tous urgents. Une fatigue ordinaire en après-midi durant la convalescence est attendue.",
      },
      {
        promptEn:
          "A convalescent client should rest as much as possible and avoid getting up.",
        promptFr:
          "Un client en convalescence devrait se reposer le plus possible et éviter de se lever.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. Prolonged immobility causes weakness, chest infections, pressure injuries and clots. Recovery needs a planned balance of rest and movement.",
        explainFr:
          "Faux. Une immobilité prolongée cause faiblesse, infections pulmonaires, lésions de pression et caillots. Le rétablissement exige un équilibre planifié entre repos et mouvement.",
      },
      {
        promptEn:
          "As a convalescent client gets stronger, what should happen to your role?",
        promptFr:
          "À mesure qu'un client en convalescence reprend des forces, qu'advient-il de votre rôle?",
        choicesEn: [
          "It should stay exactly the same until the file is closed",
          "It should shrink on purpose as the client takes tasks back",
          "It should grow so the client stays comfortable",
          "It should be decided by the family",
        ],
        choicesFr: [
          "Il devrait rester exactement le même jusqu'à la fermeture du dossier",
          "Il devrait diminuer volontairement à mesure que le client reprend les tâches",
          "Il devrait augmenter pour que le client reste confortable",
          "Il devrait être décidé par la famille",
        ],
        correctIdx: [1],
        explainEn:
          "Convalescent care has a direction. The goal is a client who no longer needs the visit, so hand tasks back as they become possible.",
        explainFr:
          "Les soins de convalescence ont une direction. Le but est un client qui n'a plus besoin de la visite : redonnez les tâches dès qu'elles redeviennent possibles.",
      },
    ],
  },

  // ── 14. Person-Centred Care ──────────────────────────────────────────
  {
    slug: "person-centred-care",
    titleEn: "Person-Centred Care",
    titleFr: "Soins centrés sur la personne",
    descriptionEn:
      "Person-centred care as a working philosophy: knowing the person, sharing control, supporting choice, and handling the moments when choice and safety pull against each other.",
    descriptionFr:
      "Les soins centrés sur la personne comme philosophie de travail : connaître la personne, partager le contrôle, soutenir le choix et gérer les moments où choix et sécurité s'opposent.",
    durationMin: 30,
    passMark: 80,
    citations: [NS_CCA, BC_SUPP],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "Review the dignity-of-risk section in particular. How far a client's 'right to live at risk' extends, and what must be escalated instead of accepted, is an agency-policy and capacity-assessment question that this module deliberately leaves to the supervisor.",
    },
    lessons: [
      {
        titleEn: "What person-centred care means",
        titleFr: "Ce que signifient les soins centrés sur la personne",
        bodyEn:
          "Person-centred care is a philosophy, not a technique. It treats the client and the people close to them as the centre of the care rather than as the recipients of it, and it starts from the position that every person has their own history, values and personality, and an equal claim to dignity, respect and a real part in their own life. Nova Scotia's Continuing Care Assistant framework builds its whole competency structure on that idea, which makes it the clearest regulatory statement of it available in Atlantic Canada.\n\nIn practical terms it means the care is built around a person rather than a task list. Two clients who both need help with a morning routine may need genuinely different visits, and neither is doing it wrong. The measure of your work is not whether the tasks got done but whether they got done in a way that fits this person.\n\nIt is worth being clear about what it is not. Person-centred care is not doing whatever anyone asks, it is not abandoning the care plan, and it is not agreeing with a family member because they are the loudest voice in the room. It is a deliberate practice of finding out what matters to the client and letting that shape how safe, planned care is delivered.",
        bodyFr:
          "Les soins centrés sur la personne sont une philosophie, pas une technique. Ils placent le client et ses proches au centre des soins plutôt qu'à leur réception, et partent du principe que chaque personne a son histoire, ses valeurs et sa personnalité, ainsi qu'un droit égal à la dignité, au respect et à une participation réelle à sa propre vie. Le cadre des assistants en soins continus de la Nouvelle-Écosse fonde toute sa structure de compétences sur cette idée, ce qui en fait l'énoncé réglementaire le plus clair disponible au Canada atlantique.\n\nConcrètement, cela signifie que les soins sont construits autour d'une personne plutôt que d'une liste de tâches. Deux clients ayant tous deux besoin d'aide pour leur routine du matin peuvent avoir besoin de visites réellement différentes, et aucun des deux n'a tort. La mesure de votre travail n'est pas de savoir si les tâches ont été faites, mais si elles ont été faites d'une manière qui convient à cette personne.\n\nIl vaut la peine de préciser ce que ce n'est pas. Les soins centrés sur la personne ne consistent pas à faire tout ce qu'on vous demande, ni à abandonner le plan de soins, ni à donner raison au proche qui parle le plus fort. C'est une pratique délibérée : découvrir ce qui compte pour le client et laisser cela façonner la façon dont des soins sécuritaires et planifiés sont offerts.",
      },
      {
        titleEn: "Knowing the person, not just the file",
        titleFr: "Connaître la personne, pas seulement le dossier",
        bodyEn:
          "You cannot centre care on a person you do not know. The care plan tells you what needs doing; it rarely tells you that the client was a fisherman for forty years, that mornings are hard since his wife died, that she takes her tea strong and hates being rushed, or that the radio being on matters more than the curtains being open.\n\nCollect that knowledge deliberately and early. Ask open questions — what a good day looks like, what they would like you to know about them, what they would rather do themselves. Watch for what settles or unsettles them. Then use it: raise something they care about while you work, sequence the visit the way they prefer, and get the small details right, because the small details are what tell a person they are known.\n\nShare what you learn through the proper channel. Preferences that affect care belong in your notes and in the plan so the next worker does not start from zero — this is exactly the CCA framework's expectation that support workers contribute to the client's plan of care. Personal confidences that do not affect care stay private. Knowing someone well is not a licence to talk about them.",
        bodyFr:
          "Vous ne pouvez pas centrer les soins sur une personne que vous ne connaissez pas. Le plan de soins vous dit ce qu'il faut faire; il vous dit rarement que le client a été pêcheur pendant quarante ans, que les matins sont difficiles depuis le décès de sa femme, qu'elle prend son thé fort et déteste être bousculée, ou que la radio allumée compte plus que les rideaux ouverts.\n\nRecueillez ces connaissances de façon délibérée et tôt. Posez des questions ouvertes : à quoi ressemble une bonne journée, ce qu'il aimerait que vous sachiez de lui, ce qu'il préfère faire lui-même. Observez ce qui l'apaise ou le perturbe. Puis servez-vous-en : abordez un sujet qui lui tient à cœur pendant le travail, organisez la visite dans l'ordre qu'il préfère et soignez les petits détails, car ce sont les petits détails qui disent à une personne qu'elle est connue.\n\nTransmettez ce que vous apprenez par le bon canal. Les préférences qui touchent les soins vont dans vos notes et dans le plan, pour que le prochain intervenant ne reparte pas de zéro — c'est précisément l'attente du cadre CCA voulant que les préposés contribuent au plan de soins du client. Les confidences personnelles sans effet sur les soins restent privées. Bien connaître quelqu'un n'est pas une permission d'en parler.",
      },
      {
        titleEn: "Sharing control in everyday care",
        titleFr: "Partager le contrôle dans les soins quotidiens",
        bodyEn:
          "Most of the control a home-care client has left is in small daily decisions, which makes those decisions worth protecting. Offer real choices rather than announcements: \"Would you like your bath before or after breakfast?\" gives control; \"I'm going to get you washed now\" removes it. Offer choices you can actually honour, and then honour them.\n\nHow you speak carries as much as what you decide. Explain what you are about to do before you do it, especially before you touch someone. Ask permission for personal care every time, even with a long-standing client, and even when the answer has always been yes. Consent is not something you collect once at the start of a placement.\n\nRefusal is part of choice. A client who says no to a bath today is exercising the same right that makes their yes meaningful. Find out why — pain, cold, embarrassment, tiredness, or a preference for a different time all lead to different solutions. Offer an alternative, respect a settled no, and document both the refusal and what you offered instead. Repeated refusals of necessary care go to your supervisor, not into a quiet argument at the bathroom door.",
        bodyFr:
          "L'essentiel du contrôle qu'il reste à un client à domicile réside dans de petites décisions quotidiennes, ce qui rend ces décisions dignes d'être protégées. Offrez de vrais choix plutôt que des annonces : « Préférez-vous votre bain avant ou après le déjeuner? » donne du contrôle; « Je vais vous laver maintenant » le retire. Offrez des choix que vous pouvez réellement honorer, puis honorez-les.\n\nVotre façon de parler compte autant que vos décisions. Expliquez ce que vous allez faire avant de le faire, surtout avant de toucher quelqu'un. Demandez la permission pour les soins personnels chaque fois, même avec un client de longue date, et même si la réponse a toujours été oui. Le consentement ne se recueille pas une seule fois au début d'un mandat.\n\nLe refus fait partie du choix. Un client qui refuse un bain aujourd'hui exerce le même droit qui donne du sens à son accord. Cherchez pourquoi : douleur, froid, gêne, fatigue ou préférence pour un autre moment mènent à des solutions différentes. Proposez une solution de rechange, respectez un refus ferme et documentez à la fois le refus et ce que vous avez proposé. Les refus répétés de soins nécessaires vont à votre superviseur, et non dans une discussion feutrée à la porte de la salle de bain.",
      },
      {
        titleEn: "When choice and safety pull apart",
        titleFr: "Quand le choix et la sécurité s'opposent",
        bodyEn:
          "Sooner or later a client will choose something you think is unsafe — refusing the walker, insisting on the stairs, wanting a bath alone, living in a home you would not consider safe. This is the hardest part of person-centred care, and the answer is not simply to override them. Adults who understand their situation are entitled to take risks with their own lives, and the CCA framework names that right directly.\n\nWork the problem instead of the person. Say plainly what worries you and why, in ordinary language. Look for the version of their choice that carries less risk — a different route, a grab bar, a chair in the shower, being nearby rather than hands-on. Very often the client's real goal survives once the specific hazard is dealt with, and the disagreement dissolves.\n\nThen escalate rather than decide alone. Tell your supervisor, describe what the client wants and what you did, and put it in your notes. Some situations are not yours to accept — a client who cannot understand the risk, a choice that endangers someone else, or any suspicion of abuse or neglect all go up the chain immediately. Escalating is not a betrayal of person-centred care; carrying an unsafe situation silently is.",
        bodyFr:
          "Tôt ou tard, un client fera un choix que vous jugez non sécuritaire : refuser la marchette, insister pour prendre l'escalier, vouloir se laver seul, vivre dans un logement que vous ne trouveriez pas sûr. C'est la partie la plus difficile des soins centrés sur la personne, et la réponse n'est pas simplement de passer outre. Les adultes qui comprennent leur situation ont le droit de prendre des risques avec leur propre vie, et le cadre CCA nomme ce droit directement.\n\nTravaillez sur le problème plutôt que sur la personne. Dites clairement ce qui vous inquiète et pourquoi, en mots simples. Cherchez la version de son choix qui comporte moins de risques : un autre trajet, une barre d'appui, un banc de douche, être à proximité plutôt qu'aux mains. Très souvent, le véritable objectif du client survit une fois le danger précis réglé, et le désaccord se dissout.\n\nEnsuite, signalez plutôt que de décider seul. Avisez votre superviseur, décrivez ce que le client veut et ce que vous avez fait, et consignez-le dans vos notes. Certaines situations ne vous appartiennent pas : un client incapable de comprendre le risque, un choix qui met autrui en danger, ou tout soupçon de mauvais traitement ou de négligence remontent immédiatement. Signaler n'est pas trahir les soins centrés sur la personne; porter seul une situation dangereuse, oui.",
      },
    ],
    questions: [
      {
        promptEn:
          "Which sentence best reflects person-centred care at the start of a bath?",
        promptFr:
          "Quelle phrase reflète le mieux des soins centrés sur la personne au début d'un bain?",
        choicesEn: [
          "\"I'm going to get you washed now.\"",
          "\"Would you like your bath before or after breakfast?\"",
          "\"Your daughter said you should be washed first.\"",
          "\"We always do baths at nine.\"",
        ],
        choicesFr: [
          "« Je vais vous laver maintenant. »",
          "« Préférez-vous votre bain avant ou après le déjeuner? »",
          "« Votre fille a dit qu'il fallait vous laver en premier. »",
          "« On fait toujours les bains à neuf heures. »",
        ],
        correctIdx: [1],
        explainEn:
          "A real, honourable choice gives the client control. The other three are announcements or someone else's decision.",
        explainFr:
          "Un choix réel et respectable donne le contrôle au client. Les trois autres sont des annonces ou la décision de quelqu'un d'autre.",
      },
      {
        promptEn:
          "A client who understands the risk insists on using the stairs without her walker. What is the best first response?",
        promptFr:
          "Une cliente qui comprend le risque insiste pour utiliser l'escalier sans sa marchette. Quelle est la meilleure première réaction?",
        choicesEn: [
          "Physically stop her",
          "Say nothing — it is her home",
          "Explain your concern plainly, look for a safer way to do what she wants, then report and document",
          "Refuse to continue the visit",
        ],
        choicesFr: [
          "L'arrêter physiquement",
          "Ne rien dire — c'est chez elle",
          "Exprimer clairement votre préoccupation, chercher une façon plus sécuritaire de faire ce qu'elle veut, puis signaler et documenter",
          "Refuser de poursuivre la visite",
        ],
        correctIdx: [2],
        explainEn:
          "Adults may take risks with their own lives. Work the risk down, escalate to your supervisor, and document — don't override in silence or stay silent.",
        explainFr:
          "Les adultes peuvent prendre des risques avec leur propre vie. Réduisez le risque, signalez à votre superviseur et documentez — sans passer outre en silence ni vous taire.",
      },
      {
        promptEn:
          "Which of these belong in the care plan or your notes? (Select all that apply)",
        promptFr:
          "Lesquels de ces éléments doivent figurer dans le plan de soins ou vos notes? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "That the client prefers her bath after breakfast",
          "That the client refused personal care today and what you offered instead",
          "A private family confidence that does not affect care",
          "That the client becomes distressed if the radio is turned off",
        ],
        choicesFr: [
          "Que la cliente préfère son bain après le déjeuner",
          "Que la cliente a refusé les soins personnels aujourd'hui et ce que vous avez proposé à la place",
          "Une confidence familiale privée sans effet sur les soins",
          "Que la cliente devient anxieuse si on éteint la radio",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Preferences and refusals that affect care belong in the record so the next worker does not start from zero. Private confidences that do not affect care stay private.",
        explainFr:
          "Les préférences et les refus qui touchent les soins appartiennent au dossier, pour que le prochain intervenant ne reparte pas de zéro. Les confidences privées sans effet sur les soins restent privées.",
      },
      {
        promptEn:
          "Once a long-standing client has consented to personal care, you do not need to ask again.",
        promptFr:
          "Une fois qu'un client de longue date a consenti aux soins personnels, il n'est plus nécessaire de redemander.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. Consent is asked each time, not collected once. Explaining and asking before you touch someone is part of the care itself.",
        explainFr:
          "Faux. Le consentement se demande chaque fois, il ne se recueille pas une seule fois. Expliquer et demander avant de toucher fait partie des soins.",
      },
    ],
  },

  // ── 15. Client Communication ─────────────────────────────────────────
  {
    slug: "client-communication",
    titleEn: "Client Communication",
    titleFr: "Communication avec le client",
    descriptionEn:
      "Practical communication for home visits: listening well, adapting to hearing, vision, speech and cognitive changes, handling difficult conversations, and reporting clearly to the team.",
    descriptionFr:
      "Communication pratique en visite à domicile : bien écouter, s'adapter aux changements auditifs, visuels, langagiers et cognitifs, gérer les conversations difficiles et transmettre clairement à l'équipe.",
    durationMin: 30,
    passMark: 80,
    citations: [NS_CCA, BC_SUPP, BC_OER],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "Confirm the language-access guidance fits the agency's real capability. In New Brunswick in particular, offering service in the client's official language is a service-quality and access expectation, not just a courtesy — a reviewer should decide how firmly to state that here.",
    },
    lessons: [
      {
        titleEn: "Listening is most of the job",
        titleFr: "Écouter, c'est l'essentiel du travail",
        bodyEn:
          "Most of what you will ever learn about a client arrives while you are listening, not while you are talking. Give the person your attention rather than half of it — stop the task for a moment, face them, and let them finish without filling the pauses. Older adults and people who are unwell often need a few extra seconds to assemble a thought, and those seconds are where the important sentence usually lands.\n\nCheck that you understood rather than assuming. Reflecting back in your own words — \"so the knee has been worse since Sunday, and it's worst getting out of bed\" — confirms the facts and shows the person they were heard. It also catches the misunderstandings that would otherwise end up in your notes as fact.\n\nListen for what is under the words too. \"I don't want to be a bother\" often means something is being hidden. A joke about not sleeping may be the only way a person can raise pain or fear. You are not there to counsel anyone, but you are there to notice, ask a gentle follow-up question, and pass on what matters to the nurse or your supervisor.",
        bodyFr:
          "L'essentiel de ce que vous apprendrez d'un client vous parviendra pendant que vous écoutez, non pendant que vous parlez. Accordez à la personne toute votre attention plutôt que la moitié : interrompez la tâche un instant, faites-lui face et laissez-la terminer sans combler les silences. Les aînés et les personnes malades ont souvent besoin de quelques secondes de plus pour former une pensée, et c'est dans ces secondes que tombe habituellement la phrase importante.\n\nVérifiez votre compréhension au lieu de présumer. Reformuler dans vos propres mots — « donc le genou va moins bien depuis dimanche, et c'est pire au lever » — confirme les faits et montre à la personne qu'elle a été entendue. Cela évite aussi les malentendus qui se retrouveraient autrement dans vos notes comme des faits.\n\nÉcoutez aussi ce qu'il y a sous les mots. « Je ne veux pas déranger » signifie souvent que quelque chose est caché. Une blague sur le manque de sommeil peut être la seule façon pour une personne d'aborder sa douleur ou sa peur. Vous n'êtes pas là pour faire du counseling, mais vous êtes là pour remarquer, poser doucement une question de suivi et transmettre ce qui compte à l'infirmier ou à votre superviseur.",
      },
      {
        titleEn: "Adapting to hearing, vision and speech changes",
        titleFr: "S'adapter aux changements auditifs, visuels et langagiers",
        bodyEn:
          "When someone has trouble hearing you, volume is usually the wrong lever. Age-related hearing loss takes the high pitches first, so shouting mostly makes speech harsher and harder to follow. Face the person so they can see your mouth, cut the background noise, drop your pitch slightly, slow down, and rephrase rather than simply repeating the same sentence louder. Check that hearing aids are in and switched on before you conclude someone cannot hear.\n\nWith vision loss, say who you are when you arrive and say when you are leaving the room, so the person is never talking to an empty kitchen. Describe what you are doing as you do it, and tell them before you touch them. Keep their belongings exactly where they keep them — for someone with low vision, a tidied counter is a lost counter.\n\nAfter a stroke or with advanced dementia, speech may be slow, jumbled or absent while understanding is still largely intact, so keep your tone adult. Ask one question at a time, prefer yes-or-no questions when open ones stall, allow long pauses, and accept gestures, pointing, writing or a communication board as real answers. If you truly cannot understand something important, say so honestly and get help rather than nodding along.",
        bodyFr:
          "Quand une personne vous entend mal, le volume est habituellement le mauvais levier. La perte auditive liée à l'âge touche d'abord les sons aigus, si bien que crier rend surtout la parole plus dure et plus difficile à suivre. Faites face à la personne pour qu'elle voie votre bouche, réduisez le bruit ambiant, baissez légèrement le ton, ralentissez et reformulez au lieu de répéter la même phrase plus fort. Vérifiez que les prothèses auditives sont en place et allumées avant de conclure qu'on ne vous entend pas.\n\nEn cas de perte de vision, dites qui vous êtes en arrivant et annoncez quand vous quittez la pièce, pour que la personne ne parle jamais à une cuisine vide. Décrivez ce que vous faites pendant que vous le faites, et prévenez avant de toucher. Laissez ses effets exactement où elle les range — pour une personne malvoyante, un comptoir rangé est un comptoir perdu.\n\nAprès un AVC ou en cas de démence avancée, la parole peut être lente, embrouillée ou absente alors que la compréhension demeure largement intacte : gardez un ton d'adulte à adulte. Posez une question à la fois, privilégiez les questions fermées quand les questions ouvertes bloquent, laissez de longues pauses et acceptez les gestes, les pointages, l'écrit ou un tableau de communication comme de vraies réponses. Si vous ne comprenez vraiment pas quelque chose d'important, dites-le honnêtement et cherchez de l'aide plutôt que d'acquiescer.",
      },
      {
        titleEn: "Difficult conversations and conflict",
        titleFr: "Conversations difficiles et conflits",
        bodyEn:
          "Anger in a home visit is usually about something other than you. Pain, fear, grief, exhaustion, loss of independence, or a family argument that started before you arrived all come out as sharpness at whoever is standing there. Recognising that makes it much easier not to answer in kind.\n\nKeep your voice low and even, keep your body relaxed and open, give the person space, and let them say the whole thing without interrupting. Acknowledge the feeling before you address the facts — \"I can see this has been a rotten morning\" costs nothing and defuses a great deal. Then deal with what you can actually deal with, and be honest about what you cannot: promising a schedule change you have no authority to make just moves the anger to the next visit.\n\nKnow where your limits are. You are not required to accept abuse, threats, or a situation that feels unsafe — leave, get to a safe place, and contact your agency, exactly as your lone-worker procedure sets out. Afterwards, document what happened in plain factual terms and tell your supervisor, even if it ended well. Patterns only become visible if each incident is written down.",
        bodyFr:
          "La colère en visite à domicile concerne rarement vous. La douleur, la peur, le deuil, l'épuisement, la perte d'autonomie ou une chicane de famille commencée avant votre arrivée ressortent tous en brusquerie envers la personne présente. Le reconnaître rend beaucoup plus facile de ne pas répondre sur le même ton.\n\nGardez une voix basse et posée, un corps détendu et ouvert, laissez de l'espace à la personne et laissez-la dire toute sa pensée sans l'interrompre. Reconnaissez l'émotion avant d'aborder les faits : « Je vois que la matinée a été pénible » ne coûte rien et désamorce beaucoup. Réglez ensuite ce que vous pouvez réellement régler et soyez honnête sur le reste : promettre un changement d'horaire que vous n'avez pas le pouvoir d'accorder ne fait que reporter la colère à la prochaine visite.\n\nConnaissez vos limites. Vous n'avez pas à accepter les insultes, les menaces ou une situation qui vous semble dangereuse : partez, mettez-vous en sécurité et communiquez avec votre agence, exactement comme le prévoit votre procédure de travail seul. Ensuite, documentez les faits en termes simples et objectifs et informez votre superviseur, même si tout s'est bien terminé. Les tendances ne deviennent visibles que si chaque incident est consigné.",
      },
      {
        titleEn: "Reporting clearly to the team",
        titleFr: "Transmettre clairement à l'équipe",
        bodyEn:
          "Communication with the care team is as much a part of your job as communication with the client, and it follows different rules. The team needs facts, not impressions. \"Mr. Cormier ate about a quarter of his lunch and told me food has tasted wrong since Friday\" is useful; \"he wasn't himself\" is not, because the nurse cannot act on it.\n\nSay what you saw, when you saw it, and what you did. Separate the client's own words from your observations, and keep both separate from your guesses — if you suspect something, say that you suspect it. Never write a label where a description belongs: \"declined her bath, said she was cold\" and \"was uncooperative\" describe the same visit, but only one is true information.\n\nMatch the channel to the urgency. Routine observations go in your notes. Anything that cannot wait for someone to read them — a fall, a new symptom, a refusal of medication, a safety concern, an injury — gets a call as well as a note. When you hand over to another worker, cover what changed, what is outstanding, and what to watch for. And remember the whole of it is confidential health information: it goes to the team through the agency's approved tools, and nowhere else.",
        bodyFr:
          "La communication avec l'équipe de soins fait autant partie de votre travail que la communication avec le client, et elle obéit à d'autres règles. L'équipe a besoin de faits, non d'impressions. « M. Cormier a mangé environ le quart de son dîner et m'a dit que la nourriture goûte mauvais depuis vendredi » est utile; « il n'était pas lui-même » ne l'est pas, car l'infirmier ne peut rien en faire.\n\nDites ce que vous avez vu, quand vous l'avez vu et ce que vous avez fait. Distinguez les paroles du client de vos observations, et séparez les deux de vos hypothèses — si vous soupçonnez quelque chose, dites que vous le soupçonnez. N'écrivez jamais une étiquette là où il faut une description : « a refusé son bain, disait avoir froid » et « était non coopérative » décrivent la même visite, mais une seule est une information véritable.\n\nAdaptez le canal à l'urgence. Les observations courantes vont dans vos notes. Tout ce qui ne peut pas attendre qu'on les lise — une chute, un nouveau symptôme, un refus de médicament, un risque pour la sécurité, une blessure — fait l'objet d'un appel en plus d'une note. Lors d'un transfert à un autre intervenant, couvrez ce qui a changé, ce qui reste à faire et ce qu'il faut surveiller. Et rappelez-vous que tout cela est de l'information de santé confidentielle : elle circule vers l'équipe par les outils approuvés de l'agence, et nulle part ailleurs.",
      },
    ],
    questions: [
      {
        promptEn:
          "A client with age-related hearing loss is struggling to follow you. What is the best adjustment?",
        promptFr:
          "Un client ayant une perte auditive liée à l'âge peine à vous suivre. Quel est le meilleur ajustement?",
        choicesEn: [
          "Shout the same sentence louder",
          "Face him, reduce background noise, lower your pitch, slow down and rephrase",
          "Speak to his daughter instead",
          "Write everything down and stop speaking",
        ],
        choicesFr: [
          "Crier la même phrase plus fort",
          "Lui faire face, réduire le bruit ambiant, baisser le ton, ralentir et reformuler",
          "Parler plutôt à sa fille",
          "Tout écrire et cesser de parler",
        ],
        correctIdx: [1],
        explainEn:
          "Age-related loss affects high pitches first, so shouting makes speech harsher. Facing the person, cutting noise, lowering pitch and rephrasing all help.",
        explainFr:
          "La perte liée à l'âge touche d'abord les aigus : crier rend la parole plus dure. Faire face, réduire le bruit, baisser le ton et reformuler aident tous.",
      },
      {
        promptEn: "Which of these is a usable report to the nurse?",
        promptFr: "Lequel de ces énoncés est un signalement utilisable pour l'infirmier?",
        choicesEn: [
          "\"She wasn't herself today.\"",
          "\"She was being difficult.\"",
          "\"She ate about a quarter of her lunch and said food has tasted wrong since Friday.\"",
          "\"I think she's just attention-seeking.\"",
        ],
        choicesFr: [
          "« Elle n'était pas elle-même aujourd'hui. »",
          "« Elle était difficile. »",
          "« Elle a mangé environ le quart de son dîner et a dit que la nourriture goûte mauvais depuis vendredi. »",
          "« Je pense qu'elle cherche seulement de l'attention. »",
        ],
        correctIdx: [2],
        explainEn:
          "The team needs observable facts with times and the client's own words. Labels and guesses cannot be acted on.",
        explainFr:
          "L'équipe a besoin de faits observables, avec l'heure et les mots du client. On ne peut pas agir sur des étiquettes ou des suppositions.",
      },
      {
        promptEn:
          "A client's son is shouting at you about a schedule change you did not make. What should you do? (Select all that apply)",
        promptFr:
          "Le fils d'un client vous crie après au sujet d'un changement d'horaire dont vous n'êtes pas responsable. Que devez-vous faire? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Keep your voice low and even and let him finish",
          "Acknowledge the frustration before addressing the facts",
          "Promise the schedule change he wants to end the argument",
          "Document what happened and tell your supervisor afterwards",
        ],
        choicesFr: [
          "Garder une voix basse et posée et le laisser terminer",
          "Reconnaître la frustration avant d'aborder les faits",
          "Promettre le changement d'horaire qu'il veut pour mettre fin à la dispute",
          "Documenter les faits et en informer ensuite votre superviseur",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Never promise what you have no authority to deliver — it moves the anger to the next visit. The other three de-escalate and create a record.",
        explainFr:
          "Ne promettez jamais ce que vous n'avez pas le pouvoir d'accorder — cela reporte la colère à la prochaine visite. Les trois autres désamorcent et créent une trace.",
      },
      {
        promptEn:
          "A client after a stroke speaks slowly and jumbles words, so you should speak to them as you would to a child.",
        promptFr:
          "Un client ayant subi un AVC parle lentement et embrouille ses mots : il faut donc lui parler comme à un enfant.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. Speech can be badly affected while understanding stays largely intact. Keep an adult tone, ask one question at a time, and allow long pauses.",
        explainFr:
          "Faux. La parole peut être très atteinte alors que la compréhension reste largement intacte. Gardez un ton d'adulte, une question à la fois, et laissez de longues pauses.",
      },
    ],
  },

  // ── 16. Documentation, Care Notes & Incident Reporting ───────────────
  {
    slug: "documentation-care-notes-incident-reporting",
    titleEn: "Documentation, Care Notes & Incident Reporting",
    titleFr: "Documentation, notes de soins et déclaration d'incident",
    descriptionEn:
      "Writing care notes that are accurate, objective and defensible; correcting mistakes properly; and knowing what turns an observation into an incident report.",
    descriptionFr:
      "Rédiger des notes de soins exactes, objectives et défendables; corriger correctement une erreur; et savoir ce qui transforme une observation en déclaration d'incident.",
    durationMin: 30,
    passMark: 80,
    citations: [NS_CCA, OPC],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "ORIGINAL",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "Mostly original authoring - no single strong open Canadian source exists for home-support documentation. Lower risk than the other ORIGINAL modules because most of it describes the agency's own workflow, but an agency reviewer MUST align the incident-report triggers, timelines and correction procedure with their real forms before use.",
    },
    lessons: [
      {
        titleEn: "Why the record matters",
        titleFr: "Pourquoi le dossier compte",
        bodyEn:
          "Your care notes are the only durable trace of the visit. They keep the next worker and the nurse informed, they show the client's condition over time, and they are the evidence of what care was actually delivered. In a complaint, an investigation, or a coroner's review, the record is what speaks for you — and an absent note is very hard to argue with.\n\nThat is why the habit matters more than the eloquence. Write the note promptly, while the visit is fresh, rather than reconstructing four visits from memory at the end of the week. Late notes lose detail, drift toward what usually happens instead of what happened, and are worth much less if they are ever examined.\n\nThe record is also legally protected health information. It belongs to the client, not to you, and it is governed by your province's health-privacy statute. Keep it out of view of visitors, never photograph it on a personal phone, never discuss it outside the care team, and enter it only through your agency's approved tools. A note written in the right words but stored in the wrong place is still a privacy breach.",
        bodyFr:
          "Vos notes de soins sont la seule trace durable de la visite. Elles tiennent informés le prochain intervenant et l'infirmier, elles montrent l'évolution de l'état du client et elles constituent la preuve des soins réellement offerts. Lors d'une plainte, d'une enquête ou d'un examen du coroner, c'est le dossier qui parle pour vous — et une note absente est très difficile à défendre.\n\nC'est pourquoi l'habitude compte plus que le style. Rédigez la note rapidement, pendant que la visite est fraîche, plutôt que de reconstituer quatre visites de mémoire à la fin de la semaine. Les notes tardives perdent des détails, glissent vers ce qui arrive d'habitude plutôt que vers ce qui est arrivé, et valent beaucoup moins si elles sont un jour examinées.\n\nLe dossier est aussi de l'information de santé protégée par la loi. Il appartient au client, non à vous, et il est régi par la loi provinciale sur les renseignements personnels sur la santé. Gardez-le hors de vue des visiteurs, ne le photographiez jamais avec un téléphone personnel, n'en discutez jamais à l'extérieur de l'équipe de soins et ne le saisissez que par les outils approuvés de votre agence. Une note bien rédigée mais rangée au mauvais endroit demeure une atteinte à la vie privée.",
      },
      {
        titleEn: "Writing an objective note",
        titleFr: "Rédiger une note objective",
        bodyEn:
          "A good note records what you observed, what you did, when, and what changed — in plain language a stranger could follow. Use the client's own words in quotation marks when they matter, and describe behaviour rather than labelling it. \"Refused her bath, said she was cold and tired; offered again at 10:15 and she accepted\" is a fact. \"Uncooperative\" is a judgement that tells the reader nothing they can act on.\n\nBe specific with quantities and times rather than vague. \"Ate about half a bowl of soup and drank two glasses of water\" beats \"ate poorly.\" \"Walked to the bathroom with one-hand support, steady\" beats \"mobilised well.\" Vague notes fail exactly when they are needed most, because nobody can tell later whether things were getting better or worse.\n\nKeep your guesses labelled as guesses. If you think something is wrong but cannot say what, write what you saw and add that you reported your concern — not a diagnosis. Never chart anything you did not do or did not see, never chart in advance, and never chart for another worker. And leave out the things that do not belong: opinions about the family, comments on the state of the home beyond genuine safety concerns, and anything about other people in the household who are not your client.",
        bodyFr:
          "Une bonne note consigne ce que vous avez observé, ce que vous avez fait, à quel moment et ce qui a changé — dans un langage simple qu'un inconnu pourrait suivre. Reprenez les mots du client entre guillemets quand ils comptent, et décrivez le comportement au lieu de l'étiqueter. « A refusé son bain, disait avoir froid et être fatiguée; offert de nouveau à 10 h 15 et elle a accepté » est un fait. « Non coopérative » est un jugement qui n'apprend rien d'exploitable au lecteur.\n\nSoyez précis quant aux quantités et aux heures plutôt que vague. « A mangé environ un demi-bol de soupe et bu deux verres d'eau » vaut mieux que « a peu mangé ». « S'est rendue à la salle de bain avec appui d'une main, stable » vaut mieux que « bonne mobilisation ». Les notes vagues échouent précisément quand on en a le plus besoin, parce que personne ne peut dire ensuite si la situation s'améliorait ou se dégradait.\n\nIdentifiez vos hypothèses comme telles. Si vous croyez que quelque chose ne va pas sans pouvoir dire quoi, écrivez ce que vous avez vu et ajoutez que vous avez signalé votre préoccupation — pas un diagnostic. Ne consignez jamais ce que vous n'avez pas fait ou pas vu, jamais à l'avance, et jamais à la place d'un autre intervenant. Et laissez de côté ce qui n'a pas sa place : les opinions sur la famille, les commentaires sur l'état du logement au-delà des véritables risques, et tout ce qui concerne d'autres occupants qui ne sont pas votre client.",
      },
      {
        titleEn: "Corrections, gaps and honesty",
        titleFr: "Corrections, oublis et honnêteté",
        bodyEn:
          "Everyone makes mistakes in a record. What matters is that a correction is visible rather than hidden. Follow your agency's procedure — typically a single line through the error so the original stays readable, the correction beside it, and your initials, name and date. On an electronic record, use the system's own correction or addendum function.\n\nWhat you must never do is erase, overwrite, scribble out, use correction fluid, backdate, or quietly rewrite a note after the fact. An honest error, corrected openly, is a normal part of practice and reads that way. A concealed change reads as a cover-up and destroys the credibility of everything else in the file, including the parts that were right.\n\nThe same honesty applies to gaps. If you forgot to chart something, add it as a late entry that says clearly when it happened and when you are writing it. If a task in the plan did not get done, write that it did not get done and why, rather than leaving a silence someone will later read as completed care. \"Client asleep at 14:00, personal care not completed, supervisor notified\" protects the client and you far better than an empty line.",
        bodyFr:
          "Tout le monde fait des erreurs dans un dossier. Ce qui compte, c'est qu'une correction soit visible plutôt que dissimulée. Suivez la procédure de votre agence — habituellement un seul trait sur l'erreur pour que l'original reste lisible, la correction à côté, puis vos initiales, votre nom et la date. Dans un dossier électronique, utilisez la fonction de correction ou d'addenda du système.\n\nCe qu'il ne faut jamais faire : effacer, écraser, raturer, utiliser du liquide correcteur, antidater ou réécrire discrètement une note après coup. Une erreur honnête, corrigée ouvertement, fait partie de la pratique normale et se lit ainsi. Une modification dissimulée se lit comme une dissimulation et détruit la crédibilité de tout le reste du dossier, y compris ce qui était exact.\n\nLa même honnêteté vaut pour les oublis. Si vous avez omis de consigner quelque chose, ajoutez une entrée tardive indiquant clairement quand cela s'est produit et quand vous l'écrivez. Si une tâche du plan n'a pas été faite, écrivez qu'elle ne l'a pas été et pourquoi, plutôt que de laisser un silence que quelqu'un lira plus tard comme des soins accomplis. « Cliente endormie à 14 h, soins personnels non effectués, superviseur avisé » vous protège, elle et vous, bien mieux qu'une ligne vide.",
      },
      {
        titleEn: "When an observation becomes an incident report",
        titleFr: "Quand une observation devient une déclaration d'incident",
        bodyEn:
          "Some events need more than a line in the daily note. An incident report is a separate record raised when something went wrong or nearly did, and it exists so the agency can respond and prevent a repeat. Your agency's own list governs, but it normally includes any fall — witnessed or found — any injury to the client or to you, a medication error, a missed or refused visit, a client found unwell or unresponsive, aggression or a threat, property damage or loss, a suspected privacy breach, and any suspicion of abuse or neglect.\n\nNear misses count. The transfer that almost went wrong, the wrong pill box you noticed before it was taken, the stair rail that came loose in your hand — reporting these is how a hazard gets fixed before it hurts someone. An agency that only hears about actual harm cannot prevent any.\n\nReport promptly, within your agency's timeframe, and remember that the report supplements the care note rather than replacing it. Write the facts: what happened, when, where, who was present, what you observed, what you did, and who you notified. Do not speculate about cause and do not assign blame — that is the reviewer's job, and speculation in an incident report tends to be the sentence quoted back to you later. If someone is hurt or at risk right now, deal with that first and write afterwards.",
        bodyFr:
          "Certains événements exigent plus qu'une ligne dans la note quotidienne. Une déclaration d'incident est un document distinct produit lorsqu'une chose a mal tourné ou a failli mal tourner, et elle existe pour que l'agence puisse réagir et éviter une répétition. La liste de votre agence fait foi, mais elle comprend normalement toute chute — constatée ou découverte —, toute blessure au client ou à vous, une erreur de médicament, une visite manquée ou refusée, un client trouvé mal en point ou inconscient, de l'agressivité ou une menace, un dommage ou une perte de biens, une atteinte présumée à la vie privée et tout soupçon de mauvais traitement ou de négligence.\n\nLes quasi-accidents comptent. Le transfert qui a failli mal tourner, le pilulier erroné que vous avez remarqué avant la prise, la rampe d'escalier qui vous est restée dans la main : les signaler, c'est ainsi qu'un danger est corrigé avant de blesser quelqu'un. Une agence qui n'entend parler que des préjudices réels ne peut en prévenir aucun.\n\nDéclarez rapidement, dans le délai fixé par votre agence, et rappelez-vous que la déclaration complète la note de soins au lieu de la remplacer. Écrivez les faits : ce qui s'est passé, quand, où, qui était présent, ce que vous avez observé, ce que vous avez fait et qui vous avez avisé. Ne spéculez pas sur la cause et n'attribuez pas de faute — c'est le travail de l'examinateur, et une spéculation dans une déclaration d'incident est souvent la phrase qu'on vous citera plus tard. Si quelqu'un est blessé ou en danger immédiat, occupez-vous-en d'abord et écrivez ensuite.",
      },
    ],
    questions: [
      {
        promptEn: "Which of these is written correctly for a care note?",
        promptFr: "Laquelle de ces formulations est correcte pour une note de soins?",
        choicesEn: [
          "\"Client was uncooperative this morning.\"",
          "\"Refused her bath at 09:30, said she was cold and tired; offered again at 10:15 and she accepted.\"",
          "\"The house was a disgrace as usual.\"",
          "\"Probably has a urinary infection.\"",
        ],
        choicesFr: [
          "« La cliente était non coopérative ce matin. »",
          "« A refusé son bain à 9 h 30, disait avoir froid et être fatiguée; offert de nouveau à 10 h 15 et elle a accepté. »",
          "« La maison était un désastre, comme d'habitude. »",
          "« A probablement une infection urinaire. »",
        ],
        correctIdx: [1],
        explainEn:
          "Objective, timed, uses the client's own reason, and records what you did. The others are a label, an opinion about the home, and a diagnosis outside your scope.",
        explainFr:
          "Objectif, horodaté, reprend la raison donnée par la cliente et consigne votre action. Les autres sont une étiquette, une opinion sur le logement et un diagnostic hors de votre champ.",
      },
      {
        promptEn: "You realise you charted the wrong time on yesterday's note. What should you do?",
        promptFr:
          "Vous constatez avoir inscrit la mauvaise heure dans la note d'hier. Que devez-vous faire?",
        choicesEn: [
          "Erase it and write the right time",
          "Cover it with correction fluid and rewrite it",
          "Leave it — a small error does not matter",
          "Follow the agency's correction procedure so the original stays readable, then initial and date the correction",
        ],
        choicesFr: [
          "L'effacer et inscrire la bonne heure",
          "La recouvrir de liquide correcteur et la réécrire",
          "La laisser — une petite erreur n'a pas d'importance",
          "Suivre la procédure de correction de l'agence pour que l'original reste lisible, puis parapher et dater la correction",
        ],
        correctIdx: [3],
        explainEn:
          "Corrections must be visible, not hidden. An openly corrected error is normal practice; a concealed change destroys the credibility of the whole record.",
        explainFr:
          "Les corrections doivent être visibles, non dissimulées. Une erreur corrigée ouvertement est normale; une modification cachée détruit la crédibilité de tout le dossier.",
      },
      {
        promptEn:
          "Which of these normally require an incident report? (Select all that apply)",
        promptFr:
          "Lesquels de ces événements exigent normalement une déclaration d'incident? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "A client found on the floor, even if unhurt",
          "A near miss during a transfer where nobody was injured",
          "A client choosing toast instead of porridge",
          "Noticing the pill box was filled with the wrong day's medication before it was taken",
        ],
        choicesFr: [
          "Un client trouvé au sol, même sans blessure",
          "Un quasi-accident lors d'un transfert sans blessure",
          "Un client qui choisit des rôties plutôt que du gruau",
          "Constater que le pilulier contenait les médicaments du mauvais jour avant la prise",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Falls, near misses and medication errors are all reportable — near misses are how hazards get fixed before someone is hurt. A meal preference is simply a preference.",
        explainFr:
          "Chutes, quasi-accidents et erreurs de médicaments sont tous déclarables — les quasi-accidents permettent de corriger un danger avant qu'il blesse. Une préférence alimentaire n'est qu'une préférence.",
      },
      {
        promptEn:
          "If a task in the care plan was not completed, it is better to leave the note blank than to write that it was missed.",
        promptFr:
          "Si une tâche du plan de soins n'a pas été effectuée, il vaut mieux laisser la note vide que d'écrire qu'elle a été manquée.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. A silence gets read later as completed care. Record that it was not done, why, and who you notified.",
        explainFr:
          "Faux. Un silence sera lu plus tard comme des soins accomplis. Consignez que ce n'a pas été fait, pourquoi, et qui vous avez avisé.",
      },
    ],
  },

  // ── 17. Solo Emergency Response ──────────────────────────────────────
  {
    slug: "solo-emergency-response",
    titleEn: "Solo Emergency Response",
    titleFr: "Intervention d'urgence en solo",
    descriptionEn:
      "What to do in the first minutes of an emergency when you are the only worker in the home — assessing, calling for help, acting within your scope, and what to do afterwards.",
    descriptionFr:
      "Quoi faire dans les premières minutes d'une urgence quand vous êtes le seul intervenant au domicile — évaluer, appeler à l'aide, agir dans votre champ de pratique et quoi faire ensuite.",
    durationMin: 30,
    passMark: 80,
    citations: [CCOHS_ALONE_PT],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "ORIGINAL",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "HIGHEST-RISK MODULE IN THE LIBRARY. No Canadian home-care-specific open source was found, so this is original authoring and is deliberately written as decision-making and escalation only - it teaches NO clinical or first-aid technique. It must be reviewed by a clinician before any use, and it is NOT a substitute for certified First Aid/CPR, which per B0 Finding 3 is an externally issued credential tracked in StaffCertification (Seam 3), not taught here.",
      blocker:
        "Consider a short partnership ask to the Canadian Red Cross or St John Ambulance for a citable, permitted emergency-response checklist for home-support workers. Until then this module stays original and conservatively tagged.",
    },
    lessons: [
      {
        titleEn: "What this module is and is not",
        titleFr: "Ce que ce module est et n'est pas",
        bodyEn:
          "Working alone means that when something goes wrong there is no colleague in the next room. This module is about the decisions you make in those first minutes: recognising an emergency, getting the right help coming, keeping yourself and the client safe, and staying inside your scope while you wait.\n\nIt is not a first-aid course and it does not teach any hands-on technique. It will not tell you how to do CPR, control bleeding, or manage a choking client, because those skills cannot be learned safely from text and must not be attempted on the strength of a reading module. Certified First Aid and CPR come from a recognised provider such as the Canadian Red Cross or St John Ambulance, and your agency tracks that certificate and its expiry separately from this training.\n\nWhat it can do is stop the two failures that turn a bad situation into a worse one: hesitating to call for help, and attempting something outside your training because nobody else is there. If you take one thing from this module, take this — calling 911 early is never the wrong call, and no employer will fault you for it.",
        bodyFr:
          "Travailler seul signifie qu'en cas de problème, il n'y a pas de collègue dans la pièce voisine. Ce module porte sur les décisions que vous prenez dans ces premières minutes : reconnaître une urgence, faire venir la bonne aide, assurer votre sécurité et celle du client, et rester dans votre champ de pratique pendant l'attente.\n\nCe n'est pas un cours de secourisme et il n'enseigne aucune technique pratique. Il ne vous dira pas comment faire la RCR, arrêter une hémorragie ou intervenir auprès d'un client qui s'étouffe, car ces gestes ne s'apprennent pas de façon sécuritaire par un texte et ne doivent pas être tentés sur la foi d'un module de lecture. Le secourisme et la RCR certifiés s'obtiennent auprès d'un organisme reconnu comme la Croix-Rouge canadienne ou l'Ambulance Saint-Jean, et votre agence assure le suivi de ce certificat et de son expiration séparément de cette formation.\n\nCe que ce module peut faire, c'est empêcher les deux erreurs qui transforment une mauvaise situation en pire : hésiter à appeler à l'aide et tenter un geste hors de sa formation parce que personne d'autre n'est là. Si vous ne retenez qu'une chose : appeler le 911 tôt n'est jamais une mauvaise décision, et aucun employeur ne vous le reprochera.",
      },
      {
        titleEn: "The first sixty seconds",
        titleFr: "Les soixante premières secondes",
        bodyEn:
          "Before anything else, check that the scene is safe for you. A worker who is hurt cannot help anybody, and in a home the hazards are things like fire, smoke, gas, a live electrical wire, a flooded floor, an aggressive person or animal, or a dog that has become protective of its collapsed owner. If the scene is not safe, do not enter or stay — get out, call for help from a safe place, and wait for the services who are equipped for it.\n\nIf the scene is safe, work out quickly how bad it is. Speak to the client and see whether they respond. Look at whether they are breathing, whether there is serious bleeding, whether they can talk to you, and whether anything about them has changed suddenly. You are not making a diagnosis — you are answering one question: does this need an ambulance now?\n\nCall 911 immediately, without waiting to check with anyone, for no response or no normal breathing, serious bleeding that will not stop, chest pain or pressure, sudden trouble breathing, signs of a stroke such as a drooping face, a weak arm or speech that has suddenly changed, a seizure that will not stop or is repeating, a serious burn, a suspected broken hip or a head injury from a fall, or any situation where you simply believe the person's life is at risk. Give the address first, then what you can see, and do not hang up until the dispatcher tells you to.",
        bodyFr:
          "Avant toute chose, vérifiez que les lieux sont sécuritaires pour vous. Un intervenant blessé ne peut aider personne, et à domicile les dangers sont l'incendie, la fumée, le gaz, un fil électrique sous tension, un plancher inondé, une personne ou un animal agressif, ou un chien devenu protecteur envers son maître effondré. Si les lieux ne sont pas sûrs, n'entrez pas et ne restez pas : sortez, appelez à l'aide depuis un endroit sûr et attendez les services équipés pour cela.\n\nSi les lieux sont sûrs, évaluez rapidement la gravité. Parlez au client et voyez s'il réagit. Observez s'il respire, s'il y a une hémorragie importante, s'il peut vous parler et si quelque chose a changé soudainement. Vous ne posez pas de diagnostic — vous répondez à une seule question : faut-il une ambulance maintenant?\n\nAppelez le 911 immédiatement, sans attendre de vérifier auprès de qui que ce soit, en cas d'absence de réaction ou de respiration normale, d'hémorragie grave qui ne s'arrête pas, de douleur ou de pression à la poitrine, de difficulté respiratoire soudaine, de signes d'AVC comme un visage affaissé, un bras faible ou une parole soudainement changée, de convulsions qui ne cessent pas ou se répètent, de brûlure grave, de fracture de hanche présumée ou de traumatisme crânien après une chute, ou de toute situation où vous croyez simplement que la vie de la personne est en danger. Donnez d'abord l'adresse, puis ce que vous voyez, et ne raccrochez pas avant que le répartiteur vous le dise.",
      },
      {
        titleEn: "Acting within your scope while help is coming",
        titleFr: "Agir dans votre champ de pratique en attendant les secours",
        bodyEn:
          "Once help is on the way, the waiting is part of the job. Stay with the client unless you must leave to make the space safe or to let the ambulance in. Keep them warm and as comfortable as you can, keep talking to them calmly even if they do not seem to hear you, and keep watching for any change so you can tell the paramedics what happened while they were travelling.\n\nStay inside your training. Perform only the interventions you hold a current certificate for. Do not give or adjust any medication, including something that seems harmless — no pain relief, no puffer, no glucose gel — unless doing so is explicitly within your role and the client's plan. Do not offer food or drink to someone who is drowsy, confused, or having trouble speaking or swallowing. And after a fall, do not lift the client: if there is any chance of a hip fracture or a head or spinal injury, moving them can cause serious further harm. Make them comfortable where they are, keep them warm, and wait.\n\nMake the crew's arrival easy. Unlock the door, turn on the outside light, put the dog in another room, clear the hallway, and if someone else is present send them to the street to flag the ambulance. Gather the medication list, the care plan and the health card, and be ready to say plainly what you found, when, what changed and what you did. Then call your agency — but the 911 call always comes first.",
        bodyFr:
          "Une fois les secours en route, l'attente fait partie du travail. Restez avec le client, sauf si vous devez vous éloigner pour sécuriser les lieux ou ouvrir aux ambulanciers. Gardez-le au chaud et aussi confortable que possible, continuez à lui parler calmement même s'il ne semble pas vous entendre, et surveillez tout changement afin de pouvoir raconter aux ambulanciers ce qui s'est passé pendant leur trajet.\n\nRestez dans les limites de votre formation. N'effectuez que les interventions pour lesquelles vous détenez un certificat valide. N'administrez ni n'ajustez aucun médicament, même s'il paraît anodin — ni analgésique, ni pompe, ni gel de glucose —, sauf si cela relève explicitement de votre rôle et du plan du client. N'offrez ni nourriture ni boisson à une personne somnolente, confuse ou ayant de la difficulté à parler ou à avaler. Et après une chute, ne soulevez pas le client : s'il existe la moindre possibilité de fracture de la hanche ou de traumatisme crânien ou vertébral, le déplacer peut aggraver gravement la situation. Installez-le confortablement là où il est, gardez-le au chaud et attendez.\n\nFacilitez l'arrivée de l'équipe. Déverrouillez la porte, allumez la lumière extérieure, mettez le chien dans une autre pièce, dégagez le couloir et, si une autre personne est présente, envoyez-la à la rue pour signaler l'ambulance. Rassemblez la liste de médicaments, le plan de soins et la carte d'assurance maladie, et soyez prêt à dire clairement ce que vous avez trouvé, à quel moment, ce qui a changé et ce que vous avez fait. Appelez ensuite votre agence — mais l'appel au 911 passe toujours en premier.",
      },
      {
        titleEn: "Afterwards: reporting and looking after yourself",
        titleFr: "Après : signaler et prendre soin de soi",
        bodyEn:
          "When the emergency is over, the record still has to be made. Contact your agency as soon as the immediate situation allows and give them the facts: what you found, the time, what you did, who you called, when the ambulance arrived and where the client went. Complete an incident report as well as your care note, within your agency's timeframe, and write only what you saw and did — not what you think caused it.\n\nWrite it while it is fresh. Emergencies compress and rearrange in memory within hours, and this is exactly the record most likely to be read closely later. Keep it factual and specific about times, and note who else was present and what they were told.\n\nThen look after yourself. Being alone with a collapsed or dying client is genuinely distressing, and reacting to it afterwards is not weakness or a sign you handled it badly. Shaking, poor sleep, replaying the scene and dreading the next visit are ordinary responses. Tell your supervisor how you are doing, ask what support your agency offers, and use it. Agencies would far rather hear that a worker needs support than lose an experienced person who carried an event alone.",
        bodyFr:
          "Une fois l'urgence passée, il reste à constituer le dossier. Communiquez avec votre agence dès que la situation immédiate le permet et donnez les faits : ce que vous avez trouvé, l'heure, ce que vous avez fait, qui vous avez appelé, l'heure d'arrivée de l'ambulance et la destination du client. Remplissez une déclaration d'incident en plus de votre note de soins, dans le délai fixé par votre agence, et n'écrivez que ce que vous avez vu et fait — non ce que vous croyez en être la cause.\n\nÉcrivez pendant que c'est frais. Les urgences se compriment et se réorganisent dans la mémoire en quelques heures, et c'est précisément le dossier le plus susceptible d'être lu attentivement plus tard. Restez factuel et précis sur les heures, et notez qui d'autre était présent et ce qui lui a été dit.\n\nEnsuite, prenez soin de vous. Se retrouver seul avec un client effondré ou mourant est réellement bouleversant, et y réagir après coup n'est ni une faiblesse ni le signe que vous vous en êtes mal tiré. Tremblements, sommeil perturbé, scène qui repasse en boucle et appréhension de la prochaine visite sont des réactions ordinaires. Dites à votre superviseur comment vous allez, demandez quel soutien votre agence offre, et utilisez-le. Les agences préfèrent de loin apprendre qu'un intervenant a besoin de soutien plutôt que de perdre une personne d'expérience qui a porté seule un tel événement.",
      },
    ],
    questions: [
      {
        promptEn:
          "You arrive to find your client on the floor, confused, complaining of hip pain. What should you do?",
        promptFr:
          "Vous arrivez et trouvez votre client au sol, confus, se plaignant d'une douleur à la hanche. Que devez-vous faire?",
        choicesEn: [
          "Lift him back into his chair, then call the agency",
          "Leave him where he is, keep him warm and comfortable, call 911, then notify your agency",
          "Give him a painkiller from the cupboard and wait",
          "Call the family first and follow their instruction",
        ],
        choicesFr: [
          "Le remettre dans son fauteuil, puis appeler l'agence",
          "Le laisser où il est, le garder au chaud et confortable, appeler le 911, puis aviser votre agence",
          "Lui donner un analgésique de l'armoire et attendre",
          "Appeler d'abord la famille et suivre ses instructions",
        ],
        correctIdx: [1],
        explainEn:
          "Hip pain plus confusion after a fall could mean a fracture or head injury. Do not lift. Call 911 first, then the agency — and never give medication outside your role.",
        explainFr:
          "Une douleur à la hanche avec confusion après une chute peut signaler une fracture ou un traumatisme crânien. Ne le soulevez pas. Appelez d'abord le 911, puis l'agence — et n'administrez jamais de médicament hors de votre rôle.",
      },
      {
        promptEn:
          "What is the very first thing to check when you walk into a possible emergency?",
        promptFr:
          "Quelle est la toute première chose à vérifier en entrant dans une situation d'urgence possible?",
        choicesEn: [
          "Whether the scene is safe for you",
          "The client's medication list",
          "Whether the care plan covers this",
          "Whether the family has been told",
        ],
        choicesFr: [
          "Si les lieux sont sécuritaires pour vous",
          "La liste des médicaments du client",
          "Si le plan de soins couvre cette situation",
          "Si la famille a été avisée",
        ],
        correctIdx: [0],
        explainEn:
          "Scene safety comes first every time. A worker who is hurt cannot help anyone — if it is not safe, get out and call from a safe place.",
        explainFr:
          "La sécurité des lieux passe toujours en premier. Un intervenant blessé ne peut aider personne — si ce n'est pas sûr, sortez et appelez d'un endroit sûr.",
      },
      {
        promptEn:
          "Which of these mean you call 911 immediately, without checking with anyone first? (Select all that apply)",
        promptFr:
          "Lesquels de ces signes exigent d'appeler le 911 immédiatement, sans vérifier auprès de qui que ce soit? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "The client is not responding or is not breathing normally",
          "A suddenly drooping face and speech that has changed",
          "The client asks for a second cup of tea",
          "Chest pain or pressure",
        ],
        choicesFr: [
          "Le client ne réagit pas ou ne respire pas normalement",
          "Un visage soudainement affaissé et une parole modifiée",
          "Le client demande une deuxième tasse de thé",
          "Une douleur ou une pression à la poitrine",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Unresponsiveness, stroke signs and chest pain are all immediate 911 calls. Calling early is never the wrong call.",
        explainFr:
          "L'absence de réaction, les signes d'AVC et la douleur thoracique justifient tous un appel immédiat au 911. Appeler tôt n'est jamais une erreur.",
      },
      {
        promptEn:
          "This module qualifies you to perform first aid and CPR when you are alone with a client.",
        promptFr:
          "Ce module vous qualifie pour administrer les premiers soins et la RCR lorsque vous êtes seul avec un client.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. This module covers decisions and escalation only. First Aid and CPR must be certified by a recognised provider and are tracked as a separate credential.",
        explainFr:
          "Faux. Ce module ne couvre que les décisions et le signalement. Le secourisme et la RCR doivent être certifiés par un organisme reconnu et sont suivis comme un titre distinct.",
      },
    ],
  },

  // ── 18. WHMIS 2015 in the Client's Home ──────────────────────────────
  {
    slug: "whmis-2015-home-care",
    titleEn: "WHMIS 2015 Awareness for Home Care",
    titleFr: "Sensibilisation au SIMDUT 2015 pour les soins à domicile",
    descriptionEn:
      "General WHMIS awareness for workers who handle cleaning and chemical products in clients' homes — pictograms, labels, safety data sheets, and why this module is only half of what the law requires.",
    descriptionFr:
      "Sensibilisation générale au SIMDUT pour le personnel manipulant des produits de nettoyage et des produits chimiques au domicile des clients — pictogrammes, étiquettes, fiches de données de sécurité, et pourquoi ce module ne représente que la moitié de ce qu'exige la loi.",
    durationMin: 25,
    passMark: 80,
    citations: [CCOHS_WHMIS_ED, CCOHS_WHMIS_COURSE],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "An OHS-competent reviewer must confirm the awareness content and, more importantly, confirm the positioning: this module covers the transferable EDUCATION half only. It cannot satisfy the employer's workplace- and product-specific TRAINING duty, which by law must be delivered by the agency for the actual products in use.",
      blocker:
        "POSITIONING DECISION REQUIRED BEFORE PROMOTION. Unlike everything else in this library, WHMIS education/training is a genuine legal duty in every Canadian jurisdiction - so a starter module carries a real risk of an agency ticking it off as done. Recommendation (see docs/CONTENT_SOURCE_NOTES.md): treat CCOHS's own certificated 'WHMIS for Workers' course (CAD $19.95/seat) as the credential of record, tracked externally via StaffCertification (Seam 3) like First Aid/CPR, and keep this module as pre-course awareness and annual refresher only. Copyright is NOT the constraint - CCOHS terms bar reproducing their text, which this module does not do; the regulatory duty is.",
    },
    lessons: [
      {
        titleEn: "Why WHMIS applies in someone's home",
        titleFr: "Pourquoi le SIMDUT s'applique au domicile d'une personne",
        bodyEn:
          "WHMIS — the Workplace Hazardous Materials Information System — is Canada's national system for telling workers what hazardous products they are handling and how to handle them safely. It runs on three parts working together: labels on the container, safety data sheets giving the detail, and education and training for the worker.\n\nIt applies to you because a client's home is your workplace. Home-support work involves bleach, oven and drain cleaners, disinfectants, ammonia-based products, and sometimes oxygen or other compressed gases — and unlike a facility, you meet whatever the household happens to have bought, stored under a sink for years, or decanted into an unlabelled bottle.\n\nOne genuine limit is worth being clear about. WHMIS supplier labelling applies to hazardous products sold for workplace use, and ordinary consumer products bought at a grocery store are labelled under different consumer rules instead. That distinction changes the paperwork, not the chemistry: a consumer bleach can still burn your eyes and still produces a toxic gas if mixed with an acidic cleaner. Your agency should tell you which products it expects you to use and how to handle them safely, whichever labelling regime they fall under.",
        bodyFr:
          "Le SIMDUT — Système d'information sur les matières dangereuses utilisées au travail — est le système national canadien qui informe les travailleurs des produits dangereux qu'ils manipulent et de la façon de les manipuler en sécurité. Il repose sur trois éléments qui fonctionnent ensemble : les étiquettes sur le contenant, les fiches de données de sécurité qui donnent le détail, et l'éducation et la formation du travailleur.\n\nIl s'applique à vous parce que le domicile d'un client est votre lieu de travail. Le soutien à domicile met en jeu de l'eau de Javel, des nettoyants à four et à drain, des désinfectants, des produits à base d'ammoniaque et parfois de l'oxygène ou d'autres gaz comprimés — et, contrairement à un établissement, vous croisez ce que le ménage a acheté, entreposé sous un évier depuis des années ou transvidé dans une bouteille non étiquetée.\n\nUne limite réelle mérite d'être précisée. L'étiquetage du fournisseur SIMDUT vise les produits dangereux vendus pour un usage en milieu de travail, tandis que les produits de consommation courants achetés à l'épicerie sont étiquetés selon d'autres règles. Cette distinction change la paperasse, pas la chimie : une eau de Javel domestique peut toujours vous brûler les yeux et dégage toujours un gaz toxique si on la mélange à un nettoyant acide. Votre agence devrait vous indiquer quels produits elle attend que vous utilisiez et comment les manipuler en sécurité, quel que soit le régime d'étiquetage.",
      },
      {
        titleEn: "Pictograms and labels",
        titleFr: "Pictogrammes et étiquettes",
        bodyEn:
          "WHMIS pictograms are the fast warning: a black symbol inside a red diamond border. The ones you are most likely to meet in home care are the corrosion symbol, for products that burn skin, eyes or metal, such as oven and drain cleaners; the exclamation mark, for irritants and less severe hazards; the flame, for anything that catches fire easily, including many aerosols and alcohol-based products; the skull and crossbones, for acutely toxic products; the gas cylinder, for compressed gases such as oxygen; and the health-hazard symbol, for longer-term effects like organ damage or respiratory sensitisation.\n\nA supplier label carries more than the pictogram. It also gives the product identifier, a signal word — \"Danger\" for the more severe hazards and \"Warning\" for the less severe — hazard statements describing what the product can do, precautionary statements telling you how to work with it and what to do if something goes wrong, and the supplier's information. Read the precautionary statements before the first use, not after an incident.\n\nWorkplace labels come into it when a product is transferred into a different container. The practical rule for home care is simpler than the regulation: if a container is not labelled, you do not know what is in it, so you do not use it. An unlabelled spray bottle under a client's sink is not a mystery to solve on your own — ask, and if nobody knows, report it rather than testing it.",
        bodyFr:
          "Les pictogrammes SIMDUT sont l'avertissement rapide : un symbole noir dans un losange bordé de rouge. Ceux que vous rencontrerez le plus souvent en soins à domicile sont le symbole de corrosion, pour les produits qui brûlent la peau, les yeux ou le métal, comme les nettoyants à four et à drain; le point d'exclamation, pour les irritants et les dangers moins graves; la flamme, pour tout ce qui s'enflamme facilement, y compris de nombreux aérosols et produits à base d'alcool; la tête de mort, pour les produits à toxicité aiguë; la bonbonne de gaz, pour les gaz comprimés comme l'oxygène; et le symbole de danger pour la santé, pour les effets à plus long terme comme les atteintes aux organes ou la sensibilisation respiratoire.\n\nUne étiquette du fournisseur contient plus que le pictogramme. Elle donne aussi l'identificateur du produit, une mention d'avertissement — « Danger » pour les dangers les plus graves et « Attention » pour les moins graves —, des mentions de danger décrivant ce que le produit peut faire, des conseils de prudence indiquant comment travailler avec lui et quoi faire en cas de problème, ainsi que les coordonnées du fournisseur. Lisez les conseils de prudence avant la première utilisation, non après un incident.\n\nLes étiquettes de lieu de travail interviennent lorsqu'un produit est transvidé dans un autre contenant. La règle pratique en soins à domicile est plus simple que le règlement : si un contenant n'est pas étiqueté, vous ne savez pas ce qu'il contient, donc vous ne l'utilisez pas. Un vaporisateur non étiqueté sous l'évier d'un client n'est pas une énigme à résoudre seul — demandez, et si personne ne sait, signalez-le plutôt que de faire un essai.",
      },
      {
        titleEn: "Safety data sheets and safe practice",
        titleFr: "Fiches de données de sécurité et pratiques sécuritaires",
        bodyEn:
          "A safety data sheet is the long version of the label, in a standard sixteen-section order so you can find the same information in the same place on any product. In practice you will use a handful of sections: first-aid measures, handling and storage, exposure controls and personal protection, and the hazard identification near the top. Your employer must make the sheets available for the hazardous products you are required to use, and you are entitled to see them — ask your supervisor where they live.\n\nDay to day, most of your protection comes from a few habits. Use the least hazardous product that will do the job. Ventilate — open a window, run the fan, and don't work with strong cleaners in a closed bathroom. Wear the gloves or eye protection the label calls for. Never decant into a food or drink container, and never mix products: bleach with ammonia, or bleach with an acidic cleaner, produces toxic gas, and this happens in real bathrooms with ordinary supermarket bottles.\n\nWhen something goes wrong, act on the label and then report. Rinse skin or eyes immediately and for as long as the label says. Get out and get fresh air if fumes are affecting you. For a spill, ventilate and keep people away rather than improvising a clean-up of something you cannot identify. Call the poison centre or 911 if anyone is unwell, and tell your agency every time, including near misses — a wrongly stored chemical in one client's home is a hazard for the next worker too.",
        bodyFr:
          "Une fiche de données de sécurité est la version longue de l'étiquette, présentée dans un ordre normalisé de seize sections afin que vous trouviez la même information au même endroit pour tout produit. En pratique, vous utiliserez quelques sections : premiers soins, manutention et stockage, contrôles de l'exposition et protection individuelle, et l'identification des dangers près du début. Votre employeur doit rendre les fiches accessibles pour les produits dangereux que vous devez utiliser, et vous avez le droit de les consulter — demandez à votre superviseur où elles se trouvent.\n\nAu quotidien, votre protection tient surtout à quelques habitudes. Utilisez le produit le moins dangereux qui fera le travail. Ventilez : ouvrez une fenêtre, faites fonctionner le ventilateur et ne travaillez pas avec des nettoyants puissants dans une salle de bain fermée. Portez les gants ou la protection oculaire exigés par l'étiquette. Ne transvidez jamais dans un contenant à aliments ou à boissons, et ne mélangez jamais les produits : l'eau de Javel avec de l'ammoniaque, ou avec un nettoyant acide, dégage un gaz toxique, et cela se produit dans de vraies salles de bain avec des bouteilles ordinaires du supermarché.\n\nEn cas de problème, agissez selon l'étiquette, puis signalez. Rincez la peau ou les yeux immédiatement et aussi longtemps que l'indique l'étiquette. Sortez prendre l'air si des vapeurs vous incommodent. En cas de déversement, ventilez et éloignez les gens plutôt que d'improviser le nettoyage d'un produit que vous ne pouvez pas identifier. Appelez le centre antipoison ou le 911 si quelqu'un se sent mal, et avisez votre agence chaque fois, y compris pour les quasi-accidents — un produit chimique mal rangé chez un client est aussi un danger pour le prochain intervenant.",
      },
      {
        titleEn: "What this module does not cover",
        titleFr: "Ce que ce module ne couvre pas",
        bodyEn:
          "Read this lesson carefully, because it is the one that keeps your agency out of trouble. Every Canadian jurisdiction requires an employer to provide a WHMIS programme with two distinct halves. The first is education: the general, transferable knowledge of how the system works — pictograms, labels, safety data sheets — which is what this module gives you. The second is training: the site- and job-specific instruction covering the actual products you will use, how to store, handle and dispose of them here, what personal protective equipment to use, and what to do about a spill or an emergency in this particular workplace.\n\nThis module delivers the first half only. It cannot deliver the second, because a generic module cannot know what is under a particular client's sink. Completing it does not make anyone WHMIS-trained, and an agency that treats it as the whole requirement has not met its legal duty.\n\nSo treat this as awareness and refresher content, and get the rest from where it belongs. Your agency must give you product-specific instruction for the products it asks you to use, and must review its programme at least annually or whenever products, processes or hazard information change. Where your agency wants an independently certificated course, CCOHS runs its own WHMIS for Workers course that issues a certificate of completion; that certificate is recorded like First Aid or CPR — as an external credential with an expiry date — rather than being replaced by this module.",
        bodyFr:
          "Lisez cette leçon attentivement, car c'est celle qui protège votre agence. Toutes les autorités canadiennes exigent que l'employeur offre un programme SIMDUT comportant deux volets distincts. Le premier est l'éducation : la connaissance générale et transférable du fonctionnement du système — pictogrammes, étiquettes, fiches de données de sécurité —, soit ce que ce module vous donne. Le second est la formation : les directives propres au lieu et à l'emploi, portant sur les produits réellement utilisés, leur entreposage, leur manipulation et leur élimination ici, l'équipement de protection à porter et la conduite à tenir en cas de déversement ou d'urgence dans ce milieu précis.\n\nCe module ne livre que le premier volet. Il ne peut livrer le second, car un module générique ne peut pas savoir ce qui se trouve sous l'évier d'un client donné. Le réussir ne rend personne « formé SIMDUT », et une agence qui y verrait l'ensemble de l'exigence n'aurait pas rempli son obligation légale.\n\nConsidérez donc ceci comme du contenu de sensibilisation et de rappel, et obtenez le reste là où il se trouve. Votre agence doit vous donner des directives propres aux produits qu'elle vous demande d'utiliser et doit revoir son programme au moins une fois par année ou chaque fois que les produits, les procédés ou l'information sur les dangers changent. Si votre agence souhaite un cours certifié de façon indépendante, le CCHST offre son propre cours SIMDUT pour les travailleurs, qui délivre une attestation de réussite; cette attestation est consignée comme le secourisme ou la RCR — un titre externe avec date d'expiration — plutôt que remplacée par ce module.",
      },
    ],
    questions: [
      {
        promptEn:
          "You find an unlabelled spray bottle under a client's sink. What should you do?",
        promptFr:
          "Vous trouvez un vaporisateur non étiqueté sous l'évier d'un client. Que devez-vous faire?",
        choicesEn: [
          "Smell it to work out what it is",
          "Use it for general cleaning — it is probably just water and soap",
          "Do not use it; ask, and report it if nobody can identify it",
          "Pour it out and reuse the bottle",
        ],
        choicesFr: [
          "Le sentir pour deviner ce que c'est",
          "L'utiliser pour le ménage général — c'est probablement de l'eau savonneuse",
          "Ne pas l'utiliser; demander, et le signaler si personne ne peut l'identifier",
          "Le vider et réutiliser la bouteille",
        ],
        correctIdx: [2],
        explainEn:
          "If a container is not labelled you do not know what is in it, so you do not use it. Smelling or testing an unknown chemical is how people get hurt.",
        explainFr:
          "Si un contenant n'est pas étiqueté, vous ne savez pas ce qu'il contient : ne l'utilisez pas. Sentir ou tester un produit inconnu est une façon de se blesser.",
      },
      {
        promptEn:
          "Which WHMIS pictogram would you expect on a strong oven or drain cleaner?",
        promptFr:
          "Quel pictogramme SIMDUT vous attendez-vous à voir sur un nettoyant à four ou à drain puissant?",
        choicesEn: [
          "The corrosion symbol",
          "The gas cylinder",
          "The environment symbol",
          "The biohazard symbol",
        ],
        choicesFr: [
          "Le symbole de corrosion",
          "La bonbonne de gaz",
          "Le symbole environnemental",
          "Le symbole de risque biologique",
        ],
        correctIdx: [0],
        explainEn:
          "Corrosive products burn skin, eyes and metal. Oven and drain cleaners are the classic home-care example.",
        explainFr:
          "Les produits corrosifs brûlent la peau, les yeux et le métal. Les nettoyants à four et à drain en sont l'exemple classique en soins à domicile.",
      },
      {
        promptEn:
          "Completing this module makes you fully WHMIS-trained for your agency.",
        promptFr:
          "Réussir ce module fait de vous une personne pleinement formée au SIMDUT pour votre agence.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. This is the general education half only. The law also requires workplace- and product-specific training, which your agency must deliver for the products you actually use.",
        explainFr:
          "Faux. Ceci n'est que le volet éducation générale. La loi exige aussi une formation propre au lieu de travail et aux produits, que votre agence doit donner pour les produits réellement utilisés.",
      },
      {
        promptEn:
          "Which of these are safe practice when cleaning in a client's home? (Select all that apply)",
        promptFr:
          "Lesquelles de ces pratiques sont sécuritaires lors du ménage au domicile d'un client? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Ventilating the room while using strong cleaners",
          "Mixing bleach with an ammonia-based cleaner for extra strength",
          "Wearing the gloves or eye protection the label calls for",
          "Reporting a chemical spill to your agency even if nobody was hurt",
        ],
        choicesFr: [
          "Ventiler la pièce pendant l'utilisation de nettoyants puissants",
          "Mélanger de l'eau de Javel et un nettoyant ammoniaqué pour plus d'efficacité",
          "Porter les gants ou la protection oculaire exigés par l'étiquette",
          "Signaler un déversement chimique à votre agence même si personne n'a été blessé",
        ],
        correctIdx: [0, 2, 3],
        explainEn:
          "Never mix bleach with ammonia or acidic cleaners — it produces toxic gas. The other three are core safe practice.",
        explainFr:
          "Ne mélangez jamais l'eau de Javel avec de l'ammoniaque ou des nettoyants acides — cela dégage un gaz toxique. Les trois autres sont des pratiques sécuritaires de base.",
      },
    ],
  },

  // ── 19. NS CCA Certification Prep (province-scoped: NS) ──────────────
  {
    slug: "ns-cca-certification-prep",
    titleEn: "Nova Scotia CCA Competency Prep & Continuing Education",
    titleFr:
      "Préparation aux compétences d'ASC de la Nouvelle-Écosse et formation continue",
    descriptionEn:
      "Exam-prep and continuing-education review built against the competency list in Nova Scotia's CCA Scope of Practice & Competency Framework. This is preparation and CE only — it is not the CCA credential and does not lead to certification.",
    descriptionFr:
      "Révision de préparation à l'examen et de formation continue construite à partir de la liste de compétences du cadre de champ de pratique et de compétences des ASC de la Nouvelle-Écosse. Il s'agit uniquement de préparation et de formation continue — ce n'est pas le titre d'ASC et cela ne mène pas à la certification.",
    durationMin: 60,
    passMark: 80,
    jurisdiction: "NS",
    citations: [NS_CCA],
    review: {
      notice: STARTER_NOTICE,
      enProvenance: "SOURCED",
      frStatus: FR_MACHINE_DRAFT,
      smeNeeds:
        "Must be reviewed by someone who knows the CCA certification process. Each lesson is written to trace to a named competency in the May 2019 framework - a reviewer should verify that mapping is faithful and that the framework has not been superseded. The framework is 'All Rights Reserved' NS DHW, so competency NAMES are referenced and everything else is paraphrased; nothing is reproduced.",
      blocker:
        "POSITIONING IS LOAD-BEARING (B0 Finding 2). Maple Care is NOT a licensed CCA education provider and an Academy certificate is NEVER CCA certification, which is issued on completion of a program at a licensed education provider plus the provincial CCA Certification Exam (with recognized-prior-learning routes). Lesson 1 states this and it must not be edited out or softened in marketing.",
    },
    lessons: [
      {
        titleEn: "What this track is — and what it is not",
        titleFr: "Ce qu'est ce parcours — et ce qu'il n'est pas",
        bodyEn:
          "In Nova Scotia, the Continuing Care Assistant is a real certified occupation. Certification comes from completing a CCA program at a licensed education provider and passing the provincial CCA Certification Exam, with recognition-of-prior-learning routes available for people who already have relevant experience or credentials. Licensed facilities and publicly funded home-care agencies hire against that certification.\n\nThis track is not that. It is study and review material organised around the competency list published in the province's CCA Scope of Practice & Competency Framework, intended for two audiences: people preparing for the exam who want a structured self-check, and certified CCAs doing continuing education. Completing it earns an Academy completion record — never a CCA certificate, and nothing here shortens or substitutes for any part of the certification process.\n\nIf you are working toward certification, use this alongside your program, not instead of it, and let your education provider and the CCA Program be your authority on requirements, eligibility and the exam. If you are already certified, use it as a refresher against the competencies you are expected to hold. Either way, your Nova Scotia employer records your actual CCA certification separately from anything you complete here.",
        bodyFr:
          "En Nouvelle-Écosse, l'assistant en soins continus est une profession réellement certifiée. La certification s'obtient en terminant un programme d'ASC auprès d'un établissement d'enseignement agréé et en réussissant l'examen provincial de certification des ASC, avec des voies de reconnaissance des acquis pour les personnes possédant déjà une expérience ou des titres pertinents. Les établissements agréés et les agences de soins à domicile financées par l'État embauchent en fonction de cette certification.\n\nCe parcours n'est pas cela. Il s'agit de matériel d'étude et de révision organisé autour de la liste de compétences publiée dans le cadre provincial de champ de pratique et de compétences des ASC, destiné à deux publics : les personnes qui préparent l'examen et souhaitent une autoévaluation structurée, et les ASC certifiés qui font de la formation continue. Le terminer donne une attestation de réussite de l'Academy — jamais un certificat d'ASC —, et rien ici n'abrège ni ne remplace une quelconque partie du processus de certification.\n\nSi vous visez la certification, utilisez ceci en complément de votre programme et non à sa place, et laissez votre établissement d'enseignement et le programme d'ASC faire autorité sur les exigences, l'admissibilité et l'examen. Si vous êtes déjà certifié, servez-vous-en comme rappel des compétences que vous devez posséder. Dans les deux cas, votre employeur néo-écossais consigne votre certification d'ASC réelle séparément de tout ce que vous terminez ici.",
      },
      {
        titleEn: "Scope of practice: independent, assigned, delegated",
        titleFr: "Champ de pratique : autonome, assigné, délégué",
        bodyEn:
          "The framework describes CCA work as falling into three bands, and knowing which band a task sits in is the single most examinable idea in the whole document. Independent functions are the routine activities of daily living and instrumental activities — mobility, personal care, homemaking — that a CCA carries out on their own according to the established plan of care.\n\nA client-specific assignment is a step beyond that. It covers non-routine activities that are still within a CCA's educational preparation, such as more complex personal care, ostomy care or range-of-motion exercise. These require a comprehensive clinical assessment and a client-specific care plan developed by a regulated health professional, the tasks must be employer-approved, and the CCA is appropriately supervised. Delegation is different again: the intervention sits outside a CCA's educational preparation but within the scope of employment — a dressing change is the framework's own example — and is delegated by a regulated health professional for that specific client and situation. A delegated task is not transferable to another client just because it looks the same.\n\nThe limitations are stated plainly and are worth memorising: a CCA does not act outside their scope of practice, their scope of employment, or the employer's policies and procedures; a CCA contacts the relevant health-care provider when a client needs an intervention beyond the CCA scope; and a CCA works under the direction and supervision of a regulated health professional when performing an assigned or delegated function.",
        bodyFr:
          "Le cadre décrit le travail de l'ASC en trois volets, et savoir dans quel volet se situe une tâche est l'idée la plus susceptible d'être évaluée de tout le document. Les fonctions autonomes sont les activités courantes de la vie quotidienne et domestique — mobilité, soins personnels, entretien ménager — que l'ASC exécute seul selon le plan de soins établi.\n\nUne assignation propre au client va plus loin. Elle vise des activités non courantes qui demeurent dans la préparation scolaire de l'ASC, comme des soins personnels plus complexes, les soins de stomie ou les exercices d'amplitude articulaire. Elles exigent une évaluation clinique complète et un plan de soins propre au client élaboré par un professionnel de la santé réglementé, les tâches doivent être approuvées par l'employeur et l'ASC est supervisé adéquatement. La délégation est encore autre chose : l'intervention se situe hors de la préparation scolaire de l'ASC mais à l'intérieur du champ d'emploi — le cadre donne l'exemple d'un changement de pansement — et elle est déléguée par un professionnel de la santé réglementé pour ce client et cette situation précis. Une tâche déléguée n'est pas transférable à un autre client sous prétexte qu'elle paraît identique.\n\nLes limites sont énoncées clairement et méritent d'être mémorisées : l'ASC n'agit pas hors de son champ de pratique, de son champ d'emploi ou des politiques et procédures de l'employeur; l'ASC communique avec le professionnel de la santé compétent lorsqu'un client a besoin d'une intervention dépassant le champ de l'ASC; et l'ASC travaille sous la direction et la supervision d'un professionnel réglementé lorsqu'il exécute une fonction assignée ou déléguée.",
      },
      {
        titleEn: "Foundational competencies: integrity and accountability",
        titleFr: "Compétences fondamentales : intégrité et responsabilisation",
        bodyEn:
          "The framework puts two foundational competencies underneath everything else, describing them as the fundamental professional requirements for providing person-centred care. Integrity is about earning trust through consistent professionalism: conducting yourself honestly, respectfully and caringly in every interaction and every mode of communication, protecting confidentiality in the care setting including when technology is involved, providing non-judgemental and equitable care that respects the client's situation, beliefs and preferences, understanding and maintaining professional boundaries, and working as a genuine team member.\n\nAccountability is about owning your decisions, your actions, and the quality and timeliness of your work. The behaviours named include assessing risk to yourself and the client before delivering care and applying safe work practices; identifying, reporting, documenting and addressing safety concerns; asking questions and seeking guidance rather than guessing; problem-solving with critical thinking; communicating appropriately in speech, writing and non-verbally; adapting to change; managing time and stress; and pursuing continuous learning.\n\nFor exam preparation, notice that these are written as observable behaviours rather than attitudes. A question about integrity or accountability will usually describe a situation and ask what you did, not how you felt. The strongest answer is almost always the one that involves recognising a limit, seeking guidance, and documenting and reporting — rather than the one where a well-meaning worker handles it alone.",
        bodyFr:
          "Le cadre place deux compétences fondamentales sous toutes les autres, les décrivant comme les exigences professionnelles de base pour offrir des soins centrés sur la personne. L'intégrité consiste à gagner la confiance par un professionnalisme constant : se conduire avec honnêteté, respect et bienveillance dans chaque interaction et chaque mode de communication, protéger la confidentialité dans le milieu de soins, y compris avec la technologie, offrir des soins équitables et sans jugement qui respectent la situation, les croyances et les préférences du client, comprendre et maintenir les limites professionnelles, et être un véritable membre de l'équipe.\n\nLa responsabilisation consiste à assumer ses décisions, ses actions ainsi que la qualité et la ponctualité de son travail. Les comportements nommés comprennent l'évaluation du risque pour soi et pour le client avant de donner des soins et l'application de méthodes de travail sécuritaires; le repérage, le signalement, la documentation et la prise en charge des préoccupations de sécurité; le fait de poser des questions et de demander conseil plutôt que de deviner; la résolution de problèmes par la pensée critique; une communication appropriée à l'oral, à l'écrit et non verbalement; l'adaptation au changement; la gestion du temps et du stress; et la poursuite d'un apprentissage continu.\n\nPour la préparation à l'examen, remarquez que ces compétences sont formulées comme des comportements observables plutôt que comme des attitudes. Une question sur l'intégrité ou la responsabilisation décrira habituellement une situation et demandera ce que vous avez fait, non ce que vous avez ressenti. La meilleure réponse est presque toujours celle qui consiste à reconnaître une limite, à demander conseil, puis à documenter et à signaler — plutôt que celle où un intervenant bien intentionné se débrouille seul.",
      },
      {
        titleEn: "Core competencies: care setting management and nutrition",
        titleFr:
          "Compétences essentielles : gestion du milieu de soins et nutrition",
        bodyEn:
          "Care setting management is the framework's name for the housekeeping side of the role, and it is framed as safety work rather than chores. Using sound time management, the CCA maintains a clean, safe environment for the client, the family and the care team, in line with the care plan, occupational health and safety legislation, and the setting's policies. The behaviours named are providing a restful and comforting environment, respecting the client's dignity and preferences while considering everyone's safety, meeting each client's household needs efficiently, and applying appropriate cleaning strategies and techniques.\n\nNutrition covers supporting the client's wellness through food, according to the care plan, Canada's Food Guide and the setting's policies, while respecting culture, religion, dietary restrictions, sensitivities and preferences. The listed behaviours run from planning, preparing, cooking and serving meals and snacks that meet person-specific needs, through positioning the client safely to eat, providing partial or complete feeding assistance and helping with adaptive feeding devices, to applying food-safety principles when preparing and serving, and storing food properly including packaging and dating.\n\nA useful way to revise both is to ask what makes each one a competency rather than a task. In each case it is the judgement attached: choosing the cleaning approach that suits this home and this client's preferences without creating a hazard, or recognising that a client is positioned unsafely to eat, or noticing that intake has dropped. The tasks are visible; the competency is the decision behind them.",
        bodyFr:
          "La gestion du milieu de soins est le nom que le cadre donne au volet entretien ménager du rôle, et il est présenté comme un travail de sécurité plutôt que comme des corvées. En employant une bonne gestion du temps, l'ASC maintient un environnement propre et sécuritaire pour le client, la famille et l'équipe de soins, conformément au plan de soins, à la législation en santé et sécurité au travail et aux politiques du milieu. Les comportements nommés sont : offrir un environnement reposant et réconfortant, respecter la dignité et les préférences du client tout en tenant compte de la sécurité de tous, répondre efficacement aux besoins domestiques de chaque client, et appliquer des stratégies et techniques de nettoyage appropriées.\n\nLa nutrition vise le soutien du bien-être du client par l'alimentation, selon le plan de soins, le Guide alimentaire canadien et les politiques du milieu, dans le respect de la culture, de la religion, des restrictions alimentaires, des sensibilités et des préférences. Les comportements énumérés vont de la planification, la préparation, la cuisson et le service de repas et de collations répondant à des besoins précis, au positionnement sécuritaire du client pour manger, à l'aide partielle ou complète à l'alimentation et à l'utilisation d'appareils adaptés, jusqu'à l'application des principes de salubrité lors de la préparation et du service et à l'entreposage adéquat des aliments, emballage et datation compris.\n\nUne bonne façon de réviser les deux est de se demander ce qui en fait une compétence plutôt qu'une tâche. Dans chaque cas, c'est le jugement qui s'y rattache : choisir la méthode de nettoyage qui convient à ce domicile et aux préférences de ce client sans créer de danger, ou reconnaître qu'un client est mal positionné pour manger, ou remarquer que les apports ont diminué. Les tâches sont visibles; la compétence est la décision derrière elles.",
      },
      {
        titleEn: "Core competencies: communication and the client record",
        titleFr:
          "Compétences essentielles : communication et dossier du client",
        bodyEn:
          "The communication competency is broader than talking to clients. The framework has the CCA establishing and maintaining supportive relationships and sharing information in the care setting according to policies and procedures, interacting with clients, families and care teams while respecting their unique needs and confidentiality, and maintaining client records according to the principles and legal requirements that govern them.\n\nThe named behaviours are worth reading as a checklist, because several are easy to overlook: maintaining an individualised approach to communication in all situations; collecting data that supports the client assessment; demonstrating person-centred communication with the client, family and team; maintaining confidentiality; responding to and seeking help when a client's condition changes; reporting and documenting changes in behaviour and condition using correct procedures and accepted terminology; communicating appropriately through technology-based applications such as electronic documentation; keeping accurate and clear records of the care provided; contributing to the development and ongoing revision of the client-specific holistic plan of care as part of the collaborative team; documenting care and incidents accurately and in a timely way while working with the client, family and team to address concerns; and documenting efficiently using accepted techniques and medical terminology.\n\nTwo of those deserve emphasis for exam purposes. Contributing to the plan of care makes the CCA an active participant in care planning rather than only an implementer of it. And the pairing of \"report\" with \"document\" recurs throughout the framework: a change in a client's condition is expected to be both told to the right person and written down, and an answer that does only one of the two is usually the wrong answer.",
        bodyFr:
          "La compétence en communication est plus large que le fait de parler aux clients. Le cadre demande à l'ASC d'établir et de maintenir des relations de soutien et de partager l'information dans le milieu de soins selon les politiques et procédures, d'interagir avec les clients, les familles et les équipes en respectant leurs besoins particuliers et la confidentialité, et de tenir les dossiers des clients selon les principes et les exigences légales qui les régissent.\n\nLes comportements nommés méritent d'être lus comme une liste de vérification, car plusieurs s'oublient facilement : maintenir une approche individualisée de la communication en toutes situations; recueillir des données à l'appui de l'évaluation du client; démontrer une communication centrée sur la personne avec le client, la famille et l'équipe; maintenir la confidentialité; réagir et demander de l'aide lorsque l'état d'un client change; signaler et documenter les changements de comportement et d'état selon les procédures correctes et la terminologie reconnue; communiquer adéquatement au moyen d'applications technologiques comme la documentation électronique; tenir des dossiers exacts et clairs des soins fournis; contribuer à l'élaboration et à la révision continue du plan de soins holistique propre au client au sein de l'équipe collaborative; documenter les soins et les incidents avec exactitude et en temps opportun tout en travaillant avec le client, la famille et l'équipe pour répondre aux préoccupations; et documenter efficacement selon des techniques reconnues et la terminologie médicale.\n\nDeux de ces éléments méritent d'être soulignés pour l'examen. Contribuer au plan de soins fait de l'ASC un participant actif à la planification des soins et non seulement un exécutant. Et le couple « signaler » et « documenter » revient tout au long du cadre : un changement dans l'état d'un client doit être à la fois transmis à la bonne personne et consigné, et une réponse qui ne fait que l'un des deux est habituellement la mauvaise.",
      },
      {
        titleEn: "Core competencies: infection prevention and safety protocols",
        titleFr:
          "Compétences essentielles : prévention des infections et protocoles de sécurité",
        bodyEn:
          "Infection prevention and control is stated compactly in the framework: the CCA applies infection prevention and control measures that protect their own safety, the care team's, and that of clients and families, demonstrating knowledge of the relevant guidelines according to legislation and the setting's policies. The two behaviours named distinguish setting-appropriate measures from client-specific measures — that is, the routine practices you use with everyone, and the additional precautions a particular client's situation calls for.\n\nSafety protocols covers environmental security, fire and disaster procedures, and safety precautions relating to the client, yourself and equipment, according to legal requirements and the setting's policies. The CCA is expected to contribute to a safe work environment consistent with legislation such as occupational health and safety, and to promote safety including applying falls-prevention protocols and strategies from the care plan. The behaviours listed are applying OHS principles to maintain a safe environment, assessing when an emergency response may be required, applying emergency protocols, responding to emergencies, and applying effective measures and strategies for maintaining safety — with the framework's own examples being minimising falls, least restraint, potential abuse, and medications.\n\nThat last cluster is a good revision prompt, because it links four things the framework treats as safety questions rather than separate topics. Least restraint in particular sits here and in Safe Handling & Mobility, where the CCA is expected to use restraints appropriately: the expectation is that restraint of any kind — physical, chemical or environmental — is a protocol-governed last resort, not a convenience.",
        bodyFr:
          "La prévention et le contrôle des infections sont énoncés de façon compacte dans le cadre : l'ASC applique des mesures de prévention et de contrôle des infections qui protègent sa propre sécurité, celle de l'équipe de soins et celle des clients et des familles, en démontrant sa connaissance des lignes directrices pertinentes selon la législation et les politiques du milieu. Les deux comportements nommés distinguent les mesures adaptées au milieu des mesures propres au client — c'est-à-dire les pratiques de base employées avec tout le monde et les précautions additionnelles qu'exige la situation d'un client donné.\n\nLes protocoles de sécurité couvrent la sécurité environnementale, les procédures d'incendie et de sinistre, ainsi que les précautions visant le client, vous-même et l'équipement, selon les exigences légales et les politiques du milieu. On attend de l'ASC qu'il contribue à un milieu de travail sécuritaire conforme à la législation, notamment en santé et sécurité au travail, et qu'il promeuve la sécurité, y compris en appliquant les protocoles et stratégies de prévention des chutes prévus au plan de soins. Les comportements énumérés sont : appliquer les principes de SST pour maintenir un milieu sécuritaire, évaluer quand une intervention d'urgence peut être requise, appliquer les protocoles d'urgence, répondre aux urgences, et appliquer des mesures et stratégies efficaces de maintien de la sécurité — les exemples du cadre étant la réduction des chutes, la contention minimale, les mauvais traitements potentiels et les médicaments.\n\nCe dernier groupe est un bon repère de révision, car il relie quatre éléments que le cadre traite comme des questions de sécurité plutôt que comme des sujets distincts. La contention minimale figure ici comme dans la compétence Manutention sécuritaire et mobilité, où l'ASC doit utiliser les contentions de façon appropriée : l'attente est que toute contention — physique, chimique ou environnementale — soit un dernier recours encadré par un protocole, et non une commodité.",
      },
      {
        titleEn: "Core competencies: personal care and safe handling & mobility",
        titleFr:
          "Compétences essentielles : soins personnels et manutention sécuritaire et mobilité",
        bodyEn:
          "Personal care in the framework means providing activities of daily living and instrumental activities that promote the client's wellbeing and safety as well as the safety of the family and care team, in accordance with the care plan and the setting's policies, and applying special procedures and protocols for particular client conditions. The behaviours include assessing the client before care for safety and care concerns such as skin integrity or a change in status; promoting independence by supporting the client's own capacities; providing personal care such as bathing, perineal, hair, oral and nail care and shaving; assisting with elimination needs and incontinence products; supporting dressing and undressing; applying medicated creams, ointments and drops in accordance with the joint practice guidelines; providing support in a palliative situation; providing care such as hearing-aid care, compression garments, and catheter or ostomy care; and assisting with implementing the health-care plan, for example skin inspection and range-of-motion exercises.\n\nSafe handling and mobility asks the CCA to follow positioning and transferring guidelines and apply safe-handling principles, working from a person-specific assessment to assist with ambulation, positioning, transferring and restraint protocol — chemical, environmental and physical — according to the care plan and policies. The behaviours are applying body-mechanics principles, assessing handling and mobility plans for both the client's safety and your own, performing active and passive range-of-motion exercises, positioning the client appropriately with devices such as footboards, pillows and hand rolls, assisting with transfers and ambulation including mobility aids, transferring the client appropriately, applying and promoting prosthetic, orthotic and assistive devices, and using restraints appropriately.\n\nNotice how much of both competencies is assessment before action. The framework repeatedly places a check — of skin, of status, of the handling plan, of your own safety — ahead of the hands-on task. That ordering is the point, and it is a reliable guide when a scenario question offers you an answer that starts with doing.",
        bodyFr:
          "Les soins personnels, dans le cadre, consistent à offrir les activités de la vie quotidienne et domestique qui favorisent le bien-être et la sécurité du client ainsi que la sécurité de la famille et de l'équipe, conformément au plan de soins et aux politiques du milieu, et à appliquer des procédures et protocoles particuliers selon l'état du client. Les comportements comprennent : évaluer le client avant les soins pour repérer les préoccupations de sécurité et de soins, comme l'intégrité de la peau ou un changement d'état; favoriser l'autonomie en soutenant les capacités du client; donner les soins personnels comme le bain, les soins périnéaux, capillaires, buccaux, des ongles et le rasage; aider aux besoins d'élimination et aux produits d'incontinence; soutenir l'habillage et le déshabillage; appliquer crèmes, onguents et gouttes médicamenteux conformément aux lignes directrices de pratique conjointes; offrir du soutien en contexte palliatif; donner des soins tels que l'entretien des prothèses auditives, les vêtements de compression et les soins de sonde ou de stomie; et aider à la mise en œuvre du plan de soins, par exemple l'inspection de la peau et les exercices d'amplitude articulaire.\n\nLa manutention sécuritaire et la mobilité demandent à l'ASC de suivre les lignes directrices de positionnement et de transfert et d'appliquer les principes de manutention sécuritaire, en partant d'une évaluation propre à la personne pour aider à la marche, au positionnement, au transfert et au protocole de contention — chimique, environnementale et physique — selon le plan de soins et les politiques. Les comportements sont : appliquer les principes de mécanique corporelle, évaluer les plans de manutention et de mobilité pour la sécurité du client et la sienne, effectuer des exercices d'amplitude articulaire actifs et passifs, positionner le client adéquatement à l'aide de dispositifs comme les appuis-pieds, les oreillers et les rouleaux de main, aider aux transferts et à la marche y compris avec des aides à la mobilité, transférer le client adéquatement, appliquer et promouvoir les dispositifs prothétiques, orthétiques et d'assistance, et utiliser les contentions de façon appropriée.\n\nRemarquez à quel point ces deux compétences reposent sur l'évaluation avant l'action. Le cadre place à répétition une vérification — de la peau, de l'état, du plan de manutention, de votre propre sécurité — avant la tâche pratique. Cet ordre est précisément l'enjeu, et c'est un guide fiable lorsqu'une question de mise en situation vous propose une réponse qui commence par l'action.",
      },
      {
        titleEn: "Core competency: mental health and wellness",
        titleFr: "Compétence essentielle : santé mentale et mieux-être",
        bodyEn:
          "This is the broadest competency in the framework and the one most likely to be under-revised. It asks the CCA to promote wellness across the lifespan while respecting the spiritual, cultural, moral and ethical values, the psychological needs and the lifestyle of the client, the family and the care team, and to understand how common chronic illnesses affect people physiologically, psychologically, socially, culturally and spiritually.\n\nThe behaviours cover a lot of ground: recognising and reporting changes in social norms such as family dynamics, addictions and abuse; providing care through a generational lens; communicating what community services exist locally, provincially and nationally; reinforcing teaching that promotes wellness, meaningful activity, healthy choices and illness prevention; responding to psychological, cultural and social needs across the lifespan; respecting clients' rights and preferences including cultural, spiritual, moral and ethical beliefs and choices — the framework's own examples are the right to live at risk and comfort measures; applying care strategies that recognise all behaviour has meaning; recognising how a safe and supportive environment shapes the client's response to care, including balancing support against independence; applying health knowledge to disease processes including dementia care, mental health and palliative care; applying both prevention and intervention strategies for responsive behaviours, dementia-related and not; evaluating the client's response to care and preventing injury to self and others; and demonstrating self-care in the promotion of your own wellbeing and safety.\n\nThree of these are worth memorising as phrases because they carry the framework's philosophy. All behaviour has meaning is the stated basis for responding to responsive behaviours. The right to live at risk is named as a client right, which is what makes the dignity-of-risk conversation a competency rather than a personal judgement call. And self-care appears as a listed competency behaviour, not an afterthought — the framework treats a worker's own wellbeing as part of safe practice.",
        bodyFr:
          "Il s'agit de la compétence la plus vaste du cadre et de celle qu'on révise le moins. Elle demande à l'ASC de promouvoir le mieux-être tout au long de la vie en respectant les valeurs spirituelles, culturelles, morales et éthiques, les besoins psychologiques et le mode de vie du client, de la famille et de l'équipe, et de comprendre comment les maladies chroniques courantes touchent les personnes sur les plans physiologique, psychologique, social, culturel et spirituel.\n\nLes comportements couvrent un large terrain : reconnaître et signaler les changements dans les normes sociales, comme la dynamique familiale, les dépendances et les mauvais traitements; offrir des soins dans une perspective générationnelle; faire connaître les services communautaires locaux, provinciaux et nationaux; renforcer l'enseignement favorisant le mieux-être, les activités significatives, les choix sains et la prévention; répondre aux besoins psychologiques, culturels et sociaux à tout âge; respecter les droits et préférences des clients, y compris leurs croyances et choix culturels, spirituels, moraux et éthiques — le cadre donne en exemple le droit de vivre à risque et les mesures de confort; appliquer des stratégies de soins reconnaissant que tout comportement a un sens; reconnaître comment un environnement sécuritaire et soutenant façonne la réponse du client aux soins, notamment en équilibrant soutien et autonomie; appliquer les connaissances en santé aux processus pathologiques, dont les soins de la démence, la santé mentale et les soins palliatifs; appliquer des stratégies de prévention et d'intervention pour les comportements réactifs, liés ou non à la démence; évaluer la réponse du client aux soins et prévenir les blessures à soi et à autrui; et faire preuve d'autosoin dans la promotion de son propre bien-être et de sa sécurité.\n\nTrois de ces éléments méritent d'être mémorisés comme formules, car ils portent la philosophie du cadre. Tout comportement a un sens est la base énoncée de la réponse aux comportements réactifs. Le droit de vivre à risque est nommé comme un droit du client, ce qui fait de la conversation sur la dignité du risque une compétence plutôt qu'un jugement personnel. Et l'autosoin figure comme comportement de compétence, non comme un ajout — le cadre considère le bien-être du travailleur comme faisant partie d'une pratique sécuritaire.",
      },
    ],
    questions: [
      {
        promptEn:
          "Completing this Academy track gives you Nova Scotia CCA certification.",
        promptFr:
          "Terminer ce parcours de l'Academy vous donne la certification d'ASC de la Nouvelle-Écosse.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "False. CCA certification requires a program at a licensed education provider plus the provincial CCA Certification Exam. This track is exam prep and continuing education only.",
        explainFr:
          "Faux. La certification d'ASC exige un programme dans un établissement d'enseignement agréé et l'examen provincial de certification. Ce parcours n'est que de la préparation et de la formation continue.",
      },
      {
        promptEn:
          "A regulated health professional asks a CCA to perform a dressing change for one specific client. Under the framework, what is this?",
        promptFr:
          "Un professionnel de la santé réglementé demande à un ASC d'effectuer un changement de pansement pour un client précis. Selon le cadre, de quoi s'agit-il?",
        choicesEn: [
          "An independent function",
          "A client-specific assignment",
          "A delegated function, specific to that client and situation and not transferable",
          "Outside the scope of employment entirely",
        ],
        choicesFr: [
          "Une fonction autonome",
          "Une assignation propre au client",
          "Une fonction déléguée, propre à ce client et à cette situation, non transférable",
          "Entièrement hors du champ d'emploi",
        ],
        correctIdx: [2],
        explainEn:
          "A dressing change is the framework's own example of delegation: outside the CCA's educational preparation but within the scope of employment, delegated by a regulated professional for that client and situation only.",
        explainFr:
          "Le changement de pansement est l'exemple même de délégation donné par le cadre : hors de la préparation scolaire de l'ASC mais dans le champ d'emploi, délégué par un professionnel réglementé pour ce client et cette situation seulement.",
      },
      {
        promptEn:
          "Which of these are named behaviours of the framework's foundational competencies? (Select all that apply)",
        promptFr:
          "Lesquels de ces comportements sont nommés dans les compétences fondamentales du cadre? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Respecting confidentiality in the care setting, including when using technology",
          "Assessing risks to self and client before delivering care",
          "Diagnosing a client's new symptom before reporting it",
          "Understanding and maintaining professional boundaries",
        ],
        choicesFr: [
          "Respecter la confidentialité dans le milieu de soins, y compris avec la technologie",
          "Évaluer les risques pour soi et pour le client avant de donner des soins",
          "Diagnostiquer un nouveau symptôme du client avant de le signaler",
          "Comprendre et maintenir les limites professionnelles",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Confidentiality and boundaries sit under Integrity; risk assessment before care sits under Accountability. Diagnosing is outside the CCA scope entirely.",
        explainFr:
          "La confidentialité et les limites relèvent de l'Intégrité; l'évaluation du risque avant les soins relève de la Responsabilisation. Poser un diagnostic est entièrement hors du champ de l'ASC.",
      },
      {
        promptEn:
          "A client's condition changes during your visit. What does the framework expect?",
        promptFr:
          "L'état d'un client change pendant votre visite. Qu'attend le cadre?",
        choicesEn: [
          "Document it in the record only",
          "Tell the nurse only",
          "Both report it to the appropriate person and document it",
          "Wait until the next scheduled team meeting",
        ],
        choicesFr: [
          "Le documenter au dossier seulement",
          "En parler à l'infirmier seulement",
          "À la fois le signaler à la personne appropriée et le documenter",
          "Attendre la prochaine réunion d'équipe prévue",
        ],
        correctIdx: [2],
        explainEn:
          "\"Report\" and \"document\" are paired throughout the framework. An answer that does only one of the two is normally the wrong answer.",
        explainFr:
          "« Signaler » et « documenter » vont de pair dans tout le cadre. Une réponse qui ne fait que l'un des deux est normalement la mauvaise.",
      },
    ],
  },
];
