// Classement des vidéos par discipline (d'après les noms de dossiers et de fichiers)
// et traduction automatique des titres anglais en français (vocabulaire du grappling et du combat).
const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const DISCIPLINES = [
  { id: "mma", label: "MMA", color: "#C6F432", kw: ["mma", "ufc", "cage", "ground and pound", "gnp", "dirty boxing", "wall"] },
  { id: "luta", label: "Luta Livre", color: "#7BD88F", kw: ["luta", "renier"] },
  { id: "lutte", label: "Lutte", color: "#F5A524", kw: ["wrestl", "lutte", "takedown", "single leg", "double leg", "chain wrestling", "freestyle", "greco", "folkstyle", "sprawl", "snap down", "ankle pick", "duck under", "front headlock", "high crotch", "fireman"] },
  { id: "judo", label: "Judo", color: "#2EC4B6", kw: ["judo", "uchi mata", "seoi", "osoto", "harai", "tomoe", "ippon", "kosoto", "kouchi", "ouchi", "sumi gaeshi"] },
  { id: "jjb", label: "JJB kimono", color: "#E6EDF5", kw: ["kimono", " gi ", "-gi", "lapel", "collar", "sleeve", "spider", "lasso", "worm", "ibjjf", "de la riva", "cross collar", "bow and arrow", "ezekiel", "loop choke", "baseball bat"] },
  { id: "grappling", label: "Grappling no-gi", color: "#3B82F6", kw: ["bjj", "jiu", "jitsu", "grappl", "no gi", "nogi", "no-gi", "guard", "garde", "pass", "leglock", "leg lock", "heel hook", "submission", "danaher", "gordon ryan", "lachlan", "mendes", "marcelo", "craig jones", "mikey musumeci", "adcc", "berimbolo", "armbar", "kimura", "triangle", "choke", "back take", "back attack", "mount", "escape", "sweep", "sambo", "half guard", "butterfly", "x guard", "ashi", "saddle", "turtle", "closed guard", "body lock", "front headlock", "guillotine", "darce", "anaconda", "rear naked"] },
  { id: "boxe", label: "Boxe", color: "#F25F5C", kw: ["boxing", "boxe", "box ", "jab", "punch", "hook", "uppercut", "slip", "head movement", "footwork", "pad work", "mitts"] },
  { id: "pieds", label: "Muay thaï / Kick", color: "#B388FF", kw: ["muay", "thai", "kickbox", "kick boxing", "k-1", "k1 ", "karate", "taekwondo", "savate", "low kick", "teep", "clinch knee", "elbow"] },
  { id: "prepa", label: "Prépa physique", color: "#FF7AB6", kw: ["strength", "conditioning", "s&c", "mobility", "flexibility", "yoga", "prepa", "physique", "kettlebell", "plyo", "cardio", "injury", "rehab"] },
  { id: "autre", label: "Autre", color: "#8A8A8A", kw: [] },
];

// score par discipline : les mots très spécifiques (nom de la discipline) comptent davantage
export function classify(text) {
  const t = ` ${norm(text)} `;
  let best = "autre", score = 0;
  for (const d of DISCIPLINES) {
    let s = 0;
    for (const k of d.kw) if (t.includes(k)) s += k.length >= 5 ? 2 : 1;
    if (d.id === "jjb") continue; // décidé après : kimono ou no-gi
    if (t.includes(d.id === "grappling" ? "jiu" : d.id === "lutte" ? "wrestl" : d.id === "pieds" ? "muay" : `${d.id}`)) s += 3;
    if (d.id === "mma" && (t.includes(" ufc") || t.includes("mma"))) s += 4;
    if (s > score) { score = s; best = d.id; }
  }
  if (best === "grappling") {
    const nogi = /no[ -]?gi|nogi|adcc|leg ?lock|heel hook|saddle|ashi|danaher|gordon ryan|craig jones|lachlan|submission only|\bebi\b|grappling/.test(t);
    const gi = DISCIPLINES.find((d) => d.id === "jjb").kw.some((k) => t.includes(k)) || /\bgi\b/.test(t);
    if (gi && !nogi) best = "jjb";
    else if (!gi && !nogi && /jiu|bjj/.test(t)) best = "jjb"; // JJB sans précision : le plus souvent en kimono
  }
  return DISCIPLINES.find((d) => d.id === best);
}

// ---- catégories (thèmes) par discipline, dans l'ordre logique d'apprentissage ----
const GRAP_THEMES = [
  { id: "bases", label: "Bases et principes", kw: ["fundamental", "basics", "beginner", "essentials", "foundation", "principles", "concepts", "101", "white belt", "start here"] },
  { id: "sorties", label: "Sorties et défense", kw: ["escape", "escapes", "defense", "defence", "defending", "survival", "surviv", "bottom side", "bottom mount", "counter"] },
  { id: "controles", label: "Contrôles (montée, 100 kg, nord-sud)", kw: ["mount", "side control", "north south", "knee on belly", "pin", "pins", "pressure", "top control", "cross side", "kesa"] },
  { id: "gardes", label: "Gardes et rétention", kw: ["guard", "half guard", "butterfly", "closed guard", "spider", "lasso", "de la riva", "dlr", "x guard", "worm", "k guard", "z guard", "open guard", "retention", "inversion", "shin", "collar sleeve"] },
  { id: "passages", label: "Passages de garde", kw: ["pass", "passing", "knee cut", "torreando", "leg drag", "smash", "over under", "headquarters", "stack"] },
  { id: "renversements", label: "Renversements", kw: ["sweep", "sweeps", "reversal", "wrestle up", "come up"] },
  { id: "dos", label: "Dos et tortue", kw: ["back take", "back takes", "back attack", "back control", "rear naked", "crucifix", "truck", "berimbolo", "turtle", "seat belt", "body triangle", "the back"] },
  { id: "soumissions", label: "Soumissions (bras et étranglements)", kw: ["submission", "choke", "armbar", "arm bar", "triangle", "kimura", "guillotine", "darce", "anaconda", "omoplata", "americana", "strangle", "ezekiel", "bow and arrow", "arm lock", "armlock", "wrist lock", "finish"] },
  { id: "jambes", label: "Clés de jambes", kw: ["leg lock", "leglock", "heel hook", "ankle lock", "kneebar", "knee bar", "toe hold", "ashi", "saddle", "411", "inside sankaku", "entanglement", "footlock", "foot lock", "calf slicer", "50/50"] },
  { id: "debout", label: "Debout et amenées", kw: ["takedown", "takedowns", "standing", "stand up", "guard pull", "wrestling", "judo for", "single leg", "double leg", "snap", "front headlock", "body lock"] },
];
const THEMES = {
  luta: GRAP_THEMES, jjb: GRAP_THEMES, grappling: GRAP_THEMES,
  lutte: [
    { id: "jambes", label: "Attaques aux jambes", kw: ["single", "double", "high crotch", "ankle pick", "shot", "penetration", "low single", "sweep single", "leg attack", "blast"] },
    { id: "haut", label: "Lutte de mains, clinch et haut du corps", kw: ["hand fight", "hand fighting", "tie", "underhook", "collar", "two on one", "2 on 1", "arm drag", "duck under", "body lock", "upper body", "greco", "throw", "headlock", "slide by"] },
    { id: "tete", label: "Contrôle de tête et snap down", kw: ["front headlock", "snap", "go behind", "spin behind", "cradle", "guillotine"] },
    { id: "defense", label: "Défense et contres", kw: ["sprawl", "defense", "defence", "whizzer", "counter", "re-attack", "scramble"] },
    { id: "sol", label: "Lutte au sol (dessus / dessous)", kw: ["ride", "riding", "breakdown", "turn", "tilt", "gut wrench", "bottom", "top", "mat return", "escape", "stand up", "par terre", "leg ride"] },
  ],
  judo: [
    { id: "kumikata", label: "Saisies (kumikata)", kw: ["grip", "kumikata", "gripping"] },
    { id: "projections", label: "Projections (nage-waza)", kw: ["throw", "nage", "gari", "gake", "uchi", "seoi", "harai", "otoshi", "gaeshi", "tomoe", "sumi", "osoto", "kouchi", "ouchi"] },
    { id: "sol", label: "Sol (ne-waza)", kw: ["newaza", "ne waza", "ne-waza", "osaekomi", "turnover", "pin", "shime", "kansetsu"] },
  ],
  boxe: [
    { id: "coups", label: "Coups et technique", kw: ["jab", "cross", "hook", "uppercut", "punch", "straight", "body shot"] },
    { id: "defense", label: "Défense et esquives", kw: ["slip", "roll", "block", "parry", "defense", "defence", "head movement", "guard"] },
    { id: "jambes", label: "Jeu de jambes et distance", kw: ["footwork", "angle", "angles", "ring", "distance", "range", "pivot"] },
    { id: "tactique", label: "Enchaînements et tactique", kw: ["combo", "combination", "counter", "strategy", "pressure", "setup", "feint"] },
  ],
  pieds: [
    { id: "pieds", label: "Coups de pied", kw: ["kick", "teep", "roundhouse", "low kick", "switch"] },
    { id: "clinch", label: "Clinch, genoux et coudes", kw: ["clinch", "knee", "elbow", "plum", "sweep"] },
    { id: "defense", label: "Défense et contres", kw: ["check", "block", "defense", "defence", "counter", "catch"] },
    { id: "tactique", label: "Enchaînements et tactique", kw: ["combo", "combination", "strategy", "setup", "feint", "pressure"] },
  ],
  mma: [
    { id: "striking", label: "Striking MMA", kw: ["striking", "punch", "kick", "boxing", "range", "stance"] },
    { id: "lutte", label: "Lutte MMA et amenées", kw: ["takedown", "wrestling", "shot", "double leg", "single leg", "sprawl"] },
    { id: "mur", label: "Cage et mur", kw: ["wall", "cage", "fence", "wall walk"] },
    { id: "gnp", label: "Ground and pound et contrôle", kw: ["ground and pound", "gnp", "top control", "strikes", "elbows"] },
    { id: "sol", label: "Sol MMA (relevés, soumissions)", kw: ["get up", "getting up", "stand up", "submission", "guard", "bottom", "choke"] },
  ],
  prepa: [
    { id: "force", label: "Force et puissance", kw: ["strength", "power", "force", "kettlebell", "barbell", "plyo"] },
    { id: "cardio", label: "Conditionnement", kw: ["conditioning", "cardio", "endurance", "hiit", "energy system"] },
    { id: "mobilite", label: "Mobilité et souplesse", kw: ["mobility", "flexibility", "stretch", "yoga", "mobilite"] },
    { id: "blessures", label: "Prévention des blessures", kw: ["injury", "rehab", "prehab", "knee", "shoulder", "back pain"] },
  ],
};
export const OTHER_THEME = { id: "autres", label: "Divers et séminaires" };
export const themesOf = (disc) => [...(THEMES[disc] || []), OTHER_THEME];
export function themeOf(disc, text) {
  const t = ` ${norm(text)} `;
  let best = OTHER_THEME, score = 0;
  for (const th of THEMES[disc] || []) {
    let s = 0;
    for (const k of th.kw) if (t.includes(k)) s += k.length >= 6 ? 2 : 1;
    if (th.id === "passages" && /pass(ing|es)?\b/.test(t)) s += 3; // « guard passing » = passage, pas garde
    if (th.id === "renversements" && /sweep/.test(t)) s += 3;
    if (th.id === "sorties" && /escape/.test(t)) s += 3;
    if (s > score) { score = s; best = th; }
  }
  return best;
}

// ---- ceintures (Luta Livre, JJB, grappling) : une progression cohérente ----
export const BELT_DISCS = ["luta", "jjb", "grappling"];
export const BELTS = [
  { id: "blanche", label: "Ceinture blanche", sub: "survivre, contrôler, les bases", color: "#F2F2F2" },
  { id: "bleue", label: "Ceinture bleue", sub: "gardes, passages, renversements, finitions de base", color: "#2F6FEB" },
  { id: "violette", label: "Ceinture violette", sub: "systèmes, enchaînements, clés de jambes", color: "#8E44AD" },
  { id: "marron", label: "Ceinture marron / noire", sub: "haut niveau, détails, compétition", color: "#8B5A2B" },
];
export function beltOf(text, theme) {
  const t = ` ${norm(text)} `;
  if (/white belt|beginner|fundamental|basics|essentials|foundation|\b101\b|for beginners|zero to|start here|first steps|bases|debutant/.test(t)) return BELTS[0];
  if (/black belt|brown belt|advanced|masterclass|expert|high level|elite|mastery|world champion|competition|tournament|details|avance/.test(t)) return BELTS[3];
  if (/purple belt|ecosystem|blueprint|systematically|system|berimbolo|worm|lasso|spider|inversion|50\/50|matrix|crab ride|kiss of the dragon|k guard|x guard|de la riva|dlr|saddle|ashi|411/.test(t)) return BELTS[2];
  if (/blue belt|intermediate/.test(t)) return BELTS[1];
  return { bases: BELTS[0], sorties: BELTS[0], controles: BELTS[0], gardes: BELTS[1], passages: BELTS[1], renversements: BELTS[1], dos: BELTS[1], soumissions: BELTS[1], debout: BELTS[1], jambes: BELTS[2] }[theme] || BELTS[1];
}

// expressions d'abord (les plus longues), puis mots seuls
const PHRASES = [
  ["bottom game", "jeu du dessous"], ["top game", "jeu du dessus"], ["guard game", "jeu de garde"], ["passing game", "jeu de passage"], ["master class", "masterclass"], ["advanced basics", "bases avancées"], ["from everywhere", "de partout"], ["low single", "low single"],
  ["mount escapes", "sorties de montée"], ["mount escape", "sortie de montée"], ["side control escapes", "sorties du contrôle latéral"], ["back escapes", "sorties du dos"], ["spider guard", "garde araignée (spider)"], ["lasso guard", "garde lasso"], ["x guard", "garde X"], ["single leg x", "single-leg X"], ["de la riva", "De La Riva"], ["k guard", "garde K"], ["z guard", "garde Z"], ["knee shield", "bouclier du genou"], ["guard pull", "tirage de garde"], ["front headlock", "contrôle de la tête (front headlock)"], ["for beginners", "pour débutants"],
  ["rear naked choke", "étranglement arrière"], ["arm triangle", "arm-triangle"], ["half guard", "demi-garde"], ["closed guard", "garde fermée"],
  ["open guard", "garde ouverte"], ["butterfly guard", "garde papillon"], ["side control", "contrôle latéral"], ["north south", "nord-sud"],
  ["back take", "prise de dos"], ["back takes", "prises de dos"], ["back control", "contrôle du dos"], ["back attacks", "attaques du dos"], ["guard passing", "passage de garde"],
  ["guard pass", "passage de garde"], ["guard retention", "rétention de garde"], ["leg locks", "clés de jambes"], ["leglocks", "clés de jambes"], ["leg lock", "clé de jambe"],
  ["heel hook", "clé de talon"], ["straight ankle lock", "clé de cheville droite"], ["ankle lock", "clé de cheville"], ["knee bar", "clé de genou"], ["kneebar", "clé de genou"],
  ["front headlock", "contrôle de la tête (front headlock)"], ["single leg", "single-leg"], ["double leg", "double-leg"], ["body lock", "ceinture (body lock)"],
  ["knee cut", "knee cut (genou en coupe)"], ["leg drag", "leg drag"], ["arm drag", "arm drag"], ["hip toss", "projection de hanche"], ["snap down", "snap down"],
  ["grip fighting", "lutte de mains"], ["hand fighting", "lutte de mains"], ["chain wrestling", "lutte en chaîne"], ["live rolling", "combat libre au sol"],
  ["positional sparring", "sparring positionnel"], ["q&a", "questions-réponses"], ["q & a", "questions-réponses"], ["how to", "comment"], ["head movement", "mouvements de tête"],
  ["ground and pound", "ground and pound"], ["takedown defense", "défense d'amenée"], ["self defense", "self-défense"], ["no gi", "sans kimono"], ["nogi", "sans kimono"],
  ["part one", "partie 1"], ["part two", "partie 2"], ["part three", "partie 3"], ["step by step", "étape par étape"], ["in depth", "en profondeur"],
];
const WORDS = {
  guard: "garde", guards: "gardes", pass: "passage", passes: "passages", passing: "passage", mount: "montée", back: "dos", turtle: "tortue", escape: "sortie", escapes: "sorties",
  submission: "soumission", submissions: "soumissions", sub: "soumission", subs: "soumissions", choke: "étranglement", chokes: "étranglements", armbar: "clé de bras", armbars: "clés de bras",
  sweep: "renversement", sweeps: "renversements", takedown: "amenée au sol", takedowns: "amenées au sol", throw: "projection", throws: "projections", entries: "entrées", entry: "entrée",
  attacks: "attaques", attack: "attaque", defense: "défense", defence: "défense", defending: "défendre", counter: "contre", counters: "contres", finish: "finition", finishes: "finitions", finishing: "finir",
  system: "système", systems: "systèmes", basics: "bases", fundamentals: "fondamentaux", fundamental: "fondamental", concepts: "concepts", concept: "concept", principles: "principes", details: "détails",
  drills: "drills", drilling: "drills", setup: "préparation", setups: "préparations", control: "contrôle", controls: "contrôles", position: "position", positions: "positions", transition: "transition", transitions: "transitions",
  top: "dessus", bottom: "dessous", standing: "debout", seated: "assis", from: "depuis", to: "vers", with: "avec", without: "sans", and: "et", or: "ou", of: "de", the: "", a: "", an: "", your: "ton", you: "tu",
  for: "pour", vs: "contre", versus: "contre", against: "contre", when: "quand", how: "comment", why: "pourquoi", what: "quoi", into: "vers", on: "sur", in: "dans", off: "hors", over: "par-dessus", under: "sous",
  enter: "entrer dans", entering: "entrer dans", systematically: "systématiquement", attacking: "attaquer", boxing: "boxe", breaking: "casser", building: "construire", dominating: "dominer", dominate: "dominer", destroying: "détruire", winning: "gagner", fight: "combat", fighting: "combat",
  introduction: "introduction", intro: "introduction", conclusion: "conclusion", overview: "vue d'ensemble", review: "révision", recap: "récapitulatif", bonus: "bonus", volume: "volume", vol: "vol.", part: "partie", chapter: "chapitre", lesson: "leçon", seminar: "séminaire", instructional: "formation",
  striking: "frappe", strikes: "frappes", punches: "coups de poing", punch: "coup de poing", kicks: "coups de pied", kick: "coup de pied", knees: "genoux", knee: "genou", elbows: "coudes", elbow: "coude",
  footwork: "jeu de jambes", combinations: "enchaînements", combos: "enchaînements", combo: "enchaînement", clinch: "clinch", wrestling: "lutte", grappling: "grappling", strength: "force", conditioning: "conditionnement",
  mobility: "mobilité", flexibility: "souplesse", grips: "saisies", grip: "saisie", posture: "posture", pressure: "pression", leg: "jambe", legs: "jambes", arm: "bras", arms: "bras", head: "tête", neck: "nuque", hips: "hanches", hip: "hanche",
  frame: "cadre", frames: "cadres", underhook: "underhook", overhook: "overhook", whizzer: "whizzer", sprawl: "sprawl", wall: "mur", cage: "cage", fence: "grillage", ground: "sol", common: "courantes", mistakes: "erreurs", mistake: "erreur",
  advanced: "avancé", beginner: "débutant", beginners: "débutants", intermediate: "intermédiaire", complete: "complet", ultimate: "ultime", guide: "guide", secrets: "secrets", blueprint: "plan", mastery: "maîtrise", game: "jeu", style: "style", new: "nouveau",
  open: "ouverte", closed: "fermée", half: "demi", full: "complet", side: "côté", far: "loin", near: "proche", inside: "intérieur", outside: "extérieur", high: "haut", low: "bas", short: "court", long: "long", first: "premier", second: "second", last: "dernier",
};
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
export function translateTitle(raw) {
  let t = ` ${String(raw).replace(/[_]+/g, " ").replace(/\s+/g, " ").trim()} `;
  const looksFr = /\b(le|la|les|des|du|et|garde|clé|sortie|passage)\b/i.test(t) && !/\b(the|and|guard|pass)\b/i.test(t);
  if (looksFr) return raw.trim();
  const keep = []; // expressions déjà traduites : protégées de la traduction mot à mot
  for (const [en, fr] of PHRASES) t = t.replace(new RegExp(`\\b${en.replace(/[&]/g, "\\$&")}\\b`, "gi"), () => `\u0001${keep.push(fr) - 1}\u0001`);
  t = t.replace(/\b([A-Za-z']+)\b/g, (w) => { const k = w.toLowerCase(); return Object.prototype.hasOwnProperty.call(WORDS, k) ? WORDS[k] : w; });
  t = t.replace(/\u0001(\d+)\u0001/g, (_, i) => keep[Number(i)]);
  t = t.replace(/\s+/g, " ").replace(/\s([,.;:])/g, "$1").trim();
  return cap(t);
}
