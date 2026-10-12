// Le combat comme une discussion : combinaisons (questions), réactions (failles), armes décisives.
import { store } from "../store.js";
import { esc, icon, openSheet } from "../ui.js";
import { isMinor } from "../engine.js";
import { MOVES } from "../academy-data.js";
import { DISCUSSION_INTRO, REACTIONS, WEAPONS, QUESTIONS, reaction, weapon, weaponsFor, reactionsFor, questionsFor } from "../discussion-data.js";
import { runTimer } from "./timer.js";

const label = (id) => MOVES.find((m) => m.id === id)?.label || id;
const seqHtml = (seq) => `<span class="seq">${seq.map((m) => `<span class="mv">${esc(label(m))}</span>`).join("")}</span>`;
const chev = icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"');
const levelBadge = (w) => `<span class="badge tiny${w.level === "Avancé" ? " lvl-adv" : ""}">${esc(w.level)}</span>`;

// onTrap(preset) : enregistre une combinaison + arme dans « Mes combos fétiches »
export function openDiscussion(start = { tab: "questions" }, onTrap) {
  const minor = isMinor(store.get().profile);
  let view = start; const history = [];
  const body = openSheet("Le combat comme une discussion", "");
  const go = (v) => { history.push(view); view = v; draw(); body.closest(".sheet").scrollTop = 0; };

  const trapBtn = (q, r, w) => `<button class="btn ghost small" data-trap="${QUESTIONS.indexOf(q)}|${r.id}|${w.id}">${icon("plus")} Ajouter ce piège à mes combos</button>`;

  const tabs = () => `<div class="chips" style="margin-bottom:12px">
    ${[["questions", "Combinaisons"], ["reactions", "Réactions"], ["weapons", "Armes décisives"]].map(([id, l]) => `<button class="chip" data-dtab="${id}" aria-pressed="${view.tab === id}">${l}</button>`).join("")}</div>`;

  const draw = () => {
    const back = history.length ? `<div class="row" style="margin-bottom:6px"><button class="icon-btn" data-back aria-label="Retour">${icon("back")}</button></div>` : "";
    if (view.tab) {
      let list = "";
      if (view.tab === "questions") list = `<p class="muted small">Chaque combinaison pose une question à l'adversaire. Touche-en une pour voir les réponses possibles et l'arme à placer.</p>
        <ul class="list">${QUESTIONS.map((q, i) => `<li role="button" tabindex="0" data-q="${i}"><div style="min-width:0"><div style="font-weight:700">${esc(q.name)}</div>${seqHtml(q.seq)}<div class="meta" style="margin-top:4px">${esc(q.asks)}</div></div>${chev}</li>`).join("")}</ul>`;
      if (view.tab === "reactions") list = `<p class="muted small">Ce que l'adversaire fait, la faille que ça ouvre, et comment l'exploiter.</p>
        <ul class="list">${REACTIONS.map((r) => `<li role="button" tabindex="0" data-r="${r.id}"><div style="min-width:0"><div style="font-weight:700">${esc(r.name)}</div><div class="meta">${esc(weaponsFor(r.id).map((w) => w.name).join(" · "))}</div></div>${chev}</li>`).join("")}</ul>`;
      if (view.tab === "weapons") list = `<p class="muted small">Les coups qui finissent un combat quand ils tombent dans la bonne faille. Pour chacun : quand, pourquoi, ce que tu risques.</p>
        <ul class="list">${WEAPONS.map((w) => `<li role="button" tabindex="0" data-w="${w.id}"><div style="min-width:0"><div style="font-weight:700">${esc(w.name)}</div><div class="meta">${levelBadge(w)} ${esc(w.ufc)}</div></div>${chev}</li>`).join("")}</ul>`;
      body.innerHTML = `${view.tab === "questions" && !history.length ? `<section class="panel" style="margin-bottom:12px">
          <p class="small" style="margin:0 0 8px">${esc(DISCUSSION_INTRO.lead)}</p>
          <ol class="steps-mini">${DISCUSSION_INTRO.method.map((m) => `<li class="small">${esc(m)}</li>`).join("")}</ol>
          <details style="margin-top:8px"><summary class="small" style="font-weight:700">Ce que disent les chiffres</summary><ul class="bul">${DISCUSSION_INTRO.facts.map((f) => `<li class="small">${esc(f)}</li>`).join("")}</ul></details>
        </section>` : ""}${back}${tabs()}${list}`;
      return;
    }

    if (view.q !== undefined) {
      const q = QUESTIONS[view.q];
      body.innerHTML = `${back}
        <span class="badge tiny">${esc(q.zone)}</span>
        <h3 class="display" style="font-size:28px;margin-top:6px">${esc(q.name)}</h3>
        <div style="margin-top:6px">${seqHtml(q.seq)}</div>
        <p class="small" style="margin-top:10px"><b>La question</b> : ${esc(q.asks)}</p>
        ${q.provokes.map((rid) => { const r = reaction(rid); return `<section class="panel" style="margin-top:10px">
          <div class="node them" style="margin:0 0 8px">S'il <b>${esc(r.short)}</b></div>
          <p class="small" style="margin:0 0 8px"><b>La faille</b> : ${esc(r.gap)}</p>
          ${weaponsFor(rid).map((w) => `<div style="padding:8px 0;border-top:1px solid var(--line)">
            <div class="row between" style="gap:8px"><button class="link" data-w="${w.id}" style="font-weight:700;text-align:left">${esc(w.name)}</button>${levelBadge(w)}</div>
            <div style="margin:6px 0">${seqHtml([...q.seq, w.move])}</div>
            ${trapBtn(q, r, w)}
          </div>`).join("")}
        </section>`; }).join("")}
        <button class="btn tape-btn block" data-drillq="${view.q}" style="margin-top:14px">${icon("play")} Driller la discussion</button>
        <p class="hint">Avec un partenaire : il choisit une réaction au hasard après ta combinaison, tu places l'arme qui l'exploite. En solo : le minuteur annonce la réaction.</p>`;
      return;
    }

    if (view.r) {
      const r = reaction(view.r);
      body.innerHTML = `${back}
        <h3 class="display" style="font-size:28px">${esc(r.name)}</h3>
        <p class="small" style="margin-top:8px"><b>La faille</b> : ${esc(r.gap)}</p>
        <h4 class="sys-h">Les combinaisons qui la provoquent</h4>
        <div class="chips">${questionsFor(r.id).map((q) => `<button class="chip" data-q="${QUESTIONS.indexOf(q)}">${esc(q.name)}</button>`).join("")}</div>
        <h4 class="sys-h">Les armes qui l'exploitent</h4>
        ${weaponsFor(r.id).map((w) => `<section class="panel" style="margin-top:8px;padding:12px">
          <div class="row between" style="gap:8px"><button class="link" data-w="${w.id}" style="font-weight:700;text-align:left">${esc(w.name)}</button>${levelBadge(w)}</div>
          <p class="small" style="margin:6px 0 0">${esc(w.why)}</p></section>`).join("")}`;
      return;
    }

    if (view.w) {
      const w = weapon(view.w);
      const rs = reactionsFor(w.id);
      const traps = rs.flatMap((r) => questionsFor(r.id).slice(0, 1).map((q) => [q, r]));
      body.innerHTML = `${back}
        ${levelBadge(w)}
        <h3 class="display" style="font-size:28px;margin-top:6px">${esc(w.name)}</h3>
        <p class="tiny muted" style="margin-top:4px">${esc(w.ufc)}</p>
        <h4 class="sys-h">Quand l'utiliser</h4><p class="small">${esc(w.when)}</p>
        <h4 class="sys-h">Pourquoi ça marche</h4><p class="small">${esc(w.why)}</p>
        <h4 class="sys-h">Comment le placer</h4><p class="small">${esc(w.setup)}</p>
        <div class="notice is-alert small" style="margin-top:12px"><b>Ce que tu risques</b><ul class="bul" style="margin-top:6px">${w.risk.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>
        ${minor ? `<p class="notice is-warn small" style="margin-top:10px">Pour toi : à travailler sur pao ou au sac uniquement. En sparring, pas de coups à la tête${w.level === "Avancé" ? ", ni de techniques retournées ou sautées" : ""}.</p>` : w.level === "Avancé" ? `<p class="notice small" style="margin-top:10px">Technique avancée : pao et sac d'abord, puis sparring technique à faible intensité avec un partenaire prévenu.</p>` : ""}
        <h4 class="sys-h">Les failles qu'elle exploite</h4>
        <div class="chips">${rs.map((r) => `<button class="chip" data-r="${r.id}">${esc(r.name)}</button>`).join("")}</div>
        <h4 class="sys-h">Pièges prêts à l'emploi</h4>
        <div class="stack">${traps.map(([q, r]) => `<div class="panel" style="padding:12px"><div class="tiny muted">S'il ${esc(r.short)}</div><div style="margin:6px 0">${seqHtml([...q.seq, w.move])}</div>${trapBtn(q, r, w)}</div>`).join("")}</div>`;
    }
  };

  body.addEventListener("click", (e) => {
    const t = e.target.closest("[data-dtab]"); if (t) { view = { tab: t.dataset.dtab }; draw(); return; }
    if (e.target.closest("[data-back]")) { view = history.pop() || { tab: "questions" }; draw(); return; }
    const tr = e.target.closest("[data-trap]");
    if (tr) {
      const [qi, rid, wid] = tr.dataset.trap.split("|"); const q = QUESTIONS[qi], r = reaction(rid), w = weapon(wid);
      onTrap?.({ name: `${q.name} → ${w.name}`, seq: [...q.seq, w.move], zone: q.zone.includes("lin") ? "Clinch" : "Distance", when: `S'il ${r.short}` });
      return;
    }
    const dq = e.target.closest("[data-drillq]");
    if (dq) {
      const q = QUESTIONS[dq.dataset.drillq];
      const names = q.provokes.flatMap((rid) => weaponsFor(rid).slice(0, 2).map((w) => `${q.name} · s'il ${reaction(rid).short} → ${w.name.toLowerCase()}`));
      runTimer({ work: 30, rest: 30, rounds: Math.max(6, names.length), title: q.name, names });
      return;
    }
    const q = e.target.closest("[data-q]"); if (q) return go({ q: Number(q.dataset.q) });
    const r = e.target.closest("[data-r]"); if (r) return go({ r: r.dataset.r });
    const w = e.target.closest("[data-w]"); if (w) return go({ w: w.dataset.w });
  });
  draw();
}
