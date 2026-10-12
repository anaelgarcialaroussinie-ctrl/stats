// Écran coach « Mes programmes » : créer un programme sur une période et des créneaux,
// avec un thème par semaine, des notes et des vidéos (liens).
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { CLUB_CLASSES, DAYS, DAYS_LONG, hm } from "../data.js";
import { frDate } from "../engine.js";
import { sync } from "../sync.js";
import { cachedSeason, LUTA_PROGRAM } from "../season.js";
import { cachedPrograms, loadPrograms, savePrograms, deleteProgram, programMondays, fitWeeks, newProgram, safeUrl } from "../programs.js";
import { uid } from "../store.js";

const fmtD = (k) => frDate(k, { day: "numeric", month: "short" });
const clone = (x) => JSON.parse(JSON.stringify(x));

export function openPrograms(after) {
  const body = openSheet("Mes programmes", `<p class="muted small">Chargement…</p>`);
  const draw = () => {
    const list = cachedPrograms();
    body.innerHTML = `<p class="small muted" style="margin-top:0">Un programme = une période, des créneaux (tes cours ou des horaires à toi) et un thème par semaine, avec tes notes et tes vidéos. Il remplace le programme de la saison sur ces créneaux pendant sa période. Tes fighters le voient dans le planning.</p>
      ${list.length ? `<div class="stack">${list.map((p, i) => `<section class="panel" style="padding:12px">
        <div style="font-weight:700">${esc(p.name || "Sans nom")}</div>
        <div class="tiny muted">${esc(fmtD(p.start))} → ${esc(fmtD(p.end))} · ${esc(slotSummary(p))}</div>
        <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn small" data-open="${i}">${icon("edit")} Ouvrir</button><button class="btn ghost small" data-dup="${i}">Dupliquer</button></div>
      </section>`).join("")}</div>` : `<p class="muted small">Aucun programme pour l'instant.</p>`}
      <h3 class="sys-h">Nouveau programme</h3>
      <div class="stack" style="gap:8px">
        <button class="btn tape-btn block" data-new="empty">${icon("plus")} Programme vide</button>
        ${cachedSeason()?.program?.weeks?.length ? `<button class="btn ghost block" data-new="mma">À partir des thèmes MMA de la saison</button>` : ""}
        <button class="btn ghost block" data-new="luta">À partir des thèmes Luta Livre de la saison</button>
      </div>`;
  };
  body.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const list = cachedPrograms();
    if (b.dataset.open) { openEditor(clone(list[Number(b.dataset.open)]), after); return; }
    if (b.dataset.dup) { const p = clone(list[Number(b.dataset.dup)]); p.id = newProgram().id; p.name = `${p.name} (copie)`; openEditor(p, after); return; }
    if (b.dataset.new) {
      const s = cachedSeason();
      const base = {};
      if (b.dataset.new === "mma" && s) Object.assign(base, { name: "MMA adulte", classes: ["mma-fond", "mma-dev"], end: undefined, weeks: s.program.weeks.map((w) => ({ theme: w.title, note: "", videos: [] })) });
      if (b.dataset.new === "luta") Object.assign(base, { name: "Luta Livre adulte", classes: ["ll-fond", "ll-dev", "ll-expert"], weeks: LUTA_PROGRAM.weeks.map((w) => ({ theme: w.title, note: "", videos: [] })) });
      const p = newProgram(Object.fromEntries(Object.entries(base).filter(([, v]) => v !== undefined)));
      if (base.weeks && s?.start) { p.start = s.start; p.end = endForWeeks(p, base.weeks.length); }
      openEditor(p, after);
    }
  });
  draw();
  loadPrograms().then(() => { if (body.isConnected) draw(); });
}

function slotSummary(p) {
  const cls = (p.classes || []).map((id) => CLUB_CLASSES.find((c) => c.id === id)?.name).filter(Boolean);
  const own = (p.slots || []).map((s) => `${DAYS[s.day]} ${hm(s.start)}`);
  return [...cls, ...own].join(" · ") || "aucun créneau";
}
// date de fin pour couvrir n semaines de cours (vacances sautées)
function endForWeeks(p, n) {
  const probe = { ...p, end: "2099-12-31" };
  const w = programMondays({ ...probe }).filter((x) => !x.off)[n - 1];
  if (!w) return p.end;
  const d = new Date(w.monday + "T12:00:00"); d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

function openEditor(p, after, openIdx = -1) {
  fitWeeks(p);
  let open = openIdx;
  const body = openSheet(p.name ? p.name : "Nouveau programme", "");
  const draw = () => {
    fitWeeks(p);
    const mondays = programMondays(p);
    body.innerHTML = `
      <label class="field"><span>Nom du programme</span><input class="input" data-f="name" maxlength="80" value="${esc(p.name)}" placeholder="Ex. Cycle lutte novembre, Stage de Noël"></label>
      <div class="grid2" style="margin-top:8px">
        <label class="field"><span>Début</span><input class="input" type="date" data-f="start" value="${esc(p.start)}"></label>
        <label class="field"><span>Fin</span><input class="input" type="date" data-f="end" value="${esc(p.end)}"></label>
      </div>
      <label class="row" style="margin-top:8px"><input type="checkbox" data-skip ${p.skipHolidays !== false ? "checked" : ""} style="width:22px;height:22px"><span class="small">Sauter les semaines de vacances de la saison</span></label>
      <h3 class="sys-h">Créneaux du club</h3>
      ${[0, 1, 2, 3, 4, 5].map((di) => { const cs = CLUB_CLASSES.filter((c) => c.day === di); return cs.length ? `<div class="tiny muted" style="margin:6px 0 4px;font-weight:700">${esc(DAYS_LONG[di])}</div><div class="chips">${cs.map((c) => `<button type="button" class="chip" data-cls="${c.id}" aria-pressed="${(p.classes || []).includes(c.id)}">${hm(c.start)} ${esc(c.name)}</button>`).join("")}</div>` : ""; }).join("")}
      <h3 class="sys-h">Mes horaires à moi</h3>
      ${(p.slots || []).map((s, i) => `<div class="panel" style="padding:10px;margin-top:6px"><div class="grid2">
        <label class="field"><span>Jour</span><select class="input" data-slot="${i}" data-k="day">${DAYS_LONG.map((d, di) => `<option value="${di}" ${Number(s.day) === di ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></label>
        <label class="field"><span>Nom</span><input class="input" data-slot="${i}" data-k="name" value="${esc(s.name || "")}" placeholder="Ex. Stage grappling"></label>
        <label class="field"><span>Début</span><input class="input" type="time" data-slot="${i}" data-k="start" value="${esc(s.start)}"></label>
        <label class="field"><span>Fin</span><input class="input" type="time" data-slot="${i}" data-k="end" value="${esc(s.end)}"></label></div>
        <button type="button" class="btn ghost small" data-delslot="${i}" style="margin-top:6px;color:var(--bad)">${icon("trash")} Retirer ce créneau</button></div>`).join("")}
      <button type="button" class="btn ghost small" data-addslot style="margin-top:8px">${icon("plus")} Ajouter un horaire</button>
      <h3 class="sys-h">Thèmes semaine par semaine</h3>
      ${mondays.length ? `<div class="stack" style="gap:6px">${mondays.map((m) => m.off ? `<div class="tiny muted">${esc(fmtD(m.monday))} · vacances</div>` : (() => {
        const i = m.n - 1, w = p.weeks[i];
        return `<div class="panel" style="padding:10px">
          <button type="button" class="row between" data-wk="${i}" style="width:100%;text-align:left;background:none;border:0;color:inherit;padding:0">
            <span><span class="tiny muted">S${m.n} · ${esc(fmtD(m.monday))}</span><br><b>${esc(w.theme || "Thème à définir")}</b>${w.videos?.length ? ` <span class="tiny muted">· ${w.videos.length} vidéo${w.videos.length > 1 ? "s" : ""}</span>` : ""}</span>
            <span class="tiny">${open === i ? "Fermer" : "Modifier"}</span></button>
          ${open === i ? `<div class="stack" style="gap:8px;margin-top:8px">
            <label class="field"><span>Thème</span><input class="input" data-w="${i}" data-k="theme" maxlength="140" value="${esc(w.theme)}"></label>
            <label class="field"><span>Notes pour les fighters (facultatif)</span><textarea class="input" rows="2" data-w="${i}" data-k="note" maxlength="600">${esc(w.note || "")}</textarea></label>
            ${(w.videos || []).map((v, j) => `<div class="row between" style="gap:6px"><a class="small" href="${esc(v.url)}" target="_blank" rel="noopener" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">▶ ${esc(v.title || v.url)}</a><button type="button" class="icon-btn" data-delvid="${i}:${j}" aria-label="Retirer la vidéo">${icon("trash")}</button></div>`).join("")}
            <div class="grid2"><input class="input" data-vtitle="${i}" placeholder="Titre de la vidéo"><input class="input" data-vurl="${i}" inputmode="url" placeholder="Lien (YouTube, Drive…)"></div>
            <div class="row" style="gap:8px;flex-wrap:wrap"><button type="button" class="btn small" data-addvid="${i}">${icon("plus")} Ajouter le lien</button><button type="button" class="btn ghost small" data-lib="${i}">Depuis la vidéothèque</button></div>
          </div>` : ""}</div>`; })()).join("")}</div>` : `<p class="muted small">Choisis une date de début et de fin.</p>`}
      <div class="row" style="gap:8px;margin-top:16px;flex-wrap:wrap">
        <button type="button" class="btn tape-btn" data-save>Enregistrer</button>
        <button type="button" class="btn ghost" data-back>Retour</button>
        ${cachedPrograms().some((x) => x.id === p.id) ? `<button type="button" class="btn ghost" data-del style="color:var(--bad)">${icon("trash")} Supprimer</button>` : ""}
      </div>`;
  };
  body.addEventListener("input", (e) => {
    const t = e.target, d = t.dataset;
    if (d.f) { p[d.f] = t.value; if (d.f !== "name") { open = -1; draw(); } return; }
    if (d.slot) { p.slots[Number(d.slot)][d.k] = d.k === "day" ? Number(t.value) : t.value; return; }
    if (d.w) { p.weeks[Number(d.w)][d.k] = t.value; }
  });
  body.addEventListener("change", (e) => { if (e.target.matches("[data-skip]")) { p.skipHolidays = e.target.checked; draw(); } });
  body.addEventListener("click", async (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const d = b.dataset;
    if (d.cls) { const id = d.cls; p.classes = (p.classes || []).includes(id) ? p.classes.filter((x) => x !== id) : [...(p.classes || []), id]; b.setAttribute("aria-pressed", p.classes.includes(id)); return; }
    if (d.addslot !== undefined) { p.slots = [...(p.slots || []), { id: uid(), day: 5, start: "14:00", end: "16:00", name: "" }]; draw(); return; }
    if (d.delslot) { p.slots.splice(Number(d.delslot), 1); draw(); return; }
    if (d.wk) { open = open === Number(d.wk) ? -1 : Number(d.wk); draw(); return; }
    if (d.addvid) {
      const i = Number(d.addvid), url = body.querySelector(`[data-vurl="${i}"]`).value.trim(), title = body.querySelector(`[data-vtitle="${i}"]`).value.trim();
      if (!safeUrl(url)) { toast("Colle un lien qui commence par https://"); return; }
      p.weeks[i].videos = [...(p.weeks[i].videos || []), { title: title || "Vidéo", url }]; draw(); return;
    }
    if (d.delvid) { const [i, j] = d.delvid.split(":").map(Number); p.weeks[i].videos.splice(j, 1); draw(); return; }
    if (d.lib) { const i = Number(d.lib); pickFromLibrary((v) => { if (v) p.weeks[i].videos = [...(p.weeks[i].videos || []), v]; openEditor(p, after, i); }); return; }
    if (d.back !== undefined) { openPrograms(after); return; }
    if (d.del !== undefined) {
      if (!confirm("Supprimer ce programme ? Les créneaux reviennent au programme de la saison.")) return;
      try { await deleteProgram(p.id); toast("Programme supprimé"); after?.(); openPrograms(after); } catch { toast("Impossible : vérifie ta connexion"); }
      return;
    }
    if (d.save !== undefined) {
      if (!p.name.trim()) { toast("Donne un nom au programme"); return; }
      if (!p.start || !p.end || p.end < p.start) { toast("Vérifie les dates de début et de fin"); return; }
      if (!(p.classes || []).length && !(p.slots || []).length) { toast("Choisis au moins un créneau"); return; }
      p.weeks = p.weeks.slice(0, programMondays(p).filter((x) => !x.off).length);
      b.disabled = true; b.textContent = "Enregistrement…";
      try { await savePrograms(p); toast("Programme enregistré"); after?.(); openPrograms(after); }
      catch { b.disabled = false; b.textContent = "Enregistrer"; toast("Enregistré sur ce téléphone seulement : vérifie ta connexion"); }
    }
  });
  draw();
}

// choisir une vidéo déjà dans la vidéothèque du club
async function pickFromLibrary(onPick) {
  const body = openSheet("Vidéothèque du club", `<p class="muted small">Chargement…</p>`);
  let list = [];
  try { list = (await sync.links()).filter((l) => !l.archived && safeUrl(l.url)); } catch {}
  body.innerHTML = `<button class="btn ghost small" data-cancel style="margin-bottom:10px">Retour au programme</button>` + (list.length ? `<ul class="list">${list.map((l, i) => `<li role="button" tabindex="0" data-pick="${i}"><div style="min-width:0;flex:1"><div style="font-weight:650">${esc(l.title)}</div><div class="meta">${esc(l.topic || "")}</div></div></li>`).join("")}</ul>` : `<p class="muted small">La vidéothèque est vide (Academy → Vidéothèque du club pour en ajouter), ou tu n'es pas connecté.</p>`);
  body.querySelector("[data-cancel]").addEventListener("click", () => onPick(null));
  body.querySelectorAll("[data-pick]").forEach((li) => li.addEventListener("click", () => { const l = list[Number(li.dataset.pick)]; onPick({ title: l.title, url: l.url }); }));
}
