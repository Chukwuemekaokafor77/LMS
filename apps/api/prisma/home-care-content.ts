/**
 * Home-care STARTER LIBRARY — bilingual (EN/FR) module content seeded as
 * global library modules (orgId = null, PUBLISHED, jurisdiction = null so it
 * applies across NB/NS/PE/NL).
 *
 * ⚠️ POSITIONING (see LMS_COMPLETION_PLAN.md §B0):
 *  - This is **starter / example content**, NOT a certified compliance
 *    curriculum. NB/PE/NL have no province-wide mandated home-support training
 *    list; the standard is employer/program-driven. Present it as
 *    agency-adoptable best-practice training, never as "provincially mandated."
 *  - A qualified SME (home-care nurse / clinical lead) MUST review before an
 *    agency relies on it for compliance. Nova Scotia's CCA path is separate
 *    (prep/CE only — the Academy never grants CCA certification).
 *  - Agencies extend or replace this via the authoring UI (BYO content); a
 *    licensed catalog can be promoted alongside it post-revenue.
 *
 * Each lesson ships a readable EN/FR body so a module is real training from
 * day one — a learner reads the lesson and marks it complete, and that gates
 * the quiz. Lesson videos are BYO (agencies upload their own, or narrated
 * slides); when a video is added it plays above the same text. We also seed
 * full EN/FR quiz banks with answers.
 */

export type SeedQuestion = {
  promptEn: string;
  promptFr: string;
  type?: "SINGLE" | "MULTIPLE" | "TRUE_FALSE";
  choicesEn: string[];
  choicesFr: string[];
  correctIdx: number[];
  explainEn?: string;
  explainFr?: string;
};

export type HomeCareModule = {
  slug: string;
  titleEn: string;
  titleFr: string;
  descriptionEn: string;
  descriptionFr: string;
  durationMin: number;
  passMark: number;
  lessons: { titleEn: string; titleFr: string; bodyEn: string; bodyFr: string }[];
  questions: SeedQuestion[];
};

export const HOME_CARE_MODULES: HomeCareModule[] = [
  // ── 1. Home Support Fundamentals ─────────────────────────────────────
  {
    slug: "home-support-fundamentals",
    titleEn: "Home Support Fundamentals",
    titleFr: "Fondements du soutien à domicile",
    descriptionEn:
      "The home-support worker's role, scope, and person-centred approach when caring for clients in their own homes.",
    descriptionFr:
      "Le rôle, la portée et l'approche centrée sur la personne du préposé au soutien à domicile auprès des clients dans leur propre domicile.",
    durationMin: 35,
    passMark: 80,
    lessons: [
      {
        titleEn: "Your role and scope of practice",
        titleFr: "Votre rôle et votre champ de pratique",
        bodyEn:
          "As a home-support worker you help clients with the activities of daily living — bathing, dressing, meals, light housekeeping, mobility, and companionship — so they can stay safely in their own homes. Your work is personal, practical, and built on trust.\n\nJust as important as what you do is knowing what you must NOT do. Regulated clinical acts — giving injections, changing sterile dressings, adjusting medication doses — are outside a home-support scope. They belong to a nurse or other regulated professional. When a task falls outside your role, the right answer is always the same: decline politely, explain why, and tell your supervisor or the nurse so the client's need is met safely.\n\nWorking within your scope is not a limitation — it protects the client, and it protects you. When you are unsure whether a task is yours to do, stop and ask. \"I'm not sure that's something I'm allowed to do — let me check with my supervisor\" is a professional, safe answer every time.",
        bodyFr:
          "En tant que préposé au soutien à domicile, vous aidez les clients dans les activités de la vie quotidienne — bain, habillage, repas, entretien léger, mobilité et compagnie — afin qu'ils puissent demeurer en sécurité chez eux. Votre travail est personnel, concret et fondé sur la confiance.\n\nSavoir ce que vous ne devez PAS faire est tout aussi important. Les actes cliniques réglementés — administrer des injections, refaire des pansements stériles, ajuster des doses de médicaments — dépassent le champ du soutien à domicile. Ils relèvent d'un infirmier ou d'un autre professionnel réglementé. Lorsqu'une tâche dépasse votre rôle, la bonne réponse est toujours la même : refuser poliment, expliquer pourquoi et en aviser votre superviseur ou l'infirmier afin que le besoin du client soit comblé en toute sécurité.\n\nTravailler dans les limites de votre champ de pratique n'est pas une contrainte — cela protège le client et vous protège. En cas de doute, arrêtez-vous et demandez. « Je ne suis pas certain d'avoir le droit de faire cela — je vais vérifier avec mon superviseur » est une réponse professionnelle et sécuritaire en tout temps.",
      },
      {
        titleEn: "Person-centred care in the home",
        titleFr: "Soins centrés sur la personne à domicile",
        bodyEn:
          "Person-centred care means the client's preferences, choices, and routines guide the care — not the other way around. Two clients who need the same task done may want it done very differently, and both are right. Your job is to fit the care to the person.\n\nIn practice this means asking rather than assuming: \"How do you like to start your morning?\" \"Would you prefer your bath now or after breakfast?\" It means offering real choices wherever it is safe to do so, and respecting the answer even when it is not the choice you would make. Dignity and independence matter as much as the task itself.\n\nPerson-centred does not mean unsafe. If a client's choice would put them at risk, you support their independence as far as is safe, explain your concern plainly, and bring it back to the care plan and your supervisor. The goal is always the most independence the person can have safely.",
        bodyFr:
          "Les soins centrés sur la personne signifient que les préférences, les choix et les habitudes du client guident les soins — et non l'inverse. Deux clients ayant besoin de la même tâche peuvent vouloir qu'elle soit faite très différemment, et les deux ont raison. Votre rôle est d'adapter les soins à la personne.\n\nEn pratique, cela veut dire demander plutôt que présumer : « Comment aimez-vous commencer votre journée? » « Préférez-vous votre bain maintenant ou après le déjeuner? » Cela veut dire offrir de vrais choix chaque fois que c'est sécuritaire et respecter la réponse, même si ce n'est pas celle que vous auriez faite. La dignité et l'autonomie comptent autant que la tâche elle-même.\n\nCentré sur la personne ne veut pas dire non sécuritaire. Si le choix d'un client le met en danger, vous soutenez son autonomie autant qu'il est sécuritaire de le faire, exprimez clairement votre préoccupation et ramenez la question au plan de soins et à votre superviseur. Le but est toujours la plus grande autonomie possible en toute sécurité.",
      },
      {
        titleEn: "Respecting the client's home and routines",
        titleFr: "Respecter le domicile et les habitudes du client",
        bodyEn:
          "Unlike a hospital or facility, the home belongs to the client. You are a guest. That single idea shapes how you behave from the moment you arrive: you knock, you follow the household's customs (shoes off, where to put your bag), and you treat their belongings with care.\n\nRoutines matter deeply to people, especially those who have lost independence in other areas of life. The order they do things, the chair they sit in, how their kitchen is arranged — these are not trivial. Learning and honouring a client's routine is one of the fastest ways to build trust and reduce distress.\n\nRespect also means privacy and restraint: you don't help yourself to food or the phone, you don't rearrange things to suit yourself, and you don't comment on how they keep their home. If something in the home is a genuine safety concern, you note it objectively and raise it with your supervisor rather than taking it into your own hands.",
        bodyFr:
          "Contrairement à un hôpital ou à un établissement, le domicile appartient au client. Vous êtes un invité. Cette seule idée façonne votre comportement dès votre arrivée : vous cognez, vous respectez les usages du foyer (retirer ses chaussures, où déposer son sac) et vous traitez les biens avec soin.\n\nLes habitudes ont une grande importance pour les gens, surtout ceux qui ont perdu leur autonomie ailleurs dans leur vie. L'ordre dans lequel ils font les choses, le fauteuil où ils s'assoient, l'aménagement de leur cuisine — rien de tout cela n'est banal. Apprendre et respecter les habitudes d'un client est l'un des moyens les plus rapides de bâtir la confiance et de réduire la détresse.\n\nLe respect, c'est aussi la discrétion : vous ne vous servez pas de la nourriture ni du téléphone, vous ne réaménagez pas les lieux à votre convenance et vous ne commentez pas la façon dont ils tiennent leur maison. Si quelque chose au domicile constitue un réel risque pour la sécurité, vous le notez objectivement et le signalez à votre superviseur plutôt que d'agir de votre propre chef.",
      },
      {
        titleEn: "Communication and active listening",
        titleFr: "Communication et écoute active",
        bodyEn:
          "Good communication is at the heart of good care. Speak clearly and warmly, at a pace the client can follow, and check that you have been understood — especially with clients who have hearing loss, vision loss, or cognitive changes. Face the person, make eye contact, and don't rush.\n\nActive listening is the other half. It means giving the person your full attention, letting them finish, and reflecting back what you heard: \"So you're saying your knee is more painful today than yesterday — did I get that right?\" This confirms understanding and shows the client they are heard. Much of what you notice — a change in mood, a new pain, a worry about family — comes from listening well.\n\nCommunication also crosses language and culture. In bilingual regions, use the client's preferred language wherever you can, and never assume. When there is a real language barrier, tell your supervisor so the agency can arrange support rather than letting the gap put the client at risk.",
        bodyFr:
          "Une bonne communication est au cœur de bons soins. Parlez clairement et chaleureusement, à un rythme que le client peut suivre, et vérifiez qu'on vous a compris — surtout avec les clients ayant une perte auditive, visuelle ou des changements cognitifs. Faites face à la personne, établissez un contact visuel et ne vous précipitez pas.\n\nL'écoute active en est l'autre moitié. Elle consiste à accorder toute votre attention à la personne, à la laisser terminer et à reformuler ce que vous avez entendu : « Donc, vous dites que votre genou est plus douloureux aujourd'hui qu'hier — est-ce bien cela? » Cela confirme la compréhension et montre au client qu'il est entendu. Une grande partie de ce que vous remarquez — un changement d'humeur, une nouvelle douleur, une inquiétude familiale — vient d'une bonne écoute.\n\nLa communication traverse aussi la langue et la culture. Dans les régions bilingues, utilisez la langue préférée du client autant que possible, et ne présumez jamais. En cas de réelle barrière linguistique, avisez votre superviseur afin que l'agence organise du soutien plutôt que de laisser cet écart mettre le client en danger.",
      },
      {
        titleEn: "Documentation and care notes",
        titleFr: "Documentation et notes de soins",
        bodyEn:
          "Care notes are the record of what happened during your visit. They keep the whole care team informed, they protect the client, and they protect you — if it isn't documented, it's hard to show it was done. Write your notes promptly, while the visit is fresh.\n\nGood notes are objective and factual: what you observed, what you did, the time of the visit, and any change in the client's condition. \"Client ate half of lunch, said she wasn't hungry; walked to the bathroom with one-hand support; no complaints of pain.\" Avoid opinions and labels — write \"declined her bath and said she was tired,\" not \"was being difficult.\"\n\nReport as well as record. Some things can't wait for the note to be read later — a fall, a new symptom, a refusal of medication, a safety concern. Document it AND tell your supervisor or the nurse so the right person can act. Finally, care notes are confidential health information: keep them out of view of visitors and handle them only through your agency's approved tools.",
        bodyFr:
          "Les notes de soins sont le compte rendu de ce qui s'est passé durant votre visite. Elles tiennent toute l'équipe de soins informée, protègent le client et vous protègent — ce qui n'est pas documenté est difficile à prouver. Rédigez vos notes rapidement, pendant que la visite est fraîche à votre mémoire.\n\nDe bonnes notes sont objectives et factuelles : ce que vous avez observé, ce que vous avez fait, l'heure de la visite et tout changement dans l'état du client. « La cliente a mangé la moitié de son dîner, a dit ne pas avoir faim; s'est rendue à la salle de bain avec appui d'une main; aucune plainte de douleur. » Évitez les opinions et les étiquettes — écrivez « a refusé son bain en disant être fatiguée », et non « était difficile ».\n\nSignalez en plus de consigner. Certaines choses ne peuvent attendre que la note soit lue plus tard — une chute, un nouveau symptôme, un refus de médicament, un risque pour la sécurité. Documentez-les ET avisez votre superviseur ou l'infirmier pour que la bonne personne agisse. Enfin, les notes de soins sont des renseignements de santé confidentiels : gardez-les hors de vue des visiteurs et ne les manipulez qu'avec les outils approuvés par votre agence.",
      },
    ],
    questions: [
      {
        promptEn: "A client asks you to give them their insulin injection. What should you do?",
        promptFr: "Un client vous demande de lui administrer son injection d'insuline. Que devez-vous faire?",
        choicesEn: [
          "Give the injection to be helpful",
          "Only if the family agrees",
          "Decline — it is outside a home-support worker's scope — and notify your supervisor/nurse",
          "Give it once, then ask your supervisor",
        ],
        choicesFr: [
          "Administrer l'injection pour rendre service",
          "Seulement si la famille est d'accord",
          "Refuser — cela dépasse le champ de pratique du préposé — et aviser votre superviseur/infirmier",
          "L'administrer une fois, puis demander à votre superviseur",
        ],
        correctIdx: [2],
        explainEn:
          "Administering injections is a regulated clinical act outside the home-support scope. Decline and escalate to the nurse/supervisor.",
        explainFr:
          "L'administration d'injections est un acte clinique réglementé hors du champ du soutien à domicile. Refusez et signalez à l'infirmier/superviseur.",
      },
      {
        promptEn: "What does 'person-centred care' mean in a client's home?",
        promptFr: "Que signifie « soins centrés sur la personne » au domicile d'un client?",
        choicesEn: [
          "Completing tasks as fast as possible",
          "Following the client's preferences, choices, and routines wherever safe",
          "Doing what the family tells you regardless of the client",
          "Applying the same routine to every client",
        ],
        choicesFr: [
          "Accomplir les tâches le plus vite possible",
          "Respecter les préférences, les choix et les habitudes du client lorsque c'est sécuritaire",
          "Faire ce que la famille dit, peu importe le client",
          "Appliquer la même routine à chaque client",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "Which belong in an accurate care note? (Select all that apply)",
        promptFr: "Quels éléments font partie d'une note de soins exacte? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Objective facts about what you observed and did",
          "The time of the visit",
          "Your personal opinion about the family",
          "Changes in the client's condition",
        ],
        choicesFr: [
          "Des faits objectifs sur ce que vous avez observé et fait",
          "L'heure de la visite",
          "Votre opinion personnelle sur la famille",
          "Les changements dans l'état du client",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Care notes are objective and factual — observations, actions, times, and condition changes. Personal opinions do not belong.",
        explainFr:
          "Les notes de soins sont objectives et factuelles — observations, actions, heures et changements d'état. Les opinions personnelles n'y ont pas leur place.",
      },
      {
        promptEn: "You are a guest in the client's home.",
        promptFr: "Vous êtes un invité au domicile du client.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
        explainEn:
          "Unlike a facility, the home belongs to the client. Respect their space, property, and routines.",
        explainFr:
          "Contrairement à un établissement, le domicile appartient au client. Respectez son espace, ses biens et ses habitudes.",
      },
    ],
  },

  // ── 2. Lone-Worker Safety ────────────────────────────────────────────
  {
    slug: "lone-worker-safety",
    titleEn: "Lone-Worker Safety",
    titleFr: "Sécurité du travailleur seul",
    descriptionEn:
      "Staying safe while working alone in clients' homes: check-in protocols, situational awareness, de-escalation, and what to do in an emergency when no team is present.",
    descriptionFr:
      "Rester en sécurité en travaillant seul au domicile des clients : protocoles de vérification, vigilance situationnelle, désescalade et conduite à tenir en cas d'urgence sans équipe présente.",
    durationMin: 30,
    passMark: 80,
    lessons: [
      {
        titleEn: "Before the visit: plan and check in",
        titleFr: "Avant la visite : planifier et s'annoncer",
        bodyEn:
          "Safety starts before you knock. Because you work alone, your agency needs to know where you are. Follow your agency's check-in system: share your itinerary, confirm arrivals and departures, and make sure someone will notice if you don't report in. A known schedule is what lets help reach you quickly if something goes wrong.\n\nPlan the visit itself. Know the address, the parking, and how you'll get in. For a first visit especially, review anything the agency has flagged about the home, the client, or others who may be present. Keep your phone charged and on you — not in your bag in the other room.\n\nAs you arrive, notice your surroundings and locate the exits. You are not being paranoid; you are giving yourself options. If something feels wrong before you even enter, you are allowed to pause, step back, and check in with your agency before proceeding.",
        bodyFr:
          "La sécurité commence avant de cogner à la porte. Comme vous travaillez seul, votre agence doit savoir où vous êtes. Suivez le système de vérification de votre agence : communiquez votre itinéraire, confirmez vos arrivées et vos départs, et assurez-vous que quelqu'un remarquera si vous ne donnez pas de nouvelles. Un horaire connu est ce qui permet à l'aide de vous atteindre rapidement en cas de problème.\n\nPlanifiez la visite elle-même. Connaissez l'adresse, le stationnement et la façon d'entrer. Pour une première visite surtout, passez en revue tout ce que l'agence a signalé au sujet du domicile, du client ou des autres personnes présentes. Gardez votre téléphone chargé et sur vous — pas dans votre sac dans une autre pièce.\n\nÀ votre arrivée, observez votre environnement et repérez les sorties. Ce n'est pas de la paranoïa; vous vous donnez des options. Si quelque chose vous semble anormal avant même d'entrer, vous avez le droit de vous arrêter, de reculer et de vérifier avec votre agence avant de poursuivre.",
      },
      {
        titleEn: "Situational awareness in the home",
        titleFr: "Vigilance situationnelle au domicile",
        bodyEn:
          "Situational awareness simply means paying attention to what is around you and trusting what you notice. Keep a mental note of the layout and where the exits are. Position yourself so you are never boxed into a corner or blocked from the door.\n\nWatch for changes and warning signs: a visitor who wasn't expected, signs of alcohol or drug use, an aggressive pet, weapons, or a tension in the room that wasn't there before. None of these means the visit must stop — but each is information you weigh. Awareness is quiet and ongoing, not a single check at the door.\n\nIf your instincts tell you something is off, listen to them. It is always acceptable to keep a task short, keep your path to the exit clear, and leave to contact your agency if needed. No visit is worth ignoring a real safety signal.",
        bodyFr:
          "La vigilance situationnelle consiste simplement à porter attention à ce qui vous entoure et à vous fier à ce que vous remarquez. Gardez en tête la disposition des lieux et l'emplacement des sorties. Placez-vous de façon à ne jamais être coincé dans un coin ni bloqué loin de la porte.\n\nSurveillez les changements et les signaux d'alerte : un visiteur inattendu, des signes de consommation d'alcool ou de drogue, un animal agressif, des armes, ou une tension dans la pièce qui n'y était pas avant. Rien de tout cela n'oblige à interrompre la visite — mais chaque élément est une information à évaluer. La vigilance est discrète et continue, pas une simple vérification à la porte.\n\nSi votre instinct vous dit que quelque chose cloche, écoutez-le. Il est toujours acceptable d'écourter une tâche, de garder votre chemin vers la sortie dégagé et de partir pour contacter votre agence au besoin. Aucune visite ne vaut la peine d'ignorer un vrai signal de danger.",
      },
      {
        titleEn: "De-escalating tension safely",
        titleFr: "Désamorcer les tensions en toute sécurité",
        bodyEn:
          "When a client or someone in the home becomes verbally aggressive, your first goal is to lower the temperature, not to win the argument. Stay calm, keep your voice low and even, and use open, non-threatening body language. Give the person space and don't crowd them.\n\nListen to what is driving the anger — pain, fear, frustration at losing independence, or confusion — and acknowledge it: \"I can see this is really frustrating. I want to help.\" Avoid arguing back, correcting, or issuing ultimatums, which usually pour fuel on the fire. Never grab or physically guide an agitated person unless it is truly necessary for immediate safety.\n\nThroughout, keep a clear, unobstructed path to the exit and never let yourself be cornered. De-escalation often works — but if it doesn't, or if you feel unsafe, your safety comes first: leave, get to a safe place, and contact your agency.",
        bodyFr:
          "Lorsqu'un client ou une personne au domicile devient verbalement agressif, votre premier objectif est de faire baisser la tension, non de gagner la dispute. Restez calme, gardez une voix basse et posée et adoptez un langage corporel ouvert et non menaçant. Laissez de l'espace à la personne et ne l'encerclez pas.\n\nCernez ce qui alimente la colère — douleur, peur, frustration de perdre son autonomie ou confusion — et reconnaissez-le : « Je vois que c'est vraiment frustrant. Je veux vous aider. » Évitez de répliquer, de corriger ou de lancer des ultimatums, ce qui envenime généralement la situation. Ne saisissez jamais une personne agitée et ne la guidez pas physiquement, sauf si c'est vraiment nécessaire pour la sécurité immédiate.\n\nTout au long, gardez un accès dégagé vers la sortie et ne vous laissez jamais acculer. La désescalade fonctionne souvent — mais si ce n'est pas le cas, ou si vous vous sentez en danger, votre sécurité passe avant tout : partez, mettez-vous en sécurité et contactez votre agence.",
      },
      {
        titleEn: "Emergencies when you are alone",
        titleFr: "Urgences lorsque vous êtes seul",
        bodyEn:
          "When you are alone with a client and an emergency happens, you have to act without a team beside you — so knowing the order of steps in advance matters. If a life is at risk — the client collapses, can't breathe, or is seriously injured — call 911 first. Emergency services come before anything else, then you notify your agency.\n\nStay with the client, keep yourself safe, and do only what you are trained to do while help is on the way. Follow your agency's emergency protocol and give clear information to the dispatcher: the address, what happened, and the client's condition. If you know the client has a care plan or medical alert, share what's relevant.\n\nEmergencies aren't only medical — a fire, a threatening person, or a gas smell are emergencies too. In those cases, getting yourself and the client to safety comes first. After any emergency, document what happened objectively and complete your agency's incident report.",
        bodyFr:
          "Lorsque vous êtes seul avec un client et qu'une urgence survient, vous devez agir sans équipe à vos côtés — d'où l'importance de connaître l'ordre des étapes à l'avance. Si une vie est en danger — le client s'effondre, ne peut respirer ou est gravement blessé — appelez d'abord le 911. Les services d'urgence passent avant tout, puis vous avisez votre agence.\n\nRestez auprès du client, assurez votre propre sécurité et ne faites que ce pour quoi vous êtes formé pendant que les secours arrivent. Suivez le protocole d'urgence de votre agence et donnez des renseignements clairs au répartiteur : l'adresse, ce qui s'est passé et l'état du client. Si vous savez que le client a un plan de soins ou une alerte médicale, partagez ce qui est pertinent.\n\nLes urgences ne sont pas que médicales — un incendie, une personne menaçante ou une odeur de gaz en sont aussi. Dans ces cas, mettre le client et vous-même en sécurité passe avant tout. Après toute urgence, documentez objectivement les faits et remplissez le rapport d'incident de votre agence.",
      },
    ],
    questions: [
      {
        promptEn: "Before entering a client's home for the first time, you should:",
        promptFr: "Avant d'entrer pour la première fois au domicile d'un client, vous devriez :",
        choicesEn: [
          "Share your itinerary/check-in with your agency and note the exits",
          "Text a friend where you are going",
          "Nothing — home visits are always safe",
          "Wait for the family to arrive first",
        ],
        choicesFr: [
          "Communiquer votre itinéraire/vérification à votre agence et repérer les sorties",
          "Écrire à un ami où vous allez",
          "Rien — les visites à domicile sont toujours sécuritaires",
          "Attendre que la famille arrive d'abord",
        ],
        correctIdx: [0],
        explainEn:
          "A known itinerary and check-in means your agency can act quickly if you don't report in. Always know your exits.",
        explainFr:
          "Un itinéraire connu et une vérification permettent à votre agence d'agir vite si vous ne donnez pas de nouvelles. Sachez toujours où sont les sorties.",
      },
      {
        promptEn: "A client becomes verbally aggressive. What is the safest first response?",
        promptFr: "Un client devient verbalement agressif. Quelle est la première réaction la plus sécuritaire?",
        choicesEn: [
          "Argue back to set boundaries",
          "Stay calm, keep a clear path to the exit, and lower the tension",
          "Immediately grab their arm to guide them",
          "Ignore it and continue the task",
        ],
        choicesFr: [
          "Répliquer pour poser des limites",
          "Rester calme, garder un accès dégagé vers la sortie et réduire la tension",
          "Saisir immédiatement son bras pour le guider",
          "L'ignorer et poursuivre la tâche",
        ],
        correctIdx: [1],
        explainEn:
          "De-escalate with a calm tone and body language, keep an unobstructed exit, and never let yourself be cornered.",
        explainFr:
          "Désamorcez avec un ton et un langage corporel calmes, gardez une sortie dégagée et ne vous laissez jamais acculer.",
      },
      {
        promptEn: "You feel unsafe on arrival (e.g., signs of a threat). You should:",
        promptFr: "Vous vous sentez en danger à l'arrivée (p. ex. signes de menace). Vous devriez :",
        choicesEn: [
          "Enter anyway so the visit isn't missed",
          "Do not enter — leave, get to safety, and contact your agency",
          "Wait in the hallway for an hour",
          "Post about it on social media",
        ],
        choicesFr: [
          "Entrer quand même pour ne pas manquer la visite",
          "Ne pas entrer — partir, se mettre en sécurité et contacter votre agence",
          "Attendre une heure dans le couloir",
          "En parler sur les réseaux sociaux",
        ],
        correctIdx: [1],
        explainEn:
          "Your safety comes first. Trust your instincts, leave, reach safety, and let the agency reschedule or arrange support.",
        explainFr:
          "Votre sécurité passe avant tout. Fiez-vous à votre instinct, partez, mettez-vous en sécurité et laissez l'agence reprogrammer ou organiser du soutien.",
      },
      {
        promptEn: "If a medical emergency happens and you are alone with the client, call 911 before notifying the agency if life is at risk.",
        promptFr: "En cas d'urgence médicale et si vous êtes seul avec le client, appelez le 911 avant d'aviser l'agence si la vie est en danger.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
        explainEn:
          "When life is at risk, emergency services come first, then notify your agency. Follow your agency's emergency protocol.",
        explainFr:
          "Quand la vie est en danger, les services d'urgence d'abord, puis avisez l'agence. Suivez le protocole d'urgence de votre agence.",
      },
    ],
  },

  // ── 3. Infection Prevention & Control in the Home ────────────────────
  {
    slug: "ipac-in-home",
    titleEn: "Infection Prevention & Control in the Home",
    titleFr: "Prévention et contrôle des infections à domicile",
    descriptionEn:
      "Hand hygiene, PPE, and safe practices adapted to a client's home — where there is no facility IPAC team and you manage your own supplies.",
    descriptionFr:
      "Hygiène des mains, EPI et pratiques sécuritaires adaptées au domicile du client — sans équipe de PCI et où vous gérez vos propres fournitures.",
    durationMin: 30,
    passMark: 80,
    lessons: [
      {
        titleEn: "Hand hygiene — the 4 moments",
        titleFr: "Hygiène des mains — les 4 moments",
        bodyEn:
          "Hand hygiene is the single most effective way to prevent infection — more than anything else you do. In home care there is no infection-control team behind you, so the discipline is entirely yours. Perform hand hygiene at the 4 Moments: before contact with the client, before a clean or aseptic task, after contact with body fluids, and after contact with the client or their surroundings.\n\nWhen hands are not visibly soiled, an alcohol-based hand rub is preferred and fast: apply enough to cover all surfaces and rub until dry — usually 20–30 seconds, including fingertips, thumbs, and between fingers. When hands are visibly soiled, wash with soap and water instead.\n\nBecause a client's home may have no soap, no clean towel, or no running water at the sink, carry your own alcohol-based hand rub so you are never caught without a way to clean your hands. Never skip a moment because the supplies aren't there — bring your own.",
        bodyFr:
          "L'hygiène des mains est le moyen le plus efficace de prévenir les infections — plus que tout ce que vous faites d'autre. En soins à domicile, il n'y a pas d'équipe de prévention des infections derrière vous; la rigueur vous revient entièrement. Procédez à l'hygiène des mains aux 4 moments : avant le contact avec le client, avant une tâche propre ou aseptique, après contact avec des liquides biologiques et après contact avec le client ou son environnement.\n\nLorsque les mains ne sont pas visiblement souillées, une solution hydro-alcoolique est préférable et rapide : appliquez-en assez pour couvrir toutes les surfaces et frottez jusqu'à ce que ce soit sec — généralement 20 à 30 secondes, y compris le bout des doigts, les pouces et entre les doigts. Lorsque les mains sont visiblement souillées, lavez-les plutôt à l'eau et au savon.\n\nComme le domicile d'un client peut ne pas avoir de savon, de serviette propre ou d'eau courante à l'évier, transportez votre propre solution hydro-alcoolique afin de ne jamais être pris au dépourvu. Ne sautez jamais un moment parce que les fournitures manquent — apportez les vôtres.",
      },
      {
        titleEn: "PPE you carry and how to use it",
        titleFr: "L'EPI que vous transportez et son utilisation",
        bodyEn:
          "Personal protective equipment (PPE) — gloves, and when needed a mask, eye protection, and a gown or apron — puts a barrier between you and germs. In the home, you carry your own supply and decide, based on the task, what you need. Gloves for contact with body fluids, broken skin, or cleaning; a mask and eye protection when there's a risk of splashes or respiratory illness.\n\nThe order matters. Put PPE on before the task; take it off carefully afterward so you don't contaminate yourself. Remove gloves by turning them inside out, and always perform hand hygiene immediately after removing PPE — gloves are not a substitute for clean hands.\n\nPPE is single-use. Change gloves between tasks (for example, after cleaning and before food prep) and never reuse them. Bring enough for the visit plus spares, and dispose of used PPE in the household waste unless your agency's policy says otherwise.",
        bodyFr:
          "L'équipement de protection individuelle (EPI) — des gants et, au besoin, un masque, une protection oculaire et une blouse ou un tablier — crée une barrière entre vous et les microbes. À domicile, vous transportez vos propres fournitures et décidez, selon la tâche, de ce dont vous avez besoin. Des gants pour le contact avec des liquides biologiques, une peau lésée ou le nettoyage; un masque et une protection oculaire lorsqu'il y a un risque d'éclaboussures ou de maladie respiratoire.\n\nL'ordre est important. Mettez l'EPI avant la tâche; retirez-le soigneusement ensuite pour ne pas vous contaminer. Retirez les gants en les retournant à l'envers et procédez toujours à l'hygiène des mains immédiatement après avoir retiré l'EPI — les gants ne remplacent pas des mains propres.\n\nL'EPI est à usage unique. Changez de gants entre les tâches (par exemple, après le nettoyage et avant la préparation des repas) et ne les réutilisez jamais. Apportez-en assez pour la visite plus des réserves, et jetez l'EPI usagé dans les ordures ménagères, sauf indication contraire de la politique de votre agence.",
      },
      {
        titleEn: "Clean technique in a home without a team",
        titleFr: "Technique propre à domicile, sans équipe",
        bodyEn:
          "Clean (aseptic) technique means keeping the things that must stay clean away from sources of germs. In a facility there are sterile supply rooms and a team to help; in the home, you create a clean workspace yourself. Before a clean task, wash or sanitize your hands, gather your supplies, and set up on a surface you have cleaned rather than a cluttered counter.\n\nWork from clean to dirty, and don't let clean supplies touch soiled surfaces, laundry, or the floor. Keep pets and onlookers back during the task. If something you need to keep clean becomes contaminated, treat it as dirty and replace it — don't take a shortcut because it's the only one you brought.\n\nAlways match the technique to the task and your training. If a task needs a level of sterile technique beyond your scope, that is a signal to stop and involve the nurse rather than improvise.",
        bodyFr:
          "La technique propre (aseptique) consiste à tenir les articles qui doivent rester propres à l'écart des sources de microbes. En établissement, il y a des réserves stériles et une équipe pour aider; à domicile, c'est vous qui créez un espace de travail propre. Avant une tâche propre, lavez ou désinfectez vos mains, rassemblez vos fournitures et installez-vous sur une surface que vous avez nettoyée plutôt que sur un comptoir encombré.\n\nTravaillez du propre vers le sale et ne laissez pas les fournitures propres toucher des surfaces souillées, du linge ou le sol. Gardez les animaux et les curieux à distance durant la tâche. Si un article qui doit rester propre est contaminé, considérez-le comme sale et remplacez-le — ne prenez pas de raccourci parce que c'est le seul que vous avez apporté.\n\nAdaptez toujours la technique à la tâche et à votre formation. Si une tâche exige un niveau de technique stérile qui dépasse votre champ de pratique, c'est un signal pour arrêter et faire appel à l'infirmier plutôt que d'improviser.",
      },
      {
        titleEn: "Handling laundry, waste, and sharps at home",
        titleFr: "Gérer le linge, les déchets et les objets tranchants à domicile",
        bodyEn:
          "Soiled laundry and waste are everyday parts of home care, and handling them safely protects both you and the client. Wear gloves for soiled linens, hold them away from your body, and don't shake them out. Wash soiled laundry on the hottest setting the fabric allows, and clean any surface the soiled items touched.\n\nWaste contaminated with body fluids is usually bagged and placed in the household garbage — follow your agency's policy and any local rules. Tie bags securely and perform hand hygiene after handling waste.\n\nSharps — needles, lancets — are never placed loose in the garbage, where they can injure the client, family, or sanitation workers. Use an approved sharps container, keep it out of reach of children, and follow your agency's process for disposal when it's full. If a client is managing their own sharps, make sure they have a proper container and report it if they don't.",
        bodyFr:
          "Le linge souillé et les déchets font partie du quotidien des soins à domicile, et les manipuler en toute sécurité vous protège, vous et le client. Portez des gants pour le linge souillé, tenez-le loin de votre corps et ne le secouez pas. Lavez le linge souillé au réglage le plus chaud que le tissu permet et nettoyez toute surface touchée par les articles souillés.\n\nLes déchets contaminés par des liquides biologiques sont habituellement ensachés et déposés dans les ordures ménagères — suivez la politique de votre agence et les règles locales. Fermez bien les sacs et procédez à l'hygiène des mains après avoir manipulé des déchets.\n\nLes objets tranchants — aiguilles, lancettes — ne sont jamais jetés en vrac aux ordures, où ils peuvent blesser le client, la famille ou les éboueurs. Utilisez un contenant approuvé, gardez-le hors de portée des enfants et suivez le processus de votre agence pour l'élimination lorsqu'il est plein. Si un client gère lui-même ses objets tranchants, assurez-vous qu'il a un contenant adéquat et signalez-le si ce n'est pas le cas.",
      },
    ],
    questions: [
      {
        promptEn: "How long should hand hygiene with alcohol-based rub take?",
        promptFr: "Combien de temps faut-il pour l'hygiène des mains avec une solution hydro-alcoolique?",
        choicesEn: ["3–5 seconds", "10–15 seconds", "20–30 seconds", "Over 2 minutes"],
        choicesFr: ["3 à 5 secondes", "10 à 15 secondes", "20 à 30 secondes", "Plus de 2 minutes"],
        correctIdx: [2],
        explainEn: "Rub until hands are dry — typically 20–30 seconds, covering all surfaces.",
        explainFr: "Frottez jusqu'à ce que les mains soient sèches — généralement 20 à 30 secondes, en couvrant toutes les surfaces.",
      },
      {
        promptEn: "You arrive at a home with no soap at the sink. Best practice is to:",
        promptFr: "Vous arrivez dans un domicile sans savon à l'évier. La meilleure pratique est de :",
        choicesEn: [
          "Skip hand hygiene this visit",
          "Use the alcohol-based hand rub you carry",
          "Rinse with water only",
          "Use the client's dish soap without asking",
        ],
        choicesFr: [
          "Sauter l'hygiène des mains cette visite",
          "Utiliser la solution hydro-alcoolique que vous transportez",
          "Rincer à l'eau seulement",
          "Utiliser le savon à vaisselle du client sans demander",
        ],
        correctIdx: [1],
        explainEn:
          "Because the home may not be stocked, carry your own alcohol-based hand rub and supplies.",
        explainFr:
          "Comme le domicile peut ne pas être approvisionné, transportez votre propre solution hydro-alcoolique et vos fournitures.",
      },
      {
        promptEn: "When should you perform hand hygiene during a home visit? (Select all that apply)",
        promptFr: "Quand devez-vous procéder à l'hygiène des mains pendant une visite? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Before contact with the client",
          "Before a clean/aseptic task",
          "After contact with body fluids",
          "After contact with the client or their surroundings",
        ],
        choicesFr: [
          "Avant le contact avec le client",
          "Avant une tâche propre/aseptique",
          "Après contact avec des liquides biologiques",
          "Après contact avec le client ou son environnement",
        ],
        correctIdx: [0, 1, 2, 3],
        explainEn: "These are the 4 Moments for Hand Hygiene — all four apply in the home.",
        explainFr: "Ce sont les 4 moments de l'hygiène des mains — les quatre s'appliquent à domicile.",
      },
      {
        promptEn: "Used sharps should be placed loose in the client's household garbage.",
        promptFr: "Les objets tranchants usagés doivent être jetés en vrac dans les ordures ménagères du client.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Never place sharps loose in garbage. Use an approved sharps container per your agency's policy.",
        explainFr:
          "Ne jetez jamais d'objets tranchants en vrac aux ordures. Utilisez un contenant approuvé selon la politique de votre agence.",
      },
    ],
  },

  // ── 4. Falls Prevention in the Home ──────────────────────────────────
  {
    slug: "falls-prevention-home",
    titleEn: "Falls Prevention in the Home",
    titleFr: "Prévention des chutes à domicile",
    descriptionEn:
      "Spotting and reducing fall hazards in a client's own home, supporting safe mobility, and responding when a client falls while you are alone.",
    descriptionFr:
      "Repérer et réduire les risques de chute au domicile du client, favoriser une mobilité sécuritaire et réagir en cas de chute alors que vous êtes seul.",
    durationMin: 25,
    passMark: 80,
    lessons: [
      {
        titleEn: "Common fall hazards in the home",
        titleFr: "Risques de chute courants à domicile",
        bodyEn:
          "Falls are the leading cause of injury among older adults, and most happen at home. Many are preventable once you learn to see the hazards. Look for loose scatter rugs, clutter and cords across walkways, poor lighting, wet or slippery floors, and unstable furniture the client might grab for support.\n\nBathrooms and stairs deserve special attention — these are where serious falls often happen. Note whether there are grab bars by the toilet and tub, whether the client uses them, and whether stairways have secure handrails and good light. Footwear matters too: well-fitting shoes or non-slip slippers are safer than socks or loose slippers.\n\nYou can reduce many hazards on the spot with the client's permission — clearing a path, turning on a light, moving a cord. For anything you can't fix, or that needs equipment like a grab bar or raised toilet seat, note it objectively and report it to your supervisor so it can be addressed in the care plan.",
        bodyFr:
          "Les chutes sont la principale cause de blessure chez les personnes âgées, et la plupart surviennent à domicile. Bon nombre sont évitables une fois qu'on apprend à repérer les dangers. Cherchez les carpettes non fixées, l'encombrement et les fils dans les passages, l'éclairage insuffisant, les planchers mouillés ou glissants et les meubles instables auxquels le client pourrait s'agripper.\n\nLes salles de bain et les escaliers méritent une attention particulière — c'est là que surviennent souvent les chutes graves. Notez s'il y a des barres d'appui près des toilettes et de la baignoire, si le client les utilise, et si les escaliers ont des mains courantes solides et un bon éclairage. Les chaussures comptent aussi : des souliers bien ajustés ou des pantoufles antidérapantes sont plus sûrs que des bas ou des pantoufles lâches.\n\nVous pouvez réduire bien des dangers sur-le-champ avec l'accord du client — dégager un passage, allumer une lumière, déplacer un fil. Pour ce que vous ne pouvez pas corriger, ou qui nécessite de l'équipement comme une barre d'appui ou un siège de toilette surélevé, notez-le objectivement et signalez-le à votre superviseur pour qu'on l'intègre au plan de soins.",
      },
      {
        titleEn: "Supporting safe mobility and transfers",
        titleFr: "Favoriser une mobilité et des transferts sécuritaires",
        bodyEn:
          "Helping a client move safely keeps them independent and prevents injury to both of you. Always follow the mobility and transfer method in the care plan, and re-check the client's ability at each visit — a person can be steadier in the morning than the evening, or weaker on a bad day. Make sure walkers, canes, and wheelchairs are within reach, in good repair, and used correctly.\n\nBefore a transfer, clear the path, lock wheelchair brakes, and make sure the client is wearing proper footwear. Encourage the client to do what they safely can; your role is to support, not to do it all for them. Give clear, calm cues and move at their pace.\n\nKnow your limits. If a client is heavier than you can safely support, or the care plan calls for a transfer aid or a two-person assist, do not attempt it alone to save time. Use the equipment or wait for help, and report if the level of assistance needed has changed.",
        bodyFr:
          "Aider un client à se déplacer en toute sécurité préserve son autonomie et prévient les blessures pour vous deux. Suivez toujours la méthode de mobilité et de transfert du plan de soins, et revérifiez la capacité du client à chaque visite — une personne peut être plus stable le matin que le soir, ou plus faible un mauvais jour. Assurez-vous que les marchettes, cannes et fauteuils roulants sont à portée, en bon état et utilisés correctement.\n\nAvant un transfert, dégagez le passage, verrouillez les freins du fauteuil roulant et assurez-vous que le client porte des chaussures adéquates. Encouragez le client à faire ce qu'il peut en toute sécurité; votre rôle est de soutenir, non de tout faire à sa place. Donnez des consignes claires et calmes et allez à son rythme.\n\nConnaissez vos limites. Si un client est plus lourd que ce que vous pouvez soutenir en sécurité, ou si le plan de soins prévoit une aide au transfert ou une assistance à deux, n'essayez pas seul pour gagner du temps. Utilisez l'équipement ou attendez de l'aide, et signalez tout changement dans le niveau d'assistance requis.",
      },
      {
        titleEn: "After a fall: what to do when alone",
        titleFr: "Après une chute : que faire seul",
        bodyEn:
          "If a client falls while you are alone with them, resist the instinct to lift them up right away. Your first step is to stay calm and check for injury and responsiveness. Ask how they feel, look for pain, bleeding, or signs of a head or hip injury, and check whether they can move. Moving an injured person can make things much worse.\n\nIf they are seriously hurt, unresponsive, or you suspect a fracture or head injury, call 911 before moving them, then notify your agency. If they are uninjured and able, help them up only using a safe, trained method — never by heaving their full weight. When in doubt, wait for help rather than risk injuring them or yourself.\n\nAfter any fall, monitor the client for a while, document exactly what happened — how they were found, what you observed, what you did — and report it to your supervisor and the nurse. Even a fall with no obvious injury needs to be reported, because problems can appear hours later.",
        bodyFr:
          "Si un client tombe alors que vous êtes seul avec lui, résistez à l'instinct de le relever tout de suite. Votre première étape est de rester calme et de vérifier les blessures et la réactivité. Demandez-lui comment il se sent, cherchez des signes de douleur, de saignement ou d'une blessure à la tête ou à la hanche, et vérifiez s'il peut bouger. Déplacer une personne blessée peut aggraver grandement la situation.\n\nS'il est gravement blessé, inconscient, ou si vous soupçonnez une fracture ou une blessure à la tête, appelez le 911 avant de le déplacer, puis avisez votre agence. S'il n'est pas blessé et qu'il en est capable, aidez-le à se relever uniquement selon une méthode sécuritaire et apprise — jamais en soulevant tout son poids. Dans le doute, attendez de l'aide plutôt que de risquer de le blesser ou de vous blesser.\n\nAprès toute chute, surveillez le client un moment, documentez exactement ce qui s'est passé — comment il a été trouvé, ce que vous avez observé, ce que vous avez fait — et signalez-le à votre superviseur et à l'infirmier. Même une chute sans blessure apparente doit être signalée, car des problèmes peuvent apparaître des heures plus tard.",
      },
    ],
    questions: [
      {
        promptEn: "Which are common home fall hazards? (Select all that apply)",
        promptFr: "Quels sont des risques de chute courants à domicile? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: ["Loose scatter rugs", "Poor lighting", "Clutter on the floor", "A grab bar by the toilet"],
        choicesFr: ["Carpettes non fixées", "Éclairage insuffisant", "Encombrement au sol", "Une barre d'appui près des toilettes"],
        correctIdx: [0, 1, 2],
        explainEn: "Loose rugs, poor lighting, and clutter raise fall risk. A grab bar reduces it.",
        explainFr: "Les carpettes, le mauvais éclairage et l'encombrement augmentent le risque. Une barre d'appui le réduit.",
      },
      {
        promptEn: "A client falls and you are alone. Your first step is to:",
        promptFr: "Un client tombe et vous êtes seul. Votre première étape est de :",
        choicesEn: [
          "Lift them back into the chair quickly",
          "Check for injury and responsiveness before moving them; call for help if needed",
          "Leave to find a neighbour",
          "Give them water",
        ],
        choicesFr: [
          "Le relever rapidement dans le fauteuil",
          "Vérifier les blessures et la réactivité avant de le déplacer; appeler à l'aide au besoin",
          "Partir chercher un voisin",
          "Lui donner de l'eau",
        ],
        correctIdx: [1],
        explainEn:
          "Do not rush to lift. Assess for injury first; moving an injured person can cause harm. Call 911 if seriously hurt, then your agency.",
        explainFr:
          "Ne vous précipitez pas pour relever. Évaluez d'abord les blessures; déplacer une personne blessée peut aggraver la situation. Appelez le 911 si la blessure est grave, puis votre agence.",
      },
      {
        promptEn: "If a client starts to lose balance during a transfer, you should try to catch and hold their full weight.",
        promptFr: "Si un client commence à perdre l'équilibre lors d'un transfert, vous devez tenter de retenir tout son poids.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Never try to catch a full fall — you risk injuring both of you. Ease them to the floor or nearest surface in a controlled way.",
        explainFr:
          "N'essayez jamais de retenir une chute complète — vous risquez de vous blesser tous les deux. Accompagnez-le au sol ou vers la surface la plus proche de façon contrôlée.",
      },
    ],
  },

  // ── 5. Privacy & Confidentiality in the Home ─────────────────────────
  {
    slug: "privacy-confidentiality-home",
    titleEn: "Privacy & Confidentiality in the Home",
    titleFr: "Vie privée et confidentialité à domicile",
    descriptionEn:
      "Protecting clients' personal and health information in home care — consistent with PHIPAA (NB) and PIPEDA — including the realities of family, phones, and shared spaces.",
    descriptionFr:
      "Protéger les renseignements personnels et de santé des clients en soins à domicile — conformément à la LAPRPS (N.-B.) et à la LPRPDE — y compris les réalités de la famille, des téléphones et des espaces partagés.",
    durationMin: 25,
    passMark: 80,
    lessons: [
      {
        titleEn: "What counts as personal health information",
        titleFr: "Ce qui constitue un renseignement personnel sur la santé",
        bodyEn:
          "Personal health information is any information about a client's health, care, or identity — their diagnoses, medications, mental health, the fact that they receive care at all, and even their name and address in connection with services. In New Brunswick this is protected under PHIPAA; across Canada, PIPEDA and provincial laws apply. Protecting it is a legal duty, not just good manners.\n\nIt helps to think broadly. It's not only the chart — it's what you overhear, what you see in the home, and what the client tells you in confidence. A client's adult child living down the street, a neighbour who asks how they're doing, a friend who wants to help — none are automatically entitled to this information.\n\nThe basic rule is simple: information about a client is collected and shared only for their care, and only with people who need it for that care. When you're unsure whether something counts as protected information, treat it as if it does.",
        bodyFr:
          "Un renseignement personnel sur la santé est toute information concernant la santé, les soins ou l'identité d'un client — ses diagnostics, ses médicaments, sa santé mentale, le fait même qu'il reçoive des soins, et même son nom et son adresse en lien avec les services. Au Nouveau-Brunswick, cela est protégé par la LAPRPS; à l'échelle du Canada, la LPRPDE et les lois provinciales s'appliquent. Le protéger est une obligation légale, pas seulement une question de politesse.\n\nIl est utile de voir large. Ce n'est pas seulement le dossier — c'est ce que vous entendez, ce que vous voyez au domicile et ce que le client vous confie. L'enfant adulte d'un client qui habite tout près, un voisin qui demande de ses nouvelles, un ami qui veut aider — aucun n'a automatiquement droit à cette information.\n\nLa règle de base est simple : l'information sur un client est recueillie et partagée uniquement pour ses soins, et seulement avec les personnes qui en ont besoin pour ces soins. En cas de doute quant à savoir si un élément constitue une information protégée, traitez-le comme si c'était le cas.",
      },
      {
        titleEn: "Need-to-know and consent",
        titleFr: "Le besoin de savoir et le consentement",
        bodyEn:
          "\"Need-to-know\" means you share a client's information only with those who need it to provide care — the nurse, your supervisor, the rest of the care team — and only the part they need. You don't discuss clients in the break room, with your own family, or with other clients, and you don't look at information about clients who aren't yours.\n\nConsent decides what can be shared beyond the care team. Family members, even close ones, are not automatically entitled to health information. If a client's adult child asks what medications their parent takes, the answer is: share only if the client has consented or it's on the care plan; otherwise, gently direct them to the client or the nurse.\n\nWhen you're not sure whether you have consent to share something, don't share it — check with your supervisor first. It is always easier to share information later than to take back information that has already been disclosed.",
        bodyFr:
          "Le « besoin de savoir » signifie que vous ne partagez l'information d'un client qu'avec ceux qui en ont besoin pour dispenser les soins — l'infirmier, votre superviseur, le reste de l'équipe de soins — et seulement la partie nécessaire. Vous ne parlez pas des clients dans la salle de repos, avec votre propre famille ni avec d'autres clients, et vous ne consultez pas l'information de clients qui ne sont pas les vôtres.\n\nLe consentement détermine ce qui peut être partagé au-delà de l'équipe de soins. Les membres de la famille, même proches, n'ont pas automatiquement droit aux renseignements de santé. Si l'enfant adulte d'un client demande quels médicaments son parent prend, la réponse est : ne partager que si le client a consenti ou si c'est au plan de soins; sinon, diriger doucement la personne vers le client ou l'infirmier.\n\nLorsque vous n'êtes pas certain d'avoir le consentement de partager quelque chose, ne le partagez pas — vérifiez d'abord avec votre superviseur. Il est toujours plus facile de partager une information plus tard que de reprendre une information déjà divulguée.",
      },
      {
        titleEn: "Phones, photos, and social media",
        titleFr: "Téléphones, photos et réseaux sociaux",
        bodyEn:
          "Your personal phone is one of the biggest privacy risks in home care. Taking a photo of a client's wound \"to show the nurse later,\" texting details about a client, or storing their information on a personal device all put protected health information onto insecure, uncontrolled channels. Use only agency-approved tools for anything involving client information.\n\nSocial media deserves a hard line: never post about clients, even with no names and even in a private group. Details like a location, a condition, or a story can identify someone, and a well-meaning post can breach confidentiality and cost trust — and jobs. If a client or family sends you a friend request, keep the relationship professional.\n\nAlso protect information physically: lock your phone and apps, don't leave care notes or devices visible to visitors, and log out of agency systems when you're done. Privacy is a habit made of many small, consistent actions.",
        bodyFr:
          "Votre téléphone personnel est l'un des plus grands risques pour la vie privée en soins à domicile. Prendre une photo de la plaie d'un client « pour la montrer à l'infirmier plus tard », envoyer des messages sur un client ou stocker ses renseignements sur un appareil personnel place des renseignements de santé protégés sur des canaux non sécurisés et incontrôlés. N'utilisez que les outils approuvés par l'agence pour tout ce qui touche l'information du client.\n\nLes réseaux sociaux exigent une limite ferme : ne publiez jamais au sujet des clients, même sans nom et même dans un groupe privé. Des détails comme un lieu, un état de santé ou une anecdote peuvent identifier une personne, et une publication bien intentionnée peut violer la confidentialité et coûter la confiance — et des emplois. Si un client ou sa famille vous envoie une demande d'ami, gardez la relation professionnelle.\n\nProtégez aussi l'information physiquement : verrouillez votre téléphone et vos applications, ne laissez pas de notes de soins ni d'appareils à la vue des visiteurs, et déconnectez-vous des systèmes de l'agence une fois terminé. La protection de la vie privée est une habitude faite de nombreux gestes simples et constants.",
      },
      {
        titleEn: "If information is disclosed by accident",
        titleFr: "En cas de divulgation accidentelle",
        bodyEn:
          "Even careful people make mistakes — a note left on a table, a text sent to the wrong person, a conversation overheard. What matters most is what you do next. A privacy breach that is reported quickly can often be contained; one that is hidden almost always gets worse.\n\nIf you realize information has been disclosed or exposed by accident, don't panic and don't try to cover it up. Take any immediate step you safely can to limit it — retrieve the note, recall the message if possible — and then report it to your supervisor right away. Your agency has a process for handling privacy breaches, including notifying the client when required by law.\n\nBe honest and factual about what happened. You are not the first person to make a privacy mistake, and reporting it is the professional, responsible choice. The goal isn't blame — it's protecting the client and preventing the same mistake next time.",
        bodyFr:
          "Même les personnes prudentes font des erreurs — une note laissée sur une table, un message envoyé à la mauvaise personne, une conversation entendue. Ce qui compte le plus, c'est ce que vous faites ensuite. Une atteinte à la vie privée signalée rapidement peut souvent être contenue; une atteinte dissimulée s'aggrave presque toujours.\n\nSi vous constatez qu'une information a été divulguée ou exposée par accident, ne paniquez pas et ne tentez pas de le cacher. Prenez toute mesure immédiate que vous pouvez faire sans risque pour limiter les dégâts — récupérer la note, rappeler le message si possible — puis signalez-le sans tarder à votre superviseur. Votre agence dispose d'un processus pour gérer les atteintes à la vie privée, y compris aviser le client lorsque la loi l'exige.\n\nSoyez honnête et factuel sur ce qui s'est passé. Vous n'êtes pas la première personne à commettre une erreur de confidentialité, et la signaler est le choix professionnel et responsable. Le but n'est pas de blâmer — c'est de protéger le client et d'éviter que la même erreur se reproduise.",
      },
    ],
    questions: [
      {
        promptEn: "A client's adult child asks what medications the client takes. You should:",
        promptFr: "L'enfant adulte d'un client demande quels médicaments le client prend. Vous devriez :",
        choicesEn: [
          "Tell them — they are family",
          "Only share if the client has consented / it is on the care plan; otherwise refer them to the client or nurse",
          "Refuse to speak to any family ever",
          "Share it if they seem worried",
        ],
        choicesFr: [
          "Le leur dire — c'est la famille",
          "Ne partager que si le client a consenti / si c'est au plan de soins; sinon, les diriger vers le client ou l'infirmier",
          "Refuser de parler à la famille en tout temps",
          "Le partager s'ils semblent inquiets",
        ],
        correctIdx: [1],
        explainEn:
          "Family are not automatically entitled to health information. Share only with consent or as the care plan directs.",
        explainFr:
          "La famille n'a pas automatiquement droit aux renseignements de santé. Ne partagez qu'avec consentement ou selon le plan de soins.",
      },
      {
        promptEn: "Taking a photo of a client's wound on your personal phone to show the nurse later is acceptable.",
        promptFr: "Prendre une photo de la plaie d'un client avec votre téléphone personnel pour la montrer à l'infirmier plus tard est acceptable.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Personal devices are not secure and this can breach privacy. Use only agency-approved tools and processes.",
        explainFr:
          "Les appareils personnels ne sont pas sécurisés et cela peut porter atteinte à la vie privée. N'utilisez que les outils et procédés approuvés par l'agence.",
      },
      {
        promptEn: "Which protect client confidentiality? (Select all that apply)",
        promptFr: "Lesquels protègent la confidentialité du client? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Discussing clients only with the care team on a need-to-know basis",
          "Keeping care notes out of view of visitors",
          "Sharing a funny client story on social media (no names)",
          "Locking your phone/app and not leaving records visible",
        ],
        choicesFr: [
          "Ne discuter des clients qu'avec l'équipe de soins, selon le besoin de savoir",
          "Garder les notes de soins hors de vue des visiteurs",
          "Partager une anecdote amusante sur un client sur les réseaux sociaux (sans nom)",
          "Verrouiller votre téléphone/application et ne pas laisser les dossiers visibles",
        ],
        correctIdx: [0, 1, 3],
        explainEn:
          "Even without a name, posting about a client can identify them and breaches confidentiality. Never do it.",
        explainFr:
          "Même sans nom, publier au sujet d'un client peut l'identifier et viole la confidentialité. Ne le faites jamais.",
      },
    ],
  },

  // ── 6. Safe Travel Between Clients ───────────────────────────────────
  {
    slug: "safe-travel-between-clients",
    titleEn: "Safe Travel Between Clients",
    titleFr: "Déplacements sécuritaires entre les clients",
    descriptionEn:
      "Managing the driving and scheduling realities of home care — winter conditions, fatigue, and planning routes safely between visits.",
    descriptionFr:
      "Gérer les réalités de conduite et d'horaire des soins à domicile — conditions hivernales, fatigue et planification sécuritaire des trajets entre les visites.",
    durationMin: 20,
    passMark: 80,
    lessons: [
      {
        titleEn: "Planning your route and buffer time",
        titleFr: "Planifier votre trajet et le temps tampon",
        bodyEn:
          "Home-care work means a lot of driving between visits, often on a tight schedule. Good planning is a safety measure. Map your route in advance, allow buffer time between clients, and account for parking, weather, and the unexpected. A schedule with no slack pressures you to rush, and rushing behind the wheel is where things go wrong.\n\nReview the day's addresses and notes before you set off, not while driving. Set your navigation before you pull away. If you'll be visiting an unfamiliar area, know where you're going and where you can safely stop.\n\nWhen the schedule slips — a visit runs long, traffic is bad, roads are poor — the answer is never to drive faster to catch up. Notify your agency that you may be late and let them adjust. The agency would far rather reschedule a visit than have you in a crash. Your safety and the clients' safety come before the timetable.",
        bodyFr:
          "Le travail en soins à domicile implique beaucoup de conduite entre les visites, souvent avec un horaire serré. Une bonne planification est une mesure de sécurité. Tracez votre trajet à l'avance, prévoyez du temps tampon entre les clients et tenez compte du stationnement, de la météo et de l'imprévu. Un horaire sans marge vous pousse à vous presser, et se presser au volant est là où les choses tournent mal.\n\nConsultez les adresses et les notes de la journée avant de partir, pas en conduisant. Réglez votre navigation avant de démarrer. Si vous visitez un secteur inconnu, sachez où vous allez et où vous pouvez vous arrêter en sécurité.\n\nQuand l'horaire prend du retard — une visite s'éternise, la circulation est mauvaise, les routes sont en mauvais état — la solution n'est jamais de conduire plus vite pour rattraper. Avisez votre agence d'un possible retard et laissez-la ajuster. L'agence préfère de loin reporter une visite plutôt que de vous voir avoir un accident. Votre sécurité et celle des clients passent avant l'horaire.",
      },
      {
        titleEn: "Winter and adverse conditions",
        titleFr: "Hiver et conditions défavorables",
        bodyEn:
          "Atlantic winters bring snow, ice, and quickly changing conditions, and home-care workers are on the road in all of it. Drive to the conditions, not the speed limit: slow down, increase your following distance, and brake gently on ice. If visibility or road conditions become dangerous, it is always acceptable to slow right down, pull over safely, or delay — and to tell your agency.\n\nPrepare the vehicle and yourself. Keep the gas tank topped up, carry a basic winter kit (scraper, blanket, boots, phone charger), and clear all your windows before driving. Watch for black ice on shaded stretches, bridges, and driveways.\n\nClient walkways and steps are a hazard too. An icy path to the door is a fall risk for you and the client. Note it, use care getting in, and report unsafe access so the agency and family can address it. No single visit is worth risking a crash or a serious fall in bad weather.",
        bodyFr:
          "Les hivers de l'Atlantique apportent neige, glace et conditions qui changent vite, et les préposés aux soins à domicile sont sur la route dans tout cela. Conduisez selon les conditions, non selon la limite de vitesse : ralentissez, augmentez votre distance de suivi et freinez doucement sur la glace. Si la visibilité ou l'état des routes devient dangereux, il est toujours acceptable de ralentir fortement, de vous ranger en sécurité ou de retarder — et d'en aviser votre agence.\n\nPréparez le véhicule et vous-même. Gardez le réservoir bien rempli, transportez une trousse d'hiver de base (grattoir, couverture, bottes, chargeur de téléphone) et dégagez toutes vos vitres avant de conduire. Méfiez-vous de la glace noire sur les tronçons ombragés, les ponts et les entrées.\n\nLes allées et les marches des clients sont aussi un danger. Un chemin glacé vers la porte est un risque de chute pour vous et le client. Notez-le, entrez avec prudence et signalez tout accès non sécuritaire pour que l'agence et la famille y remédient. Aucune visite ne vaut le risque d'un accident ou d'une chute grave par mauvais temps.",
      },
      {
        titleEn: "Fatigue and distraction",
        titleFr: "Fatigue et distraction",
        bodyEn:
          "Long days, early starts, and back-to-back visits make fatigue a real hazard for home-care drivers. Tired driving can be as dangerous as impaired driving. Learn the warning signs in yourself: heavy eyelids, yawning, drifting in your lane, missing an exit or a turn, or not remembering the last stretch of road. When you notice them, pull over somewhere safe and rest — don't push through.\n\nDistraction is the other constant risk, and the phone is the biggest culprit. Reviewing the next client's notes, answering a call, or sending a quick text while driving — even stopped at a light — is distracted driving and often illegal. Do it before you set off or once you're safely parked.\n\nProtect yourself between visits: take your breaks, eat, stay hydrated, and speak up if the schedule is leaving you exhausted. A well-rested, focused worker is safer for everyone — you, other drivers, and the clients waiting at the next visit.",
        bodyFr:
          "Les longues journées, les départs matinaux et les visites successives font de la fatigue un réel danger pour les préposés au volant. Conduire fatigué peut être aussi dangereux que conduire avec les facultés affaiblies. Apprenez à reconnaître les signes chez vous : paupières lourdes, bâillements, déviation dans votre voie, sortie ou virage manqué, ou incapacité à vous rappeler le dernier tronçon de route. Lorsque vous les remarquez, rangez-vous dans un endroit sûr et reposez-vous — ne forcez pas.\n\nLa distraction est l'autre risque constant, et le téléphone en est le principal coupable. Consulter les notes du prochain client, répondre à un appel ou envoyer un texto en conduisant — même arrêté à un feu — est une distraction au volant, souvent illégale. Faites-le avant de partir ou une fois stationné en sécurité.\n\nProtégez-vous entre les visites : prenez vos pauses, mangez, hydratez-vous et signalez si l'horaire vous épuise. Un préposé bien reposé et concentré est plus sûr pour tout le monde — vous, les autres conducteurs et les clients qui attendent à la prochaine visite.",
      },
    ],
    questions: [
      {
        promptEn: "You are running late and roads are icy. The safest choice is to:",
        promptFr: "Vous êtes en retard et les routes sont glacées. Le choix le plus sécuritaire est de :",
        choicesEn: [
          "Drive faster to make up time",
          "Slow down, drive to conditions, and notify the agency you may be late",
          "Text the next client while driving",
          "Skip the next visit without telling anyone",
        ],
        choicesFr: [
          "Conduire plus vite pour rattraper le temps",
          "Ralentir, conduire selon les conditions et aviser l'agence d'un possible retard",
          "Écrire au prochain client en conduisant",
          "Sauter la prochaine visite sans le dire à personne",
        ],
        correctIdx: [1],
        explainEn:
          "No visit is worth a crash. Drive to conditions and let the agency adjust the schedule.",
        explainFr:
          "Aucune visite ne vaut un accident. Conduisez selon les conditions et laissez l'agence ajuster l'horaire.",
      },
      {
        promptEn: "It is safe to review the next client's care notes on your phone while stopped at a red light.",
        promptFr: "Il est sécuritaire de consulter les notes du prochain client sur votre téléphone à un feu rouge.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Handling your phone while driving — including at lights — is distracted driving and often illegal. Review notes before you set off or once parked.",
        explainFr:
          "Manipuler son téléphone au volant — même aux feux — est une distraction au volant, souvent illégale. Consultez les notes avant de partir ou une fois stationné.",
      },
      {
        promptEn: "Signs you may be too fatigued to drive safely include: (Select all that apply)",
        promptFr: "Les signes que vous êtes peut-être trop fatigué pour conduire de façon sécuritaire comprennent : (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: ["Heavy eyelids or yawning", "Drifting in your lane", "Feeling alert and focused", "Missing an exit or turn"],
        choicesFr: ["Paupières lourdes ou bâillements", "Dévier dans votre voie", "Se sentir alerte et concentré", "Manquer une sortie ou un virage"],
        correctIdx: [0, 1, 3],
        explainEn:
          "Drowsiness, drifting, and missing turns are warning signs — pull over and rest, and tell your agency.",
        explainFr:
          "Somnolence, déviation et virages manqués sont des signaux d'alerte — arrêtez-vous pour vous reposer et avisez votre agence.",
      },
    ],
  },

  // ── 7. Safe Lifting & Client Handling ────────────────────────────────
  {
    slug: "safe-lifting-client-handling",
    titleEn: "Safe Lifting & Client Handling",
    titleFr: "Levage et manutention sécuritaires des clients",
    descriptionEn:
      "Body mechanics, safe transfers, and using mobility aids to protect both the client and yourself from injury in the home.",
    descriptionFr:
      "Mécanique corporelle, transferts sécuritaires et utilisation des aides à la mobilité pour protéger le client et vous-même des blessures à domicile.",
    durationMin: 30,
    passMark: 80,
    lessons: [
      {
        titleEn: "Body mechanics and protecting your back",
        titleFr: "Mécanique corporelle et protection du dos",
        bodyEn:
          "Back injuries are one of the most common — and most preventable — injuries in home care. Good body mechanics protect you across a whole career. The core rules: keep the load close to your body, bend your knees and hips rather than your waist, keep your back straight, and lift with your legs, which are far stronger than your back.\n\nNever twist your spine while lifting or carrying a load. If you need to change direction, move your feet and turn your whole body. Keep a wide, stable stance for balance, and lift smoothly rather than with a sudden jerk. Get a good grip before you take any weight.\n\nProtecting your back is also about not doing too much. Break big tasks into smaller ones, slide or roll rather than lift where you can, and use the equipment that's there. A moment spent setting up correctly prevents an injury that could take you off the job for weeks.",
        bodyFr:
          "Les blessures au dos comptent parmi les plus fréquentes — et les plus évitables — en soins à domicile. Une bonne mécanique corporelle vous protège tout au long d'une carrière. Les règles de base : gardez la charge près de votre corps, pliez les genoux et les hanches plutôt que la taille, gardez le dos droit et soulevez avec les jambes, bien plus fortes que le dos.\n\nNe pivotez jamais la colonne en soulevant ou en portant une charge. Si vous devez changer de direction, déplacez vos pieds et tournez tout votre corps. Adoptez une position large et stable pour l'équilibre, et soulevez de façon fluide plutôt que d'un coup sec. Prenez une bonne prise avant de supporter tout poids.\n\nProtéger son dos, c'est aussi ne pas trop en faire. Divisez les grosses tâches en plus petites, faites glisser ou rouler plutôt que soulever quand c'est possible, et utilisez l'équipement disponible. Un instant pris à bien s'installer prévient une blessure qui pourrait vous éloigner du travail pendant des semaines.",
      },
      {
        titleEn: "Assessing before you move a client",
        titleFr: "Évaluer avant de déplacer un client",
        bodyEn:
          "Before you help a client transfer or reposition, stop and assess — every time. Check the care plan for the approved method and any equipment, then confirm the client's ability today. Abilities change: illness, pain, a poor night's sleep, or a new medication can all mean the method that worked yesterday isn't safe right now.\n\nAssess the person and the environment together. Can the client bear weight, follow instructions, and help? Is there pain or dizziness? Is the path clear, the floor dry, the wheelchair locked, the footwear right? Explain what you're going to do and make sure the client is ready before you begin.\n\nAssessing takes seconds and prevents falls and injuries. If your assessment tells you the transfer isn't safe to do the usual way — or the usual way with just you — don't proceed on autopilot. Adjust, get the right equipment or a second person, or check with your supervisor.",
        bodyFr:
          "Avant d'aider un client à faire un transfert ou à se repositionner, arrêtez-vous et évaluez — chaque fois. Vérifiez la méthode approuvée et l'équipement au plan de soins, puis confirmez la capacité du client aujourd'hui. Les capacités changent : la maladie, la douleur, une mauvaise nuit ou un nouveau médicament peuvent faire que la méthode d'hier n'est plus sécuritaire.\n\nÉvaluez la personne et l'environnement ensemble. Le client peut-il supporter son poids, suivre des consignes et aider? Y a-t-il de la douleur ou des étourdissements? Le passage est-il dégagé, le plancher sec, le fauteuil verrouillé, les chaussures adéquates? Expliquez ce que vous allez faire et assurez-vous que le client est prêt avant de commencer.\n\nÉvaluer prend quelques secondes et prévient chutes et blessures. Si votre évaluation indique que le transfert n'est pas sécuritaire de la façon habituelle — ou de la façon habituelle avec vous seul — ne poursuivez pas en pilote automatique. Adaptez-vous, procurez-vous le bon équipement ou une deuxième personne, ou vérifiez avec votre superviseur.",
      },
      {
        titleEn: "Safe transfers and using mobility aids",
        titleFr: "Transferts sécuritaires et aides à la mobilité",
        bodyEn:
          "A safe transfer is planned, unhurried, and follows the method in the care plan. Set up first: position the wheelchair or chair, lock the brakes, clear the path, and make sure the client has proper footwear. Explain each step and move on a clear count so you and the client act together.\n\nUse mobility aids and transfer equipment as you were trained — transfer belts, slide boards, lifts, walkers. These tools exist to protect both of you, and using them correctly is safer than \"just this once\" without them. Keep the client close to your body during the transfer, keep your stance wide and stable, and never twist to turn the client — move your feet.\n\nEncourage the client to do what they safely can; a transfer is a shared effort, not a dead lift. If at any point it feels unsafe — the client loses strength, panics, or starts to slide — stop, steady the situation, and ease them to a safe surface rather than fighting to complete the move.",
        bodyFr:
          "Un transfert sécuritaire est planifié, sans précipitation et suit la méthode du plan de soins. Installez d'abord : placez le fauteuil roulant ou la chaise, verrouillez les freins, dégagez le passage et assurez-vous que le client porte des chaussures adéquates. Expliquez chaque étape et bougez à un décompte clair pour que le client et vous agissiez ensemble.\n\nUtilisez les aides à la mobilité et l'équipement de transfert comme on vous l'a appris — ceintures de transfert, planches de glissement, lève-personnes, marchettes. Ces outils existent pour vous protéger tous les deux, et bien les utiliser est plus sûr que « juste cette fois » sans eux. Gardez le client près de votre corps durant le transfert, gardez une position large et stable et ne pivotez jamais pour tourner le client — déplacez vos pieds.\n\nEncouragez le client à faire ce qu'il peut en toute sécurité; un transfert est un effort partagé, non un soulevé à bout de bras. Si à tout moment cela devient non sécuritaire — le client perd de la force, panique ou commence à glisser — arrêtez, stabilisez la situation et accompagnez-le vers une surface sûre plutôt que de forcer pour terminer le mouvement.",
      },
      {
        titleEn: "When not to lift alone",
        titleFr: "Quand ne pas soulever seul",
        bodyEn:
          "Knowing when NOT to lift is as important as knowing how. If a client is heavier than you can safely manage, if the care plan calls for a mechanical lift or a two-person assist, or if the client can't reliably help, do not attempt it alone to stay on schedule. That is exactly the situation that injures workers and clients.\n\nThe same applies when something has changed: the client is weaker than usual, in pain, agitated, or on the floor after a fall. A person on the floor is not lifted by heaving them up — you assess for injury first and use a safe method or get help. Never try to catch a client's full weight if they start to fall; you risk injuring both of you. Instead, guide them down in a controlled way to the nearest surface.\n\nWhen a safe lift isn't possible with what you have, stop and get support: call your supervisor, wait for a second worker, or arrange the right equipment. Reporting that more help or a different method is needed isn't a failure — it's how the care plan stays safe and current.",
        bodyFr:
          "Savoir quand NE PAS soulever est aussi important que savoir comment. Si un client est plus lourd que ce que vous pouvez gérer en sécurité, si le plan de soins prévoit un lève-personne ou une assistance à deux, ou si le client ne peut pas aider de façon fiable, n'essayez pas seul pour respecter l'horaire. C'est exactement la situation qui blesse les préposés et les clients.\n\nIl en va de même quand quelque chose a changé : le client est plus faible que d'habitude, souffrant, agité ou au sol après une chute. On ne relève pas une personne au sol en la hissant — on évalue d'abord les blessures et on utilise une méthode sécuritaire ou on demande de l'aide. N'essayez jamais de retenir tout le poids d'un client qui commence à tomber; vous risquez de vous blesser tous les deux. Accompagnez-le plutôt au sol de façon contrôlée vers la surface la plus proche.\n\nQuand un soulevé sécuritaire n'est pas possible avec ce dont vous disposez, arrêtez et cherchez du soutien : appelez votre superviseur, attendez un deuxième préposé ou organisez le bon équipement. Signaler qu'il faut plus d'aide ou une autre méthode n'est pas un échec — c'est ainsi que le plan de soins demeure sécuritaire et à jour.",
      },
    ],
    questions: [
      {
        promptEn: "When lifting or helping a client move, you should:",
        promptFr: "Lorsque vous soulevez ou aidez un client à se déplacer, vous devriez :",
        choicesEn: [
          "Bend at the waist and lift with your back",
          "Keep the load close, bend your knees, and lift with your legs",
          "Twist quickly to move the load across",
          "Hold your breath and pull upward sharply",
        ],
        choicesFr: [
          "Vous pencher à la taille et soulever avec le dos",
          "Garder la charge près de vous, plier les genoux et soulever avec les jambes",
          "Pivoter rapidement pour déplacer la charge",
          "Retenir votre souffle et tirer d'un coup sec",
        ],
        correctIdx: [1],
        explainEn:
          "Keep the load close, bend your knees, keep your back straight, and use your legs — never twist your spine under load.",
        explainFr:
          "Gardez la charge près de vous, pliez les genoux, gardez le dos droit et utilisez vos jambes — ne pivotez jamais la colonne sous une charge.",
      },
      {
        promptEn: "Before helping a client transfer, your first step is to:",
        promptFr: "Avant d'aider un client à faire un transfert, votre première étape est de :",
        choicesEn: [
          "Start lifting right away to save time",
          "Check the care plan for the approved method and confirm the client's ability today",
          "Assume yesterday's method still works",
          "Ask a neighbour to help",
        ],
        choicesFr: [
          "Commencer à soulever tout de suite pour gagner du temps",
          "Vérifier la méthode approuvée au plan de soins et confirmer la capacité du client aujourd'hui",
          "Présumer que la méthode d'hier fonctionne encore",
          "Demander à un voisin d'aider",
        ],
        correctIdx: [1],
        explainEn:
          "Follow the care-plan method and re-check the client's ability each visit — it can change day to day.",
        explainFr:
          "Suivez la méthode du plan de soins et revérifiez la capacité du client à chaque visite — elle peut changer d'un jour à l'autre.",
      },
      {
        promptEn: "A client is heavier than you can safely move alone. You should attempt it anyway to stay on schedule.",
        promptFr: "Un client est plus lourd que ce que vous pouvez déplacer seul en sécurité. Vous devriez quand même essayer pour respecter l'horaire.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Never exceed safe limits. Use the mobility aid or two-person assist in the care plan, and report if more help is needed.",
        explainFr:
          "Ne dépassez jamais les limites sécuritaires. Utilisez l'aide à la mobilité ou l'assistance à deux prévue au plan de soins et signalez tout besoin d'aide supplémentaire.",
      },
      {
        promptEn: "Which reduce your risk of injury during a transfer? (Select all that apply)",
        promptFr: "Lesquels réduisent votre risque de blessure durant un transfert? (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Keeping a wide, stable stance",
          "Using a transfer belt or aid as trained",
          "Keeping the client close to your body",
          "Twisting your spine to turn the client",
        ],
        choicesFr: [
          "Adopter une position large et stable",
          "Utiliser une ceinture de transfert ou une aide comme on vous l'a appris",
          "Garder le client près de votre corps",
          "Pivoter la colonne pour tourner le client",
        ],
        correctIdx: [0, 1, 2],
        explainEn: "A stable stance, trained use of aids, and keeping the load close protect you; twisting under load causes injury.",
        explainFr: "Une position stable, l'usage appris des aides et une charge rapprochée vous protègent; pivoter sous charge cause des blessures.",
      },
    ],
  },

  // ── 8. Dementia & Responsive Behaviours ──────────────────────────────
  {
    slug: "dementia-responsive-behaviours",
    titleEn: "Dementia & Responsive Behaviours",
    titleFr: "Démence et comportements réactifs",
    descriptionEn:
      "Understanding dementia, communicating supportively, and responding to distress or responsive behaviours with a person-centred, non-restraint approach in the home.",
    descriptionFr:
      "Comprendre la démence, communiquer avec soutien et réagir à la détresse ou aux comportements réactifs selon une approche centrée sur la personne et sans contention, à domicile.",
    durationMin: 35,
    passMark: 80,
    lessons: [
      {
        titleEn: "Understanding dementia",
        titleFr: "Comprendre la démence",
        bodyEn:
          "Dementia is not a single disease but a group of conditions — Alzheimer's is the most common — that gradually affect memory, thinking, language, and the ability to manage everyday tasks. It is caused by changes in the brain; it is not a normal part of aging and it is not something the person can control or \"snap out of.\"\n\nA person living with dementia is still a whole person, with a lifetime of history, preferences, and feelings. As the condition progresses, recent memory often fades while older memories and emotions remain strong. They may forget names or events but still feel the emotional tone of an interaction — kindness or impatience — long after the words are gone.\n\nUnderstanding this changes how you care. Instead of correcting or quizzing (\"Don't you remember?\"), you meet the person where they are, focus on comfort and dignity, and adapt tasks to their current abilities. Your calm, patient presence is itself part of the care.",
        bodyFr:
          "La démence n'est pas une seule maladie, mais un ensemble d'affections — l'alzheimer étant la plus courante — qui touchent progressivement la mémoire, la pensée, le langage et la capacité de gérer les tâches quotidiennes. Elle est causée par des changements dans le cerveau; ce n'est pas une partie normale du vieillissement ni quelque chose que la personne peut contrôler ou « surmonter par la volonté ».\n\nUne personne atteinte de démence demeure une personne à part entière, avec une vie d'histoire, de préférences et d'émotions. À mesure que la maladie progresse, la mémoire récente s'estompe souvent tandis que les souvenirs anciens et les émotions restent forts. Elle peut oublier des noms ou des événements tout en ressentant le ton émotionnel d'une interaction — la gentillesse ou l'impatience — longtemps après que les mots se soient effacés.\n\nComprendre cela change la façon de soigner. Plutôt que de corriger ou d'interroger (« Vous ne vous souvenez pas? »), vous rejoignez la personne là où elle est, misez sur le confort et la dignité et adaptez les tâches à ses capacités actuelles. Votre présence calme et patiente fait elle-même partie des soins.",
      },
      {
        titleEn: "Communicating with a person living with dementia",
        titleFr: "Communiquer avec une personne atteinte de démence",
        bodyEn:
          "Communication is one of your most powerful tools in dementia care. Approach the person from the front so you don't startle them, make gentle eye contact, and say who you are. Use short, simple sentences, one idea at a time, and give plenty of time for a response — processing takes longer, and rushing causes distress.\n\nOffer choices, but keep them simple: \"Would you like the blue sweater or the green one?\" rather than an open question with many options. Your tone and body language carry as much meaning as your words — a warm, calm manner reassures even when the words aren't fully understood. If the person uses the \"wrong\" word or a word from another language, focus on the meaning and feeling behind it.\n\nAvoid arguing, correcting, or reasoning someone out of a false belief — it usually increases fear and agitation. Instead, use validation and gentle redirection: acknowledge the feeling, reassure, and guide the moment toward something calming.",
        bodyFr:
          "La communication est l'un de vos outils les plus puissants dans les soins liés à la démence. Approchez la personne de face pour ne pas la surprendre, établissez un doux contact visuel et dites qui vous êtes. Utilisez des phrases courtes et simples, une idée à la fois, et laissez amplement de temps pour répondre — le traitement de l'information est plus long, et se presser crée de la détresse.\n\nOffrez des choix, mais gardez-les simples : « Préférez-vous le chandail bleu ou le vert? » plutôt qu'une question ouverte avec de nombreuses options. Votre ton et votre langage corporel portent autant de sens que vos mots — une attitude chaleureuse et calme rassure même lorsque les mots ne sont pas pleinement compris. Si la personne emploie le « mauvais » mot ou un mot d'une autre langue, concentrez-vous sur le sens et l'émotion qui s'y rattachent.\n\nÉvitez de contredire, de corriger ou de raisonner quelqu'un pour lui ôter une fausse croyance — cela augmente généralement la peur et l'agitation. Utilisez plutôt la validation et une redirection douce : reconnaissez l'émotion, rassurez et orientez le moment vers quelque chose d'apaisant.",
      },
      {
        titleEn: "Responsive behaviours have meaning",
        titleFr: "Les comportements réactifs ont un sens",
        bodyEn:
          "\"Responsive behaviours\" — pacing, calling out, resisting care, agitation, wandering — are not deliberate misbehaviour and not just \"part of the disease\" to be endured. They are a form of communication. The person is usually responding to an unmet need or something in their environment that they can't express in words.\n\nYour job is to become a detective. Behind the behaviour there is often pain, hunger or thirst, needing the toilet, being too hot or cold, boredom, fear, overstimulation (noise, crowds, a busy TV), or fatigue. Late-afternoon agitation — sometimes called sundowning — is common. When you find and meet the underlying need, the behaviour often eases on its own.\n\nBecause the meaning is individual, knowing the person helps enormously: their history, routines, what soothes them, what upsets them. Restraint — physical or chemical — is not the answer and is not within your role. Respond to the need, keep everyone safe, and report patterns so the care team can adjust the plan.",
        bodyFr:
          "Les « comportements réactifs » — faire les cent pas, crier, résister aux soins, agitation, errance — ne sont ni une mauvaise conduite délibérée ni simplement une « partie de la maladie » à endurer. Ils sont une forme de communication. La personne réagit habituellement à un besoin non comblé ou à un élément de son environnement qu'elle ne peut exprimer en mots.\n\nVotre rôle est de devenir un enquêteur. Derrière le comportement se cachent souvent la douleur, la faim ou la soif, un besoin d'aller à la toilette, avoir trop chaud ou trop froid, l'ennui, la peur, la surstimulation (bruit, foule, téléviseur agité) ou la fatigue. L'agitation de fin d'après-midi — parfois appelée syndrome crépusculaire — est fréquente. Lorsque vous trouvez et comblez le besoin sous-jacent, le comportement s'atténue souvent de lui-même.\n\nComme le sens est propre à chacun, bien connaître la personne aide énormément : son histoire, ses habitudes, ce qui l'apaise, ce qui la contrarie. La contention — physique ou chimique — n'est pas la solution et ne relève pas de votre rôle. Répondez au besoin, assurez la sécurité de tous et signalez les tendances pour que l'équipe de soins ajuste le plan.",
      },
      {
        titleEn: "Preventing and de-escalating distress",
        titleFr: "Prévenir et désamorcer la détresse",
        bodyEn:
          "The best way to handle distress is to prevent it. Consistent routines, a calm environment, and unhurried care reduce confusion and anxiety. Reduce triggers where you can — lower noise, improve lighting, keep the space familiar — and watch for early signs of rising distress so you can respond before it escalates.\n\nWhen a person does become distressed or agitated, stay calm — your calm is contagious, and so is your tension. Speak softly, keep your movements slow and unthreatening, and give space. Acknowledge the feeling (\"You seem worried — I'm here with you\"), then gently redirect toward something comforting: a favourite object, a familiar song, a look out the window, a change of activity or room.\n\nNever respond to agitation with force, raised voice, or restraint. If a person becomes unsafe to themselves or others and you can't de-escalate, keep everyone safe, give space, and follow your agency's protocol — including calling for help when needed. Afterward, document what happened and what triggered it, so the team can prevent the next episode.",
        bodyFr:
          "La meilleure façon de gérer la détresse est de la prévenir. Des routines constantes, un environnement calme et des soins sans précipitation réduisent la confusion et l'anxiété. Diminuez les déclencheurs quand vous le pouvez — baisser le bruit, améliorer l'éclairage, garder les lieux familiers — et surveillez les premiers signes de détresse croissante afin de réagir avant que cela ne dégénère.\n\nLorsqu'une personne devient bel et bien en détresse ou agitée, restez calme — votre calme est contagieux, tout comme votre tension. Parlez doucement, gardez des gestes lents et non menaçants et laissez de l'espace. Reconnaissez l'émotion (« Vous semblez inquiet — je suis là avec vous »), puis redirigez doucement vers quelque chose de réconfortant : un objet préféré, une chanson familière, un regard par la fenêtre, un changement d'activité ou de pièce.\n\nNe répondez jamais à l'agitation par la force, une voix élevée ou la contention. Si une personne devient dangereuse pour elle-même ou pour autrui et que vous ne pouvez désamorcer, assurez la sécurité de tous, laissez de l'espace et suivez le protocole de votre agence — y compris appeler à l'aide au besoin. Ensuite, documentez ce qui s'est passé et ce qui l'a déclenché, afin que l'équipe puisse prévenir le prochain épisode.",
      },
    ],
    questions: [
      {
        promptEn: "A client with dementia becomes agitated in the late afternoon. The best first step is to:",
        promptFr: "Un client atteint de démence devient agité en fin d'après-midi. La meilleure première étape est de :",
        choicesEn: [
          "Raise your voice so they understand",
          "Stay calm and look for an unmet need — pain, hunger, toileting, or overstimulation — and reassure",
          "Physically restrain them until they settle",
          "Leave the home until they calm down",
        ],
        choicesFr: [
          "Hausser la voix pour qu'il comprenne",
          "Rester calme et chercher un besoin non comblé — douleur, faim, élimination ou surstimulation — et rassurer",
          "Le maîtriser physiquement jusqu'à ce qu'il se calme",
          "Quitter le domicile jusqu'à ce qu'il se calme",
        ],
        correctIdx: [1],
        explainEn:
          "Responsive behaviours usually signal an unmet need. Stay calm, look for the cause, and reassure — restraint is not appropriate.",
        explainFr:
          "Les comportements réactifs signalent souvent un besoin non comblé. Restez calme, cherchez la cause et rassurez — la contention n'est pas appropriée.",
      },
      {
        promptEn: "Arguing with or correcting a client's false belief is usually the best approach.",
        promptFr: "Contredire ou corriger la fausse croyance d'un client est habituellement la meilleure approche.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Arguing or reorienting often increases distress. Use validation and gentle redirection instead.",
        explainFr:
          "Contredire ou réorienter augmente souvent la détresse. Utilisez plutôt la validation et une redirection douce.",
      },
      {
        promptEn: "Helpful ways to communicate with a person living with dementia include: (Select all that apply)",
        promptFr: "Les façons utiles de communiquer avec une personne atteinte de démence comprennent : (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Short, simple sentences",
          "Approaching from the front and making eye contact",
          "Speaking quickly and offering many choices at once",
          "Allowing extra time to respond",
        ],
        choicesFr: [
          "Des phrases courtes et simples",
          "Approcher de face et établir un contact visuel",
          "Parler vite et offrir plusieurs choix à la fois",
          "Laisser plus de temps pour répondre",
        ],
        correctIdx: [0, 1, 3],
        explainEn: "Simple language, a calm frontal approach, and patience help; rushing and too many choices overwhelm.",
        explainFr: "Un langage simple, une approche calme de face et de la patience aident; se presser et multiplier les choix submergent.",
      },
      {
        promptEn: "Which best describes a 'responsive behaviour'?",
        promptFr: "Qu'est-ce qui décrit le mieux un « comportement réactif »?",
        choicesEn: [
          "Deliberate misbehaviour to annoy the worker",
          "An action such as pacing or calling out that often communicates an unmet need or distress",
          "A normal part of aging that should be ignored",
          "A reason to withhold care",
        ],
        choicesFr: [
          "Une mauvaise conduite délibérée pour ennuyer le préposé",
          "Une action comme faire les cent pas ou crier qui exprime souvent un besoin non comblé ou de la détresse",
          "Une partie normale du vieillissement à ignorer",
          "Une raison de refuser les soins",
        ],
        correctIdx: [1],
        explainEn: "Responsive behaviours are meaningful communication, not deliberate misbehaviour — respond to the underlying need.",
        explainFr: "Les comportements réactifs sont une communication porteuse de sens, non une mauvaise conduite délibérée — répondez au besoin sous-jacent.",
      },
    ],
  },

  // ── 9. Medication Support in the Home ────────────────────────────────
  {
    slug: "medication-support-home",
    titleEn: "Medication Support in the Home",
    titleFr: "Soutien à la médication à domicile",
    descriptionEn:
      "The home-support worker's limited role with medications — reminding and assisting within scope, safe storage, observing for problems, and the firm line at administration.",
    descriptionFr:
      "Le rôle limité du préposé au soutien à domicile envers les médicaments — rappeler et aider dans les limites du champ de pratique, entreposage sécuritaire, observation des problèmes et la limite ferme à l'administration.",
    durationMin: 25,
    passMark: 80,
    lessons: [
      {
        titleEn: "Assisting vs administering: know the line",
        titleFr: "Aider ou administrer : connaître la limite",
        bodyEn:
          "Medications are one of the clearest scope-of-practice lines in home care, and knowing exactly where it sits protects everyone. Assisting means supporting a client to take their own medication: reminding them it's time, reading the label for them, opening a container, or handing them their own labelled blister pack so they take it themselves. Assisting is usually within a home-support scope.\n\nAdministering is different — deciding on or changing a dose, giving an injection, putting medication into someone's mouth, or crushing and mixing pills into food. These are regulated acts that belong to a nurse or the client themselves, not to a home-support worker, even if the family asks you to help \"just this once.\"\n\nThe safe rule: support a capable client to self-administer, but never take over the clinical decisions. When you're asked to do something on the administering side of the line, decline, explain that it's outside your role, and escalate to the nurse or supervisor so the client's need is met properly.",
        bodyFr:
          "Les médicaments constituent l'une des limites de champ de pratique les plus nettes en soins à domicile, et savoir exactement où elle se situe protège tout le monde. Aider signifie soutenir un client à prendre son propre médicament : lui rappeler que c'est l'heure, lire l'étiquette pour lui, ouvrir un contenant ou lui remettre sa propre plaquette étiquetée pour qu'il la prenne lui-même. Aider relève habituellement du champ du soutien à domicile.\n\nAdministrer est différent — décider ou modifier une dose, faire une injection, mettre un médicament dans la bouche de quelqu'un, ou écraser et mélanger des comprimés dans la nourriture. Ce sont des actes réglementés qui relèvent d'un infirmier ou du client lui-même, non d'un préposé au soutien à domicile, même si la famille vous demande d'aider « juste cette fois ».\n\nLa règle sécuritaire : soutenir un client capable à s'auto-administrer, mais ne jamais prendre en charge les décisions cliniques. Lorsqu'on vous demande de faire quelque chose du côté « administrer » de la limite, refusez, expliquez que cela dépasse votre rôle et signalez-le à l'infirmier ou au superviseur afin que le besoin du client soit comblé adéquatement.",
      },
      {
        titleEn: "Supporting a client to take their own medications",
        titleFr: "Aider un client à prendre ses propres médicaments",
        bodyEn:
          "When you assist within your scope, a few good habits keep the client safe. Support them to take the right medication, at the right time, as it is labelled — you are helping them follow what's already prescribed, not deciding anything new. Blister packs and dosettes prepared by a pharmacy make this safer and clearer.\n\nRespect the client's choices. A capable client has the right to refuse a medication. Your job is not to force, trick, or hide medication in food to make sure they take it — covert medication is not your decision and can be unsafe and unethical. Instead, respect the refusal, note it, and report it to the nurse or supervisor so the reason can be understood and addressed.\n\nStay within what you're asked and trained to do. If a client is confused about their medications, can no longer manage them safely, or the pack doesn't match what you'd expect, don't fill the gap by taking over — report it so the care plan and the nurse can respond.",
        bodyFr:
          "Lorsque vous aidez dans les limites de votre champ de pratique, quelques bonnes habitudes gardent le client en sécurité. Soutenez-le à prendre le bon médicament, au bon moment, tel qu'il est étiqueté — vous l'aidez à suivre ce qui est déjà prescrit, sans rien décider de nouveau. Les plaquettes et piluliers préparés par une pharmacie rendent cela plus sûr et plus clair.\n\nRespectez les choix du client. Un client capable a le droit de refuser un médicament. Votre rôle n'est pas de forcer, de tromper ni de cacher un médicament dans la nourriture pour être sûr qu'il le prenne — la médication dissimulée n'est pas votre décision et peut être dangereuse et contraire à l'éthique. Respectez plutôt le refus, notez-le et signalez-le à l'infirmier ou au superviseur afin d'en comprendre la raison et d'y répondre.\n\nRestez dans les limites de ce qu'on vous demande et de votre formation. Si un client est confus au sujet de ses médicaments, ne peut plus les gérer en sécurité, ou si la plaquette ne correspond pas à ce à quoi vous vous attendez, ne comblez pas l'écart en prenant le relais — signalez-le pour que le plan de soins et l'infirmier réagissent.",
      },
      {
        titleEn: "Safe storage and observing for problems",
        titleFr: "Entreposage sécuritaire et observation des problèmes",
        bodyEn:
          "Even without administering, you can help keep medications safe in the home. Medications should be stored as labelled — many in a cool, dry place away from heat and moisture, some refrigerated — and kept out of reach of children and pets. Note if medications are left in unsafe places or muddled together, and report it.\n\nYou are also a valuable set of eyes. Watch for warning signs: an unlabelled or expired container, pills that look different than usual, more or fewer pills left than expected, or a client who seems confused, drowsy, or unwell after taking a medication. Never give or support an unlabelled or expired medication, and never guess a dose — set it aside and report it.\n\nObserving isn't about diagnosing; it's about noticing and passing it on. You spend real time with the client and often see changes first. Reporting what you observe promptly to the nurse or supervisor can catch a medication problem before it becomes serious.",
        bodyFr:
          "Même sans administrer, vous pouvez contribuer à la sécurité des médicaments au domicile. Les médicaments doivent être entreposés tels qu'indiqués sur l'étiquette — plusieurs dans un endroit frais et sec à l'abri de la chaleur et de l'humidité, certains au réfrigérateur — et gardés hors de portée des enfants et des animaux. Notez si des médicaments sont laissés à des endroits non sécuritaires ou mêlés, et signalez-le.\n\nVous êtes aussi une précieuse paire d'yeux. Surveillez les signaux d'alerte : un contenant non étiqueté ou expiré, des comprimés d'apparence inhabituelle, plus ou moins de comprimés que prévu, ou un client qui semble confus, somnolent ou souffrant après un médicament. Ne donnez ni ne soutenez jamais un médicament non étiqueté ou expiré, et ne devinez jamais une dose — mettez-le de côté et signalez-le.\n\nObserver ne veut pas dire diagnostiquer; c'est remarquer et transmettre. Vous passez du temps réel avec le client et voyez souvent les changements en premier. Signaler rapidement ce que vous observez à l'infirmier ou au superviseur peut détecter un problème de médication avant qu'il ne devienne grave.",
      },
      {
        titleEn: "Reporting medication concerns",
        titleFr: "Signaler les préoccupations liées aux médicaments",
        bodyEn:
          "Reporting is how a small observation becomes safe action. Report to the nurse or supervisor whenever a dose is missed or refused, when the client seems confused or unwell after a medication, when pills are unexpectedly left over or missing, or when you find an unlabelled or expired medication. A normal dose taken as planned with no issue doesn't need a report — but anything unusual does.\n\nReport promptly and factually. Say what you observed, when, and what you did — \"the 8 a.m. dose was still in the blister pack at my 11 a.m. visit; the client said she forgot; I did not give it and I'm calling to let you know.\" Don't diagnose or decide the fix; that's the nurse's role. Your clear, timely report gives them what they need to act.\n\nWhen in doubt, report. It is always better to raise a medication concern that turns out to be minor than to stay silent about one that turns out to matter. Follow your agency's process, and document the concern and who you notified.",
        bodyFr:
          "Le signalement transforme une petite observation en action sécuritaire. Signalez à l'infirmier ou au superviseur chaque fois qu'une dose est manquée ou refusée, que le client semble confus ou souffrant après un médicament, qu'il reste ou manque des comprimés de façon inattendue, ou que vous trouvez un médicament non étiqueté ou expiré. Une dose normale prise comme prévu sans problème n'a pas besoin d'être signalée — mais tout élément inhabituel, oui.\n\nSignalez rapidement et factuellement. Dites ce que vous avez observé, quand et ce que vous avez fait — « la dose de 8 h était encore dans la plaquette lors de ma visite de 11 h; la cliente a dit avoir oublié; je ne l'ai pas donnée et je vous appelle pour vous en informer ». Ne diagnostiquez pas et ne décidez pas de la solution; c'est le rôle de l'infirmier. Votre signalement clair et opportun lui donne ce qu'il faut pour agir.\n\nDans le doute, signalez. Il vaut toujours mieux soulever une préoccupation qui s'avère mineure que de garder le silence sur une qui s'avère importante. Suivez le processus de votre agence et documentez la préoccupation et la personne que vous avez avisée.",
      },
    ],
    questions: [
      {
        promptEn: "Within a typical home-support scope, you may:",
        promptFr: "Dans un champ de pratique habituel du soutien à domicile, vous pouvez :",
        choicesEn: [
          "Decide to change the client's dose",
          "Remind the client and hand them their own labelled blister pack to take themselves",
          "Give an injection if the family asks",
          "Crush and mix medications without direction",
        ],
        choicesFr: [
          "Décider de modifier la dose du client",
          "Rappeler au client et lui remettre sa propre plaquette étiquetée pour qu'il la prenne lui-même",
          "Administrer une injection si la famille le demande",
          "Écraser et mélanger des médicaments sans directive",
        ],
        correctIdx: [1],
        explainEn:
          "Reminding and assisting a client to self-administer is within scope; changing doses or administering is not — escalate to the nurse.",
        explainFr:
          "Rappeler et aider un client à s'auto-administrer relève du champ de pratique; modifier une dose ou administrer, non — signalez à l'infirmier.",
      },
      {
        promptEn: "A client refuses their medication, so you should hide it in their food to make sure they take it.",
        promptFr: "Un client refuse son médicament, alors vous devriez le cacher dans sa nourriture pour être sûr qu'il le prenne.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Covert medication is not your decision and can be unsafe and unethical. Respect the refusal and report it to the nurse/supervisor.",
        explainFr:
          "La médication dissimulée n'est pas votre décision et peut être dangereuse et contraire à l'éthique. Respectez le refus et signalez-le à l'infirmier/superviseur.",
      },
      {
        promptEn: "You should report to the nurse or supervisor when: (Select all that apply)",
        promptFr: "Vous devez aviser l'infirmier ou le superviseur lorsque : (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "A dose was missed or refused",
          "The client seems confused or unwell after a medication",
          "Pills are unexpectedly left over",
          "The client took their medication as planned with no issues",
        ],
        choicesFr: [
          "Une dose a été manquée ou refusée",
          "Le client semble confus ou souffrant après un médicament",
          "Il reste des comprimés de façon inattendue",
          "Le client a pris son médicament comme prévu, sans problème",
        ],
        correctIdx: [0, 1, 2],
        explainEn: "Missed/refused doses, new symptoms, and unexpected leftovers all need reporting; a normal dose taken as planned does not.",
        explainFr: "Les doses manquées/refusées, les nouveaux symptômes et les restes inattendus doivent être signalés; une dose normale prise comme prévu, non.",
      },
      {
        promptEn: "You notice a medication container with no label and an expired date. You should:",
        promptFr: "Vous remarquez un contenant de médicament sans étiquette et dont la date est expirée. Vous devriez :",
        choicesEn: [
          "Give it anyway if it looks familiar",
          "Not give it and report it to the nurse/supervisor",
          "Throw it out yourself right away",
          "Guess the correct dose",
        ],
        choicesFr: [
          "Le donner quand même s'il semble familier",
          "Ne pas le donner et le signaler à l'infirmier/superviseur",
          "Le jeter vous-même immédiatement",
          "Deviner la bonne dose",
        ],
        correctIdx: [1],
        explainEn: "Never support an unlabelled or expired medication. Do not give it and report it — the nurse decides next steps.",
        explainFr: "Ne soutenez jamais un médicament non étiqueté ou expiré. Ne le donnez pas et signalez-le — l'infirmier décide de la suite.",
      },
    ],
  },

  // ── 10. Recognizing & Reporting Abuse and Neglect ────────────────────
  {
    slug: "recognizing-reporting-abuse",
    titleEn: "Recognizing & Reporting Abuse and Neglect",
    titleFr: "Reconnaître et signaler la maltraitance et la négligence",
    descriptionEn:
      "Recognizing the signs of abuse or neglect of an adult client, understanding your responsibility to report per policy, and responding safely and respectfully.",
    descriptionFr:
      "Reconnaître les signes de maltraitance ou de négligence envers un client adulte, comprendre votre responsabilité de signalement selon la politique et réagir de façon sécuritaire et respectueuse.",
    durationMin: 25,
    passMark: 80,
    lessons: [
      {
        titleEn: "Types and signs of abuse and neglect",
        titleFr: "Types et signes de maltraitance et de négligence",
        bodyEn:
          "Abuse and neglect of older or vulnerable adults can take many forms: physical, emotional or psychological, sexual, financial, and neglect (failing to provide needed care). Home-care workers are often the ones most likely to notice, because you see the client regularly and in their own home.\n\nLearn the signs. Physical signs include unexplained bruises, burns, or injuries, especially in patterns or at different stages of healing. Emotional signs include a client who becomes fearful, withdrawn, or anxious — particularly around a specific person. Neglect can show as poor hygiene, weight loss, untreated health problems, unsafe living conditions, or unmet basic needs. A clean home and stable weight are reassuring, not red flags.\n\nNo single sign proves abuse, and there can be innocent explanations — but a pattern, or a sign combined with fear, is a reason to pay attention and report. Your role is to notice and raise it objectively, not to investigate or conclude.",
        bodyFr:
          "La maltraitance et la négligence envers les adultes âgés ou vulnérables peuvent prendre plusieurs formes : physique, émotionnelle ou psychologique, sexuelle, financière, et négligence (défaut de fournir les soins nécessaires). Les préposés aux soins à domicile sont souvent les plus susceptibles de les remarquer, car vous voyez le client régulièrement et chez lui.\n\nApprenez à reconnaître les signes. Les signes physiques comprennent des ecchymoses, brûlures ou blessures inexpliquées, surtout en motifs répétés ou à différents stades de guérison. Les signes émotionnels incluent un client devenu craintif, renfermé ou anxieux — particulièrement en présence d'une personne donnée. La négligence peut se manifester par une mauvaise hygiène, une perte de poids, des problèmes de santé non traités, des conditions de vie non sécuritaires ou des besoins de base non comblés. Un domicile propre et un poids stable sont rassurants, non des signaux d'alarme.\n\nAucun signe isolé ne prouve la maltraitance, et il peut y avoir des explications innocentes — mais un motif récurrent, ou un signe accompagné de peur, est une raison d'être attentif et de signaler. Votre rôle est de remarquer et de le rapporter objectivement, non d'enquêter ni de conclure.",
      },
      {
        titleEn: "Self-neglect and financial abuse",
        titleFr: "L'autonégligence et l'exploitation financière",
        bodyEn:
          "Two forms of harm are easy to miss. Self-neglect is when a client can no longer meet their own basic needs — not eating, not taking medications, living in unsafe or unsanitary conditions — often tied to illness, cognitive decline, or isolation. It isn't a lifestyle choice to ignore; it's a care concern to report so support can be arranged.\n\nFinancial abuse is the misuse of a person's money or property — pressure to hand over money, missing cash or belongings, unpaid bills despite adequate income, a new \"friend\" or relative suddenly controlling finances, or being asked to change a will. Older adults who depend on others are especially vulnerable, and the person exploiting them is often someone they trust.\n\nYou are not there to investigate or confront anyone. If you suspect financial abuse or self-neglect, document your objective observations, don't accuse, and report to your supervisor per your agency's policy and adult-protection rules. Never offer to lend money or take over the client's finances yourself.",
        bodyFr:
          "Deux formes de préjudice passent facilement inaperçues. L'autonégligence survient lorsqu'un client ne peut plus combler ses propres besoins de base — ne pas manger, ne pas prendre ses médicaments, vivre dans des conditions non sécuritaires ou insalubres — souvent liée à la maladie, au déclin cognitif ou à l'isolement. Ce n'est pas un choix de vie à ignorer; c'est une préoccupation de soins à signaler pour qu'on organise du soutien.\n\nL'exploitation financière est l'usage abusif de l'argent ou des biens d'une personne — pression pour remettre de l'argent, argent ou objets manquants, factures impayées malgré un revenu suffisant, un nouvel « ami » ou proche contrôlant soudainement les finances, ou une demande de modifier un testament. Les aînés qui dépendent des autres sont particulièrement vulnérables, et la personne qui les exploite est souvent quelqu'un en qui ils ont confiance.\n\nVous n'êtes pas là pour enquêter ni confronter qui que ce soit. Si vous soupçonnez de l'exploitation financière ou de l'autonégligence, documentez vos observations objectives, n'accusez pas et signalez à votre superviseur selon la politique de votre agence et les règles de protection des adultes. N'offrez jamais de prêter de l'argent ni de prendre vous-même en charge les finances du client.",
      },
      {
        titleEn: "Your responsibility to report",
        titleFr: "Votre responsabilité de signalement",
        bodyEn:
          "You do not have to be certain that abuse is happening to report it — and you should not wait until you are. Your duty is to report a reasonable suspicion based on what you have observed. Proving it is not your job; that is for others. Staying silent because you \"can't be sure\" is how harm continues.\n\nReport promptly through your agency's channels — usually your supervisor — and follow any adult-protection reporting requirements that apply in your province. Report the facts: what you saw or heard, when, and in whose presence, without adding conclusions or accusations. Don't investigate on your own, confront the suspected person, or warn them, which can put the client at greater risk and compromise any response.\n\nReporting can feel uncomfortable, especially when the suspected person is a family member the client loves. But your responsibility is to the client's safety. Reporting a concern that turns out to have an innocent explanation is far better than ignoring one that was real.",
        bodyFr:
          "Vous n'avez pas à être certain qu'il y a maltraitance pour la signaler — et vous ne devriez pas attendre de l'être. Votre devoir est de signaler un soupçon raisonnable fondé sur ce que vous avez observé. Le prouver n'est pas votre rôle; cela revient à d'autres. Garder le silence parce qu'on « ne peut être sûr » est ce qui laisse le préjudice se poursuivre.\n\nSignalez rapidement par les voies de votre agence — habituellement votre superviseur — et respectez toute obligation de signalement en matière de protection des adultes applicable dans votre province. Rapportez les faits : ce que vous avez vu ou entendu, quand et en présence de qui, sans ajouter de conclusions ni d'accusations. N'enquêtez pas seul, ne confrontez pas la personne soupçonnée et ne l'avertissez pas, ce qui pourrait accroître le risque pour le client et compromettre toute intervention.\n\nSignaler peut être inconfortable, surtout lorsque la personne soupçonnée est un proche que le client aime. Mais votre responsabilité est la sécurité du client. Signaler une préoccupation qui s'avère avoir une explication innocente vaut bien mieux qu'ignorer une préoccupation qui était réelle.",
      },
      {
        titleEn: "Responding safely and respectfully",
        titleFr: "Réagir de façon sécuritaire et respectueuse",
        bodyEn:
          "How you respond in the moment matters. If a client discloses that someone has hurt them, listen calmly and supportively, without judgment or shock. Take it seriously, thank them for telling you, and reassure them. Make sure they are safe right now — if anyone is in immediate danger, that is an emergency and you call 911.\n\nBe careful what you promise. Don't promise to keep it a secret — you have a duty to report — but do explain gently that you need to tell someone who can help keep them safe. Don't press for details or interrogate them; a few supportive words are enough, and over-questioning can cause distress or complicate a later investigation.\n\nThen follow through: document what the client said in their own words as closely as you can, note what you observed, and report through your agency's channels right away. Respect the client's dignity throughout — responding to abuse is about protecting the person, not taking over their life or deciding for them beyond what safety requires.",
        bodyFr:
          "La façon dont vous réagissez sur le moment compte. Si un client vous confie que quelqu'un lui a fait du mal, écoutez calmement et avec soutien, sans jugement ni étonnement marqué. Prenez-le au sérieux, remerciez-le de vous en avoir parlé et rassurez-le. Assurez-vous qu'il est en sécurité maintenant — si quelqu'un est en danger immédiat, c'est une urgence et vous appelez le 911.\n\nFaites attention à ce que vous promettez. Ne promettez pas de garder le secret — vous avez un devoir de signalement — mais expliquez doucement que vous devez en parler à quelqu'un qui peut aider à assurer sa sécurité. N'insistez pas pour obtenir des détails et ne l'interrogez pas; quelques mots de soutien suffisent, et un excès de questions peut causer de la détresse ou compliquer une enquête ultérieure.\n\nPuis passez à l'action : consignez ce que le client a dit dans ses propres mots aussi fidèlement que possible, notez ce que vous avez observé et signalez sans tarder par les voies de votre agence. Respectez la dignité du client tout au long — réagir à la maltraitance vise à protéger la personne, non à prendre sa vie en charge ni à décider à sa place au-delà de ce que la sécurité exige.",
      },
    ],
    questions: [
      {
        promptEn: "Possible signs of abuse or neglect include: (Select all that apply)",
        promptFr: "Les signes possibles de maltraitance ou de négligence comprennent : (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Unexplained bruises or injuries",
          "Sudden fear around a particular person",
          "A clean home and stable weight",
          "Poor hygiene, weight loss, or unmet basic needs",
        ],
        choicesFr: [
          "Des ecchymoses ou blessures inexpliquées",
          "Une peur soudaine en présence d'une personne en particulier",
          "Un domicile propre et un poids stable",
          "Une mauvaise hygiène, une perte de poids ou des besoins de base non comblés",
        ],
        correctIdx: [0, 1, 3],
        explainEn: "Unexplained injuries, fear of a person, and neglect signs are red flags; a clean home and stable weight are not.",
        explainFr: "Blessures inexpliquées, peur d'une personne et signes de négligence sont des signaux d'alarme; un domicile propre et un poids stable ne le sont pas.",
      },
      {
        promptEn: "You suspect a client is being financially exploited by a relative. You should:",
        promptFr: "Vous soupçonnez qu'un client est exploité financièrement par un proche. Vous devriez :",
        choicesEn: [
          "Confront the relative directly",
          "Keep it to yourself to avoid conflict",
          "Document your objective observations and report to your supervisor per agency / adult-protection policy",
          "Offer to lend the client money",
        ],
        choicesFr: [
          "Confronter le proche directement",
          "Le garder pour vous afin d'éviter un conflit",
          "Documenter vos observations objectives et le signaler à votre superviseur selon la politique de l'agence / de protection des adultes",
          "Proposer de prêter de l'argent au client",
        ],
        correctIdx: [2],
        explainEn:
          "Do not investigate or confront. Record objective observations and report through your agency's channels.",
        explainFr:
          "N'enquêtez pas et ne confrontez pas. Consignez des observations objectives et signalez par les voies de votre agence.",
      },
      {
        promptEn: "You only need to report abuse if you are completely certain it is happening.",
        promptFr: "Vous ne devez signaler la maltraitance que si vous en êtes absolument certain.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "You report a reasonable suspicion — you do not have to prove it. Report objective observations promptly per policy.",
        explainFr:
          "Vous signalez un soupçon raisonnable — vous n'avez pas à le prouver. Signalez rapidement des observations objectives selon la politique.",
      },
      {
        promptEn: "A client discloses that a family member hit them. Your first response should be to:",
        promptFr: "Un client vous confie qu'un membre de sa famille l'a frappé. Votre première réaction devrait être de :",
        choicesEn: [
          "Promise to keep it a secret",
          "Listen supportively, make sure they are safe right now, and report per policy",
          "Tell other clients about it",
          "Treat it as a private family matter and do nothing",
        ],
        choicesFr: [
          "Promettre de garder le secret",
          "Écouter avec soutien, vous assurer de sa sécurité immédiate et signaler selon la politique",
          "En parler à d'autres clients",
          "Considérer cela comme une affaire familiale privée et ne rien faire",
        ],
        correctIdx: [1],
        explainEn:
          "Listen without judging, ensure immediate safety, do not promise secrecy, and report through the proper channels.",
        explainFr:
          "Écoutez sans juger, assurez la sécurité immédiate, ne promettez pas le secret et signalez par les voies appropriées.",
      },
    ],
  },

  // ── 11. Working in the Client's Home: Boundaries, Family & Pets ───────
  {
    slug: "working-in-client-home-boundaries",
    titleEn: "Working in the Client's Home: Boundaries, Family & Pets",
    titleFr: "Travailler au domicile du client : limites, famille et animaux",
    descriptionEn:
      "Maintaining professional boundaries as a guest in someone's home — gifts and money, family dynamics, pets, and keeping the relationship therapeutic.",
    descriptionFr:
      "Maintenir des limites professionnelles en tant qu'invité au domicile — cadeaux et argent, dynamique familiale, animaux et maintien d'une relation thérapeutique.",
    durationMin: 25,
    passMark: 80,
    lessons: [
      {
        titleEn: "Professional boundaries as a guest",
        titleFr: "Les limites professionnelles en tant qu'invité",
        bodyEn:
          "Home care is intimate work — you're in someone's home, often helping with personal tasks, sometimes for months or years. Warm, caring relationships are part of what makes it good work. But the relationship is still professional, and keeping healthy boundaries protects both you and the client.\n\nBoundaries mean keeping the focus on the client's care plan rather than blending your personal life into the visit. It means not sharing your own problems or leaning on the client for support, not giving out your home address or personal contact details, and not becoming the client's banker, driver-off-the-clock, or confidant beyond your role. These limits aren't coldness; they keep the relationship safe, clear, and centred on the client's needs.\n\nBoundary-crossing usually starts small and with good intentions — \"just this once.\" That's exactly when to notice it. When you feel a line being stretched, bring it back to the care plan and your agency's policy, and talk to your supervisor if you're unsure. Clear boundaries prevent dependency, burnout, and situations that can harm the client or your professional standing.",
        bodyFr:
          "Les soins à domicile sont un travail intime — vous êtes chez quelqu'un, souvent à l'aider dans des tâches personnelles, parfois pendant des mois ou des années. Des relations chaleureuses et bienveillantes font partie de ce qui rend ce travail précieux. Mais la relation demeure professionnelle, et maintenir des limites saines protège autant vous que le client.\n\nLes limites, c'est garder l'accent sur le plan de soins plutôt que de mêler votre vie personnelle à la visite. C'est ne pas partager vos propres problèmes ni chercher du soutien auprès du client, ne pas donner votre adresse ni vos coordonnées personnelles, et ne pas devenir le banquier, le chauffeur hors service ou le confident du client au-delà de votre rôle. Ces limites ne sont pas de la froideur; elles gardent la relation sûre, claire et centrée sur les besoins du client.\n\nLe franchissement des limites commence habituellement petit et avec de bonnes intentions — « juste cette fois ». C'est exactement le moment de le remarquer. Lorsque vous sentez qu'une limite s'étire, ramenez la situation au plan de soins et à la politique de votre agence, et parlez-en à votre superviseur en cas de doute. Des limites claires préviennent la dépendance, l'épuisement et les situations qui peuvent nuire au client ou à votre réputation professionnelle.",
      },
      {
        titleEn: "Gifts, money, and dual relationships",
        titleFr: "Cadeaux, argent et relations doubles",
        bodyEn:
          "Money and gifts are where boundaries are tested most directly. A grateful client may offer a large cash tip, a valuable gift, or a place in their will. However kindly meant, accepting these blurs the professional relationship, can look like exploitation, and usually breaches agency policy. Decline politely, explain your agency's rule, and report the offer if required — \"That's so kind, but I'm not able to accept gifts; your thanks means a lot.\"\n\nAvoid mixing finances with the relationship in any direction. Don't lend the client money or borrow from them, don't run personal errands with your own money outside the care plan, and don't get involved in their banking or purchases beyond what your role and the care plan allow. These \"favours\" create dependency and risk, even when your intentions are good.\n\nWatch for dual relationships — becoming the client's friend outside work, doing side jobs for them, or entangling your families. When the professional line and a personal one overlap, judgment gets harder and both the client and you are exposed. Keep the relationship therapeutic, and take any grey area to your supervisor.",
        bodyFr:
          "L'argent et les cadeaux sont là où les limites sont les plus directement mises à l'épreuve. Un client reconnaissant peut offrir un généreux pourboire, un cadeau de valeur ou une place dans son testament. Aussi bien intentionnés soient-ils, accepter ces gestes brouille la relation professionnelle, peut ressembler à de l'exploitation et enfreint généralement la politique de l'agence. Refusez poliment, expliquez la règle de votre agence et signalez l'offre au besoin — « C'est très gentil, mais je ne peux accepter de cadeaux; vos remerciements comptent beaucoup. »\n\nÉvitez de mêler les finances à la relation, dans un sens comme dans l'autre. Ne prêtez pas d'argent au client et ne lui en empruntez pas, ne faites pas de courses personnelles avec votre propre argent en dehors du plan de soins, et ne vous mêlez pas de ses opérations bancaires ni de ses achats au-delà de ce que votre rôle et le plan de soins permettent. Ces « faveurs » créent dépendance et risque, même avec de bonnes intentions.\n\nMéfiez-vous des relations doubles — devenir l'ami du client en dehors du travail, faire des petits boulots pour lui ou entremêler vos familles. Lorsque la ligne professionnelle et une ligne personnelle se chevauchent, le jugement devient plus difficile et le client comme vous êtes exposés. Gardez la relation thérapeutique et portez toute zone grise à votre superviseur.",
      },
      {
        titleEn: "Working alongside family",
        titleFr: "Travailler avec la famille",
        bodyEn:
          "In home care you rarely work with only the client — family members are often present, involved, and understandably invested. At their best, family are partners in care who know the client well. Building a respectful, communicative relationship with them helps everyone, as long as the client stays at the centre.\n\nBoundaries still apply. Remember that the client, not the family, is who you serve, and information is shared with family only with consent or as the care plan directs. Family may sometimes ask you to do tasks outside the care plan or your scope, or take sides in disagreements — stay professional, keep to your role and the plan, and bring conflicts back to your supervisor rather than getting pulled in.\n\nWhen family dynamics are tense or you feel caught in the middle, you don't have to resolve it yourself. Document objectively, avoid taking sides, and let your supervisor and the care team address issues that go beyond the care you provide. Your steadiness and neutrality are part of what keeps the situation safe for the client.",
        bodyFr:
          "En soins à domicile, vous travaillez rarement avec le seul client — les membres de la famille sont souvent présents, impliqués et, à juste titre, concernés. Au mieux, la famille est un partenaire de soins qui connaît bien le client. Bâtir avec elle une relation respectueuse et communicative aide tout le monde, tant que le client demeure au centre.\n\nLes limites s'appliquent tout de même. Rappelez-vous que c'est le client, et non la famille, que vous servez, et que l'information n'est partagée avec la famille qu'avec consentement ou selon le plan de soins. La famille peut parfois vous demander d'accomplir des tâches hors du plan de soins ou de votre champ de pratique, ou de prendre parti dans des désaccords — restez professionnel, tenez-vous-en à votre rôle et au plan, et ramenez les conflits à votre superviseur plutôt que de vous laisser entraîner.\n\nLorsque la dynamique familiale est tendue ou que vous vous sentez pris entre deux feux, vous n'avez pas à régler cela seul. Documentez objectivement, évitez de prendre parti et laissez votre superviseur et l'équipe de soins traiter les questions qui dépassent les soins que vous fournissez. Votre constance et votre neutralité font partie de ce qui garde la situation sécuritaire pour le client.",
      },
      {
        titleEn: "Pets and household realities",
        titleFr: "Animaux et réalités du foyer",
        bodyEn:
          "Every home is different, and part of the job is working respectfully with the realities you find — pets, smoking, clutter, temperature, other people coming and going. Pets in particular are common and often much loved. A friendly dog underfoot during a transfer, or an animal that jumps up, is a genuine fall and injury risk for you and the client.\n\nHandle it respectfully rather than by force or complaint. Ask the client or family to secure the pet during care tasks — for everyone's safety, including the pet's — and explain why. Most people understand once the safety reason is clear. Never harm, shut out, or mistreat an animal, and don't refuse care simply because a client has pets.\n\nOther household realities — a home that's too cold, second-hand smoke, unsafe conditions — are handled the same way: address what you reasonably can with respect and the client's cooperation, and report anything that affects safe care to your supervisor. You adapt to the client's home and life; you don't judge it or try to remake it.",
        bodyFr:
          "Chaque domicile est différent, et une partie du travail consiste à composer avec respect avec les réalités que vous rencontrez — animaux, tabagisme, encombrement, température, allées et venues d'autres personnes. Les animaux en particulier sont fréquents et souvent très aimés. Un chien amical dans vos jambes durant un transfert, ou un animal qui saute, représente un réel risque de chute et de blessure pour vous et le client.\n\nGérez cela avec respect plutôt que par la force ou les plaintes. Demandez au client ou à la famille de garder l'animal à l'écart durant les tâches de soins — pour la sécurité de tous, y compris celle de l'animal — et expliquez pourquoi. La plupart des gens comprennent une fois la raison de sécurité claire. Ne blessez, n'excluez ni ne maltraitez jamais un animal, et ne refusez pas de donner des soins simplement parce qu'un client a des animaux.\n\nLes autres réalités du foyer — un domicile trop froid, la fumée secondaire, des conditions non sécuritaires — se gèrent de la même façon : traitez ce que vous pouvez raisonnablement, avec respect et la collaboration du client, et signalez à votre superviseur tout ce qui nuit à des soins sécuritaires. Vous vous adaptez au domicile et à la vie du client; vous ne les jugez pas et ne cherchez pas à les refaire.",
      },
    ],
    questions: [
      {
        promptEn: "A client offers you a large cash tip. You should:",
        promptFr: "Un client vous offre un généreux pourboire en argent. Vous devriez :",
        choicesEn: [
          "Accept it — refusing would be rude",
          "Politely decline, explain your agency's policy, and report the offer if required",
          "Accept it just this once",
          "Ask whether they could give more",
        ],
        choicesFr: [
          "L'accepter — refuser serait impoli",
          "Refuser poliment, expliquer la politique de votre agence et signaler l'offre au besoin",
          "L'accepter juste cette fois",
          "Demander s'ils pourraient donner plus",
        ],
        correctIdx: [1],
        explainEn:
          "Accepting gifts or money blurs professional boundaries and may breach policy. Decline politely and follow your agency's rules.",
        explainFr:
          "Accepter des cadeaux ou de l'argent brouille les limites professionnelles et peut enfreindre la politique. Refusez poliment et suivez les règles de votre agence.",
      },
      {
        promptEn: "Running personal errands with your own money for a client, outside the care plan, is a good way to build trust.",
        promptFr: "Faire des courses personnelles avec votre propre argent pour un client, en dehors du plan de soins, est une bonne façon de bâtir la confiance.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
        explainEn:
          "Crossing role and financial boundaries creates risk and dependency. Stay within the care plan and agency policy.",
        explainFr:
          "Franchir les limites de rôle et financières crée des risques et de la dépendance. Restez dans les limites du plan de soins et de la politique de l'agence.",
      },
      {
        promptEn: "Maintaining professional boundaries includes: (Select all that apply)",
        promptFr: "Maintenir des limites professionnelles comprend : (Sélectionnez tout ce qui s'applique)",
        type: "MULTIPLE",
        choicesEn: [
          "Keeping the focus on the client's care plan",
          "Not sharing your personal financial problems with the client",
          "Not giving out your home address or lending money",
          "Adding the client to all your personal social media",
        ],
        choicesFr: [
          "Garder l'accent sur le plan de soins du client",
          "Ne pas partager vos problèmes financiers personnels avec le client",
          "Ne pas donner votre adresse personnelle ni prêter d'argent",
          "Ajouter le client à tous vos réseaux sociaux personnels",
        ],
        correctIdx: [0, 1, 2],
        explainEn: "Keep the relationship therapeutic and focused on care; blending it with your personal life crosses boundaries.",
        explainFr: "Gardez la relation thérapeutique et centrée sur les soins; la mêler à votre vie personnelle franchit les limites.",
      },
      {
        promptEn: "A client's friendly dog keeps jumping up and getting underfoot during transfers. Best practice is to:",
        promptFr: "Le chien amical d'un client saute sans cesse et se met dans vos jambes durant les transferts. La meilleure pratique est de :",
        choicesEn: [
          "Ignore it and continue",
          "Ask the client or family to secure the pet during care tasks, for everyone's safety",
          "Bring a treat to distract it every visit",
          "Refuse to care for clients who have pets",
        ],
        choicesFr: [
          "L'ignorer et continuer",
          "Demander au client ou à la famille de garder l'animal à l'écart durant les tâches de soins, pour la sécurité de tous",
          "Apporter une gâterie pour le distraire à chaque visite",
          "Refuser de soigner les clients ayant des animaux",
        ],
        correctIdx: [1],
        explainEn:
          "A pet underfoot during a transfer is a fall risk for both of you. Ask that it be secured during care tasks.",
        explainFr:
          "Un animal dans les jambes durant un transfert est un risque de chute pour vous deux. Demandez qu'il soit gardé à l'écart durant les tâches de soins.",
      },
    ],
  },
];
