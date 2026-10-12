import { store, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, segBar, bindSeg } from "../ui.js";
import { weekPlan, dayPlan, fmt, isMinor } from "../engine.js";
import { DRILL_GROUPS, DRILL_FORMATS, STRENGTH, LEVELS, DAYS } from "../data.js";
import { runTimer } from "./timer.js";
import { openBlock, openLog } from "./sessions.js";
import { guideInline } from "../drill-guides.js";
import { EX, PREHAB, scPhase } from "../sc-data.js";
import { openPrehab } from "./sessions.js";
import { computeQualities, PRIORITY_TEXT } from "../qualities.js";
import { openPlanning, seasonCard } from "./planning.js";
import { cachedSeason, loadSeason } from "../season.js";
import { openVideoCoach } from "./video.js";

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
  const zonesMine = [...new Set([...(p.injuries || []), ...((st.checkins[key]?.pain && st.checkins[key].painZones) || [])])];

  const chargesHtml = `<h2 class="h-sec">Tes charges</h2><section class="panel"><ul class="list">${lifts.map(([id, l]) => {
      const ex = { ...EX[id], inc: EX[id]?.inc };
      return `<li><div><div style="font-weight:650">${esc(ex?.name || id)}</div><div class="meta">${l.allDone ? "Toutes les séries réussies : +" + (ex?.inc || 0) + " kg la prochaine fois" : "On garde la charge"}</div></div><div class="right"><b>${fmt(l.kg, 1)} kg</b>${l.e1rm ? `<div class="meta">max estimé ${fmt(l.e1rm)} kg</div>` : ""}</div></li>`;
    }).join("")}</ul></section>`;
  const seg = segBar("seances", [["club", "Club"], ["prepa", "Prépa physique"], ["tech", "Technique"]], "club");
  const seasonCardT = seasonCard(key, p);
  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 10px">Séances</h1>
    ${seg.html}
    <div data-seg="club">
    <div class="week" role="list" style="margin-top:12px">${week.map((d) => `<div class="day ${d.today ? "today" : ""}" role="listitem"><b>${DAYS[d.i]}</b>${d.parts.map((x) => `<span class="k">${esc(x)}</span>`).join("")}</div>`).join("")}</div>
    <p class="hint">Force : lourd, rapide, volume. Modifie tes jours dans ton profil.</p>

    ${seasonCardT}
    <button class="panel row between" data-planning style="width:100%;text-align:left;margin-top:14px"><div><div style="font-weight:700">Planning du club</div><div class="muted small">Horaires, contenu des cours, programme de la saison et thème de la semaine</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</button>
    </div>
    <div data-seg="prepa">
    ${strength ? `<section class="panel row between" style="margin-top:14px"><div><div style="font-weight:700">${esc(strength.title)}</div><div class="muted small">${esc(strength.detail)}</div></div><button class="btn small" data-strength>Ouvrir</button></section>` : ""}


    <h2 class="h-sec">Prépa physique</h2>
    <section class="panel">
      <p class="small" style="margin:0 0 8px">Priorité à la force et à l'explosivité, pas à la musculation. Chaque séance : explosivité, force, spécifique MMA, et prévention ciblée si une zone est fragile. Les exercices qui sollicitent une zone douloureuse sont remplacés automatiquement.</p>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="badge tiny">Lourd : force maximale</span><span class="badge tiny">Rapide : puissance et vitesse</span><span class="badge tiny">Volume : une jambe, structure, prévention</span></div>
      <p class="tiny muted" style="margin:8px 0 0">Phase actuelle : ${esc(scPhase(p.competitionDate ? Math.round((new Date(p.competitionDate + "T12:00:00") - new Date(key + "T12:00:00")) / 86400000) : null).label)}${zonesMine.length ? ` · zones prises en compte : ${esc(zonesMine.join(", ").toLowerCase())}` : " · aucune zone fragile déclarée (profil)"}</p>
      ${(() => { const q = computeQualities(p, st); return `<h3 class="sys-h" style="margin-top:12px">Ton profil athlétique</h3>
        ${q.data ? `${q.strengths.length ? `<div class="small"><b>Points forts</b><ul class="bul">${q.strengths.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul></div>` : ""}${q.gaps.length ? `<div class="small" style="margin-top:6px"><b>À développer</b><ul class="bul">${q.gaps.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul></div>` : ""}${q.priority ? `<p class="notice small" style="margin-top:8px">${esc(PRIORITY_TEXT[q.priority])} Tes séances sont adaptées automatiquement.</p>` : ""}` : `<p class="muted small" style="margin:0">Fais les tests de l'onglet Progrès (saut vertical, tractions, rameur, squat) : l'appli repère tes qualités et tes lacunes et adapte tes séances.</p>`}
        ${q.notes.map((n) => `<p class="tiny muted" style="margin:6px 0 0">${esc(n)}</p>`).join("")}`; })()}
      <h3 class="sys-h" style="margin-top:12px">Zones à renforcer</h3>
      <div class="chips">${Object.keys(PREHAB).map((z) => `<button class="chip" data-prehab="${esc(z)}" aria-pressed="${zonesMine.includes(z)}">${esc(z)}</button>`).join("")}</div>
      <p class="hint">Touche une zone : son programme de renforcement, 10 à 15 minutes, avec les explications et les vidéos.</p>
    </section>

    ${lifts.length && !isMinor(p) ? chargesHtml : ""}
    </div>
    <div data-seg="tech">
    <button class="panel row between" data-videocoach style="width:100%;text-align:left;margin-top:14px"><div><div style="font-weight:700">Analyse vidéo de ta posture</div><div class="muted small">Garde, posture de lutte, technique : mesures automatiques et avis du coach perso</div></div>${icon("camera", 'style="width:22px;height:22px;flex:none"')}</button>
    <h2 class="h-sec">Minuteur de rounds</h2>
    <div class="chips">${DRILL_FORMATS.map((f) => `<button class="chip" data-timer="${f.id}">${esc(f.label)}</button>`).join("")}</div>

    <h2 class="h-sec">Drills solo</h2>
    <p class="muted small">Choisis un thème, l'appli enchaîne les drills round par round en 30/30. Qualité avant vitesse.</p>
    <div class="stack" style="margin-top:10px">${DRILL_GROUPS.map((g) => `
      <section class="panel">
        <div class="row between"><h3>${esc(g.title)}</h3><button class="btn small tape-btn" data-run="${g.id}">${icon("play")} Lancer</button></div>${g.note ? `<p class="tiny muted" style="margin:6px 0 0">${esc(g.note)}</p>` : ""}
        <details style="margin-top:8px"><summary class="small muted" style="cursor:pointer">${g.drills.length} drills · voir le détail et les vidéos</summary>
          <ul class="list" style="margin-top:6px">${g.drills.map((d) => `<li><div style="min-width:0;flex:1"><div style="font-weight:650">${esc(d.name)}</div><div class="meta">${esc(d.how)}</div>${guideInline(d.name)}</div></li>`).join("")}</ul>
        </details>
      </section>`).join("")}</div>

    <h2 class="h-sec">Ta progression : ${esc(lv.label)}</h2>
    <section class="panel"><p class="muted small">Les priorités de ton niveau, tirées des données de combat. Travaille-les en drills solo et au club.</p>
      <ol class="plan" style="margin-top:6px">${(LEVEL_PRIORITIES[p.level] || LEVEL_PRIORITIES[1]).map((t) => `<li class="plan-item"><div class="t">${esc(t)}</div><span></span></li>`).join("")}</ol>
    </section>

    </div>
  `;

  bindSeg(el, "seances", seg.cur);
  if (!cachedSeason()) loadSeason().then((x) => { if (x && el.isConnected) ctx.refresh(); });
  el.querySelector("[data-planning]").addEventListener("click", () => openPlanning());
  el.querySelector("[data-videocoach]").addEventListener("click", () => openVideoCoach(ctx.refresh));
  el.querySelectorAll("[data-prehab]").forEach((b) => b.addEventListener("click", () => openPrehab(b.dataset.prehab, ctx.refresh)));
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
