import { store, uid, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { ZONES, STANCES, PROFILES, MOVES, CLASSIC_COMBOS, ARTS, SCOUT_FIELDS, PLAN_FIELDS } from "../academy-data.js";
import { runTimer } from "./timer.js";
import { frDate } from "../engine.js";
import { openExplorer, editSystem, systemTree, drillSystem } from "./systems.js";
import { LUTA_INTRO, GLOSSARY, LESSON, GRADES, CYCLES } from "../luta-data.js";
import { sync } from "../sync.js";

const moveLabel = (id) => MOVES.find((m) => m.id === id)?.label || id;
const moveName = (id) => MOVES.find((m) => m.id === id)?.name || id;
const seqHtml = (seq) => `<span class="seq">${seq.map((m) => `<span class="mv">${esc(moveLabel(m))}</span>`).join("")}</span>`;

const MODULES = [
  { id: "zones", title: "Les zones du combat", text: "Distance, clinch, sol : ce qui s'y joue, les chiffres, les dangers." },
  { id: "stances", title: "Gardes et attitudes", text: "Orthodoxe, gaucher, switch, garde hybride MMA, posture de lutte." },
  { id: "profiles", title: "Les profils de combattants", text: "Les 5 styles qui ressortent de l'analyse UFC, et comment les contrer." },
  { id: "combos", title: "Combinaisons classiques", text: "Ce que chaque enchaînement ouvre, ce qu'il expose." },
  { id: "luta", title: "Luta Livre", text: "Vocabulaire, programme des ceintures, cycle de lutte 6 semaines, cycle montée 4 semaines, structure d'un cours." },
  { id: "arts", title: "Les arts du MMA", text: "Ce que la boxe, le muay thaï, la lutte, le judo, le jiu-jitsu et la Luta Livre apportent." },
];

export function renderAcademy(el, ctx) {
  const st = store.get();
  const combos = st.combos || [];
  const scouts = st.scouting || [];
  const systems = st.systems || [];

  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 4px">Academy</h1>
    <p class="muted">Comprendre le combat pour mieux le travailler. Les chiffres viennent de l'analyse de 7 670 combats UFC.</p>

    <h2 class="h-sec">Mes combos fétiches</h2>
    <section class="panel">
      ${combos.length ? `<ul class="list">${combos.map((c) => `<li>
        <div style="min-width:0"><div style="font-weight:700">${esc(c.name)}</div>${seqHtml(c.seq)}${c.when ? `<div class="meta" style="margin-top:4px">${esc(c.when)}</div>` : ""}</div>
        <div class="row" style="gap:6px;flex:none"><button class="icon-btn" data-drill="${c.id}" aria-label="Driller ${esc(c.name)}">${icon("play")}</button><button class="icon-btn" data-edit="${c.id}" aria-label="Modifier">${icon("edit")}</button></div>
      </li>`).join("")}</ul>` : `<p class="muted small" style="margin:0 0 4px">Note les enchaînements qui marchent pour toi, puis drille-les au minuteur. Ton coach les voit aussi.</p>`}
      <button class="btn tape-btn block" data-newcombo style="margin-top:12px">${icon("plus")} Noter un combo</button>
    </section>

    <h2 class="h-sec">Systèmes offensifs et défensifs</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Pour chaque technique : ce qu'elle ouvre, ce à quoi elle t'expose, et ta réponse quand l'adversaire contre. Construis tes schémas à partir de là.</p>
      <button class="btn tape-btn block" data-explore>${icon("search")} Risques et ouvertures des techniques</button>
      ${systems.length ? `<div class="stack" style="margin-top:12px">${systems.map((x) => `<details class="sys-card"><summary><span><b>${esc(x.name)}</b><span class="tiny muted" style="display:block">${x.type === "off" ? "Offensif" : "Défensif"} · ${x.branches.length} branche${x.branches.length > 1 ? "s" : ""}</span></span></summary>
        ${systemTree(x)}
        <div class="row" style="margin-top:10px"><button class="btn small" data-drillsys="${x.id}">${icon("play")} Driller</button><button class="btn ghost small" data-editsys="${x.id}">Modifier</button></div></details>`).join("")}</div>` : ""}
      <button class="btn ghost block" data-newsys style="margin-top:10px">${icon("plus")} Créer un système</button>
    </section>

    <h2 class="h-sec">Étudier le combat</h2>
    <section class="panel" style="padding:4px 16px">
      <ul class="list">${MODULES.map((m) => `<li role="button" tabindex="0" data-mod="${m.id}"><div><div style="font-weight:700">${esc(m.title)}</div><div class="meta">${esc(m.text)}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>
    </section>

    ${sync.role() === "coach" ? `<h2 class="h-sec">Ma formation vidéo</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Certification Luta Livre de Nicolas Renier : les 85 vidéos rangées par module, avec tes notes. Visible par toi seul.</p>
      <button class="btn tape-btn block" data-library>${icon("play")} Ouvrir la formation</button>
    </section>` : ""}

    <h2 class="h-sec">Préparer un adversaire</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:8px">Fiche d'analyse et game plan : garde, attaques favorites, réactions sous pression, plan A et plan B.</p>
      ${scouts.length ? `<ul class="list">${scouts.map((s) => `<li role="button" tabindex="0" data-scout="${s.id}"><div><div style="font-weight:700">${esc(s.opponent || "Adversaire")}</div><div class="meta">${s.date ? "Combat le " + esc(frDate(s.date, { day: "numeric", month: "long" })) : "Sans date"}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>` : ""}
      <button class="btn ghost block" data-newscout style="margin-top:10px">${icon("plus")} Nouvelle fiche adversaire</button>
    </section>
  `;

  el.querySelector("[data-newcombo]").addEventListener("click", () => editCombo(null, ctx.refresh));
  el.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editCombo(combos.find((c) => c.id === b.dataset.edit), ctx.refresh)));
  el.querySelectorAll("[data-drill]").forEach((b) => b.addEventListener("click", () => drillCombo(combos.find((c) => c.id === b.dataset.drill))));
  el.querySelectorAll("[data-mod]").forEach((li) => li.addEventListener("click", () => openModule(li.dataset.mod, ctx)));
  el.querySelector("[data-explore]").addEventListener("click", () => openExplorer(null, ctx.refresh));
  el.querySelector("[data-newsys]").addEventListener("click", () => editSystem(null, ctx.refresh, { root: "double", type: "off" }));
  el.querySelectorAll("[data-editsys]").forEach((b) => b.addEventListener("click", () => editSystem(systems.find((x) => x.id === b.dataset.editsys), ctx.refresh)));
  el.querySelectorAll("[data-drillsys]").forEach((b) => b.addEventListener("click", () => drillSystem(systems.find((x) => x.id === b.dataset.drillsys))));
  el.querySelector("[data-library]")?.addEventListener("click", openLibrary);
  el.querySelector("[data-newscout]").addEventListener("click", () => editScout(null, ctx.refresh));
  el.querySelectorAll("[data-scout]").forEach((li) => li.addEventListener("click", () => editScout(scouts.find((s) => s.id === li.dataset.scout), ctx.refresh)));
}

// ---------- combos ----------
function drillCombo(c) {
  runTimer({ work: 30, rest: 30, rounds: 6, title: c.name, names: [c.seq.map(moveName).join(", ")] });
}

function editCombo(existing, after, preset) {
  const c = existing ? { ...existing, seq: [...existing.seq] } : { id: uid(), name: preset?.name || "", seq: preset?.seq ? [...preset.seq] : [], when: "", zone: preset?.zone || "Distance", createdAt: todayKey() };
  const body = openSheet(existing ? "Modifier le combo" : "Noter un combo", `
    <form data-combo class="stack">
      <label class="field"><span>Nom</span><input class="input" name="name" value="${esc(c.name)}" placeholder="Ex. Mon entrée en double-leg"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Enchaînement</span>
        <div class="panel" data-seqbox style="min-height:56px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px"></div>
        <p class="hint">Touche les coups dans l'ordre. 1 jab · 2 direct · 3 crochet avant · 4 crochet arrière · 5 et 6 uppercuts.</p>
        <div class="chips" style="margin-top:8px">${MOVES.map((m) => `<button type="button" class="chip" data-move="${m.id}" title="${esc(m.name)}">${esc(m.label)}</button>`).join("")}</div>
      </div>
      <label class="field"><span>Zone</span><select class="input" name="zone">${["Distance", "Distance → sol", "Clinch", "Clinch → sol", "Sol", "Défense"].map((z) => `<option ${z === c.zone ? "selected" : ""}>${z}</option>`).join("")}</select></label>
      <label class="field"><span>Quand je l'utilise</span><textarea class="input" name="when" rows="2" placeholder="Ex. Quand il recule en ligne droite">${esc(c.when)}</textarea></label>
      <button class="btn tape-btn block">Enregistrer</button>
      ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce combo</button>` : ""}
    </form>`);
  const box = body.querySelector("[data-seqbox]");
  const draw = () => {
    box.innerHTML = c.seq.length ? `${seqHtml(c.seq)}<button type="button" class="icon-btn" data-undo aria-label="Retirer le dernier coup">${icon("back")}</button>` : `<span class="muted small">Aucun coup pour l'instant</span>`;
    box.querySelector("[data-undo]")?.addEventListener("click", () => { c.seq.pop(); draw(); });
  };
  draw();
  const form = body.querySelector("[data-combo]");
  form.addEventListener("click", (e) => {
    const m = e.target.closest("[data-move]"); if (m) { c.seq.push(m.dataset.move); draw(); }
    const d = e.target.closest("[data-del]");
    if (d) {
      if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; }
      store.update((s) => { s.combos = (s.combos || []).filter((x) => x.id !== c.id); }); closeSheet(); toast("Combo supprimé"); after();
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    c.name = form.name.value.trim() || c.seq.map(moveLabel).join("-") || "Mon combo";
    c.when = form.when.value.trim(); c.zone = form.zone.value;
    if (!c.seq.length) return toast("Ajoute au moins un coup");
    store.update((s) => { s.combos = [...(s.combos || []).filter((x) => x.id !== c.id), c]; });
    closeSheet(); toast("Combo enregistré"); after();
  });
}

// ---------- modules ----------
function openModule(id, ctx) {
  if (id === "zones") return openSheet("Les zones du combat", ZONES.map((z) => `
    <section class="panel" style="margin-bottom:12px">
      <h3 class="display" style="font-size:24px">${esc(z.title)}</h3>
      <p class="small" style="margin-top:6px">${esc(z.lead)}</p>
      ${z.ranges.map((r) => `<p class="small"><b>${esc(r.name)}</b> : ${esc(r.text)}</p>`).join("")}
      <div class="grid2 zone-grid" style="margin-top:8px">
        <div><div class="tiny muted">Objectifs</div><ul class="bul">${z.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
        <div><div class="tiny muted">Techniques clés</div><ul class="bul">${z.keys.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
      </div>
      <div class="notice is-alert small" style="margin-top:10px"><b>Dangers</b> : ${z.dangers.map(esc).join(" · ")}</div>
    </section>`).join(""));

  if (id === "stances") return openSheet("Gardes et attitudes", STANCES.map((s) => `
    <section class="panel" style="margin-bottom:10px"><h3>${esc(s.name)}</h3><p class="small" style="margin:6px 0">${esc(s.text)}</p><p class="tiny muted" style="margin:0">À retenir : ${esc(s.tip)}</p></section>`).join(""));

  if (id === "profiles") return openSheet("Les profils de combattants", `
    <p class="muted small">Regroupement automatique de 1 073 combattants UFC selon leur façon de combattre (analyse Fight Art Performance). Des tendances, pas des règles.</p>
    ${PROFILES.map((p) => `<section class="panel" style="margin-top:10px"><h3>${esc(p.name)}</h3><p class="small" style="margin:6px 0">${esc(p.how)}</p><p class="tiny muted">Gabarit : ${esc(p.body)}</p><p class="small" style="margin:0"><b>Pour le battre</b> : ${esc(p.beat)}</p></section>`).join("")}`);

  if (id === "combos") {
    const body = openSheet("Combinaisons classiques", `
      <p class="muted small">Touche « Ajouter à mes combos » pour l'enregistrer et la driller.</p>
      ${CLASSIC_COMBOS.map((c, i) => `<section class="panel" style="margin-top:10px">
        <div class="row between" style="align-items:flex-start"><div><h3>${esc(c.name)}</h3><div style="margin-top:6px">${seqHtml(c.seq)}</div></div><span class="badge tiny">${esc(c.zone)}</span></div>
        <p class="small" style="margin:10px 0 4px"><b>Ce qu'il ouvre</b> : ${esc(c.opens)}</p>
        <p class="small" style="margin:0 0 4px"><b>Ce qu'il expose</b> : ${esc(c.exposes)}</p>
        <p class="tiny muted">${esc(c.tip)}</p>
        <button class="btn ghost small" data-take="${i}">${icon("plus")} Ajouter à mes combos</button></section>`).join("")}`);
    body.addEventListener("click", (e) => { const b = e.target.closest("[data-take]"); if (b) editCombo(null, ctx.refresh, CLASSIC_COMBOS[b.dataset.take]); });
    return;
  }

  if (id === "luta") return openLuta();
  if (id === "arts") return openSheet("Les arts du MMA", ARTS.map((a) => `
    <section class="panel" style="margin-bottom:10px"><h3>${esc(a.name)}</h3><p class="small" style="margin:6px 0"><b>Ce qu'il apporte</b> : ${esc(a.brings)}</p><p class="small" style="margin:0"><b>À adapter au MMA</b> : ${esc(a.adapt)}</p></section>`).join(""));
}

// ---------- Luta Livre ----------
function openLuta() {
  openSheet("Luta Livre", `
    <p class="small">${esc(LUTA_INTRO)}</p>
    <details class="sys-card" open><summary><b>Structure d'un cours</b></summary>
      <p class="tiny muted">${esc(LESSON.intro)}</p>
      <ol class="plan">${LESSON.steps.map((x) => `<li><div><b>${esc(x.name)}</b> <span class="tiny muted">· ${x.min} min</span><div class="small">${esc(x.text)}</div></div></li>`).join("")}</ol>
    </details>
    <details class="sys-card"><summary><b>Programme des ceintures</b></summary>
      ${GRADES.map((g) => `<div style="margin-top:10px"><div class="row" style="gap:8px"><span style="width:28px;height:8px;border-radius:4px;background:${g.color};display:inline-block"></span><b>${esc(g.name)}</b></div><ul class="bul">${g.themes.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}
    </details>
    ${CYCLES.map((c) => `<details class="sys-card"><summary><b>${esc(c.name)}</b><span class="tiny muted" style="display:block">${c.weeks} semaines</span></summary>
      <p class="small">${esc(c.text)}</p>
      ${c.plan.map((w) => `<div class="panel" style="padding:12px;margin-top:8px"><div class="tiny muted">Semaine ${w.week}</div><b>${esc(w.theme)}</b>
        <ul class="bul">${w.drills.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        <p class="small" style="margin:6px 0 0"><b>Sparring à thème</b> : ${esc(w.spar)}</p></div>`).join("")}
    </details>`).join("")}
    <details class="sys-card"><summary><b>Vocabulaire</b></summary>
      ${GLOSSARY.map((g) => `<p class="small" style="margin:8px 0"><b>${esc(g.term)}</b> : ${esc(g.def)}</p>`).join("")}
    </details>
    <p class="hint">Les clés de jambes de la Luta Livre (one leg, 50/50, K-guard, false reap) sont dans « Risques et ouvertures des techniques ». La clé de talon est réservée aux adultes avancés.</p>`);
}

// ---------- formation vidéo du coach (privée, chargée depuis la base) ----------
async function openLibrary() {
  const body = openSheet("Ma formation vidéo", `<p class="muted small">Chargement…</p>`);
  let rows = [];
  try { rows = window.FAP_PREVIEW ? [] : await sync.library(); }
  catch { body.innerHTML = `<p class="notice is-warn small">Impossible de charger la formation. Vérifie ta connexion.</p>`; return; }
  if (!rows.length) { body.innerHTML = `<p class="muted small">${window.FAP_PREVIEW ? "Dans l'aperçu, la formation n'est pas chargée : elle s'affiche dans l'appli du coach." : "Aucune vidéo pour l'instant."}</p>`; return; }
  const mods = [];
  rows.forEach((r) => { let m = mods.find((x) => x.no === r.module_no); if (!m) mods.push(m = { no: r.module_no, title: r.module_title, items: [] }); m.items.push(r); });
  const notes = store.get().libNotes || {};
  body.innerHTML = `<p class="muted small">${esc(rows[0].source || "")}. Note ce que tu retiens de chaque vidéo : tes notes sont sauvegardées et suivent ton compte sur tous tes appareils.</p>
    ${mods.map((m) => `<details class="sys-card"><summary><b>Module ${m.no}</b><span class="tiny muted" style="display:block">${esc(m.title)} · ${m.items.length} vidéo${m.items.length > 1 ? "s" : ""}${m.items.some((i) => notes[i.url]) ? " · notes" : ""}</span></summary>
      ${m.items.map((i) => `<div style="padding:10px 0;border-top:1px solid var(--line)">
        <div class="row between" style="gap:8px"><span class="small"><b>${i.position}.</b> ${esc(i.title)}</span><a class="btn small" href="${esc(i.url)}" target="_blank" rel="noopener">${icon("play")} Voir</a></div>
        <textarea class="input" rows="2" data-note="${esc(i.url)}" placeholder="Ce que je retiens…" style="margin-top:8px">${esc(notes[i.url] || "")}</textarea>
      </div>`).join("")}
    </details>`).join("")}`;
  let t;
  body.addEventListener("input", (e) => {
    const ta = e.target.closest("[data-note]"); if (!ta) return;
    clearTimeout(t); t = setTimeout(() => store.update((st) => { st.libNotes = { ...(st.libNotes || {}), [ta.dataset.note]: ta.value.trim() }; if (!st.libNotes[ta.dataset.note]) delete st.libNotes[ta.dataset.note]; }), 600);
  });
}

// ---------- fiche adversaire + game plan ----------
function editScout(existing, after) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), opponent: "", date: "", fields: {}, plan: {} };
  const field = (group, f) => `<label class="field"><span>${esc(f.label)}</span><textarea class="input" rows="2" data-g="${group}" name="${f.id}" placeholder="${esc(f.hint)}">${esc(s[group][f.id] || "")}</textarea></label>`;
  const body = openSheet(existing ? s.opponent || "Fiche adversaire" : "Nouvelle fiche", `
    <form data-scoutf class="stack">
      <div class="grid2"><label class="field"><span>Adversaire</span><input class="input" name="opponent" value="${esc(s.opponent)}"></label>
      <label class="field"><span>Date du combat</span><input class="input" type="date" name="date" value="${esc(s.date)}"></label></div>
      <h3 class="h-sec" style="font-size:20px;margin-top:10px">Analyse</h3>
      <p class="hint" style="margin-top:-6px">Regarde 2 ou 3 de ses combats si possible. Observe son buste et sa tête plutôt que ses mains.</p>
      ${SCOUT_FIELDS.map((f) => field("fields", f)).join("")}
      <h3 class="h-sec" style="font-size:20px;margin-top:10px">Game plan</h3>
      ${PLAN_FIELDS.map((f) => field("plan", f)).join("")}
      <button class="btn tape-btn block">Enregistrer la fiche</button>
      ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer la fiche</button>` : ""}
    </form>`);
  const form = body.querySelector("[data-scoutf]");
  form.addEventListener("click", (e) => {
    const d = e.target.closest("[data-del]"); if (!d) return;
    if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; }
    store.update((st) => { st.scouting = (st.scouting || []).filter((x) => x.id !== s.id); }); closeSheet(); toast("Fiche supprimée"); after();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    s.opponent = form.opponent.value.trim(); s.date = form.date.value;
    form.querySelectorAll("textarea[data-g]").forEach((t) => { s[t.dataset.g][t.name] = t.value.trim(); });
    store.update((st) => { st.scouting = [...(st.scouting || []).filter((x) => x.id !== s.id), s]; });
    closeSheet(); toast("Fiche enregistrée"); after();
  });
}
