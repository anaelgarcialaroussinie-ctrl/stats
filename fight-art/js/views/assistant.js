// Assistant : réponse immédiate tirée du contenu de l'appli + réponse personnalisée de l'IA (dans l'heure, de 8 h à minuit).
import { store } from "../store.js";
import { esc, icon, toast } from "../ui.js";
import { sync } from "../sync.js";
import { isMinor } from "../engine.js";
import { openVideoCoach } from "./video.js";
import { instantAnswer } from "../answer.js";
import { openExplorer } from "./systems.js";
import { openDiscussion } from "./discussion.js";
import { openGuide } from "../drill-guides.js";
import { openModule } from "./academy.js";

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
  { id: "video", label: "Analyse vidéo", ask: "Pour une analyse vidéo, utilise le bouton « Analyser une vidéo » ci-dessus.", now: ["Filme-toi en entier, de face puis de profil, avec une bonne lumière.", "Choisis les images clés : garde installée, entrée, fin de technique."] },
  { id: "autre", label: "Autre", ask: "Pose ta question librement.", now: ["Plus tu donnes de détails, plus la réponse sera adaptée."] },
];

let draft = "";
// sujet déduit des mots de la question (pour l'IA et le coach)
function guessTopic(t) {
  const n = t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (/(douleur|mal |blessure|blesse|choc|genou|epaule|cheville)/.test(n)) return "douleur";
  if (/(peur|stress|fige|panique|bloque|trac)/.test(n)) return "peur";
  if (/(manger|repas|calorie|proteine|poids|nutrition|faim|regime)/.test(n)) return "nutrition";
  if (/(squat|muscu|force|cardio|prepa|souffle|charge)/.test(n)) return "prepa";
  if (/(mental|confiance|moral|competition|pression)/.test(n)) return "mental";
  return "technique";
}

export function renderAssistant(el, ctx) {
  const p = store.get().profile;
  const live = sync.connected() && !window.FAP_PREVIEW;

  el.innerHTML = `
    <div class="row" style="margin:4px 0 10px"><button class="icon-btn" data-back aria-label="Retour">${icon("back")}</button></div>
    <h1 class="display">Coach perso</h1>
    <form data-ask class="panel stack" style="margin-top:12px">
      <label class="field"><span>Ta question</span><textarea class="input" name="body" rows="4" maxlength="3000" placeholder="Ex. J'ai du mal à rentrer en lutte, je subis toujours le sprawl.">${esc(draft)}</textarea></label>
      <div data-instant></div>
      <div data-send hidden class="stack" style="gap:8px">
        <button class="btn tape-btn block" ${live ? "" : "disabled"}>Réponse personnalisée de l'IA</button>
        <p class="tiny muted" style="margin:0">Elle tient compte de ton profil et de tes données, et arrive dans l'heure (de 8 h à minuit). Tu la retrouves en bas de cette page.</p>
        <label class="row small"><input type="checkbox" name="share" checked style="width:20px;height:20px"><span>Mon coach peut voir ma question et la réponse</span></label>
        ${live ? "" : `<p class="hint">${window.FAP_PREVIEW ? "Dans l'aperçu, l'envoi est désactivé." : "Relie ton téléphone à l'équipe (code d'équipe) pour envoyer ta question."}</p>`}
      </div>
    </form>
    <button class="panel row between" data-video style="width:100%;text-align:left;margin-top:12px"><div><div style="font-weight:700">Analyser une vidéo</div><div class="muted small">Le téléphone mesure ta posture, l'IA t'explique quoi corriger.</div></div><span class="icon-btn" style="background:var(--tape);color:var(--tape-ink);flex:none">${icon("camera")}</span></button>
    <p class="hint">Le coach perso conseille, il ne remplace ni un médecin, ni un kiné, ni un psychologue.${isMinor(p) ? " Pour les moins de 18 ans : ni régime, ni coupe de poids, ni compléments." : ""} En cas de détresse : 3114.</p>

    <h2 class="h-sec">Mes questions</h2>
    <div data-list class="stack"><p class="muted small">${live ? "Chargement…" : "Aucune question pour l'instant."}</p></div>
  `;

  const form = el.querySelector("[data-ask]"), box = el.querySelector("[data-instant]"), send = el.querySelector("[data-send]");
  let hits = [];
  const showInstant = () => {
    const q = form.body.value.trim(); draft = form.body.value;
    send.hidden = q.length < 8;
    if (q.length < 8) { box.innerHTML = ""; return; }
    hits = instantAnswer(q);
    box.innerHTML = hits.length ? `<div class="tiny" style="font-weight:700;color:var(--tape);margin:4px 0 6px">Réponse immédiate</div>
      ${hits.map((d, i) => `<div class="answer" style="margin-bottom:8px"><div class="tiny muted">${esc(d.kind)}</div><b>${esc(d.title)}</b>
        <ul class="bul" style="margin-top:4px">${d.lines.slice(0, 3).map((l) => `<li class="small">${esc(l)}</li>`).join("")}</ul>
        ${d.open ? `<button type="button" class="btn ghost small" data-open="${i}">Voir en détail</button>` : ""}</div>`).join("")}`
      : `<p class="tiny muted" style="margin:4px 0">Rien de précis dans l'appli sur ce sujet : envoie ta question à l'IA ci-dessous.</p>`;
  };
  let t;
  form.body.addEventListener("input", () => { clearTimeout(t); t = setTimeout(showInstant, 250); });
  box.addEventListener("click", (e) => {
    const b = e.target.closest("[data-open]"); if (!b) return;
    const o = hits[Number(b.dataset.open)].open;
    if (o.tech) openExplorer(o.tech, ctx.refresh);
    else if (o.weapon) openDiscussion({ w: o.weapon });
    else if (o.reaction) openDiscussion({ r: o.reaction });
    else if (o.question !== undefined) openDiscussion({ q: o.question });
    else if (o.guide) openGuide(o.guide, o.how);
    else if (o.module) openModule(o.module, ctx);
  });
  if (draft) showInstant();

  el.querySelector("[data-video]").addEventListener("click", () => openVideoCoach(ctx.refresh));
  el.querySelector("[data-back]").addEventListener("click", () => history.length > 1 ? history.back() : ctx.go("today"));
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = form.body.value.trim(); if (!body || !live) return;
    const btn = send.querySelector("button"); btn.disabled = true; btn.textContent = "Envoi…";
    try { await sync.ask(guessTopic(body), body, form.share.checked); draft = ""; toast("Question envoyée à l'IA"); ctx.refresh(); }
    catch (x) { btn.disabled = false; btn.textContent = "Réponse personnalisée de l'IA"; toast(x.code === "too_many" ? "Limite de 20 questions par jour atteinte" : "Envoi impossible : vérifie ta connexion"); }
  });

  if (live) sync.myQuestions().then((qs) => {
    const list = el.querySelector("[data-list]"); if (!list) return;
    list.innerHTML = qs.length ? qs.map((q) => `<section class="panel">
      <div class="row between"><span class="badge tiny">${esc(TOPICS.find((x) => x.id === q.topic)?.label || q.topic)}</span><span class="tiny muted">${esc(new Date(q.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</span></div>
      <p style="margin:10px 0">${esc(q.body)}</p>
      ${q.status === "answered" ? `<div class="answer"><div class="tiny" style="font-weight:700;margin-bottom:6px">Réponse de l'IA</div>${fmtAnswer(q.answer)}</div>` : `<p class="tiny muted" style="margin:0">Réponse de l'IA en préparation : elle arrive dans l'heure, entre 8 h et minuit.</p>`}
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
