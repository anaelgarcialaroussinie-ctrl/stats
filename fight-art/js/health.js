// Santé : quelles zones renforcer en priorité, d'après les blessures déclarées, les douleurs du check-in et le style.
import { todayKey, addDays } from "./store.js";
import { PREHAB } from "./sc-data.js";

export const ZONE_PARTS = { "Nuque": ["nuque"], "Épaule": ["epaules", "thoracique"], "Coude": ["poignets"], "Main / poignet": ["poignets"], "Dos": ["basdos", "thoracique"], "Côtes": ["thoracique"], "Hanche": ["hanches", "quadri"], "Aine / adducteurs": ["aine", "hanches"], "Ischio-jambiers": ["ischios"], "Genou": ["genoux", "quadri"], "Cheville / pied": ["chevilles"] };

// zones les plus exposées selon la pratique (données de blessures en grappling : genou puis épaule ; nuque et aine très sollicitées)
const BY_BADGE = { grappler: ["Genou", "Épaule", "Nuque"], luta: ["Genou", "Épaule", "Nuque"], jjb: ["Genou", "Épaule", "Nuque"], lutte: ["Nuque", "Genou", "Épaule"], judo: ["Épaule", "Genou"], sambo: ["Genou", "Cheville / pied"], jambes: ["Genou", "Cheville / pied"], kick: ["Hanche", "Cheville / pied", "Main / poignet"], thai: ["Cheville / pied", "Hanche", "Coude"], boxe: ["Main / poignet", "Épaule"], karate: ["Hanche", "Ischio-jambiers"], clinch: ["Nuque", "Coude"] };
const DEFAULT_MMA = ["Genou", "Épaule", "Nuque", "Aine / adducteurs"];

export function healthZones(p = {}, st = {}) {
  const score = {}, why = {};
  const add = (z, pts, reason) => { if (!PREHAB[z]) return; score[z] = (score[z] || 0) + pts; (why[z] ||= []).push(reason); };
  (p.injuries || []).forEach((z) => add(z, 5, "zone fragile déclarée dans ton profil"));
  const key = todayKey();
  const counts = {}, high = {};
  for (let i = 0; i < 21; i++) {
    const c = st.checkins?.[addDays(key, -i)];
    if (c?.pain) (c.painZones || []).forEach((z) => { counts[z] = (counts[z] || 0) + 1; if (Number(c.painLevel) >= 5) high[z] = true; });
  }
  Object.entries(counts).forEach(([z, n]) => add(z, Math.min(6, n * 2), `douleur signalée ${n} fois en 3 semaines${high[z] ? ", parfois à 5 sur 10 ou plus" : ""}`));
  const seen = new Set();
  (p.badges || []).forEach((b) => (BY_BADGE[b] || []).forEach((z, i) => { if (!seen.has(z)) { seen.add(z); add(z, 2 - i * 0.5, "très sollicitée dans ton style"); } }));
  DEFAULT_MMA.forEach((z, i) => add(z, 1 - i * 0.2, i < 2 ? "zone la plus blessée en grappling" : "très sollicitée en MMA"));
  const zones = Object.keys(score).sort((a, b) => score[b] - score[a]).map((z) => ({ zone: z, score: score[z], why: [...new Set(why[z])], alert: !!high[z] || (counts[z] || 0) >= 4 }));
  // séances de prévention faites cette semaine
  const done = [...Array(7)].map((_, i) => st.sessions?.[addDays(key, -i)]?.logs || []).flat().filter((l) => l.type === "prehab").length;
  return { zones, done };
}

export const CONSULT = [
  "Douleur qui dure plus de quelques jours ou qui augmente d'une semaine à l'autre.",
  "Gonflement, déformation, craquement avec douleur vive, articulation qui se dérobe.",
  "Perte de force, fourmillements ou engourdissement dans un bras ou une jambe.",
  "Choc à la tête avec maux de tête, vertiges, nausées ou troubles de la vision : arrêt du contact et médecin sous 24 à 48 h.",
];
