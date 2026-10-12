// Planning du club : horaires, contenu des cours et thème de la semaine (fixé par le coach).
import { store, todayKey, addDays, dayIndex } from "../store.js";
import { esc, icon, openSheet, toast } from "../ui.js";
import { CLUB_CLASSES, CLUB_METHOD, DAYS_LONG, hm } from "../data.js";
import { frDate } from "../engine.js";
import { sync } from "../sync.js";
import { cachedSeason, loadSeason, seasonWeek, MMA_CLASSES, LUTA_CLASSES, lutaWeek, mondaysFrom, setSeasonDates } from "../season.js";

// carte « thème de la saison » : le thème global de la semaine, sans détail (le coach prépare ses cours le lundi)
export function seasonCard(key, p, { compact = false } = {}) {
  const sw = lutaWeek(key);
  if (!sw) return "";
  if (sw.before) return compact ? "" : `<p class="tiny muted">La saison n'a pas encore commencé.</p>`;
  if (sw.off) return `<div class="season-card"><div class="tiny">Programme de la saison</div><b>Semaine de vacances</b></div>`;
  if (sw.after) return compact ? "" : `<p class="tiny muted">Programme de la saison terminé.</p>`;
  const w = sw.week, l = sw.luta;
  return `<div class="season-card">
    <div class="tiny">Saison · bloc ${sw.bloc?.n} « ${esc(sw.bloc?.title || "")} » · semaine ${w.n} sur 40</div>
    <div class="small" style="margin-top:4px">MMA : <b>${esc(w.title)}</b></div>
    ${l ? `<div class="small" style="margin-top:2px">Luta Livre : <b>${esc(l.title)}</b></div>` : ""}
  </div>`;
}

// cours qui suivent le programme de la saison (MMA, Luta Livre, liaison)
const inProgram = (id) => MMA_CLASSES.includes(id) || LUTA_CLASSES.includes(id) || id === "liaison";
// thème global d'un cours pour une semaine du programme
function classTheme(c, sw) {
  const w = sw.week, l = sw.luta;
  const t = LUTA_CLASSES.includes(c.id) && l ? l.title : c.id === "liaison" && l ? `${w.title} × ${l.title}` : w.title;
  return `<span class="tiny muted">Thème de la semaine · S${sw.n}</span><div><b>${esc(t)}</b></div>`;
}

const cache = {}; // lundi → { classe: thème }
export const mondayOf = (key) => addDays(key, -dayIndex(key));
export const cachedThemes = (monday) => cache[monday] || {};

export async function loadThemes(monday) {
  if (!sync.connected() || window.FAP_PREVIEW) return cache[monday] || {};
  try {
    const rows = await sync.themes(monday, monday);
    cache[monday] = Object.fromEntries(rows.map((r) => [r.class, r.theme]));
  } catch { /* hors ligne : on garde ce qu'on a */ }
  return cache[monday] || {};
}

export function openPlanning(startKey = todayKey()) {
  let monday = mondayOf(startKey);
  const coach = sync.role() === "coach";
  const mine = new Set(store.get().profile?.classes || []);
  const body = openSheet("Planning du club", "");

  const draw = () => {
    const th = cachedThemes(monday);
    const today = todayKey();
    body.innerHTML = `
      <p class="small" style="margin:0"><b>${esc(CLUB_METHOD.motto)}</b></p>
      <p class="muted small" style="margin:4px 0 10px">${esc(CLUB_METHOD.goal)}</p>
      ${seasonCard(monday, store.get().profile)}
      ${coach && cachedSeason() ? `<button class="btn ghost small" data-cal style="margin:8px 0 4px">Calendrier de la saison</button>` : ""}
      <div class="row between" style="margin:10px 0 6px">
        <button class="icon-btn" data-w="-7" aria-label="Semaine précédente">${icon("back")}</button>
        <b class="small">Semaine du ${esc(frDate(monday, { day: "numeric", month: "long" }))}</b>
        <button class="icon-btn" data-w="7" aria-label="Semaine suivante" style="transform:scaleX(-1)">${icon("back")}</button>
      </div>
      ${[0, 1, 2, 3, 4, 5].map((di) => {
        const k = addDays(monday, di);
        const cs = CLUB_CLASSES.filter((c) => c.day === di);
        return `<h3 class="sys-h" style="margin-top:16px">${esc(DAYS_LONG[di][0].toUpperCase() + DAYS_LONG[di].slice(1))} ${Number(k.slice(8))}${k === today ? ` <span class="badge tiny">aujourd'hui</span>` : ""}</h3>
          ${cs.length ? cs.map((c) => `<section class="panel cls${mine.has(c.id) ? " mine" : ""}" style="margin-top:8px;padding:12px">
            <div class="row between" style="align-items:flex-start;gap:8px">
              <div><b>${esc(c.name)}</b>${mine.has(c.id) ? ` <span class="insigne">Mon cours</span>` : ""}<div class="tiny muted">${esc(c.stage)}${c.note ? " · " + esc(c.note) : ""}</div></div>
              <span class="badge num" style="flex:none">${hm(c.start)} – ${hm(c.end)}</span>
            </div>
            <p class="small" style="margin:8px 0 0">${esc(c.text)}</p>
            <div class="theme-line">${(() => {
              const sw = inProgram(c.id) ? lutaWeek(addDays(monday, di)) : null;
              const season = sw?.week ? classTheme(c, sw) : sw?.off ? `<span class="tiny muted">Semaine de vacances</span>` : "";
              const extra = th[c.id] ? `<div class="small" style="margin-top:6px"><span class="tiny muted">${season ? "Outils du coach" : "Thème de la semaine"}</span><br><b>${esc(th[c.id])}</b></div>` : "";
              return season || extra ? season + extra : `<span class="tiny muted">Thème de la semaine : bientôt annoncé</span>`;
            })()}
              ${coach ? `<button class="btn ghost small" data-edit="${c.id}" style="margin-top:6px">${icon("edit")} ${th[c.id] ? "Modifier" : inProgram(c.id) && seasonWeek(addDays(monday, di))?.week ? "Ajouter mes outils techniques" : "Fixer le thème"}</button>` : ""}</div>
          </section>`).join("") : `<p class="muted small" style="margin:6px 0 0">Fermé</p>`}`;
      }).join("")}
      <h3 class="sys-h" style="margin-top:18px">La méthode</h3>
      <div class="stack" style="gap:6px">${CLUB_METHOD.steps.map(([t, d]) => `<div class="small"><b>${esc(t)}</b> : ${esc(d)}</div>`).join("")}</div>
      <p class="hint">Les cours kids et ados ne sont pas affichés.</p>`;
  };

  const refresh = async () => { draw(); await Promise.all([loadThemes(monday), loadSeason()]); if (body.isConnected) draw(); };

  body.addEventListener("click", async (e) => {
    const w = e.target.closest("[data-w]"); if (w) { monday = addDays(monday, Number(w.dataset.w)); refresh(); return; }
    if (e.target.closest("[data-cal]")) { openCalendar(() => openPlanning(monday)); return; }
    const ed = e.target.closest("[data-edit]");
    if (ed) {
      const box = ed.closest(".theme-line"); const id = ed.dataset.edit; const cur = cachedThemes(monday)[id] || "";
      box.innerHTML = `<label class="field"><span>Outils techniques ou thème du cours</span><input class="input" data-theme-in maxlength="300" value="${esc(cur)}" placeholder="Ex. Double-leg contre la cage et défense de guillotine"></label>
        <div class="row" style="gap:8px;margin-top:8px"><button class="btn tape-btn small" data-save="${id}">Enregistrer</button><button class="btn ghost small" data-cancel>Annuler</button></div>`;
      box.querySelector("[data-theme-in]").focus(); return;
    }
    if (e.target.closest("[data-cancel]")) { draw(); return; }
    const sv = e.target.closest("[data-save]");
    if (sv) {
      const val = sv.closest(".theme-line").querySelector("[data-theme-in]").value.trim();
      sv.disabled = true; sv.textContent = "Enregistrement…";
      try { await sync.saveTheme(monday, sv.dataset.save, val); cache[monday] = { ...cachedThemes(monday), [sv.dataset.save]: val }; if (!val) delete cache[monday][sv.dataset.save]; toast(val ? "Thème enregistré" : "Thème retiré"); draw(); }
      catch { sv.disabled = false; sv.textContent = "Enregistrer"; toast("Impossible : vérifie ta connexion"); }
    }
  });
  refresh();
}

// le coach règle la date de la semaine 1 et les semaines de vacances
function openCalendar(back) {
  const s = cachedSeason();
  let start = s.start, skip = new Set(s.skip || []);
  const body = openSheet("Calendrier de la saison", "");
  const draw = () => {
    const mondays = mondaysFrom(start, 48);
    let n = 0;
    body.innerHTML = `<p class="small muted" style="margin-top:0">${esc(s.program.title)} : 40 semaines. Indique le lundi de la semaine 1 et touche les semaines sans cours (vacances) : la numérotation se décale toute seule.</p>
      <label class="field"><span>Lundi de la semaine 1</span><input class="input" type="date" data-start value="${start}"></label>
      <div class="stack" style="gap:4px;margin-top:12px">${mondays.map((m) => { const off = skip.has(m); if (!off) n++; if (n > 40 && !off) return ""; return `<button type="button" class="cal-row${off ? " off" : ""}" data-m="${m}"><span>${esc(frDate(m, { day: "numeric", month: "short" }))}</span><b>${off ? "Vacances" : `S${n} · ${esc(s.program.weeks[n - 1]?.title || "")}`}</b></button>`; }).join("")}</div>
      <button class="btn tape-btn block" data-savecal style="margin-top:14px">Enregistrer le calendrier</button>`;
  };
  body.addEventListener("change", (e) => { if (e.target.closest("[data-start]")) { start = e.target.value; draw(); } });
  body.addEventListener("click", async (e) => {
    const r = e.target.closest("[data-m]"); if (r) { const m = r.dataset.m; skip.has(m) ? skip.delete(m) : skip.add(m); draw(); return; }
    const sv = e.target.closest("[data-savecal]");
    if (sv) {
      sv.disabled = true; sv.textContent = "Enregistrement…";
      try { await sync.saveSeason(start, [...skip].sort()); setSeasonDates(start, [...skip].sort()); toast("Calendrier enregistré"); back?.(); }
      catch { sv.disabled = false; sv.textContent = "Enregistrer le calendrier"; toast("Impossible : vérifie ta connexion"); }
    }
  });
  draw();
}
