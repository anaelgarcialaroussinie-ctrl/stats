// Risques et ouvertures de chaque technique, et construction de systèmes offensifs ou défensifs.
import { store, uid, todayKey } from "../store.js";
import { myNote } from "../study-notes.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { TECHS, MAIN_TECHS, FAMILIES, tech } from "../systems-data.js";
import { runTimer } from "./timer.js";
import { isMinor } from "../engine.js";
import { vidRow, TECH_YT, refSlot } from "../videos.js";
import { refName, refKind, refTag, refOptions, findNote, findCombo, noteRole, comboRole, matchRole, roleLabel } from "../game.js";
import { REACTIONS } from "../discussion-data.js";

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

// branches proposées au départ, selon le point de départ du système
function seedBranches(root, type) {
  const k = refKind(root);
  if (k === "n") {
    const n = findNote(root.slice(2)); if (!n) return [];
    const L = (t = "") => t.split("\n").map((x) => x.trim()).filter(Boolean);
    const fx = L(n.fixes);
    return L(n.problems).map((p, i) => ({ id: uid(), reaction: `x:${p}`, answer: "", note: fx[i] || "" }));
  }
  if (k !== "t") return [];
  const t = tech(root); if (!t) return [];
  if (type === "off") return t.counters.map((c) => ({ id: uid(), reaction: c.by, answer: c.answer || "", note: c.answerText || "" }));
  // défensif : l'adversaire attaque avec root ; mes réponses = les contres possibles
  return t.counters.map((c) => ({ id: uid(), reaction: c.by, answer: c.answer || "", note: "" }));
}

const refChip = (ref, links, src) => {
  if (!ref) return "";
  const tag = refTag(ref);
  const label = `${tag ? `<span class="ref-tag">${tag}</span>` : ""}<b>${esc(refName(ref, src))}</b>`;
  return links && refKind(ref) !== "x" ? `<button type="button" class="ref-link" data-ref="${esc(ref)}">${label}</button>` : label;
};

// Lecture d'un système en phrases simples ; links : les fiches, combos et techniques s'ouvrent au toucher
export function systemTree(s, { src = store.get(), links = false } = {}) {
  const off = s.type === "off";
  return `<div class="tree">
    <div class="node root">${off ? "Je lance" : "Il m'attaque avec"} : ${refChip(s.root, links, src)}</div>
    ${s.branches.map((b) => `<div class="branch">
      <div class="node ${off ? "them" : "me"}"><span class="tiny">${off ? "Le problème : s'il fait" : "Ma défense"}</span><br>${refChip(b.reaction, links, src)}</div>
      ${b.answer ? `<div class="node ${off ? "me" : "them"}"><span class="tiny">${off ? "Je règle avec" : "S'il enchaîne"}</span><br>${refChip(b.answer, links, src)}</div>` : ""}
      ${b.note ? `<div class="tiny muted" style="padding:2px 0 0 4px">${off ? "Comment : " : ""}${esc(b.note)}</div>` : ""}
    </div>`).join("")}
  </div>`;
}

// ouvrir une fiche, un combo ou une technique depuis un système
document.addEventListener("click", async (e) => {
  const r = e.target.closest(".tree [data-ref]"); if (!r) return;
  e.preventDefault();
  const ref = r.dataset.ref, k = refKind(ref);
  const after = () => document.dispatchEvent(new CustomEvent("fap:refresh"));
  if (k === "n") { const n = findNote(ref.slice(2)); if (n) (await import("./notes.js")).openNoteRead(n, after); else toast("Cette fiche a été supprimée"); }
  else if (k === "c") { const c = findCombo(ref.slice(2)); if (c) (await import("./academy.js")).editCombo(c, after); else toast("Ce combo a été supprimé"); }
  else openExplorer(ref.replace(/^t:/, ""), after);
});

export function drillSystem(s) {
  const off = s.type === "off";
  const nm = (r) => refName(r).toLowerCase();
  const names = s.branches.map((b) => off
    ? `${refName(s.root)} · s'il ${refKind(b.reaction) === "x" ? nm(b.reaction).replace(/^il /, "") : "fait " + nm(b.reaction)} → ${b.answer ? nm(b.answer) : b.note || "à toi de trouver"}`
    : `Il attaque en ${nm(s.root)} → ${nm(b.reaction)}${b.answer ? `, puis ${nm(b.answer)}` : ""}`);
  runTimer({ work: 30, rest: 30, rounds: Math.max(4, names.length * 2), title: s.name, names: names.length ? names : [refName(s.root)] });
}

// nouvelle fiche créée en cours de route : on la complètera plus tard
function quickNote(title, role) {
  const n = { id: uid(), title, role, cat: "Debout", source: "Créée depuis un système", date: todayKey(), keys: "", feel: "", problems: "", fixes: "", video: "", status: "todo", createdAt: todayKey(), updatedAt: new Date().toISOString() };
  store.update((st) => { st.notes = [...(st.notes || []), n]; });
  return n;
}

// ---------- création d'un système, en 3 étapes ----------
// Un système = un point de départ (technique, fiche ou combo) + les problèmes qu'il amène + comment je règle chacun.
export function editSystem(existing, after, seed = {}) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), name: "", type: seed.type || "", root: seed.root || "", branches: [], createdAt: todayKey() };
  let step = existing ? 3 : s.root && s.type ? 3 : s.type ? 2 : 1;
  let rootTab = (store.get().notes || []).length ? "notes" : (store.get().combos || []).length ? "combos" : "techs";
  let pending = null; // { i, k } : une nouvelle fiche à nommer
  const autoName = () => `${s.type === "off" ? "Mon attaque" : "Ma défense"} : ${refName(s.root)}`;
  const prefill = () => { s.branches = seedBranches(s.root, s.type); if (!s.branches.length) s.branches = [{ id: uid(), reaction: "", answer: "", note: "" }]; s.name = autoName(); };
  if (!existing && step === 3) prefill();

  const body = openSheet(existing ? "Modifier mon système" : "Créer un système", "");
  const dots = () => `<div class="steps-dots" style="margin-bottom:14px" aria-hidden="true">${[1, 2, 3].map((i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>`;

  const field = (i, k, label) => {
    const v = s.branches[i][k];
    if (pending && pending.i === i && pending.k === k) return `<div class="field"><span>${label}</span>
      <div class="row" style="gap:6px"><input class="input" data-newtitle placeholder="Nom de la nouvelle fiche" maxlength="120" style="flex:1"><button type="button" class="btn small tape-btn" data-mknote>Créer</button><button type="button" class="btn small ghost" data-nonote>Annuler</button></div>
      <span class="tiny muted">La fiche est créée vide : tu la complètes quand tu veux dans « Mes fiches techniques ».</span></div>`;
    if (refKind(v) === "x") return `<div class="field"><span>${label}</span><div class="row" style="gap:6px"><input class="input" data-b="${i}" data-k="${k}" data-free value="${esc(v.slice(2))}" placeholder="Écris avec tes mots" style="flex:1"><button type="button" class="btn small ghost" data-unfree="${i}|${k}">Liste</button></div></div>`;
    return `<label class="field"><span>${label}</span><select class="input" data-b="${i}" data-k="${k}">${refOptions(v)}</select></label>`;
  };

  const draw = () => {
    const off = s.type === "off";
    const st = store.get();
    if (step === 1) {
      body.innerHTML = `${dots()}
        <p class="small">Un système, c'est ton plan à l'avance : <b>je fais ceci ; s'il réagit comme ça, je règle avec cela.</b> Comme ça, en combat, tu ne réfléchis plus, tu enchaînes.</p>
        <h3 class="sys-h">Tu veux préparer…</h3>
        <button class="choice" data-type="off"><b>Une attaque</b><span>Je lance une technique ou un combo, et je prévois comment régler chaque problème qu'il amène.</span><span class="tiny muted">Ex. : je lance mon jab-direct-double-leg ; s'il sprawle, je règle avec ma fiche « single-leg en sortie ».</span></button>
        <button class="choice" data-type="def"><b>Une défense</b><span>Il m'attaque avec une technique et je prévois comment je réponds.</span><span class="tiny muted">Ex. : il tente un double-leg ; je sprawle, et s'il enchaîne, je prends sa tête.</span></button>`;
      return;
    }
    if (step === 2) {
      const notes = [...(st.notes || [])].sort((a, b) => (matchRole(noteRole(b), s.type) ? 1 : 0) - (matchRole(noteRole(a), s.type) ? 1 : 0));
      const combos = [...(st.combos || [])].sort((a, b) => (comboRole(b) === s.type ? 1 : 0) - (comboRole(a) === s.type ? 1 : 0));
      body.innerHTML = `${dots()}
        <h3 class="sys-h" style="margin-top:0">${off ? "Ton point de départ : avec quoi tu attaques ?" : "Avec quelle technique il t'attaque ?"}</h3>
        <div class="chips" style="margin-bottom:10px">${[["notes", `Mes fiches (${notes.length})`], ["combos", `Mes combos (${combos.length})`], ["techs", "Techniques"]].map(([id, l]) => `<button class="chip" data-rtab="${id}" aria-pressed="${rootTab === id}">${l}</button>`).join("")}</div>
        ${rootTab === "notes" ? (notes.length ? `<ul class="list">${notes.map((n) => `<li role="button" tabindex="0" data-root="n:${n.id}"><div style="min-width:0;flex:1"><div style="font-weight:700">${esc(n.title || "Sans titre")}</div><div class="meta">${esc(roleLabel(noteRole(n)))} · ${esc(n.cat || "")}${(n.problems || "").trim() ? ` · ${n.problems.split("\n").filter((x) => x.trim()).length} problème(s) notés` : ""}</div></div></li>`).join("")}</ul>` : `<p class="muted small">Pas encore de fiche. Crée-en une dans Academy → Mon jeu, ou choisis une technique.</p>`)
          : rootTab === "combos" ? (combos.length ? `<ul class="list">${combos.map((c) => `<li role="button" tabindex="0" data-root="c:${c.id}"><div style="min-width:0;flex:1"><div style="font-weight:700">${esc(c.name)}</div><div class="meta">${esc(roleLabel(comboRole(c)))}${c.when ? " · " + esc(c.when) : ""}</div></div></li>`).join("")}</ul>` : `<p class="muted small">Pas encore de combo. Note-en un dans Academy → Mon jeu.</p>`)
          : FAMILIES.map((f) => `<div class="tiny muted" style="margin:12px 0 6px;font-weight:700">${esc(f.label)}</div><div class="chips">${MAIN_TECHS.filter((t) => t.family === f.id).map((t) => `<button class="chip" data-root="${t.id}" aria-pressed="${t.id === s.root}">${esc(t.name)}</button>`).join("")}</div>`).join("")}
        <button class="btn ghost block" data-step="1" style="margin-top:16px">Retour</button>`;
      return;
    }
    const usedReac = new Set(s.branches.map((b) => b.reaction));
    const noteProblems = refKind(s.root) === "n" ? (findNote(s.root.slice(2))?.problems || "").split("\n").map((x) => x.trim()).filter(Boolean) : [];
    const sugg = off ? [...noteProblems, ...REACTIONS.map((r) => r.name)].filter((x) => !usedReac.has(`x:${x}`)) : [];
    body.innerHTML = `${dots()}
      <div class="stack">
        <div class="panel" style="padding:12px">
          <div class="tiny muted">${off ? "Je lance" : "Il m'attaque avec"}${refTag(s.root) ? ` · ${refTag(s.root).toLowerCase()}` : ""}</div>
          <div class="row between"><b style="font-size:18px">${esc(refName(s.root))}</b>${existing ? "" : `<button class="btn ghost small" data-step="2">Changer</button>`}</div>
        </div>
        <p class="small" style="margin:0">${off
          ? "Décortique : quels problèmes ce départ t'amène (ses réactions, ce qui coince) ? Pour chacun, comment tu le règles, et avec quelle technique, fiche ou combo. Tu peux écrire avec tes mots ou créer une fiche au passage."
          : "Tes défenses face à cette attaque, et ce qu'il peut enchaîner ensuite. Écris avec tes mots, choisis une technique, une fiche ou un combo."}</p>
        ${s.branches.map((b, i) => `<section class="panel scen" style="padding:12px">
          <div class="row between"><b>${off ? "Problème" : "Scénario"} ${i + 1}</b><button type="button" class="icon-btn" data-delb="${i}" aria-label="Retirer">${icon("trash")}</button></div>
          ${field(i, "reaction", off ? "Le problème : s'il fait…" : "Je me défends avec…")}
          ${field(i, "answer", off ? "Je règle avec… (technique, fiche ou combo)" : "Et s'il enchaîne avec… (facultatif)")}
          <label class="field"><span>${off ? "Comment je le règle (détail)" : "Détail à retenir (facultatif)"}</span><input class="input" data-b="${i}" data-k="note" value="${esc(b.note)}" placeholder="Ex. tête haute, finir vers la cage"></label>
        </section>`).join("")}
        <button type="button" class="btn ghost block" data-addb>${icon("plus")} Ajouter un ${off ? "problème" : "scénario"}</button>
        ${sugg.length ? `<div><div class="tiny muted" style="margin-bottom:6px">Problèmes fréquents : touche pour l'ajouter</div><div class="chips">${sugg.slice(0, 16).map((x) => `<button type="button" class="chip" data-sugg="${esc(x)}">${esc(x)}</button>`).join("")}</div></div>` : ""}
        ${existing || refKind(s.root) === "c" ? "" : `<button type="button" class="btn ghost block small" data-reset>Remettre les ${off ? "problèmes" : "scénarios"} proposés</button>`}
        <h3 class="sys-h">Ton système en résumé</h3>
        ${systemTree(s)}
        <label class="field"><span>Nom du système</span><input class="input" data-f="name" value="${esc(s.name)}"></label>
        <button type="button" class="btn tape-btn block" data-save>Enregistrer le système</button>
        ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce système</button>` : ""}
      </div>`;
  };

  body.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.b === undefined || t.dataset.free !== undefined || t.dataset.k === "note") return;
    const i = Number(t.dataset.b), k = t.dataset.k;
    if (t.value === "__free") { s.branches[i][k] = "x:"; draw(); body.querySelector(`[data-b="${i}"][data-k="${k}"]`)?.focus(); return; }
    if (t.value === "__newnote") { pending = { i, k }; draw(); body.querySelector("[data-newtitle]")?.focus(); return; }
    s.branches[i][k] = t.value; draw();
  });
  body.addEventListener("input", (e) => {
    const t = e.target;
    if (t.dataset.f === "name") s.name = t.value;
    if (t.dataset.k === "note") s.branches[t.dataset.b].note = t.value;
    if (t.dataset.free !== undefined) s.branches[t.dataset.b][t.dataset.k] = `x:${t.value}`;
  });
  body.addEventListener("click", (e) => {
    const sheet = body.closest(".sheet");
    const ty = e.target.closest("[data-type]"); if (ty) { s.type = ty.dataset.type; step = 2; draw(); sheet.scrollTop = 0; return; }
    const rt = e.target.closest("[data-rtab]"); if (rt) { rootTab = rt.dataset.rtab; draw(); return; }
    const r = e.target.closest("[data-root]"); if (r) { s.root = r.dataset.root; prefill(); step = 3; draw(); sheet.scrollTop = 0; return; }
    const stp = e.target.closest("[data-step]"); if (stp) { step = Number(stp.dataset.step); draw(); sheet.scrollTop = 0; return; }
    if (e.target.closest("[data-addb]")) { s.branches.push({ id: uid(), reaction: "", answer: "", note: "" }); draw(); return; }
    const sg = e.target.closest("[data-sugg]"); if (sg) { const empty = s.branches.find((b) => !b.reaction || b.reaction === "x:"); if (empty) empty.reaction = `x:${sg.dataset.sugg}`; else s.branches.push({ id: uid(), reaction: `x:${sg.dataset.sugg}`, answer: "", note: "" }); draw(); return; }
    const uf = e.target.closest("[data-unfree]"); if (uf) { const [i, k] = uf.dataset.unfree.split("|"); s.branches[i][k] = ""; draw(); return; }
    if (e.target.closest("[data-nonote]")) { pending = null; draw(); return; }
    if (e.target.closest("[data-mknote]")) {
      const title = body.querySelector("[data-newtitle]").value.trim();
      if (!title) { toast("Donne un nom à la fiche"); return; }
      const role = s.type === "def" && pending.k === "reaction" ? "def" : s.type === "def" ? "off" : pending.k === "answer" ? "off" : "both";
      const n = quickNote(title, role);
      s.branches[pending.i][pending.k] = `n:${n.id}`; pending = null; draw(); toast("Fiche créée : complète-la plus tard"); return;
    }
    const d = e.target.closest("[data-delb]"); if (d) { s.branches.splice(Number(d.dataset.delb), 1); draw(); return; }
    if (e.target.closest("[data-reset]")) { prefill(); draw(); return; }
    const del = e.target.closest("[data-del]");
    if (del) {
      if (!del.dataset.armed) { del.dataset.armed = "1"; del.textContent = "Confirmer la suppression"; return; }
      store.update((st2) => { st2.systems = (st2.systems || []).filter((x) => x.id !== s.id); }); closeSheet(); toast("Système supprimé"); after?.(); return;
    }
    if (e.target.closest("[data-save]")) {
      s.branches = s.branches.filter((b) => b.reaction && b.reaction !== "x:").map((b) => ({ ...b, answer: b.answer === "x:" ? "" : b.answer }));
      if (!s.branches.length) { toast(`Ajoute au moins un ${s.type === "off" ? "problème" : "scénario"}`); return; }
      if (!s.name.trim()) s.name = autoName();
      store.update((st2) => { st2.systems = [...(st2.systems || []).filter((x) => x.id !== s.id), s]; });
      closeSheet(); toast("Système enregistré"); after?.();
    }
  });
  draw();
}
