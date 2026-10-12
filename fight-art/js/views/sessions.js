// Feuilles de séance partagées : check-in, mobilité, force, séance club, RPE.
import { store, todayKey, uid } from "../store.js";
import { STRENGTH, MOBILITY, MOVEMENT, PAIN_ZONES } from "../data.js";
import { esc, icon, openSheet, closeSheet, toast, scale } from "../ui.js";
import { readiness, readinessAdvice, suggestedLoad, isMinor, fmt, brzycki } from "../engine.js";
import { guideInline } from "../drill-guides.js";

const ensureDay = (s, key) => (s.sessions[key] ||= { logs: [], done: {} });

export function markDone(key, blockId, log) {
  store.update((s) => {
    const day = ensureDay(s, key);
    day.done[blockId] = true;
    if (log) day.logs = [...day.logs.filter((l) => l.id !== blockId), { id: blockId, at: new Date().toISOString(), ...log }];
  });
}

// ---------- check-in ----------
export function openCheckin(key = todayKey(), after) {
  const prev = store.get().checkins[key];
  const c = prev ? { ...prev } : { sleepH: 7.5, sleepQ: 3, fatigue: 2, soreness: 2, mood: 4, pain: false, painZones: [], painLevel: 3, cycle: "" };
  const p = store.get().profile;
  const body = openSheet("Check-in du matin", `
    <form data-ci class="stack">
      <label class="field"><span>Heures de sommeil</span>
        <div class="row"><input class="input num" type="range" min="3" max="11" step="0.5" name="sleepH" value="${c.sleepH}" style="padding:0;min-height:36px"><b class="num" data-out="sleepH" style="min-width:52px;text-align:right">${fmt(c.sleepH, 1)} h</b></div></label>
      <div><span class="small" style="font-weight:600">Qualité du sommeil</span>${scale("sleepQ", c.sleepQ, "Très mauvaise", "Excellente")}</div>
      <div><span class="small" style="font-weight:600">Fatigue</span>${scale("fatigue", c.fatigue, "En pleine forme", "Épuisé")}</div>
      <div><span class="small" style="font-weight:600">Courbatures</span>${scale("soreness", c.soreness, "Aucune", "Très fortes")}</div>
      <div><span class="small" style="font-weight:600">Moral</span>${scale("mood", c.mood, "Très bas", "Au top")}</div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Une douleur ?</span>
        <div class="chips"><button type="button" class="chip" data-pain="0" aria-pressed="${!c.pain}">Non</button><button type="button" class="chip" data-pain="1" aria-pressed="${c.pain}">Oui</button></div></div>
      <div data-painbox ${c.pain ? "" : "hidden"} class="stack">
        <div class="chips">${PAIN_ZONES.map((z) => `<button type="button" class="chip" data-zone="${esc(z)}" aria-pressed="${c.painZones.includes(z)}">${esc(z)}</button>`).join("")}</div>
        <label class="field"><span>Intensité de la douleur : <b data-out="painLevel">${c.painLevel}</b> / 10</span><input type="range" min="1" max="10" name="painLevel" value="${c.painLevel}" style="width:100%"></label>
      </div>
      ${p?.sex === "F" && p?.trackCycle ? `<label class="field"><span>Cycle (facultatif)</span><select class="input" name="cycle"><option value="">Ne pas renseigner</option><option value="regles" ${c.cycle === "regles" ? "selected" : ""}>Règles</option><option value="autre" ${c.cycle === "autre" ? "selected" : ""}>Autre phase</option></select></label>` : ""}
      <button class="btn tape-btn block">Valider mon check-in</button>
    </form>`);
  const form = body.querySelector("[data-ci]");
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t.name === "sleepH") { c.sleepH = Number(t.value); form.querySelector('[data-out="sleepH"]').textContent = fmt(c.sleepH, 1) + " h"; }
    if (t.name === "painLevel") { c.painLevel = Number(t.value); form.querySelector('[data-out="painLevel"]').textContent = t.value; }
    if (t.name === "cycle") c.cycle = t.value;
  });
  form.addEventListener("click", (e) => {
    const b = e.target.closest("button[type=button]");
    if (!b) return;
    if (b.dataset.scale) {
      c[b.dataset.scale] = Number(b.dataset.v);
      form.querySelectorAll(`[data-scale="${b.dataset.scale}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b));
    }
    if (b.dataset.pain !== undefined) {
      c.pain = b.dataset.pain === "1";
      form.querySelectorAll("[data-pain]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      form.querySelector("[data-painbox]").hidden = !c.pain;
    }
    if (b.dataset.zone) {
      const z = b.dataset.zone; const i = c.painZones.indexOf(z);
      if (i >= 0) c.painZones.splice(i, 1); else c.painZones.push(z);
      b.setAttribute("aria-pressed", i < 0);
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    store.update((s) => { s.checkins[key] = { ...c, at: new Date().toISOString() }; });
    const r = readiness(c);
    closeSheet();
    toast(`Check-in enregistré · forme ${r.score}/100`);
    after?.();
  });
}

// ---------- RPE ----------
export function rpePicker(value) {
  return `<div class="grid3" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => `<button type="button" class="set" data-rpe="${v}" aria-pressed="${v === value}">${v}</button>`).join("")}</div>
  <div class="scale-legend"><span>Très facile</span><span>Maximal</span></div>`;
}

export function openLog(key, block, after) {
  const prev = store.get().sessions[key]?.logs?.find((l) => l.id === block.id);
  const v = { rpe: prev?.rpe || 6, minutes: prev?.minutes || block.minutes || 60, sparring: prev?.sparring || "none", note: prev?.note || "" };
  const p = store.get().profile;
  const body = openSheet(block.title, `
    <form data-log class="stack">
      <label class="field"><span>Durée (minutes)</span><input class="input num" name="minutes" inputmode="numeric" value="${v.minutes}"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Intensité ressentie de la séance</span>${rpePicker(v.rpe)}</div>
      ${block.type === "club" ? `<div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Sparring</span>
        <div class="chips">${[["none", "Aucun"], ["grappling", "Grappling"], ["light", "Frappe légère"], ["hard", "Frappe dure"]].filter(([id]) => !(isMinor(p) && id === "hard")).map(([id, l]) => `<button type="button" class="chip" data-sp="${id}" aria-pressed="${v.sparring === id}">${l}</button>`).join("")}</div></div>` : ""}
      <label class="field"><span>Note (facultatif)</span><textarea class="input" name="note" rows="2" placeholder="Ce qui a marché, ce qui est à retravailler">${esc(v.note)}</textarea></label>
      <p class="hint">Note l'intensité 30 minutes après la séance : 1 = très facile, 10 = effort maximal.</p>
      <button class="btn tape-btn block">Enregistrer la séance</button>
    </form>`);
  const form = body.querySelector("[data-log]");
  form.addEventListener("click", (e) => {
    const b = e.target.closest("button[type=button]"); if (!b) return;
    if (b.dataset.rpe) { v.rpe = Number(b.dataset.rpe); form.querySelectorAll("[data-rpe]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    if (b.dataset.sp) { v.sparring = b.dataset.sp; form.querySelectorAll("[data-sp]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    v.minutes = Number(form.minutes.value) || 0; v.note = form.note.value.trim();
    markDone(key, block.id, { title: block.title, type: block.type, ...v });
    closeSheet(); toast("Séance enregistrée"); after?.();
  });
}

// ---------- mobilité / mouvement ----------
export function openRoutine(key, block, after) {
  const R = block.type === "mobility" ? MOBILITY : MOVEMENT;
  const done = new Set();
  const body = openSheet(R.title, `
    <p class="muted">${R.minutes} minutes. Coche au fur et à mesure.</p>
    <ul class="list" style="margin-top:8px">${R.items.map((it, i) => `<li><div style="min-width:0;flex:1"><div style="font-weight:650">${esc(it.name)}</div><div class="meta">${esc(it.detail)}</div>${guideInline(it.name)}</div>
      <button type="button" class="icon-btn" data-it="${i}" aria-pressed="false" aria-label="Fait">${icon("check")}</button></li>`).join("")}</ul>
    <button class="btn tape-btn block" data-finish style="margin-top:16px">Terminer</button>`);
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-it]");
    if (b) { const i = b.dataset.it; done.has(i) ? done.delete(i) : done.add(i); b.style.background = done.has(i) ? "var(--good)" : ""; b.style.color = done.has(i) ? "#fff" : ""; }
    if (e.target.closest("[data-finish]")) { markDone(key, block.id, { title: R.title, type: block.type, minutes: R.minutes, rpe: 2 }); closeSheet(); toast("Bloc terminé"); after?.(); }
  });
}

// ---------- force ----------
export function openStrength(key, block, after) {
  const st = store.get();
  const p = st.profile;
  const home = p.equipment === "home" || isMinor(p);
  const S = STRENGTH[block.kind];
  const list = home ? S.home : S.gym;
  const sets = block.mode === "light" ? 3 : null;
  const log = {};
  list.forEach((ex) => { log[ex.id] = { kg: suggestedLoad(ex, st, block.mode) ?? st.lifts?.[ex.id]?.kg ?? "", sets: Array(sets || ex.sets).fill(false) }; });
  let rpe = 7;

  const exHtml = (ex) => {
    const L = log[ex.id];
    const sug = suggestedLoad(ex, st, block.mode);
    return `<div class="ex" data-ex="${ex.id}">
      <div class="ex-head"><span class="ex-name">${esc(ex.name)}</span><span class="ex-presc">${sets || ex.sets} × ${ex.reps}${ex.note ? " · " + esc(ex.note) : ""}</span></div>
      <div class="tiny muted">Repos ${esc(ex.rest)}${sug ? ` · charge proposée ${fmt(sug, 1)} kg` : home ? "" : ` · première fois : monte progressivement jusqu'à la charge que tu fais ${ex.reps} fois proprement`}</div>
      ${home ? "" : `<div class="row" style="margin-top:8px"><input class="input num" style="max-width:120px;min-height:40px" inputmode="decimal" data-kg="${ex.id}" value="${L.kg}" placeholder="kg"><span class="tiny muted">kg de travail</span></div>`}
      <div class="sets">${L.sets.map((_, i) => `<button type="button" class="set" data-set="${ex.id}:${i}" aria-pressed="false">Série ${i + 1}</button>`).join("")}</div>
    </div>`;
  };

  const body = openSheet(`Prépa physique · ${S.title}`, `
    <p class="muted">${esc(S.why)}${block.mode === "light" ? " Version allégée aujourd'hui : 3 séries, charges −10 %." : ""}${p.level === 1 ? " Niveau Fondations : descente lente, pause en bas, montée explosive, technique parfaite avant la charge." : ""}</p>
    <div class="panel" style="padding:4px 16px;margin-top:10px">${list.map(exHtml).join("")}</div>
    <div class="panel" style="margin-top:12px"><h3>Cardio de fin de séance</h3><p class="muted small" style="margin-top:4px">Rameur, ski erg ou vélo : 3 × 5 min sur le rythme d'un combat, 1 min de repos.</p></div>
    <div style="margin-top:16px"><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Intensité ressentie de la séance</span>${rpePicker(rpe)}</div>
    <button class="btn tape-btn block" data-finish style="margin-top:16px">Terminer la séance</button>`);

  body.addEventListener("input", (e) => { const id = e.target.dataset.kg; if (id) log[id].kg = e.target.value; });
  body.addEventListener("click", (e) => {
    const s = e.target.closest("[data-set]");
    if (s) { const [id, i] = s.dataset.set.split(":"); log[id].sets[i] = !log[id].sets[i]; s.setAttribute("aria-pressed", log[id].sets[i]); }
    const r = e.target.closest("[data-rpe]");
    if (r) { rpe = Number(r.dataset.rpe); body.querySelectorAll("[data-rpe]").forEach((x) => x.setAttribute("aria-pressed", x === r)); }
    if (e.target.closest("[data-finish]")) {
      store.update((s2) => {
        s2.lifts ||= {};
        list.forEach((ex) => {
          const L = log[ex.id]; const kg = Number(String(L.kg).replace(",", "."));
          if (kg > 0) {
            const allDone = L.sets.every(Boolean);
            const kgBase = block.mode === "light" ? kg / 0.9 : kg; // on garde la référence pleine charge
            s2.lifts[ex.id] = { kg: kgBase, allDone: allDone && block.mode !== "light", rpe, date: key, e1rm: brzycki(kg, ex.reps) };
          }
        });
      });
      markDone(key, block.id, { title: `Prépa physique · ${S.title}`, type: "strength", minutes: 60, rpe });
      closeSheet(); toast("Séance de force enregistrée"); after?.();
    }
  });
}

export function openBlock(key, block, after, go) {
  if (block.type === "mobility" || block.type === "movement") return openRoutine(key, block, after);
  if (block.type === "strength") return openStrength(key, block, after);
  if (block.type === "drills") return go?.("train");
  return openLog(key, block, after);
}
