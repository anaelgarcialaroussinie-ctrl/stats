// Profil athlétique : qualités et lacunes tirées des données de chacun (tests, charges, forme, fiches, bilans).
// Sert à adapter la prépa physique et les programmes de style.
import { TESTS } from "./data.js";
import { readiness, weeklyLoad, isMinor } from "./engine.js";
import { todayKey, addDays } from "./store.js";

const lastTest = (st, id) => (st.tests || []).filter((t) => t.id === id).sort((a, b) => a.date.localeCompare(b.date)).pop()?.value;

export function computeQualities(p = {}, st = {}) {
  const out = { strengths: [], gaps: [], priority: null, notes: [], data: 0 };
  const bw = Number(p.weight) || null;
  const F = p.sex === "F";
  const add = (list, key, text) => { out[list].push({ key, text }); out.data++; };

  // force relative (tests ou charges notées)
  const sq = lastTest(st, "squat1rm") ?? st.lifts?.squat?.e1rm;
  const dl = lastTest(st, "dl1rm") ?? st.lifts?.deadlift?.e1rm;
  if (bw && !isMinor(p)) {
    const ref = F ? 1.5 : 2;
    if (sq) { const r = sq / bw; if (r < ref * 0.75) add("gaps", "force", `Force du bas du corps : squat à ${r.toFixed(2)} × ton poids (objectif ${ref}).`); else if (r >= ref * 0.92) add("strengths", "force", `Force du bas du corps : squat à ${r.toFixed(2)} × ton poids.`); }
    else if (dl) { const ref2 = F ? 1.9 : 2.5, r = dl / bw; if (r < ref2 * 0.75) add("gaps", "force", `Force : soulevé de terre à ${r.toFixed(2)} × ton poids (objectif ${ref2}).`); else if (r >= ref2 * 0.92) add("strengths", "force", `Force : soulevé de terre à ${r.toFixed(2)} × ton poids.`); }
  }
  // explosivité
  const cmj = lastTest(st, "cmj");
  if (cmj) { const ref = F ? 38 : 45; if (cmj < ref * 0.85) add("gaps", "explo", `Explosivité : saut vertical à ${cmj} cm (repère ${ref} cm).`); else if (cmj >= ref) add("strengths", "explo", `Explosivité : saut vertical à ${cmj} cm.`); }
  // endurance
  const row = lastTest(st, "row2k");
  if (row) { const ref = F ? 560 : 450; if (row > ref * 1.08) add("gaps", "cardio", `Endurance : 2 000 m rameur en ${Math.floor(row / 60)} min ${String(Math.round(row % 60)).padStart(2, "0")} (repère ${Math.floor(ref / 60)} min ${ref % 60 ? ref % 60 : "00"}).`); else if (row <= ref) add("strengths", "cardio", `Endurance : 2 000 m rameur en ${Math.floor(row / 60)} min ${String(Math.round(row % 60)).padStart(2, "0")}.`); }
  // force du haut
  const pu = lastTest(st, "pullups");
  if (pu !== undefined) { const t = F ? 11 : 15; if (pu < t * 0.6) add("gaps", "haut", `Force de tirage : ${pu} tractions (objectif ${t}).`); else if (pu >= t) add("strengths", "haut", `Force de tirage : ${pu} tractions.`); }

  // forme et régularité
  const key = todayKey();
  const ck = [...Array(14)].map((_, i) => st.checkins?.[addDays(key, -i)]).filter(Boolean);
  if (ck.length >= 5) {
    const avg = ck.reduce((t, c) => t + readiness(c).score, 0) / ck.length;
    if (avg < 55) add("gaps", "recup", `Récupération : forme moyenne de ${Math.round(avg)} sur 100 sur 2 semaines. Sommeil et charge à surveiller.`);
    else if (avg >= 72) add("strengths", "recup", `Récupération : forme moyenne de ${Math.round(avg)} sur 100 sur 2 semaines.`);
    const sleep = ck.reduce((t, c) => t + Number(c.sleepH || 0), 0) / ck.length;
    if (sleep < 7) out.notes.push(`Sommeil moyen : ${sleep.toFixed(1)} h. Moins de 7 h freine la récupération et la progression.`);
  }
  const load = weeklyLoad(st, key);
  if (load.monotony > 2) out.notes.push("Semaines très monotones : alterne vraiment jours durs et jours légers.");

  // technique : fiches et bilans de programme
  const todo = (st.notes || []).filter((n) => n.status !== "ok");
  const byCat = {};
  todo.forEach((n) => { byCat[n.cat] = (byCat[n.cat] || 0) + 1; });
  const worst = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
  if (worst && worst[1] >= 2) add("gaps", "tech", `Technique : ${worst[1]} fiches « ${worst[0]} » encore à travailler.`);
  const ok = (st.notes || []).filter((n) => n.status === "ok");
  if (ok.length >= 2) add("strengths", "tech", `${ok.length} techniques maîtrisées dans tes fiches.`);
  const fb = st.program?.feedback || {};
  const hard = Object.values(fb).flatMap((w) => Object.entries(w.items || {}).filter(([, v]) => v === "dur").map(([k]) => k));
  if (hard.length) out.notes.push(`Dans ton programme, reste difficile : ${[...new Set(hard)].map((k) => ({ combo: "la combinaison", weapon: "l'arme décisive", system: "le système", spar: "le sparring" }[k] || k)).join(", ")}.`);

  // priorité de prépa physique
  const g = out.gaps.map((x) => x.key);
  out.priority = g.includes("force") ? "force" : g.includes("explo") ? "explo" : g.includes("cardio") ? "cardio" : g.includes("haut") ? "haut" : null;
  return out;
}

export const PRIORITY_TEXT = {
  force: "Priorité force : une série de plus sur le premier exercice de force des jours Lourd et Volume.",
  explo: "Priorité explosivité : une série de plus sur les exercices d'explosivité, et un saut ajouté le jour Volume.",
  cardio: "Priorité endurance : intervalles ajoutés en fin de séance Volume (6 × 1 min fort, 1 min léger).",
  haut: "Priorité force du haut du corps : une série de plus sur les tirages.",
};
