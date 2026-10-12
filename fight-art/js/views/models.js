// Mes modèles UFC : choisir ses combattants favoris et s'inspirer de leurs chiffres.
import { store } from "../store.js";
import { myNote } from "../study-notes.js";
import { esc, icon, openSheet, toast } from "../ui.js";
import { openDiscussion } from "./discussion.js";
import { openExplorer } from "./systems.js";

let DB = null;

// photos des combattants : image libre de droits de leur page Wikipédia (chargée à la demande, gardée en cache)
const FACE_KEY = "fap:faces";
let faces = {}; try { faces = JSON.parse(localStorage.getItem(FACE_KEY) || "{}"); } catch {}
const pending = {};
export function face(name) {
  if (name in faces) return Promise.resolve(faces[name]);
  if (pending[name]) return pending[name];
  const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search&gsrlimit=3&gsrsearch=${encodeURIComponent(`"${name}" mixed martial artist`)}&prop=pageimages|description&piprop=thumbnail&pithumbsize=240`;
  pending[name] = fetch(url).then((r) => r.json()).then((j) => {
    const pages = Object.values(j?.query?.pages || {}).sort((a, b) => a.index - b.index);
    const hit = pages.find((p) => /martial|fighter|UFC|wrestler|boxer|kickboxer/i.test(p.description || "") && p.thumbnail?.source);
    return hit ? hit.thumbnail.source : "";
  }).catch(() => null).then((src) => {
    if (src !== null) { faces[name] = src; try { localStorage.setItem(FACE_KEY, JSON.stringify(faces)); } catch {} }
    delete pending[name]; return src || "";
  });
  return pending[name];
}
const initialsOf = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
export const faceSlot = (name, cls = "face") => `<span class="${cls}" data-face="${esc(name)}">${faces[name] ? `<img src="${esc(faces[name])}" alt="" loading="lazy">` : `<b>${esc(initialsOf(name))}</b>`}</span>`;
// remplit les emplacements photo présents dans un conteneur (4 recherches à la fois)
export async function fillFaces(root) {
  const slots = [...root.querySelectorAll("[data-face]")].filter((el) => !el.querySelector("img"));
  let i = 0;
  const worker = async () => { while (i < slots.length) { const el = slots[i++]; const src = await face(el.dataset.face); if (src && el.isConnected) el.innerHTML = `<img src="${esc(src)}" alt="" loading="lazy">`; } };
  await Promise.all([worker(), worker(), worker(), worker()]);
}
export async function loadFighters() {
  if (DB) return DB;
  const r = await fetch("data/fighters.json");
  if (!r.ok) throw new Error("load");
  DB = await r.json();
  return DB;
}
export const fighterData = async (name) => (await loadFighters()).f.find((x) => x.n === name);
export const favorites = () => store.get().favFighters || [];
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const pct = (x) => (x == null ? "–" : `${Math.round(x * 100)} %`);
export const n1 = (x) => (x == null ? "–" : x.toLocaleString("fr-FR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }));

// finitions → fiche correspondante dans l'appli
export const FIN_LINK = {
  "High kick": ["w", "highkick"], "Genou sauté": ["w", "flyknee"], "Backfist retourné": ["w", "sbf"], "Coude retourné": ["w", "sbe"],
  "Coup de pied retourné": ["w", "sbk"], "Wheel kick": ["w", "wheel"], "Front kick au visage": ["w", "frontkick"],
  "Genou à la tête au clinch": ["w", "kneeclinch"], "Coups de poing au corps": ["w", "liver"], "Coup de pied au corps": ["w", "midkick"],
  "Guillotine": ["w", "guillotine"], "Étranglement arrière": ["t", "rnc"], "Arm-triangle": ["t", "armtriangle"], "D'arce": ["t", "darce"],
  "Kimura": ["t", "kimura"], "Clé de bras": ["t", "armbar"], "Triangle": ["t", "triangle"], "Clé de talon": ["t", "heelhook"], "Clé de cheville": ["t", "anklelock"],
  "Low kick": ["t", "lowkick"],
};

// ce qu'on peut piquer à ce combattant, d'après ses chiffres comparés à sa catégorie
export function inspirations(f, a) {
  const out = [];
  const more = (k, x = 1.35) => f[k] != null && a[k] && f[k] >= a[k] * x;
  if (more("slpm", 1.3)) out.push({ text: `Volume : ${n1(f.slpm)} frappes placées par minute, contre ${n1(a.slpm)} en moyenne dans sa catégorie. Il enchaîne, il ne frappe pas à l'unité.`, act: ["d", "questions"], cta: "Les combinaisons" });
  if (more("leg") && f.leg >= 0.18) out.push({ text: `Il attaque les jambes : ${pct(f.leg)} de ses frappes, contre ${pct(a.leg)} en moyenne.`, act: ["t", "calf"], cta: "Low kick au mollet" });
  if (more("body", 1.3)) out.push({ text: `Il travaille le corps : ${pct(f.body)} de ses frappes, contre ${pct(a.body)} en moyenne.`, act: ["w", "liver"], cta: "Crochet au foie" });
  if (more("clinch", 1.4)) out.push({ text: `Il vit au clinch : ${pct(f.clinch)} de ses frappes y sont placées, contre ${pct(a.clinch)} en moyenne.`, act: ["w", "kneeclinch"], cta: "Genou au clinch" });
  if (more("td15", 1.5) && f.td15 >= 2) out.push({ text: `Il lutte : ${n1(f.td15)} tentatives d'amenée au sol par 15 minutes (moyenne ${n1(a.td15)}), ${pct(f.tdacc)} de réussite.`, act: ["t", "double"], cta: "Double-leg" });
  if (more("ctrl", 1.5) && f.ctrl >= 0.2) out.push({ text: `Il contrôle : ${pct(f.ctrl)} du temps de combat en contrôle, contre ${pct(a.ctrl)} en moyenne.`, act: ["t", "gnp"], cta: "Ground and pound" });
  if (more("sub15", 1.6) && f.sub15 >= 0.8) out.push({ text: `Il menace en soumission : ${n1(f.sub15)} tentatives par 15 minutes (moyenne ${n1(a.sub15)}).`, act: ["t", "frontheadlock"], cta: "Front headlock" });
  if (more("kd15", 1.6) && f.kd15 >= 0.4) out.push({ text: `Il fait tomber : ${n1(f.kd15)} knockdowns par 15 minutes, contre ${n1(a.kd15)} en moyenne. Puissance et timing.`, act: ["w", "checkhook"], cta: "Contrer : check hook" });
  if (f.sdef != null && a.sdef && f.sdef >= a.sdef + 0.05) out.push({ text: `Il se fait peu toucher : il évite ${pct(f.sdef)} des frappes significatives, contre ${pct(a.sdef)} en moyenne. Défense de tête, distance et sorties d'angle.`, act: ["d", "reactions"], cta: "Lire les réactions" });
  if (f.tdd != null && a.tdd && f.tdd >= Math.max(0.75, a.tdd + 0.1)) out.push({ text: `Il reste debout : il stoppe ${pct(f.tdd)} des tentatives d'amenée au sol, contre ${pct(a.tdd)} en moyenne.`, act: ["t", "sprawl"], cta: "Sprawl" });
  if (f.st === "Change de garde") out.push({ text: "Il change de garde : il frappe sous deux angles et brouille la lecture de l'adversaire." });
  if (f.h && f.r && f.r - f.h >= 6) out.push({ text: `Grande allonge : ${f.r} cm pour ${f.h} cm. Il combat à distance, avec le jab et les coups de pied longs.`, act: ["t", "jab"], cta: "Jab" });
  return out;
}

export function bars(rows) {
  return rows.map(([l, v, avg]) => `<div class="mbar"><span class="small">${esc(l)}</span><div class="mbar-track"><i style="width:${Math.round((v || 0) * 100)}%"></i>${avg != null ? `<b style="left:${Math.round(avg * 100)}%" title="Moyenne de sa catégorie"></b>` : ""}</div><span class="small num">${pct(v)}</span></div>`).join("");
}

export async function openModel(name, onTrap, after) {
  const body = openSheet(name, `<p class="muted small">Chargement…</p>`);
  let db; try { db = await loadFighters(); } catch { body.innerHTML = `<p class="notice is-warn small">Impossible de charger les données UFC. Vérifie ta connexion.</p>`; return; }
  const f = db.f.find((x) => x.n === name); if (!f) { body.innerHTML = `<p class="muted">Combattant introuvable.</p>`; return; }
  const a = db.avg[f.wc] || {};
  const me = store.get().profile || {};
  const fav = favorites().includes(f.n);
  const [w, l, d] = f.rec;
  const total = Math.max(1, f.ko + f.sub + f.dec);
  const ideas = inspirations(f, a);
  const stat = (label, v, avg, fmt, better = "up") => {
    const diff = v != null && avg ? v / avg - 1 : 0;
    const mark = Math.abs(diff) < 0.1 ? "" : (diff > 0) === (better === "up") ? `<span class="good">▲</span>` : `<span class="bad">▼</span>`;
    return `<tr><td>${esc(label)}</td><td class="num"><b>${fmt(v)}</b> ${mark}</td><td class="num muted">${fmt(avg)}</td></tr>`;
  };
  body.innerHTML = `
    <div class="model-head">${faceSlot(f.n, "face face-xl")}</div>
    <div class="row between" style="align-items:flex-start;gap:10px">
      <div><span class="badge tiny">${esc(f.wc)}</span> <span class="badge tiny">${esc(f.p)}</span>
        <div class="display num" style="font-size:34px;margin-top:6px">${w}-${l}${d ? "-" + d : ""}</div>
        <div class="tiny muted">à l'UFC · ${f.nf} combats · dernier le ${esc(new Date(f.last).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }))}</div></div>
      <button class="btn ${fav ? "ghost" : "tape-btn"} small" data-fav>${fav ? "Retirer de mes modèles" : "Ajouter à mes modèles"}</button>
    </div>
    <p class="small" style="margin-top:10px">${esc(f.st || "Garde inconnue")}${f.h ? ` · ${f.h} cm` : ""}${f.r ? ` · allonge ${f.r} cm` : ""}${me.height ? `<br><span class="muted">Toi : ${me.height} cm${me.reach ? ` · allonge ${me.reach} cm` : ""}</span>` : ""}</p>

    <h3 class="sys-h">Comment il gagne</h3>
    <div class="winbar"><i class="ko" style="flex:${f.ko}"></i><i class="sub" style="flex:${f.sub}"></i><i class="dec" style="flex:${f.dec}"></i></div>
    <div class="row small" style="gap:14px;margin-top:6px;flex-wrap:wrap"><span><span class="dot ko"></span> KO ${f.ko}</span><span><span class="dot sub"></span> Soumission ${f.sub}</span><span><span class="dot dec"></span> Décision ${f.dec}</span></div>
    ${f.fin.length ? `<h3 class="sys-h">Ses finitions</h3><div class="stack" style="gap:6px">${f.fin.map(([t, c]) => { const lk = FIN_LINK[t]; return `<div class="row between small"><span>${esc(t)} <span class="muted">× ${c}</span></span>${lk ? `<button class="link" data-go="${lk[0]}|${lk[1]}">Voir la fiche</button>` : ""}</div>`; }).join("")}</div>` : ""}

    ${ideas.length ? `<h3 class="sys-h">À piquer pour ton style</h3><div class="stack" style="gap:8px">${ideas.map((i) => `<section class="panel" style="padding:12px"><p class="small" style="margin:0">${esc(i.text)}</p>${i.act ? `<button class="link" data-go="${i.act[0]}|${i.act[1]}" style="margin-top:6px">${esc(i.cta)} →</button>` : ""}</section>`).join("")}</div>` : ""}

    <h3 class="sys-h">Où il frappe</h3>
    ${bars([["Tête", f.head, a.head], ["Corps", f.body, a.body], ["Jambes", f.leg, a.leg]])}
    <h3 class="sys-h">D'où il frappe</h3>
    ${bars([["Distance", f.dist, a.dist], ["Clinch", f.clinch, a.clinch], ["Sol", f.ground, a.ground]])}
    <p class="tiny muted">Le trait blanc marque la moyenne de sa catégorie.</p>

    <h3 class="sys-h">Ses chiffres</h3>
    <table class="stats"><thead><tr><th></th><th>Lui</th><th>Moyenne ${esc(f.wc)}</th></tr></thead><tbody>
      ${stat("Frappes placées par minute", f.slpm, a.slpm, n1)}
      ${stat("Précision des frappes", f.acc, a.acc, pct)}
      ${stat("Frappes encaissées par minute", f.sapm, a.sapm, n1, "down")}
      ${stat("Frappes évitées", f.sdef, a.sdef, pct)}
      ${stat("Knockdowns par 15 min", f.kd15, a.kd15, n1)}
      ${stat("Amenées tentées par 15 min", f.td15, a.td15, n1)}
      ${stat("Réussite des amenées", f.tdacc, a.tdacc, pct)}
      ${stat("Défense d'amenée", f.tdd, a.tdd, pct)}
      ${stat("Temps en contrôle", f.ctrl, a.ctrl, pct)}
      ${stat("Soumissions tentées par 15 min", f.sub15, a.sub15, n1)}
    </tbody></table>

    <p class="notice small" style="margin-top:14px">Les statistiques officielles ne disent pas quels enchaînements il utilise. Pour ça : regarde ses combats, note ses combinaisons dans « Mes combos fétiches ».</p>
    <a class="btn ghost block" href="https://www.youtube.com/results?search_query=${encodeURIComponent(f.n + " UFC highlights breakdown")}" target="_blank" rel="noopener">${icon("play")} Chercher ses combats sur YouTube</a>
    <a class="btn ghost block" style="margin-top:8px" href="https://www.ufc.com/athlete/${f.n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}" target="_blank" rel="noopener">Sa page officielle UFC (photos, bio)</a>
    <div style="margin-top:14px">${myNote(`ufc:${f.n}`, `Modèles UFC · ${f.n}`, { placeholder: "Ce que je lui pique, ce que je retiens de ses combats…" })}</div>
    <p class="hint">Source : ${esc(db.source)}. Le profil de style vient de l'analyse Fight Art Performance de 1 073 combattants UFC. Photo : Wikipédia, quand elle existe.</p>`;
  fillFaces(body);

  body.addEventListener("click", (e) => {
    if (e.target.closest("[data-fav]")) {
      store.update((s) => { const l2 = s.favFighters || []; s.favFighters = l2.includes(f.n) ? l2.filter((x) => x !== f.n) : [...l2, f.n]; });
      toast(fav ? "Retiré de tes modèles" : "Ajouté à tes modèles"); after?.(); openModel(name, onTrap, after); return;
    }
    const g = e.target.closest("[data-go]");
    if (g) {
      const [type, id] = g.dataset.go.split("|");
      if (type === "w") openDiscussion({ w: id }, onTrap);
      if (type === "d") openDiscussion({ tab: id }, onTrap);
      if (type === "t") openExplorer(id, after);
    }
  });
}

export function openModelSearch(onTrap, after) {
  const body = openSheet("Choisir mes modèles", `
    <input class="input" type="search" data-q placeholder="Nom d'un combattant UFC" autocomplete="off">
    <div class="chips" style="margin-top:10px" data-wcs></div>
    <div data-res style="margin-top:10px"><p class="muted small">Chargement…</p></div>`);
  let wc = "";
  loadFighters().then((db) => {
    const wcs = Object.keys(db.avg).sort();
    body.querySelector("[data-wcs]").innerHTML = [`<button class="chip" data-wc="" aria-pressed="true">Toutes</button>`, ...wcs.map((x) => `<button class="chip" data-wc="${esc(x)}" aria-pressed="false">${esc(x)}</button>`)].join("");
    const paint = () => {
      const q = norm(body.querySelector("[data-q]").value.trim());
      let list = db.f.filter((f) => (!wc || f.wc === wc) && (!q || norm(f.n).includes(q)));
      list = list.sort((x, y) => (q ? 0 : y.last.localeCompare(x.last)) || y.rec[0] - x.rec[0]).slice(0, 30);
      const favs = favorites();
      body.querySelector("[data-res]").innerHTML = list.length ? `<ul class="list">${list.map((f) => `<li role="button" tabindex="0" data-open="${esc(f.n)}">${faceSlot(f.n)}<div style="min-width:0;flex:1"><div style="font-weight:700">${esc(f.n)}${favs.includes(f.n) ? ` <span class="insigne">Modèle</span>` : ""}</div><div class="meta">${esc(f.wc)} · ${f.rec[0]}-${f.rec[1]}${f.rec[2] ? "-" + f.rec[2] : ""} · ${esc(f.p)}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>` : `<p class="muted small">Aucun combattant trouvé (au moins 3 combats UFC).</p>`;
      fillFaces(body.querySelector("[data-res]"));
    };
    body.querySelector("[data-q]").addEventListener("input", paint);
    body.addEventListener("click", (e) => {
      const c = e.target.closest("[data-wc]"); if (c) { wc = c.dataset.wc; body.querySelectorAll("[data-wc]").forEach((b) => b.setAttribute("aria-pressed", b === c)); paint(); return; }
      const o = e.target.closest("[data-open]"); if (o) openModel(o.dataset.open, onTrap, after);
    });
    paint();
  }).catch(() => { body.querySelector("[data-res]").innerHTML = `<p class="notice is-warn small">Impossible de charger les données UFC. Vérifie ta connexion.</p>`; });
}
