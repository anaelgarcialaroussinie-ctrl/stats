// Luta Livre : vocabulaire, structure de cours, programmes de grade et cycles.
// Structure inspirée du plan de la certification de Nicolas Renier (NR Fight) ;
// le contenu détaillé des exercices est une proposition Fight Art, à ajuster par le coach.

export const LUTA_INTRO = "Grappling sans kimono né à Rio dans les années 1920-1930, aux côtés du jiu-jitsu. Lutte, contrôle, soumissions en transition et clés de jambes : il a été pensé dès le départ pour le combat, d'où sa proximité avec le MMA.";

export const GLOSSARY = [
  { term: "Guardeiro", def: "Le combattant qui joue dessous, depuis la garde : garde fermée, papillon, demi-garde, entrées aux jambes." },
  { term: "Passador", def: "Le combattant qui joue dessus : passage de garde, pression, contrôle." },
  { term: "100 kilos", def: "Le contrôle latéral. Poitrine contre poitrine, en travers de l'adversaire." },
  { term: "Montée", def: "Assis sur le ventre de l'adversaire, genoux au sol. La position dominante par excellence." },
  { term: "Dos", def: "Derrière l'adversaire avec les crochets ou un triangle de jambes. Mène à l'étranglement arrière." },
  { term: "Front headlock", def: "Contrôle de la tête et d'un bras quand l'adversaire est penché ou à quatre pattes. Carrefour vers la guillotine, le 100 kilos, le dos ou le passage." },
  { term: "Renversement", def: "Passer de dessous à dessus. En Luta Livre on cherche à renverser plutôt qu'à rester dessous." },
  { term: "Triangle de bras", def: "Étranglement avec la tête et un bras de l'adversaire piégés par tes bras (arm-triangle)." },
  { term: "One leg (Single leg X)", def: "Contrôle d'une jambe de l'adversaire entre les tiennes. Base des clés de cheville et de talon." },
  { term: "K-guard", def: "Garde ouverte qui sert à entrer sous une jambe pour aller vers la one leg ou le false reap." },
  { term: "50/50", def: "Jambes croisées de façon symétrique : chacun a accès au talon de l'autre." },
  { term: "False reap", def: "Position de jambes qui expose fortement le genou de l'adversaire : mène à la clé de talon ou au dos." },
  { term: "Double under", def: "Passage de garde avec les deux bras sous les jambes de l'adversaire." },
  { term: "Sparring à thème", def: "Combat qui part d'une position précise, avec un objectif pour chacun (ex. : l'un passe, l'autre renverse)." },
];

export const LESSON = {
  intro: "Les 7 temps d'un cours, dans l'ordre. Les durées sont indicatives pour une séance de 1 h 30.",
  steps: [
    { name: "Échauffement général", min: 10, text: "Monter la température : déplacements, rotations, gainage léger, mobilité des hanches et du cou." },
    { name: "Renforcement spécifique", min: 10, text: "Les gestes du grappling sous forme physique : ponts, sorties de hanche, sprawls, relevés techniques, tirages." },
    { name: "Répétition technique", min: 20, text: "La technique du jour, d'abord sans résistance puis avec une résistance qui monte. Peu de techniques, beaucoup de répétitions." },
    { name: "Échauffement spécifique", min: 5, text: "Remettre le corps en route avant de combattre : lutte de mains, petites situations à 50 %." },
    { name: "Sparrings à thème", min: 20, text: "Partir de la position travaillée : l'un attaque, l'autre défend ou renverse. On change de rôle à chaque point." },
    { name: "Sparrings libres", min: 20, text: "Mettre la technique du jour dans un vrai combat. Intensité adaptée au niveau et à l'âge." },
    { name: "Retour au calme", min: 5, text: "Respiration lente, étirements doux, retour sur ce qui a marché et ce qui reste à travailler." },
  ],
};

export const GRADES = [
  { name: "Ceinture jaune", color: "#F2D33B", themes: ["Jouer dessous (guardeiro) : garde fermée, sorties de hanche", "Lutte : déplacements, mise en garde, premières amenées", "Travail dans la garde : casser la posture, premiers renversements", "Sortir de la montée, du 100 kilos et du dos"] },
  { name: "Ceinture orange", color: "#F08C2E", themes: ["Guardeiro : enchaîner renversements et soumissions", "Soumissions depuis le 100 kilos", "Lutte : 5 défenses du single leg", "Travail du dos : prendre, garder, finir", "Passage de garde puis soumission", "Prendre la montée puis soumettre"] },
  { name: "Ceinture bleue", color: "#3B7BF2", themes: ["Lutte : construire ses chaînes d'attaque", "Passador : un système de passage personnel", "Guardeiro : un système de garde personnel", "Sortir du 100 kilos", "Contrôler le 100 kilos", "Position montée : garder et finir", "Garder le dos"] },
];

export const CYCLES = [
  {
    id: "lutte6", name: "La lutte pour le grappling", weeks: 6,
    text: "6 semaines pour donner une lutte efficace à des grapplers. Une semaine = un thème, repris dans chaque séance.",
    plan: [
      { week: 1, theme: "Position, distance, déplacement, angle", drills: ["Shadow de lutte : avancer, reculer, pivoter en garde basse", "Lutte de mains : trouver l'angle sans se faire saisir"], spar: "Lutte de mains : un point quand tu touches les deux jambes ou te places en angle." },
      { week: 2, theme: "Contrôles qui empêchent l'adversaire d'attaquer", drills: ["Prises de poignets, cadres, underhooks", "Retirer un contrôle 2 mains sur 1 poignet"], spar: "L'un doit tenir le contrôle 30 secondes, l'autre doit s'en débarrasser." },
      { week: 3, theme: "Attaques académiques : double, single, high crotch", drills: ["Changements de niveau et pas de pénétration en solo", "Entrées sur partenaire sans résistance, puis avec"], spar: "Debout, uniquement ces 3 attaques ; on repart debout après chaque amenée." },
      { week: 4, theme: "Attaques les plus efficaces en grappling : arm drag, snap down, 2 sur 1, throw by", drills: ["Chaque attaque en enchaînement avec la suivante", "Snap down vers front headlock"], spar: "Partir du contact (main sur la nuque, 2 sur 1) : premier à prendre le dos ou à amener au sol." },
      { week: 5, theme: "Sprawler et simplifier ses défenses", drills: ["Sprawls en réaction au signal", "Mains et distance d'abord, sprawl ensuite"], spar: "L'un n'a que des attaques de jambes, l'autre doit rester debout ou finir en front headlock." },
      { week: 6, theme: "Menacer de soumission pour ne pas laisser l'adversaire tranquille", drills: ["Guillotine et d'arce sur une entrée tête basse", "Kimura sur le single leg"], spar: "Lutte complète : une soumission vaut plus qu'une amenée au sol." },
    ],
  },
  {
    id: "montee4", name: "Maintenir la position montée", weeks: 4,
    text: "4 semaines : on apprend d'abord à sortir de la montée, puis à la prendre, la garder et finir.",
    plan: [
      { week: 1, theme: "Sortir de la montée", drills: ["Pont et rotation (upa)", "Sortie coude-genou"], spar: "Départ en montée : celui dessous a 1 minute pour sortir." },
      { week: 2, theme: "Prendre la montée depuis différentes situations", drills: ["Depuis le 100 kilos, la tortue, un renversement", "Passage de garde direct vers la montée"], spar: "Départ au 100 kilos : celui dessus doit monter." },
      { week: 3, theme: "Garder la montée", drills: ["Bases larges, montée haute, suivre le pont", "Repasser en montée basse quand il pousse"], spar: "Départ en montée : celui dessus garde 1 minute, celui dessous sort." },
      { week: 4, theme: "Finaliser depuis la montée", drills: ["Clé de bras, triangle de bras, étranglements", "Enchaîner une soumission sur sa défense"], spar: "Départ en montée : soumission contre sortie." },
    ],
  },
];
