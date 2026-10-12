// Préparation physique MMA : force et explosivité d'abord, renforcement spécifique, prévention par zone.
// Bases : force et puissance du bas du corps = ce qui sépare le plus les combattants de haut niveau (James et al., 2017 :
// squat 1,84 vs 1,56 × poids du corps, puissance au squat sauté plus élevée à toutes les charges) ; programme adducteurs
// de Copenhague (−41 % de problèmes d'aine, Harøy et al., 2019) ; Nordic ischio-jambiers (environ deux fois moins de
// blessures dans une méta-analyse de 2019, effet discuté depuis) ; modèle de suivi de la douleur (Silbernagel).
// Organisation du coach : Lourd / Rapide / Volume. Zones = celles du check-in.

export const ZONES = ["Nuque", "Épaule", "Coude", "Main / poignet", "Dos", "Côtes", "Hanche", "Aine / adducteurs", "Ischio-jambiers", "Genou", "Cheville / pied"];

// ---------- bibliothèque d'exercices ----------
// zones : ce que l'exercice sollicite fortement. load : on note une charge. inc : progression en kg.
export const EX = {
  // explosivité
  broad: { name: "Saut en longueur sans élan", zones: ["Genou", "Cheville / pied"], steps: ["Pieds largeur de hanches, bras en arrière.", "Lance les bras et pousse fort dans le sol, le plus loin possible.", "Atterris en douceur, genoux alignés sur les pieds, et tiens 2 secondes."], errors: ["Atterrir jambes tendues.", "Genoux qui rentrent vers l'intérieur."], yt: "broad jump technique landing" },
  cmj: { name: "Saut vertical", zones: ["Genou", "Cheville / pied"], steps: ["Descends vite à mi-hauteur.", "Remonte le plus haut possible en lançant les bras.", "Réception souple, puis remets-toi en place."], errors: ["Pause en bas qui casse l'élan.", "Réception raide."], yt: "countermovement jump technique" },
  boxjump: { name: "Saut sur box", zones: ["Genou", "Cheville / pied"], steps: ["Box à mi-cuisse pour commencer.", "Saut explosif, réception accroupie et silencieuse sur la box.", "Descends en marchant, ne saute pas en arrière."], errors: ["Box trop haute : on finit en boule.", "Redescendre en sautant."], yt: "box jump technique" },
  mbrot: { name: "Lancer de médecine-ball en rotation", zones: ["Dos", "Côtes"], steps: ["De profil à 2 m d'un mur, ballon de 3 à 6 kg à la hanche.", "La rotation part des pieds et des hanches, puis du buste.", "Lance contre le mur le plus fort possible, rattrape et recommence."], errors: ["Lancer avec les bras seulement.", "Pieds plantés qui ne pivotent pas."], yt: "rotational medicine ball scoop toss" },
  mbchest: { name: "Passe poitrine au médecine-ball", zones: ["Épaule", "Coude", "Main / poignet"], steps: ["Face au mur, ballon contre la poitrine.", "Pousse avec les jambes puis les bras, comme un direct à deux mains.", "Lancer le plus fort possible."], errors: ["Ne pas utiliser les jambes."], yt: "medicine ball chest pass explosive" },
  mbslam: { name: "Slam au médecine-ball", zones: ["Dos", "Épaule"], steps: ["Ballon au-dessus de la tête, sur la pointe des pieds.", "Écrase-le au sol de tout ton corps, hanches en arrière.", "Rattrape au rebond et enchaîne."], errors: ["Dos arrondi à la réception du ballon."], yt: "medicine ball slam technique" },
  mbseated: { name: "Lancer de médecine-ball assis", zones: [], steps: ["Assis au sol ou sur un banc, face au mur.", "Lance le ballon poitrine ou en rotation, le plus fort possible.", "Version sans appui des jambes : parfait quand une jambe est blessée."], errors: ["Se pencher en arrière en lançant."], yt: "seated medicine ball throw" },
  hangclean: { name: "Épaulé suspendu (hang power clean)", zones: ["Main / poignet", "Dos", "Coude"], load: true, inc: 2.5, steps: ["Barre au-dessus des genoux, dos plat.", "Extension explosive des hanches, haussement d'épaules, coudes qui tournent vite.", "Réception en quart de squat, barre sur les épaules."], errors: ["Tirer avec les bras.", "Réception jambes tendues."], yt: "hang power clean technique" },
  jumpsquat: { name: "Squat sauté chargé (20 à 30 %)", zones: ["Genou", "Dos", "Cheville / pied"], load: true, inc: 2.5, steps: ["Barre légère sur le dos ou haltères en main.", "Descends à mi-hauteur et saute le plus haut possible.", "Réception souple, une répétition à la fois."], errors: ["Charge trop lourde : on ne décolle plus."], yt: "loaded jump squat" },
  plyopush: { name: "Pompes explosives", zones: ["Main / poignet", "Épaule", "Coude"], steps: ["Position de pompe gainée.", "Pousse assez fort pour que les mains décollent.", "Réception bras souples, et recommence."], errors: ["Bassin qui tombe.", "Réception bras tendus."], yt: "plyometric push up technique" },
  sprint: { name: "Sprints au vélo (6 secondes)", zones: [], steps: ["Vélo, rameur ou assault bike, résistance moyenne.", "6 secondes à fond, puis 60 secondes très tranquilles.", "Arrête si la vitesse baisse nettement."], errors: ["Repos trop court : ça devient du cardio, pas de l'explosivité."], yt: "assault bike sprint intervals 6 seconds" },

  // force
  deadlift: { name: "Soulevé de terre (trap bar de préférence)", zones: ["Dos", "Main / poignet"], load: true, inc: 5, steps: ["Pieds sous la barre, dos plat, poitrine haute.", "Pousse le sol avec les jambes, la barre reste collée.", "Finis debout, hanches en avant, sans te pencher en arrière."], errors: ["Dos qui s'arrondit.", "Barre qui s'éloigne du corps."], yt: "trap bar deadlift technique" },
  squat: { name: "Squat avant (front squat)", zones: ["Genou", "Dos"], load: true, inc: 2.5, steps: ["Barre sur l'avant des épaules, coudes hauts.", "Descends en gardant le buste droit, genoux dans l'axe des pieds.", "Remonte le plus vite possible."], errors: ["Coudes qui tombent.", "Talons qui décollent."], yt: "front squat technique" },
  splitsquat: { name: "Squat bulgare", zones: ["Genou", "Hanche"], load: true, inc: 2, steps: ["Pied arrière sur un banc, haltères en main.", "Descends droit, genou avant aligné sur le pied.", "Pousse dans le talon avant pour remonter."], errors: ["Genou qui rentre.", "Pied avant trop près du banc."], yt: "bulgarian split squat technique" },
  rdl: { name: "Soulevé de terre jambes tendues (RDL)", zones: ["Dos", "Ischio-jambiers"], load: true, inc: 2.5, steps: ["Genoux légèrement fléchis, dos plat.", "Recule les fesses, la barre glisse le long des cuisses.", "Remonte en serrant les fessiers."], errors: ["Dos arrondi.", "Descendre trop bas en perdant le dos plat."], yt: "romanian deadlift technique" },
  hipthrust: { name: "Hip thrust", zones: ["Hanche"], load: true, inc: 5, steps: ["Haut du dos sur un banc, barre sur les hanches (avec une mousse).", "Monte les hanches jusqu'à l'alignement épaules-genoux.", "Serre les fessiers 1 seconde en haut."], errors: ["Creuser le bas du dos en haut."], yt: "hip thrust technique" },
  bench: { name: "Développé couché", zones: ["Épaule", "Coude", "Main / poignet"], load: true, inc: 2.5, steps: ["Omoplates serrées, pieds au sol.", "Descends la barre bas sur la poitrine, coudes à 45°.", "Pousse le plus vite possible."], errors: ["Coudes à 90°.", "Fesses qui décollent."], yt: "bench press technique" },
  landmine: { name: "Développé landmine à un bras", zones: ["Épaule"], load: true, inc: 2.5, steps: ["Debout ou à genoux, l'extrémité de la barre à l'épaule.", "Pousse vers l'avant et le haut en gainant fort.", "Version plus douce pour l'épaule que le développé couché."], errors: ["Se pencher en arrière."], yt: "single arm landmine press" },
  floorpress: { name: "Floor press haltères, prise neutre", zones: ["Coude"], load: true, inc: 2, steps: ["Allongé au sol, haltères paumes face à face.", "Descends jusqu'à ce que les bras touchent le sol.", "Pousse explosif."], errors: ["Rebondir les coudes au sol."], yt: "neutral grip dumbbell floor press" },
  pullup: { name: "Tractions (lestées si possible)", zones: ["Épaule", "Coude", "Main / poignet"], load: true, inc: 1.25, steps: ["Prise neutre ou en pronation, bras tendus.", "Tire la poitrine vers la barre, omoplates en arrière.", "Redescends contrôlé jusqu'en bas."], errors: ["Demi-répétitions.", "Balancer les jambes."], yt: "pull up technique" },
  row: { name: "Rowing haltère à un bras", zones: ["Main / poignet"], load: true, inc: 2, steps: ["Main et genou sur un banc, dos plat.", "Tire le coude vers la hanche.", "Redescends lentement."], errors: ["Tourner le buste pour tricher."], yt: "one arm dumbbell row technique" },
  csrow: { name: "Rowing poitrine appuyée", zones: [], load: true, inc: 2, steps: ["Poitrine sur un banc incliné, haltères en main.", "Tire les coudes vers l'arrière, serre les omoplates.", "Aucune charge sur le bas du dos."], errors: ["Hausser les épaules."], yt: "chest supported dumbbell row" },
  spanish: { name: "Squat espagnol isométrique", zones: [], steps: ["Élastique solide derrière les genoux, attaché à un poteau.", "Descends en squat, tibias verticaux, et tiens la position.", "5 × 45 secondes, effort 7 sur 10."], errors: ["Laisser les genoux avancer."], yt: "spanish squat isometric knee" },

  // spécifique MMA
  neck4: { name: "Nuque : isométrie 4 directions", zones: ["Nuque"], steps: ["Main ou élastique contre le front : pousse sans bouger la tête.", "Puis l'arrière, puis chaque côté.", "Effort progressif, respiration continue."], errors: ["Pousser d'un coup.", "Bloquer la respiration."], yt: "neck isometric 4 way" },
  farmer: { name: "Marche du fermier", zones: ["Main / poignet"], load: true, inc: 2, steps: ["Une charge lourde dans chaque main.", "Marche droit, épaules basses, gainé.", "Serre fort : c'est ton grip de lutte."], errors: ["Se pencher d'un côté."], yt: "farmers walk technique" },
  pallof: { name: "Pallof press (anti-rotation)", zones: [], steps: ["De profil à un élastique ou une poulie, mains à la poitrine.", "Tends les bras devant toi sans laisser le buste tourner.", "Tiens 2 secondes, reviens."], errors: ["Laisser les hanches tourner."], yt: "pallof press" },
  copenhagen: { name: "Copenhague (adducteurs)", zones: ["Aine / adducteurs"], steps: ["Gainage latéral, jambe du dessus posée sur un banc.", "Niveau 1 : genou sur le banc. Niveau 2 : cheville sur le banc.", "Monte et descends la hanche lentement."], errors: ["Bassin qui tombe.", "Commencer directement au niveau 2."], yt: "copenhagen adductor exercise progression" },
  nordic: { name: "Nordic ischio-jambiers", zones: ["Ischio-jambiers", "Genou"], steps: ["À genoux, chevilles bloquées par un partenaire ou un meuble.", "Descends vers l'avant le plus lentement possible, corps droit.", "Rattrape-toi avec les mains, remonte en t'aidant."], errors: ["Casser aux hanches.", "Trop de répétitions au début : 3 à 5 suffisent."], yt: "nordic hamstring curl progression" },
  towelhang: { name: "Suspension à la serviette", zones: ["Main / poignet", "Coude", "Épaule"], steps: ["Deux serviettes passées sur une barre.", "Suspends-toi en serrant fort, bras tendus.", "Le grip du clinch et du contrôle des poignets."], errors: ["Épaules qui remontent aux oreilles."], yt: "towel hang grip training" },
  tgu: { name: "Turkish get-up", zones: ["Épaule", "Main / poignet"], load: true, inc: 2, steps: ["Allongé, kettlebell tenue bras tendu vers le plafond.", "Relève-toi en plusieurs étapes, les yeux sur la charge.", "Redescends dans l'ordre inverse."], errors: ["Aller trop vite.", "Bras qui plie."], yt: "turkish get up step by step" },
  deadbug: { name: "Dead bug", zones: [], steps: ["Sur le dos, bras vers le plafond, genoux à 90°.", "Tends un bras et la jambe opposée sans décoller le bas du dos.", "Reviens et change de côté."], errors: ["Bas du dos qui se creuse."], yt: "dead bug exercise" },
  sideplank: { name: "Gainage latéral", zones: [], steps: ["Sur l'avant-bras, corps aligné.", "Hanches hautes, tiens la position."], errors: ["Hanches qui tombent."], yt: "side plank technique" },

  // maison
  h_split: { name: "Squat bulgare (sac à dos lesté)", zones: ["Genou", "Hanche"], steps: ["Pied arrière sur une chaise, sac lesté sur le dos.", "Descends lentement, remonte vite."], errors: ["Genou qui rentre."], yt: "bulgarian split squat at home" },
  h_tuck: { name: "Sauts groupés", zones: ["Genou", "Cheville / pied"], steps: ["Saute en ramenant les genoux à la poitrine.", "Réception souple, repos complet entre les sauts."], errors: ["Enchaîner sans réception propre."], yt: "tuck jump technique" },
  h_pushup: { name: "Pompes déficitaires ou lestées", zones: ["Épaule", "Main / poignet"], steps: ["Mains sur deux livres ou poignées, poitrine plus bas que les mains.", "Descente lente, montée explosive."], errors: ["Bassin qui tombe."], yt: "deficit push ups" },
  h_pull: { name: "Tractions ou rowing sous une table", zones: ["Épaule", "Coude"], steps: ["Allongé sous une table solide, tire la poitrine vers le plateau.", "Corps gainé, redescends contrôlé."], errors: ["Hanches qui tombent."], yt: "inverted row under table" },
  h_slrdl: { name: "Soulevé de terre sur une jambe", zones: ["Ischio-jambiers", "Dos"], steps: ["Sac en main, sur une jambe.", "Bascule le buste en avant, jambe libre tendue derrière.", "Remonte en serrant le fessier."], errors: ["Bassin qui s'ouvre."], yt: "single leg romanian deadlift" },
};

// ---------- remplacements automatiques selon la zone douloureuse ou fragile ----------
// zone → { exercice : remplaçant }. Si rien n'est prévu, l'exercice est retiré et un exercice de prévention est ajouté.
export const SUBS = {
  "Genou": { broad: "mbseated", cmj: "mbseated", boxjump: "mbseated", jumpsquat: "sprint", squat: "spanish", splitsquat: "hipthrust", h_split: "hipthrust", h_tuck: "mbseated", nordic: "hipthrust" },
  "Cheville / pied": { broad: "mbseated", cmj: "mbseated", boxjump: "mbseated", jumpsquat: "hangclean", h_tuck: "mbseated" },
  "Dos": { deadlift: "hipthrust", rdl: "hipthrust", squat: "splitsquat", mbrot: "pallof", mbslam: "mbchest", hangclean: "sprint", jumpsquat: "sprint", row: "csrow", h_slrdl: "hipthrust" },
  "Épaule": { bench: "floorpress", landmine: "floorpress", pullup: "csrow", plyopush: "sprint", mbchest: "sprint", mbslam: "sprint", tgu: "pallof", towelhang: "farmer", h_pushup: "deadbug", h_pull: "deadbug" },
  "Coude": { bench: "landmine", floorpress: "landmine", pullup: "csrow", plyopush: "sprint", mbchest: "sprint", towelhang: "farmer", hangclean: "jumpsquat", h_pull: "deadbug" },
  "Main / poignet": { bench: "floorpress", hangclean: "jumpsquat", plyopush: "sprint", mbchest: "sprint", pullup: "csrow", farmer: "pallof", towelhang: "pallof", tgu: "deadbug", h_pushup: "deadbug" },
  "Côtes": { mbrot: "sprint", mbslam: "sprint", mbchest: "sprint", pallof: "deadbug", plyopush: "sprint" },
  "Hanche": { splitsquat: "spanish", h_split: "spanish", hipthrust: "csrow" },
  "Aine / adducteurs": { splitsquat: "hipthrust", h_split: "hipthrust", copenhagen: "sideplank" },
  "Ischio-jambiers": { rdl: "hipthrust", nordic: "sideplank", h_slrdl: "hipthrust", broad: "mbseated" },
  "Nuque": { neck4: "deadbug" },
};

// ---------- séances (organisation du coach : Lourd, Rapide, Volume) ----------
// Chaque séance : explosivité d'abord (système nerveux frais), puis force, puis spécifique MMA.
export const SC_SESSIONS = {
  force: {
    title: "Lourd", focus: "Force maximale",
    why: "Jour lourd : des charges lourdes, peu de répétitions, chaque répétition poussée le plus vite possible. Garde 2 répétitions en réserve.",
    gym: {
      power: [{ id: "broad", sets: 4, reps: "3", rest: "90 s" }, { id: "mbrot", sets: 3, reps: "4 par côté", rest: "60 s" }],
      strength: [{ id: "deadlift", sets: 4, reps: 3, rest: "3 min" }, { id: "bench", sets: 4, reps: 4, rest: "en alternance", pair: "pullup" }, { id: "pullup", sets: 4, reps: 4, rest: "2 min" }],
      mma: [{ id: "neck4", sets: 3, reps: "10 s par direction", rest: "30 s" }, { id: "farmer", sets: 3, reps: "30 m", rest: "60 s" }],
    },
    home: {
      power: [{ id: "broad", sets: 4, reps: "3", rest: "90 s" }, { id: "h_tuck", sets: 3, reps: "4", rest: "90 s" }],
      strength: [{ id: "h_split", sets: 4, reps: "6 par jambe", rest: "2 min" }, { id: "h_pushup", sets: 4, reps: "6", rest: "90 s" }, { id: "h_pull", sets: 4, reps: "6", rest: "90 s" }],
      mma: [{ id: "neck4", sets: 3, reps: "10 s par direction", rest: "30 s" }, { id: "sideplank", sets: 3, reps: "30 s par côté", rest: "30 s" }],
    },
  },
  vitesse: {
    title: "Rapide", focus: "Puissance et vitesse",
    why: "Jour rapide : charges modérées soulevées le plus vite possible. Dès que la vitesse baisse, la série s'arrête. C'est la qualité qui sépare le plus les combattants de haut niveau.",
    gym: {
      power: [{ id: "hangclean", sets: 5, reps: 2, rest: "2 min" }, { id: "cmj", sets: 4, reps: "3", rest: "60 s" }, { id: "mbchest", sets: 3, reps: "5", rest: "60 s" }],
      strength: [{ id: "squat", sets: 4, reps: 3, rest: "2 min", note: "70 à 75 % de ton max, le plus vite possible, puis 2 sauts verticaux" }, { id: "plyopush", sets: 3, reps: "5", rest: "90 s" }, { id: "row", sets: 3, reps: 6, rest: "60 s", note: "Tirage explosif" }],
      mma: [{ id: "pallof", sets: 3, reps: "8 par côté", rest: "30 s" }, { id: "sprint", sets: 6, reps: "6 s", rest: "60 s" }],
    },
    home: {
      power: [{ id: "cmj", sets: 4, reps: "3", rest: "60 s" }, { id: "plyopush", sets: 4, reps: "4", rest: "90 s" }],
      strength: [{ id: "h_split", sets: 4, reps: "4 par jambe, explosif", rest: "90 s" }, { id: "h_pull", sets: 3, reps: "6, tirage explosif", rest: "60 s" }],
      mma: [{ id: "pallof", sets: 3, reps: "8 par côté (élastique)", rest: "30 s" }, { id: "deadbug", sets: 3, reps: "8 par côté", rest: "30 s" }],
    },
  },
  volume: {
    title: "Volume", focus: "Force sur une jambe, structure et prévention",
    why: "Jour volume : plus de séries, travail sur une jambe et renforcement des zones qui se blessent en MMA (aine, ischio-jambiers, nuque, grip).",
    gym: {
      power: [{ id: "mbslam", sets: 3, reps: "5", rest: "60 s" }, { id: "boxjump", sets: 3, reps: "3", rest: "60 s" }],
      strength: [{ id: "splitsquat", sets: 3, reps: 6, rest: "90 s", note: "Par jambe" }, { id: "rdl", sets: 3, reps: 6, rest: "2 min" }, { id: "landmine", sets: 3, reps: 8, rest: "en alternance", pair: "csrow", note: "Par bras" }, { id: "csrow", sets: 3, reps: 8, rest: "90 s" }],
      mma: [{ id: "copenhagen", sets: 3, reps: "6 par côté", rest: "45 s" }, { id: "nordic", sets: 3, reps: "4", rest: "90 s" }, { id: "towelhang", sets: 3, reps: "20 s", rest: "60 s" }, { id: "neck4", sets: 2, reps: "10 s par direction", rest: "30 s" }],
    },
    home: {
      power: [{ id: "h_tuck", sets: 3, reps: "4", rest: "60 s" }],
      strength: [{ id: "h_split", sets: 3, reps: "10 par jambe", rest: "60 s" }, { id: "h_slrdl", sets: 3, reps: "8 par jambe", rest: "60 s" }, { id: "h_pushup", sets: 3, reps: "12", rest: "60 s" }, { id: "h_pull", sets: 3, reps: "10", rest: "60 s" }],
      mma: [{ id: "copenhagen", sets: 3, reps: "6 par côté (chaise)", rest: "45 s" }, { id: "nordic", sets: 3, reps: "4 (pieds sous le canapé)", rest: "90 s" }, { id: "neck4", sets: 2, reps: "10 s par direction", rest: "30 s" }],
    },
  },
};

export const WARMUP = "Échauffement 8 minutes : 3 minutes de vélo ou de corde, mobilité des hanches et des épaules, 2 × 5 sauts légers, puis 2 séries de montée en charge sur le premier exercice de force.";

// phase selon la date du combat
export function scPhase(dtc) {
  if (dtc === null || dtc === undefined || dtc < 0 || dtc > 42) return { id: "dev", label: "Développement", text: "Construire la force et l'explosivité : programme complet." };
  if (dtc > 21) return { id: "force", label: "Camp · force", text: "Camp en cours : on garde les charges, on réduit un peu le volume des accessoires." };
  if (dtc > 7) return { id: "power", label: "Camp · puissance", text: "J-21 à J-8 : une série de moins en force, l'explosivité reste au maximum." };
  return { id: "taper", label: "Affûtage", text: "Semaine du combat : plus de séance de force, seulement de l'activation." };
}

// ---------- prévention et renforcement par zone ----------
export const PREHAB = {
  "Nuque": { why: "Une nuque plus forte est associée à moins de commotions dans les études chez les jeunes sportifs, et aide à encaisser au clinch et en lutte.", items: [["Rentrer le menton (chin tuck), allongé", "3 × 10, tenir 3 s"], ["Nuque : isométrie 4 directions", "3 × 10 s par direction, effort 5 sur 10"], ["Nuque à l'élastique, amplitude lente", "2 × 12 par direction"]] },
  "Épaule": { why: "L'épaule est l'une des zones les plus touchées en grappling (clés, chutes, cadres). On renforce les rotateurs et les omoplates.", items: [["Rotation externe à l'élastique, coude à 90°", "3 × 12 par bras"], ["Y-T-W allongé sur le ventre", "2 × 8 de chaque lettre"], ["Pompes scapulaires", "3 × 10"], ["Port de kettlebell à l'envers (bottoms-up)", "3 × 20 m par bras"]] },
  "Coude": { why: "Les tendons du coude souffrent des saisies et des clés de bras. Le travail excentrique lent est la base.", items: [["Extension de poignet excentrique (haltère léger)", "3 × 15, descente en 3 s"], ["Pronation et supination au marteau", "3 × 12"], ["Isométrie de flexion du coude", "4 × 30 s, effort 6 sur 10"]] },
  "Main / poignet": { why: "Frappes, saisies et appuis au sol : le poignet et les doigts encaissent tout.", items: [["Rouleau de poignet (wrist roller)", "3 montées et descentes"], ["Extension des doigts à l'élastique", "3 × 20"], ["Appui sur les poings, progressif", "3 × 20 s"]] },
  "Dos": { why: "Les 3 exercices de McGill renforcent le tronc sans charger la colonne : la base quand le dos est fragile.", items: [["Curl-up de McGill", "3 × 8, tenir 8 s"], ["Gainage latéral", "3 × 20 s par côté"], ["Bird dog (quadrupédie bras-jambe opposés)", "3 × 8 par côté, tenir 8 s"]] },
  "Côtes": { why: "Une côte touchée demande d'abord un avis médical. Ensuite : respiration et gainage sans rotation.", items: [["Respiration abdominale lente", "5 min"], ["Dead bug", "3 × 6 par côté"], ["Gainage sur les genoux", "3 × 20 s"]] },
  "Hanche": { why: "Hanches mobiles et fortes : garde, sprawl, relevés et projections en dépendent.", items: [["Transitions 90/90", "2 × 8"], ["Pont fessier sur une jambe", "3 × 10 par jambe"], ["Hip airplane (sur une jambe, tenu au mur)", "2 × 5 par côté"]] },
  "Aine / adducteurs": { why: "Le programme d'adducteurs de Copenhague a réduit de 41 % les problèmes d'aine chez des footballeurs : 3 fois par semaine pendant 6 à 8 semaines, puis 1 fois par semaine.", items: [["Copenhague niveau 1 (genou sur le banc)", "3 × 6 par côté"], ["Copenhague niveau 2 (cheville sur le banc)", "quand le niveau 1 est facile"], ["Serrer un ballon entre les genoux (isométrie)", "3 × 30 s"]] },
  "Ischio-jambiers": { why: "Le Nordic est associé à environ deux fois moins de blessures des ischio-jambiers dans une méta-analyse de 2019 (effet discuté depuis). Peu de répétitions suffisent.", items: [["Nordic ischio-jambiers", "2 à 3 × 3 à 5"], ["Pont ischio isométrique (talons sur un banc)", "3 × 30 s"], ["Soulevé de terre sur une jambe", "3 × 8 par jambe"]] },
  "Genou": { why: "Le genou est la zone la plus blessée en grappling. Les isométries (squat espagnol) soulagent souvent la douleur du tendon rotulien et permettent de garder de la force.", items: [["Squat espagnol isométrique", "5 × 45 s, effort 7 sur 10"], ["Step-down lent sur une marche", "3 × 8 par jambe, descente en 3 s"], ["Extension de jambe isométrique (élastique)", "4 × 30 s"]] },
  "Cheville / pied": { why: "Chevilles fortes et stables : appuis, sprawls et coups de pied. Les entorses récidivent souvent sans travail d'équilibre.", items: [["Montées sur pointes lentes, jambe tendue puis fléchie", "3 × 12 par jambe"], ["Équilibre sur une jambe, yeux fermés", "3 × 30 s par jambe"], ["Relevés d'orteils (tibial antérieur), dos au mur", "3 × 15"]] },
};

export const PAIN_RULE = "Règle de la douleur : pendant l'exercice, une douleur jusqu'à 5 sur 10 est acceptable si elle redescend dans la journée et n'est pas pire le lendemain matin. Au-delà, ou si elle augmente semaine après semaine : on arrête cet exercice et on consulte un kiné ou un médecin.";
