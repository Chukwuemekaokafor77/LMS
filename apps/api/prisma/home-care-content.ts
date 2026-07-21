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
 * Lesson videos are BYO (agencies upload their own, or narrated slides); we
 * seed lesson titles + ordering and full EN/FR quiz banks with answers.
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
  lessons: { titleEn: string; titleFr: string }[];
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
      { titleEn: "Your role and scope of practice", titleFr: "Votre rôle et votre champ de pratique" },
      { titleEn: "Person-centred care in the home", titleFr: "Soins centrés sur la personne à domicile" },
      { titleEn: "Respecting the client's home and routines", titleFr: "Respecter le domicile et les habitudes du client" },
      { titleEn: "Communication and active listening", titleFr: "Communication et écoute active" },
      { titleEn: "Documentation and care notes", titleFr: "Documentation et notes de soins" },
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
      { titleEn: "Before the visit: plan and check in", titleFr: "Avant la visite : planifier et s'annoncer" },
      { titleEn: "Situational awareness in the home", titleFr: "Vigilance situationnelle au domicile" },
      { titleEn: "De-escalating tension safely", titleFr: "Désamorcer les tensions en toute sécurité" },
      { titleEn: "Emergencies when you are alone", titleFr: "Urgences lorsque vous êtes seul" },
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
      { titleEn: "Hand hygiene — the 4 moments", titleFr: "Hygiène des mains — les 4 moments" },
      { titleEn: "PPE you carry and how to use it", titleFr: "L'EPI que vous transportez et son utilisation" },
      { titleEn: "Clean technique in a home without a team", titleFr: "Technique propre à domicile, sans équipe" },
      { titleEn: "Handling laundry, waste, and sharps at home", titleFr: "Gérer le linge, les déchets et les objets tranchants à domicile" },
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
      { titleEn: "Common fall hazards in the home", titleFr: "Risques de chute courants à domicile" },
      { titleEn: "Supporting safe mobility and transfers", titleFr: "Favoriser une mobilité et des transferts sécuritaires" },
      { titleEn: "After a fall: what to do when alone", titleFr: "Après une chute : que faire seul" },
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
      { titleEn: "What counts as personal health information", titleFr: "Ce qui constitue un renseignement personnel sur la santé" },
      { titleEn: "Need-to-know and consent", titleFr: "Le besoin de savoir et le consentement" },
      { titleEn: "Phones, photos, and social media", titleFr: "Téléphones, photos et réseaux sociaux" },
      { titleEn: "If information is disclosed by accident", titleFr: "En cas de divulgation accidentelle" },
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
      { titleEn: "Planning your route and buffer time", titleFr: "Planifier votre trajet et le temps tampon" },
      { titleEn: "Winter and adverse conditions", titleFr: "Hiver et conditions défavorables" },
      { titleEn: "Fatigue and distraction", titleFr: "Fatigue et distraction" },
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
      { titleEn: "Body mechanics and protecting your back", titleFr: "Mécanique corporelle et protection du dos" },
      { titleEn: "Assessing before you move a client", titleFr: "Évaluer avant de déplacer un client" },
      { titleEn: "Safe transfers and using mobility aids", titleFr: "Transferts sécuritaires et aides à la mobilité" },
      { titleEn: "When not to lift alone", titleFr: "Quand ne pas soulever seul" },
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
      { titleEn: "Understanding dementia", titleFr: "Comprendre la démence" },
      { titleEn: "Communicating with a person living with dementia", titleFr: "Communiquer avec une personne atteinte de démence" },
      { titleEn: "Responsive behaviours have meaning", titleFr: "Les comportements réactifs ont un sens" },
      { titleEn: "Preventing and de-escalating distress", titleFr: "Prévenir et désamorcer la détresse" },
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
      { titleEn: "Assisting vs administering: know the line", titleFr: "Aider ou administrer : connaître la limite" },
      { titleEn: "Supporting a client to take their own medications", titleFr: "Aider un client à prendre ses propres médicaments" },
      { titleEn: "Safe storage and observing for problems", titleFr: "Entreposage sécuritaire et observation des problèmes" },
      { titleEn: "Reporting medication concerns", titleFr: "Signaler les préoccupations liées aux médicaments" },
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
      { titleEn: "Types and signs of abuse and neglect", titleFr: "Types et signes de maltraitance et de négligence" },
      { titleEn: "Self-neglect and financial abuse", titleFr: "L'autonégligence et l'exploitation financière" },
      { titleEn: "Your responsibility to report", titleFr: "Votre responsabilité de signalement" },
      { titleEn: "Responding safely and respectfully", titleFr: "Réagir de façon sécuritaire et respectueuse" },
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
      { titleEn: "Professional boundaries as a guest", titleFr: "Les limites professionnelles en tant qu'invité" },
      { titleEn: "Gifts, money, and dual relationships", titleFr: "Cadeaux, argent et relations doubles" },
      { titleEn: "Working alongside family", titleFr: "Travailler avec la famille" },
      { titleEn: "Pets and household realities", titleFr: "Animaux et réalités du foyer" },
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
