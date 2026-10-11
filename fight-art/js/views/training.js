import { store, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet } from "../ui.js";
import { weekPlan, dayPlan, fmt, isMinor } from "../engine.js";
import { DRILL_GROUPS, DRILL_FORMATS, STRENGTH, LEVELS, DAYS } from "../data.js";
import { runTimer } from "./timer.js";
import { openBlock, openLog } from "./sessions.js";

const LEVEL_PRIORITIES = {
  1: ["Chutes et relevé technique", "Garde et déplacements", "Jab, direct, défense de base", "Sprawl, double-leg, single-leg", "Positions : montée, contrôle latéral, dos, garde", "Sorties : shrimp et pont", "Étranglement arrière et guillotine"],
  2: ["Enchaînements poings et low kicks", "Blocage des low kicks", "Clinch et lutte contre la cage", "Lutte en chaîne", "Passages de garde genou devant", "Ground and pound du dessus", "Se relever du dessous", "Arm-triangle, clé de bras du dessus, d'arce"],
  3: ["Choisir un axe de style (voir Progrès › Gabarit)", "Modules distance et contres, ou pression et contrôle", "Analyse vidéo de tes propres combats", "Sparring à thème selon ton style"],
  4: ["Fiche adversaire et game plan", "Plan A et plan B", "Scénarios du premier round", "Affûtage et gestion du poids encadrée"],
};

export function renderTraining(el, ctx) {
  const st = store.get();
  const p = st.profile;
  const key = todayKey();
  const week = weekPlan(p, key);
  const plan = dayPlan(p, key, st);
  const strength = plan.blocks.find((b) => b.type === "strength");
  const lv = LEVELS.find((l) => l.id === p.level) || LEVELS[0];
  const lifts = Object.entries(st.lifts || {});
  const allEx = Object.values(STRENGTH).flatMap((s) => [...s.gym, ...s.home]);

  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 14px">Entraînement</h1>
    <div class="week" role="list">${week.map((d) => `<div class="day ${d.today ? "today" : ""}" role="listitem"><b>${DAYS[d.i]}</b>${d.parts.map((x) => `<span class="k">${esc(x)}</span>`).join("")}</div>`).join("")}</div>
    <p class="hint">Force : lourd, rapide, volume. Modifie tes jours dans ton profil.</p>

    ${strength ? `<section class="panel row between" style="margin-top:14px"><div><div style="font-weight:700">${esc(strength.title)}</div><div class="muted small">${esc(strength.detail)}</div></div><button class="btn small" data-strength>Ouvrir</button></section>` : ""}

    <h2 class="h-sec">Minuteur de rounds</h2>
    <div class="chips">${DRILL_FORMATS.map((f) => `<button class="chip" data-timer="${f.id}">${esc(f.label)}</button>`).join("")}</div>

    <h2 class="h-sec">Drills solo</h2>
    <p class="muted small">Choisis un thème, l'appli enchaîne les drills round par round en 30/30. Qualité avant vitesse.</p>
    <div class="stack" style="margin-top:10px">${DRILL_GROUPS.map((g) => `
      <section class="panel">
        <div class="row between"><h3>${esc(g.title)}</h3><button class="btn small tape-btn" data-run="${g.id}">${icon("play")} Lancer</button></div>
        <details style="margin-top:8px"><summary class="small muted" style="cursor:pointer">${g.drills.length} drills · voir le détail</summary>
          <ul class="list" style="margin-top:6px">${g.drills.map((d) => `<li><div><div style="font-weight:650">${esc(d.name)}</div><div class="meta">${esc(d.how)}</div></div></li>`).join("")}</ul>
        </details>
      </section>`).join("")}</div>

    <h2 class="h-sec">Ta progression : ${esc(lv.label)}</h2>
    <section class="panel"><p class="muted small">Les priorités de ton niveau, tirées des données de combat. Travaille-les en drills solo et au club.</p>
      <ol class="plan" style="margin-top:6px">${(LEVEL_PRIORITIES[p.level] || LEVEL_PRIORITIES[1]).map((t) => `<li class="plan-item"><div class="t">${esc(t)}</div><span></span></li>`).join("")}</ol>
    </section>

    ${lifts.length && !isMinor(p) ? `<h2 class="h-sec">Tes charges</h2><section class="panel"><ul class="list">${lifts.map(([id, l]) => {
      const ex = allEx.find((e) => e.id === id);
      return `<li><div><div style="font-weight:650">${esc(ex?.name || id)}</div><div class="meta">${l.allDone ? "Toutes les séries réussies : +" + (ex?.inc || 0) + " kg la prochaine fois" : "On garde la charge"}</div></div><div class="right"><b>${fmt(l.kg, 1)} kg</b>${l.e1rm ? `<div class="meta">max estimé ${fmt(l.e1rm)} kg</div>` : ""}</div></li>`;
    }).join("")}</ul></section>` : ""}
  `;

  el.querySelector("[data-strength]")?.addEventListener("click", () => openBlock(key, strength, ctx.refresh, ctx.go));
  el.querySelectorAll("[data-timer]").forEach((b) => b.addEventListener("click", () => {
    const f = DRILL_FORMATS.find((x) => x.id === b.dataset.timer);
    runTimer({ ...f, title: f.label });
  }));
  el.querySelectorAll("[data-run]").forEach((b) => b.addEventListener("click", () => {
    const g = DRILL_GROUPS.find((x) => x.id === b.dataset.run);
    chooseFormat(g, (f) => runTimer({ work: f.work, rest: f.rest, rounds: f.rounds, names: g.drills.map((d) => d.name), title: g.title,
      onDone: () => setTimeout(() => openLog(key, { id: "drills", type: "drills", title: `Drills · ${g.title}`, minutes: Math.round(f.rounds * (f.work + f.rest) / 60) }, ctx.refresh), 600) }));
  }));
}

function chooseFormat(g, go) {
  const body = openSheet(g.title, `
    <p class="muted">Choisis le format. Les drills s'enchaînent round après round.</p>
    <div class="stack" style="margin-top:10px">${DRILL_FORMATS.filter((f) => f.work <= 60).map((f) => `<button class="btn ghost block" data-f="${f.id}" style="justify-content:space-between"><span>${esc(f.label)}</span><span class="muted small">${esc(f.hint)} · ${f.rounds} rounds</span></button>`).join("")}</div>`);
  body.addEventListener("click", (e) => { const b = e.target.closest("[data-f]"); if (b) { closeSheet(); go(DRILL_FORMATS.find((x) => x.id === b.dataset.f)); } });
}
