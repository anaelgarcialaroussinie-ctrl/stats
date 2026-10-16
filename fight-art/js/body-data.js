// Mobilité et étirements par partie du corps, pensés pour le MMA et la Luta Livre.
// Repères : la mobilité dynamique va avant l'entraînement ; les étirements statiques longs (plus de 60 s par muscle)
// juste avant un effort explosif peuvent baisser un peu la performance, on les garde pour l'après-séance ou une séance à part
// (revue de Behm et al., 2016). Les étirements améliorent l'amplitude ; leur effet sur la prévention des blessures est faible :
// la prévention passe surtout par le renforcement (rubrique Santé).
// zone : lien avec les zones du check-in et de la prévention (sc-data.js).

export const BODY_PARTS = [
  {
    id: "nuque", name: "Nuque et cou", zone: "Nuque", why: "Clinch, lutte, front headlock, ponts : la nuque encaisse dans toutes les phases.",
    mobility: [
      { name: "Rotations de la tête lentes", dose: "5 par sens", steps: ["Debout, épaules basses.", "Dessine un grand cercle lent avec le nez, sans forcer en arrière."], errors: ["Aller vite.", "Forcer quand ça tire."], yt: "neck mobility routine" },
      { name: "Oui-non-peut-être", dose: "8 de chaque", steps: ["Hoche la tête (oui), tourne-la (non), penche l'oreille vers l'épaule (peut-être).", "Amplitude complète mais sans douleur."], errors: ["Hausser les épaules."], yt: "neck mobility yes no maybe" },
      { name: "Rentrer le menton (chin tuck)", dose: "10, tenir 3 s", steps: ["Recule le menton comme pour faire un double menton.", "Le regard reste horizontal."], errors: ["Baisser la tête au lieu de la reculer."], yt: "chin tuck exercise" },
    ],
    stretches: [
      { name: "Étirement du trapèze", dose: "30 s par côté", steps: ["Assis, une main sous la fesse.", "Penche l'oreille opposée vers l'épaule, l'autre main pose un léger poids sur la tête."], errors: ["Tirer fort sur la tête."], yt: "upper trapezius stretch" },
      { name: "Étirement de l'élévateur de l'omoplate", dose: "30 s par côté", steps: ["Tourne la tête de 45° et regarde ta poche.", "La main guide doucement la tête vers le bas."], errors: ["Hausser l'épaule étirée."], yt: "levator scapulae stretch" },
    ],
  },
  {
    id: "epaules", name: "Épaules", zone: "Épaule", why: "Frappes, cadres, kimuras et clés de bras : l'épaule doit être mobile et contrôlée.",
    mobility: [
      { name: "Passage de bâton (dislocates)", dose: "10 lents", steps: ["Bâton ou élastique, prise large.", "Passe bras tendus de devant à derrière la tête, puis reviens."], errors: ["Prise trop serrée.", "Plier les coudes."], yt: "shoulder dislocates stick" },
      { name: "Cercles de bras progressifs", dose: "10 par sens", steps: ["Petits cercles puis de plus en plus grands.", "Garde les côtes rentrées."], errors: ["Cambrer le dos."], yt: "arm circles warm up" },
      { name: "Glissés au mur (wall slides)", dose: "10", steps: ["Dos et avant-bras contre le mur.", "Monte les bras en gardant le contact, redescends."], errors: ["Décoller les poignets ou le bas du dos."], yt: "wall slides shoulder mobility" },
      { name: "CARs d'épaule (rotations contrôlées)", dose: "3 par sens et par bras", steps: ["Poing serré, le reste du corps immobile.", "Fais le plus grand cercle possible avec le bras, très lentement."], errors: ["Tourner le buste pour tricher."], yt: "shoulder CARs controlled articular rotations" },
    ],
    stretches: [
      { name: "Étirement des pectoraux dans un cadre de porte", dose: "30 s par côté", steps: ["Avant-bras contre le cadre, coude à hauteur d'épaule.", "Avance doucement le buste."], errors: ["Cambrer le dos."], yt: "doorway pec stretch" },
      { name: "Étirement de l'arrière d'épaule (bras croisé)", dose: "30 s par côté", steps: ["Bras tendu devant toi, ramène-le contre la poitrine avec l'autre bras."], errors: ["Monter l'épaule."], yt: "cross body shoulder stretch" },
      { name: "Sleeper stretch", dose: "30 s par côté, doux", steps: ["Allongé sur le côté, bras du dessous à 90°.", "L'autre main pousse doucement l'avant-bras vers le sol."], errors: ["Forcer : l'étirement doit rester léger."], yt: "sleeper stretch" },
    ],
  },
  {
    id: "thoracique", name: "Haut du dos (thoracique)", zone: "Dos", why: "Une colonne thoracique mobile protège les épaules et le bas du dos, et aide la garde et les rotations.",
    mobility: [
      { name: "Rotations thoraciques au sol", dose: "8 par côté", steps: ["Sur le côté, genoux pliés devant.", "Ouvre le bras du dessus vers l'autre côté, les yeux suivent la main."], errors: ["Les genoux se soulèvent."], yt: "open book thoracic rotation" },
      { name: "Chat-vache", dose: "10 lents", steps: ["À quatre pattes.", "Arrondis le dos vertèbre par vertèbre, puis creuse doucement."], errors: ["Ne bouger que la tête et le bassin."], yt: "cat cow" },
      { name: "Extension sur rouleau", dose: "8 respirations", steps: ["Rouleau sous le haut du dos, mains derrière la tête.", "Laisse le haut du dos s'ouvrir sur le rouleau, fesses au sol."], errors: ["Mettre le rouleau sous le bas du dos."], yt: "foam roller thoracic extension" },
    ],
    stretches: [
      { name: "Posture de l'enfant, bras tendus", dose: "45 s", steps: ["À genoux, fesses vers les talons.", "Bras loin devant, poitrine vers le sol."], errors: ["Retenir sa respiration."], yt: "child pose stretch" },
      { name: "Fil de l'aiguille (thread the needle)", dose: "30 s par côté", steps: ["À quatre pattes, passe un bras sous l'autre.", "Pose l'épaule et la tempe au sol."], errors: ["Écraser la nuque."], yt: "thread the needle stretch" },
    ],
  },
  {
    id: "poignets", name: "Avant-bras, coudes et poignets", zone: "Main / poignet", why: "Saisies, gants, appuis au sol et clés de bras : les avant-bras et les poignets travaillent sans arrêt.",
    mobility: [
      { name: "Cercles de poignets", dose: "10 par sens", steps: ["Doigts entrelacés, fais tourner les poignets dans les deux sens."], errors: ["Aller trop vite."], yt: "wrist mobility warm up" },
      { name: "Bascules de poignets à quatre pattes", dose: "10 dans chaque orientation", steps: ["Mains au sol, doigts vers l'avant, puis vers les genoux, puis sur le dos des mains.", "Bascule doucement le poids d'avant en arrière."], errors: ["Mettre tout le poids d'un coup."], yt: "wrist prep routine quadruped" },
      { name: "Pronation et supination", dose: "10 lentes", steps: ["Coude au corps, tourne la paume vers le haut puis vers le bas.", "Avec un marteau pour charger légèrement."], errors: ["Bouger le coude."], yt: "forearm pronation supination" },
    ],
    stretches: [
      { name: "Étirement des fléchisseurs du poignet", dose: "30 s par bras", steps: ["Bras tendu, paume vers l'avant, doigts vers le bas.", "L'autre main tire doucement les doigts vers toi."], errors: ["Plier le coude."], yt: "wrist flexor stretch" },
      { name: "Étirement des extenseurs du poignet", dose: "30 s par bras", steps: ["Bras tendu, paume vers toi, doigts vers le bas.", "Ramène doucement le dos de la main vers toi."], errors: ["Forcer sur les doigts."], yt: "wrist extensor stretch" },
    ],
  },
  {
    id: "basdos", name: "Bas du dos et tronc", zone: "Dos", why: "Lutte, sprawl, projections et relevés : le bas du dos aime surtout la stabilité.",
    mobility: [
      { name: "Bascules du bassin allongé", dose: "10", steps: ["Sur le dos, genoux pliés.", "Plaque le bas du dos au sol, puis creuse légèrement."], errors: ["Pousser avec les pieds."], yt: "pelvic tilts" },
      { name: "Essuie-glaces des genoux", dose: "8 par côté", steps: ["Sur le dos, genoux pliés, pieds écartés.", "Laisse tomber les genoux d'un côté puis de l'autre."], errors: ["Décoller les épaules."], yt: "windshield wipers mobility" },
      { name: "Bird dog", dose: "8 par côté, tenir 5 s", steps: ["À quatre pattes, tends le bras et la jambe opposés.", "Le dos reste plat comme une table."], errors: ["Tourner le bassin."], yt: "bird dog exercise" },
    ],
    stretches: [
      { name: "Genoux à la poitrine", dose: "45 s", steps: ["Sur le dos, ramène les deux genoux vers la poitrine.", "Respire lentement."], errors: ["Décoller la tête."], yt: "knees to chest stretch" },
      { name: "Torsion allongée", dose: "30 s par côté", steps: ["Sur le dos, un genou passe de l'autre côté.", "Les épaules restent au sol."], errors: ["Forcer la torsion."], yt: "supine spinal twist" },
    ],
  },
  {
    id: "hanches", name: "Hanches et fessiers", zone: "Hanche", why: "La garde, le sprawl, les relevés, les coups de pied et le jeu de jambes en Luta Livre partent des hanches.",
    mobility: [
      { name: "Transitions 90/90", dose: "8 par côté", steps: ["Assis, une jambe devant pliée à 90°, l'autre derrière à 90°.", "Change de côté en levant les genoux, buste droit."], errors: ["S'effondrer en arrière."], yt: "90 90 hip switch" },
      { name: "CARs de hanche", dose: "3 par sens et par jambe", steps: ["Debout ou à quatre pattes, le reste du corps immobile.", "Fais le plus grand cercle possible avec le genou, très lentement."], errors: ["Tourner le bassin."], yt: "hip CARs" },
      { name: "Squat de repos", dose: "1 à 2 min", steps: ["Pieds largeur d'épaules, talons au sol.", "Descends tout en bas, coudes poussant les genoux vers l'extérieur."], errors: ["Talons qui décollent."], yt: "deep squat hold" },
      { name: "Fente avec rotation (world's greatest stretch)", dose: "5 par côté", steps: ["Grande fente, main au sol à l'intérieur du pied avant.", "Ouvre le bras vers le plafond, puis tends la jambe avant."], errors: ["Genou arrière qui s'écrase."], yt: "worlds greatest stretch" },
    ],
    stretches: [
      { name: "Pigeon", dose: "45 s par côté", steps: ["Jambe avant pliée devant toi, jambe arrière tendue derrière.", "Bassin droit, descends le buste vers le sol."], errors: ["Bassin qui bascule sur le côté.", "Douleur au genou avant : passe à la version allongée."], yt: "pigeon stretch" },
      { name: "Figure 4 allongé", dose: "45 s par côté", steps: ["Sur le dos, cheville sur le genou opposé.", "Tire la cuisse vers toi."], errors: ["Décoller la tête."], yt: "figure 4 stretch" },
    ],
  },
  {
    id: "aine", name: "Aine et adducteurs", zone: "Aine / adducteurs", why: "Gardes, ouvertures de jambes, sprawl et coups de pied : les adducteurs sont très exposés en grappling.",
    mobility: [
      { name: "Rock-back en grenouille", dose: "10", steps: ["À quatre pattes, genoux très écartés.", "Recule les fesses vers les talons puis reviens."], errors: ["Cambrer le dos."], yt: "frog rock back adductor mobility" },
      { name: "Fentes latérales (cossack)", dose: "6 par côté", steps: ["Pieds très écartés, descends sur une jambe, l'autre tendue pointe vers le haut.", "Passe de l'autre côté."], errors: ["Talon qui décolle."], yt: "cossack squat" },
      { name: "Balanciers de jambe latéraux", dose: "10 par jambe", steps: ["Tiens-toi à un mur.", "Balance la jambe de côté, de plus en plus haut."], errors: ["Pencher le buste."], yt: "lateral leg swings" },
    ],
    stretches: [
      { name: "Papillon", dose: "45 s", steps: ["Assis, plantes de pieds collées.", "Dos droit, penche-toi vers l'avant."], errors: ["Appuyer fort sur les genoux."], yt: "butterfly stretch" },
      { name: "Grenouille", dose: "45 s", steps: ["À quatre pattes, genoux écartés, tibias parallèles.", "Recule doucement les fesses."], errors: ["Aller trop loin d'un coup."], yt: "frog stretch" },
    ],
  },
  {
    id: "ischios", name: "Ischio-jambiers", zone: "Ischio-jambiers", why: "Sprint, shoot, coups de pied hauts et garde : des ischios souples et forts.",
    mobility: [
      { name: "Balanciers de jambe avant-arrière", dose: "10 par jambe", steps: ["Tiens-toi à un mur, balance la jambe tendue d'avant en arrière.", "L'amplitude monte petit à petit."], errors: ["Arrondir le dos."], yt: "leg swings forward backward" },
      { name: "Ramassage de fleurs (inchworm)", dose: "6", steps: ["Debout, descends les mains au sol jambes presque tendues.", "Marche avec les mains jusqu'à la planche, puis reviens."], errors: ["Plier beaucoup les genoux."], yt: "inchworm exercise" },
    ],
    stretches: [
      { name: "Étirement des ischios allongé (sangle)", dose: "45 s par jambe", steps: ["Sur le dos, une sangle sous le pied.", "Monte la jambe tendue jusqu'à la tension."], errors: ["Décoller les fesses."], yt: "supine hamstring stretch strap" },
      { name: "Pince debout jambes croisées", dose: "30 s par côté", steps: ["Croise les jambes, penche-toi en avant, dos long."], errors: ["Rebondir."], yt: "standing hamstring stretch" },
    ],
  },
  {
    id: "quadri", name: "Quadriceps et fléchisseurs de hanche", zone: "Hanche", why: "Les heures assis et les montées de genou raccourcissent l'avant de la hanche.",
    mobility: [
      { name: "Fente basse dynamique", dose: "8 par côté", steps: ["Un genou au sol, avance et recule le bassin en rythme.", "Serre la fesse de la jambe arrière."], errors: ["Creuser le bas du dos."], yt: "dynamic lunge hip flexor" },
      { name: "Talons-fesses dynamiques", dose: "20", steps: ["En marchant ou sur place, ramène le talon vers la fesse."], errors: ["Pencher le buste."], yt: "butt kicks warm up" },
    ],
    stretches: [
      { name: "Fente basse (psoas)", dose: "45 s par côté", steps: ["Un genou au sol, bassin en avant, fesse arrière serrée.", "Monte le bras du côté du genou au sol."], errors: ["Cambrer le dos."], yt: "half kneeling hip flexor stretch" },
      { name: "Étirement du quadriceps (couch stretch)", dose: "45 s par côté", steps: ["Genou au sol contre un mur ou un canapé, tibia vertical contre lui.", "Redresse le buste petit à petit."], errors: ["Commencer trop fort : genou au sol bien protégé."], yt: "couch stretch" },
    ],
  },
  {
    id: "genoux", name: "Genoux", zone: "Genou", why: "Le genou est la zone la plus blessée en grappling : mobilité douce, et surtout renforcement (rubrique Santé).",
    mobility: [
      { name: "Flexion-extension assis", dose: "15", steps: ["Assis sur une chaise, tends et plie la jambe lentement."], errors: ["Donner des à-coups."], yt: "seated knee extension mobility" },
      { name: "Genou au-dessus des orteils (mobilité de cheville)", dose: "10 par jambe", steps: ["Face à un mur, pied à 10 cm.", "Avance le genou vers le mur sans décoller le talon."], errors: ["Talon qui décolle."], yt: "knee to wall ankle mobility" },
    ],
    stretches: [
      { name: "Étirement du quadriceps debout", dose: "30 s par jambe", steps: ["Tiens ta cheville, genoux collés, bassin en avant."], errors: ["Cambrer le dos."], yt: "standing quad stretch" },
    ],
  },
  {
    id: "chevilles", name: "Mollets, chevilles et pieds", zone: "Cheville / pied", why: "Appuis, déplacements, sprawl et coups de pied : la cheville est la base du jeu de jambes.",
    mobility: [
      { name: "Cercles de chevilles", dose: "10 par sens", steps: ["Assis ou debout, fais tourner le pied dans les deux sens."], errors: ["Bouger la jambe."], yt: "ankle circles" },
      { name: "Genou au mur", dose: "10 par jambe", steps: ["Pied à quelques cm du mur, avance le genou vers le mur, talon au sol.", "Recule le pied petit à petit."], errors: ["Talon qui décolle."], yt: "knee to wall ankle mobility" },
      { name: "Marche sur les orteils et les talons", dose: "20 pas de chaque", steps: ["Sur la pointe des pieds, puis sur les talons."], errors: ["Plier les genoux."], yt: "toe walk heel walk" },
    ],
    stretches: [
      { name: "Étirement du mollet au mur", dose: "30 s jambe tendue + 30 s jambe fléchie", steps: ["Mains au mur, jambe arrière tendue talon au sol.", "Puis plie le genou arrière pour étirer plus bas."], errors: ["Pied arrière tourné vers l'extérieur."], yt: "calf stretch wall" },
      { name: "Étirement de la voûte plantaire", dose: "30 s par pied", steps: ["Assis, tire les orteils vers toi.", "Ou roule le pied sur une balle."], errors: ["Appuyer trop fort sur la balle."], yt: "plantar fascia stretch" },
    ],
  },
];

export const ROUTINES = [
  { id: "avant", name: "Avant l'entraînement", text: "Mobilité dynamique, 8 à 10 minutes, pour préparer les articulations sans perdre d'explosivité.", kind: "mobility", parts: ["chevilles", "hanches", "aine", "thoracique", "epaules", "nuque"], work: 40, rest: 10 },
  { id: "apres", name: "Après l'entraînement", text: "Étirements doux pour retrouver de l'amplitude et redescendre. 10 minutes.", kind: "stretches", parts: ["hanches", "aine", "ischios", "quadri", "thoracique", "epaules"], work: 45, rest: 15 },
  { id: "grappling", name: "Spécial grappling", text: "Hanches, adducteurs, nuque, dos : les zones les plus sollicitées en Luta Livre et au sol.", kind: "mixed", parts: ["hanches", "aine", "nuque", "basdos", "thoracique"], work: 40, rest: 15 },
  { id: "frappe", name: "Spécial frappe", text: "Épaules, poignets, hanches et chevilles pour les poings et les coups de pied.", kind: "mixed", parts: ["epaules", "poignets", "hanches", "chevilles", "thoracique"], work: 40, rest: 15 },
  { id: "matin", name: "Réveil du matin", text: "5 minutes pour dérouiller tout le corps au lever.", kind: "mobility", parts: ["nuque", "thoracique", "hanches", "chevilles"], work: 30, rest: 5 },
];

export const MOBILITY_NOTE = "Avant l'entraînement : mobilité dynamique (mouvements contrôlés). Les étirements statiques longs juste avant un effort explosif peuvent baisser un peu la performance : garde-les pour l'après-séance ou une séance à part.";
export const STRETCH_NOTE = "Tiens chaque étirement 30 à 45 secondes, en respirant lentement, sans douleur (tension 5 à 6 sur 10). Les étirements améliorent l'amplitude ; pour prévenir les blessures, c'est le renforcement qui compte le plus (rubrique Santé).";
export const part = (id) => BODY_PARTS.find((b) => b.id === id);
