// Cache hors ligne : l'appli s'ouvre même sans réseau.
const VERSION = "fap-v41";
const ASSETS = [
  "./", "./index.html", "./manifest.webmanifest", "./css/app.css", "./fonts/archivo.ttf",
  "./js/app.js", "./js/store.js", "./js/engine.js", "./js/data.js", "./js/ui.js", "./js/off.js", "./js/sync.js", "./js/config.js",
  "./js/views/onboarding.js", "./js/views/today.js", "./js/views/nutrition.js", "./js/views/training.js",
  "./js/views/progress.js", "./js/views/academy.js", "./js/views/assistant.js", "./js/views/systems.js", "./js/systems-data.js",
  "./js/luta-data.js",
  "./js/discussion-data.js",
  "./js/views/discussion.js",
  "./js/views/identity.js",
  "./js/views/models.js",
  "./js/drill-guides.js",
  "./js/views/planning.js",
  "./js/views/notes.js",
  "./js/views/stylelab.js",
  "./js/sc-data.js",
  "./js/qualities.js",
  "./js/season.js",
  "./js/luta-season.js",
  "./js/sound.js",
  "./js/reminders.js",
  "./js/meal-data.js",
  "./js/views/mealplan.js",
  "./js/views/reminders-view.js",
  "./js/programs.js",
  "./js/study-notes.js",
  "./js/answer.js",
  "./js/views/localvids.js",
  "./js/views/programs-view.js",
  "./js/views/video.js",
  "./icons/logo.png", "./js/academy-data.js", "./js/views/coach.js", "./js/views/sessions.js", "./js/views/timer.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  // cache: "reload" : on ignore le cache du navigateur pour ne jamais mélanger deux versions
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== location.origin) return; // Open Food Facts, Supabase : réseau direct
  // réseau d'abord pour avoir la dernière version, cache si hors ligne
  // « no-cache » : le navigateur revérifie toujours auprès du serveur (sinon l'iPhone peut garder un vieux fichier 10 minutes)
  e.respondWith(fetch(url.href, { cache: "no-cache", credentials: "same-origin" }).then((r) => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then((c) => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match(e.request, { ignoreSearch: true }).then((r) => r || caches.match("./index.html"))));
});

// rappels : notification reçue du serveur, même appli fermée
self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Fight Art", body: e.data?.text() || "" }; }
  e.waitUntil(self.registration.showNotification(d.title || "Fight Art", {
    body: d.body || "", icon: "./icons/icon-192.png", badge: "./icons/icon-192.png",
    tag: d.tag || undefined, data: { url: d.url || "./#today" }, vibrate: [120, 80, 120],
  }));
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || "./#today", self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
    const w = list.find((c) => c.url.startsWith(self.registration.scope));
    if (w) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
