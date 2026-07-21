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
];
