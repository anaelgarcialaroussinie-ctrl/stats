// Écran « Mes rappels » : activer les notifications, programmer les horaires.
import { store } from "../store.js";
import { esc, icon, openSheet, toast } from "../ui.js";
import { DAYS } from "../data.js";
import { sync } from "../sync.js";
import { KINDS, reminders, saveReminders, makeReminder, suggested, pushState, enablePush, disablePush, isIOS, isStandalone } from "../reminders.js";
import { chime, unlockAudio } from "../sound.js";

export function openReminders() {
  const body = openSheet("Mes rappels", "");
  let list = reminders().map((r) => ({ ...r, days: [...(r.days || [])] }));
  let push = "off", editing = null;

  const row = (r, i) => `<div class="panel rem${r.on === false ? " is-off" : ""}" style="padding:12px;margin-top:8px">
      <div class="row between" style="gap:8px">
        <div style="min-width:0"><div style="font-weight:700">${esc(r.title || KINDS[r.kind].title)}</div><div class="tiny muted">${esc(KINDS[r.kind].label)} · ${r.days.length === 7 ? "tous les jours" : r.days.map((d) => DAYS[d]).join(", ") || "aucun jour"}</div></div>
        <div class="row" style="gap:6px;flex:none"><b class="num" style="font-size:20px">${esc(r.time.replace(":", "h"))}</b>
          <button class="chip" data-toggle="${i}" aria-pressed="${r.on !== false}">${r.on === false ? "Off" : "On"}</button></div>
      </div>
      ${editing === i ? `<div class="stack" style="margin-top:10px;gap:8px">
        <label class="field"><span>Heure</span><input class="input" type="time" data-time="${i}" value="${esc(r.time)}"></label>
        <div class="chips">${DAYS.map((d, di) => `<button type="button" class="chip" data-day="${i}" data-i="${di}" aria-pressed="${r.days.includes(di)}">${d}</button>`).join("")}</div>
        <label class="field"><span>Titre</span><input class="input" data-title="${i}" maxlength="60" value="${esc(r.title || KINDS[r.kind].title)}"></label>
        <label class="field"><span>Message</span><input class="input" data-body="${i}" maxlength="140" value="${esc(r.body ?? KINDS[r.kind].body)}"></label>
        <div class="row" style="gap:8px"><button class="btn tape-btn small" data-done>OK</button><button class="btn ghost small" data-del="${i}" style="color:var(--bad)">${icon("trash")} Supprimer</button></div>
      </div>` : `<button class="btn ghost small" data-edit="${i}" style="margin-top:8px">${icon("edit")} Modifier</button>`}
    </div>`;

  const pushBlock = () => {
    if (push === "on") return `<p class="notice small">Notifications activées sur ce téléphone : tes rappels arrivent même appli fermée.</p><button class="btn ghost small" data-pushoff>Couper les notifications ici</button>`;
    if (push === "denied") return `<p class="notice is-warn small">Les notifications sont bloquées pour l'appli. Réglages du téléphone → Notifications → Fight Art → Autoriser.</p>`;
    if (isIOS() && !isStandalone()) return `<p class="notice is-warn small">Sur iPhone, les rappels ne marchent qu'avec l'appli installée : bouton Partager → « Sur l'écran d'accueil », puis ouvre l'appli depuis son icône et reviens ici.</p>`;
    if (push === "unsupported") return `<p class="notice is-warn small">Ce navigateur ne reçoit pas les notifications. Les rappels sonneront seulement quand l'appli est ouverte.</p>`;
    return `<button class="btn tape-btn block" data-pushon>${icon("bell")} Activer les notifications</button><p class="hint">Sans ça, les rappels ne sonnent que si l'appli est ouverte.</p>`;
  };

  const draw = () => {
    body.innerHTML = `
      ${pushBlock()}
      <h3 class="sys-h">Mes horaires</h3>
      ${list.length ? list.map(row).join("") : `<p class="muted small">Aucun rappel pour l'instant.</p>`}
      ${list.length ? "" : `<button class="btn block" data-suggest style="margin-top:10px">Proposer mes rappels (check-in, prépa, cours, coucher)</button>`}
      <h3 class="sys-h">Ajouter</h3>
      <div class="chips">${Object.entries(KINDS).map(([k, v]) => `<button type="button" class="chip" data-add="${k}">${icon("plus")} ${esc(v.label)}</button>`).join("")}</div>
      <p class="hint">Les rappels de repas se créent aussi depuis ton plan repas (onglet Nutrition), aux heures de ton plan.</p>
      <div class="row" style="gap:8px;margin-top:14px"><button class="btn tape-btn" data-save>Enregistrer</button><button class="btn ghost" data-test>Tester le son</button></div>`;
  };

  body.addEventListener("click", async (e) => {
    const t = e.target.closest("button"); if (!t) return;
    const d = t.dataset;
    if (d.pushon !== undefined) {
      t.disabled = true; t.textContent = "Activation…";
      try { if (!sync.connected()) throw new Error("offline"); await enablePush(); push = "on"; toast("Notifications activées"); }
      catch (err) { toast(err.message === "install" ? "Installe d'abord l'appli sur l'écran d'accueil" : err.message === "denied" ? "Notifications refusées" : "Activation impossible pour l'instant"); push = await pushState(); }
      draw(); return;
    }
    if (d.pushoff !== undefined) { await disablePush(); push = await pushState(); toast("Notifications coupées sur ce téléphone"); draw(); return; }
    if (d.suggest !== undefined) { list = suggested(store.get().profile); draw(); return; }
    if (d.add) { list.push(makeReminder(d.add, d.add === "checkin" ? "08:00" : d.add === "sleep" ? "22:30" : "12:00")); editing = list.length - 1; draw(); return; }
    if (d.toggle) { const r = list[Number(d.toggle)]; r.on = r.on === false; draw(); return; }
    if (d.edit) { editing = Number(d.edit); draw(); return; }
    if (d.done !== undefined) { editing = null; draw(); return; }
    if (d.del) { list.splice(Number(d.del), 1); editing = null; draw(); return; }
    if (d.day) { const r = list[Number(d.day)]; const di = Number(d.i); r.days = r.days.includes(di) ? r.days.filter((x) => x !== di) : [...r.days, di].sort(); t.setAttribute("aria-pressed", r.days.includes(di)); return; }
    if (d.test !== undefined) { unlockAudio(); chime(); return; }
    if (d.save !== undefined) {
      t.disabled = true;
      const ok = await saveReminders(list.filter((r) => /^\d{2}:\d{2}$/.test(r.time)));
      t.disabled = false; toast(ok ? "Rappels enregistrés" : "Enregistré sur ce téléphone, envoi au serveur dès que possible");
    }
  });
  body.addEventListener("input", (e) => {
    const x = e.target.dataset;
    if (x.time) list[Number(x.time)].time = e.target.value;
    if (x.title) list[Number(x.title)].title = e.target.value;
    if (x.body) list[Number(x.body)].body = e.target.value;
  });
  draw();
  pushState().then((s) => { push = s; if (body.isConnected) draw(); });
}
