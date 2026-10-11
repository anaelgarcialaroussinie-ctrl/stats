// Carte des techniques : ce que chacune ouvre, ce à quoi elle expose, et la réponse quand l'adversaire contre.
// Expertise de terrain (niveau de preuve faible), cohérente avec les données UFC de la base. À enrichir par le coach.

export const FAMILIES = [
  { id: "frappe", label: "Frappe" },
  { id: "lutte", label: "Lutte et clinch" },
  { id: "dessus", label: "Sol, dessus" },
  { id: "dessous", label: "Sol, dessous" },
  { id: "jambes", label: "Clés de jambes (Luta Livre)" },
];

export const TECHS = [
  // ---- frappe
  { id: "jab", name: "Jab", family: "frappe", zone: "Distance",
    opens: ["cross", "double", "feint", "calf"],
    counters: [
      { by: "cross", text: "Il esquive à l'extérieur et contre en direct par-dessus ton jab.", answer: "lhook", answerText: "Double ton jab ou enchaîne un crochet avant quand il penche." },
      { by: "double", text: "Il passe sous ton jab pour l'amenée au sol.", answer: "sprawl", answerText: "Jab court, retour immédiat en garde, hanches prêtes à sprawler." },
    ],
    reduce: "Bras qui revient aussi vite qu'il part, menton rentré derrière l'épaule, sortie d'angle." },
  { id: "cross", name: "Direct arrière", family: "frappe", zone: "Distance",
    opens: ["lhook", "lowkick", "double"],
    counters: [
      { by: "lhook", text: "Il contre en crochet avant pendant que ton direct part.", answer: "lhook", answerText: "Enchaîne direct puis crochet avant et sors d'angle." },
      { by: "double", text: "Il change de niveau sous ton direct, poids engagé vers l'avant.", answer: "sprawl", answerText: "Ne t'engage pas en avant : reviens en garde, prêt à sprawler." },
    ],
    reduce: "Pas d'engagement du buste au-delà du pied avant, main avant qui protège le visage." },
  { id: "lhook", name: "Crochet avant", family: "frappe", zone: "Distance",
    opens: ["cross", "double", "clinch"],
    counters: [
      { by: "cross", text: "Il frappe au centre pendant que ton crochet ouvre la ligne.", answer: "cross", answerText: "Crochet court et serré, enchaîné derrière un direct plutôt qu'en premier." },
    ],
    reduce: "Coude à hauteur du poing, rotation des hanches, l'autre main collée au visage." },
  { id: "overhand", name: "Overhand", family: "frappe", zone: "Distance",
    opens: ["clinch", "double"],
    counters: [
      { by: "uppercut", text: "Il te cueille en uppercut quand tu plonges.", answer: "clinch", answerText: "Après l'overhand, va directement au clinch au lieu de rester devant." },
      { by: "double", text: "Il passe dessous pour l'amenée au sol.", answer: "sprawl", answerText: "Garde les hanches derrière toi et prépare le sprawl." },
    ],
    reduce: "Tête qui sort de l'axe pendant le coup, finir au clinch ou en sortie d'angle." },
  { id: "uppercut", name: "Uppercut", family: "frappe", zone: "Distance courte",
    opens: ["lhook", "clinch"],
    counters: [
      { by: "cross", text: "Il frappe au centre quand ta main descend pour armer.", answer: "lhook", answerText: "Uppercut court, sans armer, enchaîné avec un crochet." },
    ],
    reduce: "Ne pas baisser la main avant de frapper, l'utiliser contre un adversaire qui baisse la tête." },
  { id: "body", name: "Frappe au corps", family: "frappe", zone: "Distance courte",
    opens: ["lhook", "double"],
    counters: [
      { by: "lhook", text: "Il crochète par-dessus quand tu baisses le niveau.", answer: "lhook", answerText: "Remonte immédiatement en crochet à la tête, l'autre main haute." },
      { by: "knee", text: "Il monte le genou quand ta tête descend.", answer: "clinch", answerText: "Change de niveau avec les jambes, pas en penchant le buste." },
    ],
    reduce: "Descendre avec les jambes, garder la tête hors de la ligne." },
  { id: "feint", name: "Feinte", family: "frappe", zone: "Distance",
    opens: ["cross", "double", "lowkick", "highkick"],
    counters: [],
    reduce: "Feinte courte et crédible, petite pause pour lire la réaction avant d'attaquer." },
  { id: "lowkick", name: "Low kick (cuisse)", family: "frappe", zone: "Distance",
    opens: ["cross", "highkick"],
    counters: [
      { by: "cross", text: "Il contre en direct pendant que tu es sur une jambe.", answer: "cross", answerText: "Lance le low kick derrière un enchaînement de poings, jamais seul et télégraphié." },
      { by: "check", text: "Il bloque avec le tibia : c'est toi qui as mal.", answer: "calf", answerText: "Varie avec le mollet et frappe quand son poids est sur la jambe avant." },
    ],
    reduce: "Kick après les poings, retour immédiat en garde." },
  { id: "calf", name: "Low kick au mollet", family: "frappe", zone: "Distance",
    opens: ["cross", "double"],
    counters: [
      { by: "cross", text: "Il entre en direct pendant ton coup de pied.", answer: "cross", answerText: "Court et rapide, mains hautes pendant le kick." },
    ],
    reduce: "Très efficace contre les lutteurs : il freine leur explosion. Toujours garder les mains hautes." },
  { id: "midkick", name: "Middle kick (corps)", family: "frappe", zone: "Distance",
    opens: ["highkick", "cross"],
    counters: [
      { by: "catch", text: "Il attrape ta jambe : c'est la hauteur idéale pour un lutteur.", answer: "clinch", answerText: "Si ta jambe est prise : rapproche-toi, frappe à la tête, cherche le clinch ou à sautiller pour récupérer la jambe." },
      { by: "cross", text: "Il contre en direct sur ta jambe d'appui.", answer: "cross", answerText: "Kick placé après une combinaison, quand il est déjà en défense." },
    ],
    reduce: "À utiliser avec parcimonie en MMA, surtout contre un lutteur." },
  { id: "highkick", name: "High kick", family: "frappe", zone: "Distance",
    opens: ["ko"],
    counters: [
      { by: "double", text: "Il passe sous le coup de pied et t'amène au sol.", answer: "sprawl", answerText: "Le placer quand il recule ou après une feinte, pas quand il avance." },
      { by: "catch", text: "Il attrape la jambe.", answer: "clinch", answerText: "Ramène la jambe vite, ou entre au clinch si elle est prise." },
    ],
    reduce: "Après une feinte ou une combinaison qui fait lever les mains, retour immédiat en garde." },
  { id: "teep", name: "Teep (coup de pied de face)", family: "frappe", zone: "Distance",
    opens: ["cross", "lowkick"],
    counters: [
      { by: "catch", text: "Il attrape le pied et te balaie.", answer: "cross", answerText: "Teep rapide et sec, retour immédiat, pas de pied qui traîne." },
    ],
    reduce: "Sert à gérer la distance face à un adversaire qui avance." },
  { id: "knee", name: "Genou", family: "frappe", zone: "Clinch",
    opens: ["clinch"],
    counters: [
      { by: "double", text: "Sur un genou volant ou un genou lancé de loin, il te ramasse.", answer: "clinch", answerText: "Genou depuis le clinch, avec une saisie à la nuque." },
    ],
    reduce: "Avec saisie double à la nuque, hanches vers l'avant." },

  // ---- lutte et clinch
  { id: "clinch", name: "Entrée au clinch", family: "lutte", zone: "Clinch",
    opens: ["bodylock", "knee", "trip", "single"],
    counters: [
      { by: "uppercut", text: "Il frappe court pendant que tu entres.", answer: "overhand", answerText: "Entre derrière une frappe, tête collée contre lui." },
      { by: "frame", text: "Il te repousse et ressort à distance.", answer: "bodylock", answerText: "Gagne l'underhook dès le contact, pousse vers la cage." },
    ],
    reduce: "Entrer derrière une frappe, coller les hanches, contrôler les poignets." },
  { id: "double", name: "Double-leg", family: "lutte", zone: "Distance → sol",
    opens: ["guardpass", "gnp", "sidecontrol"],
    counters: [
      { by: "sprawl", text: "Il sprawle : ses hanches t'écrasent au sol.", answer: "single", answerText: "Passe sur une jambe (single-leg) ou pousse-le vers la cage pour finir contre le grillage." },
      { by: "guillotine", text: "Il attrape ton cou pendant l'entrée.", answer: "guardpass", answerText: "Tête haute, passe du côté du bras qui étrangle et finis en contrôle latéral." },
      { by: "knee", text: "Il monte le genou au visage.", answer: "feint", answerText: "Ne pas entrer de loin : entrée préparée par la frappe, changement de niveau au dernier moment." },
    ],
    reduce: "Préparer par la frappe, tête haute contre le corps, finir vers la cage." },
  { id: "single", name: "Single-leg", family: "lutte", zone: "Distance → sol",
    opens: ["trip", "double", "guardpass"],
    counters: [
      { by: "whizzer", text: "Il passe le bras par-dessus (whizzer) et pèse sur toi.", answer: "trip", answerText: "Tête à l'intérieur, enchaîne un crochet de jambe ou monte sur la ceinture." },
      { by: "kimura", text: "Il attrape ton bras en kimura quand tu restes bas.", answer: "bodylock", answerText: "Ne reste pas à genoux sous lui : remonte et passe en ceinture." },
      { by: "guillotine", text: "Il te guillotine si ta tête est dehors.", answer: "guardpass", answerText: "Tête à l'intérieur, contre sa poitrine." },
    ],
    reduce: "Lutte en chaîne : single, puis double, puis crochet de jambe, sans s'arrêter." },
  { id: "bodylock", name: "Ceinture arrière (cage)", family: "lutte", zone: "Clinch",
    opens: ["trip", "sidecontrol", "back"],
    counters: [
      { by: "elbow", text: "Il frappe en coudes courts pendant que tu serres.", answer: "trip", answerText: "Tête collée contre lui, ne reste pas immobile : enchaîne la projection." },
      { by: "whizzer", text: "Il cherche à retourner la position.", answer: "trip", answerText: "Hanches collées, coude serré, crochet de jambe." },
    ],
    reduce: "Contre la cage, il ne peut pas tourner : coller les hanches avant de projeter." },
  { id: "trip", name: "Crochet de jambe", family: "lutte", zone: "Clinch → sol",
    opens: ["sidecontrol", "guardpass"],
    counters: [
      { by: "frame", text: "Il garde l'équilibre et ressort.", answer: "bodylock", answerText: "Change de côté : crochet intérieur puis extérieur." },
    ],
    reduce: "Déplacer son poids sur la jambe que tu crochètes." },
  { id: "sprawl", name: "Sprawl", family: "lutte", zone: "Défense",
    opens: ["frontheadlock", "snapdown", "cross"],
    counters: [
      { by: "single", text: "Il enchaîne sur une jambe.", answer: "frontheadlock", answerText: "Garde les hanches lourdes et prends la tête et le bras." },
    ],
    reduce: "Hanches au sol, jambes en arrière, remonter vite en garde. Peu de défenses, mais maîtrisées : d'abord les mains et la distance, puis le sprawl." },
  { id: "frontheadlock", name: "Front headlock", family: "lutte", zone: "Défense → sol",
    opens: ["guillotine", "darce", "back", "sidecontrol", "guardpass"],
    counters: [
      { by: "standup", text: "Il se relève et dégage sa tête.", answer: "cross", answerText: "Frappe à la sortie, ou suis-le en guillotine debout." },
    ],
    reduce: "Contrôle tête et bras ensemble, poids sur sa nuque. Position carrefour en Luta Livre : de là on va au 100 kilos, au dos, au passage de garde ou à la guillotine." },

  // attaques de lutte efficaces en grappling
  { id: "highcrotch", name: "High crotch", family: "lutte", zone: "Distance → sol",
    opens: ["single", "double", "guardpass"],
    counters: [
      { by: "sprawl", text: "Il sprawle sur ta tête restée à l'extérieur.", answer: "single", answerText: "Tête collée contre sa poitrine, finis en single ou cours en angle." },
      { by: "guillotine", text: "Ta tête est dehors : il serre le cou.", answer: "guardpass", answerText: "Tête haute, passe du côté du bras qui étrangle." },
      { by: "whizzer", text: "Il pèse en whizzer sur ton bras intérieur.", answer: "trip", answerText: "Monte la jambe, puis crochet ou passage derrière." },
    ],
    reduce: "Entrée plus courte que le double : idéale contre la garde décalée du MMA, à condition de garder la tête collée." },
  { id: "armdrag", name: "Arm drag", family: "lutte", zone: "Contact",
    opens: ["back", "single", "bodylock"],
    counters: [
      { by: "frame", text: "Il retire son bras et recule avant que tu passes.", answer: "single", answerText: "Son recul arme son poids sur la jambe avant : enchaîne le single." },
      { by: "whizzer", text: "Il tourne avec toi et pèse sur ton épaule.", answer: "bodylock", answerText: "Reste collé et va chercher la ceinture." },
    ],
    reduce: "Tirer vers le bas et vers toi en même temps que tu avances en angle : c'est le pas qui fait l'arm drag, pas le bras." },
  { id: "snapdown", name: "Snap down", family: "lutte", zone: "Contact",
    opens: ["frontheadlock", "guillotine", "darce", "back"],
    counters: [
      { by: "double", text: "Il profite de ta traction pour plonger dans tes jambes.", answer: "sprawl", answerText: "Après le snap, hanches en arrière immédiatement." },
      { by: "standup", text: "Il relève la tête et se replace.", answer: "highcrotch", answerText: "Quand il relève la tête et pousse, entre sous lui." },
    ],
    reduce: "Casse sa posture vers le bas puis contrôle tête et bras. Très efficace contre un adversaire qui penche le buste." },
  { id: "twoonone", name: "2 sur 1 (contrôle d'un bras)", family: "lutte", zone: "Contact",
    opens: ["armdrag", "single", "back", "throwby"],
    counters: [
      { by: "frame", text: "Il retire son bras en circulant.", answer: "single", answerText: "Garde la main sur le poignet et tire vers le single." },
      { by: "elbow", text: "En MMA, sa main libre frappe pendant que tes deux mains tiennent un bras.", answer: "clinch", answerText: "Tête collée côté bras contrôlé, et pas de 2 sur 1 statique : enchaîne vite." },
    ],
    reduce: "Contrôle fort mais coûteux en MMA : tes deux mains sont prises. À utiliser pour enchaîner, pas pour attendre." },
  { id: "throwby", name: "Throw by", family: "lutte", zone: "Contact",
    opens: ["back", "single", "bodylock"],
    counters: [
      { by: "frame", text: "Il garde la ligne et ne se laisse pas déborder.", answer: "double", answerText: "Il a tourné le buste pour résister : son centre est libre pour le double." },
    ],
    reduce: "Pousse son bras en travers de son corps et passe derrière : un pas de côté vaut mieux qu'une grosse traction." },

  // ---- clés de jambes (Luta Livre)
  { id: "butterfly", name: "Garde papillon", family: "jambes", zone: "Sol, dessous",
    opens: ["onelegx", "xguard", "standup", "guillotine"],
    counters: [
      { by: "guardpass", text: "Il écrase la garde en passant en double under (bras sous les jambes).", answer: "shrimp", answerText: "Réagis tôt : sortie de hanche et pieds dans ses hanches avant qu'il ne colle." },
      { by: "gnp", text: "En MMA, il frappe pendant que tu es assis.", answer: "standup", answerText: "La garde papillon sert d'abord de tremplin pour te relever ou entrer dans les jambes." },
    ],
    reduce: "Rester assis, mains actives sur sa tête ou ses bras, jamais à plat dos." },
  { id: "halfguard", name: "Demi-garde", family: "jambes", zone: "Sol, dessous",
    opens: ["onelegx", "kguard", "guillotine", "single"],
    counters: [
      { by: "guardpass", text: "Il écrase avec la tête de ton côté (crossface) et libère sa jambe.", answer: "shrimp", answerText: "Gagne l'underhook ou un cadre sur le cou avant qu'il installe le crossface." },
      { by: "gnp", text: "En MMA, il frappe en coudes depuis le dessus.", answer: "standup", answerText: "Underhook et relevé contre la cage plutôt que rester à plat." },
    ],
    reduce: "Sur le côté, jamais à plat. En Luta Livre, la demi-garde mène vite aux jambes (one leg) ou à la guillotine." },
  { id: "kguard", name: "K-guard", family: "jambes", zone: "Sol, dessous",
    opens: ["onelegx", "falsereap", "heelhook", "back"],
    counters: [
      { by: "guardpass", text: "Il recule la jambe et passe pendant que tu entres.", answer: "shrimp", answerText: "Entre en tirant sur sa jambe, pas en glissant sous lui." },
    ],
    reduce: "Entrée aux jambes depuis la garde ouverte : contrôle sa jambe avant de penser à la clé." },
  { id: "xguard", name: "X-guard", family: "jambes", zone: "Sol, dessous",
    opens: ["anklelock", "onelegx", "standup"],
    counters: [
      { by: "guardpass", text: "Il libère sa jambe et retombe sur toi.", answer: "shrimp", answerText: "Garde ses appuis déséquilibrés : soulève, sors, ou passe à la cheville." },
    ],
    reduce: "Il est sur une jambe : renverse, relève-toi ou attaque la cheville." },
  { id: "onelegx", name: "One leg (Single leg X)", family: "jambes", zone: "Sol, jambes",
    opens: ["anklelock", "heelhook", "fiftyfifty", "standup"],
    counters: [
      { by: "guardpass", text: "Il libère son genou et passe pendant que tu cherches la clé.", answer: "standup", answerText: "Contrôle le genou d'abord ; si la clé ne vient pas, renverse et relève-toi." },
      { by: "gnp", text: "En MMA, il frappe d'en haut pendant que tu attaques sa jambe.", answer: "standup", answerText: "Ne reste pas en dessous : soit tu finis, soit tu te relèves." },
    ],
    reduce: "Position de base des connexions en Luta Livre : depuis papillon, demi-garde, K-guard." },
  { id: "fiftyfifty", name: "50/50", family: "jambes", zone: "Sol, jambes",
    opens: ["heelhook", "anklelock", "standup"],
    counters: [
      { by: "heelhook", text: "Position symétrique : il a les mêmes attaques que toi sur ta jambe.", answer: "heelhook", answerText: "Cache ton talon d'abord (pied en flexion, genou aligné), puis attaque le sien." },
    ],
    reduce: "Ne pas y rester sans plan : défendre son talon avant d'attaquer." },
  { id: "falsereap", name: "False reap", family: "jambes", zone: "Sol, jambes",
    opens: ["heelhook", "back"],
    counters: [
      { by: "guardpass", text: "Il recule et sort la jambe avant que tu contrôles le genou.", answer: "kguard", answerText: "Reviens en K-guard et réattaque." },
    ],
    reduce: "Position qui expose fortement le genou de l'adversaire : contrôle lent et précis à l'entraînement." },
  { id: "anklelock", name: "Clé de cheville (droite)", family: "jambes", zone: "Sol, jambes", opens: ["standup"],
    counters: [
      { by: "guardpass", text: "Tu tombes en arrière sans contrôle : il libère le pied et passe.", answer: "onelegx", answerText: "Contrôle son genou (one leg) avant de finir." },
      { by: "heelhook", text: "Il te renvoie une attaque sur ta propre jambe.", answer: "", answerText: "Jambe extérieure sur sa hanche, talon caché : finis vite ou lâche et protège-toi." },
    ],
    reduce: "La clé de jambe de base, autorisée chez les débutants dans la plupart des règlements. Si elle échoue, tu te relèves." },
  { id: "heelhook", name: "Clé de talon", family: "jambes", zone: "Sol, jambes", opens: [], adultOnly: true,
    counters: [
      { by: "guardpass", text: "Il dégage son talon en tournant et passe.", answer: "onelegx", answerText: "Le contrôle du genou passe avant la saisie du talon." },
    ],
    reduce: "Clé la plus dangereuse pour le genou : la douleur arrive après la lésion. Serrer lentement, taper tôt. Réservée aux adultes avancés, interdite aux moins de 18 ans." },

  // ---- sol dessus
  { id: "guardpass", name: "Passage de garde", family: "dessus", zone: "Sol, dessus",
    opens: ["sidecontrol", "mount", "gnp"],
    counters: [
      { by: "triangle", text: "Un bras dedans un bras dehors : il te prend en triangle.", answer: "gnp", answerText: "Deux bras dedans ou deux dehors, posture droite, frappe." },
      { by: "standup", text: "Il profite de l'espace pour se relever.", answer: "sidecontrol", answerText: "Passe genou devant en gardant la pression." },
    ],
    reduce: "Genou en premier, pas la tête, garder la pression." },
  { id: "sidecontrol", name: "Contrôle latéral (100 kilos)", family: "dessus", zone: "Sol, dessus",
    opens: ["mount", "armtriangle", "kimura", "gnp"],
    counters: [
      { by: "shrimp", text: "Il remet la garde en sortie de hanche.", answer: "mount", answerText: "Bloque la hanche avec le genou, monte en montée quand il tourne." },
      { by: "standup", text: "Il marche le long de la cage pour se relever.", answer: "back", answerText: "Garde-le loin de la cage, prends le dos s'il se retourne." },
    ],
    reduce: "Contrôle des hanches et de la tête, rester au centre." },
  { id: "mount", name: "Montée", family: "dessus", zone: "Sol, dessus",
    opens: ["gnp", "armbar", "back", "armtriangle"],
    counters: [
      { by: "bridge", text: "Il fait un pont et te renverse.", answer: "gnp", answerText: "Bases larges, mains au sol quand il ponte, puis frappe." },
    ],
    reduce: "Genoux hauts sous ses aisselles, poids sur ses hanches." },
  { id: "back", name: "Prise de dos", family: "dessus", zone: "Sol ou debout",
    opens: ["rnc", "gnp"],
    counters: [
      { by: "turnin", text: "Il se retourne face à toi.", answer: "mount", answerText: "Body triangle ou crochets, contrôle des poignets ; s'il tourne, monte en montée." },
    ],
    reduce: "L'étranglement arrière = 43 % des soumissions UFC : contrôle des poignets d'abord." },
  { id: "gnp", name: "Ground and pound", family: "dessus", zone: "Sol, dessus",
    opens: ["guardpass", "back", "armbar"],
    counters: [
      { by: "armbar", text: "Il attrape un bras quand tu te redresses.", answer: "guardpass", answerText: "Frappe court, garde les coudes près du corps." },
      { by: "triangle", text: "Il monte les jambes en triangle.", answer: "guardpass", answerText: "Posture droite, hanches basses." },
    ],
    reduce: "27 % des KO UFC viennent du sol. Frappes courtes, posture." },

  // soumissions (ce sont aussi des réponses)
  { id: "rnc", name: "Étranglement arrière", family: "dessus", zone: "Dos", opens: [], counters: [{ by: "turnin", text: "Il protège le cou et se retourne.", answer: "back", answerText: "Change de bras, frappe pour ouvrir le cou." }], reduce: "La soumission n°1 de l'UFC." },
  { id: "armtriangle", name: "Arm-triangle", family: "dessus", zone: "Sol, dessus", opens: [], counters: [{ by: "shrimp", text: "Il sort la tête ou tourne vers toi.", answer: "mount", answerText: "Passe du côté opposé pour finir." }], reduce: "Finir du côté opposé au bras piégé." },
  { id: "guillotine", name: "Guillotine", family: "lutte", zone: "Debout ou sol", opens: ["mount", "armtriangle", "sidecontrol"], counters: [{ by: "guardpass", text: "Il passe du côté du bras et tu te retrouves en dessous.", answer: "mount", answerText: "Garde la tête et utilise sa défense pour renverser et monter en montée ; si rien ne vient, lâche et relève-toi." }, { by: "turnin", text: "Il libère son cou en tournant vers ton bras.", answer: "armtriangle", answerText: "Garde son bras piégé avec la tête : passe au triangle de bras." }], reduce: "16 % des soumissions UFC : la punition des entrées tête basse." },
  { id: "darce", name: "D'arce", family: "lutte", zone: "Sol", opens: [], counters: [], reduce: "Depuis le front headlock ou quand il entre tête basse." },
  { id: "kimura", name: "Kimura", family: "dessus", zone: "Sol", opens: ["back"], counters: [], reduce: "Utile aussi pour contrôler et prendre le dos." },
  { id: "armbar", name: "Clé de bras", family: "dessus", zone: "Sol", opens: [], counters: [{ by: "stack", text: "Il se relève et t'écrase.", answer: "standup", answerText: "Finir vite ou revenir en position." }], reduce: "Du dessus (montée) bien plus sûre qu'en garde." },

  // ---- sol dessous
  { id: "closedguard", name: "Garde fermée", family: "dessous", zone: "Sol, dessous",
    opens: ["triangle", "kimura", "standup"],
    counters: [
      { by: "gnp", text: "Il se redresse et frappe.", answer: "standup", answerText: "Casse sa posture, puis ouvre et relève-toi." },
    ],
    reduce: "Au MMA, la garde sert d'abord à survivre et à se relever." },
  { id: "shrimp", name: "Sortie de hanche (shrimp)", family: "dessous", zone: "Sol, dessous", opens: ["closedguard", "standup"], counters: [], reduce: "Le geste n°1 pour remettre la garde." },
  { id: "bridge", name: "Pont", family: "dessous", zone: "Sol, dessous", opens: ["closedguard"], counters: [], reduce: "Pour sortir de la montée, combiné au shrimp." },
  { id: "standup", name: "Se relever (relevé technique, cage)", family: "dessous", zone: "Sol → debout",
    opens: ["cross", "clinch"],
    counters: [
      { by: "back", text: "Il prend ton dos pendant que tu te relèves.", answer: "clinch", answerText: "Protège le cou, contrôle ses mains, retourne-toi face à lui contre la cage." },
      { by: "frontheadlock", text: "Il attrape ta tête quand tu te relèves.", answer: "single", answerText: "Tête haute, relève-toi sur ses jambes." },
    ],
    reduce: "Une main au sol, un pied au sol, la jambe libre passe derrière, garde protégée." },
  { id: "triangle", name: "Triangle", family: "dessous", zone: "Sol, dessous", opens: [], counters: [{ by: "stack", text: "Il te soulève et t'écrase.", answer: "standup", answerText: "Angle avant de serrer, sinon reviens en garde." }], reduce: "Quand il laisse un bras dedans et un dehors." },

  // réactions génériques de l'adversaire
  { id: "catch", name: "Jambe attrapée", family: "lutte", zone: "Distance", opens: ["double", "trip"], counters: [], reduce: "Punition des coups de pied au corps." },
  { id: "check", name: "Blocage du low kick", family: "frappe", zone: "Distance", opens: ["cross"], counters: [], reduce: "Genou vers le coude." },
  { id: "frame", name: "Cadre et sortie", family: "lutte", zone: "Clinch", opens: ["cross"], counters: [], reduce: "Avant-bras sur le cou ou l'épaule pour se décoller." },
  { id: "whizzer", name: "Whizzer", family: "lutte", zone: "Clinch", opens: ["kimura", "frame"], counters: [], reduce: "Bras par-dessus pour casser un single-leg ou un underhook." },
  { id: "elbow", name: "Coudes courts", family: "frappe", zone: "Clinch", opens: [], counters: [], reduce: "Arme du clinch." },
  { id: "turnin", name: "Se retourner face à l'adversaire", family: "dessous", zone: "Sol", opens: ["closedguard"], counters: [], reduce: "Sortir du dos." },
  { id: "stack", name: "Écraser (stack)", family: "dessus", zone: "Sol", opens: ["guardpass"], counters: [], reduce: "Contre les soumissions du dessous." },
  { id: "ko", name: "KO", family: "frappe", zone: "Fin du combat", opens: [], counters: [], reduce: "" },
];

export const tech = (id) => TECHS.find((t) => t.id === id);
// les techniques « principales » à explorer (les réactions génériques restent accessibles par les liens)
export const MAIN_TECHS = TECHS.filter((t) => !["catch", "check", "frame", "whizzer", "elbow", "turnin", "stack", "ko"].includes(t.id));
