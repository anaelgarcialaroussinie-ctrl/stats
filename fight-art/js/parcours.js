// Parcours vidéo Fight Art : lutte + Luta Livre / grappling no-gi, ceinture blanche → violette.
// Filtré au maximum : uniquement des enseignants reconnus mondialement pour leur pédagogie
// (John Danaher, Lachlan Giles, Gordon Ryan, Ryan Hall, John Smith) + Nicolas Renier, référence de la Luta Livre.
// Rangé par position, dans l'ordre logique d'un combat, avec les transitions possibles vers les autres positions.
// Systèmes du programme Luta : A latéral · B garde fermée · C dos · D demi-garde · E lutte · F montée ·
// G passing · H nord-sud · I garde ouverte · J jambes.

export const PARCOURS_INTRO = "30 instructionals seulement, des meilleurs pédagogues du monde. Choisis une position, regarde l'étape de ta ceinture, retiens 2 ou 3 détails, drille-les et teste-les en sparring à thème la semaine du programme indiquée. Les transitions te disent où la position mène ensuite.";

export const PARCOURS_BELTS = [
  { id: "blanche", label: "Blanche", goal: "Survivre, se relever, contrôler." },
  { id: "bleue", label: "Bleue", goal: "Construire ses positions et finir." },
  { id: "violette", label: "Violette", goal: "Connecter les systèmes." },
];

// to : transitions possibles (id de position + ce qui fait passer de l'une à l'autre)
export const POSITIONS = [
  { id: "base", label: "Le fil rouge", sys: "Tout", note: "Le cours complet du débutant, à suivre en parallèle de tout le reste.", to: [] },
  { id: "debout", label: "Debout : lutte", sys: "E", note: "Le combat commence ici : gagner le contact, amener au sol, défendre l'amenée.",
    to: [["fhl", "shot défendu par snap down"], ["passage", "l'adversaire tire la garde"], ["lateral", "amenée finie"], ["dos", "go behind / arm drag"]] },
  { id: "fhl", label: "Front headlock et tortue", sys: "E C", note: "Le carrefour des scrambles : après chaque shot raté, quelqu'un se retrouve ici.",
    to: [["dos", "go behind, prise de dos"], ["soumissions", "guillotine, d'arce"], ["debout", "se relever"]] },
  { id: "gfermee", label: "Garde fermée", sys: "B", note: "Casser la posture, puis renverser ou finir.",
    to: [["montee", "renversement"], ["dos", "arm drag, prise de dos"], ["soumissions", "triangle, kimura, guillotine"]] },
  { id: "gouverte", label: "Garde ouverte", sys: "I", note: "Ne pas se faire passer, puis créer : renverser, se relever, attaquer.",
    to: [["debout", "wrestle up"], ["demigarde", "il rentre près"], ["jambes", "entrées de jambes"], ["dos", "prise de dos"]] },
  { id: "demigarde", label: "Demi-garde", sys: "D", note: "Jouer ou subir : de la demi-garde vers le dog fight et la lutte.",
    to: [["debout", "dog fight, wrestle up"], ["dos", "sortie par le dos"], ["jambes", "entrées de jambes"]] },
  { id: "passage", label: "Passage de garde", sys: "G", note: "Franchir n'est pas passer : passer, puis stabiliser.",
    to: [["lateral", "passage fini"], ["montee", "passage direct en montée"], ["dos", "il tourne le dos"], ["jambes", "il attaque les jambes"]] },
  { id: "lateral", label: "Latéral et nord-sud", sys: "A H", note: "Tenir dessus, sortir de dessous.",
    to: [["montee", "montée"], ["dos", "il se retourne"], ["soumissions", "kimura, étranglements"]] },
  { id: "montee", label: "Montée", sys: "F", note: "Tenir et ponctuer.",
    to: [["dos", "il se retourne"], ["soumissions", "clé de bras, étranglements"], ["lateral", "il pousse"]] },
  { id: "dos", label: "Dos", sys: "C", note: "La position la plus dominante : contrôler, finir, et savoir en sortir.",
    to: [["montee", "il s'échappe vers le dos au sol"], ["soumissions", "étranglement arrière"]] },
  { id: "jambes", label: "Jambes", sys: "J", note: "Sécurité d'abord, puis attaque, toujours reliée au passage.",
    to: [["passage", "il défend : on passe"], ["dos", "il tourne : on prend le dos"]] },
  { id: "soumissions", label: "Soumissions", sys: "Soumissions", note: "Défendre avant d'attaquer, puis les finitions qui marchent partout.", to: [] },
];

// m : motifs de recherche du dossier sur le disque (le premier trouvé gagne) · w : semaines du programme Luta
export const PARCOURS = [
  { pos: "base", belt: "blanche", title: "Fondations du grappling I à VI", author: "Lachlan Giles", w: "1 à 13", why: "Sorties, garde, amenées, passages, contrôles, soumissions : le module de la semaine.", m: [/Submeta - Foundations I-VI/i, /Submeta - Foundations \[580p\]/i, /Foundations I_ Escapes/i] },

  { pos: "debout", belt: "blanche", title: "Fondations de la lutte : attaquer", author: "Lachlan Giles", w: "3", why: "Posture, mouvement, entrées : la lutte pensée pour les grapplers.", m: [/Wrestling Foundations I - Offense/i, /Submeta Wrestling Fundations I II III/i] },
  { pos: "debout", belt: "blanche", title: "Fondations de la lutte : défendre", author: "Lachlan Giles", w: "11", why: "Sprawl, cadres, contres : ne plus être amené au sol gratuitement.", m: [/Wrestling Foundations II - Defense/i] },
  { pos: "debout", belt: "blanche", title: "Fondamentaux « Cowboy » : attaque", author: "John Smith", w: "3, 11", why: "Le single leg bas du plus grand technicien de l'histoire de la lutte.", m: [/John Smith - Championship Wrestling Fundamentals Cowboy Offense/i, /John[- ]Smith$/i] },
  { pos: "debout", belt: "bleue", title: "Feet to Floor : du debout au sol", author: "John Danaher", w: "23, 30", why: "Amenées et transitions vers le sol pour le no-gi : takedown = transition.", m: [/Feet To Floor$/i, /Fastest Way To Becoming Effective In Standing Position/i] },
  { pos: "debout", belt: "violette", title: "Amenées par le haut du corps", author: "John Danaher", w: "30, 36", why: "Body lock, projections, mur : la lutte intégrée au grappling et au MMA.", m: [/Standing2Ground\.Upper\.Body\.Takedowns/i, /John DANAHER - Upper Body Takedowns/i] },

  { pos: "fhl", belt: "blanche", title: "Sortir du front headlock", author: "Lachlan Giles", w: "11, 16", why: "Après un shot raté : ne pas se faire étrangler ni prendre le dos.", m: [/Lachlan Giles - Escaping Front Headlock/i] },
  { pos: "fhl", belt: "violette", title: "Attaquer le front headlock en système", author: "Gordon Ryan", w: "35, 36", why: "Chaque shot adverse devient une soumission ou une prise de dos.", m: [/Systematically Attacking The Front Headlock by Gordon Ryan/i] },

  { pos: "gfermee", belt: "blanche", title: "Attaquer depuis la garde fermée", author: "Gordon Ryan", w: "2, 9, 18", why: "Casser la posture, renverser ou finir, simplement.", m: [/Systematically Attacking From Closed Guard/i] },

  { pos: "gouverte", belt: "blanche", title: "Rétention de garde", author: "John Danaher", w: "15", why: "Cadres, angles, jambes : personne ne passe.", m: [/Go Further Faster - Guard Retention/i] },
  { pos: "gouverte", belt: "blanche", title: "Garde ouverte : les deux fondations", author: "John Danaher", w: "15, 26", why: "Assis ou sur le dos : les deux façons de jouer la garde en no-gi.", m: [/Open Guard The two Foundations/i] },
  { pos: "gouverte", belt: "bleue", title: "Garde ouverte : renversements", author: "John Danaher", w: "26, 31", why: "Créer plutôt que subir : renverser et finir dessus.", m: [/Open Guard vol 2 -\s+Sweeps and Reversals/i] },

  { pos: "demigarde", belt: "bleue", title: "Demi-garde no-gi : trois directions d'attaque", author: "John Danaher", w: "4, 10, 20, 33", why: "Du dessous vers le dog fight, la lutte et le dos.", m: [/No Gi Half Guard - 3 Directions/i] },

  { pos: "passage", belt: "bleue", title: "Passer la garde en no-gi", author: "John Danaher", w: "7, 14", why: "Les familles de passage et la stabilisation.", m: [/New Wave Jiu Jitsu No Gi Guard Passing/i, /Fastest Way To Become An Effective Guard Passer/i] },
  { pos: "passage", belt: "violette", title: "Attaquer la garde 2.0", author: "Gordon Ryan", w: "22, 28, 37", why: "Faire défendre avant de passer, connecter les familles.", m: [/Systematically Attacking the Guard 2\.0 by Gordon Ryan/i, /Systematically Attacking the Guard 2\.0/i] },

  { pos: "lateral", belt: "blanche", title: "Sortir des positions (latéral, montée, dos)", author: "John Danaher", w: "1, 6, 19", why: "Une philosophie claire des sorties : la priorité est de ne pas rester dessous.", m: [/New Philosophy Of Positional Escapes/i] },
  { pos: "lateral", belt: "bleue", title: "Attaquer depuis le latéral et le nord-sud", author: "Gordon Ryan", w: "8, 19, 24", why: "Navigation dessus et soumissions depuis les immobilisations.", m: [/Systematically Attacking From Top Pins Side Control & North South 720p/i, /Systematically Attacking From Top Pins Side Control/i] },
  { pos: "lateral", belt: "violette", title: "Un système de latéral complet", author: "John Danaher", w: "25, 29", why: "Contrôles dominants vers soumissions.", m: [/New Wave Jiu Jitsu Side Attacks/i] },

  { pos: "montee", belt: "blanche", title: "Attaques depuis la montée", author: "John Danaher", w: "6", why: "Tenir la montée et ponctuer.", m: [/New Wave Jiu -?Jitsu - Mount Attacks/i, /Mounted Pin Attacks$/i] },
  { pos: "montee", belt: "violette", title: "Attaquer depuis la montée en système", author: "Gordon Ryan", w: "21, 25, 38", why: "Patience active : de la montée aux finitions.", m: [/Systematically Attacking From Top Pins Mount/i] },

  { pos: "dos", belt: "bleue", title: "Attaquer le dos, pour le combat et le grappling", author: "Ryan Hall", w: "5, 12, 17", why: "Contrôle, bataille des mains, étranglement : valable en MMA.", m: [/Ryan Hall- Attacking the Back for Fighting and Grappling Indexed/i, /Ryan Hall attacking the back for fighting and grappling/i, /Ryan Hall - Attacking The Back for Fighting and Grappling/i] },
  { pos: "dos", belt: "violette", title: "Le dos, partie 2 : crucifix, kimura, triangle", author: "Ryan Hall", w: "27", why: "Le système dos complet, avec les options du MMA.", m: [/Attacking the Back Part 2/i] },
  { pos: "dos", belt: "violette", title: "Sortir du dos en système", author: "Gordon Ryan", w: "12, 27", why: "La bataille des mains et les sorties.", m: [/Gordon Ryan - Systematically Escaping The Back/i] },

  { pos: "jambes", belt: "bleue", title: "Sécurité des jambes : sortir et contrer", author: "Gordon Ryan", w: "32", why: "Savoir sortir avant d'apprendre à attaquer les jambes.", m: [/The Pillars Of Defense Leg Lock Escapes And Counter Locks(?! .*FLV)/i, /Pillars Of Defense Leg Lock Escapes/i] },
  { pos: "jambes", belt: "violette", title: "Attaquer les jambes en système", author: "Gordon Ryan", w: "32, 37", why: "Entrées et finitions, toujours reliées au passage.", m: [/Systematically Attacking The Legs by Gordon Ryan/i] },

  { pos: "soumissions", belt: "blanche", title: "Défendre les soumissions", author: "John Danaher", w: "5, 12", why: "Comprendre pourquoi une soumission marche, et la casser tôt.", m: [/New Philosophy Of Submissions? Escapes/i] },
  { pos: "soumissions", belt: "blanche", title: "Luta Livre : soumissions de base", author: "Nicolas Renier", w: "6, 34", why: "Les finitions de référence de la Luta Livre.", m: [/Renier - Luta Livre Concepts-Basic Submissions/i] },
  { pos: "soumissions", belt: "blanche", title: "Luta Livre : défense de guillotine", author: "Nicolas Renier", w: "3, 11", why: "La guillotine punit chaque entrée en lutte ratée.", m: [/Renier - Principles of Guillotine Defense/i] },
  { pos: "soumissions", belt: "bleue", title: "La kimura de A à Z", author: "Lachlan Giles", w: "20, 25", why: "La soumission la plus polyvalente : dessus, dessous, en scramble.", m: [/Lachlan\.Giles - The\.Kimura\.Anthology/i, /Kimura Anthology/i] },
  { pos: "soumissions", belt: "bleue", title: "La guillotine en système", author: "Gordon Ryan", w: "16, 34", why: "L'arme signature de la Luta Livre et du MMA sur les entrées en lutte.", m: [/Systematically Attacking The Guillotine by Gordon Ryan/i] },
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
