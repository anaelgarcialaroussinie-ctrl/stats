// Assistant : aide immédiate par sujet + vraie réponse personnalisée (dans l'heure, de 8 h à minuit).
import { store } from "../store.js";
import { esc, icon, toast } from "../ui.js";
import { sync } from "../sync.js";
import { isMinor } from "../engine.js";

export const TOPICS = [
  { id: "technique", label: "Technique", ask: "Ex. Je n'arrive pas à finir mes double-leg contre la cage, je me fais guillotiner.",
    now: ["Décris la situation précise : position de départ, ce que fait l'adversaire, ce qui se passe ensuite.", "Regarde l'Academy : chaque combinaison classique indique ce qu'elle ouvre et ce qu'elle expose.", "Isole le problème en drill solo, puis en sparring positionnel en partant de cette situation."] },
  { id: "peur", label: "Peur, blocage", ask: "Ex. J'ai peur de prendre des coups en sparring, je me fige dès que ça accélère.",
    now: ["La peur est normale et se travaille : sparring léger et positionnel d'abord, l'intensité monte par étapes.", "Visualisation : 3 fois par semaine, imagine la situation en détail (lieu, tenue, vitesse réelle, émotions) et ta bonne réaction.", "Respiration lente quelques minutes avant la séance pour faire redescendre la tension.", "Parles-en à ton coach : il peut adapter les partenaires et les thèmes."] },
  { id: "nutrition", label: "Nutrition", ask: "Ex. Je n'ai pas faim le matin et je suis vidé à l'entraînement du midi.",
    now: ["Tes glucides suivent ta charge du jour : plus de féculents les jours de grosse séance.", "Vise une source de protéines à chaque repas, toutes les 3 à 4 heures.", "Avant l'entraînement (1 à 4 h avant) : un repas riche en glucides, pauvre en graisses et en fibres."] },
  { id: "prepa", label: "Prépa physique", ask: "Ex. Je stagne au squat depuis 3 semaines, et j'ai les jambes lourdes au club.",
    now: ["Regarde ta charge d'entraînement dans Progrès : une hausse brutale ou une semaine monotone fatiguent.", "Sépare explosivité et cardio d'au moins 3 heures quand c'est possible.", "Si toutes tes séries passent avec une intensité de 8 ou moins, la charge monte ; sinon on la garde."] },
  { id: "mental", label: "Mental", ask: "Ex. Je perds mes moyens en compétition alors qu'à l'entraînement tout va bien.",
    now: ["Une routine d'avant combat (échauffement, respiration, mots-clés) aide à retrouver ses repères sous pression.", "Fixe des objectifs de progression (un geste, une situation), pas seulement de résultat.", "Si le moral reste bas plusieurs jours, parles-en à ton coach ou à un professionnel. En cas de détresse, appelle le 3114 (gratuit, 24 h/24)."] },
  { id: "douleur", label: "Douleur, blessure", ask: "Ex. Douleur à l'épaule quand je fais des pompes depuis une semaine.",
    now: ["Évite le mouvement qui fait mal et signale la douleur dans ton check-in : ton programme s'adapte.", "Douleur qui dure plus de quelques jours, gonflement, déformation, perte de force, fourmillements : va voir un médecin ou un kiné.", "Choc à la tête avec maux de tête, vertiges ou nausées : arrête le contact et consulte un médecin dans les 24 à 48 h."] },
  { id: "autre", label: "Autre", ask: "Pose ta question librement.", now: ["Plus tu donnes de détails, plus la réponse sera adaptée."] },
];

let topic = "technique";

export function renderAssistant(el, ctx) {
  const p = store.get().profile;
  const t = TOPICS.find((x) => x.id === topic);
  const live = sync.connected() && !window.FAP_PREVIEW;

  el.innerHTML = `
    <div class="row" style="margin:4px 0 10px"><button class="icon-btn" data-back aria-label="Retour">${icon("back")}</button></div>
    <h1 class="display">Assistant</h1>
    <p class="muted" style="margin-top:8px">Parle de ce qui te bloque : un point technique, une peur, ta nutrition, ta prépa, ton mental. L'assistant connaît ton profil et tes données. Il te répond dans l'appli, en général dans l'heure, entre 8 h et minuit.</p>

    <h2 class="h-sec">De quoi veux-tu parler ?</h2>
    <div class="chips">${TOPICS.map((x) => `<button class="chip" data-topic="${x.id}" aria-pressed="${x.id === topic}">${esc(x.label)}</button>`).join("")}</div>

    <section class="panel" style="margin-top:14px">
      <h3>Tout de suite</h3>
      <ul class="bul" style="margin-top:8px">${t.now.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    </section>

    <form data-ask class="panel stack" style="margin-top:12px">
      <label class="field"><span>Ta question</span><textarea class="input" name="body" rows="5" maxlength="3000" placeholder="${esc(t.ask)}"></textarea></label>
      <label class="row small"><input type="checkbox" name="share" checked style="width:20px;height:20px"><span>Mon coach peut voir ma question et la réponse</span></label>
      <button class="btn tape-btn block" ${live ? "" : "disabled"}>Envoyer à l'assistant</button>
      ${live ? "" : `<p class="hint">${window.FAP_PREVIEW ? "Dans l'aperçu, l'envoi est désactivé." : "Relie ton téléphone à l'équipe (code d'équipe) pour poser des questions."}</p>`}
    </form>
    <p class="hint">L'assistant conseille, il ne remplace ni un médecin, ni un kiné, ni un psychologue.${isMinor(p) ? " Pour les moins de 18 ans, il ne donne ni régime, ni coupe de poids, ni compléments." : ""} En cas de détresse : 3114.</p>

    <h2 class="h-sec">Mes questions</h2>
    <div data-list class="stack"><p class="muted small">${live ? "Chargement…" : "Aucune question pour l'instant."}</p></div>
  `;

  el.querySelector("[data-back]").addEventListener("click", () => history.length > 1 ? history.back() : ctx.go("today"));
  el.querySelectorAll("[data-topic]").forEach((b) => b.addEventListener("click", () => { topic = b.dataset.topic; ctx.refresh(); }));
  el.querySelector("[data-ask]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = e.target.body.value.trim(); if (!body || !live) return;
    const btn = e.target.querySelector("button"); btn.disabled = true; btn.textContent = "Envoi…";
    try { await sync.ask(topic, body, e.target.share.checked); toast("Question envoyée"); ctx.refresh(); }
    catch (x) { btn.disabled = false; btn.textContent = "Envoyer à l'assistant"; toast(x.code === "too_many" ? "Limite de 20 questions par jour atteinte" : "Envoi impossible : vérifie ta connexion"); }
  });

  if (live) sync.myQuestions().then((qs) => {
    const list = el.querySelector("[data-list]"); if (!list) return;
    list.innerHTML = qs.length ? qs.map((q) => `<section class="panel">
      <div class="row between"><span class="badge tiny">${esc(TOPICS.find((x) => x.id === q.topic)?.label || q.topic)}</span><span class="tiny muted">${esc(new Date(q.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</span></div>
      <p style="margin:10px 0">${esc(q.body)}</p>
      ${q.status === "answered" ? `<div class="answer"><div class="tiny" style="font-weight:700;margin-bottom:6px">Réponse de l'assistant</div>${fmtAnswer(q.answer)}</div>` : `<p class="tiny muted" style="margin:0">En attente de réponse : en général dans l'heure, entre 8 h et minuit.</p>`}
    </section>`).join("") : `<p class="muted small">Aucune question pour l'instant.</p>`;
  }).catch(() => { const list = el.querySelector("[data-list]"); if (list) list.innerHTML = `<p class="notice is-warn small">Impossible de charger tes questions. Vérifie ta connexion.</p>`; });
}

// mise en forme simple : paragraphes et listes à tirets
export function fmtAnswer(text = "") {
  return esc(text).split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    if (lines.every((l) => /^\s*[-•]\s+/.test(l))) return `<ul class="bul">${lines.map((l) => `<li>${l.replace(/^\s*[-•]\s+/, "")}</li>`).join("")}</ul>`;
    return `<p>${lines.join("<br>")}</p>`;
  }).join("");
}
