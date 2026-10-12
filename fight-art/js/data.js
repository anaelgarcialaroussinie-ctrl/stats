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
  { id: "mma-fond", day: 1, start: "18:15", end: "19:45", name: "MMA Fondamentaux", kind: "tech", stage: "Découverte", text: "Les bases du MMA : garde, déplacements, frappes, amenées au sol, positions et sorties." },
  { id: "mma-dev", day: 1, start: "20:00", end: "21:30", name: "MMA Développement", kind: "tech", stage: "Développement", text: "On construit ses systèmes : enchaînements, transitions frappe, lutte et sol." },
  { id: "ll-fond", day: 2, start: "18:45", end: "20:15", name: "Luta Livre Fondamentaux", kind: "tech", stage: "Découverte", text: "Les bases de la Luta Livre : positions, contrôles, sorties, premières soumissions." },
  { id: "ll-dev", day: 2, start: "20:30", end: "22:00", name: "Luta Livre Développement", kind: "tech", stage: "Développement", text: "On construit son jeu de grappling : passages, gardes, enchaînements de soumissions." },
  { id: "atelier", day: 3, start: "15:00", end: "16:00", name: "Atelier perfectionnement", kind: "tech", stage: "Atelier", note: "Full Access", text: "Atelier perso : on approfondit ses compétences sur ses points à travailler." },
  { id: "liaison", day: 3, start: "16:00", end: "17:00", name: "Liaison", kind: "tech", stage: "Liaison", note: "Full Access", text: "On connecte le MMA et la Luta Livre." },
  { id: "sparring", day: 4, start: "18:45", end: "20:00", name: "Sparring progressif", kind: "sparring", stage: "Sparring", text: "On applique et on s'améliore. Ouvert à tous les adultes, engagement adapté : niveau 1 découverte et apprentissage, niveau 2 intensité contrôlée, Team travail plus avancé." },
  { id: "team-ven", day: 4, start: "20:00", end: "21:30", name: "Fight Art Team", kind: "sparring", stage: "Team", text: "Sparring compétition, préparation de combats, coaching individuel." },
  { id: "ll-expert", day: 5, start: "10:45", end: "12:00", name: "Luta Livre Expert", kind: "tech", stage: "Expert", note: "Full Access", text: "Luta Livre niveau avancé." },
  { id: "team-sam", day: 5, start: "12:00", end: "13:00", name: "Fight Art Team", kind: "tech", stage: "Team", text: "Préparation technique, tactique et mentale." },
];
export const CLUB_METHOD = {
  motto: "Une méthode. Une progression. Un état d'esprit.",
  goal: "Comprendre le combat dans sa globalité pour devenir un pratiquant complet, intelligent et performant.",
  steps: [["Découverte", "On apprend les bases."], ["Développement", "On construit les systèmes."], ["Ateliers", "On approfondit ses compétences."], ["Liaison", "On connecte MMA et Luta Livre."], ["Sparring", "On applique et on s'améliore."]],
};
export const PARCOURS = [
  { id: "essentielle", label: "Essentielle", classes: ["mma-fond", "ll-fond", "sparring"] },
  { id: "mma", label: "MMA", classes: ["mma-fond", "mma-dev", "sparring"] },
  { id: "luta", label: "Luta Livre", classes: ["ll-fond", "ll-dev", "sparring"] },
  { id: "full", label: "Full Access", classes: ["mma-fond", "mma-dev", "ll-fond", "ll-dev", "atelier", "liaison", "sparring", "ll-expert"] },
];
export const classesOn = (p, di) => (p?.classes || []).map((id) => CLUB_CLASSES.find((c) => c.id === id)).filter((c) => c && c.day === di).sort((a, b) => a.start.localeCompare(b.start));
export const hm = (t) => t.replace(":", "h");
export const clubDaysOf = (p) => (p?.classes?.length ? [...new Set(p.classes.map((id) => CLUB_CLASSES.find((c) => c.id === id)?.day).filter((d) => d !== undefined))] : p?.clubDays || []);

// Séances de force : voir sc-data.js (Lourd / Rapide / Volume, version MMA)
export { SC_SESSIONS as STRENGTH } from "./sc-data.js";

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
      { name: "Pas de pénétration (drop step)", how: "Changement de niveau, genou au sol, tête haute, remonter en garde." },
      { name: "Sprawl", how: "Hanches au sol, jambes en arrière, revenir en garde le plus vite possible." },
      { name: "Pas de pénétration en rotation", how: "Pas de pénétration, puis rotation sur le genou et le pied pour finir en angle. Des deux côtés." },
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
    id: "movement", title: "Mouvement (inspiration Ido Portal)",
    note: "Inspiré du travail d'Ido Portal avec McGregor et Gunnar Nelson (2015) : locomotion, réactions et relâchement pour garder un corps adaptable. Ce n'est pas du combat : c'est un complément.",
    drills: [
      { name: "Marche de l'ours", how: "Mains et pieds au sol, genoux à 5 cm du sol, dos plat. Avant, arrière, de côté." },
      { name: "Marche du crabe", how: "Face au plafond, hanches hautes. Avant, arrière, puis rotation pour revenir en ours." },
      { name: "Lizard crawl", how: "Très bas, coude contre le genou du même côté à chaque pas, poitrine près du sol." },
      { name: "Locomotion avec changements de direction", how: "Enchaîner ours, crabe et lizard en changeant de direction toutes les 3 secondes, sans s'arrêter." },
      { name: "Roulades avant, arrière et épaule", how: "Menton rentré, dos rond, se relever directement en garde. Lentement au début, sur tapis." },
      { name: "Équilibre sur une ligne", how: "Marcher sur une ligne au sol (ou une poutre basse) en avant, en arrière, puis en s'accroupissant." },
      { name: "Follow the hands (à deux)", how: "Le partenaire déplace lentement ses mains vers toi, tu esquives en te déplaçant, en gardant ta distance. Accélérer progressivement." },
      { name: "Réaction au bâton (à deux)", how: "Le partenaire balaie avec une frite de piscine ou un bâton souple : baisser le niveau, sauter, reculer. Toujours souple, jamais rigide." },
      { name: "Softening et shaking", how: "En fin de séance : relâcher les épaules, la nuque et les hanches en secouant doucement tout le corps, 1 à 2 minutes." },
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

export { ZONES as PAIN_ZONES } from "./sc-data.js";
