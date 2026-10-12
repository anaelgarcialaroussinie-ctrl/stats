// Synchronisation avec la base du club. Chaque appareil garde une copie locale :
// l'appli marche hors ligne et envoie les changements dès que le réseau revient.
import { CONFIG } from "./config.js";
import { store } from "./store.js";

const TOKEN_KEY = "fap:token";
const META_KEY = "fap:meta";
let token = null, meta = {}, timer = null, teamCache = null, inboxCache = [], contactsCache = [];
try { token = localStorage.getItem(TOKEN_KEY); meta = JSON.parse(localStorage.getItem(META_KEY) || "{}"); } catch {}

const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

async function rpc(fn, args) {
  const r = await fetch(`${CONFIG.SUPABASE_URL}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: { apikey: CONFIG.SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(args),
  });
  const text = await r.text();
  if (!r.ok) {
    let msg = "network";
    try { msg = JSON.parse(text).message || msg; } catch {}
    const e = new Error(msg); e.code = msg; throw e;
  }
  return text ? JSON.parse(text) : null;
}

function setSession(t, m) {
  token = t; meta = m;
  try { localStorage.setItem(TOKEN_KEY, t); localStorage.setItem(META_KEY, JSON.stringify(m)); } catch {}
}

export const sync = {
  connected: () => Boolean(token),
  role: () => meta.role || null,
  teamName: () => meta.team_name || "FIGHT ART",
  token: () => token,
  lastSync: () => meta.lastSync || null,
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },

  async checkCode(code) { return rpc("fap_check_code", { p_code: code }); },

  // rejoindre l'équipe avec le code donné par le coach
  async join(code, profile) {
    const res = await rpc("fap_join", { p_code: code, p_name: profile.name, p_profile: profile });
    setSession(res.token, { role: res.role, team_name: res.team_name, person_id: res.person_id });
    return res;
  },

  // se reconnecter sur un autre téléphone avec son code de connexion
  async restore(code) {
    const res = await rpc("fap_load", { p_token: code.trim() });
    setSession(code.trim(), { role: res.role, team_name: res.team_name, person_id: res.person_id });
    store.update((s) => { Object.assign(s, res.state || {}); s.profile = { ...(res.profile || {}), role: res.role, name: res.name }; });
    return res;
  },

  // au démarrage : récupère la version serveur si elle est plus récente
  async pull() {
    if (!token) return;
    try {
      const res = await rpc("fap_load", { p_token: token });
      meta = { ...meta, role: res.role, team_name: res.team_name, person_id: res.person_id };
      try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {}
      const local = store.get();
      const remoteAt = res.state?.savedAt || "";
      if (remoteAt && remoteAt > (local.savedAt || "")) {
        store.update((s) => { Object.assign(s, res.state); s.profile = { ...(res.profile || s.profile), role: res.role }; }, { silent: true });
      } else if ((local.savedAt || "") > remoteAt) {
        sync.push();
      }
      // le rôle (coach ou fighter) vient toujours de la base
      if (store.get().profile && store.get().profile.role !== res.role) store.update((s) => { s.profile.role = res.role; }, { silent: true });
      sync.inbox();
    } catch (e) {
      if (e.code === "invalid_token") sync.signOut();
    }
  },

  schedulePush() {
    if (!token) return;
    clearTimeout(timer);
    timer = setTimeout(() => sync.push(), 1500);
  },

  async push() {
    if (!token) return;
    const s = store.get();
    try { await rpc("fap_save", { p_token: token, p_profile: s.profile, p_state: s }); meta.lastSync = new Date().toISOString(); try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch {} emit(); return true; }
    catch { /* hors ligne : on réessaiera au prochain changement */ return false; }
  },

  // coach
  async team() {
    if (!token || meta.role !== "coach") return null;
    teamCache = await rpc("fap_team", { p_token: token });
    return teamCache;
  },
  cachedTeam: () => teamCache,

  async inbox() {
    if (!token) return [];
    try { inboxCache = await rpc("fap_inbox", { p_token: token }); emit(); } catch {}
    return inboxCache;
  },
  cachedInbox: () => inboxCache,
  unread: () => inboxCache.filter((m) => !m.read_at && m.to_id === meta.person_id),
  async markRead() { if (token) { try { await rpc("fap_mark_read", { p_token: token }); inboxCache.forEach((m) => { if (m.to_id === meta.person_id) m.read_at ||= new Date().toISOString(); }); emit(); } catch {} } },
  async contacts() { if (!token) return []; contactsCache = await rpc("fap_contacts", { p_token: token }); return contactsCache; },
  async send(to, body) { await rpc("fap_send", { p_token: token, p_to: to, p_body: body }); await sync.inbox(); },
  personId: () => meta.person_id,

  // assistant
  async ask(topic, body, share) { await sync.push(); return rpc("fap_ask", { p_token: token, p_topic: topic, p_body: body, p_share: share }); },
  async askFrames(topic, body, share, frames) { await sync.push(); return rpc("fap_ask_frames", { p_token: token, p_topic: topic, p_body: body, p_share: share, p_frames: frames }); },
  async myQuestions() { if (!token) return []; return rpc("fap_my_questions", { p_token: token }); },
  async teamQuestions() { if (!token || meta.role !== "coach") return []; return rpc("fap_team_questions", { p_token: token }); },

  // cartes de profil de l'équipe (photo, bannière, insignes : rien de privé)
  async profiles() { if (!token) return []; return rpc("fap_profiles", { p_token: token }); },

  // rappels programmés (notifications)
  async saveReminders(list, tz) { if (!token) return null; return rpc("fap_reminders_save", { p_token: token, p_list: list, p_tz: tz }); },
  async pushSubscribe(sub) { return rpc("fap_push_subscribe", { p_token: token, p_sub: sub }); },
  async pushUnsubscribe(endpoint) { return rpc("fap_push_unsubscribe", { p_token: token, p_endpoint: endpoint }); },

  // vidéothèque du club (le coach ajoute, tout le monde voit)
  async links() { if (!token) return []; return rpc("fap_links", { p_token: token }); },
  async saveLink(l) { return rpc("fap_link_save", { p_token: token, p_id: l.id || null, p_title: l.title, p_url: l.url, p_topic: l.topic, p_note: l.note || "", p_archived: Boolean(l.archived) }); },

  // thèmes des cours de la semaine (le coach les fixe, tout le monde les voit)
  async themes(from, to) { if (!token) return []; return rpc("fap_themes", { p_token: token, p_from: from, p_to: to }); },
  async saveTheme(week, cls, theme) { return rpc("fap_theme_save", { p_token: token, p_week: week, p_class: cls, p_theme: theme }); },

  // programme annuel du club
  async season() { if (!token) return null; return rpc("fap_season", { p_token: token }); },
  async saveSeason(start, skip) { return rpc("fap_season_save", { p_token: token, p_start: start, p_skip: skip }); },

  // formation vidéo privée du coach
  async library() { if (!token || meta.role !== "coach") return []; return rpc("fap_library", { p_token: token }); },

  signOut() { token = null; meta = {}; try { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(META_KEY); } catch {} emit(); },
};

// chaque changement local part vers la base
store.subscribe((_, opts) => { if (!opts?.silent) sync.schedulePush(); });
window.addEventListener("online", () => sync.push());
