// Mon jeu : tout communique. Une fiche technique, un combo ou une technique de la carte peut devenir le point de départ
// d'un système ; chaque problème du système se règle avec une technique, une fiche ou un combo.
// Références : « n:<id> » fiche, « c:<id> » combo, « x:<texte> » texte libre, sinon id de technique (carte).
import { store } from "./store.js";
import { esc } from "./ui.js";
import { tech, TECHS, FAMILIES } from "./systems-data.js";

export const ROLES = [
  { id: "off", label: "Offensif", short: "Attaque" },
  { id: "def", label: "Défensif", short: "Défense" },
];
export const roleLabel = (id) => ROLES.find((r) => r.id === id)?.label || "Offensif et défensif";

// rôle de chaque élément ; « both » = les deux
export const noteRole = (n) => n.role || (n.cat === "Défense" ? "def" : "both");
export const comboRole = (c) => c.role || (c.zone === "Défense" ? "def" : "off");
export const matchRole = (role, filter) => filter === "all" || role === filter || role === "both";

export function refKind(ref) {
  const s = String(ref || "");
  const i = s.indexOf(":");
  return i > 0 && ["n", "c", "x", "t"].includes(s.slice(0, i)) ? s.slice(0, i) : "t";
}
const refVal = (ref) => { const s = String(ref || ""); return refKind(s) === "t" && !s.startsWith("t:") ? s : s.slice(s.indexOf(":") + 1); };

export function refName(ref, src = store.get()) {
  if (!ref) return "";
  const k = refKind(ref), v = refVal(ref);
  if (k === "n") return (src.notes || []).find((n) => n.id === v)?.title || "Fiche supprimée";
  if (k === "c") return (src.combos || []).find((c) => c.id === v)?.name || "Combo supprimé";
  if (k === "x") return v;
  return tech(v)?.name || v;
}
export const refTag = (ref) => ({ n: "Ma fiche", c: "Mon combo", x: "", t: "" })[refKind(ref)];
export const findNote = (id, src = store.get()) => (src.notes || []).find((n) => n.id === id);
export const findCombo = (id, src = store.get()) => (src.combos || []).find((c) => c.id === id);

// systèmes reliés à un élément
export const systemsFrom = (ref, src = store.get()) => (src.systems || []).filter((s) => s.root === ref);
export const systemsUsing = (ref, src = store.get()) => (src.systems || []).filter((s) => s.root !== ref && s.branches.some((b) => b.answer === ref || b.reaction === ref));

// liste déroulante : mes fiches, mes combos, les techniques de la carte (+ options spéciales)
export function refOptions(sel, { free = true, newNote = true, empty = "Choisir…" } = {}) {
  const st = store.get();
  const notes = [...(st.notes || [])].sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  const combos = st.combos || [];
  const o = (v, l) => `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(l)}</option>`;
  return o("", empty)
    + (free ? o("__free", "✎ J'écris moi-même…") : "")
    + (newNote ? o("__newnote", "+ Nouvelle fiche technique…") : "")
    + (notes.length ? `<optgroup label="Mes fiches techniques">${notes.map((n) => o(`n:${n.id}`, n.title || "Sans titre")).join("")}</optgroup>` : "")
    + (combos.length ? `<optgroup label="Mes combos">${combos.map((c) => o(`c:${c.id}`, c.name)).join("")}</optgroup>` : "")
    + FAMILIES.map((f) => `<optgroup label="Techniques · ${esc(f.label)}">${TECHS.filter((t) => t.family === f.id).map((t) => o(t.id, t.name)).join("")}</optgroup>`).join("");
}
