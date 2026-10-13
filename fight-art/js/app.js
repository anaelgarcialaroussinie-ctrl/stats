import { store, todayKey } from "./store.js";
import { esc, icon, openSheet, closeSheet, toast, initials, avatarHtml, squarePhoto, cropImage, openCropper } from "./ui.js";
import { profileCard, badgePicker, MAX_BADGES, openProfileView, openTeamProfiles } from "./views/identity.js";
import { openReminders } from "./views/reminders-view.js";
import { startLocalReminders } from "./reminders.js";
import { openModelSearch } from "./views/models.js";
import { renderOnboarding } from "./views/onboarding.js";
import { renderToday } from "./views/today.js";
import { renderNutrition } from "./views/nutrition.js";
import { renderTraining } from "./views/training.js";
import { renderProgress } from "./views/progress.js";
import { renderCoach } from "./views/coach.js";
import { renderAcademy } from "./views/academy.js";
import { renderAssistant } from "./views/assistant.js";
import { LEVELS, DAYS, DAYS_LONG, CLUB_CLASSES, PARCOURS, PAIN_ZONES, clubDaysOf, hm } from "./data.js";
import { isMinor, findClass, DAILY_LIFE } from "./engine.js";
import { sync } from "./sync.js";

const app = document.getElementById("app");

const TABS = [
  { id: "today", label: "Aujourd'hui", icon: "today", render: renderToday },
  { id: "food", label: "Nutrition", icon: "food", render: renderNutrition },
  { id: "train", label: "Séances", icon: "train", render: renderTraining },
  { id: "academy", label: "Academy", icon: "academy", render: renderAcademy },
  { id: "progress", label: "Progrès", icon: "progress", render: renderProgress },
  { id: "team", label: "Équipe", icon: "team", render: renderCoach, coach: true },
];

let current = (location.hash || "#today").slice(1);
let params = {};

const ctx = {
  go(id, p = {}) { closeSheet(); params = p; if (current === id) render(); else location.hash = id; },
  refresh() { render(true); },
};

function tabsFor(p) { return TABS.filter((t) => !t.coach || p.role === "coach"); }

function render(keepScroll = false) {
  const p = store.get().profile;
  if (!p) {
    app.innerHTML = "";
    const prefillCode = new URLSearchParams(location.search).get("code") || "";
    renderOnboarding(app, {
      prefillCode,
      checkCode: (code) => (window.FAP_PREVIEW ? Promise.resolve({ role: "coach", team_name: "Aperçu" }) : sync.checkCode(code)),
      restore: async (code) => { await sync.restore(code); location.hash = "today"; current = "today"; render(); },
      onDone: async (profile, code) => {
        try { if (!window.FAP_PREVIEW) { await sync.join(code, profile); sync.inbox(); } }
        catch (e) { throw new Error(e.code === "invalid_code" ? "Code d'équipe inconnu." : "Connexion impossible. Vérifie ta connexion internet et réessaie."); }
        store.update((s) => {
          s.profile = { ...profile, role: sync.role() || profile.role };
          if (profile.weight) s.weights.push({ date: todayKey(), kg: profile.weight });
        });
        location.hash = "today"; current = "today"; render();
        setTimeout(installHint, 1200);
      },
    });
    return;
  }
  const tabs = tabsFor(p);
  if (current !== "assistant" && !tabs.find((t) => t.id === current)) current = "today";
  const tab = current === "assistant" ? { render: renderAssistant } : tabs.find((t) => t.id === current);
  const y = window.scrollY;
  app.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <div class="brand"><img class="brand-mark" src="icons/icon-192.png" alt="" aria-hidden="true"><span>Fight Art Performance</span></div>
        <div class="row" style="gap:8px"><button class="icon-btn" data-assistant aria-label="Assistant" style="background:var(--tape);color:var(--tape-ink)">${icon("chat")}</button><button class="avatar-btn" data-profile aria-label="Mon profil">${avatarHtml(p.name, p.photo)}</button></div>
      </header>
      ${window.FAP_PREVIEW ? `<p class="notice is-warn small" style="margin-bottom:14px">Aperçu de démonstration : le scan, la recherche d'aliments, l'équipe et l'assistant fonctionnent dans la version en ligne de l'appli.</p>` : ""}
      <div data-view></div>
    </main>
    <nav class="tabbar" aria-label="Navigation"><div class="tabbar-inner" style="--tabs:${tabs.length}">
      ${tabs.map((t) => `<button class="tab" data-tab="${t.id}" ${t.id === current ? 'aria-current="page"' : ""}>${icon(t.icon)}<span>${t.label}</span></button>`).join("")}
    </div></nav>`;
  tab.render(app.querySelector("[data-view]"), ctx, params);
  params = {};
  app.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => ctx.go(b.dataset.tab)));
  app.querySelector("[data-profile]").addEventListener("click", openProfile);
  app.querySelector("[data-assistant]").addEventListener("click", () => ctx.go("assistant"));
  window.scrollTo(0, keepScroll ? y : 0);
}

window.addEventListener("hashchange", () => { current = (location.hash || "#today").slice(1); render(); });

// ---------- profil ----------
function openProfile() {
  const p = { ...store.get().profile };
  p.clubDays = [...(p.clubDays || [])]; p.scDays = [...(p.scDays || [])]; p.classes = [...(p.classes || [])];
  const classChips = () => DAYS.map((d, di) => { const cs = CLUB_CLASSES.filter((c) => c.day === di); return cs.length ? `<div class="tiny muted" style="margin:8px 0 4px;font-weight:700">${DAYS_LONG[di][0].toUpperCase() + DAYS_LONG[di].slice(1)}</div><div class="chips">${cs.map((c) => `<button type="button" class="chip" data-cls="${c.id}" aria-pressed="${p.classes.includes(c.id)}">${hm(c.start)} ${esc(c.name)}</button>`).join("")}</div>` : ""; }).join("");
  const cl = findClass(p);
  const dayChips = (name) => `<div class="chips">${DAYS.map((d, i) => `<button type="button" class="chip" data-day="${name}" data-i="${i}" aria-pressed="${p[name].includes(i)}">${d}</button>`).join("")}</div>`;
  const body = openSheet("Mon profil", `
    <div data-card>${profileCard(p, { models: store.get().favFighters || [] })}</div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
      <button type="button" class="btn ghost small" data-asseen>Voir mon profil comme l'équipe</button>
      <button type="button" class="btn ghost small" data-team-profiles>Profils de l'équipe</button>
      <button type="button" class="btn ghost small" data-reminders>${icon("timer")} Mes rappels</button>
    </div>
    <div class="row" style="gap:8px;flex-wrap:wrap;margin:12px 0 4px">
      <label class="btn small">${icon("camera")} Photo<input type="file" accept="image/*" data-photo hidden></label>
      <label class="btn small">${icon("camera")} Bannière<input type="file" accept="image/*" data-banner hidden></label>
      ${p.photo ? `<button type="button" class="btn ghost small" data-photo-del>Retirer la photo</button>` : ""}
      ${p.banner ? `<button type="button" class="btn ghost small" data-banner-del>Retirer la bannière</button>` : ""}
    </div>
    <h3 class="sys-h">Mes insignes <span class="tiny muted">(jusqu'à ${MAX_BADGES})</span></h3>
    <div data-badges>${badgePicker(p.badges || [])}</div>
    <h3 class="sys-h">Mes modèles UFC</h3>
    <p class="small muted" style="margin:0 0 8px">${(store.get().favFighters || []).length ? esc((store.get().favFighters || []).join(" · ")) : "Aucun pour l'instant."}</p>
    <button type="button" class="btn ghost small" data-models>Choisir mes modèles</button>
    <h3 class="sys-h">Mes infos</h3>
    <form class="stack" data-prof>
      <div class="grid2">
        <label class="field"><span>Poids (kg)</span><input class="input num" name="weight" inputmode="decimal" value="${p.weight ?? ""}"></label>
        <label class="field"><span>Taille (cm)</span><input class="input num" name="height" inputmode="numeric" value="${p.height ?? ""}"></label>
        <label class="field"><span>Envergure (cm)</span><input class="input num" name="reach" inputmode="numeric" value="${p.reach ?? ""}"></label>
        <label class="field"><span>Année de naissance</span><input class="input num" name="birthYear" inputmode="numeric" value="${p.birthYear ?? ""}"></label>
      </div>
      <label class="field"><span>Niveau</span><select class="input" name="level">${LEVELS.map((l) => `<option value="${l.id}" ${l.id === p.level ? "selected" : ""}>${l.label} · ${l.hint}</option>`).join("")}</select></label>
      <label class="field"><span>Objectif</span><select class="input" name="goal"><option value="perf" ${p.goal === "perf" ? "selected" : ""}>Progresser</option><option value="weight" ${p.goal === "weight" ? "selected" : ""}>Perdre du poids</option><option value="compet" ${p.goal === "compet" ? "selected" : ""}>Préparer un combat</option></select></label>
      <label class="field"><span>Date du combat</span><input class="input" type="date" name="competitionDate" value="${p.competitionDate || ""}"></label>
      <label class="field"><span>Mon quotidien (hors entraînement)</span><select class="input" name="daily">${DAILY_LIFE.map((d) => `<option value="${d.id}" ${d.id === (p.daily || "sit") ? "selected" : ""}>${esc(d.label)}</option>`).join("")}</select></label>
      <label class="field"><span>Préparation physique</span><select class="input" name="equipment"><option value="gym" ${p.equipment === "gym" ? "selected" : ""}>En salle</option><option value="home" ${p.equipment === "home" ? "selected" : ""}>À la maison</option></select></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Mes cours au club</span>
        <div class="chips">${PARCOURS.map((x) => `<button type="button" class="chip" data-parcours="${x.id}">${esc(x.label)}</button>`).join("")}</div>
        <p class="hint">Choisis ta formule pour cocher ses cours, puis ajuste cours par cours.</p>
        <div data-classes>${classChips()}</div></div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Jours de préparation physique</span>${dayChips("scDays")}</div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Mes zones fragiles (blessures anciennes ou à surveiller)</span>
        <div class="chips">${PAIN_ZONES.map((z) => `<button type="button" class="chip" data-inj="${esc(z)}" aria-pressed="${(p.injuries || []).includes(z)}">${esc(z)}</button>`).join("")}</div>
        <p class="hint">La prépa physique remplace les exercices qui sollicitent ces zones et ajoute du renforcement ciblé.</p></div>
      ${p.sex === "F" ? `<label class="row"><input type="checkbox" name="trackCycle" ${p.trackCycle ? "checked" : ""} style="width:22px;height:22px"><span>Suivre mon cycle dans le check-in (facultatif)</span></label>` : ""}
      ${cl ? `<p class="hint">Catégorie estimée : ${esc(cl.label)}${cl.sex === "F" ? " (F)" : ""}, limite ${cl.maxKg} kg.${isMinor(p) ? " Profil mineur : protections activées." : ""}</p>` : ""}
      <button class="btn tape-btn block">Enregistrer</button>
    </form>
    ${sync.connected() ? `<h3 class="h-sec">Mon compte</h3>
    <div class="panel stack">
      <div class="row between"><span class="muted small">Équipe</span><b>${esc(sync.teamName())}</b></div>
      <div class="row between"><span class="muted small">Rôle</span><b>${p.role === "coach" ? "Coach" : "Fighter"}</b></div>
      <div class="row between"><span class="muted small">Dernière sauvegarde</span><span class="small" data-lastsync>${sync.lastSync() ? esc(new Date(sync.lastSync()).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })) : "jamais"}</span></div>
      <button type="button" class="btn ghost small" data-savenow>Sauvegarder maintenant</button>
      ${p.role === "coach" ? `<div><div class="muted small">Code à donner à tes fighters</div><div class="row between"><b class="num" data-joincode>…</b><button class="btn small ghost" data-copy="joincode">Copier</button></div></div>` : ""}
      <div><div class="muted small">Code de connexion (pour ton autre téléphone, garde-le pour toi)</div>
        <div class="row between"><code class="tiny num" style="word-break:break-all">${esc(sync.token())}</code><button class="btn small ghost" data-copy="token">Copier</button></div></div>
    </div>` : `<p class="notice is-warn small" style="margin-top:16px">Ce téléphone n'est relié à aucune équipe : tes données restent sur ce téléphone.</p>`}
    <div class="stack" style="margin-top:22px">
      <button class="btn ghost block" data-install>Installer l'appli sur mon téléphone</button>
      <button class="btn ghost block" data-update>Mettre à jour l'appli</button>
      <p class="hint" style="text-align:center">Version ${APP_VERSION}</p>
      <button class="btn ghost block" data-export>Exporter mes données</button>
      <button class="btn ghost block" data-reset style="color:var(--bad)">${sync.connected() ? "Me déconnecter de ce téléphone" : "Effacer mes données sur ce téléphone"}</button>
    </div>`);
  const setImg = (key, val, msg) => {
    p[key] = val;
    store.update((s) => { s.profile = { ...s.profile, [key]: val }; if (!val) delete s.profile[key]; });
    closeSheet(); toast(msg); render(); openProfile();
  };
  body.querySelector("[data-asseen]").addEventListener("click", () => { const q = store.get().profile || {}; openProfileView({ me: true, name: q.name, role: q.role, photo: q.photo, banner: q.banner, badges: q.badges || [], styleName: q.styleName, favFighters: store.get().favFighters || [] }); });
  body.querySelector("[data-team-profiles]").addEventListener("click", openTeamProfiles);
  body.querySelector("[data-reminders]").addEventListener("click", openReminders);
  body.querySelector("[data-photo]").addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const v = await openCropper(file, { w: 256, h: 256, round: true, title: "Ajuster ma photo", quality: 0.82 });
    if (v) setImg("photo", v, "Photo enregistrée"); else openProfile();
  });
  body.querySelector("[data-banner]").addEventListener("change", async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    const v = await openCropper(file, { w: 720, h: 240, title: "Ajuster ma bannière", quality: 0.72 });
    if (v) setImg("banner", v, "Bannière enregistrée"); else openProfile();
  });
  body.querySelector("[data-photo-del]")?.addEventListener("click", () => setImg("photo", "", "Photo retirée"));
  body.querySelector("[data-banner-del]")?.addEventListener("click", () => setImg("banner", "", "Bannière retirée"));
  body.querySelector("[data-badges]").addEventListener("click", (e) => {
    const b = e.target.closest("[data-badge]"); if (!b) return;
    const cur = store.get().profile.badges || []; const id = b.dataset.badge;
    if (!cur.includes(id) && cur.length >= MAX_BADGES) { toast(`${MAX_BADGES} insignes maximum : retire-en un d'abord`); return; }
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
    p.badges = next;
    store.update((s) => { s.profile = { ...s.profile, badges: next }; });
    b.setAttribute("aria-pressed", next.includes(id));
    body.querySelector("[data-card]").innerHTML = profileCard({ ...store.get().profile }, { models: store.get().favFighters || [] });
  });
  body.querySelector("[data-models]").addEventListener("click", () => openModelSearch(null, () => {}));
  const f = body.querySelector("[data-prof]");
  f.equipment.addEventListener("change", () => { p.equipment = f.equipment.value; store.update((s) => { s.profile = { ...s.profile, equipment: f.equipment.value }; }); toast(f.equipment.value === "home" ? "Prépa physique : version maison" : "Prépa physique : version salle"); });
  f.addEventListener("click", (e) => {
    const ij = e.target.closest("[data-inj]");
    if (ij) { const z = ij.dataset.inj; p.injuries = (p.injuries || []).includes(z) ? p.injuries.filter((x) => x !== z) : [...(p.injuries || []), z]; ij.setAttribute("aria-pressed", p.injuries.includes(z)); return; }
    const pc = e.target.closest("[data-parcours]");
    if (pc) { p.classes = [...PARCOURS.find((x) => x.id === pc.dataset.parcours).classes]; f.querySelector("[data-classes]").innerHTML = classChips(); return; }
    const cb = e.target.closest("[data-cls]");
    if (cb) { const id = cb.dataset.cls; p.classes = p.classes.includes(id) ? p.classes.filter((x) => x !== id) : [...p.classes, id]; cb.setAttribute("aria-pressed", p.classes.includes(id)); return; }
    const b = e.target.closest("[data-day]"); if (!b) return;
    const arr = p[b.dataset.day]; const i = Number(b.dataset.i); const k = arr.indexOf(i);
    if (k >= 0) arr.splice(k, 1); else arr.push(i);
    b.setAttribute("aria-pressed", k < 0);
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = (x) => (f[x].value ? Number(String(f[x].value).replace(",", ".")) : null);
    if (p.classes.length) p.clubDays = clubDaysOf(p);
    Object.assign(p, { weight: n("weight"), height: n("height"), reach: n("reach"), birthYear: n("birthYear"), level: Number(f.level.value), goal: f.goal.value, competitionDate: f.competitionDate.value, equipment: f.equipment.value, daily: f.daily.value, trackCycle: f.trackCycle?.checked || false });
    store.update((s) => { s.profile = { ...p, photo: s.profile.photo, banner: s.profile.banner, badges: s.profile.badges, styleName: s.profile.styleName }; ["photo", "banner"].forEach((k) => { if (!s.profile[k]) delete s.profile[k]; }); });
    closeSheet(); toast("Profil mis à jour"); render();
  });
  body.querySelector("[data-savenow]")?.addEventListener("click", async (e) => {
    e.target.disabled = true; e.target.textContent = "Sauvegarde…";
    const ok = await sync.push();
    e.target.disabled = false; e.target.textContent = "Sauvegarder maintenant";
    if (ok) { body.querySelector("[data-lastsync]").textContent = "à l'instant"; toast("Données sauvegardées"); } else toast("Sauvegarde impossible : vérifie ta connexion");
  });
  body.querySelector("[data-update]").addEventListener("click", async () => {
    toast("Mise à jour…");
    try { await sync.push(); } catch {}
    try { const rs = await navigator.serviceWorker?.getRegistrations(); await Promise.all((rs || []).map((r) => r.unregister())); } catch {}
    try { const ks = await caches.keys(); await Promise.all(ks.map((k) => caches.delete(k))); } catch {}
    location.replace(location.pathname + "?v=" + Date.now());
  });
  body.querySelector("[data-install]").addEventListener("click", () => { closeSheet(); installHint(true); });
  if (p.role === "coach" && sync.connected()) sync.team().then((t) => { const el = body.querySelector("[data-joincode]"); if (el && t) el.textContent = t.join_code; }).catch(() => {});
  body.querySelectorAll("[data-copy]").forEach((b) => b.addEventListener("click", async () => {
    const text = b.dataset.copy === "token" ? sync.token() : body.querySelector("[data-joincode]").textContent;
    try { await navigator.clipboard.writeText(text); toast("Copié"); } catch { toast("Sélectionne le texte pour le copier"); }
  }));
  body.querySelector("[data-export]").addEventListener("click", () => {
    const blob = new Blob([store.export()], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "fight-art-performance.json"; a.click();
  });
  body.querySelector("[data-reset]").addEventListener("click", (e) => {
    const b = e.currentTarget;
    if (b.dataset.armed) { sync.signOut(); store.reset(); closeSheet(); render(); return; }
    b.dataset.armed = "1"; b.textContent = sync.connected() ? "Confirmer : déconnecter et effacer ce téléphone" : "Confirmer : tout effacer";
  });
}

// ---------- installation iPhone ----------
function installHint(force = false) {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  if (standalone && !force) return;
  if (!force && localStorage.getItem("fap:installHint")) return;
  localStorage.setItem("fap:installHint", "1");
  openSheet("Sur ton écran d'accueil", `
    <ol class="plan">
      <li class="plan-item"><div><div class="t">Ouvre cette page dans Safari</div><div class="d">L'installation se fait depuis Safari sur iPhone.</div></div><span></span></li>
      <li class="plan-item"><div><div class="t">Touche le bouton Partager</div><div class="d">Le carré avec une flèche vers le haut, en bas de l'écran.</div></div><span></span></li>
      <li class="plan-item"><div><div class="t">Choisis « Sur l'écran d'accueil »</div><div class="d">Puis « Ajouter ». L'icône Fight Art apparaît avec tes autres applis.</div></div><span></span></li>
    </ol>
    <button class="btn tape-btn block" data-ok style="margin-top:14px">Compris</button>`, { onMount: (b) => b.querySelector("[data-ok]").addEventListener("click", closeSheet) });
}

const APP_VERSION = "59";
if ("serviceWorker" in navigator && location.protocol === "https:") {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register("sw.js", { updateViaCache: "none" }).then((r) => r.update()).catch(() => {});
  // nouvelle version installée : on recharge une fois pour ne pas mélanger ancien et nouveau code
  let reloaded = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
}

sync.pull().then(() => { if (store.get().profile) render(true); });
window.FAP_BOOTED = true;
let lastInbox = 0;
sync.onChange(() => { const n = sync.cachedInbox().length; if (n !== lastInbox && current === "today" && !document.getElementById("sheet-root").innerHTML && store.get().profile) { lastInbox = n; render(true); } });
render();
// rappels programmés : quand l'appli est ouverte, elle sonne elle-même à l'heure prévue
startLocalReminders((title, body) => toast(body ? `${title} · ${body}` : title));
