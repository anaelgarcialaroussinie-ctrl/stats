// Programmes du coach : une période, des créneaux (cours du club ou horaires perso),
// un thème par semaine avec ses notes et ses vidéos (liens). Tout le monde les voit, seul le coach les modifie.
import { addDays, dayIndex, todayKey, uid } from "./store.js";
import { sync } from "./sync.js";
import { cachedSeason } from "./season.js";

const KEY = "fap:programs";
let programs = [];
try { programs = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch {}
const keep = () => { try { localStorage.setItem(KEY, JSON.stringify(programs)); } catch {} };

export const cachedPrograms = () => programs;
export async function loadPrograms() {
  if (!sync.connected() || window.FAP_PREVIEW) return programs;
  try { const r = await sync.programs(); if (Array.isArray(r)) { programs = r; keep(); } } catch {}
  return programs;
}
export async function savePrograms(prog) {
  prog.updatedAt = new Date().toISOString();
  const i = programs.findIndex((x) => x.id === prog.id);
  if (i >= 0) programs[i] = prog; else programs.push(prog);
  keep();
  if (sync.connected() && !window.FAP_PREVIEW) await sync.saveProgram(prog);
}
export async function deleteProgram(id) {
  programs = programs.filter((x) => x.id !== id); keep();
  if (sync.connected() && !window.FAP_PREVIEW) await sync.deleteProgram(id);
}

const monday = (k) => addDays(k, -dayIndex(k));
const holidays = (prog) => new Set(prog.skipHolidays !== false ? cachedSeason()?.skip || [] : []);
// les lundis de la période, vacances comprises (marquées)
export function programMondays(prog) {
  if (!prog.start || !prog.end || prog.end < prog.start) return [];
  const out = [], skip = holidays(prog);
  let n = 0;
  for (let m = monday(prog.start); m <= prog.end && out.length < 60; m = addDays(m, 7)) {
    const off = skip.has(m);
    if (!off) n++;
    out.push({ monday: m, off, n: off ? null : n });
  }
  return out;
}
export const weekCount = (prog) => programMondays(prog).filter((w) => !w.off).length;
export function fitWeeks(prog) {
  const n = weekCount(prog);
  prog.weeks = [...(prog.weeks || [])];
  while (prog.weeks.length < n) prog.weeks.push({ theme: "", note: "", videos: [] });
  return prog;
}

// la semaine d'un programme pour une date
export function programWeek(prog, key) {
  if (!prog.start || !prog.end || key < prog.start || key > prog.end) return null;
  const w = programMondays(prog).find((x) => x.monday === monday(key));
  if (!w) return null;
  if (w.off) return { off: true, prog };
  return { prog, n: w.n, week: prog.weeks?.[w.n - 1] || { theme: "" } };
}
const active = (key) => programs.filter((p) => !p.archived && p.start && p.end && key >= p.start && key <= p.end)
  .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
// le programme qui s'applique à un cours du club (ou à un créneau perso) ce jour-là
export function programFor(classId, key = todayKey()) {
  for (const p of active(key)) {
    if (classId.startsWith("p:") ? classId.split(":")[1] === p.id : (p.classes || []).includes(classId)) return programWeek(p, key);
  }
  return null;
}
// créneaux perso des programmes actifs, présentés comme des cours
export function customSlotsOn(key) {
  const di = dayIndex(key);
  return active(key).flatMap((p) => (p.slots || []).filter((s) => Number(s.day) === di && s.start && s.end)
    .map((s) => ({ id: `p:${p.id}:${s.id}`, day: di, start: s.start, end: s.end, name: s.name || p.name, stage: p.name, text: p.desc || "", kind: "tech", custom: true })));
}
export const newProgram = (base = {}) => ({ id: crypto.randomUUID ? crypto.randomUUID() : uid(), name: "", start: monday(todayKey()), end: addDays(monday(todayKey()), 7 * 8 - 1), classes: [], slots: [], skipHolidays: true, weeks: [], ...base });
export const safeUrl = (u) => /^https?:\/\//i.test(String(u || "").trim());
