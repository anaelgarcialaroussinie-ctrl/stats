import { store, todayKey } from "./store.js";
import { esc, icon, openSheet, closeSheet, toast, initials } from "./ui.js";
import { renderOnboarding } from "./views/onboarding.js";
import { renderToday } from "./views/today.js";
import { renderNutrition } from "./views/nutrition.js";
import { renderTraining } from "./views/training.js";
import { renderProgress } from "./views/progress.js";
import { renderCoach } from "./views/coach.js";
import { renderAcademy } from "./views/academy.js";
import { LEVELS, DAYS } from "./data.js";
import { isMinor, findClass } from "./engine.js";
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
  if (!tabs.find((t) => t.id === current)) current = "today";
  const tab = tabs.find((t) => t.id === current);
  const y = window.scrollY;
  app.innerHTML = `
    <main class="screen">
      <header class="topbar">
        <div class="brand"><span class="brand-mark" aria-hidden="true">FA</span><span>Fight Art Performance</span></div>
        <button class="avatar" data-profile aria-label="Mon profil">${esc(initials(p.name))}</button>
      </header>
      ${window.FAP_PREVIEW ? `<p class="notice is-warn small" style="margin-bottom:14px">Aperçu : le scan, la recherche d'aliments et l'installation sur l'écran d'accueil fonctionnent dans la version en ligne de l'appli.</p>` : ""}
      <div data-view></div>
    </main>
    <nav class="tabbar" aria-label="Navigation"><div class="tabbar-inner" style="--tabs:${tabs.length}">
      ${tabs.map((t) => `<button class="tab" data-tab="${t.id}" ${t.id === current ? 'aria-current="page"' : ""}>${icon(t.icon)}<span>${t.label}</span></button>`).join("")}
    </div></nav>`;
  tab.render(app.querySelector("[data-view]"), ctx, params);
  params = {};
  app.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => ctx.go(b.dataset.tab)));
  app.querySelector("[data-profile]").addEventListener("click", openProfile);
  window.scrollTo(0, keepScroll ? y : 0);
}

window.addEventListener("hashchange", () => { current = (location.hash || "#today").slice(1); render(); });

// ---------- profil ----------
function openProfile() {
  const p = { ...store.get().profile };
  p.clubDays = [...(p.clubDays || [])]; p.scDays = [...(p.scDays || [])];
  const cl = findClass(p);
  const dayChips = (name) => `<div class="chips">${DAYS.map((d, i) => `<button type="button" class="chip" data-day="${name}" data-i="${i}" aria-pressed="${p[name].includes(i)}">${d}</button>`).join("")}</div>`;
  const body = openSheet(p.name, `
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
      <label class="field"><span>Préparation physique</span><select class="input" name="equipment"><option value="gym" ${p.equipment === "gym" ? "selected" : ""}>En salle</option><option value="home" ${p.equipment === "home" ? "selected" : ""}>À la maison</option></select></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Jours au club</span>${dayChips("clubDays")}</div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Jours de préparation physique</span>${dayChips("scDays")}</div>
      ${p.sex === "F" ? `<label class="row"><input type="checkbox" name="trackCycle" ${p.trackCycle ? "checked" : ""} style="width:22px;height:22px"><span>Suivre mon cycle dans le check-in (facultatif)</span></label>` : ""}
      ${cl ? `<p class="hint">Catégorie estimée : ${esc(cl.label)}${cl.sex === "F" ? " (F)" : ""}, limite ${cl.maxKg} kg.${isMinor(p) ? " Profil mineur : protections activées." : ""}</p>` : ""}
      <button class="btn tape-btn block">Enregistrer</button>
    </form>
    ${sync.connected() ? `<h3 class="h-sec">Mon compte</h3>
    <div class="panel stack">
      <div class="row between"><span class="muted small">Équipe</span><b>${esc(sync.teamName())}</b></div>
      ${p.role === "coach" ? `<div><div class="muted small">Code à donner à tes fighters</div><div class="row between"><b class="num" data-joincode>…</b><button class="btn small ghost" data-copy="joincode">Copier</button></div></div>` : ""}
      <div><div class="muted small">Code de connexion (pour ton autre téléphone, garde-le pour toi)</div>
        <div class="row between"><code class="tiny num" style="word-break:break-all">${esc(sync.token())}</code><button class="btn small ghost" data-copy="token">Copier</button></div></div>
    </div>` : `<p class="notice is-warn small" style="margin-top:16px">Ce téléphone n'est relié à aucune équipe : tes données restent sur ce téléphone.</p>`}
    <div class="stack" style="margin-top:22px">
      <button class="btn ghost block" data-install>Installer l'appli sur mon téléphone</button>
      <button class="btn ghost block" data-export>Exporter mes données</button>
      <button class="btn ghost block" data-reset style="color:var(--bad)">${sync.connected() ? "Me déconnecter de ce téléphone" : "Effacer mes données sur ce téléphone"}</button>
    </div>`);
  const f = body.querySelector("[data-prof]");
  f.addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]"); if (!b) return;
    const arr = p[b.dataset.day]; const i = Number(b.dataset.i); const k = arr.indexOf(i);
    if (k >= 0) arr.splice(k, 1); else arr.push(i);
    b.setAttribute("aria-pressed", k < 0);
  });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const n = (x) => (f[x].value ? Number(String(f[x].value).replace(",", ".")) : null);
    Object.assign(p, { weight: n("weight"), height: n("height"), reach: n("reach"), birthYear: n("birthYear"), level: Number(f.level.value), goal: f.goal.value, competitionDate: f.competitionDate.value, equipment: f.equipment.value, trackCycle: f.trackCycle?.checked || false });
    store.update((s) => { s.profile = p; });
    closeSheet(); toast("Profil mis à jour"); render();
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

if ("serviceWorker" in navigator && location.protocol === "https:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

sync.pull().then(() => { if (store.get().profile) render(true); });
let lastInbox = 0;
sync.onChange(() => { const n = sync.cachedInbox().length; if (n !== lastInbox && current === "today" && !document.getElementById("sheet-root").innerHTML && store.get().profile) { lastInbox = n; render(true); } });
render();
