// Stockage local d'abord. La synchronisation avec la base du club se branche ici (sync.js).
const KEY = "fap:v1";

const empty = () => ({
  profile: null,          // profil du fighter ou du coach
  checkins: {},           // { "2026-10-12": {...} }
  food: {},               // { date: [ {id, meal, name, grams, kcal, p, c, f, img} ] }
  water: {},              // { date: litres }
  sessions: {},           // { date: { kind, done:[], loads:{exId:kg}, rpe, minutes, note } }
  weights: [],            // [ {date, kg} ]
  tests: [],              // [ {date, id, value} ]
  lifts: {},              // { exId: derniere charge de travail kg }
  combos: [],             // combos fétiches (Academy)
  scouting: [],           // fiches adversaires et game plans
  systems: [],            // systèmes offensifs et défensifs
});

let state = load();
const listeners = new Set();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...empty(), ...JSON.parse(raw) } : empty();
  } catch {
    return empty();
  }
}

function save(opts = {}) {
  if (!opts.silent) state.savedAt = new Date().toISOString();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* stockage plein ou bloqué */ }
  listeners.forEach((fn) => fn(state, opts));
}

export const store = {
  get: () => state,
  update(fn, opts) { fn(state); save(opts); },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  reset() { state = empty(); save({ silent: true }); },
  export() { return JSON.stringify(state, null, 2); },
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export function todayKey(d = new Date()) {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
}
export function addDays(key, n) {
  const d = new Date(key + "T12:00:00");
  d.setDate(d.getDate() + n);
  return todayKey(d);
}
export function dayIndex(key) { // 0 = lundi
  const d = new Date(key + "T12:00:00");
  return (d.getDay() + 6) % 7;
}
