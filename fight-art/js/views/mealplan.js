// Plan repas sur mesure : quelques questions, puis les repas de chaque jour avec heures et portions,
// calés sur la charge d'entraînement du jour, et la liste à cuisiner à l'avance.
import { store, todayKey, addDays, dayIndex, uid } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { dayPlan, nutritionTargets, isMinor, frDate } from "../engine.js";
import { DAYS, classesOn } from "../data.js";
import { PROTEINS, BREAKFAST_PROTEINS, CARBS, BREAKFAST_CARBS, FRUITS, FATS, VEG, DIETS, AVOID, MEAL_SLOTS, SOURCES_NUTRITION } from "../meal-data.js";
import { reminders, saveReminders, makeReminder } from "../reminders.js";

const DEFAULT = { wake: "07:00", bed: "23:00", meals: 4, diet: "omni", avoid: [], dislike: [], prep: "batch", scTime: "17:30" };
export const mealAnswers = () => store.get().mealPlan?.answers || null;

const toMin = (t) => { const [h, m] = String(t).split(":").map(Number); return h * 60 + (m || 0); };
const toHM = (m) => { m = Math.round(m / 15) * 15; return `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };
const r10 = (g) => Math.max(0, Math.round(g / 10) * 10);

// aliments autorisés selon le régime, les exclusions et ce que la personne n'aime pas
function allowed(list, a) {
  const ex = new Set([...(DIETS.find((d) => d.id === a.diet)?.exclude || []), ...(a.avoid || [])]);
  const out = list.filter((f) => !f.tags.some((t) => ex.has(t)) && !(a.dislike || []).includes(f.id));
  return out.length ? out : list.filter((f) => !f.tags.some((t) => ex.has(t)));
}
const pick = (list, seed) => list.length ? list[Math.abs(seed) % list.length] : null;

// heures des repas entre le lever et 2 h 30 avant le coucher
export function mealTimes(a) {
  const n = Number(a.meals) || 4, first = toMin(a.wake) + 30;
  let bed = toMin(a.bed); if (bed <= toMin(a.wake)) bed += 24 * 60;
  let last = Math.min(bed - 150, toMin(a.wake) + 15 * 60); if (last <= first + 60 * (n - 1)) last = first + 180 * (n - 1);
  return MEAL_SLOTS[n].map((s, i) => ({ ...s, time: toHM(first + (i * (last - first)) / (n - 1)) }));
}

// heure de l'entraînement du jour (cours au club ou prépa physique)
function trainingOf(p, key, plan, a) {
  const cls = classesOn(p, dayIndex(key));
  if (cls.length) return { start: toMin(cls[0].start), end: toMin(cls[cls.length - 1].end), label: cls.map((c) => c.name).join(" + ") };
  if (plan.blocks?.some((b) => b.type === "strength")) return { start: toMin(a.scTime || "17:30"), end: toMin(a.scTime || "17:30") + 75, label: "Prépa physique" };
  return null;
}

// portions d'un repas pour viser ses protéines, glucides et lipides
function build(slot, tgt, a, seed) {
  const items = [];
  const add = (f, g) => { if (f && g > 0) items.push({ ...f, grams: g }); };
  const isBf = slot.id === "breakfast", isSnack = slot.id === "snack";
  let fruit = null, veg = null, carb, prot, fat;
  if (isBf || isSnack) {
    fruit = pick(allowed(FRUITS, a), seed);
    prot = pick(allowed(BREAKFAST_PROTEINS, a).filter((f) => f.id !== "whey" || isSnack), seed + 1);
    carb = isBf ? pick(allowed(BREAKFAST_CARBS, a), seed + 2) : null;
    fat = isSnack ? pick(allowed(FATS, a).filter((f) => f.id !== "huile"), seed) : null;
  } else {
    veg = pick(VEG, seed);
    prot = pick(allowed(PROTEINS, a), seed + (slot.id === "dinner" ? 3 : 0));
    carb = pick(allowed(CARBS, a), seed + (slot.id === "dinner" ? 2 : 0));
    fat = pick(allowed(FATS, a).filter((f) => f.id === "huile" || f.id === "avocat"), seed);
  }
  const fruitG = fruit ? fruit.unit?.g || 150 : 0, vegG = veg ? 200 : 0;
  let C = tgt.c - (fruit ? (fruit.c * fruitG) / 100 : 0) - (veg ? (veg.c * vegG) / 100 : 0);
  const carbG = carb ? r10(Math.min((C / carb.c) * 100, isBf ? 150 : 450)) : 0;
  let P = tgt.p - (carb ? (carb.p * carbG) / 100 : 0);
  let protG = prot ? (P / prot.p) * 100 : 0;
  if (prot?.scoop) protG = Math.min(40, Math.max(20, Math.round(protG / 5) * 5));
  else if (prot?.unit) protG = Math.max(1, Math.min(4, Math.round(protG / prot.unit.g))) * prot.unit.g;
  else protG = r10(Math.min(protG, prot?.legume ? 400 : 300));
  const F = tgt.f - ((prot ? prot.f * protG : 0) + (carb ? carb.f * carbG : 0)) / 100;
  let fatG = fat ? (F / fat.f) * 100 : 0;
  fatG = fat?.spoon ? Math.round(fatG / 5) * 5 : r10(fatG);
  fatG = Math.min(fatG, fat?.id === "huile" ? 20 : 40);
  add(prot, protG); add(carb, carbG); add(veg, vegG); add(fruit, fruitG); if (fatG >= 5) add(fat, fatG);
  const tot = items.reduce((t, f) => ({ kcal: t.kcal + (f.kcal * f.grams) / 100, p: t.p + (f.p * f.grams) / 100, c: t.c + (f.c * f.grams) / 100, f: t.f + (f.f * f.grams) / 100 }), { kcal: 0, p: 0, c: 0, f: 0 });
  return { items, tot };
}

// le plan d'une journée
export function dayMeals(key = todayKey(), st = store.get()) {
  const a = mealAnswers(); const p = st.profile; if (!a || !p) return null;
  const plan = dayPlan(p, key, st), nt = nutritionTargets(p, plan), minor = isMinor(p);
  const slots = mealTimes(a), tr = trainingOf(p, key, plan, a);
  const n = slots.length, di = dayIndex(key);
  const meals = slots.map((s, i) => {
    const t = toMin(s.time);
    let role = "";
    if (tr) {
      const before = slots.filter((x) => toMin(x.time) <= tr.start - 60).pop();
      const after = slots.find((x) => toMin(x.time) >= tr.end);
      if (before === s) role = "before"; else if (after === s) role = "after";
    }
    const tgt = nt && !nt.minor ? { p: nt.p / n, c: nt.c * s.carb * (role === "before" ? 1.15 : role === "after" ? 1.1 : 1), f: nt.f * s.fat * (role === "before" ? 0.6 : 1) } : { p: 30, c: 60, f: 15 };
    const b = build(s, tgt, a, di * 7 + i + (Number(key.slice(8)) % 3));
    return { ...s, t, role, ...b };
  });
  return { a, nt, minor, tr, meals, load: nt?.loadLabel };
}

const portion = (f, minor) => {
  if (minor) return f.unit ? `1 à 2 ${f.unit.label}s` : PROTEINS.concat(BREAKFAST_PROTEINS).some((x) => x.id === f.id) ? "1 à 2 paumes" : CARBS.concat(BREAKFAST_CARBS).some((x) => x.id === f.id) ? "1 à 2 poings" : FATS.some((x) => x.id === f.id) ? "1 pouce" : "1 à 2 poignées";
  if (f.unit) { const k = Math.round(f.grams / f.unit.g); return `${k} ${f.unit.label}${k > 1 ? "s" : ""}`; }
  if (f.scoop) return `${f.grams} g (1 dose)`;
  if (f.spoon) return `${f.grams} g (${Math.max(1, Math.round(f.grams / f.spoon))} c. à soupe)`;
  return `${f.grams} g`;
};

// ---------- écran du plan ----------
export function openMealPlan(onChange) {
  if (!mealAnswers()) { openQuestions(onChange); return; }
  let key = todayKey();
  const body = openSheet("Mon plan repas", "");
  const draw = () => {
    const d = dayMeals(key);
    const days = [...Array(7)].map((_, i) => addDays(addDays(todayKey(), -dayIndex(todayKey())), i));
    body.innerHTML = `
      <div class="chips" style="margin-bottom:10px">${days.map((k) => `<button class="chip" data-k="${k}" aria-pressed="${k === key}">${DAYS[dayIndex(k)]} ${Number(k.slice(8))}</button>`).join("")}</div>
      <p class="small" style="margin:0"><b>${esc(frDate(key, { weekday: "long", day: "numeric", month: "long" }))}</b>${d.load ? ` · ${esc(d.load)}` : ""}${d.tr ? ` · ${esc(d.tr.label)} à ${toHM(d.tr.start).replace(":", "h")}` : ""}</p>
      ${d.nt && !d.nt.minor ? `<p class="tiny muted" style="margin:4px 0 0">Objectif du jour : ${d.nt.kcal} kcal · P ${d.nt.p} g · G ${d.nt.c} g · L ${d.nt.f} g</p>` : ""}
      ${d.minor ? `<p class="notice small" style="margin-top:8px">Moins de 18 ans : pas de grammes ni de calories, des portions à la main. Une paume = la viande ou le poisson, un poing = les féculents.</p>` : ""}
      <div class="stack" style="margin-top:10px">${d.meals.map((m, i) => `<section class="panel" style="padding:12px">
        <div class="row between"><b>${esc(m.label)}</b><span class="badge num">${m.time.replace(":", "h")}</span></div>
        ${m.role === "before" ? `<div class="tiny" style="color:var(--tape);margin-top:4px">Avant l'entraînement : facile à digérer, peu gras, peu de fibres.</div>` : m.role === "after" ? `<div class="tiny" style="color:var(--tape);margin-top:4px">Récupération : protéines et glucides après l'effort.</div>` : ""}
        <ul class="bul" style="margin-top:6px">${m.items.map((f) => `<li class="small">${esc(f.name)} · <b>${esc(portion(f, d.minor))}</b></li>`).join("")}</ul>
        ${d.minor ? "" : `<div class="tiny muted">≈ ${Math.round(m.tot.kcal)} kcal · P ${Math.round(m.tot.p)} · G ${Math.round(m.tot.c)} · L ${Math.round(m.tot.f)}</div>`}
        ${key === todayKey() && !d.minor ? `<button class="btn ghost small" data-log="${i}" style="margin-top:8px">${icon("plus")} Ajouter à mon journal</button>` : ""}
      </section>`).join("")}</div>
      ${d.a.prep === "batch" ? `<button class="btn block" data-batch style="margin-top:12px">Ce que je cuisine à l'avance</button>` : ""}
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
        <button class="btn tape-btn small" data-remind>${icon("timer")} Rappels à l'heure des repas</button>
        <button class="btn ghost small" data-edit>${icon("edit")} Modifier mes réponses</button></div>
      ${store.get().profile?.goal === "compet" ? `<p class="notice is-warn small" style="margin-top:12px">Préparation de combat : la perte de poids avant la pesée se fait uniquement avec ton coach. Jamais de déshydratation volontaire seul.</p>` : ""}
      <p class="hint">Portions indicatives (aliments pesés cuits, sauf flocons et pain). ${esc(SOURCES_NUTRITION)}</p>`;
  };
  body.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.k) { key = b.dataset.k; draw(); return; }
    if (b.dataset.edit !== undefined) { openQuestions(onChange); return; }
    if (b.dataset.batch !== undefined) { openBatch(); return; }
    if (b.dataset.log) {
      const m = dayMeals(key).meals[Number(b.dataset.log)];
      store.update((s) => { s.food[key] = [...(s.food[key] || []), ...m.items.map((f) => ({ id: uid(), meal: m.id, name: f.name, grams: f.grams, kcal: Math.round((f.kcal * f.grams) / 100), p: Math.round((f.p * f.grams) / 10) / 10, c: Math.round((f.c * f.grams) / 10) / 10, f: Math.round((f.f * f.grams) / 10) / 10 }))]; });
      toast(`${m.label} ajouté à ton journal`); onChange?.(); return;
    }
    if (b.dataset.remind !== undefined) {
      const times = mealTimes(mealAnswers());
      const list = [...reminders().filter((r) => r.kind !== "meal"), ...times.map((s) => makeReminder("meal", s.time, [0, 1, 2, 3, 4, 5, 6], { title: s.label, body: "Ton repas est prêt dans ton plan : ouvre l'appli pour voir ta portion du jour." }))];
      await saveReminders(list);
      toast(`${times.length} rappels de repas programmés (réglages : Mon profil → Mes rappels)`);
    }
  });
  draw();
}

// liste à cuisiner : 2 sessions par semaine (dimanche pour lun-mer, mercredi soir pour jeu-dim)
// car un plat cuisiné se garde 3 à 4 jours au réfrigérateur
const RAW = { riz: 1 / 2.6, pates: 1 / 2.3, semoule: 1 / 2.4, quinoa: 1 / 2.7, lentilles: 1 / 2.5, poulet: 1 / 0.75, dinde: 1 / 0.75, boeuf: 1 / 0.75, saumon: 1 / 0.8, cabillaud: 1 / 0.8, tofu: 1, pdt: 1, "patate-douce": 1 };
function openBatch() {
  const monday = addDays(todayKey(), -dayIndex(todayKey()));
  const sessions = [{ label: "Dimanche : pour lundi, mardi, mercredi", days: [0, 1, 2] }, { label: "Mercredi soir : pour jeudi à dimanche", days: [3, 4, 5, 6] }];
  const html = sessions.map((s) => {
    const sum = {};
    s.days.forEach((di) => (dayMeals(addDays(monday, di))?.meals || []).filter((m) => m.id === "lunch" || m.id === "dinner").forEach((m) => m.items.filter((f) => f.prep).forEach((f) => { sum[f.id] ||= { name: f.name, g: 0, id: f.id }; sum[f.id].g += f.grams; })));
    const rows = Object.values(sum).sort((x, y) => y.g - x.g);
    return `<h3 class="sys-h">${esc(s.label)}</h3>${rows.length ? `<ul class="bul">${rows.map((r) => `<li class="small">${esc(r.name)} : <b>${r10(r.g)} g cuit</b>${RAW[r.id] && RAW[r.id] !== 1 ? ` (≈ ${r10(r.g * RAW[r.id])} g cru)` : ""}</li>`).join("")}</ul>` : `<p class="muted small">Rien à préparer.</p>`}`;
  }).join("");
  openSheet("À cuisiner à l'avance", `${html}
    <p class="hint">Répartis en boîtes par repas, au réfrigérateur (4 °C ou moins) : 3 à 4 jours maximum, d'où deux sessions par semaine. Les légumes et les crudités se préparent à part.</p>`);
}

// ---------- questionnaire ----------
function openQuestions(onChange) {
  const a = { ...DEFAULT, ...(mealAnswers() || {}) };
  a.avoid = [...(a.avoid || [])]; a.dislike = [...(a.dislike || [])];
  const foods = [...PROTEINS, ...CARBS, ...BREAKFAST_PROTEINS.filter((f) => f.id !== "oeufs-bf"), ...BREAKFAST_CARBS, ...FRUITS, ...FATS.filter((f) => f.id !== "huile")];
  const chip = (group, id, label, on) => `<button type="button" class="chip" data-${group}="${id}" aria-pressed="${on}">${esc(label)}</button>`;
  const body = openSheet("Mon plan repas", `
    <p class="small muted" style="margin-top:0">Quelques questions pour un plan qui colle à tes horaires, ton entraînement et tes goûts. Les quantités viennent de ton poids, de ton objectif et de la charge de chaque jour.</p>
    <form class="stack" data-q>
      <div class="grid2">
        <label class="field"><span>Je me lève à</span><input class="input" type="time" name="wake" value="${a.wake}"></label>
        <label class="field"><span>Je me couche à</span><input class="input" type="time" name="bed" value="${a.bed}"></label>
      </div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Combien de repas par jour ?</span>
        <div class="chips">${[3, 4, 5].map((n) => chip("meals", n, `${n} repas${n > 3 ? " (dont collations)" : ""}`, Number(a.meals) === n)).join("")}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Mon alimentation</span>
        <div class="chips">${DIETS.map((d) => chip("diet", d.id, d.label, a.diet === d.id)).join("")}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Je ne mange pas (allergie, intolérance, choix)</span>
        <div class="chips">${AVOID.map((x) => chip("avoid", x.id, x.label, a.avoid.includes(x.id))).join("")}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Je n'aime pas</span>
        <div class="chips">${foods.map((f) => chip("dislike", f.id, f.name, a.dislike.includes(f.id))).join("")}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Cuisine</span>
        <div class="chips">${chip("prep", "batch", "Je prépare à l'avance (2 fois par semaine)", a.prep === "batch")}${chip("prep", "daily", "Je cuisine chaque jour", a.prep === "daily")}</div></div>
      <label class="field"><span>Heure habituelle de ma prépa physique</span><input class="input" type="time" name="scTime" value="${a.scTime}"></label>
      <p class="hint">Les jours de club, l'appli prend l'heure de tes cours. Ton poids, ton objectif et ta date de combat se règlent dans Mon profil.</p>
      <button class="btn tape-btn block">Créer mon plan</button>
    </form>`);
  const f = body.querySelector("[data-q]");
  f.addEventListener("click", (e) => {
    const b = e.target.closest("button[type=button]"); if (!b) return;
    const d = b.dataset;
    if (d.meals) { a.meals = Number(d.meals); f.querySelectorAll("[data-meals]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    if (d.diet) { a.diet = d.diet; f.querySelectorAll("[data-diet]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    if (d.prep) { a.prep = d.prep; f.querySelectorAll("[data-prep]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    for (const g of ["avoid", "dislike"]) if (d[g]) { const id = d[g]; a[g] = a[g].includes(id) ? a[g].filter((x) => x !== id) : [...a[g], id]; b.setAttribute("aria-pressed", a[g].includes(id)); }
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    Object.assign(a, { wake: f.wake.value || DEFAULT.wake, bed: f.bed.value || DEFAULT.bed, scTime: f.scTime.value || DEFAULT.scTime });
    store.update((s) => { s.mealPlan = { answers: a, updatedAt: new Date().toISOString() }; });
    closeSheet(); toast("Plan repas prêt"); onChange?.(); openMealPlan(onChange);
  });
}
