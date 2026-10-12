// Mes notes d'étude : sous chaque contenu de l'Academy, ce que je retiens, avec mes mots.
// Gardées dans le compte (suivent sur tous les appareils), lisibles aussi par le coach.
import { store } from "./store.js";
import { esc } from "./ui.js";

export const studyNotes = () => store.get().studyNotes || {};

// bloc de notes repliable ; ouvert d'office quand il y a déjà quelque chose d'écrit
export function myNote(key, label, { placeholder = "Ce que je retiens, avec mes mots…" } = {}) {
  const n = studyNotes()[key];
  return `<details class="mynote"${n?.t ? " open" : ""}><summary class="tiny">Mes notes${n?.t ? "" : " · ajouter"}</summary>
    <textarea class="input" rows="3" maxlength="4000" data-mynote="${esc(key)}" data-label="${esc(label)}" placeholder="${esc(placeholder)}">${esc(n?.t || "")}</textarea>
  </details>`;
}

// une seule écoute pour toute l'appli : chaque frappe est enregistrée après une courte pause
const timers = {};
document.addEventListener("input", (e) => {
  const ta = e.target.closest?.("[data-mynote]"); if (!ta) return;
  const key = ta.dataset.mynote, label = ta.dataset.label;
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => store.update((s) => {
    const t = ta.value.trim();
    s.studyNotes = { ...(s.studyNotes || {}) };
    if (t) s.studyNotes[key] = { t, label, at: new Date().toISOString() }; else delete s.studyNotes[key];
  }), 600);
});
