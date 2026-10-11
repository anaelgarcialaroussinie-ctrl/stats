// Risques et ouvertures de chaque technique, et construction de systèmes offensifs ou défensifs.
import { store, uid, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { TECHS, MAIN_TECHS, FAMILIES, tech } from "../systems-data.js";
import { runTimer } from "./timer.js";

const name = (id) => tech(id)?.name || id;

// ---------- explorateur ----------
export function openExplorer(startId, after) {
  let cur = startId || null;
  const history = [];
  const body = openSheet("Risques et ouvertures", "");
  const draw = () => {
    if (!cur) {
      body.innerHTML = `<p class="muted small">Choisis une technique : tu verras ce qu'elle ouvre, ce à quoi elle t'expose, et quoi faire quand l'adversaire contre. Expertise de terrain, à valider et enrichir avec ton coach.</p>
        ${FAMILIES.map((f) => `<h3 class="h-sec" style="font-size:19px">${esc(f.label)}</h3><div class="chips">${MAIN_TECHS.filter((t) => t.family === f.id).map((t) => `<button class="chip" data-t="${t.id}">${esc(t.name)}</button>`).join("")}</div>`).join("")}`;
      return;
    }
    const t = tech(cur);
    body.innerHTML = `
      <div class="row" style="gap:8px;margin-bottom:6px">${history.length ? `<button class="icon-btn" data-back aria-label="Technique précédente">${icon("back")}</button>` : `<button class="btn ghost small" data-all>Toutes les techniques</button>`}</div>
      <h3 class="display" style="font-size:30px">${esc(t.name)}</h3>
      <p class="muted small">${esc(t.zone)}</p>
      ${t.opens.length ? `<h4 class="sys-h">Ce qu'elle ouvre</h4><div class="chips">${t.opens.map((o) => `<button class="chip open-chip" data-t="${o}">${esc(name(o))}</button>`).join("")}</div>` : ""}
      ${t.counters.length ? `<h4 class="sys-h">Ce à quoi elle t'expose</h4>${t.counters.map((c) => `<div class="risk">
          <div class="risk-top"><button class="chip risk-chip" data-t="${c.by}">${esc(name(c.by))}</button></div>
          <p class="small" style="margin:6px 0">${esc(c.text)}</p>
          ${c.answer ? `<p class="small" style="margin:0"><b>Ta réponse</b> : ${esc(c.answerText)} <button class="link" data-t="${c.answer}">${esc(name(c.answer))}</button></p>` : ""}
        </div>`).join("")}` : ""}
      ${t.reduce ? `<p class="notice small" style="margin-top:12px">${esc(t.reduce)}</p>` : ""}
      ${t.counters.length || t.opens.length ? `<div class="grid2" style="margin-top:14px">
        <button class="btn tape-btn small" data-build="off">Système offensif</button>
        <button class="btn ghost small" data-build="def">Système défensif</button></div>
        <p class="hint">Offensif : tu attaques avec ${esc(t.name.toLowerCase())}. Défensif : c'est l'adversaire qui l'utilise contre toi.</p>` : ""}`;
  };
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]");
    if (b) { if (cur) history.push(cur); cur = b.dataset.t; draw(); body.closest(".sheet").scrollTop = 0; return; }
    if (e.target.closest("[data-back]")) { cur = history.pop() || null; draw(); return; }
    if (e.target.closest("[data-all]")) { cur = null; draw(); return; }
    const bd = e.target.closest("[data-build]");
    if (bd) editSystem(null, after, { root: cur, type: bd.dataset.build });
  });
  draw();
}

// construit automatiquement les branches à partir de la carte
function autoBranches(rootId, type) {
  const t = tech(rootId);
  if (type === "off") return t.counters.map((c) => ({ id: uid(), reaction: c.by, answer: c.answer || "", note: c.answerText || "" }));
  // défensif : l'adversaire attaque avec rootId ; mes réponses = les contres possibles, avec ce qu'il peut enchaîner
  return t.counters.map((c) => ({ id: uid(), reaction: c.by, answer: c.answer || "", note: c.text }));
}

export function systemTree(s) {
  const off = s.type === "off";
  return `<div class="tree">
    <div class="node root">${off ? "J'attaque" : "Il attaque"} : <b>${esc(name(s.root))}</b></div>
    ${s.branches.map((b) => `<div class="branch">
      <div class="node ${off ? "them" : "me"}">${off ? "S'il" : "Je"} : <b>${esc(name(b.reaction))}</b></div>
      ${b.answer ? `<div class="node ${off ? "me" : "them"}">${off ? "Je" : "S'il enchaîne"} : <b>${esc(name(b.answer))}</b></div>` : ""}
      ${b.note ? `<div class="tiny muted" style="padding:4px 0 0 14px">${esc(b.note)}</div>` : ""}
    </div>`).join("")}
  </div>`;
}

export function drillSystem(s) {
  const off = s.type === "off";
  const names = s.branches.map((b) => off ? `${name(s.root)}, s'il ${name(b.reaction).toLowerCase()} : ${name(b.answer).toLowerCase()}` : `Il ${name(s.root).toLowerCase()} : ${name(b.reaction).toLowerCase()}`);
  runTimer({ work: 30, rest: 30, rounds: Math.max(4, names.length * 2), title: s.name, names: names.length ? names : [name(s.root)] });
}

// ---------- éditeur de système ----------
export function editSystem(existing, after, seed = {}) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), name: "", type: seed.type || "off", root: seed.root || "double", branches: [], createdAt: todayKey() };
  if (!existing) { s.branches = autoBranches(s.root, s.type); s.name = `${s.type === "off" ? "Attaque" : "Défense"} : ${name(s.root)}`; }
  const opts = (sel) => `<option value="">—</option>` + FAMILIES.map((f) => `<optgroup label="${esc(f.label)}">${TECHS.filter((t) => t.family === f.id).map((t) => `<option value="${t.id}" ${t.id === sel ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</optgroup>`).join("");
  const body = openSheet(existing ? "Modifier le système" : "Nouveau système", "");
  const draw = () => {
    const off = s.type === "off";
    body.innerHTML = `
      <div class="stack">
        <label class="field"><span>Nom</span><input class="input" data-f="name" value="${esc(s.name)}"></label>
        <div class="chips"><button type="button" class="chip" data-type="off" aria-pressed="${off}">Offensif</button><button type="button" class="chip" data-type="def" aria-pressed="${!off}">Défensif</button></div>
        <label class="field"><span>${off ? "Ma technique de départ" : "La technique de l'adversaire"}</span><select class="input" data-f="root">${opts(s.root)}</select></label>
        <h4 class="sys-h">Schéma</h4>
        ${systemTree(s)}
        <h4 class="sys-h">Branches</h4>
        ${s.branches.map((b, i) => `<div class="panel stack" style="padding:12px">
          <label class="field"><span>${off ? "Si l'adversaire répond par" : "Ma réponse"}</span><select class="input" data-b="${i}" data-k="reaction">${opts(b.reaction)}</select></label>
          <label class="field"><span>${off ? "Alors j'enchaîne" : "S'il enchaîne"}</span><select class="input" data-b="${i}" data-k="answer">${opts(b.answer)}</select></label>
          <label class="field"><span>Note</span><input class="input" data-b="${i}" data-k="note" value="${esc(b.note)}"></label>
          <button type="button" class="btn ghost small" data-delb="${i}">Retirer cette branche</button>
        </div>`).join("")}
        <button type="button" class="btn ghost block" data-addb>${icon("plus")} Ajouter une branche</button>
        <button type="button" class="btn ghost block" data-reset>Recalculer depuis la carte des techniques</button>
        <button type="button" class="btn tape-btn block" data-save>Enregistrer le système</button>
        ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce système</button>` : ""}
      </div>`;
  };
  body.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.f === "root") { s.root = t.value || s.root; draw(); }
    if (t.dataset.b !== undefined) { s.branches[t.dataset.b][t.dataset.k] = t.value; if (t.dataset.k !== "note") draw(); }
  });
  body.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.f === "name") s.name = t.value;
    if (t.dataset.k === "note") s.branches[t.dataset.b].note = t.value;
  });
  body.addEventListener("click", (e) => {
    const ty = e.target.closest("[data-type]"); if (ty) { s.type = ty.dataset.type; draw(); return; }
    if (e.target.closest("[data-addb]")) { s.branches.push({ id: uid(), reaction: "", answer: "", note: "" }); draw(); return; }
    const d = e.target.closest("[data-delb]"); if (d) { s.branches.splice(Number(d.dataset.delb), 1); draw(); return; }
    if (e.target.closest("[data-reset]")) { s.branches = autoBranches(s.root, s.type); draw(); return; }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = "Confirmer la suppression"; return; }
      store.update((st) => { st.systems = (st.systems || []).filter((x) => x.id !== s.id); }); closeSheet(); toast("Système supprimé"); after?.(); return;
    }
    if (e.target.closest("[data-save]")) {
      s.branches = s.branches.filter((b) => b.reaction);
      store.update((st) => { st.systems = [...(st.systems || []).filter((x) => x.id !== s.id), s]; });
      closeSheet(); toast("Système enregistré"); after?.();
    }
  });
  draw();
}
