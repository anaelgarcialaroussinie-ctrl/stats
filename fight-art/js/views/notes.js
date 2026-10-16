// Mes fiches techniques : synthèse d'une technique, ressenti, problèmes et solutions. Gardées et visibles par le coach.
import { store, uid, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { frDate } from "../engine.js";
import { sync } from "../sync.js";
import { ROLES, roleLabel, noteRole, matchRole, systemsFrom, systemsUsing } from "../game.js";
import { editSystem, systemTree, drillSystem } from "./systems.js";

export const NOTE_CATS = ["Debout", "Lutte et clinch", "Cage", "Sol dessus", "Sol dessous", "Soumission", "Luta Livre", "Autre"];
export const NOTE_STATUS = [
  { id: "todo", label: "À travailler", cls: "st-todo" },
  { id: "wip", label: "En progrès", cls: "st-wip" },
  { id: "ok", label: "Maîtrisée", cls: "st-ok" },
];
const statusOf = (id) => NOTE_STATUS.find((s) => s.id === id) || NOTE_STATUS[0];
const trim = (t = "") => t.replace(/[\s.!?;]+$/, "");
const lines = (t = "") => t.split("\n").map((x) => x.trim()).filter(Boolean);

export function noteCard(n) {
  const st = statusOf(n.status);
  const sys = systemsFrom(`n:${n.id}`).length + systemsUsing(`n:${n.id}`).length;
  return `<div style="min-width:0;flex:1"><div class="row" style="gap:8px;flex-wrap:wrap"><b>${esc(n.title || "Sans titre")}</b><span class="status ${st.cls}">${esc(st.label)}</span></div>
    <div class="meta"><span class="role-pill r-${noteRole(n)}">${esc(roleLabel(noteRole(n)))}</span> ${esc(n.cat || "")}${sys ? ` · dans ${sys} système${sys > 1 ? "s" : ""}` : ""}${n.date ? " · " + esc(frDate(n.date, { day: "numeric", month: "short" })) : ""}${n.source ? " · " + esc(n.source) : ""}</div></div>`;
}

// lecture seule (aussi pour le coach)
export function noteView(n) {
  const block = (title, txt, cls = "") => (lines(txt).length ? `<h4 class="sys-h">${title}</h4><ul class="bul ${cls}">${lines(txt).map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : "");
  return `${block("Points importants", n.keys)}${n.feel ? `<h4 class="sys-h">Mon ressenti</h4><p class="small">${esc(n.feel)}</p>` : ""}${block("Mes problèmes", n.problems)}${block("Comment les régler", n.fixes)}
    ${n.video ? `<a class="btn ghost small" href="${esc(n.video)}" target="_blank" rel="noopener" style="margin-top:8px">${icon("play")} Vidéo de référence</a>` : ""}`;
}

export function openNote(existing, after, preset = {}) {
  const n = existing ? { ...existing } : { id: uid(), title: preset.title || "", cat: preset.cat || "Debout", source: preset.source || "", date: preset.date || todayKey(), keys: "", feel: "", problems: "", fixes: "", video: "", status: "todo", role: preset.role || "both", createdAt: todayKey() };
  if (!n.role) n.role = noteRole(n);
  const body = openSheet(existing ? "Ma fiche" : "Nouvelle fiche technique", `
    <form class="stack" data-note>
      <label class="field"><span>Technique</span><input class="input" name="title" required maxlength="120" value="${esc(n.title)}" placeholder="Ex. Double-leg contre la cage"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Catégorie</span><div class="chips">${NOTE_CATS.map((c) => `<button type="button" class="chip" data-cat="${esc(c)}" aria-pressed="${c === n.cat}">${esc(c)}</button>`).join("")}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Offensif ou défensif ?</span><div class="chips">${[...ROLES, { id: "both", label: "Les deux" }].map((r) => `<button type="button" class="chip" data-role="${r.id}" aria-pressed="${r.id === n.role}">${esc(r.label)}</button>`).join("")}</div></div>
      <div class="grid2">
        <label class="field"><span>Date</span><input class="input" type="date" name="date" value="${esc(n.date)}"></label>
        <label class="field"><span>Vue où ?</span><input class="input" name="source" maxlength="80" value="${esc(n.source)}" placeholder="Cours, vidéo, séminaire…"></label>
      </div>
      <label class="field"><span>Points importants <span class="tiny muted">(un par ligne)</span></span><textarea class="input" name="keys" rows="4" placeholder="Tête haute contre son torse&#10;Pied arrière qui suit&#10;Finir en poussant vers la cage">${esc(n.keys)}</textarea></label>
      <label class="field"><span>Mon ressenti</span><textarea class="input" name="feel" rows="3" placeholder="Ce que j'ai ressenti en le faisant, ce qui m'a paru facile ou difficile">${esc(n.feel)}</textarea></label>
      <label class="field"><span>Mes problèmes <span class="tiny muted">(un par ligne)</span></span><textarea class="input" name="problems" rows="3" placeholder="Je me fais guillotiner à l'entrée&#10;Je perds l'équilibre à la finition">${esc(n.problems)}</textarea></label>
      <label class="field"><span>Comment les régler <span class="tiny muted">(un par ligne)</span></span><textarea class="input" name="fixes" rows="3" placeholder="Entrer derrière un jab&#10;Garder la tête collée">${esc(n.fixes)}</textarea></label>
      <label class="field"><span>Vidéo de référence (facultatif)</span><input class="input" name="video" type="url" inputmode="url" value="${esc(n.video)}" placeholder="https://…"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Où j'en suis</span><div class="chips">${NOTE_STATUS.map((s) => `<button type="button" class="chip" data-status="${s.id}" aria-pressed="${s.id === n.status}">${esc(s.label)}</button>`).join("")}</div></div>
      <button class="btn tape-btn block">Enregistrer la fiche</button>
      <button type="button" class="btn ghost block" data-savesys>${icon("plus")} Enregistrer et décortiquer en système</button>
      ${sync.connected() && !window.FAP_PREVIEW ? `<button type="button" class="btn ghost block" data-ask>${icon("chat")} Demander de l'aide à l'assistant sur mes problèmes</button>` : ""}
      ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer la fiche</button>` : ""}
      <p class="hint">Ton coach voit tes fiches et peut t'aider à régler tes problèmes.</p>
    </form>`);
  const f = body.querySelector("[data-note]");
  const read = () => { ["title", "date", "source", "keys", "feel", "problems", "fixes", "video"].forEach((k) => { n[k] = f.elements[k].value.trim(); }); };
  const save = () => { read(); n.updatedAt = new Date().toISOString(); store.update((s) => { s.notes = [...(s.notes || []).filter((x) => x.id !== n.id), n]; }); };
  f.addEventListener("click", async (e) => {
    const c = e.target.closest("[data-cat]"); if (c) { n.cat = c.dataset.cat; f.querySelectorAll("[data-cat]").forEach((b) => b.setAttribute("aria-pressed", b === c)); return; }
    const ro = e.target.closest("[data-role]"); if (ro) { n.role = ro.dataset.role; f.querySelectorAll("[data-role]").forEach((b) => b.setAttribute("aria-pressed", b === ro)); return; }
    const st = e.target.closest("[data-status]"); if (st) { n.status = st.dataset.status; f.querySelectorAll("[data-status]").forEach((b) => b.setAttribute("aria-pressed", b === st)); return; }
    const d = e.target.closest("[data-del]");
    if (d) {
      if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; }
      store.update((s) => { s.notes = (s.notes || []).filter((x) => x.id !== n.id); }); closeSheet(); toast("Fiche supprimée"); after?.(); return;
    }
    if (e.target.closest("[data-savesys]")) {
      read(); if (!n.title) { toast("Donne un nom à la technique"); return; }
      save(); editSystem(null, after, { root: `n:${n.id}`, type: n.role === "def" ? "def" : "off" }); return;
    }
    const a = e.target.closest("[data-ask]");
    if (a) {
      read();
      if (!n.title || !lines(n.problems).length) { toast("Indique la technique et au moins un problème"); return; }
      save();
      const q = `Fiche technique : ${n.title} (${n.cat}).\nPoints importants : ${trim(lines(n.keys).join(" ; ")) || "non précisés"}.\nMon ressenti : ${trim(n.feel) || "non précisé"}.\nMes problèmes : ${trim(lines(n.problems).join(" ; "))}.\nCe que j'ai déjà essayé : ${trim(lines(n.fixes).join(" ; ")) || "rien encore"}.\nComment je peux régler ça ?`;
      a.disabled = true; a.textContent = "Envoi…";
      try { await sync.ask("technique", q, true); toast("Question envoyée à l'assistant"); closeSheet(); after?.(); }
      catch (x) { a.disabled = false; a.textContent = "Demander de l'aide à l'assistant sur mes problèmes"; toast(x.code === "too_many" ? "Limite de questions atteinte aujourd'hui" : "Envoi impossible : vérifie ta connexion"); }
    }
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault(); read();
    if (!n.title) { toast("Donne un nom à la technique"); return; }
    if (n.video && !/^https:\/\//.test(n.video)) { toast("Le lien vidéo doit commencer par https://"); return; }
    save(); closeSheet(); toast("Fiche enregistrée"); after?.();
  });
}

export function openNoteRead(n, after) {
  const body = openSheet(n.title || "Fiche", `<div class="row" style="gap:8px;flex-wrap:wrap;margin-bottom:6px"><span class="status ${statusOf(n.status).cls}">${esc(statusOf(n.status).label)}</span><span class="tiny muted">${esc(n.cat || "")}${n.date ? " · " + esc(frDate(n.date, { day: "numeric", month: "long" })) : ""}${n.source ? " · " + esc(n.source) : ""}</span></div>
    <p class="tiny" style="margin:0 0 6px"><span class="role-pill r-${noteRole(n)}">${esc(roleLabel(noteRole(n)))}</span></p>
    ${noteView(n)}
    <button class="btn ghost block" data-edit style="margin-top:16px">${icon("edit")} Modifier la fiche</button>
    ${noteSystemsHtml(n)}`);
  body.querySelector("[data-edit]").addEventListener("click", () => openNote(n, after));
  bindNoteSystems(body, n, after);
}

// liste complète avec recherche et filtre
export function openNotesList(after) {
  let filter = "all", q = "", role = "all";
  const body = openSheet("Mes fiches techniques", "");
  const draw = () => {
    const all = [...(store.get().notes || [])].sort((a, b) => (b.updatedAt || b.date || "").localeCompare(a.updatedAt || a.date || ""));
    const list = all.filter((n) => (filter === "all" || n.status === filter) && matchRole(noteRole(n), role) && (!q || `${n.title} ${n.keys} ${n.problems} ${n.cat}`.toLowerCase().includes(q)));
    const cats = [...new Set([...NOTE_CATS, ...list.map((n) => n.cat || "Autre")])].filter((c) => list.some((n) => (n.cat || "Autre") === c));
    body.querySelector("[data-list]").innerHTML = list.length ? cats.map((c) => `<div class="tiny muted" style="margin:12px 0 4px;font-weight:700">${esc(c)}</div><ul class="list">${list.filter((n) => (n.cat || "Autre") === c).map((n) => `<li role="button" tabindex="0" data-open="${n.id}">${noteCard(n)}${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>`).join("") : `<p class="muted small">Aucune fiche${filter !== "all" || q || role !== "all" ? " pour ce filtre" : ""}.</p>`;
  };
  body.innerHTML = `<input class="input" type="search" data-q placeholder="Chercher une technique, un problème…">
    <div class="chips" style="margin-top:10px"><button class="chip" data-r="all" aria-pressed="true">Offensif et défensif</button>${ROLES.map((r) => `<button class="chip" data-r="${r.id}" aria-pressed="false">${esc(r.label)}</button>`).join("")}</div>
    <div class="chips" style="margin-top:6px"><button class="chip" data-f="all" aria-pressed="true">Toutes</button>${NOTE_STATUS.map((s) => `<button class="chip" data-f="${s.id}" aria-pressed="false">${esc(s.label)}</button>`).join("")}</div>
    <div data-list style="margin-top:8px"></div>
    <button class="btn tape-btn block" data-new style="margin-top:12px">${icon("plus")} Nouvelle fiche</button>`;
  body.querySelector("[data-q]").addEventListener("input", (e) => { q = e.target.value.trim().toLowerCase(); draw(); });
  body.addEventListener("click", (e) => {
    const rb = e.target.closest("[data-r]"); if (rb) { role = rb.dataset.r; body.querySelectorAll("[data-r]").forEach((b) => b.setAttribute("aria-pressed", b === rb)); draw(); return; }
    const fb = e.target.closest("[data-f]"); if (fb) { filter = fb.dataset.f; body.querySelectorAll("[data-f]").forEach((b) => b.setAttribute("aria-pressed", b === fb)); draw(); return; }
    const o = e.target.closest("[data-open]"); if (o) { openNoteRead((store.get().notes || []).find((x) => x.id === o.dataset.open), after); return; }
    if (e.target.closest("[data-new]")) openNote(null, after);
  });
  draw();
}

// ---- la fiche dans les systèmes : point de départ, ou solution d'un problème
function noteSystemsHtml(n) {
  const ref = `n:${n.id}`, own = systemsFrom(ref), used = systemsUsing(ref);
  const probs = (n.problems || "").split("\n").filter((x) => x.trim()).length;
  return `<h3 class="sys-h" style="margin-top:20px">Mon système avec cette fiche</h3>
    ${own.length ? own.map((x) => `<section class="panel" style="padding:12px;margin-top:8px"><b>${esc(x.name)}</b>${systemTree(x, { links: true })}
      <div class="row" style="gap:8px;margin-top:8px"><button class="btn small" data-drillsys="${x.id}">${icon("play")} Driller</button><button class="btn ghost small" data-editsys="${x.id}">Modifier</button></div></section>`).join("")
      : `<p class="small muted" style="margin:0 0 8px">Décortique cette technique : les problèmes qu'elle t'amène${probs ? ` (tu en as noté ${probs})` : ""}, comment tu règles chacun, avec quelle technique, fiche ou combo.</p>`}
    <button class="btn tape-btn block" data-mksys style="margin-top:8px">${icon("plus")} ${own.length ? "Un autre système avec cette fiche" : "Décortiquer en système"}</button>
    ${used.length ? `<h3 class="sys-h">Elle règle un problème dans</h3><ul class="list">${used.map((x) => `<li role="button" tabindex="0" data-editsys="${x.id}"><div style="min-width:0;flex:1"><div style="font-weight:700">${esc(x.name)}</div><div class="meta">${x.type === "off" ? "Attaque" : "Défense"}</div></div></li>`).join("")}</ul>` : ""}`;
}
function bindNoteSystems(body, n, after) {
  const all = () => store.get().systems || [];
  body.querySelector("[data-mksys]").addEventListener("click", () => editSystem(null, after, { root: `n:${n.id}`, type: noteRole(n) === "def" ? "def" : "off" }));
  body.querySelectorAll("[data-editsys]").forEach((b) => b.addEventListener("click", () => editSystem(all().find((x) => x.id === b.dataset.editsys), after)));
  body.querySelectorAll("[data-drillsys]").forEach((b) => b.addEventListener("click", () => drillSystem(all().find((x) => x.id === b.dataset.drillsys))));
}
