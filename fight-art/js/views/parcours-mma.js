// Cursus vidéo MMA : les vidéos gratuites des références du MMA sur YouTube (Jeff Chan / MMA Shredded, Georges St-Pierre,
// Firas Zahabi, Shane Fazen / fightTIPS, Ramsey Dewey, Bas Rutten, et des pros français : Brian Bouland, Mehdi Ben Lakhdhar,
// Johnny Frachey, GONG), rangées par niveau du programme MMA du club (Fondamentaux → Développement → Compétition),
// par catégorie et par situation de combat, et reliées aux techniques et combinés de l'appli.
import { esc, openSheet } from "../ui.js";
import { myNote } from "../study-notes.js";
import { tech } from "../systems-data.js";
import { CLASSIC_COMBOS } from "../academy-data.js";
import { openExplorer } from "./systems.js";

const LEVELS = [
  { id: "fond", label: "Fondamentaux", color: "#7BD88F", goal: "Rester combattant : distance, frappes de base, première amenée, défendre l'amenée, survivre et se relever au sol.", blocs: "Blocs 1-2 du programme : Entrer dans le MMA, Produire" },
  { id: "dev", label: "Développement", color: "#F5A524", goal: "Lire et choisir : feintes, défense de tête, contres, lutte en chaîne, clinch, punir les amenées.", blocs: "Blocs 3-5 : Lire, Choisir, Provoquer" },
  { id: "comp", label: "Compétition", color: "#F25F5C", goal: "Imposer l'espace et contrôler la cage : lutte contre le grillage, clinch, se relever sous la pression, affiner son jeu.", blocs: "Blocs 6-8 : Imposer l'espace, Cage control, Affiner" },
];
const CATS = [
  { id: "frappe", label: "Frappe" },
  { id: "lutte", label: "Lutte et clinch" },
  { id: "cage", label: "Cage" },
  { id: "dessus", label: "Sol, dessus" },
  { id: "dessous", label: "Sol, dessous" },
];

// a : auteur · lang : fr = en français, en = anglais avec sous-titres français · s : situation de combat
// techs : techniques de la carte « Risques et ouvertures » de l'appli · combo : combiné classique de l'appli
const VIDEOS = [
  // ---------- FONDAMENTAUX ----------
  { lvl: "fond", cat: "frappe", a: "Georges St-Pierre", id: "nS5ITxJoWHo", lang: "fr", t: "Les bases du combat", s: "Je commence le MMA : garde, distance, déplacements.", techs: ["jab", "cross", "sprawl"], pts: ["Une garde qui protège des coups ET de l'amenée au sol.", "Gérer la distance avant de chercher à frapper.", "Bouger après chaque action, ne jamais rester devant."] },
  { lvl: "fond", cat: "frappe", a: "Shane Fazen (fightTIPS)", id: "vujeHIBjNkg", lang: "en", t: "5 façons d'utiliser le jab en MMA", s: "Je veux toucher sans m'exposer.", techs: ["jab", "cross", "double"], combo: "Jab, direct", pts: ["Le jab mesure la distance et masque la suite.", "Varier : jab au corps, jab qui prépare l'amenée.", "La main revient aussi vite qu'elle part."] },
  { lvl: "fond", cat: "frappe", a: "Brian Bouland", id: "uy3NLdBlG8w", lang: "fr", t: "Comment défendre les low kicks en MMA", s: "Il frappe mes jambes.", techs: ["lowkick", "calf", "check"], combo: "Low kick au mollet, direct", pts: ["Lever la jambe (check) ou la retirer selon la distance.", "Ne pas garder le poids sur la jambe avant.", "Répondre tout de suite après le blocage."] },
  { lvl: "fond", cat: "lutte", a: "Shane Fazen (fightTIPS)", id: "KnICbiC9744", lang: "en", t: "Lutte pour le MMA : garde et entrée sur les amenées", s: "Je veux amener au sol depuis la distance.", techs: ["double", "single"], combo: "Jab, changement de niveau, double-leg", pts: ["Une garde qui permet de frapper et de lutter.", "Changer de niveau en pliant les jambes, tête haute.", "Entrer sur une frappe, jamais à froid."] },
  { lvl: "fond", cat: "lutte", a: "GONG", id: "HYcVz8JAf0Y", lang: "fr", t: "Lutte pour MMA : direct, swing et amenée", s: "Je frappe pour entrer en lutte.", techs: ["cross", "double"], combo: "Direct, changement de niveau", pts: ["La frappe fait lever sa garde.", "L'amenée part dans la foulée de la frappe.", "Tête collée au corps à la fin, pas devant."] },
  { lvl: "fond", cat: "lutte", a: "Marvelous BJJ TV", id: "Phb_zeHCeXY", lang: "fr", t: "Défense de base en sprawl, vers le dos et la guillotine", s: "Il plonge sur mes jambes.", techs: ["sprawl", "frontheadlock", "guillotine"], combo: "Sprawl, direct, sortie", pts: ["Mains d'abord, puis hanches au sol, jambes en arrière.", "Ton poids sur son dos et sa nuque.", "Après le sprawl : tourner vers son dos ou guillotine."] },
  { lvl: "fond", cat: "dessous", a: "Brian Bouland", id: "y_WBTpsL5YA", lang: "fr", t: "Comment s'échapper de la montée en MMA", s: "Il est monté sur moi et frappe.", techs: ["mount", "bridge", "shrimp"], pts: ["Protéger la tête et coller les coudes.", "Pont pour le déséquilibrer, puis sortie coude-genou.", "Récupérer la garde, puis se relever."] },
  { lvl: "fond", cat: "dessous", a: "Ramsey Dewey", id: "UJlP5BeeEY0", lang: "en", t: "Le guide du striker pour se relever en MMA", s: "Je suis au sol, je veux revenir debout.", techs: ["standup", "frame"], pts: ["Cadres et distance avant de se relever.", "Relevé technique : une main au sol, hanches qui reculent.", "Revenir en garde tout de suite, prêt à frapper."] },
  { lvl: "fond", cat: "dessus", a: "Johnny Frachey (GregMMA)", id: "CeiWC-q717o", lang: "fr", t: "Le ground and pound comme un pro", s: "Je suis dessus : frapper sans perdre la position.", techs: ["gnp", "guardpass"], pts: ["La position d'abord, les frappes ensuite.", "Garder la posture pour ne pas être contrôlé.", "Frapper pour ouvrir un passage, pas au hasard."] },

  // ---------- DÉVELOPPEMENT ----------
  { lvl: "dev", cat: "frappe", a: "Shane Fazen (fightTIPS)", id: "Q-dXNNevIoI", lang: "en", t: "5 façons d'utiliser les feintes en MMA", s: "Il lit mes attaques : je dois le faire réagir.", techs: ["feint", "double", "cross"], combo: "Feinte d'uppercut, direct", pts: ["Une feinte crédible ressemble à la vraie attaque.", "Feinter l'amenée pour ouvrir les frappes, et l'inverse.", "Regarder sa réaction avant d'attaquer."] },
  { lvl: "dev", cat: "frappe", a: "Firas Zahabi", id: "DwFwwyL-Ryc", lang: "en", t: "3 façons de défendre le jab", s: "Il me touche au jab.", techs: ["jab", "cross", "lhook"], pts: ["Parer, sortir de la ligne ou reculer : selon la distance.", "Une défense qui prépare ton contre.", "Ne pas rester dans sa ligne d'attaque."] },
  { lvl: "dev", cat: "frappe", a: "Jeff Chan (MMA Shredded)", id: "bt5WLwy_YIY", lang: "en", t: "8 conseils de mouvements de tête", s: "Il me touche en contre.", techs: ["jab", "cross", "lhook"], pts: ["Bouger la tête avant et après tes attaques.", "Petits mouvements, pas de grandes esquives.", "Esquiver pour être en position de contrer."] },
  { lvl: "dev", cat: "frappe", a: "Jeff Chan (MMA Shredded)", id: "qdSQSA0-0R4", lang: "en", t: "Mes 7 meilleurs contres en sparring", s: "Il attaque : je réponds.", techs: ["cross", "lhook", "uppercut"], pts: ["Un contre se prépare : connaître ses attaques favorites.", "Défendre et frapper dans le même temps.", "Sortir d'angle après le contre."] },
  { lvl: "dev", cat: "lutte", a: "Jeff Chan (MMA Shredded)", id: "pr5-pzwukRc", lang: "en", t: "7 amenées en chaîne simples et efficaces", s: "Ma première amenée est défendue.", techs: ["single", "double", "trip"], combo: "Direct, changement de niveau", pts: ["Chaque défense ouvre l'amenée suivante.", "Garder le contact pendant l'enchaînement.", "Simple et efficace plutôt que spectaculaire."] },
  { lvl: "dev", cat: "lutte", a: "Jeff Chan (MMA Shredded)", id: "eaiT61xGcaE", lang: "en", t: "11 façons d'attraper les coups de pied et de balayer", s: "Il me lance des coups de pied.", techs: ["catch", "trip", "midkick", "lowkick"], pts: ["Attraper le coup de pied en absorbant l'impact.", "Balayer la jambe d'appui ou frapper tout de suite.", "Ne pas tenir la jambe trop longtemps."] },
  { lvl: "dev", cat: "lutte", a: "Shane Fazen (fightTIPS)", id: "0cdw9_7EGo4", lang: "en", t: "Strikers contre lutteurs : stopper les amenées avec ce coup", s: "Un lutteur me tire dessus.", techs: ["sprawl", "uppercut", "knee"], combo: "Sprawl, direct, sortie", pts: ["Le lutteur baisse la tête en entrant : punir ce moment.", "Timing plutôt que puissance.", "Garder les hanches prêtes à sprawler."] },
  { lvl: "dev", cat: "lutte", a: "Ramsey Dewey", id: "XavDyo61cBo", lang: "en", t: "9 fondamentaux du combat au clinch", s: "On est collés : qui contrôle ?", techs: ["clinch", "knee", "elbow"], combo: "Saisie à la nuque, genou, genou", pts: ["Gagner la position des bras (underhooks, nuque).", "Hanches proches pour ne pas être projeté.", "Frapper en restant en contrôle."] },
  { lvl: "dev", cat: "lutte", a: "GONG", id: "mCHPWzpjqjE", lang: "fr", t: "Shogun Rua : fracasser en coudes et en genoux", s: "Je le tiens au clinch.", techs: ["clinch", "knee", "elbow"], combo: "Saisie à la nuque, genou, genou", pts: ["Contrôler la tête avant de frapper.", "Genoux qui montent avec les hanches.", "Coudes courts dans les transitions."] },

  // ---------- COMPÉTITION ----------
  { lvl: "comp", cat: "cage", a: "Shane Fazen (fightTIPS)", id: "C-q6NYWPAVk", lang: "en", t: "Combattre dos à la cage et clinch MMA", s: "Je suis collé à la cage.", techs: ["bodylock", "standup", "whizzer"], combo: "Underhook, ceinture arrière, crochet de jambe", pts: ["Prendre l'underhook et tourner pour sortir.", "Ne pas rester dos à plat contre le grillage.", "Frapper pour créer l'espace de sortie."] },
  { lvl: "comp", cat: "cage", a: "Mehdi Ben Lakhdhar", id: "kaNeugV_Q7I", lang: "fr", t: "Comment défendre contre la cage ?", s: "Il me plaque contre la cage.", techs: ["bodylock", "whizzer", "standup"], pts: ["Gagner la bataille des mains et des underhooks.", "Hanches loin des siennes.", "Sortir en pivotant, pas en reculant."] },
  { lvl: "comp", cat: "cage", a: "Brian Bouland", id: "y8o7nDPbHX0", lang: "fr", t: "Double-leg contre la cage", s: "Je l'ai coincé contre la cage.", techs: ["double", "bodylock", "trip"], combo: "Underhook, ceinture arrière, crochet de jambe", pts: ["Utiliser la cage pour l'empêcher de reculer.", "Tête collée, hanches sous les siennes.", "Le décoller de la cage avant de finir."] },
  { lvl: "comp", cat: "lutte", a: "Bas Rutten", id: "EuHZTy3uEuY", lang: "en", t: "Battre un combattant de clinch", s: "Il veut me tenir au clinch.", techs: ["clinch", "knee", "elbow"], pts: ["Casser sa prise avant qu'il s'installe.", "Frapper à la sortie du clinch.", "Ne pas lutter là où il est le plus fort."] },
  { lvl: "comp", cat: "dessous", a: "Kajan Johnson", id: "vBj84Rr9RK0", lang: "en", t: "La stratégie n°1 pour se relever en MMA", s: "Il me maintient au sol sous la pression.", techs: ["standup", "frame", "turnin"], pts: ["Un plan clair pour se relever, pas des efforts au hasard.", "Cadres et hanches avant de se relever.", "Se relever face à lui, prêt à frapper."] },
  { lvl: "comp", cat: "frappe", a: "Jeff Chan (MMA Shredded)", id: "Hz00I3XoZvE", lang: "en", t: "La garde longue mélangée au Philly shell : un système de défense", s: "Je veux un système de défense qui me ressemble.", techs: ["jab", "cross", "lhook"], pts: ["Combiner deux défenses selon la distance.", "Défendre en gardant la possibilité de contrer.", "Adapter la garde aux frappes et à la lutte du MMA."] },
  { lvl: "comp", cat: "frappe", a: "Jeff Chan (MMA Shredded)", id: "UqBvFAukcAQ", lang: "en", t: "7 conseils pour des mouvements de tête de haut niveau", s: "J'affine ma défense debout.", techs: ["jab", "cross", "uppercut"], pts: ["Le mouvement de tête se travaille en rythme.", "Rester en équilibre pour pouvoir lutter.", "Esquiver pour créer un angle d'attaque."] },
];

const params = (lang) => `autoplay=1&rel=0&hl=fr${lang === "en" ? "&cc_load_policy=1&cc_lang_pref=fr" : ""}`;

export function openParcoursMMA() {
  let lvl = "", cat = "";
  const body = openSheet("Cursus vidéo MMA", "");
  const card = (v) => {
    const L = LEVELS.find((x) => x.id === v.lvl);
    const combo = v.combo ? CLASSIC_COMBOS.find((c) => c.name === v.combo) : null;
    return `<div class="sys-card" style="border-left:4px solid ${L.color};margin:10px 0;padding:10px 12px">
      <div class="row between" style="gap:8px"><span class="tiny muted">${esc(CATS.find((c) => c.id === v.cat)?.label || "")}</span><span class="tiny" style="font-weight:800;color:${v.lang === "fr" ? "var(--tape)" : "#9AA3AE"}">${v.lang === "fr" ? "🇫🇷 En français" : "VO · sous-titres FR"}</span></div>
      <div class="small" style="margin:4px 0 2px"><b>Situation :</b> ${esc(v.s)}</div>
      <b class="small">${esc(v.t)}</b> <span class="tiny muted">· ${esc(v.a)}</span>
      <button data-yt="${v.id}" data-lang="${v.lang}" aria-label="Lire" style="position:relative;display:block;width:100%;margin:8px 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>
      <div class="tiny" style="font-weight:800;color:var(--tape);text-transform:uppercase;letter-spacing:.04em">Points importants</div>
      <ul class="bul" style="margin:4px 0 6px">${v.pts.map((n) => `<li class="small">${esc(n)}</li>`).join("")}</ul>
      ${combo ? `<div class="panel" style="padding:8px 10px;margin:6px 0"><div class="tiny" style="font-weight:800">Combiné de l'appli : ${esc(combo.name)}</div><div class="tiny muted">${esc(combo.opens)} ${combo.tip ? `· ${esc(combo.tip)}` : ""}</div></div>` : ""}
      <div class="row" style="gap:6px;flex-wrap:wrap;margin:6px 0"><span class="tiny muted">Système de l'appli :</span>${v.techs.map((id) => tech(id)).filter(Boolean).map((t) => `<button class="chip" data-tech="${t.id}" style="font-size:12px">${esc(t.name)}</button>`).join("")}</div>
      ${myNote(`mma-cursus:${v.id}`, `Cursus MMA · ${v.t}`, { placeholder: "Ce que je retiens, mes drills, ce qui a marché en sparring…" })}
    </div>`;
  };
  const draw = () => {
    const vis = VIDEOS.filter((v) => (!lvl || v.lvl === lvl) && (!cat || v.cat === cat));
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les vidéos des références du MMA (Jeff Chan / MMA Shredded, Georges St-Pierre, Firas Zahabi, Shane Fazen, Ramsey Dewey, Bas Rutten, et des pros français), rangées par niveau du programme, par catégorie et par situation de combat. Chaque vidéo renvoie aux techniques et combinés de l'appli.</p>
      <p class="tiny muted" style="margin:0 0 10px">Vidéo en anglais sans sous-titres français ? Dans le lecteur : ⚙ → Sous-titres → Traduire automatiquement → Français.</p>
      <div class="chips" style="margin-bottom:6px"><button class="chip" data-l="" aria-pressed="${!lvl}">Tous niveaux</button>${LEVELS.map((L) => `<button class="chip" data-l="${L.id}" aria-pressed="${lvl === L.id}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${L.color};margin-right:6px"></span>${esc(L.label)}</button>`).join("")}</div>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-c="" aria-pressed="${!cat}">Toutes catégories</button>${CATS.filter((c) => VIDEOS.some((v) => v.cat === c.id && (!lvl || v.lvl === lvl))).map((c) => `<button class="chip" data-c="${c.id}" aria-pressed="${cat === c.id}">${esc(c.label)}</button>`).join("")}</div>
      ${LEVELS.filter((L) => vis.some((v) => v.lvl === L.id)).map((L) => `
        <div class="row" style="gap:8px;margin:20px 0 4px;align-items:center"><span style="width:14px;height:14px;border-radius:50%;background:${L.color};flex:none"></span><h3 class="sys-h" style="margin:0">${esc(L.label)}</h3></div>
        <p class="tiny muted" style="margin:0 0 2px">${esc(L.goal)}</p><p class="tiny" style="margin:0 0 6px;color:${L.color}">${esc(L.blocs)}</p>
        ${CATS.filter((c) => vis.some((v) => v.lvl === L.id && v.cat === c.id)).map((c) => `<div class="tiny" style="margin:14px 0 2px;font-weight:800;text-transform:uppercase;letter-spacing:.04em">${esc(c.label)}</div>
          ${vis.filter((v) => v.lvl === L.id && v.cat === c.id).map(card).join("")}`).join("")}`).join("")}
      <a class="btn ghost block" href="https://www.youtube.com/@MMAShredded/videos" target="_blank" rel="noopener" style="margin-top:14px">Toute la chaîne de Jeff Chan (MMA Shredded)</a>`;
  };
  body.addEventListener("click", (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;margin:8px 0;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?${params(th.dataset.lang)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const tc = e.target.closest("[data-tech]"); if (tc) { openExplorer(tc.dataset.tech, openParcoursMMA); return; }
    const l = e.target.closest("[data-l]"); if (l) { lvl = l.dataset.l; draw(); return; }
    const c = e.target.closest("[data-c]"); if (c) { cat = c.dataset.c; draw(); }
  });
  draw();
}
