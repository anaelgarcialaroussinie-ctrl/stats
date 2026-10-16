// Vidéos explicatives : pour chaque exercice, technique, arme ou combinaison.
// - « Voir en vidéo » : recherche YouTube ciblée (requête en anglais, là où les tutoriels sont les plus nombreux)
// - « En français » : la même recherche avec le nom français
// - « Vidéo du coach » : la vidéo de référence choisie par le coach (enregistrée dans la base, sujet « video:<clé> »)
import { esc, icon, toast } from "./ui.js";
import { sync } from "./sync.js";

export const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;
const safe = (u) => /^https?:\/\//i.test(String(u || "").trim());
const frQuery = (s) => `${String(s).replace(/[(),:·«»]/g, " ").replace(/\s+/g, " ").trim()} tuto`;

let map = null, loading = null;

export function loadVideos(force = false) {
  if (!sync.connected() || window.FAP_PREVIEW) return Promise.resolve(map || {});
  if (map && !force) return Promise.resolve(map);
  if (loading) return loading;
  loading = sync.links().then((rows) => {
    map = {};
    (rows || []).forEach((r) => { const t = String(r.topic || ""); if (t.startsWith("video:") && safe(r.url)) map[t.slice(6)] = r; });
    refreshAll();
    return map;
  }).catch(() => map || {}).finally(() => { loading = null; });
  return loading;
}

function inner(key, q, fr) {
  const c = map?.[key];
  const coach = sync.role() === "coach";
  return `${c ? `<a class="btn small tape-btn" href="${esc(c.url)}" target="_blank" rel="noopener">${icon("play")} Vidéo du coach</a>` : ""}
    <a class="btn small${c ? " ghost" : " tape-btn"}" href="${ytUrl(q)}" target="_blank" rel="noopener">${icon("play")} ${c ? "Autres vidéos" : "Voir en vidéo"}</a>
    ${fr ? `<a class="btn small ghost" href="${ytUrl(frQuery(fr))}" target="_blank" rel="noopener">En français</a>` : ""}
    ${coach ? `<button type="button" class="btn small ghost" data-setvid>${c ? "Changer ma vidéo" : "+ Ma vidéo"}</button>` : ""}`;
}

// rangée de boutons vidéo ; key : identifiant stable (ex. « ex:Sprawl », « tech:jab »), q : requête YouTube, fr : nom français
export function vidRow(key, q, fr = "") {
  if (!q) return "";
  if (!map) loadVideos();
  return `<div class="vid-row" data-vkey="${esc(key)}" data-vq="${esc(q)}" data-vfr="${esc(fr)}">${inner(key, q, fr)}</div>`;
}

function refreshAll() {
  document.querySelectorAll(".vid-row[data-vkey]").forEach((r) => { if (!r.querySelector("[data-vurl]")) r.innerHTML = inner(r.dataset.vkey, r.dataset.vq, r.dataset.vfr); });
}

// le coach colle le lien de sa vidéo de référence, directement sous l'exercice
document.addEventListener("click", async (e) => {
  const set = e.target.closest(".vid-row [data-setvid]");
  if (set) {
    e.preventDefault(); e.stopPropagation();
    const row = set.closest(".vid-row"); const c = map?.[row.dataset.vkey];
    row.innerHTML = `<div class="stack" style="gap:6px;width:100%">
      <input class="input" data-vurl type="url" inputmode="url" placeholder="Lien YouTube, Instagram…" value="${esc(c?.url || "")}">
      <input class="input" data-vtitle maxlength="200" placeholder="Titre (facultatif)" value="${esc(c?.title || "")}">
      <div class="row" style="gap:6px;flex-wrap:wrap"><button type="button" class="btn small tape-btn" data-vsave>Enregistrer</button>${c ? `<button type="button" class="btn small ghost" data-vdel style="color:var(--bad)">Retirer</button>` : ""}<button type="button" class="btn small ghost" data-vcancel>Annuler</button></div>
      <p class="tiny muted" style="margin:0">Tous les fighters verront cette vidéo ici, en premier.</p></div>`;
    row.querySelector("[data-vurl]").focus();
    return;
  }
  const row = e.target.closest(".vid-row"); if (!row) return;
  const key = row.dataset.vkey;
  if (e.target.closest("[data-vcancel]")) { row.innerHTML = inner(key, row.dataset.vq, row.dataset.vfr); return; }
  const del = e.target.closest("[data-vdel]"), save = e.target.closest("[data-vsave]");
  if (!del && !save) return;
  const c = map?.[key];
  const url = row.querySelector("[data-vurl]").value.trim();
  if (save && !safe(url)) { toast("Colle un lien qui commence par https://"); return; }
  const title = row.querySelector("[data-vtitle]").value.trim() || key.replace(/^[a-z]+:/, "");
  (save || del).disabled = true;
  try {
    const id = await sync.saveLink({ id: c?.id || null, title, url: del ? c.url : url, topic: `video:${key}`, note: "", archived: Boolean(del) });
    map ||= {};
    if (del) delete map[key]; else map[key] = { id: c?.id || id, title, url, topic: `video:${key}` };
    row.innerHTML = inner(key, row.dataset.vq, row.dataset.vfr);
    refreshAll();
    toast(del ? "Vidéo retirée" : "Vidéo enregistrée pour tout le club");
  } catch { (save || del).disabled = false; toast("Impossible : vérifie ta connexion"); }
});

// ---- requêtes vidéo des techniques, armes et combinaisons
export const TECH_YT = {
  jab: "how to throw a jab mma technique", cross: "cross punch technique boxing", lhook: "lead hook technique boxing",
  overhand: "overhand punch mma technique", uppercut: "uppercut technique boxing", body: "body shots technique boxing liver shot",
  feint: "feints mma striking tutorial", lowkick: "muay thai low kick technique thigh", calf: "calf kick tutorial mma",
  midkick: "muay thai body kick technique", highkick: "head kick technique muay thai", teep: "teep push kick muay thai tutorial",
  knee: "muay thai knee strike technique", clinch: "mma clinch entry technique", double: "double leg takedown mma technique",
  single: "single leg takedown technique", bodylock: "body lock takedown against the cage mma", trip: "outside trip takedown clinch mma",
  sprawl: "how to sprawl takedown defense mma", frontheadlock: "front headlock wrestling series", highcrotch: "high crotch takedown wrestling technique",
  armdrag: "arm drag wrestling technique", snapdown: "snap down front headlock wrestling", twoonone: "2 on 1 russian tie wrestling",
  throwby: "throw by wrestling technique", butterfly: "butterfly guard sweep nogi basics", halfguard: "half guard basics nogi",
  kguard: "k guard entry leg lock nogi", xguard: "x guard sweep nogi", onelegx: "single leg x guard basics",
  fiftyfifty: "50/50 guard basics nogi", falsereap: "false reap entry heel hook", anklelock: "straight ankle lock technique nogi",
  heelhook: "inside heel hook technique safety", guardpass: "nogi guard passing fundamentals", sidecontrol: "side control pin mma",
  mount: "mount control mma technique", back: "back take mma technique", gnp: "ground and pound technique mma",
  rnc: "rear naked choke technique details", armtriangle: "arm triangle choke technique", guillotine: "guillotine choke technique mma",
  darce: "darce choke technique", kimura: "kimura technique nogi", armbar: "armbar from mount technique",
  closedguard: "closed guard mma basics", shrimp: "shrimp hip escape bjj", bridge: "bridge and roll mount escape",
  standup: "technical stand up against the cage mma", triangle: "triangle choke technique", catch: "caught kick defense mma",
  check: "how to check a leg kick", frame: "frames escape side control bjj", whizzer: "whizzer takedown defense wrestling",
  elbow: "short elbows mma technique", turnin: "turn in wrestling against the cage defense", stack: "stack triangle defense mma",
  ko: "mma knockout technique breakdown",
};

export const WEAPON_YT = {
  backfist: "lead backfist mma technique", sbf: "spinning back fist tutorial", sbe: "spinning back elbow technique mma",
  sbk: "spinning back kick tutorial", wheel: "wheel kick spinning hook kick tutorial", superman: "superman punch tutorial",
  flyknee: "flying knee technique mma", kneeint: "intercepting knee counter takedown mma", kneeclinch: "muay thai plum clinch knees",
  elbow: "mma elbow strikes technique", checkhook: "check hook boxing tutorial", uppercut: "short uppercut technique boxing",
  liver: "liver shot left hook to the body", midkick: "muay thai body kick technique", frontkick: "front kick to the face mma",
  switch: "switch kick muay thai tutorial", qmark: "question mark kick tutorial", highkick: "head kick technique",
  lhookend: "boxing combination finish with lead hook", double: "double leg takedown mma", guillotine: "guillotine front headlock mma",
};

// combinaisons : par nom
export const COMBO_YT = {
  "Double jab, direct": "double jab cross combination boxing",
  "Jab, direct, crochet, direct": "1 2 3 2 boxing combination",
  "Jab, direct, low kick": "jab cross low kick combination",
  "Low kicks répétés": "calf kick setups mma",
  "Jab, direct, feinte de low": "jab cross feint low kick setup",
  "Middle kicks au corps": "muay thai body kick combinations",
  "Tête, tête, corps": "head head body combination boxing",
  "Corps, puis tête": "body head combination hook boxing",
  "Feinte d'amenée au sol": "fake takedown feint strike mma",
  "Jab, direct, esquive": "jab cross slip counter drill",
  "Direct, crochet, sortie d'angle": "cross hook pivot angle boxing",
  "Jab, jab, pression vers la cage": "cutting off the cage pressure mma",
  "Teeps au corps": "teep to the body muay thai",
  "Low kick arrière": "rear leg low kick technique",
  "Frappe pour faire réagir le lutteur": "striking against wrestlers mma",
  "Clinch, genoux au corps": "clinch knees to the body muay thai",
};

// exercices de renforcement (rubrique Santé)
export const PREHAB_YT = {
  "Rentrer le menton (chin tuck), allongé": "supine chin tuck exercise",
  "Nuque : isométrie 4 directions": "neck isometric exercises 4 way",
  "Nuque à l'élastique, amplitude lente": "resistance band neck strengthening",
  "Rotation externe à l'élastique, coude à 90°": "band external rotation 90 degrees",
  "Y-T-W allongé sur le ventre": "prone Y T W exercise",
  "Pompes scapulaires": "scapular push ups",
  "Port de kettlebell à l'envers (bottoms-up)": "bottoms up kettlebell carry",
  "Extension de poignet excentrique (haltère léger)": "eccentric wrist extension tennis elbow",
  "Pronation et supination au marteau": "hammer pronation supination exercise",
  "Isométrie de flexion du coude": "isometric elbow flexion exercise",
  "Rouleau de poignet (wrist roller)": "wrist roller exercise",
  "Extension des doigts à l'élastique": "finger extension rubber band exercise",
  "Appui sur les poings, progressif": "knuckle push up plank progression",
  "Curl-up de McGill": "mcgill curl up",
  "Gainage latéral": "side plank proper form",
  "Bird dog (quadrupédie bras-jambe opposés)": "mcgill bird dog",
  "Respiration abdominale lente": "diaphragmatic breathing exercise",
  "Dead bug": "dead bug exercise",
  "Gainage sur les genoux": "kneeling plank",
  "Transitions 90/90": "90 90 hip switch",
  "Pont fessier sur une jambe": "single leg glute bridge",
  "Hip airplane (sur une jambe, tenu au mur)": "hip airplane exercise",
  "Copenhague niveau 1 (genou sur le banc)": "copenhagen plank short lever",
  "Copenhague niveau 2 (cheville sur le banc)": "copenhagen adduction exercise",
  "Serrer un ballon entre les genoux (isométrie)": "adductor squeeze ball isometric",
  "Nordic ischio-jambiers": "nordic hamstring curl",
  "Pont ischio isométrique (talons sur un banc)": "isometric hamstring bridge bench",
  "Soulevé de terre sur une jambe": "single leg romanian deadlift",
  "Squat espagnol isométrique": "spanish squat isometric",
  "Step-down lent sur une marche": "eccentric step down knee",
  "Extension de jambe isométrique (élastique)": "isometric knee extension band",
  "Montées sur pointes lentes, jambe tendue puis fléchie": "single leg calf raise straight and bent knee",
  "Équilibre sur une jambe, yeux fermés": "single leg balance eyes closed ankle",
  "Relevés d'orteils (tibial antérieur), dos au mur": "tibialis raises wall",
};

// ---- vidéos de référence du cursus MMA (vérifiées), lues dans l'appli
const LANG = { fr: "En français", en: "Anglais, sous-titres français" };
export const refSlot = (ids) => ids?.length ? `<div data-refvids="${esc(ids.join(","))}"></div>` : "";

async function fillSlots() {
  const slots = [...document.querySelectorAll("[data-refvids]:not([data-filled])")];
  if (!slots.length) return;
  slots.forEach((s) => s.setAttribute("data-filled", ""));
  let mod; try { mod = await import("./views/parcours-mma.js"); } catch { return; }
  const lv = { fond: 0, dev: 1, comp: 2 };
  slots.forEach((s) => {
    const ids = s.dataset.refvids.split(",");
    const list = mod.MMA_VIDEOS.filter((v) => v.techs?.some((t) => ids.includes(t)))
      .sort((a, b) => (ids.includes(a.techs[0]) ? 0 : 1) - (ids.includes(b.techs[0]) ? 0 : 1) || lv[a.lvl] - lv[b.lvl]).slice(0, 4);
    if (!list.length) return;
    s.innerHTML = `<h4 class="sys-h">Vidéos de référence</h4>${list.map((v) => `<div class="refvid">
      <button type="button" class="refvid-thumb" data-ytplay="${esc(v.id)}" data-lang="${v.lang}" aria-label="Lire ${esc(v.t)}"><img src="https://i.ytimg.com/vi/${esc(v.id)}/mqdefault.jpg" alt="" loading="lazy">${icon("play")}</button>
      <div style="min-width:0"><div class="small" style="font-weight:700">${esc(v.t)}</div><div class="tiny muted">${esc(v.a)} · ${LANG[v.lang] || ""}</div>${v.s ? `<div class="tiny" style="margin-top:2px">${esc(v.s)}</div>` : ""}</div>
      ${v.pts?.length ? `<ul class="bul refvid-pts">${v.pts.map((p) => `<li class="tiny">${esc(p)}</li>`).join("")}</ul>` : ""}
    </div>`).join("")}`;
    s._params = mod.ytParams;
  });
}
new MutationObserver(() => fillSlots()).observe(document.documentElement, { childList: true, subtree: true });

document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-ytplay]"); if (!b) return;
  const slot = b.closest("[data-refvids]"); const params = slot?._params || (() => "autoplay=1&rel=0");
  b.closest(".refvid").classList.add("playing");
  b.closest(".refvid").innerHTML = `<div class="refvid-frame"><iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(b.dataset.ytplay)}?${params(b.dataset.lang)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe></div>` + b.closest(".refvid").innerHTML.replace(/<button[^]*?<\/button>/, "");
});
