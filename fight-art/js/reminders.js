// Rappels programmés : check-in, repas, prépa physique, cours, hydratation, coucher, rappels perso.
// Envoyés par le serveur du club en notification (même appli fermée) ; si l'appli est ouverte,
// elle sonne aussi elle-même à l'heure prévue.
import { store, todayKey, dayIndex, uid } from "./store.js";
import { CONFIG } from "./config.js";
import { sync } from "./sync.js";
import { CLUB_CLASSES } from "./data.js";
import { chime } from "./sound.js";

export const KINDS = {
  checkin: { label: "Check-in du matin", title: "Check-in du jour", body: "30 secondes : sommeil, fatigue, moral. Ton programme s'adapte.", url: "./#today" },
  meal: { label: "Repas", title: "C'est l'heure de manger", body: "Ouvre ton plan repas pour voir ta portion du jour.", url: "./#food" },
  sc: { label: "Prépa physique", title: "Prépa physique", body: "Ta séance du jour t'attend : échauffement, force, mobilité.", url: "./#train" },
  club: { label: "Cours au club", title: "Cours au club", body: "Prépare ton sac : protège-dents, gants, gourde.", url: "./#today" },
  water: { label: "Hydratation", title: "Bois un verre d'eau", body: "Petit rappel hydratation.", url: "./#food" },
  sleep: { label: "Coucher", title: "Bientôt l'heure de dormir", body: "Écrans coupés, chambre fraîche : la récupération commence maintenant.", url: "./#today" },
  custom: { label: "Rappel perso", title: "Rappel", body: "", url: "./#today" },
};
const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];
export const reminders = () => store.get().reminders || [];
const tz = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Paris"; } catch { return "Europe/Paris"; } };

// ce que reçoit le serveur : un titre, un texte, une heure, des jours
const forServer = (list) => list.map((r) => ({ id: r.id, kind: r.kind, on: r.on !== false, time: r.time, days: r.days, title: r.title || KINDS[r.kind]?.title, body: r.body ?? KINDS[r.kind]?.body, url: KINDS[r.kind]?.url }));

export async function saveReminders(list) {
  store.update((s) => { s.reminders = list; });
  if (sync.connected() && !window.FAP_PREVIEW) { try { await sync.saveReminders(forServer(list), tz()); return true; } catch { return false; } }
  return true;
}
export const makeReminder = (kind, time, days = ALL_DAYS, extra = {}) => ({ id: uid(), kind, time, days: [...days], on: true, ...extra });

// propositions selon le profil : check-in, prépa physique les jours prévus, 1 h avant chaque cours
export function suggested(p) {
  const out = [makeReminder("checkin", "08:00")];
  if (p?.scDays?.length) out.push(makeReminder("sc", "17:30", p.scDays));
  const byDay = {};
  (p?.classes || []).map((id) => CLUB_CLASSES.find((c) => c.id === id)).filter(Boolean).forEach((c) => { if (!byDay[c.day] || c.start < byDay[c.day]) byDay[c.day] = c.start; });
  Object.entries(byDay).forEach(([d, start]) => {
    const [h, m] = start.split(":").map(Number); const t = h * 60 + m - 60;
    out.push(makeReminder("club", `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`, [Number(d)], { body: `Cours à ${start.replace(":", "h")} : prépare ton sac (protège-dents, gants, gourde).` }));
  });
  out.push(makeReminder("sleep", "22:30"));
  return out;
}

// ---------- notifications ----------
export const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
export const isStandalone = () => window.matchMedia?.("(display-mode: standalone)").matches || navigator.standalone === true;
export const isIOS = () => /iPhone|iPad|iPod/.test(navigator.userAgent);
const b64 = (s) => { const p = "=".repeat((4 - (s.length % 4)) % 4); const raw = atob((s + p).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))); };

export async function pushState() {
  if (!pushSupported()) return "unsupported";
  if (Notification.permission === "denied") return "denied";
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); return sub ? "on" : "off"; } catch { return "off"; }
}
export async function enablePush() {
  if (!pushSupported()) throw new Error(isIOS() && !isStandalone() ? "install" : "unsupported");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("denied");
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(CONFIG.VAPID_PUBLIC) });
  await sync.pushSubscribe(sub.toJSON());
  await saveReminders(reminders());
  return true;
}
export async function disablePush() {
  try { const reg = await navigator.serviceWorker.ready; const sub = await reg.pushManager.getSubscription(); if (sub) { await sync.pushUnsubscribe(sub.endpoint).catch(() => {}); await sub.unsubscribe(); } } catch {}
}

// ---------- quand l'appli est ouverte : elle sonne elle-même ----------
const FIRED = "fap:fired";
export function startLocalReminders(onFire) {
  const check = () => {
    const now = new Date(), key = todayKey(), di = dayIndex(key);
    const hm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    let fired = {}; try { fired = JSON.parse(localStorage.getItem(FIRED) || "{}"); } catch {}
    if (fired.day !== key) fired = { day: key, ids: [] };
    reminders().forEach((r) => {
      if (r.on === false || !r.days?.includes(di) || fired.ids.includes(r.id)) return;
      if (r.time > hm) return;
      const [h, m] = r.time.split(":").map(Number);
      if (now.getHours() * 60 + now.getMinutes() - (h * 60 + m) > 15) return; // trop tard : on ne rattrape pas
      if (r.kind === "checkin" && store.get().checkins?.[key]) return;
      fired.ids.push(r.id);
      chime();
      onFire?.(r.title || KINDS[r.kind].title, r.body ?? KINDS[r.kind].body);
    });
    try { localStorage.setItem(FIRED, JSON.stringify(fired)); } catch {}
  };
  check();
  return setInterval(check, 30000);
}
