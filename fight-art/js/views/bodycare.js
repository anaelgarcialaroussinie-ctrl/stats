// Séances › Mobilité, Étirements et Santé.
import { store } from "../store.js";
import { esc, icon } from "../ui.js";
import { guideInline } from "../drill-guides.js";
import { BODY_PARTS, ROUTINES, MOBILITY_NOTE, STRETCH_NOTE, part } from "../body-data.js";
import { PREHAB, PAIN_RULE } from "../sc-data.js";
import { healthZones, ZONE_PARTS, CONSULT } from "../health.js";
import { runTimer } from "./timer.js";
import { openPrehab } from "./sessions.js";

const chev = icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"');
const label = (e) => `${e.name} · ${e.dose}`;

function routineNames(r) {
  return r.parts.flatMap((id) => {
    const b = part(id); if (!b) return [];
    if (r.kind === "mobility") return b.mobility.slice(0, 2).map(label);
    if (r.kind === "stretches") return b.stretches.slice(0, 1).map(label);
    return [b.mobility[0], b.stretches[0]].filter(Boolean).map(label);
  });
}

function partsHtml(kind) {
  return BODY_PARTS.map((b) => {
    const list = b[kind];
    return `<details class="sys-card" style="margin-top:8px"><summary class="row between" style="gap:8px"><span><b>${esc(b.name)}</b><span class="tiny muted" style="display:block">${list.length} exercice${list.length > 1 ? "s" : ""}</span></span>${chev}</summary>
      <p class="tiny muted" style="margin:8px 0 4px">${esc(b.why)}</p>
      ${list.map((e) => `<div class="ex"><div class="ex-head"><span class="ex-name">${esc(e.name)}</span><span class="ex-presc">${esc(e.dose)}</span></div>${guideInline(e.name)}</div>`).join("")}
      <button class="btn small tape-btn" data-runpart="${kind}|${b.id}" style="margin-top:8px">${icon("play")} Lancer au minuteur</button>
    </details>`;
  }).join("");
}

export function mobilityHtml() {
  const rs = ROUTINES.filter((r) => r.kind !== "stretches");
  return `<p class="notice small" style="margin-top:12px">${esc(MOBILITY_NOTE)}</p>
    <h2 class="h-sec">Routines prêtes</h2>
    <div class="stack">${rs.map((r) => `<section class="panel row between" style="gap:10px"><div style="min-width:0"><div style="font-weight:700">${esc(r.name)}</div><div class="muted small">${esc(r.text)}</div></div><button class="btn small tape-btn" data-routine="${r.id}" style="flex:none">${icon("play")} Lancer</button></section>`).join("")}</div>
    <h2 class="h-sec">Par partie du corps</h2>
    ${partsHtml("mobility")}`;
}

export function stretchHtml() {
  const rs = ROUTINES.filter((r) => r.kind === "stretches" || r.kind === "mixed");
  return `<p class="notice small" style="margin-top:12px">${esc(STRETCH_NOTE)}</p>
    <h2 class="h-sec">Routines prêtes</h2>
    <div class="stack">${rs.map((r) => `<section class="panel row between" style="gap:10px"><div style="min-width:0"><div style="font-weight:700">${esc(r.name)}</div><div class="muted small">${esc(r.text)}</div></div><button class="btn small tape-btn" data-routine="${r.id}" style="flex:none">${icon("play")} Lancer</button></section>`).join("")}</div>
    <h2 class="h-sec">Par partie du corps</h2>
    ${partsHtml("stretches")}`;
}

export function healthHtml() {
  const st = store.get(); const p = st.profile || {};
  const H = healthZones(p, st);
  const top = H.zones.slice(0, 3);
  return `<p class="small" style="margin-top:12px">Renforcer une zone avant qu'elle ne lâche : l'appli choisit tes priorités d'après tes zones fragiles (profil), les douleurs notées dans tes check-ins et ton style.</p>
    <h2 class="h-sec">Tes priorités</h2>
    <div class="stack">${top.map((z, i) => `<section class="panel${z.alert ? " health-alert" : ""}">
      <div class="row between" style="gap:8px"><b>${i + 1}. ${esc(z.zone)}</b>${z.alert ? `<span class="badge tiny" style="color:var(--bad)">à surveiller</span>` : ""}</div>
      <ul class="bul" style="margin:6px 0">${z.why.map((w) => `<li class="small">${esc(w)}</li>`).join("")}</ul>
      <p class="tiny muted" style="margin:0 0 8px">${esc(PREHAB[z.zone].why)}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap"><button class="btn small tape-btn" data-prehab="${esc(z.zone)}">Renforcer (10-15 min)</button><button class="btn small" data-prep="${esc(z.zone)}">${icon("play")} Préparer avant la séance</button></div>
      ${z.alert ? `<p class="notice is-alert small" style="margin-top:10px">Douleur répétée ou forte sur cette zone : renforce en douceur et fais-la voir par un kiné ou un médecin.</p>` : ""}
    </section>`).join("")}</div>
    <p class="hint">${H.done ? `${H.done} séance${H.done > 1 ? "s" : ""} de renforcement cette semaine. ` : ""}Objectif : 2 à 3 séances de 10 à 15 minutes par semaine, en fin d'entraînement ou les jours sans prépa physique.</p>

    <h2 class="h-sec">Toutes les zones</h2>
    <section class="panel"><div class="chips">${Object.keys(PREHAB).map((z) => `<button class="chip" data-prehab="${esc(z)}" aria-pressed="${top.some((t) => t.zone === z)}">${esc(z)}</button>`).join("")}</div>
      <p class="hint">Touche une zone : son programme de renforcement, avec les explications et les vidéos. Déclare tes zones fragiles dans ton profil pour que la prépa physique les protège aussi.</p></section>

    <h2 class="h-sec">La douleur</h2>
    <section class="panel"><p class="small" style="margin:0">${esc(PAIN_RULE)}</p>
      <h3 class="sys-h">Consulte un médecin ou un kiné si</h3>
      <ul class="bul">${CONSULT.map((c) => `<li class="small">${esc(c)}</li>`).join("")}</ul>
      <p class="tiny muted" style="margin:6px 0 0">L'appli conseille et adapte ; elle ne remplace pas un avis médical.</p></section>`;
}

export function bindBodycare(el, ctx) {
  el.querySelectorAll("[data-routine]").forEach((b) => b.addEventListener("click", () => {
    const r = ROUTINES.find((x) => x.id === b.dataset.routine);
    const names = routineNames(r);
    runTimer({ work: r.work, rest: r.rest, rounds: names.length, names, title: r.name });
  }));
  el.querySelectorAll("[data-runpart]").forEach((b) => b.addEventListener("click", () => {
    const [kind, id] = b.dataset.runpart.split("|"); const P = part(id);
    const names = P[kind].map(label);
    runTimer({ work: kind === "stretches" ? 45 : 40, rest: 15, rounds: names.length, names, title: P.name });
  }));
  el.querySelectorAll("[data-prehab]").forEach((b) => b.addEventListener("click", () => openPrehab(b.dataset.prehab, ctx.refresh)));
  el.querySelectorAll("[data-prep]").forEach((b) => b.addEventListener("click", () => {
    const z = b.dataset.prep;
    const names = (ZONE_PARTS[z] || []).flatMap((id) => part(id)?.mobility.slice(0, 2).map(label) || []);
    runTimer({ work: 40, rest: 10, rounds: names.length, names, title: `Préparer : ${z.toLowerCase()}` });
  }));
}
