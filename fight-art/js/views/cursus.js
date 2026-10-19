// Parcours guidés : MMA et Luta Livre, leçon après leçon, du niveau Fondamentaux à la Team.
// Chaque leçon suit la même méthode : regarder, comprendre, noter, construire son jeu, tester, valider.
import { store, todayKey } from "../store.js";
import { esc, icon, openSheet, toast } from "../ui.js";
import { myNote, studyNotes } from "../study-notes.js";
import { tech } from "../systems-data.js";
import { TRACKS, METHOD, EXTRA_VIDEOS, findTrack, findLesson, allLessons } from "../cursus-data.js";
import { MMA_VIDEOS, ytParams } from "./parcours-mma.js";
import { LUTA_VIDEOS } from "./parcours-club.js";
import { openExplorer, editSystem } from "./systems.js";
import { openNote } from "./notes.js";
import { frDate } from "../engine.js";

const VID = new Map([...MMA_VIDEOS, ...LUTA_VIDEOS, ...EXTRA_VIDEOS].map((v) => [v.id, v]));
const cur = () => store.get().cursus || {};
const isDone = (id) => Boolean(cur().done?.[id]);
const noteKey = (id) => `cursus:${id}`;

function progress(track) {
  const all = allLessons(track);
  const done = all.filter((x) => isDone(x.id)).length;
  const next = all.find((x) => !isDone(x.id)) || null;
  return { all, done, total: all.length, pct: all.length ? Math.round((done / all.length) * 100) : 0, next };
}
const levelDone = (track, L) => L.lessons.filter((x) => isDone(x.id)).length;
const examKey = (track, L) => `${track.id}:${L.id}`;
const examDate = (track, L) => cur().levels?.[examKey(track, L)] || null;

// niveau atteint : le dernier niveau validé, sinon « en cours »
function levelStatus(track) {
  const validated = track.levels.filter((L) => examDate(track, L));
  const last = validated[validated.length - 1];
  return last ? `${last.label} validé · ${last.grade}` : "Niveau Fondamentaux en cours";
}

const bar = (pct, color) => `<div class="bar" style="margin-top:8px"><i style="width:${pct}%;background:${color}"></i></div>`;

// ---------- l'onglet Parcours de l'Academy ----------
export function cursusHome() {
  return `
    <section class="panel jeu-method" style="margin-top:12px">
      <b>Apprendre le combat, leçon après leçon</b>
      <p class="muted small" style="margin:4px 0 8px">Deux parcours, quatre niveaux reliés aux grades. À chaque leçon, la même méthode :</p>
      <ol class="plan-steps" style="margin:0">${METHOD.map(([h, t]) => `<li class="small"><b>${esc(h)}</b> · ${esc(t)}</li>`).join("")}</ol>
    </section>
    ${TRACKS.map((t) => {
      const p = progress(t);
      return `<section class="panel" style="margin-top:12px;border-left:4px solid ${t.color}">
        <div class="row between" style="gap:8px;align-items:baseline"><h2 class="h-sec" style="margin:0">${esc(t.label)}</h2><span class="tiny muted">${p.done} / ${p.total} leçons</span></div>
        <p class="muted small" style="margin:4px 0 0">${esc(t.intro)}</p>
        ${bar(p.pct, t.color)}
        <p class="tiny" style="margin:8px 0 0;color:${t.color};font-weight:700">${esc(levelStatus(t))}</p>
        ${p.next ? `<button class="btn tape-btn block" data-cur-lesson="${p.next.id}" style="margin-top:12px;white-space:normal;line-height:1.25;height:auto;min-height:52px;padding:12px 18px">${p.done ? "Continuer" : "Commencer"} : ${esc(p.next.title)}</button>` : `<p class="small" style="margin:12px 0 0"><b>Parcours terminé.</b> Revois tes notes et tes systèmes avant chaque passage de grade.</p>`}
        <button class="btn ghost block" data-cur-track="${t.id}" style="margin-top:8px">Voir tout le parcours</button>
      </section>`;
    }).join("")}
    <p class="tiny muted" style="margin:12px 2px 0">Version de test : les vidéos sont des liens YouTube publics, choisis pour leur pédagogie. Elles seront remplacées au fur et à mesure par les vidéos du club.</p>`;
}

export function bindCursusHome(el, tools) {
  el.querySelectorAll("[data-cur-lesson]").forEach((b) => b.addEventListener("click", () => openLesson(b.dataset.curLesson, tools)));
  el.querySelectorAll("[data-cur-track]").forEach((b) => b.addEventListener("click", () => openTrack(b.dataset.curTrack, tools)));
}

// ---------- un parcours : niveaux et leçons ----------
export function openTrack(trackId, tools) {
  const t = findTrack(trackId);
  const p = progress(t);
  const body = openSheet(`Parcours ${t.label}`, `
    <p class="small muted" style="margin-top:0">${esc(t.intro)}</p>
    <p class="tiny muted" style="margin:0 0 4px">${esc(t.gradeSystem)} · ${p.done} / ${p.total} leçons</p>
    ${bar(p.pct, t.color)}
    ${t.levels.map((L, i) => {
      const d = levelDone(t, L), n = L.lessons.length, ex = examDate(t, L);
      return `<div style="margin-top:22px">
        <div class="row" style="gap:8px;align-items:center"><span style="width:14px;height:14px;border-radius:50%;background:${L.color};flex:none"></span><h3 class="sys-h" style="margin:0">Niveau ${i + 1} · ${esc(L.label)}</h3></div>
        <p class="tiny" style="margin:4px 0 2px;color:${L.color};font-weight:800">${esc(L.grade)}${ex ? ` · validé le ${esc(frDate(ex, { day: "numeric", month: "long" }))}` : ""}</p>
        <p class="tiny muted" style="margin:0 0 6px">${esc(L.goal)}</p>
        <ul class="list">${L.lessons.map((x, j) => `<li role="button" tabindex="0" data-open-lesson="${x.id}">
          <span style="width:26px;height:26px;border-radius:50%;flex:none;display:grid;place-items:center;font-size:13px;font-weight:800;${isDone(x.id) ? `background:${L.color};color:#111` : "border:1.5px solid var(--line);color:var(--muted)"}">${isDone(x.id) ? "✓" : j + 1}</span>
          <div style="min-width:0;flex:1"><div style="font-weight:700">${esc(x.title)}</div><div class="meta">${esc(x.goal)}</div></div>
          ${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</li>`).join("")}</ul>
        <button class="btn ${d === n && !ex ? "tape-btn" : "ghost"} block small" data-exam="${L.id}" style="margin-top:8px">${ex ? "Revoir le bilan du niveau" : `Bilan du niveau${d < n ? ` (${d} / ${n} leçons faites)` : " : prêt pour le " + esc(L.grade.toLowerCase())}`}</button>
      </div>`;
    }).join("")}`);
  body.addEventListener("click", (e) => {
    const li = e.target.closest("[data-open-lesson]"); if (li) { openLesson(li.dataset.openLesson, tools); return; }
    const ex = e.target.closest("[data-exam]"); if (ex) openExam(t.id, ex.dataset.exam, tools);
  });
  body.addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.closest("[data-open-lesson]")?.click(); });
}

// ---------- une leçon ----------
const step = (n, title, html) => `<section class="panel" style="margin-top:12px">
  <div class="row" style="gap:10px;align-items:center;margin-bottom:8px"><span style="width:26px;height:26px;border-radius:50%;background:var(--tape);color:var(--tape-ink);display:grid;place-items:center;font-weight:800;font-size:13px;flex:none">${n}</span><b>${esc(title)}</b></div>
  ${html}</section>`;

const thumb = (v) => `<div style="margin:6px 0 12px">
  <div class="row between" style="gap:8px"><b class="small">${esc(v.t)}</b><span class="tiny" style="font-weight:800;flex:none;color:${v.lang === "fr" ? "var(--tape)" : "#9AA3AE"}">${v.lang === "fr" ? "🇫🇷 FR" : "VO · ST FR"}</span></div>
  <span class="tiny muted">${esc(v.a)}</span>
  <button data-yt="${v.id}" data-lang="${v.lang}" aria-label="Lire ${esc(v.t)}" style="position:relative;display:block;width:100%;margin:6px 0 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(184,243,75,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>
</div>`;

export function openLesson(id, tools) {
  const f = findLesson(id); if (!f) return;
  const { track: t, level: L, lesson: x } = f;
  const all = allLessons(t);
  const idx = all.findIndex((y) => y.id === id);
  const next = all[idx + 1] || null;
  const checks = () => cur().checks?.[id] || [];
  const back = () => openLesson(id, tools);
  const vids = x.vids.map((v) => VID.get(v)).filter(Boolean);
  const techs = x.techs.map(tech).filter(Boolean);

  const buildHtml = () => {
    const b = x.build;
    if (b.kind === "tool") return `<p class="small" style="margin:0 0 10px">${esc(b.text)}</p><button class="btn tape-btn block" data-tool="${x.tool}">${x.tool === "lab" ? "Ouvrir le Labo de style" : "Ouvrir Préparer un adversaire"}</button>`;
    return `<p class="small" style="margin:0 0 10px">${esc(b.text)}</p>
      <button class="btn tape-btn block" data-build>${icon("plus")} ${b.kind === "note" ? `Créer la fiche « ${esc(b.title)} »` : `Créer le système : ${esc(tech(b.root)?.name || b.root)}`}</button>
      <p class="tiny muted" style="margin:8px 0 0">Elle s'ajoute à Mon jeu, avec tes autres fiches et systèmes.</p>`;
  };

  const draw = () => {
    const done = isDone(id), ch = checks(), allChecked = x.check.every((_, i) => ch.includes(i));
    const hasNote = Boolean(studyNotes()[noteKey(id)]?.t);
    body.innerHTML = `
      <p class="tiny" style="margin:0;color:${L.color};font-weight:800">${esc(t.label)} · ${esc(L.label)} · ${esc(L.grade)} · leçon ${L.lessons.indexOf(x) + 1} / ${L.lessons.length}</p>
      <p class="small" style="margin:6px 0 0"><b>Objectif :</b> ${esc(x.goal)}</p>
      ${x.safety ? `<p class="small" style="margin:8px 0 0;color:var(--warn)"><b>Sécurité :</b> ${esc(x.safety)}</p>` : ""}
      ${done ? `<p class="insigne" style="margin-top:10px">Leçon validée le ${esc(frDate(cur().done[id], { day: "numeric", month: "long" }))}</p>` : ""}

      ${step(1, "Regarde", vids.length ? `${vids.map(thumb).join("")}<p class="tiny muted" style="margin:0">Une première fois en entier, sans rien noter. Vidéo en anglais : ⚙ → Sous-titres → Traduire automatiquement → Français.</p>` : `<p class="small" style="margin:0">Pas de vidéo pour cette leçon : tu travailles avec les outils de l'appli (étape 4).</p>`)}

      ${step(2, "Comprends", x.ideas.map(([h, txt]) => `<div style="margin:0 0 10px"><b class="small">${esc(h)}</b><p class="small muted" style="margin:2px 0 0">${esc(txt)}</p></div>`).join("")
        + (techs.length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-top:4px"><span class="tiny muted">Risques et ouvertures :</span>${techs.map((tt) => `<button class="chip" data-tech="${tt.id}" style="font-size:12px">${esc(tt.name)}</button>`).join("")}</div>` : ""))}

      ${step(3, "Note avec tes mots", `<ul class="bul" style="margin:0 0 8px">${x.ask.map((q) => `<li class="small">${esc(q)}</li>`).join("")}</ul>
        ${myNote(noteKey(id), `Parcours ${t.label} · ${x.title}`, { placeholder: "Réponds aux questions avec tes mots. Ton coach peut lire tes notes pour t'aider." }).replace('<details class="mynote">', '<details class="mynote" open>')}`)}

      ${step(4, "Construis ton jeu", buildHtml())}

      ${step(5, "Teste", `<p class="small" style="margin:0 0 6px"><b>Drill :</b> ${esc(x.drill)}</p><p class="small" style="margin:0"><b>Sparring à thème :</b> ${esc(x.spar)}</p>`)}

      ${step(6, "Valide", `<p class="tiny muted" style="margin:0 0 8px">Coche seulement ce que tu fais vraiment, au club ou en sparring.</p>
        ${x.check.map((c, i) => `<label class="row" style="gap:10px;align-items:flex-start;margin:0 0 10px;cursor:pointer"><input type="checkbox" data-check="${i}" ${ch.includes(i) ? "checked" : ""} style="width:22px;height:22px;flex:none;margin-top:1px"><span class="small">${esc(c)}</span></label>`).join("")}
        ${!hasNote && !done ? `<p class="tiny muted" style="margin:0 0 8px">Conseil : écris tes notes (étape 3) avant de valider, c'est là que tu retiens.</p>` : ""}
        ${done ? `<button class="btn ghost block small" data-undo>Remettre la leçon en cours</button>` : `<button class="btn ${allChecked ? "tape-btn" : "ghost"} block" data-validate ${allChecked ? "" : "disabled"}>${allChecked ? "Valider la leçon" : "Coche tout pour valider"}</button>`}`)}

      <div class="row" style="gap:8px;margin-top:14px">
        <button class="btn ghost" data-to-track style="flex:1">Le parcours</button>
        ${next ? `<button class="btn ${done ? "tape-btn" : "ghost"}" data-next style="flex:1">Leçon suivante</button>` : ""}
      </div>`;
  };

  const body = openSheet(x.title, "");
  draw();
  body.addEventListener("click", (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;margin:6px 0 0;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?${ytParams(th.dataset.lang)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const tc = e.target.closest("[data-tech]"); if (tc) { openExplorer(tc.dataset.tech, back); return; }
    if (e.target.closest("[data-build]")) {
      const b = x.build;
      if (b.kind === "note") openNote(null, back, { title: b.title, cat: b.cat || "Autre", source: `Parcours ${t.label} · ${x.title}` });
      else editSystem(null, back, { type: b.type, root: b.root });
      return;
    }
    const tl = e.target.closest("[data-tool]"); if (tl) { tools?.[tl.dataset.tool]?.(); return; }
    if (e.target.closest("[data-validate]")) {
      store.update((s) => { s.cursus = { ...(s.cursus || {}) }; s.cursus.done = { ...(s.cursus.done || {}), [id]: todayKey() }; });
      toast(next && next.level.id !== L.id ? `Niveau ${L.label} terminé : fais le bilan du niveau` : "Leçon validée");
      tools?.refresh?.(); draw(); body.scrollTop = body.scrollHeight; return;
    }
    if (e.target.closest("[data-undo]")) {
      store.update((s) => { s.cursus = { ...(s.cursus || {}) }; const d = { ...(s.cursus.done || {}) }; delete d[id]; s.cursus.done = d; });
      tools?.refresh?.(); draw(); return;
    }
    if (e.target.closest("[data-to-track]")) { openTrack(t.id, tools); return; }
    if (e.target.closest("[data-next]")) {
      if (next.level.id !== L.id && levelDone(t, L) === L.lessons.length && !examDate(t, L)) openExam(t.id, L.id, tools);
      else openLesson(next.id, tools);
    }
  });
  body.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-check]"); if (!cb) return;
    const i = Number(cb.dataset.check);
    store.update((s) => {
      s.cursus = { ...(s.cursus || {}) };
      const all = { ...(s.cursus.checks || {}) };
      const set = new Set(all[id] || []); cb.checked ? set.add(i) : set.delete(i);
      all[id] = [...set].sort(); s.cursus.checks = all;
    });
    draw();
  });
}

// ---------- bilan d'un niveau ----------
export function openExam(trackId, levelId, tools) {
  const t = findTrack(trackId), L = t.levels.find((y) => y.id === levelId);
  const k = examKey(t, L);
  const nextL = t.levels[t.levels.indexOf(L) + 1] || null;
  const body = openSheet(`Bilan ${L.label}`, "");
  const draw = () => {
    const ch = cur().exams?.[k] || [], d = levelDone(t, L), n = L.lessons.length, ex = examDate(t, L);
    const ok = L.exam.every((_, i) => ch.includes(i));
    body.innerHTML = `
      <p class="tiny" style="margin:0;color:${L.color};font-weight:800">${esc(t.label)} · ${esc(L.grade)}</p>
      <p class="small" style="margin:6px 0 0">${esc(L.goal)}</p>
      <p class="small" style="margin:10px 0 0"><b>Leçons :</b> ${d} / ${n} validées</p>
      <section class="panel" style="margin-top:12px">
        <b>Ce que tu dois savoir faire</b>
        <p class="tiny muted" style="margin:4px 0 10px">Sois honnête : coche ce que tu fais en sparring, pas seulement en drill.</p>
        ${L.exam.map((c, i) => `<label class="row" style="gap:10px;align-items:flex-start;margin:0 0 10px;cursor:pointer"><input type="checkbox" data-ex="${i}" ${ch.includes(i) ? "checked" : ""} style="width:22px;height:22px;flex:none;margin-top:1px"><span class="small">${esc(c)}</span></label>`).join("")}
      </section>
      ${myNote(`cursus-exam:${k}`, `Bilan ${t.label} · ${L.label}`, { placeholder: "Mes points forts, ce qui reste à travailler avant le passage…" })}
      ${ex ? `<p class="insigne" style="margin-top:12px">Niveau validé le ${esc(frDate(ex, { day: "numeric", month: "long" }))}</p>
        <p class="small muted" style="margin:8px 0 0">${t.id === "mma" && L.id !== "team" ? `Montre-le à ton coach : c'est lui qui t'inscrit au passage du ${esc(L.grade.toLowerCase())} FMMAF.` : "Montre-le à ton coach : c'est lui qui valide ta progression au club."}</p>
        <button class="btn ghost block small" data-unlevel style="margin-top:10px">Annuler la validation</button>`
        : `<button class="btn ${ok && d === n ? "tape-btn" : "ghost"} block" data-level ${ok && d === n ? "" : "disabled"} style="margin-top:12px">${d < n ? `Termine d'abord les ${n - d} leçon${n - d > 1 ? "s" : ""} restante${n - d > 1 ? "s" : ""}` : ok ? "Valider le niveau" : "Coche tout pour valider"}</button>`}
      ${ex && nextL ? `<button class="btn tape-btn block" data-next-level style="margin-top:10px">Passer au niveau ${esc(nextL.label)}</button>` : ""}
      <button class="btn ghost block" data-to-track style="margin-top:10px">Le parcours</button>`;
  };
  draw();
  body.addEventListener("change", (e) => {
    const cb = e.target.closest("[data-ex]"); if (!cb) return;
    const i = Number(cb.dataset.ex);
    store.update((s) => {
      s.cursus = { ...(s.cursus || {}) };
      const all = { ...(s.cursus.exams || {}) };
      const set = new Set(all[k] || []); cb.checked ? set.add(i) : set.delete(i);
      all[k] = [...set].sort(); s.cursus.exams = all;
    });
    draw();
  });
  body.addEventListener("click", (e) => {
    if (e.target.closest("[data-level]")) {
      store.update((s) => { s.cursus = { ...(s.cursus || {}) }; s.cursus.levels = { ...(s.cursus.levels || {}), [k]: todayKey() }; });
      toast(`Niveau ${L.label} validé`); tools?.refresh?.(); draw(); return;
    }
    if (e.target.closest("[data-unlevel]")) {
      store.update((s) => { s.cursus = { ...(s.cursus || {}) }; const lv = { ...(s.cursus.levels || {}) }; delete lv[k]; s.cursus.levels = lv; });
      tools?.refresh?.(); draw(); return;
    }
    if (e.target.closest("[data-next-level]")) { openLesson(nextL.lessons[0].id, tools); return; }
    if (e.target.closest("[data-to-track]")) openTrack(t.id, tools);
  });
}
