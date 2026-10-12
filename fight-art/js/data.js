// Données de référence tirées de la base de connaissances Fight Art Performance.

// Médianes UFC par catégorie (analyse Fight Art Performance, ufcstats.com 2010-2026)
export const CLASSES = [
  { id: "fly", label: "Mouches", maxKg: 56.7, sex: "H", height: 167.6, reach: 172.7, reachP25: 167.6, reachP75: 175.3 },
  { id: "bantam", label: "Coqs", maxKg: 61.2, sex: "H", height: 170.2, reach: 175.3, reachP25: 170.2, reachP75: 177.8 },
  { id: "feather", label: "Plumes", maxKg: 65.8, sex: "H", height: 175.3, reach: 180.3, reachP25: 175.3, reachP75: 182.9 },
  { id: "light", label: "Légers", maxKg: 70.3, sex: "H", height: 177.8, reach: 180.3, reachP25: 177.8, reachP75: 185.4 },
  { id: "welter", label: "Mi-moyens", maxKg: 77.1, sex: "H", height: 182.9, reach: 188.0, reachP25: 182.9, reachP75: 190.5 },
  { id: "middle", label: "Moyens", maxKg: 83.9, sex: "H", height: 185.4, reach: 190.5, reachP25: 185.4, reachP75: 195.6 },
  { id: "lightheavy", label: "Mi-lourds", maxKg: 93.0, sex: "H", height: 190.5, reach: 194.3, reachP25: 190.5, reachP75: 200.7 },
  { id: "heavy", label: "Lourds", maxKg: 120.2, sex: "H", height: 190.5, reach: 198.1, reachP25: 190.5, reachP75: 203.2 },
  { id: "wstraw", label: "Pailles", maxKg: 52.2, sex: "F", height: 160.0, reach: 162.6, reachP25: 160.0, reachP75: 165.1 },
  { id: "wfly", label: "Mouches", maxKg: 56.7, sex: "F", height: 167.6, reach: 170.2, reachP25: 165.1, reachP75: 172.7 },
  { id: "wbantam", label: "Coqs", maxKg: 61.2, sex: "F", height: 170.2, reach: 170.2, reachP25: 167.6, reachP75: 172.7 },
];

export const LEVELS = [
  { id: 1, label: "Fondations", hint: "Moins de 6 mois de pratique" },
  { id: 2, label: "Construction", hint: "6 à 18 mois" },
  { id: 3, label: "Identité", hint: "18 à 36 mois, je construis mon style" },
  { id: 4, label: "Compétiteur", hint: "Je prépare des combats" },
];

export const ORIGINS = [
  { id: "none", label: "Aucun" },
  { id: "striking", label: "Boxe, kick, muay thaï" },
  { id: "wrestling", label: "Lutte, judo, sambo" },
  { id: "grappling", label: "Jiu-jitsu, Luta Livre" },
];

export const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const DAYS_LONG = ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"];

// Planning adultes du club FIGHT ART, saison 2026-2027 (Marseillan). day : 0 = lundi.
export const CLUB_CLASSES = [
  { id: "mma-fond", day: 1, start: "18:15", end: "19:45", name: "MMA Fondamentaux", kind: "tech" },
  { id: "mma-dev", day: 1, start: "20:00", end: "21:30", name: "MMA Développement", kind: "tech" },
  { id: "ll-fond", day: 2, start: "18:45", end: "20:15", name: "Luta Livre Fondamentaux", kind: "tech" },
  { id: "ll-dev", day: 2, start: "20:30", end: "22:00", name: "Luta Livre Développement", kind: "tech" },
  { id: "atelier", day: 3, start: "15:00", end: "16:00", name: "Atelier perfectionnement", kind: "tech", note: "Atelier perso (Full Access)" },
  { id: "liaison", day: 3, start: "16:00", end: "17:00", name: "Liaison MMA et Luta Livre", kind: "tech", note: "On connecte MMA et Luta Livre (Full Access)" },
  { id: "sparring", day: 4, start: "18:45", end: "20:00", name: "Sparring progressif", kind: "sparring", note: "Niveau 1 découverte, niveau 2 intensité contrôlée, Team travail plus avancé" },
  { id: "team-ven", day: 4, start: "20:00", end: "21:30", name: "Fight Art Team", kind: "sparring", note: "Sparring compétition, préparation de combats, coaching individuel" },
  { id: "ll-expert", day: 5, start: "10:45", end: "12:00", name: "Luta Livre Expert", kind: "tech", note: "Full Access" },
  { id: "team-sam", day: 5, start: "12:00", end: "13:00", name: "Fight Art Team", kind: "tech", note: "Préparation technique, tactique et mentale" },
];
export const PARCOURS = [
  { id: "essentielle", label: "Essentielle", classes: ["mma-fond", "ll-fond", "sparring"] },
  { id: "mma", label: "MMA", classes: ["mma-fond", "mma-dev", "sparring"] },
  { id: "luta", label: "Luta Livre", classes: ["ll-fond", "ll-dev", "sparring"] },
  { id: "full", label: "Full Access", classes: ["mma-fond", "mma-dev", "ll-fond", "ll-dev", "atelier", "liaison", "sparring", "ll-expert"] },
];
export const classesOn = (p, di) => (p?.classes || []).map((id) => CLUB_CLASSES.find((c) => c.id === id)).filter((c) => c && c.day === di).sort((a, b) => a.start.localeCompare(b.start));
export const hm = (t) => t.replace(":", "h");
export const clubDaysOf = (p) => (p?.classes?.length ? [...new Set(p.classes.map((id) => CLUB_CLASSES.find((c) => c.id === id)?.day).filter((d) => d !== undefined))] : p?.clubDays || []);

// Séances de force : modèle ondulatoire du coach (lourd / rapide / volume)
export const STRENGTH = {
  force: {
    title: "Lourd",
    why: "Jour lourd : on soulève les charges les plus lourdes de la semaine.",
    gym: [
      { id: "deadlift", name: "Soulevé de terre", sets: 5, reps: 5, rest: "2-4 min", inc: 5 },
      { id: "bench", name: "Développé couché", sets: 5, reps: 5, rest: "60-90 s en superset", inc: 2.5, superset: "row" },
      { id: "row", name: "Tirage haltère", sets: 5, reps: 8, rest: "60-90 s en superset", inc: 1 },
      { id: "clean", name: "Power clean (ou kettlebell swing)", sets: 5, reps: 5, rest: "2 min", inc: 2.5 },
    ],
    home: [
      { id: "h_split", name: "Squat bulgare", sets: 5, reps: 8, rest: "90 s", note: "Par jambe, lent à la descente" },
      { id: "h_pushup", name: "Pompes lestées ou déclinées", sets: 5, reps: 8, rest: "60 s" },
      { id: "h_pull", name: "Tractions (ou rowing sous une table)", sets: 5, reps: 6, rest: "90 s" },
      { id: "h_jump", name: "Sauts groupés", sets: 5, reps: 5, rest: "90 s", note: "Récupération complète" },
    ],
  },
  vitesse: {
    title: "Rapide",
    why: "Jour léger : charges plus faibles, mouvements rapides, moins de fatigue.",
    gym: [
      { id: "squat", name: "Squat", sets: 5, reps: 5, rest: "2-4 min", inc: 5 },
      { id: "latpull", name: "Tirage poulie haute", sets: 5, reps: 8, rest: "30-90 s en superset", inc: 2.5, superset: "incline" },
      { id: "incline", name: "Développé incliné", sets: 5, reps: 8, rest: "30-90 s en superset", inc: 1 },
      { id: "core1", name: "Roue abdominale (puis dragon flag)", sets: 3, reps: 10, rest: "60 s" },
    ],
    home: [
      { id: "h_squatjump", name: "Squat sauté", sets: 5, reps: 5, rest: "90 s" },
      { id: "h_pikepush", name: "Pompes piquées", sets: 4, reps: 8, rest: "60 s" },
      { id: "h_rowtable", name: "Rowing inversé", sets: 4, reps: 10, rest: "60 s" },
      { id: "h_hollow", name: "Gainage hollow", sets: 3, reps: 30, rest: "45 s", note: "Secondes" },
    ],
  },
  volume: {
    title: "Volume",
    why: "Jour volume : plus de séries pour construire le muscle, avant le week-end de récupération.",
    gym: [
      { id: "lunge", name: "Fentes", sets: 5, reps: 10, rest: "2 min", inc: 1 },
      { id: "barrow", name: "Tirage barre", sets: 6, reps: 5, rest: "30-90 s en superset", inc: 2.5, superset: "dbbench" },
      { id: "dbbench", name: "Développé couché haltères", sets: 6, reps: 8, rest: "30-90 s en superset", inc: 1 },
      { id: "rotation", name: "Rotation barre (landmine)", sets: 3, reps: 5, rest: "45 s", note: "Par côté" },
    ],
    home: [
      { id: "h_lunge", name: "Fentes marchées", sets: 5, reps: 12, rest: "60 s" },
      { id: "h_pushup2", name: "Pompes", sets: 5, reps: 15, rest: "45 s" },
      { id: "h_pull2", name: "Tractions ou rowing élastique", sets: 5, reps: 8, rest: "60 s" },
      { id: "h_side", name: "Gainage latéral", sets: 3, reps: 30, rest: "30 s", note: "Secondes par côté" },
    ],
  },
};

export const CARDIO = [
  { name: "Rameur, ski erg ou vélo sur la durée d'un combat", detail: "3 × 5 min, 1 min de repos" },
];

// Mobilité et mouvement (UFC PI + Ido Portal)
export const MOBILITY = {
  title: "Mobilité",
  minutes: 12,
  items: [
    { name: "Squat de repos", detail: "2 min au total, détendu" },
    { name: "Ouverture de hanche 90/90", detail: "8 transitions" },
    { name: "Extension de hanche (fente basse)", detail: "45 s par côté" },
    { name: "Rotations thoraciques au sol", detail: "8 par côté" },
    { name: "Suspension passive", detail: "3 × 20 s" },
    { name: "Nuque : isométrie dans les 4 directions", detail: "4 × 10 s" },
  ],
};

export const MOVEMENT = {
  title: "Bloc mouvement",
  minutes: 15,
  items: [
    { name: "Squat de repos", detail: "Accumuler 3 min" },
    { name: "Suspension active", detail: "Omoplates engagées, 4 × 15 s" },
    { name: "Locomotion au sol (marche de l'ours, crabe)", detail: "4 × 20 m" },
    { name: "Vagues de colonne", detail: "Avant, arrière, côtés : 6 de chaque" },
    { name: "Jeu de réaction (bâton ou balle)", detail: "3 × 1 min" },
  ],
};

// Bibliothèque de drills solo
export const DRILL_GROUPS = [
  {
    id: "wrestling", title: "Lutte et Luta Livre debout",
    drills: [
      { name: "Garde et déplacements", how: "Avancer, reculer, tourner, changer de jambe avant, sans jamais croiser les pieds." },
      { name: "Pas de pénétration", how: "Changement de niveau, genou au sol, tête haute, remonter en garde." },
      { name: "Sprawl", how: "Hanches au sol, jambes en arrière, revenir en garde le plus vite possible." },
      { name: "Drop step", how: "Le pas arrière des projections, des deux côtés, fesses sorties en fin de mouvement." },
      { name: "Shots en shadow", how: "Feinte, entrée, finition double-leg ou single-leg, retour en garde." },
    ],
  },
  {
    id: "ground", title: "Au sol",
    drills: [
      { name: "Shrimp (sortie de hanche)", how: "Sur le dos, pousser avec le pied, hanche vers l'arrière. Toutes les variantes." },
      { name: "Pont et pont + shrimp", how: "Hanches hautes par-dessus l'épaule, puis sortie de hanche." },
      { name: "Relevé technique", how: "Une main au sol, un pied au sol, la jambe libre passe derrière, garde protégée." },
      { name: "Sit-out et hip heist", how: "Depuis la tortue, sortir la jambe et pivoter face à l'adversaire imaginaire." },
      { name: "Granby roll", how: "Roulade latérale tête rentrée pour récupérer la garde. Lentement au début." },
      { name: "Chutes (ukemi)", how: "Arrière et latérales, frapper le sol avec le bras, menton rentré." },
    ],
  },
  {
    id: "boxing", title: "Boxe",
    drills: [
      { name: "Shadow jab seul", how: "Jab en entrant, jab en sortant, jab au corps. Toujours revenir en garde." },
      { name: "Shadow enchaînements", how: "2 à 4 coups, finir par une sortie d'angle." },
      { name: "Esquives et retours", how: "Esquive menée par la tête, puis contre immédiat." },
      { name: "Feinte puis contre", how: "Feinte d'uppercut ou de overhand, observer, contrer avec les hanches." },
    ],
  },
  {
    id: "kick", title: "Kickboxing et muay thaï",
    drills: [
      { name: "Low kick au mollet", how: "Court, rapide, retour immédiat en garde. Utile contre un lutteur." },
      { name: "Blocage de low kick", how: "Lever le genou vers le coude, poids sur la jambe d'appui." },
      { name: "Enchaînements hollandais", how: "Poings pour ouvrir, finir par un low kick. Même enchaînement répété jusqu'à l'automatisme." },
      { name: "Genoux en clinch (shadow)", how: "Mains derrière la nuque imaginaire, hanches vers l'avant." },
    ],
  },
  {
    id: "mma", title: "Transitions MMA",
    drills: [
      { name: "Frappe puis amenée au sol", how: "Jab, direct, changement de niveau sous le contre imaginé." },
      { name: "Sprawl puis frappe", how: "Défendre l'amenée, revenir debout et enchaîner un direct." },
      { name: "Se relever contre la cage (mur)", how: "Dos au mur, mains en cadre, pieds sous soi, remonter le long du mur." },
      { name: "Shadow grappling complet", how: "Debout, amenée, contrôle, ground and pound, relevé. Visualiser l'adversaire." },
    ],
  },
];

export const DRILL_FORMATS = [
  { id: "base", label: "30 / 30", work: 30, rest: 30, rounds: 10, hint: "Base, technique propre" },
  { id: "fast", label: "45 / 15", work: 45, rest: 15, rounds: 10, hint: "Plus intense" },
  { id: "tech", label: "20 / 40", work: 20, rest: 40, rounds: 10, hint: "Technique, apprentissage" },
  { id: "mma", label: "Rounds MMA", work: 300, rest: 60, rounds: 3, hint: "3 × 5 min" },
  { id: "pro", label: "Rounds pros", work: 300, rest: 60, rounds: 5, hint: "5 × 5 min" },
];

// Batterie de tests
export const TESTS = [
  { id: "cmj", name: "Saut vertical", unit: "cm", better: "up", how: "Meilleur de 3 sauts, avec l'appli My Jump.", ref: (p) => p.sex === "F" ? "Repère UFC : 38 cm (mouches F)" : "Repère UFC : 45 à 60 cm selon la catégorie" },
  { id: "pullups", name: "Tractions strictes", unit: "rép.", better: "up", how: "Bras tendus en bas, menton au-dessus de la barre.", ref: (p) => p.sex === "F" ? "Objectif : plus de 11" : "Objectif : plus de 15", target: (p) => p.sex === "F" ? 11 : 15 },
  { id: "pushups", name: "Pompes strictes", unit: "rép.", better: "up", how: "Corps gainé, poitrine près du sol.", ref: (p) => p.sex === "F" ? "Objectif : plus de 38" : "Objectif : plus de 50", target: (p) => p.sex === "F" ? 38 : 50 },
  { id: "row2k", name: "Rameur 2 000 m", unit: "s", better: "down", how: "Temps total en secondes.", ref: (p) => p.sex === "F" ? "Objectif : moins de 9 min 20" : "Objectif : moins de 7 min 30", target: (p) => p.sex === "F" ? 560 : 450 },
  { id: "squat1rm", name: "Squat (maximum estimé)", unit: "kg", better: "up", how: "Une série de moins de 12 répétitions : l'appli estime le maximum.", ref: (p) => p.sex === "F" ? "Objectif : 1,5 × le poids du corps" : "Objectif : 2 × le poids du corps", ratio: (p) => p.sex === "F" ? 1.5 : 2 },
  { id: "dl1rm", name: "Soulevé de terre (maximum estimé)", unit: "kg", better: "up", how: "Une série de moins de 12 répétitions.", ref: (p) => p.sex === "F" ? "Objectif : 1,9 × le poids du corps" : "Objectif : 2,5 × le poids du corps", ratio: (p) => p.sex === "F" ? 1.9 : 2.5 },
  { id: "bench1rm", name: "Développé couché (maximum estimé)", unit: "kg", better: "up", how: "Une série de moins de 12 répétitions.", ref: (p) => p.sex === "F" ? "Objectif : 1,1 × le poids du corps" : "Objectif : 1,5 × le poids du corps", ratio: (p) => p.sex === "F" ? 1.1 : 1.5 },
];

// Aliments courants (valeurs moyennes pour 100 g, à titre indicatif)
export const QUICK_FOODS = [
  { name: "Riz blanc cuit", kcal: 130, p: 2.7, c: 28, f: 0.3 },
  { name: "Pâtes cuites", kcal: 150, p: 5.5, c: 30, f: 0.9 },
  { name: "Flocons d'avoine", kcal: 370, p: 13, c: 59, f: 7 },
  { name: "Pain complet", kcal: 245, p: 9, c: 42, f: 3 },
  { name: "Pomme de terre cuite", kcal: 85, p: 2, c: 18, f: 0.1 },
  { name: "Patate douce cuite", kcal: 90, p: 2, c: 20, f: 0.2 },
  { name: "Blanc de poulet cuit", kcal: 165, p: 31, c: 0, f: 3.6 },
  { name: "Bœuf haché 5 % cuit", kcal: 175, p: 27, c: 0, f: 7 },
  { name: "Saumon cuit", kcal: 205, p: 22, c: 0, f: 13 },
  { name: "Thon au naturel", kcal: 115, p: 26, c: 0, f: 1 },
  { name: "Œuf entier", kcal: 145, p: 12.5, c: 0.7, f: 10 },
  { name: "Fromage blanc 0 %", kcal: 50, p: 7.5, c: 4, f: 0.2 },
  { name: "Skyr", kcal: 63, p: 11, c: 4, f: 0.2 },
  { name: "Lentilles cuites", kcal: 115, p: 9, c: 17, f: 0.4 },
  { name: "Banane", kcal: 90, p: 1.1, c: 21, f: 0.3 },
  { name: "Pomme", kcal: 52, p: 0.3, c: 12, f: 0.2 },
  { name: "Légumes verts cuits", kcal: 30, p: 2, c: 4, f: 0.3 },
  { name: "Huile d'olive", kcal: 900, p: 0, c: 0, f: 100 },
  { name: "Amandes", kcal: 600, p: 21, c: 9, f: 52 },
  { name: "Whey (protéine en poudre)", kcal: 380, p: 78, c: 7, f: 5 },
];

export const MEALS = [
  { id: "breakfast", label: "Petit-déjeuner" },
  { id: "lunch", label: "Déjeuner" },
  { id: "snack", label: "Collation" },
  { id: "dinner", label: "Dîner" },
];

export const PAIN_ZONES = ["Nuque", "Épaule", "Coude", "Main / poignet", "Dos", "Hanche", "Genou", "Cheville / pied", "Côtes"];
