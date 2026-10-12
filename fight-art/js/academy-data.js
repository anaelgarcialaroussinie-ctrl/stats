// Contenu de l'Academy : comprendre le combat. Chiffres issus de l'analyse Fight Art Performance
// des statistiques officielles UFC (2010-2026) et de la base de connaissances.

export const ZONES = [
  {
    id: "distance", title: "La distance",
    lead: "La zone où se décident la plupart des KO : 59 % des KO à l'UFC depuis 2018 arrivent à distance, et 81 % des frappes significatives y sont placées en 2026.",
    ranges: [
      { name: "Longue distance", text: "Hors de portée des poings. Jab, coups de pied de face (teep), low kicks, feintes. On mesure et on prépare l'entrée." },
      { name: "Moyenne distance", text: "Les poings touchent. Enchaînements, contres, entrées de lutte. C'est la zone la plus dangereuse : celle où l'on prend des coups." },
    ],
    goals: ["Toucher sans être touché : angles, sorties après chaque enchaînement", "Lire les entrées de l'adversaire (regarder le haut du corps, pas les mains)", "Choisir : rester à distance ou entrer au clinch ou en lutte"],
    keys: ["Jab, direct, crochets", "Low kick au mollet (freine les lutteurs)", "Feintes puis contres", "Changement de niveau pour l'amenée au sol"],
    dangers: ["Coup de pied attrapé puis amené au sol", "Contre en entrant tête basse", "Amenée au sol sous un enchaînement trop long"],
  },
  {
    id: "clinch", title: "Le clinch",
    lead: "Le corps à corps debout : 9 % des KO, mais c'est la porte d'entrée de la lutte contre la cage, l'arme des combattants à la daguestanaise.",
    ranges: [
      { name: "Clinch au centre", text: "Saisies à la nuque (genoux), underhooks et overhooks, projections." },
      { name: "Contre la cage", text: "La cage empêche de tourner : ceinture arrière, crochets de jambe, frappes courtes, genoux à la cuisse." },
    ],
    goals: ["Gagner les saisies : underhooks, contrôle des poignets", "Fatiguer l'adversaire et marquer du contrôle", "Amener au sol ou se décoller pour revenir à distance"],
    keys: ["Underhook et overhook", "Saisie double à la nuque, genoux", "Ceinture arrière et crochets intérieurs et extérieurs", "Se décoller de la cage"],
    dangers: ["Coudes à la sortie", "Projection si les hanches sont trop loin", "S'épuiser à pousser sans gagner de position"],
  },
  {
    id: "ground", title: "Le sol",
    lead: "Au MMA, on finit du dessus : 83 % des soumissions UFC se font du dessus et 27 % des KO viennent du ground and pound. Du dessous, la priorité est de se relever.",
    ranges: [
      { name: "Dessus", text: "Hiérarchie des positions : passer la garde, contrôle latéral, montée, dos. Le contrôle mène à la soumission." },
      { name: "Dessous", text: "Survivre, casser la posture, remettre la garde (shrimp), puis se relever ou renverser." },
      { name: "Le dos", text: "La position la plus dominante : l'étranglement arrière représente 43 % des soumissions." },
    ],
    goals: ["Du dessus : avancer de position en position et frapper", "Du dessous : tête décollée, garde, relevé", "Toujours savoir où est la cage"],
    keys: ["Passage de garde genou devant", "Ground and pound du dessus", "Étranglement arrière, guillotine, arm-triangle (70 % des soumissions)", "Relevé technique et relevé contre la cage"],
    dangers: ["Rester à plat sur le dos sous les frappes", "Tenter une soumission du dessous sans contrôle et perdre la position", "Donner le dos en se relevant"],
  },
];

export const STANCES = [
  { name: "Garde orthodoxe", text: "Pied gauche devant pour un droitier. La garde la plus courante.", tip: "Contre un gaucher : garder le pied avant à l'extérieur du sien." },
  { name: "Fausse garde (gaucher)", text: "Pied droit devant. Les gauchers sont surreprésentés à l'UFC et mettent plus de knockdowns, mais leur taux de victoire n'est pas significativement plus élevé.", tip: "Gagner la position du pied avant ouvre le direct arrière." },
  { name: "Changement de garde (switch)", text: "Passer d'une garde à l'autre. Les combattants qui changent de garde ont le plus fort volume de frappe et de knockdowns de notre analyse.", tip: "À travailler en shadow avant de l'utiliser en sparring." },
  { name: "Garde MMA hybride", text: "Entre boxe et muay thaï : assez de poids derrière pour bloquer les low kicks, mains un peu plus basses pour défendre la lutte.", tip: "Garde de boxe pure = jambes exposées. Garde de muay thaï pure = amenée au sol facile." },
  { name: "Posture de lutte", text: "Plus basse, hanches sous soi, tête haute. Pour attaquer et défendre les amenées au sol.", tip: "Ne pas rester trop bas à distance : on y prend des genoux et des uppercuts." },
];

export const PROFILES = [
  { name: "Striker de volume à distance", how: "82 % des frappes à distance, 4,6 frappes placées par minute, peu de lutte.", body: "Souvent plus grand et plus long pour sa catégorie.", beat: "Le presser contre la cage, couper les angles, l'amener au sol." },
  { name: "Kickeur technique", how: "Un quart des frappes dans les jambes, combat à distance.", body: "Gabarit dans la moyenne.", beat: "Entrer sur ses coups de pied, attraper la jambe, réduire la distance." },
  { name: "Combattant de clinch et de pression", how: "Un quart des frappes au clinch, avance en permanence.", body: "Un peu plus court pour sa catégorie.", beat: "Angles et sorties, jab pour garder la distance, défense de clinch." },
  { name: "Grappler soumission", how: "5,7 amenées au sol par 15 min, le plus de tentatives de soumission.", body: "Plus court, bras plus courts pour sa taille.", beat: "Défense de lutte, se relever vite, ne pas suivre au sol sans raison." },
  { name: "Lutteur dominant", how: "8,1 amenées au sol par 15 min, 44 % du temps en contrôle. Le profil qui gagne le plus (61 %).", body: "Plus petit pour sa catégorie.", beat: "Sprawl, cardio, frappes à la sortie des tentatives, relevés contre la cage." },
];

// Système de numéros des coups (boxe), utilisé pour noter les combinaisons
export const MOVES = [
  { id: "1", label: "1", name: "Jab" },
  { id: "2", label: "2", name: "Direct arrière" },
  { id: "3", label: "3", name: "Crochet avant" },
  { id: "4", label: "4", name: "Crochet arrière" },
  { id: "5", label: "5", name: "Uppercut avant" },
  { id: "6", label: "6", name: "Uppercut arrière" },
  { id: "body", label: "Corps", name: "Au corps" },
  { id: "lk", label: "Low", name: "Low kick" },
  { id: "calf", label: "Mollet", name: "Low kick au mollet" },
  { id: "mk", label: "Middle", name: "Middle kick" },
  { id: "hk", label: "High", name: "High kick" },
  { id: "teep", label: "Teep", name: "Coup de pied de face" },
  { id: "knee", label: "Genou", name: "Genou" },
  { id: "elbow", label: "Coude", name: "Coude" },
  { id: "feint", label: "Feinte", name: "Feinte" },
  { id: "slip", label: "Esquive", name: "Esquive" },
  { id: "pivot", label: "Pivot", name: "Sortie d'angle" },
  { id: "level", label: "Niveau", name: "Changement de niveau" },
  { id: "double", label: "Double", name: "Double-leg" },
  { id: "single", label: "Single", name: "Single-leg" },
  { id: "bodylock", label: "Ceinture", name: "Ceinture arrière" },
  { id: "trip", label: "Crochet", name: "Crochet de jambe" },
  { id: "sprawl", label: "Sprawl", name: "Sprawl" },
  { id: "underhook", label: "Underhook", name: "Underhook" },
  { id: "liver", label: "Foie", name: "Crochet au foie" },
  { id: "checkhook", label: "Check hook", name: "Crochet en pivot" },
  { id: "bf", label: "Backfist", name: "Backfist avant" },
  { id: "sbf", label: "Retourné", name: "Backfist retourné" },
  { id: "sbe", label: "Coude ret.", name: "Coude retourné" },
  { id: "superman", label: "Superman", name: "Superman punch" },
  { id: "switch", label: "Switch", name: "Switch kick" },
  { id: "qmark", label: "Point ?", name: "Coup de pied point d'interrogation" },
  { id: "frontkick", label: "Front visage", name: "Front kick au visage" },
  { id: "sbk", label: "Pied ret.", name: "Coup de pied retourné" },
  { id: "wheel", label: "Wheel", name: "Coup de pied circulaire retourné" },
  { id: "fknee", label: "Genou sauté", name: "Genou sauté" },
  { id: "guillotine", label: "Guillotine", name: "Guillotine" },
];

export const CLASSIC_COMBOS = [
  { name: "Jab, direct", seq: ["1", "2"], zone: "Distance", opens: "La base de tout. Le direct arrive derrière le jab qui masque la vue.", exposes: "Le contre en crochet si la main revient basse.", tip: "Toujours sortir d'angle ou revenir en garde après le 2." },
  { name: "Jab, direct, low kick", seq: ["1", "2", "lk"], zone: "Distance", opens: "Le direct fait lever la garde, le low kick part de la même hanche et finit la combinaison.", exposes: "Le contre sur le low kick si la frappe est télégraphiée.", tip: "Le classique du kickboxing hollandais." },
  { name: "Jab, direct, crochet avant", seq: ["1", "2", "3"], zone: "Distance", opens: "Le crochet surprend un adversaire qui recule en ligne droite.", exposes: "Rester devant lui après le 3.", tip: "Finir par un pivot vers l'extérieur." },
  { name: "Jab, changement de niveau, double-leg", seq: ["1", "level", "double"], zone: "Distance → sol", opens: "Le jab fait lever les mains ; l'amenée arrive sous la garde.", exposes: "La guillotine et le genou si la tête est basse et en avant.", tip: "Tête haute contre le corps, finir en poussant vers la cage." },
  { name: "Direct, changement de niveau", seq: ["2", "level", "single"], zone: "Distance → sol", opens: "La frappe fait réagir, le single-leg arrive quand l'adversaire contre.", exposes: "Le whizzer et le sprawl.", tip: "Enchaîner single puis double ou crochet de jambe : lutte en chaîne." },
  { name: "Low kick au mollet, direct", seq: ["calf", "2"], zone: "Distance", opens: "Le mollet freine les lutteurs et fait baisser l'attention.", exposes: "Le contre en entrant pendant le coup de pied.", tip: "Court et rapide, retour immédiat en garde." },
  { name: "Feinte d'uppercut, direct", seq: ["feint", "2"], zone: "Distance", opens: "La feinte fait lever le menton et reculer le poids (méthode Wittman).", exposes: "Rien si la feinte est courte et lisible.", tip: "Faire une pause d'un instant pour voir la réaction." },
  { name: "Sprawl, direct, sortie", seq: ["sprawl", "2", "pivot"], zone: "Défense", opens: "Punir une tentative d'amenée ratée.", exposes: "Un deuxième shot si tu restes devant lui.", tip: "Remonter en garde le plus vite possible après le sprawl." },
  { name: "Underhook, ceinture arrière, crochet de jambe", seq: ["underhook", "bodylock", "trip"], zone: "Clinch → sol", opens: "La lutte contre la cage à la daguestanaise.", exposes: "Le coude et le retournement si les hanches sont loin.", tip: "Coller les hanches avant de chercher la projection." },
  { name: "Saisie à la nuque, genou, genou", seq: ["knee", "knee"], zone: "Clinch", opens: "Au clinch avec des petits gants, la saisie double à la nuque devient facile.", exposes: "La ceinture arrière et la projection.", tip: "Hanches vers l'avant à chaque genou." },
];

export const ARTS = [
  { name: "Boxe anglaise", brings: "La boxe à distance décide la majorité des KO (74 % aux poings). Jab, déplacements, défense de tête.", adapt: "Garde moins carrée, mains un peu plus basses pour la lutte, attention aux low kicks." },
  { name: "Muay thaï et kickboxing", brings: "Coups de pied, genoux, coudes, clinch. Low kicks au mollet contre les lutteurs.", adapt: "Moins de coups de pied au corps (faciles à attraper), garde moins droite pour pouvoir sprawler." },
  { name: "Lutte (libre, gréco, folk)", brings: "Le contrôle de l'endroit où se passe le combat. Le profil « lutteur dominant » gagne 61 % de ses combats.", adapt: "Entrer derrière les frappes, finir contre la cage, garder la tête haute à cause des genoux." },
  { name: "Judo et sambo", brings: "Projections, déséquilibres, contrôle au sol, clés (sambo). La base de la lutte soviétique.", adapt: "Sans kimono : saisies au corps et à la nuque, pas sur la veste." },
  { name: "Jiu-jitsu brésilien", brings: "Le jeu au sol, les soumissions, la survie sur le dos.", adapt: "Viser le dessus, passer genou devant, utiliser la garde surtout pour se relever." },
  { name: "Luta Livre", brings: "Le grappling sans kimono brésilien : soumissions en transition, lutte, clés de jambe. Pensé dès le départ pour le combat.", adapt: "Déjà très proche du MMA : ajouter les frappes au sol et la défense de frappe." },
];

export const SCOUT_FIELDS = [
  { id: "stance", label: "Garde et distance préférée", hint: "Orthodoxe, gaucher, change de garde ? Plutôt de loin ou collé ?" },
  { id: "first", label: "Ses premières attaques favorites", hint: "Et ce qui les annonce (épaule, pied, respiration)." },
  { id: "pressure", label: "Sous pression, il…", hint: "Recule en ligne, contre, cherche le clinch, tourne d'un côté ?" },
  { id: "wrestling", label: "Lutte et sol", hint: "Entrées préférées, défense des amenées, comportement au sol." },
  { id: "cardio", label: "Cardio", hint: "Baisse de rythme au 2e ou 3e round ?" },
  { id: "wins", label: "Comment il gagne, comment il perd", hint: "Ses victoires et ses défaites : par quoi ?" },
];

export const PLAN_FIELDS = [
  { id: "where", label: "Où je veux amener le combat", hint: "Distance, clinch ou sol, là où je suis plus fort que lui." },
  { id: "weapon", label: "Mon arme principale", hint: "Ce que je vais répéter toute la soirée." },
  { id: "avoid", label: "Ce que j'évite", hint: "Sa zone forte, ses armes." },
  { id: "round1", label: "Mon premier round", hint: "Celui qui gagne le 1er round gagne le combat 65 à 70 % du temps." },
  { id: "planB", label: "Plan B", hint: "Si le plan A ne marche pas après un round." },
];
