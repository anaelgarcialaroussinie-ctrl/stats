// Programme annuel du club (40 semaines) : quelle semaine on est, et la ligne de travail de chaque niveau.
import { addDays, dayIndex, todayKey } from "./store.js";
import { sync } from "./sync.js";
import { LUTA_PROGRAM } from "./luta-season.js";
export { LUTA_PROGRAM };

const KEY = "fap:season";
let season = null;
try { season = JSON.parse(localStorage.getItem(KEY) || "null"); } catch {}

export const cachedSeason = () => season;
export async function loadSeason() {
  if (!sync.connected() || window.FAP_PREVIEW) return season;
  try { const s = await sync.season(); if (s) { season = s; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} } } catch {}
  return season;
}
export function setSeasonDates(start, skip) { if (season) { season = { ...season, start, skip }; try { localStorage.setItem(KEY, JSON.stringify(season)); } catch {} } }

const monday = (key) => addDays(key, -dayIndex(key));
// numéro de semaine de la saison (1 à 40) pour une date, en sautant les semaines de vacances
export function seasonWeek(key = todayKey(), s = season) {
  if (!s?.program?.weeks?.length || !s.start) return null;
  const m = monday(key), start = monday(s.start);
  if (m < start) return { before: true };
  const skip = new Set(s.skip || []);
  if (skip.has(m)) return { off: true };
  let n = 0;
  for (let k = start; k <= m; k = addDays(k, 7)) if (!skip.has(k)) n++;
  if (n > s.program.weeks.length) return { after: true };
  const week = s.program.weeks[n - 1];
  return { n, week, bloc: s.program.blocks.find((b) => b.n === week.bloc) };
}
// niveau du programme selon le cours ou le niveau du fighter
export function levelFor(classId, p) {
  if (classId === "mma-fond" || classId === "ll-fond") return "fond";
  if (classId === "mma-dev" || classId === "ll-dev") return "dev";
  if (classId === "team-ven" || classId === "team-sam" || classId === "ll-expert") return "comp";
  const l = Number(p?.level) || 1;
  return l >= 4 ? "comp" : l === 3 ? "dev" : "fond";
}
export const LEVEL_LABEL = { fond: "Fondamentaux", dev: "Développement", comp: "Compétition" };
export const LEVEL_DOT = { fond: "lvl-fond", dev: "lvl-dev", comp: "lvl-comp" };
// cours concernés par le programme MMA
export const MMA_CLASSES = ["mma-fond", "mma-dev", "sparring", "team-ven", "team-sam"];
// cours concernés par le programme Luta Livre (même numéro de semaine que le MMA)
export const LUTA_CLASSES = ["ll-fond", "ll-dev", "ll-expert"];
export const LUTA_LEVEL_LABEL = { fond: "Fondamentaux", dev: "Développement", comp: "Avancé" };
// la semaine Luta, pour une date
export function lutaWeek(key = todayKey(), s = season) {
  const sw = seasonWeek(key, s);
  if (!sw?.week) return sw;
  return { ...sw, luta: LUTA_PROGRAM.weeks[sw.n - 1] || null };
}
export const mondaysFrom = (start, count) => [...Array(count)].map((_, i) => addDays(monday(start), i * 7));
