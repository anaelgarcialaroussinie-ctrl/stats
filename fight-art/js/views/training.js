import { store, todayKey, addDays, dayIndex } from "../store.js";
import { esc, icon, openSheet, closeSheet, segBar, bindSeg } from "../ui.js";
import { weekPlan, dayPlan, fmt, isMinor, strengthDays, frDate } from "../engine.js";
import { DRILL_GROUPS, DRILL_FORMATS, STRENGTH, LEVELS, DAYS, DAYS_LONG } from "../data.js";
import { runTimer } from "./timer.js";
import { openBlock, openLog } from "./sessions.js";
import { guideInline } from "../drill-guides.js";
import { EX, PREHAB, scPhase } from "../sc-data.js";
import { openPrehab } from "./sessions.js";
import { computeQualities, PRIORITY_TEXT } from "../qualities.js";
import { openPlanning, seasonCard } from "./planning.js";
import { cachedSeason, loadSeason } from "../season.js";
import { openVideoCoach } from "./video.js";
import { mobilityHtml, stretchHtml, healthHtml, bindBodycare } from "./bodycare.js";

const LEVEL_PRIORITIES = {
  1: ["Chutes et relevé technique", "Garde et déplacements", "Jab, direct, défense de base", "Sprawl, double-leg, single-leg", "Positions : montée, contrôle latéral, dos, garde", "Sorties : shrimp et pont", "Étranglement arrière et guillotine"],
  2: ["Enchaînements poings et low kicks", "Blocage des low kicks", "Clinch et lutte contre la cage", "Lutte en chaîne", "Passages de garde genou devant", "Ground and pound du dessus", "Se relever du dessous", "Arm-triangle, clé de bras du dessus, d'arce"],
  3: ["Choisir un axe de style (voir Progrès › Gabarit)", "Modules distance et contres, ou pression et contrôle", "Analyse vidéo de tes propres combats", "Sparring à thème selon ton style"],
  4: ["Fiche adversaire et game plan", "Plan A et plan B", "Scénarios du premier round", "Affûtage et gestion du poids encadrée"],
};

let scOffset = 0; // semaine affichée dans « Ma semaine de prépa » (0 = cette semaine)

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
  // les séances de prépa de la semaine, ouvrables n'importe quel jour
  const monday = addDays(addDays(key, -dayIndex(key)), 7 * scOffset);
  const scWeek = [...Array(7)].map((_, di) => { const k = addDays(monday, di); const b = dayPlan(p, k, st).blocks.find((x) => x.type === "strength" || x.type === "recovery"); return b ? { di, key: k, block: b } : null; }).filter(Boolean);
  const seg = segBar("seances", [["club", "Club"], ["prepa", "Prépa"], ["tech", "Technique"], ["mobilite", "Mobilité"], ["etirements", "Étirements"], ["sante", "Santé"]], "club");
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
    <h2 class="h-sec">Ma semaine de prépa</h2>
    <section class="panel">
      <div class="row between" style="margin-bottom:6px">
        <button class="icon-btn" data-scw="-1" aria-label="Semaine précédente">${icon("back")}</button>
        <b class="small">${scOffset === 0 ? "Cette semaine" : scOffset === 1 ? "Semaine prochaine" : scOffset === -1 ? "Semaine dernière" : `Semaine du ${esc(frDate(monday, { day: "numeric", month: "long" }))}`}</b>
        <button class="icon-btn" data-scw="1" aria-label="Semaine suivante" style="transform:scaleX(-1)">${icon("back")}</button>
      </div>
      ${scWeek.length ? `<ul class="list">${scWeek.map((x, i) => `<li><div style="min-width:0"><div style="font-weight:700">${esc(DAYS_LONG[x.di][0].toUpperCase() + DAYS_LONG[x.di].slice(1))}${x.key === key ? ` <span class="insigne">aujourd'hui</span>` : ""}</div><div class="meta">${esc(frDate(x.key, { day: "numeric", month: "short" }))} · ${esc(x.block.title.replace("Prépa physique · ", ""))} · ${esc(x.block.detail)}${st.sessions?.[x.key]?.done?.strength ? " · faite ✓" : ""}</div></div><button class="btn small" data-scopen="${i}" style="flex:none">Ouvrir</button></li>`).join("")}</ul>`
        : `<p class="muted small" style="margin:0">${p.competitionDate && strengthDays(p, key) && !Object.keys(strengthDays(p, key)).length ? "Dernière semaine avant ton combat : pas de séance de force, place à l'affûtage." : "Aucun jour de prépa choisi : coche tes jours ci-dessous."}</p>`}
      <h3 class="sys-h" style="margin-top:12px">Mon programme sur mesure</h3>
      <div class="tiny muted" style="margin-bottom:6px">Mes jours de prépa (1 jour : force · 2 jours : force + volume · 3 jours : force, vitesse, volume)</div>
      <div class="chips">${DAYS.map((d, i) => `<button type="button" class="chip" data-scday="${i}" aria-pressed="${(p.scDays || []).includes(i)}">${d}</button>`).join("")}</div>
      ${isMinor(p) ? `<p class="tiny muted" style="margin:8px 0 0">Version poids du corps (moins de 18 ans).</p>` : `<div class="tiny muted" style="margin:10px 0 6px">Où je m'entraîne</div><div class="chips"><button type="button" class="chip" data-scequip="gym" aria-pressed="${p.equipment !== "home"}">En salle</button><button type="button" class="chip" data-scequip="home" aria-pressed="${p.equipment === "home"}">À la maison</button></div>`}
      <p class="hint">Chaque séance s'adapte aussi à ton check-in du matin, à tes zones fragiles, à tes tests et à ta date de combat.</p>
    </section>


    <h2 class="h-sec">Prépa physique</h2>
    <section class="panel">
      <p class="small" style="margin:0 0 8px">Priorité à la force et à l'explosivité, pas à la musculation. Chaque séance : explosivité, force, spécifique MMA, et prévention ciblée si une zone est fragile. Les exercices qui sollicitent une zone douloureuse sont remplacés automatiquement.</p>
      <div class="row" style="gap:6px;flex-wrap:wrap"><span class="badge tiny">Lourd : force maximale</span><span class="badge tiny">Rapide : puissance et vitesse</span><span class="badge tiny">Volume : une jambe, structure, prévention</span></div>
      <p class="tiny muted" style="margin:8px 0 0">Phase actuelle : ${esc(scPhase(p.competitionDate ? Math.round((new Date(p.competitionDate + "T12:00:00") - new Date(key + "T12:00:00")) / 86400000) : null).label)}${zonesMine.length ? ` · zones prises en compte : ${esc(zonesMine.join(", ").toLowerCase())}` : " · aucune zone fragile déclarée (profil)"}</p>
      ${(() => { const q = computeQualities(p, st); return `<h3 class="sys-h" style="margin-top:12px">Ton profil athlétique</h3>
        ${q.data ? `${q.strengths.length ? `<div class="small"><b>Points forts</b><ul class="bul">${q.strengths.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul></div>` : ""}${q.gaps.length ? `<div class="small" style="margin-top:6px"><b>À développer</b><ul class="bul">${q.gaps.map((x) => `<li>${esc(x.text)}</li>`).join("")}</ul></div>` : ""}${q.priority ? `<p class="notice small" style="margin-top:8px">${esc(PRIORITY_TEXT[q.priority])} Tes séances sont adaptées automatiquement.</p>` : ""}` : `<p class="muted small" style="margin:0">Fais les tests de l'onglet Progrès (saut vertical, tractions, rameur, squat) : l'appli repère tes qualités et tes lacunes et adapte tes séances.</p>`}
        ${q.notes.map((n) => `<p class="tiny muted" style="margin:6px 0 0">${esc(n)}</p>`).join("")}`; })()}
      <button class="btn ghost small" data-gosante style="margin-top:12px">Renforcer mes zones fragiles : onglet Santé</button>
    </section>

    ${lifts.length && !isMinor(p) ? chargesHtml : ""}
    </div>
    <div data-seg="tech">
    <button class="panel row between" data-videocoach style="width:100%;text-align:left;margin-top:14px"><div><div style="font-weight:700">Analyse vidéo de ta posture</div><div class="muted small">Garde, posture de lutte, technique : mesures automatiques et avis du coach perso</div></div>${icon("camera", 'style="width:22px;height:22px;flex:none"')}</button>
    <h2 class="h-sec">Minuteur de rounds</h2>
    <div class="chips">${DRILL_FORMATS.map((f) => `<button class="chip" data-timer="${f.id}">${esc(f.label)}</button>`).join("")}</div>

    <h2 class="h-sec">Drills solo</h2>
    <p class="muted small">Choisis un thème, l'appli enchaîne les drills round par round en 30/30. Qualité avant vitesse.</p>
    <div class="stack" style="margin-top:10px">${DRILL_GROUPS.map((g, i) => `${g.section && DRILL_GROUPS[i - 1]?.section !== g.section ? `<h3 class="sys-h" style="margin:6px 0 0">${esc(g.section)}</h3>` : !g.section && DRILL_GROUPS[i - 1]?.section ? `<h3 class="sys-h" style="margin:6px 0 0">Autres disciplines</h3>` : ""}
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
    <div data-seg="mobilite">${mobilityHtml()}</div>
    <div data-seg="etirements">${stretchHtml()}</div>
    <div data-seg="sante">${healthHtml()}</div>
  `;

  bindSeg(el, "seances", seg.cur);
  bindBodycare(el, ctx);
  el.querySelector("[data-gosante]")?.addEventListener("click", () => el.querySelector('[data-seg-to="sante"]')?.click());
  if (!cachedSeason()) loadSeason().then((x) => { if (x && el.isConnected) ctx.refresh(); });
  el.querySelector("[data-planning]").addEventListener("click", () => openPlanning());
  el.querySelector("[data-videocoach]").addEventListener("click", () => openVideoCoach(ctx.refresh));
  el.querySelectorAll("[data-scw]").forEach((b) => b.addEventListener("click", () => { scOffset += Number(b.dataset.scw); ctx.refresh(); }));
  el.querySelectorAll("[data-scopen]").forEach((b) => b.addEventListener("click", () => { const x = scWeek[Number(b.dataset.scopen)]; openBlock(x.key, x.block, ctx.refresh, ctx.go); }));
  el.querySelectorAll("[data-scday]").forEach((b) => b.addEventListener("click", () => { const i = Number(b.dataset.scday); store.update((s2) => { const d = s2.profile.scDays || []; s2.profile.scDays = d.includes(i) ? d.filter((x) => x !== i) : [...d, i].sort(); }); ctx.refresh(); }));
  el.querySelectorAll("[data-scequip]").forEach((b) => b.addEventListener("click", () => { store.update((s2) => { s2.profile.equipment = b.dataset.scequip; }); ctx.refresh(); }));
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
