// Risques et ouvertures de chaque technique, et construction de systèmes offensifs ou défensifs.
import { store, uid, todayKey } from "../store.js";
import { myNote } from "../study-notes.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { TECHS, MAIN_TECHS, FAMILIES, tech } from "../systems-data.js";
import { runTimer } from "./timer.js";
import { isMinor } from "../engine.js";
import { vidRow, TECH_YT, refSlot } from "../videos.js";

const name = (id) => tech(id)?.name || id;

// ---------- explorateur ----------
export function openExplorer(startId, after) {
  let cur = startId || null;
  const history = [];
  const minor = isMinor(store.get().profile);
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
      ${vidRow(`tech:${t.id}`, TECH_YT[t.id], t.name)}
      ${refSlot([t.id])}
      ${t.opens.length ? `<h4 class="sys-h">Ce qu'elle ouvre</h4><div class="chips">${t.opens.map((o) => `<button class="chip open-chip" data-t="${o}">${esc(name(o))}</button>`).join("")}</div>` : ""}
      ${t.counters.length ? `<h4 class="sys-h">Ce à quoi elle t'expose</h4>${t.counters.map((c) => `<div class="risk">
          <div class="risk-top"><button class="chip risk-chip" data-t="${c.by}">${esc(name(c.by))}</button></div>
          <p class="small" style="margin:6px 0">${esc(c.text)}</p>
          ${c.answerText ? `<p class="small" style="margin:0"><b>Ta réponse</b> : ${esc(c.answerText)} ${c.answer ? `<button class="link" data-t="${c.answer}">${esc(name(c.answer))}</button>` : ""}</p>` : ""}
        </div>`).join("")}` : ""}
      ${t.adultOnly ? `<p class="notice is-alert small" style="margin-top:12px">${minor ? "Interdite pour toi : réservée aux adultes. Travaille plutôt la clé de cheville droite et le contrôle des jambes." : "Réservée aux adultes avancés, avec un partenaire de confiance et sous l'œil du coach."}</p>` : ""}
      ${t.reduce ? `<p class="notice small" style="margin-top:12px">${esc(t.reduce)}</p>` : ""}
      ${t.counters.length || t.opens.length ? `<div class="grid2" style="margin-top:14px">
        <button class="btn tape-btn small" data-build="off">Je l'utilise</button>
        <button class="btn ghost small" data-build="def">Il l'utilise</button></div>
        <p class="hint">Crée ton système : « Je l'utilise » prépare ton attaque avec ${esc(t.name.toLowerCase())}, « Il l'utilise » prépare ta défense quand l'adversaire la tente.</p>` : ""}
      <div style="margin-top:14px">${myNote(`tech:${t.id}`, `Techniques · ${t.name}`)}</div>`;
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
  return t.counters.map((c) => ({ id: uid(), reaction: c.by, answer: c.answer || "", note: "" }));
}

// Lecture d'un système en phrases simples
export function systemTree(s) {
  const off = s.type === "off";
  return `<div class="tree">
    <div class="node root">${off ? "Je lance" : "Il m'attaque avec"} : <b>${esc(name(s.root))}</b></div>
    ${s.branches.map((b) => `<div class="branch">
      <div class="node ${off ? "them" : "me"}"><span class="tiny">${off ? "Sa réaction" : "Ma défense"}</span><br><b>${esc(name(b.reaction))}</b></div>
      ${b.answer ? `<div class="node ${off ? "me" : "them"}"><span class="tiny">${off ? "Ma réponse" : "S'il enchaîne"}</span><br><b>${esc(name(b.answer))}</b></div>` : ""}
      ${b.note ? `<div class="tiny muted" style="padding:2px 0 0 4px">${esc(b.note)}</div>` : ""}
    </div>`).join("")}
  </div>`;
}

export function drillSystem(s) {
  const off = s.type === "off";
  const names = s.branches.map((b) => off
    ? `${name(s.root)} · s'il fait ${name(b.reaction).toLowerCase()} → ${b.answer ? name(b.answer).toLowerCase() : "à toi de trouver"}`
    : `Il attaque en ${name(s.root).toLowerCase()} → ${name(b.reaction).toLowerCase()}`);
  runTimer({ work: 30, rest: 30, rounds: Math.max(4, names.length * 2), title: s.name, names: names.length ? names : [name(s.root)] });
}

// ---------- création d'un système, en 3 étapes ----------
// Un système = une technique + les réactions possibles de l'adversaire + ma réponse à chacune.
export function editSystem(existing, after, seed = {}) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), name: "", type: seed.type || "", root: seed.root || "", branches: [], createdAt: todayKey() };
  let step = existing ? 3 : seed.root && seed.type ? 3 : seed.type ? 2 : 1;
  const prefill = () => { s.branches = autoBranches(s.root, s.type); s.name = `${s.type === "off" ? "Mon attaque" : "Ma défense"} : ${name(s.root)}`; };
  if (!existing && step === 3) prefill();

  const opts = (sel) => `<option value="">Choisir…</option>` + FAMILIES.map((f) => `<optgroup label="${esc(f.label)}">${TECHS.filter((t) => t.family === f.id).map((t) => `<option value="${t.id}" ${t.id === sel ? "selected" : ""}>${esc(t.name)}</option>`).join("")}</optgroup>`).join("");
  const body = openSheet(existing ? "Modifier mon système" : "Créer un système", "");
  const dots = () => `<div class="steps-dots" style="margin-bottom:14px" aria-hidden="true">${[1, 2, 3].map((i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>`;

  const draw = () => {
    const off = s.type === "off";
    if (step === 1) {
      body.innerHTML = `${dots()}
        <p class="small">Un système, c'est ton plan à l'avance : <b>je fais ceci ; s'il réagit comme ça, je fais cela.</b> Comme ça, en combat, tu ne réfléchis plus, tu enchaînes.</p>
        <h3 class="sys-h">Tu veux préparer…</h3>
        <button class="choice" data-type="off"><b>Une attaque</b><span>Je lance une technique et je prévois ce que je fais selon sa réaction.</span><span class="tiny muted">Ex. : je tente un double-leg ; s'il sprawle, je passe au single-leg.</span></button>
        <button class="choice" data-type="def"><b>Une défense</b><span>Il m'attaque avec une technique et je prévois comment je réponds.</span><span class="tiny muted">Ex. : il tente un double-leg ; je sprawle, et s'il enchaîne, je prends sa tête.</span></button>`;
      return;
    }
    if (step === 2) {
      body.innerHTML = `${dots()}
        <h3 class="sys-h" style="margin-top:0">${off ? "Avec quelle technique tu attaques ?" : "Avec quelle technique il t'attaque ?"}</h3>
        ${FAMILIES.map((f) => `<div class="tiny muted" style="margin:12px 0 6px;font-weight:700">${esc(f.label)}</div><div class="chips">${MAIN_TECHS.filter((t) => t.family === f.id).map((t) => `<button class="chip" data-root="${t.id}" aria-pressed="${t.id === s.root}">${esc(t.name)}</button>`).join("")}</div>`).join("")}
        <button class="btn ghost block" data-step="1" style="margin-top:16px">Retour</button>`;
      return;
    }
    body.innerHTML = `${dots()}
      <div class="stack">
        <div class="panel" style="padding:12px">
          <div class="tiny muted">${off ? "J'attaque avec" : "Il m'attaque avec"}</div>
          <div class="row between"><b style="font-size:18px">${esc(name(s.root))}</b>${existing ? "" : `<button class="btn ghost small" data-step="2">Changer</button>`}</div>
        </div>
        <p class="small" style="margin:0">${off
          ? "Voici ce que l'adversaire fait le plus souvent face à cette technique, avec la réponse conseillée. Garde, change ou ajoute des scénarios."
          : "Voici tes meilleures défenses face à cette technique, et ce qu'il peut enchaîner ensuite. Garde, change ou ajoute des scénarios."}</p>
        ${s.branches.map((b, i) => `<section class="panel scen" style="padding:12px">
          <div class="row between"><b>Scénario ${i + 1}</b><button type="button" class="icon-btn" data-delb="${i}" aria-label="Retirer le scénario ${i + 1}">${icon("trash")}</button></div>
          <label class="field"><span>${off ? "S'il fait…" : "Je me défends avec…"}</span><select class="input" data-b="${i}" data-k="reaction">${opts(b.reaction)}</select></label>
          <label class="field"><span>${off ? "Alors je fais…" : "Et s'il enchaîne avec… (facultatif)"}</span><select class="input" data-b="${i}" data-k="answer">${opts(b.answer)}</select></label>
          <label class="field"><span>Détail à retenir (facultatif)</span><input class="input" data-b="${i}" data-k="note" value="${esc(b.note)}" placeholder="Ex. tête haute, finir vers la cage"></label>
        </section>`).join("")}
        ${s.branches.length ? "" : `<p class="muted small">Aucun scénario pour l'instant.</p>`}
        <button type="button" class="btn ghost block" data-addb>${icon("plus")} Ajouter un scénario</button>
        ${existing ? "" : `<button type="button" class="btn ghost block small" data-reset>Remettre les scénarios proposés</button>`}
        <h3 class="sys-h">Ton système en résumé</h3>
        ${systemTree(s)}
        <label class="field"><span>Nom du système</span><input class="input" data-f="name" value="${esc(s.name)}"></label>
        <button type="button" class="btn tape-btn block" data-save>Enregistrer le système</button>
        ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce système</button>` : ""}
      </div>`;
  };

  body.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.b !== undefined) { s.branches[t.dataset.b][t.dataset.k] = t.value; if (t.dataset.k !== "note") draw(); }
  });
  body.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.f === "name") s.name = t.value;
    if (t.dataset.k === "note") s.branches[t.dataset.b].note = t.value;
  });
  body.addEventListener("click", (e) => {
    const sheet = body.closest(".sheet");
    const ty = e.target.closest("[data-type]"); if (ty) { s.type = ty.dataset.type; step = 2; draw(); sheet.scrollTop = 0; return; }
    const r = e.target.closest("[data-root]"); if (r) { s.root = r.dataset.root; prefill(); step = 3; draw(); sheet.scrollTop = 0; return; }
    const st = e.target.closest("[data-step]"); if (st) { step = Number(st.dataset.step); draw(); sheet.scrollTop = 0; return; }
    if (e.target.closest("[data-addb]")) { s.branches.push({ id: uid(), reaction: "", answer: "", note: "" }); draw(); return; }
    const d = e.target.closest("[data-delb]"); if (d) { s.branches.splice(Number(d.dataset.delb), 1); draw(); return; }
    if (e.target.closest("[data-reset]")) { prefill(); draw(); return; }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = "Confirmer la suppression"; return; }
      store.update((st2) => { st2.systems = (st2.systems || []).filter((x) => x.id !== s.id); }); closeSheet(); toast("Système supprimé"); after?.(); return;
    }
    if (e.target.closest("[data-save]")) {
      s.branches = s.branches.filter((b) => b.reaction);
      if (!s.branches.length) { toast("Ajoute au moins un scénario"); return; }
      if (!s.name.trim()) s.name = `${s.type === "off" ? "Mon attaque" : "Ma défense"} : ${name(s.root)}`;
      store.update((st2) => { st2.systems = [...(st2.systems || []).filter((x) => x.id !== s.id), s]; });
      closeSheet(); toast("Système enregistré"); after?.();
    }
  });
  draw();
}
