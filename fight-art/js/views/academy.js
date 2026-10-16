import { store, uid, todayKey } from "../store.js";
import { myNote, studyNotes } from "../study-notes.js";
import { openLocalVideos } from "./localvids.js";
import { openParcoursClub } from "./parcours-club.js";
import { openParcoursMMA } from "./parcours-mma.js";
import { esc, icon, openSheet, closeSheet, toast, segBar, bindSeg } from "../ui.js";
import { ZONES, STANCES, PROFILES, MOVES, CLASSIC_COMBOS, ARTS, SCOUT_FIELDS, PLAN_FIELDS } from "../academy-data.js";
import { runTimer } from "./timer.js";
import { frDate } from "../engine.js";
import { openExplorer, editSystem, systemTree, drillSystem } from "./systems.js";
import { LUTA_INTRO, GLOSSARY, LESSON, GRADES, CYCLES } from "../luta-data.js";
import { sync } from "../sync.js";
import { openDiscussion } from "./discussion.js";
import { openModel, openModelSearch, faceSlot, fillFaces } from "./models.js";
import { openStyleLab, openStyle, programWeek, openProgram } from "./stylelab.js";
import { openNote, openNoteRead, openNotesList, noteCard } from "./notes.js";
import { ROLES, roleLabel, noteRole, comboRole, matchRole, systemsFrom, systemsUsing, refName, refTag } from "../game.js";

const moveLabel = (id) => MOVES.find((m) => m.id === id)?.label || id;
const moveName = (id) => MOVES.find((m) => m.id === id)?.name || id;
const seqHtml = (seq) => `<span class="seq">${seq.map((m) => `<span class="mv">${esc(moveLabel(m))}</span>`).join("")}</span>`;

const MODULES = [
  { id: "zones", title: "Les zones du combat", text: "Distance, clinch, sol : ce qui s'y joue, les chiffres, les dangers." },
  { id: "stances", title: "Gardes et attitudes", text: "Orthodoxe, gaucher, switch, garde hybride MMA, posture de lutte." },
  { id: "profiles", title: "Les profils de combattants", text: "Les 5 styles qui ressortent de l'analyse UFC, et comment les contrer." },
  { id: "combos", title: "Combinaisons classiques", text: "Ce que chaque enchaînement ouvre, ce qu'il expose." },
  { id: "luta", title: "Luta Livre", text: "Vocabulaire, programme des ceintures, cycle de lutte 6 semaines, cycle montée 4 semaines, structure d'un cours." },
  { id: "arts", title: "Les arts du MMA", text: "Ce que la boxe, le muay thaï, la lutte, le judo, le jiu-jitsu et la Luta Livre apportent." },
];

export function renderAcademy(el, ctx) {
  const st = store.get();
  let jr = "all"; try { jr = localStorage.getItem("fap:jeuRole") || "all"; } catch {}
  const allCombos = st.combos || [];
  const combos = allCombos.filter((c) => matchRole(comboRole(c), jr));
  const myNotes = (st.notes || []).filter((n) => matchRole(noteRole(n), jr));
  const scouts = st.scouting || [];
  const allSystems = st.systems || [];
  const systems = allSystems.filter((x) => jr === "all" || x.type === jr);
  const sysCount = (ref) => systemsFrom(ref).length;
  const seg = segBar("academy", [["jeu", "Mon jeu"], ["comprendre", "Comprendre"], ["modeles", "Modèles"], ["videos", "Vidéos"]], "jeu");

  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 10px">Academy</h1>
    ${seg.html}
    <div data-seg="jeu">
    <section class="panel jeu-method" style="margin-top:12px">
      <b>Construire son jeu, pas à pas</b>
      <ol class="plan-steps" style="margin:6px 0 0">
        <li class="small"><b>Note</b> une technique (fiche) ou un enchaînement (combo), offensif ou défensif.</li>
        <li class="small"><b>Décortique</b> : quels problèmes ça t'amène ? ses réactions, ce qui coince.</li>
        <li class="small"><b>Règle</b> chaque problème avec une technique, une fiche ou un combo (ou crée la fiche au passage).</li>
        <li class="small"><b>Ton système est complet</b> : drille-le, puis teste-le en sparring.</li>
      </ol>
    </section>
    <div class="chips" style="margin-top:12px" role="group" aria-label="Classer">${[["all", "Tout mon jeu"], ...ROLES.map((r) => [r.id, r.label])].map(([id, l]) => `<button class="chip" data-jr="${id}" aria-pressed="${jr === id}">${esc(l)}</button>`).join("")}</div>
    <h2 class="h-sec">Mes fiches techniques</h2>
    <section class="panel">
      ${myNotes.length ? `<ul class="list">${[...myNotes].sort((a, b) => (b.updatedAt || b.date || "").localeCompare(a.updatedAt || a.date || "")).slice(0, 4).map((n) => `<li role="button" tabindex="0" data-note="${n.id}">${noteCard(n)}${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>
        ${(st.notes || []).length > 4 || jr !== "all" ? `<button class="btn ghost block small" data-notes style="margin-top:8px">Toutes mes fiches, par catégorie (${(st.notes || []).length})</button>` : ""}` : (st.notes || []).length ? `<p class="muted small">Aucune fiche ${jr === "def" ? "défensive" : "offensive"} pour l'instant.</p>` : `<p class="muted small" style="margin:0 0 4px">Après un cours ou une vidéo : les points importants d'une technique, ton ressenti, tes problèmes et comment les régler. Tout est gardé, et ton coach peut t'aider.</p>`}
      <button class="btn tape-btn block" data-newnote style="margin-top:12px">${icon("plus")} Nouvelle fiche</button>
    </section>

    <h2 class="h-sec">Mes combos fétiches</h2>
    <section class="panel">
      ${combos.length ? `<ul class="list">${combos.map((c) => { const ns = sysCount(`c:${c.id}`); return `<li style="flex-wrap:wrap">
        <div style="min-width:0;flex:1"><div style="font-weight:700">${esc(c.name)}</div>${seqHtml(c.seq)}<div class="meta" style="margin-top:4px"><span class="role-pill r-${comboRole(c)}">${esc(roleLabel(comboRole(c)))}</span>${c.when ? " " + esc(c.when) : ""}</div></div>
        <div class="row" style="gap:6px;flex:none"><button class="icon-btn" data-drill="${c.id}" aria-label="Driller ${esc(c.name)}">${icon("play")}</button><button class="icon-btn" data-edit="${c.id}" aria-label="Modifier">${icon("edit")}</button></div>
        <button class="btn small ${ns ? "ghost" : ""}" data-decort="${c.id}" style="width:100%;margin-top:8px">${ns ? `Son système : ${systemsFrom(`c:${c.id}`)[0].branches.length} problème(s) réglé(s)` : "Décortiquer : problèmes et solutions"}</button>
      </li>`; }).join("")}</ul>` : allCombos.length ? `<p class="muted small">Aucun combo ${jr === "def" ? "défensif" : "offensif"} pour l'instant.</p>` : `<p class="muted small" style="margin:0 0 4px">Note les enchaînements qui marchent pour toi, puis drille-les au minuteur. Ton coach les voit aussi.</p>`}
      <button class="btn tape-btn block" data-newcombo style="margin-top:12px">${icon("plus")} Noter un combo</button>
    </section>

    </div><div data-seg="comprendre">
    <h2 class="h-sec">Le combat comme une discussion</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Une combinaison pose une question, sa réaction ouvre une faille, ton arme décisive vient l'exploiter. Backfist, retournés, genou sauté, check hook… : quand, pourquoi, ce que tu risques.</p>
      <div class="grid3 disc-grid">
        <button class="btn tape-btn small" data-disc="questions">Combinaisons</button>
        <button class="btn ghost small" data-disc="reactions">Réactions</button>
        <button class="btn ghost small" data-disc="weapons">Armes</button>
      </div>
    </section>

    <h2 class="h-sec">Mes notes d'étude</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Sous chaque contenu de l'Academy (zones, gardes, combinaisons, Luta Livre, techniques, armes, modèles UFC, vidéos), touche « Mes notes » pour écrire ce que tu as compris, avec tes mots. Elles te suivent sur tous tes appareils ; ton coach peut les lire pour t'aider.</p>
      ${Object.keys(st.studyNotes || {}).length ? `<button class="btn tape-btn block" data-studynotes>Relire mes ${Object.keys(st.studyNotes).length} note${Object.keys(st.studyNotes).length > 1 ? "s" : ""}</button>` : `<p class="tiny muted" style="margin:0">Aucune note pour l'instant.</p>`}
    </section>

    </div><div data-seg="modeles">
    <h2 class="h-sec">Mes modèles UFC</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Choisis tes combattants préférés : comment ils gagnent, où et d'où ils frappent, leurs chiffres comparés à leur catégorie, et ce que tu peux leur piquer.</p>
      ${(st.favFighters || []).length ? `<ul class="list">${st.favFighters.map((n) => `<li role="button" tabindex="0" data-model="${esc(n)}">${faceSlot(n)}<div style="font-weight:700;flex:1">${esc(n)}</div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>` : ""}
      <button class="btn ${(st.favFighters || []).length ? "ghost" : "tape-btn"} block" data-models style="margin-top:10px">${icon("search")} ${(st.favFighters || []).length ? "Ajouter un modèle" : "Choisir mes modèles"}</button>
    </section>

    <h2 class="h-sec">Labo de style</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Mélange plusieurs combattants, croise leurs chiffres avec ton gabarit et ton profil : l'appli en tire un style, ses piliers, ses armes et un plan pour le travailler. Crée-en autant que tu veux.</p>
      ${(st.styles || []).length ? `<ul class="list">${st.styles.map((x) => `<li role="button" tabindex="0" data-style="${x.id}"><div style="min-width:0;flex:1"><div style="font-weight:700">${esc(x.name)}${st.program?.styleId === x.id ? ` <span class="insigne">programme en cours</span>` : ""}</div><div class="meta">${esc(x.fighters.join(" + "))}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>` : ""}
      <button class="btn tape-btn block" data-lab style="margin-top:10px">${icon("plus")} Créer un style</button>
    </section>

    </div><div data-seg="jeu2">
    <h2 class="h-sec">Mes systèmes</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Un système, c'est ton plan à l'avance : <b>je lance ceci ; s'il réagit comme ça, je règle avec cela.</b> Le point de départ peut être une technique, une de tes fiches ou un de tes combos ; chaque problème se règle avec une technique, une fiche ou un combo.</p>
      <button class="btn tape-btn block" data-explore>${icon("search")} Risques et ouvertures des techniques</button>
      ${systems.length ? `<div class="stack" style="margin-top:12px">${systems.map((x) => `<details class="sys-card"><summary><span><b>${esc(x.name)}</b><span class="tiny muted" style="display:block">${x.type === "off" ? "Attaque" : "Défense"}${refTag(x.root) ? ` · depuis ${refTag(x.root).toLowerCase()}` : ""} · ${x.branches.length} ${x.type === "off" ? "problème" : "scénario"}${x.branches.length > 1 ? "s" : ""}</span></span></summary>
        ${systemTree(x, { links: true })}
        <div class="row" style="margin-top:10px"><button class="btn small" data-drillsys="${x.id}">${icon("play")} Driller</button><button class="btn ghost small" data-editsys="${x.id}">Modifier</button></div></details>`).join("")}</div>` : ""}
      <button class="btn ghost block" data-newsys style="margin-top:10px">${icon("plus")} Créer un système</button>
    </section>

    </div><div data-seg="comprendre2">
    <h2 class="h-sec">Étudier le combat</h2>
    <section class="panel" style="padding:4px 16px">
      <ul class="list">${MODULES.map((m) => `<li role="button" tabindex="0" data-mod="${m.id}"><div><div style="font-weight:700">${esc(m.title)}</div><div class="meta">${esc(m.text)}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>
    </section>

    </div><div data-seg="videos">
    <h2 class="h-sec">Vidéothèque du club</h2>
    <section class="panel" style="margin-bottom:12px;border-left:4px solid var(--tape)">
      <b>Parcours Fight Art</b>
      <p class="muted small" style="margin:4px 0 10px">Les meilleures vidéos gratuites des références (Renier, Danaher, Lachlan Giles, Gordon Ryan, Ryan Hall, John Smith), en français ou sous-titrées, de la ceinture blanche à la violette, avec les points importants.</p>
      <button class="btn tape-btn block" data-parcours>Ouvrir le parcours</button>
    </section>
    <section class="panel" style="margin-bottom:12px;border-left:4px solid #F25F5C">
      <b>Cursus vidéo MMA</b>
      <p class="muted small" style="margin:4px 0 10px">Les références du MMA (Jeff Chan / MMA Shredded, Georges St-Pierre, Firas Zahabi, Shane Fazen…) et des pros français, en français ou sous-titrées : par niveau du programme, par catégorie et par situation, reliées aux techniques et combinés de l'appli.</p>
      <button class="btn tape-btn block" data-mmacursus>Ouvrir le cursus MMA</button>
    </section>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Les vidéos choisies par le coach. Pour chacune : regarde, isole le geste en drill, teste-le en sparring à thème, puis en sparring libre, et note ce qui a marché.</p>
      <div data-links><p class="muted small">${sync.connected() && !window.FAP_PREVIEW ? "Chargement…" : "Relie ton téléphone à l'équipe pour voir la vidéothèque."}</p></div>
      ${sync.role() === "coach" ? `<button class="btn ghost block" data-addlink style="margin-top:10px">${icon("plus")} Ajouter une vidéo</button>` : ""}
    </section>

    ${sync.role() === "coach" ? `<h2 class="h-sec">Ma formation vidéo</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Certification Luta Livre de Nicolas Renier : les 85 vidéos rangées par module, avec tes notes. Visible par toi seul.</p>
      <button class="btn tape-btn block" data-library>${icon("play")} Ouvrir la formation</button>
    </section>
    <h2 class="h-sec">Ma vidéothèque privée</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:10px">Tes séminaires et instructionals, lus directement sur ton disque dur depuis ton ordinateur, rangés par dossier, avec tes notes. Visible par toi seul, rien n'est mis en ligne.</p>
      <button class="btn tape-btn block" data-localvids>${icon("play")} Ouvrir ma vidéothèque</button>
    </section>` : ""}

    </div><div data-seg="jeu3">
    <h2 class="h-sec">Préparer un adversaire</h2>
    <section class="panel">
      <p class="muted small" style="margin-bottom:8px">Fiche d'analyse et game plan : garde, attaques favorites, réactions sous pression, plan A et plan B.</p>
      ${scouts.length ? `<ul class="list">${scouts.map((s) => `<li role="button" tabindex="0" data-scout="${s.id}"><div><div style="font-weight:700">${esc(s.opponent || "Adversaire")}</div><div class="meta">${s.date ? "Combat le " + esc(frDate(s.date, { day: "numeric", month: "long" })) : "Sans date"}</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>` : ""}
      <button class="btn ghost block" data-newscout style="margin-top:10px">${icon("plus")} Nouvelle fiche adversaire</button>
    </section>
    </div>
  `;
  // plusieurs blocs par sous-onglet : on les regroupe sous le même identifiant
  el.querySelectorAll("[data-seg]").forEach((b) => { b.dataset.seg = b.dataset.seg.replace(/\d+$/, ""); });
  bindSeg(el, "academy", seg.cur);

  el.querySelector("[data-newnote]").addEventListener("click", () => openNote(null, ctx.refresh));
  el.querySelector("[data-studynotes]")?.addEventListener("click", () => openStudyNotes(ctx.refresh));
  el.querySelector("[data-notes]")?.addEventListener("click", () => openNotesList(ctx.refresh));
  el.querySelectorAll("[data-note]").forEach((li) => li.addEventListener("click", () => openNoteRead((st.notes || []).find((n) => n.id === li.dataset.note), ctx.refresh)));
  el.querySelector("[data-newcombo]").addEventListener("click", () => editCombo(null, ctx.refresh));
  el.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => editCombo(combos.find((c) => c.id === b.dataset.edit), ctx.refresh)));
  el.querySelectorAll("[data-jr]").forEach((b) => b.addEventListener("click", () => { try { localStorage.setItem("fap:jeuRole", b.dataset.jr); } catch {} ctx.refresh(); }));
  el.querySelectorAll("[data-decort]").forEach((b) => b.addEventListener("click", () => { const c = combos.find((x) => x.id === b.dataset.decort); const own = systemsFrom(`c:${c.id}`)[0]; editSystem(own || null, ctx.refresh, own ? {} : { root: `c:${c.id}`, type: comboRole(c) }); }));
  el.querySelectorAll("[data-drill]").forEach((b) => b.addEventListener("click", () => drillCombo(combos.find((c) => c.id === b.dataset.drill))));
  el.querySelectorAll("[data-mod]").forEach((li) => li.addEventListener("click", () => openModule(li.dataset.mod, ctx)));
  el.querySelector("[data-explore]").addEventListener("click", () => openExplorer(null, ctx.refresh));
  el.querySelector("[data-newsys]").addEventListener("click", () => editSystem(null, ctx.refresh));
  el.querySelectorAll("[data-editsys]").forEach((b) => b.addEventListener("click", () => editSystem(allSystems.find((x) => x.id === b.dataset.editsys), ctx.refresh)));
  el.querySelectorAll("[data-drillsys]").forEach((b) => b.addEventListener("click", () => drillSystem(allSystems.find((x) => x.id === b.dataset.drillsys))));
  el.querySelectorAll("[data-disc]").forEach((b) => b.addEventListener("click", () => openDiscussion({ tab: b.dataset.disc }, (preset) => editCombo(null, ctx.refresh, preset))));
  const trap = (preset) => editCombo(null, ctx.refresh, preset);
  el.querySelector("[data-models]").addEventListener("click", () => openModelSearch(trap, ctx.refresh));
  fillFaces(el);
  el.querySelector("[data-lab]").addEventListener("click", () => openStyleLab(null, trap, ctx.refresh));
  el.querySelectorAll("[data-style]").forEach((li) => li.addEventListener("click", () => openStyle((st.styles || []).find((x) => x.id === li.dataset.style), trap, ctx.refresh)));
  el.querySelectorAll("[data-model]").forEach((li) => li.addEventListener("click", () => openModel(li.dataset.model, trap, ctx.refresh)));
  el.querySelector("[data-library]")?.addEventListener("click", openLibrary);
  el.querySelector("[data-localvids]")?.addEventListener("click", openLocalVideos);
  el.querySelector("[data-parcours]")?.addEventListener("click", openParcoursClub);
  el.querySelector("[data-mmacursus]")?.addEventListener("click", openParcoursMMA);
  el.querySelector("[data-addlink]")?.addEventListener("click", () => editLink(null, ctx.refresh));
  drawLinks(el, ctx);
  el.querySelector("[data-newscout]").addEventListener("click", () => editScout(null, ctx.refresh));
  el.querySelectorAll("[data-scout]").forEach((li) => li.addEventListener("click", () => editScout(scouts.find((s) => s.id === li.dataset.scout), ctx.refresh)));
}

// ---------- combos ----------
function drillCombo(c) {
  runTimer({ work: 30, rest: 30, rounds: 6, title: c.name, names: [c.seq.map(moveName).join(", ")] });
}

export function editCombo(existing, after, preset) {
  const c = existing ? { ...existing, seq: [...existing.seq] } : { id: uid(), name: preset?.name || "", seq: preset?.seq ? [...preset.seq] : [], when: preset?.when || "", zone: preset?.zone || "Distance", role: preset?.role || "off", createdAt: todayKey() };
  c.role = comboRole(c);
  const own = existing ? systemsFrom(`c:${c.id}`)[0] : null;
  const body = openSheet(existing ? "Modifier le combo" : "Noter un combo", `
    <form data-combo class="stack">
      <label class="field"><span>Nom</span><input class="input" name="name" value="${esc(c.name)}" placeholder="Ex. Mon entrée en double-leg"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Enchaînement</span>
        <div class="panel" data-seqbox style="min-height:56px;display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px"></div>
        <p class="hint">Touche les coups dans l'ordre. 1 jab · 2 direct · 3 crochet avant · 4 crochet arrière · 5 et 6 uppercuts.</p>
        <div class="chips" style="margin-top:8px">${MOVES.map((m) => `<button type="button" class="chip" data-move="${m.id}" title="${esc(m.name)}">${esc(m.label)}</button>`).join("")}</div>
      </div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Offensif ou défensif ?</span><div class="chips">${ROLES.map((r) => `<button type="button" class="chip" data-role="${r.id}" aria-pressed="${r.id === c.role}">${esc(r.label)}</button>`).join("")}</div></div>
      <label class="field"><span>Zone</span><select class="input" name="zone">${["Distance", "Distance → sol", "Clinch", "Clinch → sol", "Sol", "Défense"].map((z) => `<option ${z === c.zone ? "selected" : ""}>${z}</option>`).join("")}</select></label>
      <label class="field"><span>Quand je l'utilise</span><textarea class="input" name="when" rows="2" placeholder="Ex. Quand il recule en ligne droite">${esc(c.when)}</textarea></label>
      <button class="btn tape-btn block">Enregistrer</button>
      <button type="button" class="btn ghost block" data-savesys>${icon("plus")} ${own ? "Enregistrer et voir son système" : "Enregistrer et décortiquer : problèmes et solutions"}</button>
      ${own ? `<h3 class="sys-h">Son système</h3>${systemTree(own, { links: true })}` : ""}
      ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce combo</button>` : ""}
    </form>`);
  const box = body.querySelector("[data-seqbox]");
  const draw = () => {
    box.innerHTML = c.seq.length ? `${seqHtml(c.seq)}<button type="button" class="icon-btn" data-undo aria-label="Retirer le dernier coup">${icon("back")}</button>` : `<span class="muted small">Aucun coup pour l'instant</span>`;
    box.querySelector("[data-undo]")?.addEventListener("click", () => { c.seq.pop(); draw(); });
  };
  draw();
  const form = body.querySelector("[data-combo]");
  form.addEventListener("click", (e) => {
    const m = e.target.closest("[data-move]"); if (m) { c.seq.push(m.dataset.move); draw(); }
    const ro = e.target.closest("[data-role]"); if (ro) { c.role = ro.dataset.role; form.querySelectorAll("[data-role]").forEach((b) => b.setAttribute("aria-pressed", b === ro)); return; }
    if (e.target.closest("[data-savesys]")) { if (!saveIt()) return; const sys = systemsFrom(`c:${c.id}`)[0]; editSystem(sys || null, after, sys ? {} : { root: `c:${c.id}`, type: c.role }); return; }
    const d = e.target.closest("[data-del]");
    if (d) {
      if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; }
      store.update((s) => { s.combos = (s.combos || []).filter((x) => x.id !== c.id); }); closeSheet(); toast("Combo supprimé"); after?.();
    }
  });
  const saveIt = () => {
    c.name = form.elements.name.value.trim() || c.seq.map(moveLabel).join("-") || "Mon combo";
    c.when = form.elements.when.value.trim(); c.zone = form.elements.zone.value;
    if (!c.seq.length) { toast("Ajoute au moins un coup"); return false; }
    store.update((s) => { s.combos = [...(s.combos || []).filter((x) => x.id !== c.id), c]; });
    return true;
  };
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!saveIt()) return;
    closeSheet(); toast("Combo enregistré"); after?.();
  });
}

// ---------- modules ----------
export function openModule(id, ctx) {
  if (id === "zones") return openSheet("Les zones du combat", ZONES.map((z) => `
    <section class="panel" style="margin-bottom:12px">
      <h3 class="display" style="font-size:24px">${esc(z.title)}</h3>
      <p class="small" style="margin-top:6px">${esc(z.lead)}</p>
      ${z.ranges.map((r) => `<p class="small"><b>${esc(r.name)}</b> : ${esc(r.text)}</p>`).join("")}
      <div class="grid2 zone-grid" style="margin-top:8px">
        <div><div class="tiny muted">Objectifs</div><ul class="bul">${z.goals.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
        <div><div class="tiny muted">Techniques clés</div><ul class="bul">${z.keys.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
      </div>
      <div class="notice is-alert small" style="margin-top:10px"><b>Dangers</b> : ${z.dangers.map(esc).join(" · ")}</div>
      ${myNote(`zone:${z.title}`, `Zones · ${z.title}`)}
    </section>`).join(""));

  if (id === "stances") return openSheet("Gardes et attitudes", STANCES.map((s) => `
    <section class="panel" style="margin-bottom:10px"><h3>${esc(s.name)}</h3><p class="small" style="margin:6px 0">${esc(s.text)}</p><p class="tiny muted" style="margin:0">À retenir : ${esc(s.tip)}</p>${myNote(`stance:${s.name}`, `Gardes · ${s.name}`)}</section>`).join(""));

  if (id === "profiles") return openSheet("Les profils de combattants", `
    <p class="muted small">Regroupement automatique de 1 073 combattants UFC selon leur façon de combattre (analyse Fight Art Performance). Des tendances, pas des règles.</p>
    ${PROFILES.map((p) => `<section class="panel" style="margin-top:10px"><h3>${esc(p.name)}</h3><p class="small" style="margin:6px 0">${esc(p.how)}</p><p class="tiny muted">Gabarit : ${esc(p.body)}</p><p class="small" style="margin:0"><b>Pour le battre</b> : ${esc(p.beat)}</p>${myNote(`profile:${p.name}`, `Profils · ${p.name}`)}</section>`).join("")}`);

  if (id === "combos") {
    const body = openSheet("Combinaisons classiques", `
      <p class="muted small">Touche « Ajouter à mes combos » pour l'enregistrer et la driller.</p>
      ${CLASSIC_COMBOS.map((c, i) => `<section class="panel" style="margin-top:10px">
        <div class="row between" style="align-items:flex-start"><div><h3>${esc(c.name)}</h3><div style="margin-top:6px">${seqHtml(c.seq)}</div></div><span class="badge tiny">${esc(c.zone)}</span></div>
        <p class="small" style="margin:10px 0 4px"><b>Ce qu'il ouvre</b> : ${esc(c.opens)}</p>
        <p class="small" style="margin:0 0 4px"><b>Ce qu'il expose</b> : ${esc(c.exposes)}</p>
        <p class="tiny muted">${esc(c.tip)}</p>
        <button class="btn ghost small" data-take="${i}">${icon("plus")} Ajouter à mes combos</button>${myNote(`combo:${c.name}`, `Combinaisons · ${c.name}`)}</section>`).join("")}`);
    body.addEventListener("click", (e) => { const b = e.target.closest("[data-take]"); if (b) editCombo(null, ctx.refresh, CLASSIC_COMBOS[b.dataset.take]); });
    return;
  }

  if (id === "luta") return openLuta();
  if (id === "arts") return openSheet("Les arts du MMA", ARTS.map((a) => `
    <section class="panel" style="margin-bottom:10px"><h3>${esc(a.name)}</h3><p class="small" style="margin:6px 0"><b>Ce qu'il apporte</b> : ${esc(a.brings)}</p><p class="small" style="margin:0"><b>À adapter au MMA</b> : ${esc(a.adapt)}</p>${myNote(`art:${a.name}`, `Arts du MMA · ${a.name}`)}</section>`).join(""));
}

// ---------- mes notes d'étude : tout relire au même endroit ----------
function openStudyNotes(after) {
  const list = Object.entries(studyNotes()).sort((a, b) => (b[1].at || "").localeCompare(a[1].at || ""));
  const groups = {};
  list.forEach(([k, n]) => { const g = (n.label || "Autre").split(" · ")[0]; (groups[g] ||= []).push([k, n]); });
  openSheet("Mes notes d'étude", list.length ? Object.entries(groups).map(([g, items]) => `<h3 class="sys-h">${esc(g)}</h3>
    ${items.map(([k, n]) => `<section class="panel" style="padding:12px;margin-top:8px"><b class="small">${esc((n.label || "").split(" · ").slice(1).join(" · ") || n.label || "")}</b>
      <textarea class="input" rows="3" maxlength="4000" data-mynote="${esc(k)}" data-label="${esc(n.label || "")}" style="margin-top:6px">${esc(n.t)}</textarea>
      <div class="tiny muted" style="margin-top:4px">${esc(new Date(n.at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }))}</div></section>`).join("")}`).join("")
    + `<p class="hint">Vider une note la supprime.</p>` : `<p class="muted small">Aucune note pour l'instant.</p>`, { close: after });
}

// ---------- Luta Livre ----------
function openLuta() {
  openSheet("Luta Livre", `
    <p class="small">${esc(LUTA_INTRO)}</p>
    <details class="sys-card" open><summary><b>Structure d'un cours</b></summary>
      <p class="tiny muted">${esc(LESSON.intro)}</p>
      <ol class="plan">${LESSON.steps.map((x) => `<li><div><b>${esc(x.name)}</b> <span class="tiny muted">· ${x.min} min</span><div class="small">${esc(x.text)}</div></div></li>`).join("")}</ol>
      ${myNote("luta:structure", "Luta Livre · Structure d'un cours")}
    </details>
    <details class="sys-card"><summary><b>Programme des ceintures</b></summary>
      ${GRADES.map((g) => `<div style="margin-top:10px"><div class="row" style="gap:8px"><span style="width:28px;height:8px;border-radius:4px;background:${g.color};display:inline-block"></span><b>${esc(g.name)}</b></div><ul class="bul">${g.themes.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></div>`).join("")}
      ${myNote("luta:ceintures", "Luta Livre · Programme des ceintures")}
    </details>
    ${CYCLES.map((c) => `<details class="sys-card"><summary><b>${esc(c.name)}</b><span class="tiny muted" style="display:block">${c.weeks} semaines</span></summary>
      <p class="small">${esc(c.text)}</p>
      ${c.plan.map((w) => `<div class="panel" style="padding:12px;margin-top:8px"><div class="tiny muted">Semaine ${w.week}</div><b>${esc(w.theme)}</b>
        <ul class="bul">${w.drills.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        <p class="small" style="margin:6px 0 0"><b>Sparring à thème</b> : ${esc(w.spar)}</p></div>`).join("")}
      ${myNote(`luta:cycle:${c.name}`, `Luta Livre · ${c.name}`)}
    </details>`).join("")}
    <details class="sys-card"><summary><b>Vocabulaire</b></summary>
      ${GLOSSARY.map((g) => `<p class="small" style="margin:8px 0"><b>${esc(g.term)}</b> : ${esc(g.def)}</p>`).join("")}
      ${myNote("luta:vocabulaire", "Luta Livre · Vocabulaire")}
    </details>
    <p class="hint">Les clés de jambes de la Luta Livre (one leg, 50/50, K-guard, false reap) sont dans « Risques et ouvertures des techniques ». La clé de talon est réservée aux adultes avancés.</p>`);
}

// ---------- vidéothèque du club ----------
let linksCache = null;
const LINK_TOPICS = ["MMA", "Frappe", "Lutte", "Sol", "Luta Livre", "Drill solo", "Prépa physique", "Mental", "Analyse de combat"];
async function drawLinks(el, ctx) {
  const box = el.querySelector("[data-links]");
  if (!box || !sync.connected() || window.FAP_PREVIEW) return;
  const paint = (all) => {
    if (!el.contains(box)) return;
    const rows = all.filter((r) => !/^(parcours|video:)/.test(String(r.topic || "")));
    if (!rows.length) { box.innerHTML = `<p class="muted small">Aucune vidéo pour l'instant.</p>`; return; }
    const topics = [...new Set(rows.map((r) => r.topic))];
    const coach = sync.role() === "coach";
    box.innerHTML = topics.map((t) => `<div class="tiny muted" style="margin:10px 0 4px;font-weight:700">${esc(t)}</div>
      <ul class="list">${rows.filter((r) => r.topic === t).map((r) => `<li><div style="min-width:0"><div style="font-weight:700">${esc(r.title)}</div>${r.note ? `<div class="meta">${esc(r.note)}</div>` : ""}</div>
        <div class="row" style="gap:6px;flex:none"><a class="icon-btn" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="Voir ${esc(r.title)}">${icon("play")}</a>${coach ? `<button class="icon-btn" data-editlink="${r.id}" aria-label="Modifier">${icon("edit")}</button>` : ""}</div></li>
        <li style="display:block;border-top:0;padding-top:0">${myNote(`video:${r.url}`, `Vidéo · ${r.title}`)}</li>`).join("")}</ul>`).join("");
    box.querySelectorAll("[data-editlink]").forEach((b) => b.addEventListener("click", () => editLink(rows.find((r) => r.id === b.dataset.editlink), ctx.refresh)));
  };
  if (linksCache) paint(linksCache);
  try { linksCache = await sync.links(); paint(linksCache); }
  catch { if (!linksCache) box.innerHTML = `<p class="notice is-warn small">Impossible de charger la vidéothèque. Vérifie ta connexion.</p>`; }
}

function editLink(existing, after) {
  const l = existing ? { ...existing } : { title: "", url: "", topic: "MMA", note: "" };
  const body = openSheet(existing ? "Modifier la vidéo" : "Ajouter une vidéo", `
    <form class="stack" data-f>
      <label class="field"><span>Lien (YouTube, Instagram…)</span><input class="input" name="url" type="url" inputmode="url" required value="${esc(l.url)}" placeholder="https://youtu.be/…"></label>
      <label class="field"><span>Titre</span><input class="input" name="title" required maxlength="200" value="${esc(l.title)}" placeholder="Ex. Jeff Chan : défendre le low kick"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Thème</span><div class="chips">${LINK_TOPICS.map((t) => `<button type="button" class="chip" data-topic="${esc(t)}" aria-pressed="${t === l.topic}">${esc(t)}</button>`).join("")}</div></div>
      <label class="field"><span>À retenir (visible par les fighters)</span><textarea class="input" name="note" rows="4" maxlength="2000" placeholder="Le point clé, l'erreur à éviter, le drill à faire.">${esc(l.note)}</textarea></label>
      <button class="btn tape-btn block">Enregistrer</button>
      ${existing ? `<button type="button" class="btn ghost block" data-archive style="color:var(--bad)">Retirer de la vidéothèque</button>` : ""}
    </form>`);
  body.addEventListener("click", async (e) => {
    const t = e.target.closest("[data-topic]");
    if (t) { l.topic = t.dataset.topic; body.querySelectorAll("[data-topic]").forEach((b) => b.setAttribute("aria-pressed", b === t)); return; }
    const a = e.target.closest("[data-archive]");
    if (a) {
      if (!a.dataset.armed) { a.dataset.armed = "1"; a.textContent = "Confirmer le retrait"; return; }
      try { await sync.saveLink({ ...l, archived: true }); linksCache = null; closeSheet(); toast("Vidéo retirée"); after?.(); } catch { toast("Impossible : vérifie ta connexion"); }
    }
  });
  body.querySelector("[data-f]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target, el2 = f.elements; l.url = el2.url.value.trim(); l.title = el2.title.value.trim(); l.note = el2.note.value.trim();
    if (!/^https:\/\//.test(l.url)) { toast("Le lien doit commencer par https://"); return; }
    if (!l.title) { toast("Donne un titre à la vidéo"); return; }
    const btn = f.querySelector(".tape-btn"); btn.disabled = true; btn.textContent = "Enregistrement…";
    try { await sync.saveLink(l); linksCache = null; closeSheet(); toast("Vidéo enregistrée"); after?.(); }
    catch { btn.disabled = false; btn.textContent = "Enregistrer"; toast("Impossible : vérifie ta connexion"); }
  });
}

// ---------- formation vidéo du coach (privée, chargée depuis la base) ----------
async function openLibrary() {
  const body = openSheet("Ma formation vidéo", `<p class="muted small">Chargement…</p>`);
  let rows = [];
  try { rows = window.FAP_PREVIEW ? [] : await sync.library(); }
  catch { body.innerHTML = `<p class="notice is-warn small">Impossible de charger la formation. Vérifie ta connexion.</p>`; return; }
  if (!rows.length) { body.innerHTML = `<p class="muted small">${window.FAP_PREVIEW ? "Dans l'aperçu, la formation n'est pas chargée : elle s'affiche dans l'appli du coach." : "Aucune vidéo pour l'instant."}</p>`; return; }
  const mods = [];
  rows.forEach((r) => { let m = mods.find((x) => x.no === r.module_no); if (!m) mods.push(m = { no: r.module_no, title: r.module_title, items: [] }); m.items.push(r); });
  const notes = store.get().libNotes || {};
  body.innerHTML = `<p class="muted small">${esc(rows[0].source || "")}. Note ce que tu retiens de chaque vidéo : tes notes sont sauvegardées et suivent ton compte sur tous tes appareils.</p>
    ${mods.map((m) => `<details class="sys-card"><summary><b>Module ${m.no}</b><span class="tiny muted" style="display:block">${esc(m.title)} · ${m.items.length} vidéo${m.items.length > 1 ? "s" : ""}${m.items.some((i) => notes[i.url]) ? " · notes" : ""}</span></summary>
      ${m.items.map((i) => `<div style="padding:10px 0;border-top:1px solid var(--line)">
        <div class="row between" style="gap:8px"><span class="small"><b>${i.position}.</b> ${esc(i.title)}</span><a class="btn small" href="${esc(i.url)}" target="_blank" rel="noopener">${icon("play")} Voir</a></div>
        <textarea class="input" rows="2" data-note="${esc(i.url)}" placeholder="Ce que je retiens…" style="margin-top:8px">${esc(notes[i.url] || "")}</textarea>
      </div>`).join("")}
    </details>`).join("")}`;
  let t;
  body.addEventListener("input", (e) => {
    const ta = e.target.closest("[data-note]"); if (!ta) return;
    clearTimeout(t); t = setTimeout(() => store.update((st) => { st.libNotes = { ...(st.libNotes || {}), [ta.dataset.note]: ta.value.trim() }; if (!st.libNotes[ta.dataset.note]) delete st.libNotes[ta.dataset.note]; }), 600);
  });
}

// ---------- fiche adversaire + game plan ----------
function editScout(existing, after) {
  const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: uid(), opponent: "", date: "", fields: {}, plan: {} };
  const field = (group, f) => `<label class="field"><span>${esc(f.label)}</span><textarea class="input" rows="2" data-g="${group}" name="${f.id}" placeholder="${esc(f.hint)}">${esc(s[group][f.id] || "")}</textarea></label>`;
  const body = openSheet(existing ? s.opponent || "Fiche adversaire" : "Nouvelle fiche", `
    <form data-scoutf class="stack">
      <div class="grid2"><label class="field"><span>Adversaire</span><input class="input" name="opponent" value="${esc(s.opponent)}"></label>
      <label class="field"><span>Date du combat</span><input class="input" type="date" name="date" value="${esc(s.date)}"></label></div>
      <h3 class="h-sec" style="font-size:20px;margin-top:10px">Analyse</h3>
      <p class="hint" style="margin-top:-6px">Regarde 2 ou 3 de ses combats si possible. Observe son buste et sa tête plutôt que ses mains.</p>
      ${SCOUT_FIELDS.map((f) => field("fields", f)).join("")}
      <h3 class="h-sec" style="font-size:20px;margin-top:10px">Game plan</h3>
      ${PLAN_FIELDS.map((f) => field("plan", f)).join("")}
      <button class="btn tape-btn block">Enregistrer la fiche</button>
      ${existing ? `<button type="button" class="btn ghost block" data-del style="color:var(--bad)">Supprimer la fiche</button>` : ""}
    </form>`);
  const form = body.querySelector("[data-scoutf]");
  form.addEventListener("click", (e) => {
    const d = e.target.closest("[data-del]"); if (!d) return;
    if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; }
    store.update((st) => { st.scouting = (st.scouting || []).filter((x) => x.id !== s.id); }); closeSheet(); toast("Fiche supprimée"); after();
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    s.opponent = form.opponent.value.trim(); s.date = form.date.value;
    form.querySelectorAll("textarea[data-g]").forEach((t) => { s[t.dataset.g][t.name] = t.value.trim(); });
    store.update((st) => { st.scouting = [...(st.scouting || []).filter((x) => x.id !== s.id), s]; });
    closeSheet(); toast("Fiche enregistrée"); after();
  });
}
