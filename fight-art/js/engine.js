// Moteur Fight Art Performance : règles issues de la base de connaissances.
import { CLASSES, STRENGTH, MOBILITY, MOVEMENT, DAYS_LONG, classesOn, clubDaysOf, hm } from "./data.js";
import { store, todayKey, addDays, dayIndex } from "./store.js";

export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const round = (v, step = 1) => Math.round(v / step) * step;

export function age(p) {
  if (!p?.birthYear) return null;
  return new Date().getFullYear() - Number(p.birthYear);
}
export const isMinor = (p) => { const a = age(p); return a !== null && a < 18; };

// ---------- forme du jour ----------
export function readiness(c) {
  if (!c) return null;
  const sleepH = clamp((Number(c.sleepH) - 4) / 4, 0, 1);
  const sleepQ = (c.sleepQ - 1) / 4;
  const energy = (5 - c.fatigue) / 4;
  const sore = (5 - c.soreness) / 4;
  const mood = (c.mood - 1) / 4;
  let score = Math.round(100 * (0.25 * sleepH + 0.15 * sleepQ + 0.25 * energy + 0.15 * sore + 0.2 * mood));
  const painHigh = c.pain && Number(c.painLevel) >= 5;
  if (painHigh) score = Math.min(score, 59);
  const level = score >= 70 ? "good" : score >= 50 ? "warn" : "bad";
  const label = { good: "Prêt", warn: "À doser", bad: "Récupération" }[level];
  return { score, level, label, painHigh };
}

export function readinessAdvice(r, c) {
  if (!r) return null;
  const out = [];
  if (r.level === "good") out.push("Séance normale. C'est un bon jour pour pousser.");
  if (r.level === "warn") out.push("Séance allégée : 3 séries au lieu de 5, charges 10 % plus légères, pas de sparring dur.");
  if (r.level === "bad") out.push("Journée récupération : mobilité, marche, technique légère. Pas de force ni de sparring.");
  if (c?.pain) out.push(`Douleur signalée (${(c.painZones || []).join(", ") || "zone non précisée"}) : on évite cette zone aujourd'hui. Si elle dure plus de quelques jours, parles-en au coach et à un kiné ou un médecin.`);
  if (Number(c?.sleepH) < 7) out.push("Moins de 7 h de sommeil : une sieste de 20 à 30 minutes en début d'après-midi aide, sans remplacer la nuit.");
  return out;
}

// alerte si 3 check-ins d'affilée en récupération, ou humeur basse 3 jours
export function alerts(state = store.get(), from = todayKey()) {
  const out = [];
  const last = [0, 1, 2].map((i) => state.checkins[addDays(from, -i)]).filter(Boolean);
  if (last.length === 3 && last.every((c) => readiness(c).level === "bad")) out.push({ level: "bad", text: "3 jours d'affilée en récupération. Le coach est prévenu : on fait le point." });
  if (last.length === 3 && last.every((c) => c.mood <= 2)) out.push({ level: "warn", text: "Moral bas depuis 3 jours. Parles-en à ton coach ou à un proche. En cas de détresse, le 3114 répond 24 h/24." });
  const load = weeklyLoad(state, from);
  if (load.prev > 0 && load.week > load.prev * 1.3) out.push({ level: "warn", text: "Charge en forte hausse par rapport à la semaine dernière (+" + Math.round((load.week / load.prev - 1) * 100) + " %). Attention au surmenage." });
  if (load.monotony > 2) out.push({ level: "warn", text: "Semaine très monotone : prévois de vrais jours légers." });
  return out;
}

// ---------- charge d'entraînement (RPE séance) ----------
export function sessionLoad(s) { return s && s.rpe && s.minutes ? Number(s.rpe) * Number(s.minutes) : 0; }
export function weeklyLoad(state = store.get(), from = todayKey()) {
  const days = [...Array(7)].map((_, i) => addDays(from, -i));
  const daily = days.map((d) => (state.sessions[d]?.logs || []).reduce((s, l) => s + sessionLoad(l), 0));
  const week = daily.reduce((a, b) => a + b, 0);
  const prevDays = [...Array(7)].map((_, i) => addDays(from, -7 - i));
  const prev = prevDays.reduce((s, d) => s + (state.sessions[d]?.logs || []).reduce((t, l) => t + sessionLoad(l), 0), 0);
  const mean = week / 7;
  const sd = Math.sqrt(daily.reduce((s, v) => s + (v - mean) ** 2, 0) / 7);
  const monotony = sd > 0 && week > 0 ? mean / sd : 0;
  return { week, prev, daily: daily.reverse(), monotony: Math.round(monotony * 10) / 10 };
}

// ---------- planning de la semaine ----------
function daysToCompetition(p, key) {
  if (!p?.competitionDate) return null;
  const a = new Date(key + "T12:00:00"), b = new Date(p.competitionDate + "T12:00:00");
  return Math.round((b - a) / 86400000);
}

export function strengthDays(p, key = todayKey()) {
  let days = [...(p.scDays || [0, 2, 4])].sort((a, b) => a - b);
  const dtc = daysToCompetition(p, key);
  if (dtc !== null && dtc >= 0) {
    if (dtc <= 7) days = [];
    else if (dtc <= 14) days = days.slice(0, 1);
    else if (dtc <= 21) days = days.slice(0, 2);
  }
  const kinds = days.length >= 3 ? ["force", "vitesse", "volume"] : days.length === 2 ? ["force", "volume"] : ["force"];
  const map = {};
  days.forEach((d, i) => { map[d] = kinds[i] || "volume"; });
  return map;
}

const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };

export function dayPlan(p, key = todayKey(), state = store.get()) {
  const di = dayIndex(key);
  const sc = strengthDays(p, key);
  const cls = classesOn(p, di);
  const club = cls.length ? true : (p.classes?.length ? false : (p.clubDays || []).includes(di));
  const kind = sc[di];
  const c = state.checkins[key];
  const r = readiness(c);
  const minor = isMinor(p);
  const dtc = daysToCompetition(p, key);
  const blocks = [];

  if (kind) blocks.push({ id: "mobility", type: "mobility", title: MOBILITY.title, detail: `${MOBILITY.minutes} min · hanches, épaules, nuque`, minutes: MOBILITY.minutes });
  else blocks.push({ id: "movement", type: "movement", title: MOVEMENT.title, detail: `${MOVEMENT.minutes} min · squat, suspension, locomotion`, minutes: MOVEMENT.minutes });

  if (kind) {
    const s = STRENGTH[kind];
    let title = `Prépa physique · ${s.title}`;
    const inj = [...new Set([...(p.injuries || []), ...(c?.pain ? c.painZones || [] : [])])];
    let detail = `${s.focus} · ${p.equipment === "home" || minor ? "version maison" : "en salle"}${inj.length ? ` · adaptée (${inj.join(", ").toLowerCase()})` : ""}`;
    let mode = "normal";
    if (r?.level === "warn") { mode = "light"; detail = "Version allégée · 3 séries, charges −10 %"; }
    if (r?.level === "bad") { mode = "skip"; title = "Récupération active"; detail = "Marche 20 à 30 min, mobilité, respiration"; }
    if (p.level === 1 && mode === "normal") detail += " · apprentissage : technique avant la charge";
    blocks.push({ id: "strength", type: mode === "skip" ? "recovery" : "strength", kind, mode, title, detail, minutes: mode === "skip" ? 30 : 60 });
  }

  if (club) {
    const spar = cls.some((c) => c.kind === "sparring");
    let detail = cls.length ? cls.map((c) => `${hm(c.start)}-${hm(c.end)} ${c.name}`).join(" · ") : "Technique, drills, sparring selon le coach";
    if (r?.level === "warn") detail += spar ? " · Forme moyenne : reste au niveau 1 en sparring" : " · Forme moyenne : technique et drills, pas de sparring dur";
    if (r?.level === "bad") detail += " · Forme basse : si tu y vas, technique légère seulement";
    if (minor) detail += " · pas de coups à la tête en sparring";
    const minutes = cls.length ? cls.reduce((t, c) => t + (toMin(c.end) - toMin(c.start)), 0) : 90;
    blocks.push({ id: "club", type: "club", title: cls.length ? `Au club : ${cls.map((c) => c.name).join(" + ")}` : "Entraînement au club", detail, minutes, classes: cls });
  } else if (!kind && di !== 6) {
    blocks.push({ id: "drills", type: "drills", title: "Drills solo", detail: "20 min · lutte, sol et shadow en 30/30", minutes: 20 });
  }

  if (!club && !kind && di === 6) blocks.push({ id: "rest", type: "rest", title: "Repos complet", detail: "Au moins un jour sans entraînement par semaine", minutes: 0 });

  const load = r?.level === "bad" ? "light" : (club && kind) ? "high" : (club || kind) ? "moderate" : "light";
  return { key, di, dayName: DAYS_LONG[di], blocks, load, kind, club, readiness: r, dtc };
}

export function weekPlan(p, key = todayKey()) {
  const di = dayIndex(key);
  const monday = addDays(key, -di);
  return [...Array(7)].map((_, i) => {
    const k = addDays(monday, i);
    const sc = strengthDays(p, k);
    const club = clubDaysOf(p).includes(i);
    const parts = [];
    if (sc[i]) parts.push(STRENGTH[sc[i]].title);
    if (club) parts.push("Club");
    if (!parts.length) parts.push(i === 6 ? "Repos" : "Drills");
    return { key: k, i, parts, today: k === key };
  });
}

// ---------- musculation : progression des charges ----------
export const brzycki = (kg, reps) => (reps > 0 && reps < 12 ? kg / (1.0278 - 0.0278 * reps) : null);

export function suggestedLoad(ex, state = store.get(), mode = "normal") {
  const last = state.lifts?.[ex.id];
  if (!last) return null;
  let kg = last.kg;
  if (last.allDone && (last.rpe ?? 8) <= 8 && ex.inc) kg += ex.inc;
  if (mode === "light") kg = kg * 0.9;
  return round(kg, 2.5);
}

// ---------- nutrition ----------
export function nutritionTargets(p, plan) {
  if (!p) return null;
  if (isMinor(p)) return { minor: true };
  const kg = Number(p.weight) || 70;
  const carbsPerKg = { light: 4, moderate: 6, high: 7 }[plan?.load || "moderate"];
  const lose = p.goal === "weight";
  const c = Math.max(3, lose ? carbsPerKg - 1 : carbsPerKg) * kg;
  const pr = (lose ? 2.2 : 1.8) * kg;
  const f = 1 * kg;
  const kcal = Math.round(4 * pr + 4 * c + 9 * f);
  return { kcal, p: Math.round(pr), c: Math.round(c), f: Math.round(f), perMealP: Math.round(0.25 * kg), loadLabel: { light: "jour léger", moderate: "jour modéré", high: "grosse journée" }[plan?.load || "moderate"] };
}

export function dayTotals(entries = []) {
  return entries.reduce((t, e) => ({ kcal: t.kcal + (e.kcal || 0), p: t.p + (e.p || 0), c: t.c + (e.c || 0), f: t.f + (e.f || 0) }), { kcal: 0, p: 0, c: 0, f: 0 });
}

// ---------- gabarit ----------
export function findClass(p) {
  if (!p) return null;
  if (p.classId) return CLASSES.find((c) => c.id === p.classId) || null;
  const list = CLASSES.filter((c) => c.sex === (p.sex === "F" ? "F" : "H"));
  const kg = Number(p.weight);
  if (!kg) return null;
  return list.find((c) => kg <= c.maxKg + 3) || list[list.length - 1];
}

export function morphology(p) {
  const cl = findClass(p);
  if (!cl || !p.height) return null;
  const h = Number(p.height), r = Number(p.reach) || null;
  const hBand = h >= cl.height + 4 ? "grand" : h <= cl.height - 4 ? "petit" : "moyen";
  const rBand = !r ? null : r >= cl.reachP75 ? "longue" : r <= cl.reachP25 ? "courte" : "moyenne";
  const ape = r ? r - h : null;
  const axes = [];
  if (hBand === "grand" || rBand === "longue") axes.push({ title: "Jeu de distance", text: "Contrôle de la distance, jab, coups de pied, volume à distance. Chez les combattants UFC longs pour leur catégorie, les KO sont plus fréquents (34 % des victoires contre 27 %).", watch: "Priorité à la défense de lutte : on cherchera à t'amener au sol." });
  if (hBand === "petit" || rBand === "courte") axes.push({ title: "Pression et lutte", text: "Pression, clinch, amenée au sol et contrôle. Le profil « lutteur dominant » est celui qui gagne le plus à l'UFC (61 %).", watch: "Travailler les entrées sans prendre de frappes : changement de niveau, feintes." });
  if (ape !== null && ape >= 8) axes.push({ title: "Bras longs", text: "À taille égale, les bras longs sont associés à plus de knockdowns : précision et puissance en frappe.", watch: "L'allonge seule ne gère pas la distance : déplacements." });
  if (!axes.length) axes.push({ title: "Profil polyvalent", text: "Gabarit dans la moyenne de la catégorie : le style se construit surtout sur ton passé sportif et tes qualités.", watch: "Tester en sparring à thème ce qui marche le mieux pour toi." });
  return { cl, hBand, rBand, ape, axes };
}

// ---------- utilitaires d'affichage ----------
export const fmt = (n, d = 0) => (n === null || n === undefined || isNaN(n) ? "–" : Number(n).toLocaleString("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: 0 }));
export const fmtTime = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;
export function frDate(key, opts = { weekday: "long", day: "numeric", month: "long" }) {
  return new Date(key + "T12:00:00").toLocaleDateString("fr-FR", opts);
}
