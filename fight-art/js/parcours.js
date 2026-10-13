// Parcours vidéo Fight Art : lutte + Luta Livre / grappling no-gi, de la ceinture blanche à la violette.
// Logique : chaque étape prépare la suivante et colle aux systèmes du programme Luta Livre
// (A latéral · B garde fermée · C dos · D demi-garde · E lutte · F montée · G passing · H nord-sud · I garde ouverte · J jambes).
// Choix des références : les enseignants qui dominent le grappling no-gi et la lutte appliquée (Danaher, Gordon Ryan,
// Lachlan Giles, Ryan Hall, John Smith, Askren, Melanson pour le catch, Renier pour la Luta).
// Chaque étape est retrouvée sur le disque par son nom (plusieurs variantes possibles, la meilleure qualité d'abord).

export const PARCOURS_INTRO = "Un instructional à la fois : regarde, choisis 2 ou 3 détails, drille-les, teste-les en sparring à thème pendant la semaine du programme indiquée, puis passe au suivant. Lutte et sol avancent ensemble, comme au club.";

export const PARCOURS_BELTS = [
  { id: "blanche", label: "Ceinture blanche", goal: "Survivre, se relever, contrôler : les bases qui évitent de perdre et donnent une première façon de gagner." },
  { id: "bleue", label: "Ceinture bleue", goal: "Construire ses positions : passer, garder, prendre le dos, finir, et lutter avec une vraie continuité." },
  { id: "violette", label: "Ceinture violette", goal: "Connecter les systèmes : enchaîner lutte, scramble, contrôles et soumissions, ajouter les jambes en sécurité." },
];

// m : motifs de recherche du dossier (le premier trouvé gagne) · sys : systèmes du programme · w : semaines du programme Luta
export const PARCOURS = [
  // ---------------- CEINTURE BLANCHE ----------------
  { belt: "blanche", disc: "lutte", title: "Les fondations de la lutte : attaquer", author: "Lachlan Giles (Submeta)", sys: "E", w: "3", why: "Posture, mouvement, entrées sur les jambes : la base de toute amenée au sol, pensée pour des grapplers.", m: [/Wrestling Foundations I - Offense/i, /Submeta Wrestling Fundations I II III/i] },
  { belt: "blanche", disc: "lutte", title: "Lutte de mains : gagner le premier contact", author: "Georgi Ivanov", sys: "E", w: "3, 11", why: "Le hand fighting décide de qui attaque : c'est le pont de la semaine Lutte 1.", m: [/Georgi Ivanov - Effective Hand Fighting/i] },
  { belt: "blanche", disc: "lutte", title: "Fondamentaux de lutte : attaque et défense « Cowboy »", author: "John Smith", sys: "E", w: "3, 11", why: "Le single leg bas et la défense du plus grand technicien de l'histoire, simples et transposables en MMA.", m: [/John Smith - Championship Wrestling Fundamentals Cowboy Offense/i, /John[- ]Smith$/i] },
  { belt: "blanche", disc: "lutte", title: "Les fondations de la lutte : défendre", author: "Lachlan Giles (Submeta)", sys: "E", w: "11", why: "Sprawl, cadres, contre-attaques : ne plus se faire amener au sol gratuitement.", m: [/Wrestling Foundations II - Defense/i] },
  { belt: "blanche", disc: "grappling", title: "Fondations du grappling I à VI (le fil rouge)", author: "Lachlan Giles (Submeta)", sys: "A B C D E F G I", w: "1 à 13", why: "Le cours complet du débutant : sorties, garde, amenées, passages, contrôles, soumissions. Regarde le module de la semaine.", m: [/Submeta - Foundations I-VI/i, /Submeta - Foundations \[580p\]/i, /Foundations I_ Escapes/i] },
  { belt: "blanche", disc: "grappling", title: "Sortir des positions (montée, latéral, dos)", author: "John Danaher", sys: "A F C", w: "1, 5, 6", why: "Une philosophie claire des sorties : la priorité d'un débutant est de ne pas rester dessous.", m: [/New Philosophy Of Positional Escapes/i] },
  { belt: "blanche", disc: "grappling", title: "Défense de soumissions : sortir avant d'être fini", author: "John Danaher", sys: "C F", w: "5, 12", why: "Comprendre pourquoi une clé ou un étranglement marche, et le casser tôt.", m: [/New Philosophy Of Submissions? Escapes/i] },
  { belt: "blanche", disc: "grappling", title: "Sortir des immobilisations", author: "Gordon Ryan", sys: "A F H", w: "1, 8, 19", why: "Les sorties de latéral, montée et nord-sud qui marchent au plus haut niveau, et le retour vers l'attaque.", m: [/Pillars Of Defense - Pin Escapes(?! .*480p)/i, /Pillars Of Defense - Defensive to Offensive Cycles - Pin Escapes/i] },
  { belt: "blanche", disc: "grappling", title: "Rétention de garde : ne pas se faire passer", author: "John Danaher", sys: "I B", w: "15", why: "Avant de faire de belles gardes, il faut que personne ne puisse passer : cadres, angles, jambes.", m: [/Go Further Faster - Guard Retention/i] },
  { belt: "blanche", disc: "grappling", title: "Garde ouverte : les deux fondations", author: "John Danaher", sys: "I", w: "15, 26", why: "Assis ou sur le dos : les deux façons de jouer la garde en no-gi, la base de la Luta au sol.", m: [/Open Guard The two Foundations/i] },
  { belt: "blanche", disc: "grappling", title: "Garde fermée : attaquer de façon simple", author: "Gordon Ryan", sys: "B", w: "2, 9, 18", why: "Casser la posture, renverser ou finir : la garde fermée offensive du programme.", m: [/Systematically Attacking From Closed Guard/i] },
  { belt: "blanche", disc: "grappling", title: "Contrôler et attaquer depuis la montée", author: "John Danaher", sys: "F", w: "6", why: "Tenir la montée et ponctuer : la semaine « Montée : tenir et ponctuer ».", m: [/New Wave Jiu -?Jitsu - Mount Attacks/i, /Mounted Pin Attacks$/i] },
  { belt: "blanche", disc: "grappling", title: "Tenir dessus : une nouvelle façon d'immobiliser", author: "Craig Jones", sys: "A F", w: "1, 13", why: "Le poids, les connexions et la pression qui empêchent l'adversaire de bouger : indispensable en MMA.", m: [/Power Ride - A New Philosophy on Pinning/i] },
  { belt: "blanche", disc: "luta", title: "Luta Livre : soumissions de base", author: "Nicolas Renier", sys: "Soumissions", w: "6, 34", why: "Les finitions de référence de la Luta Livre, par le maître de la discipline en France.", m: [/Renier - Luta Livre Concepts-Basic Submissions/i] },
  { belt: "blanche", disc: "luta", title: "Luta Livre : défense de guillotine", author: "Nicolas Renier", sys: "E Scramble", w: "3, 11", why: "La guillotine punit chaque entrée en lutte ratée : savoir s'en protéger dès le début.", m: [/Renier - Principles of Guillotine Defense/i] },
  { belt: "blanche", disc: "grappling", title: "Sortir du contrôle de tête (front headlock)", author: "Lachlan Giles", sys: "E C", w: "11, 16", why: "Après un shot raté, c'est là qu'on se fait étrangler ou prendre le dos : en sortir proprement.", m: [/Lachlan Giles - Escaping Front Headlock/i] },

  // ---------------- CEINTURE BLEUE ----------------
  { belt: "bleue", disc: "lutte", title: "Lutte du haut du corps : contrôles et projections", author: "Lachlan Giles (Submeta)", sys: "E D", w: "16, 23", why: "Underhooks, body lock, clinch : la lutte qui sert contre le mur et en dog fight.", m: [/Wrestling Foundations III - Upper Body/i] },
  { belt: "bleue", disc: "lutte", title: "Le single leg : préparations et finitions", author: "Kyle Dake", sys: "E", w: "16, 23", why: "Une attaque qui finit toujours : les finitions d'un quadruple champion du monde.", m: [/Kyle Dake - Single Leg Setups and Finishes/i] },
  { belt: "bleue", disc: "lutte", title: "Dominer avec l'underhook", author: "Gabe Dean", sys: "E D", w: "10, 20", why: "L'underhook gagne la lutte debout et la demi-garde : le lien direct avec le dog fight.", m: [/Gabe Dean - Underhook Domination/i, /Gabe Dean Underhook/i] },
  { belt: "bleue", disc: "lutte", title: "Dominer le contrôle de tête", author: "Dan Vallimont", sys: "E C", w: "16, 17", why: "Transformer les shots adverses en snap down, go behind et prise de dos.", m: [/Dominating The Front Headlock by Dan Vallimont/i] },
  { belt: "bleue", disc: "lutte", title: "Debout vers le sol : la lutte du grappler", author: "John Danaher", sys: "E", w: "23, 30", why: "Amenées, lutte de mains et transitions vers le sol pensées pour le no-gi : takedown = transition.", m: [/Feet To Floor$/i, /Fastest Way To Becoming Effective In Standing Position/i] },
  { belt: "bleue", disc: "luta", title: "La formule du catch wrestling", author: "Neil Melanson", sys: "E Soumissions", w: "23, 34", why: "Le cousin direct de la Luta Livre : lutte au sol agressive qui mène aux soumissions.", m: [/Catch Wrestling Formula by Neil Melanson/i, /The\.Catch\.Wrestling\.Formula/i, /Melanson -The\.Catch\.Wrestling\.Formula/i] },
  { belt: "bleue", disc: "grappling", title: "Passer la garde en no-gi", author: "John Danaher", sys: "G", w: "7, 14", why: "Franchir n'est pas passer : les familles de passage et la stabilisation, semaines Passing 1 et 2.", m: [/New Wave Jiu Jitsu No Gi Guard Passing/i, /Fastest Way To Become An Effective Guard Passer/i] },
  { belt: "bleue", disc: "grappling", title: "Demi-garde no-gi : trois directions d'attaque", author: "John Danaher", sys: "D", w: "4, 10, 20", why: "Jouer ou subir : la demi-garde moderne, du dessous vers le dog fight et la lutte.", m: [/No Gi Half Guard - 3 Directions/i] },
  { belt: "bleue", disc: "grappling", title: "Les fondations de la demi-garde", author: "Giancarlo Bodoni", sys: "D", w: "20, 33", why: "Champion ADCC : une demi-garde simple, solide et très offensive.", m: [/Bodoni - Forging The Guard Mastering The Foundations of Half Guard/i] },
  { belt: "bleue", disc: "grappling", title: "Ils ne passeront pas : la rétention moderne", author: "Gordon Ryan", sys: "I", w: "15, 26", why: "Rétention de garde de niveau ADCC : reprendre la garde et revenir à l'attaque.", m: [/They Shall Not Pass(?! \(360p\))/i, /They Shall Not Pass/i] },
  { belt: "bleue", disc: "grappling", title: "Garde ouverte : renversements", author: "John Danaher", sys: "I", w: "26, 31", why: "Créer plutôt que subir : renverser depuis la garde ouverte et finir dessus.", m: [/Open Guard vol 2 -\s+Sweeps and Reversals/i] },
  { belt: "bleue", disc: "grappling", title: "Attaquer le dos, pour le combat et le grappling", author: "Ryan Hall", sys: "C", w: "5, 12, 17", why: "La référence du dos utilisable en MMA : contrôle, bataille des mains, étranglement.", m: [/Ryan Hall- Attacking the Back for Fighting and Grappling Indexed/i, /Ryan Hall attacking the back for fighting and grappling/i, /Ryan Hall - Attacking The Back for Fighting and Grappling/i] },
  { belt: "bleue", disc: "grappling", title: "Attaquer depuis le latéral et le nord-sud", author: "Gordon Ryan", sys: "A H", w: "8, 19, 24", why: "Navigation top et soumissions depuis les immobilisations du bas du programme.", m: [/Systematically Attacking From Top Pins Side Control & North South 720p/i, /Systematically Attacking From Top Pins Side Control/i] },
  { belt: "bleue", disc: "grappling", title: "La kimura de A à Z", author: "Lachlan Giles", sys: "A D Soumissions", w: "20, 25", why: "La soumission la plus polyvalente du no-gi : dessus, dessous, en scramble.", m: [/Lachlan\.Giles - The\.Kimura\.Anthology/i, /Kimura Anthology/i] },
  { belt: "bleue", disc: "grappling", title: "La guillotine en système", author: "Gordon Ryan", sys: "E Soumissions", w: "16, 34", why: "L'arme signature de la Luta Livre et du MMA sur les entrées en lutte.", m: [/Systematically Attacking The Guillotine by Gordon Ryan/i] },
  { belt: "bleue", disc: "grappling", title: "Les triangles en système", author: "Gordon Ryan", sys: "B I Soumissions", w: "18, 31", why: "Du dessous, la finition qui punit les passages mal faits.", m: [/Systematically Attacking Triangles 480p/i, /Systematically Attacking Triangles/i] },
  { belt: "bleue", disc: "grappling", title: "Sortir de la tortue et du front headlock", author: "Gordon Ryan", sys: "C E", w: "16, 35", why: "Les scrambles perdus finissent là : revenir dans un système connu.", m: [/Pillars of Defense Turtle & Front Headlock Escapes/i] },
  { belt: "bleue", disc: "grappling", title: "Sécurité des jambes : sortir et contrer", author: "Gordon Ryan", sys: "J", w: "32", why: "Jambes 1 : sécurité d'abord. Savoir sortir avant d'apprendre à attaquer les jambes.", m: [/The Pillars Of Defense Leg Lock Escapes And Counter Locks(?! .*FLV)/i, /Pillars Of Defense Leg Lock Escapes/i] },

  // ---------------- CEINTURE VIOLETTE ----------------
  { belt: "violette", disc: "lutte", title: "Amenées par le haut du corps", author: "John Danaher", sys: "E", w: "30, 36", why: "Body lock, projections et mur : la lutte intégrée au grappling et au MMA.", m: [/Standing2Ground\.Upper\.Body\.Takedowns/i, /John DANAHER - Upper Body Takedowns/i] },
  { belt: "violette", disc: "lutte", title: "Lutter, scrambler, soumettre", author: "Garry Tonon", sys: "E Scramble", w: "35, 36", why: "Le scramble comme arme : revenir dans un système connu et finir.", m: [/Shoot To Kill Wrestle, Scramble, Submit/i, /Garry Tonon - Shoot To Kill/i] },
  { belt: "violette", disc: "lutte", title: "De l'amenée au contrôle du dos", author: "Nick Rodriguez", sys: "E C", w: "17, 30", why: "Accéder au dos depuis les transitions de lutte : la connexion la plus payante en no-gi.", m: [/Takedowns to Back Control by Nick Rodriguez/i] },
  { belt: "violette", disc: "grappling", title: "Entrer dans le système (dos, jambes, kimura, front headlock…)", author: "John Danaher", sys: "C J", w: "27, 32", why: "Les systèmes complets de Danaher : comprendre la logique qui relie toutes les positions.", m: [/Enter the System$/i] },
  { belt: "violette", disc: "grappling", title: "Attaquer les jambes en système", author: "Gordon Ryan", sys: "J", w: "32, 37", why: "Après la sécurité : entrées et finitions de jambes, toujours reliées au passage.", m: [/Systematically Attacking The Legs by Gordon Ryan/i] },
  { belt: "violette", disc: "grappling", title: "Attaquer la garde 2.0 : le passage moderne", author: "Gordon Ryan", sys: "G", w: "22, 28, 37", why: "Faire défendre avant de passer, connecter les familles de passage.", m: [/Systematically Attacking the Guard 2\.0 by Gordon Ryan/i, /Systematically Attacking the Guard 2\.0/i] },
  { belt: "violette", disc: "grappling", title: "Attaquer depuis la montée", author: "Gordon Ryan", sys: "F", w: "21, 25, 38", why: "Patience active et domination : de la montée aux finitions.", m: [/Systematically Attacking From Top Pins Mount/i] },
  { belt: "violette", disc: "grappling", title: "Un système de latéral dévastateur", author: "John Danaher", sys: "A", w: "25, 29", why: "Contrôles dominants vers soumissions : la navigation entre contrôles classiques.", m: [/New Wave Jiu Jitsu Side Attacks/i] },
  { belt: "violette", disc: "grappling", title: "Le dos, partie 2 : crucifix, kimura et triangle", author: "Ryan Hall", sys: "C", w: "27", why: "Dos : système offensif et défensif complet, avec les options qui marchent en MMA.", m: [/Attacking the Back Part 2/i] },
  { belt: "violette", disc: "grappling", title: "Sortir du dos systématiquement", author: "Gordon Ryan", sys: "C", w: "12, 27", why: "Le côté défensif du système dos : la bataille des mains et les sorties.", m: [/Gordon Ryan - Systematically Escaping The Back/i] },
  { belt: "violette", disc: "grappling", title: "Attaquer le front headlock en système", author: "Gordon Ryan", sys: "E C Soumissions", w: "35, 36", why: "Chaque shot adverse devient une soumission ou une prise de dos.", m: [/Systematically Attacking The Front Headlock by Gordon Ryan/i] },
  { belt: "violette", disc: "grappling", title: "La Z-guard / demi-garde de Craig Jones", author: "Craig Jones", sys: "D", w: "33", why: "Demi-garde, dog fight et entrées jambes : la synthèse D⁴ + E.", m: [/Make Z Guard Great Again/i, /Craig Jones - Floating Z Half/i] },
  { belt: "violette", disc: "luta", title: "Systèmes de soumission en lutte (catch)", author: "Neil Melanson", sys: "E Soumissions", w: "34, 39", why: "Soumettre pendant la lutte au sol : l'esprit Luta Livre poussé au bout.", m: [/Wrestling Submission Systems$/i] },
];

// retrouve chaque étape dans la vidéothèque (meilleure version : 720p/1080p avant 480p/360p/FLV)
const quality = (r) => (/1080p|720p/i.test(r) ? 2 : /480p|360p|flv|compressed/i.test(r) ? 0 : 1);
export function resolveParcours(groups) {
  return PARCOURS.map((step, i) => {
    let g = null;
    for (const re of step.m) {
      const hits = groups.filter((x) => re.test(x.root.split("/").pop()) || re.test(x.root));
      if (hits.length) { g = hits.sort((a, b) => quality(b.root) - quality(a.root) || b.count - a.count)[0]; break; }
    }
    // sinon : l'instructional est peut-être rangé comme chapitre d'un pack (ex. « Pillars Of Defense / Pin Escapes »)
    if (!g) for (const re of step.m) { g = groups.find((x) => x.names?.some((n) => re.test(n))) || null; if (g) break; }
    return { ...step, n: i + 1, g };
  });
}
