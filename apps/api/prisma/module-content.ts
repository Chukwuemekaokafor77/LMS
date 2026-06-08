// Lesson + quiz seed content for the 8 mandatory NB modules.
// Lesson video is BYOC by the operator (or authored separately) — we only
// seed titles + ordering. Quiz banks are full EN/FR with correct answers.
//
// Citations live in the Module row. Lesson titles reference statutory
// language where the regulator's wording matters (mandatory reporting,
// resident rights). Pass mark defaults to 80%.

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

export type SeedModuleContent = {
  slug: string;
  passMark: number;
  lessons: { titleEn: string; titleFr: string }[];
  questions: SeedQuestion[];
};

export const MODULE_CONTENT: SeedModuleContent[] = [
  // ── 1. IPAC ──────────────────────────────────────────────────────────
  {
    slug: "ipac-fundamentals-nb",
    passMark: 80,
    lessons: [
      { titleEn: "Routine Practices", titleFr: "Pratiques de base" },
      {
        titleEn: "Hand Hygiene — 4 Moments",
        titleFr: "Hygiène des mains — 4 moments",
      },
      {
        titleEn: "Personal Protective Equipment (PPE)",
        titleFr: "Équipement de protection individuelle (EPI)",
      },
      {
        titleEn: "Additional Precautions (Contact, Droplet, Airborne)",
        titleFr: "Précautions additionnelles (contact, gouttelettes, aériennes)",
      },
      {
        titleEn: "Cleaning, Disinfection & Sterilization",
        titleFr: "Nettoyage, désinfection et stérilisation",
      },
    ],
    questions: [
      {
        promptEn: "How long should hand hygiene with alcohol-based rub take?",
        promptFr: "Combien de temps faut-il pour l'hygiène des mains avec une solution hydro-alcoolique ?",
        choicesEn: ["3–5 seconds", "10–15 seconds", "20–30 seconds", "60+ seconds"],
        choicesFr: ["3 à 5 secondes", "10 à 15 secondes", "20 à 30 secondes", "60 secondes ou plus"],
        correctIdx: [2],
        explainEn:
          "Public Health NB recommends rubbing until hands are dry — typically 20–30 seconds.",
      },
      {
        promptEn: "Which is the correct order to remove PPE?",
        promptFr: "Quel est le bon ordre pour retirer l'EPI ?",
        choicesEn: [
          "Mask → gown → gloves → eye protection",
          "Gloves → eye protection → gown → mask",
          "Gown → gloves → mask → eye protection",
          "Eye protection → mask → gloves → gown",
        ],
        choicesFr: [
          "Masque → blouse → gants → protection oculaire",
          "Gants → protection oculaire → blouse → masque",
          "Blouse → gants → masque → protection oculaire",
          "Protection oculaire → masque → gants → blouse",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "Which precautions apply to a resident with C. difficile?",
        promptFr: "Quelles précautions s'appliquent à un résident atteint de C. difficile ?",
        choicesEn: ["Routine practices only", "Contact precautions + soap-and-water hand hygiene", "Droplet precautions", "Airborne precautions"],
        choicesFr: ["Pratiques de base seulement", "Précautions de contact + lavage à l'eau et au savon", "Précautions contre les gouttelettes", "Précautions aériennes"],
        correctIdx: [1],
        explainEn:
          "Alcohol-based rub does NOT kill C. difficile spores — soap and water is required.",
      },
      {
        promptEn: "True or false: PPE worn in an isolation room may be reused for the next room.",
        promptFr: "Vrai ou faux : l'EPI porté dans une chambre d'isolement peut être réutilisé dans la chambre suivante.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
      },
      {
        promptEn: "Which surfaces are 'high-touch' and require frequent disinfection?",
        promptFr: "Quelles surfaces sont à « contact fréquent » et exigent une désinfection régulière ?",
        type: "MULTIPLE",
        choicesEn: ["Bedrails", "Doorknobs", "Ceiling tiles", "Call bells", "Light switches"],
        choicesFr: ["Ridelles de lit", "Poignées de porte", "Carreaux de plafond", "Cloches d'appel", "Interrupteurs"],
        correctIdx: [0, 1, 3, 4],
      },
    ],
  },

  // ── 2. Fire Safety & Emergency Codes ─────────────────────────────────
  {
    slug: "fire-safety-emergency-codes-nb",
    passMark: 80,
    lessons: [
      { titleEn: "RACE & PASS", titleFr: "RACE et PASS" },
      {
        titleEn: "Standardized Emergency Codes (Code Red, Green, White)",
        titleFr: "Codes d'urgence standardisés (Code rouge, vert, blanc)",
      },
      {
        titleEn: "Evacuation: Horizontal then Vertical",
        titleFr: "Évacuation : horizontale puis verticale",
      },
      {
        titleEn: "Resident Assistance & Counts",
        titleFr: "Assistance aux résidents et décompte",
      },
    ],
    questions: [
      {
        promptEn: "What does Code Red signify in NB nursing homes?",
        promptFr: "Que signifie le Code rouge dans les foyers de soins du N.-B. ?",
        choicesEn: ["Active shooter", "Fire", "Cardiac arrest", "Hazardous spill"],
        choicesFr: ["Tireur actif", "Incendie", "Arrêt cardiaque", "Déversement dangereux"],
        correctIdx: [1],
      },
      {
        promptEn: "What does the 'R' in RACE stand for?",
        promptFr: "Que signifie le « R » dans RACE ?",
        choicesEn: ["Run", "Rescue", "Report", "Restrain"],
        choicesFr: ["Courir", "Secourir", "Signaler", "Maîtriser"],
        correctIdx: [1],
      },
      {
        promptEn: "Which evacuation strategy comes FIRST?",
        promptFr: "Quelle stratégie d'évacuation vient EN PREMIER ?",
        choicesEn: ["Vertical to ground floor", "Horizontal to next fire compartment", "Out of building immediately", "Wait in place"],
        choicesFr: ["Verticale au rez-de-chaussée", "Horizontale au compartiment coupe-feu suivant", "Hors du bâtiment immédiatement", "Sur place"],
        correctIdx: [1],
        explainEn:
          "LTC residents are typically moved horizontally past fire doors first; vertical evacuation is a last resort.",
      },
      {
        promptEn: "What does PASS describe?",
        promptFr: "Que décrit le sigle PASS ?",
        choicesEn: ["Patient triage", "Fire extinguisher use", "Code White response", "Visitor screening"],
        choicesFr: ["Triage des patients", "Utilisation de l'extincteur", "Réponse au Code blanc", "Filtrage des visiteurs"],
        correctIdx: [1],
      },
      {
        promptEn: "True or false: Code White means a violent or behavioural emergency.",
        promptFr: "Vrai ou faux : le Code blanc désigne une urgence violente ou comportementale.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
    ],
  },

  // ── 3. WHMIS 2015 ────────────────────────────────────────────────────
  {
    slug: "whmis-2015",
    passMark: 80,
    lessons: [
      { titleEn: "Pictograms & Hazard Classes", titleFr: "Pictogrammes et classes de danger" },
      { titleEn: "Safety Data Sheets (SDS)", titleFr: "Fiches de données de sécurité (FDS)" },
      { titleEn: "Supplier vs Workplace Labels", titleFr: "Étiquettes du fournisseur vs du lieu de travail" },
      { titleEn: "Right to Know — Worker Responsibilities", titleFr: "Droit à l'information — responsabilités du travailleur" },
    ],
    questions: [
      {
        promptEn: "How many sections does an SDS contain under WHMIS 2015?",
        promptFr: "Combien de sections une FDS comporte-t-elle selon le SIMDUT 2015 ?",
        choicesEn: ["8", "12", "16", "24"],
        choicesFr: ["8", "12", "16", "24"],
        correctIdx: [2],
      },
      {
        promptEn: "Which pictogram indicates a corrosive substance?",
        promptFr: "Quel pictogramme indique une substance corrosive ?",
        choicesEn: ["Flame", "Skull and crossbones", "Test tubes pouring on hand and metal", "Exploding bomb"],
        choicesFr: ["Flamme", "Tête de mort sur tibias", "Éprouvettes versant sur main et métal", "Bombe explosive"],
        correctIdx: [2],
      },
      {
        promptEn: "True or false: a workplace label may be handwritten.",
        promptFr: "Vrai ou faux : une étiquette du lieu de travail peut être manuscrite.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
      {
        promptEn: "Within how many years must SDSs be reviewed?",
        promptFr: "Tous les combien de temps les FDS doivent-elles être revues ?",
        choicesEn: ["1 year", "3 years", "5 years", "10 years"],
        choicesFr: ["1 an", "3 ans", "5 ans", "10 ans"],
        correctIdx: [1],
      },
      {
        promptEn: "Which is NOT a worker right under WHMIS?",
        promptFr: "Lequel n'est PAS un droit du travailleur en vertu du SIMDUT ?",
        choicesEn: ["Right to information", "Right to participate", "Right to refuse unsafe work", "Right to alter SDS content"],
        choicesFr: ["Droit à l'information", "Droit de participer", "Droit de refuser un travail dangereux", "Droit de modifier le contenu d'une FDS"],
        correctIdx: [3],
      },
    ],
  },

  // ── 4. Resident Rights ───────────────────────────────────────────────
  {
    slug: "resident-rights-person-centred-care-nb",
    passMark: 80,
    lessons: [
      { titleEn: "Statutory Resident Rights (NB Nursing Homes Act)", titleFr: "Droits statutaires des résidents (Loi sur les foyers de soins du N.-B.)" },
      { titleEn: "Dignity, Privacy & Choice", titleFr: "Dignité, vie privée et choix" },
      { titleEn: "Cultural Safety & Bilingual Service", titleFr: "Sécurité culturelle et service bilingue" },
      { titleEn: "Documentation of Care Preferences", titleFr: "Documentation des préférences de soins" },
    ],
    questions: [
      {
        promptEn: "Which is a statutory right under the NB Nursing Homes Act?",
        promptFr: "Lequel est un droit statutaire en vertu de la Loi sur les foyers de soins du N.-B. ?",
        choicesEn: [
          "Right to a private suite",
          "Right to be treated with respect and dignity",
          "Right to refuse all medical treatment without consequence",
          "Right to receive any specific brand of food",
        ],
        choicesFr: [
          "Droit à une suite privée",
          "Droit d'être traité avec respect et dignité",
          "Droit de refuser tout traitement médical sans conséquence",
          "Droit de recevoir une marque alimentaire précise",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "A francophone resident asks for care in French. What is the correct response?",
        promptFr: "Un résident francophone demande des soins en français. Quelle est la bonne réponse ?",
        choicesEn: [
          "Provide care in English; staff are not bilingual",
          "Find a bilingual staff member or interpreter — service in French is a right",
          "Ask the resident's family to translate",
          "Document the request for the next shift",
        ],
        choicesFr: [
          "Fournir les soins en anglais; le personnel n'est pas bilingue",
          "Trouver un employé bilingue ou un interprète — le service en français est un droit",
          "Demander à la famille de traduire",
          "Documenter la demande pour le prochain quart",
        ],
        correctIdx: [1],
        explainEn:
          "NB's Official Languages Act requires equitable service in both languages.",
      },
      {
        promptEn: "True or false: knocking before entering a resident's room is optional.",
        promptFr: "Vrai ou faux : frapper avant d'entrer dans la chambre d'un résident est facultatif.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [1],
      },
      {
        promptEn: "Person-centred care means…",
        promptFr: "Les soins centrés sur la personne signifient…",
        choicesEn: [
          "Following the standard care plan precisely",
          "Building care around the resident's preferences and values",
          "Letting residents decide all medical interventions alone",
          "Giving the family final authority",
        ],
        choicesFr: [
          "Suivre exactement le plan de soins standard",
          "Bâtir les soins autour des préférences et des valeurs du résident",
          "Laisser le résident décider seul de toutes les interventions médicales",
          "Donner l'autorité finale à la famille",
        ],
        correctIdx: [1],
      },
    ],
  },

  // ── 5. Abuse, Neglect & Mandatory Reporting ──────────────────────────
  {
    slug: "abuse-neglect-reporting-nb",
    passMark: 100, // statutory: zero tolerance
    lessons: [
      { titleEn: "Recognizing Abuse — Physical, Emotional, Sexual, Financial", titleFr: "Reconnaître l'abus — physique, émotionnel, sexuel, financier" },
      { titleEn: "Neglect — Active vs Passive", titleFr: "Négligence — active vs passive" },
      { titleEn: "Mandatory Reporting Duty (NB Adult Protection Act)", titleFr: "Obligation de signalement (Loi sur les services à la famille du N.-B.)" },
      { titleEn: "Documentation & Non-Retaliation Protections", titleFr: "Documentation et protection contre les représailles" },
    ],
    questions: [
      {
        promptEn:
          "You suspect a colleague is verbally abusive to a resident. Under NB law, you must:",
        promptFr:
          "Vous soupçonnez qu'un collègue est verbalement abusif envers un résident. En vertu de la loi du N.-B., vous devez :",
        choicesEn: [
          "Wait for proof before reporting",
          "Report immediately to the administrator and to NB Department of Social Development",
          "Confront the colleague privately",
          "Only document if injury occurred",
        ],
        choicesFr: [
          "Attendre une preuve avant de signaler",
          "Signaler immédiatement à l'administrateur et au ministère du Développement social du N.-B.",
          "Confronter le collègue en privé",
          "Documenter uniquement s'il y a blessure",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "True or false: failing to report suspected abuse is itself a violation.",
        promptFr: "Vrai ou faux : le défaut de signaler un abus présumé est en soi une violation.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
      {
        promptEn: "Which is an example of passive neglect?",
        promptFr: "Lequel est un exemple de négligence passive ?",
        choicesEn: [
          "Withholding food as punishment",
          "Forgetting to reposition a resident due to understaffing",
          "Hitting a resident",
          "Stealing money from a resident",
        ],
        choicesFr: [
          "Priver un résident de nourriture en guise de punition",
          "Oublier de repositionner un résident à cause du manque de personnel",
          "Frapper un résident",
          "Voler de l'argent à un résident",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "True or false: an employee who reports in good faith is protected from dismissal.",
        promptFr: "Vrai ou faux : un employé qui signale de bonne foi est protégé contre un congédiement.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
    ],
  },

  // ── 6. PHIPAA Privacy ────────────────────────────────────────────────
  {
    slug: "phipaa-privacy-nb",
    passMark: 80,
    lessons: [
      { titleEn: "What PHIPAA Covers", titleFr: "Ce que la LAPRPS couvre" },
      { titleEn: "Custodian Duties & Limits on Collection", titleFr: "Obligations du dépositaire et limites de la collecte" },
      { titleEn: "Resident Access & Correction Rights", titleFr: "Droits d'accès et de correction du résident" },
      { titleEn: "Breach Notification Process", titleFr: "Processus de notification de violation" },
    ],
    questions: [
      {
        promptEn: "Under PHIPAA, who is a 'custodian'?",
        promptFr: "Selon la LAPRPS, qui est un « dépositaire » ?",
        choicesEn: [
          "Any worker who handles records",
          "An organization or individual with custody/control of personal health information",
          "Only physicians",
          "The provincial government",
        ],
        choicesFr: [
          "Tout employé qui manipule des dossiers",
          "Une organisation ou une personne ayant la garde/le contrôle des renseignements personnels sur la santé",
          "Seulement les médecins",
          "Le gouvernement provincial",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "May you discuss a resident's health in the staff break room?",
        promptFr: "Pouvez-vous discuter de la santé d'un résident dans la salle de pause du personnel ?",
        choicesEn: [
          "Yes, if no resident hears",
          "Yes, with co-workers only",
          "No — only on a need-to-know basis in a private setting",
          "Yes, if shifts are over",
        ],
        choicesFr: [
          "Oui, si aucun résident n'entend",
          "Oui, avec les collègues seulement",
          "Non — seulement au besoin et dans un endroit privé",
          "Oui, après le quart",
        ],
        correctIdx: [2],
      },
      {
        promptEn: "True or false: residents have the right to view their own health records under PHIPAA.",
        promptFr: "Vrai ou faux : les résidents ont le droit de consulter leur propre dossier de santé en vertu de la LAPRPS.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
      {
        promptEn: "If you accidentally email a resident chart to the wrong recipient, you must:",
        promptFr: "Si vous envoyez par erreur le dossier d'un résident au mauvais destinataire, vous devez :",
        choicesEn: [
          "Delete your sent message and move on",
          "Notify your privacy officer and document the breach",
          "Wait to see if the recipient replies",
          "Resend with a corrected address",
        ],
        choicesFr: [
          "Supprimer votre message envoyé et passer à autre chose",
          "Aviser le responsable de la vie privée et documenter la violation",
          "Attendre de voir si le destinataire répond",
          "Renvoyer à la bonne adresse",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "How long is custodian-held PHI typically retained for clinical records in NB LTC?",
        promptFr: "Combien de temps les RPS détenus par un dépositaire sont-ils généralement conservés pour les dossiers cliniques dans les soins de longue durée du N.-B. ?",
        choicesEn: ["6 months", "2 years", "7+ years post-discharge", "Indefinitely"],
        choicesFr: ["6 mois", "2 ans", "7 ans ou plus après la sortie", "Indéfiniment"],
        correctIdx: [2],
      },
    ],
  },

  // ── 7. Falls Prevention ──────────────────────────────────────────────
  {
    slug: "falls-prevention",
    passMark: 80,
    lessons: [
      { titleEn: "Risk Screening (Morse Falls Scale)", titleFr: "Dépistage des risques (échelle de Morse)" },
      { titleEn: "Environmental Hazards", titleFr: "Dangers environnementaux" },
      { titleEn: "Toileting Schedules & Mobility Aids", titleFr: "Horaires d'élimination et aides à la mobilité" },
      { titleEn: "Post-Fall Assessment & Documentation", titleFr: "Évaluation post-chute et documentation" },
    ],
    questions: [
      {
        promptEn: "Which is the LEADING cause of falls in LTC?",
        promptFr: "Quelle est la cause PRINCIPALE des chutes en soins de longue durée ?",
        choicesEn: ["Slippery floors", "Unmet toileting needs", "Loud noises", "Sunlight glare"],
        choicesFr: ["Planchers glissants", "Besoins d'élimination non comblés", "Bruits forts", "Éblouissement du soleil"],
        correctIdx: [1],
      },
      {
        promptEn: "After a fall with no apparent injury, the FIRST step is:",
        promptFr: "Après une chute sans blessure apparente, la PREMIÈRE étape est :",
        choicesEn: [
          "Help the resident up immediately",
          "Assess the resident in place before moving",
          "Document only at end of shift",
          "Notify family before nurse",
        ],
        choicesFr: [
          "Aider le résident à se relever immédiatement",
          "Évaluer le résident sur place avant de le déplacer",
          "Documenter à la fin du quart seulement",
          "Aviser la famille avant l'infirmier(ère)",
        ],
        correctIdx: [1],
      },
      {
        promptEn: "Which environmental change reduces falls?",
        promptFr: "Quel changement environnemental réduit les chutes ?",
        type: "MULTIPLE",
        choicesEn: [
          "Adequate lighting at night",
          "Loose throw rugs",
          "Clear pathways",
          "Bedrails in all positions",
          "Non-slip footwear",
        ],
        choicesFr: [
          "Éclairage suffisant la nuit",
          "Tapis non fixés",
          "Couloirs dégagés",
          "Ridelles relevées dans toutes les positions",
          "Chaussures antidérapantes",
        ],
        correctIdx: [0, 2, 4],
        explainEn:
          "Bedrails alone are a restraint and can increase fall severity if a resident climbs over.",
      },
    ],
  },

  // ── 8. Responsive Behaviours / Dementia ──────────────────────────────
  {
    slug: "responsive-behaviours-dementia-care",
    passMark: 80,
    lessons: [
      { titleEn: "P.I.E.C.E.S. Framework", titleFr: "Cadre P.I.E.C.E.S." },
      { titleEn: "Triggers & Unmet Needs", titleFr: "Déclencheurs et besoins non comblés" },
      { titleEn: "Gentle Persuasive Approaches", titleFr: "Approches de persuasion douce" },
      { titleEn: "De-escalation & Safety", titleFr: "Désescalade et sécurité" },
    ],
    questions: [
      {
        promptEn: "What does the 'P' in P.I.E.C.E.S. stand for?",
        promptFr: "Que représente le « P » dans P.I.E.C.E.S. ?",
        choicesEn: ["Patient", "Physical", "Person", "Privacy"],
        choicesFr: ["Patient", "Physique", "Personne", "Vie privée"],
        correctIdx: [1],
      },
      {
        promptEn: "A resident with dementia becomes agitated at 5 pm daily. This is most likely:",
        promptFr: "Un résident atteint de démence devient agité chaque jour à 17 h. Cela est probablement :",
        choicesEn: ["Coincidence", "Sundowning", "A medication side effect only", "Behavioural attention-seeking"],
        choicesFr: ["Une coïncidence", "Le syndrome crépusculaire", "Un effet secondaire des médicaments seulement", "Une recherche d'attention"],
        correctIdx: [1],
      },
      {
        promptEn: "True or false: a responsive behaviour is communication of an unmet need.",
        promptFr: "Vrai ou faux : un comportement réactif est une communication d'un besoin non comblé.",
        type: "TRUE_FALSE",
        choicesEn: ["True", "False"],
        choicesFr: ["Vrai", "Faux"],
        correctIdx: [0],
      },
      {
        promptEn: "Which de-escalation step is typically FIRST?",
        promptFr: "Quelle étape de désescalade vient généralement EN PREMIER ?",
        choicesEn: [
          "Physically redirect the resident",
          "Call security",
          "Validate feelings and approach calmly",
          "Administer PRN medication",
        ],
        choicesFr: [
          "Rediriger physiquement le résident",
          "Appeler la sécurité",
          "Valider les émotions et approcher calmement",
          "Administrer un médicament PRN",
        ],
        correctIdx: [2],
      },
    ],
  },
];
