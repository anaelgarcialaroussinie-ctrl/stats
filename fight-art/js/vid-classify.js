// Classement des vidéos par discipline (d'après les noms de dossiers et de fichiers)
// et traduction automatique des titres anglais en français (vocabulaire du grappling et du combat).
const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

export const DISCIPLINES = [
  { id: "mma", label: "MMA", color: "#C6F432", kw: ["mma", "ufc", "cage", "ground and pound", "gnp", "dirty boxing", "wall"] },
  { id: "luta", label: "Luta Livre", color: "#7BD88F", kw: ["luta", "renier"] },
  { id: "lutte", label: "Lutte", color: "#F5A524", kw: ["wrestl", "lutte", "takedown", "single leg", "double leg", "chain wrestling", "freestyle", "greco", "folkstyle", "sprawl", "snap down", "ankle pick", "duck under", "front headlock", "high crotch", "fireman"] },
  { id: "judo", label: "Judo", color: "#2EC4B6", kw: ["judo", "uchi mata", "seoi", "osoto", "harai", "tomoe", "ippon", "kosoto", "kouchi", "ouchi", "sumi gaeshi"] },
  { id: "bjj", label: "Jiu-jitsu / Grappling", color: "#4F8DF7", kw: ["bjj", "jiu", "jitsu", "grappl", "no gi", "nogi", "guard", "garde", "pass", "leglock", "leg lock", "heel hook", "submission", "danaher", "gordon ryan", "lachlan", "mendes", "marcelo", "craig jones", "mikey musumeci", "adcc", "berimbolo", "armbar", "kimura", "triangle", "choke", "back take", "back attack", "mount", "escape", "sweep", "sambo", "half guard", "butterfly", "de la riva", "x guard", "ashi", "saddle", "turtle", "closed guard"] },
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
    if (t.includes(d.id === "bjj" ? "jiu" : d.id === "lutte" ? "wrestl" : d.id === "pieds" ? "muay" : `${d.id}`)) s += 3;
    if (d.id === "mma" && (t.includes(" ufc") || t.includes("mma"))) s += 4;
    if (s > score) { score = s; best = d.id; }
  }
  return DISCIPLINES.find((d) => d.id === best);
}

// expressions d'abord (les plus longues), puis mots seuls
const PHRASES = [
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
