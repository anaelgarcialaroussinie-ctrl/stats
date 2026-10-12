import { esc, icon, openSheet, closeSheet, toast, initials, sparkline, avatarHtml } from "../ui.js";
import { fmt, readiness, alerts, weeklyLoad, findClass, frDate, isMinor, nutritionTargets, dayPlan } from "../engine.js";
import { todayKey, addDays } from "../store.js";
import { LEVELS } from "../data.js";
import { sync } from "../sync.js";
import { TOPICS, fmtAnswer } from "./assistant.js";
import { systemTree } from "./systems.js";
import { profileCard } from "./identity.js";
import { openPrograms } from "./programs-view.js";
import { noteCard, noteView } from "./notes.js";

// Exemple affiché tant qu'aucune équipe n'est reliée.
const SAMPLE = [
  { name: "Exemple · Yanis", level: "Compétiteur", score: 46, trend: [72, 64, 58, 51, 46], alert: "3 jours en récupération, douleur au genou signalée", weight: 71.8, classLimit: 70.3, load: 2140, loadPrev: 1520, sparring: 3 },
  { name: "Exemple · Inès", level: "Construction", score: 81, trend: [70, 74, 78, 80, 81], alert: "", weight: 56.2, classLimit: 56.7, load: 1380, loadPrev: 1400, sparring: 1 },
  { name: "Exemple · Tom", level: "Fondations", score: 64, trend: [66, 60, 70, 62, 64], alert: "Charge +41 % sur une semaine", weight: 83.5, classLimit: 83.9, load: 1690, loadPrev: 1200, sparring: 0 },
];

const lvl = (s) => (s === null ? "none" : s >= 70 ? "good" : s >= 50 ? "warn" : "bad");

// transforme les données brutes d'un fighter en résumé pour le coach
function summarize(m) {
  const key = todayKey();
  const st = { checkins: {}, sessions: {}, weights: [], food: {}, ...(m.state || {}) };
  const p = { ...(m.profile || {}), name: m.name };
  const c = st.checkins[key];
  const r = c ? readiness(c) : null;
  const trend = [...Array(7)].map((_, i) => st.checkins[addDays(key, -6 + i)]).filter(Boolean).map((x) => readiness(x).score);
  const al = alerts(st, key).map((a) => a.text);
  if (c?.pain) al.unshift(`Douleur signalée ce matin (${(c.painZones || []).join(", ") || "zone non précisée"}, ${c.painLevel}/10)`);
  const w = [...st.weights].sort((a, b) => a.date.localeCompare(b.date));
  const cl = findClass(p);
  const load = weeklyLoad(st, key);
  const sparring = [...Array(7)].map((_, i) => st.sessions[addDays(key, -i)]?.logs || []).flat().filter((l) => l.sparring === "hard").length;
  return {
    id: m.id, name: m.name, p, st, minor: isMinor(p),
    level: LEVELS.find((l) => l.id === p.level)?.label || "",
    score: r ? r.score : null, checkedIn: !!c, trend,
    alert: al.join(" · "), weight: w.length ? w[w.length - 1].kg : p.weight, weights: w,
    classLimit: cl?.maxKg, className: cl?.label, load: load.week, loadPrev: load.prev, sparring,
    lastSeen: m.last_seen,
  };
}

export function renderCoach(el, ctx) {
  const live = sync.connected() && sync.role() === "coach";
  if (!live) return draw(el, SAMPLE, null, false);
  const cached = sync.cachedTeam();
  draw(el, cached ? cached.members.map(summarize) : null, cached, true);
  sync.team().then((t) => { if (el.isConnected) draw(el, t.members.map(summarize), t, true); })
    .catch(() => { if (el.isConnected && !cached) el.innerHTML = `<h1 class="display" style="margin:6px 0 14px">Équipe</h1><p class="notice is-warn">Impossible de charger l'équipe. Vérifie ta connexion internet.</p>`; });
}

function draw(el, team, raw, live) {
  if (!team) { el.innerHTML = `<h1 class="display" style="margin:6px 0 14px">Équipe</h1><p class="muted">Chargement de l'équipe…</p>`; return; }
  const flagged = team.filter((f) => f.alert || (f.score !== null && f.score < 50));
  const sorted = [...team].sort((a, b) => (a.score ?? 101) - (b.score ?? 101));

  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 14px">Équipe</h1>
    ${live ? `<button class="panel row between" data-accounts style="width:100%;text-align:left;margin-bottom:12px"><div><div style="font-weight:700">Gérer les comptes</div><div class="muted small">Repérer et supprimer les comptes en double</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</button>` : ""}
    <button class="panel row between" data-progs style="width:100%;text-align:left;margin-bottom:12px"><div><div style="font-weight:700">Mes programmes</div><div class="muted small">Périodes, créneaux, thèmes de la semaine et vidéos</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</button>
    ${live ? "" : `<p class="notice is-warn">Aperçu avec des fighters d'exemple. Relie ton téléphone à l'équipe avec ton code coach pour voir tes vrais fighters.</p>`}
    ${live && !team.length ? `<section class="panel empty"><h3>Aucun fighter pour l'instant</h3><p class="small">Donne-leur le code d'équipe <b class="num">${esc(raw?.join_code || "")}</b> : ils le saisissent à l'ouverture de l'appli.</p><button class="btn tape-btn" data-copycode>Copier le code</button></section>` : ""}

    ${team.length ? `<div class="grid3" style="margin-top:14px">
      <div class="panel"><div class="muted tiny">Fighters</div><div class="display num" style="font-size:32px">${team.length}</div></div>
      <div class="panel"><div class="muted tiny">Prêts</div><div class="display num good" style="font-size:32px">${team.filter((f) => f.score !== null && f.score >= 70).length}</div></div>
      <div class="panel"><div class="muted tiny">À suivre</div><div class="display num bad" style="font-size:32px">${flagged.length}</div></div>
    </div>` : ""}

    ${flagged.length ? `<h2 class="h-sec">À suivre aujourd'hui</h2><div class="stack">${flagged.map((f) => `<p class="notice ${f.score !== null && f.score < 50 ? "is-alert" : "is-warn"}"><b>${esc(f.name)}</b> · ${esc(f.alert || "Forme basse ce matin")}</p>`).join("")}</div>` : ""}

    ${team.length ? `<h2 class="h-sec">Forme du jour</h2>
    <section class="panel">${sorted.map((f) => `
      <div class="fighter-row" role="button" tabindex="0" data-f="${team.indexOf(f)}">
        ${avatarHtml(f.name.replace("Exemple · ", ""), f.p?.photo)}
        <div><div style="font-weight:700">${esc(f.name)}${f.minor ? ` <span class="badge tiny">mineur</span>` : ""}</div><div class="meta small muted">${esc(f.level)}${f.weight ? " · " + fmt(f.weight, 1) + " kg" : ""}${live && !f.checkedIn ? " · pas de check-in aujourd'hui" : ""}</div></div>
        <span class="badge">${f.score === null ? `<span class="muted">–</span>` : `<span class="dot bg-${lvl(f.score)}"></span><b class="num">${f.score}</b>`}</span>
      </div>`).join("")}</section>` : ""}

    ${live && team.length ? `<section class="panel row between" style="margin-top:14px"><div><div class="muted small">Code d'équipe à donner</div><b class="num">${esc(raw?.join_code || "")}</b></div><button class="btn small ghost" data-copycode>Copier</button></section>` : ""}
  `;

  el.querySelectorAll("[data-f]").forEach((r) => r.addEventListener("click", () => openFighter(team[r.dataset.f], live)));
  el.querySelector("[data-progs]")?.addEventListener("click", () => openPrograms());
  el.querySelector("[data-accounts]")?.addEventListener("click", () => openAccounts(() => renderCoach(el)));
  el.querySelectorAll("[data-copycode]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(raw?.join_code || ""); toast("Code copié"); } catch { toast("Sélectionne le code pour le copier"); }
  }));
}

function openFighter(f, live) {
  const gap = f.weight && f.classLimit ? (f.weight / f.classLimit - 1) * 100 : null;
  const body = openSheet(f.name, `
    ${f.p ? `<div style="margin-bottom:12px">${profileCard(f.p, { models: f.st?.favFighters || [] })}</div>` : ""}
    <div class="grid2">
      <div class="panel"><div class="muted tiny">Forme</div><div class="display num ${f.score === null ? "" : lvl(f.score)}" style="font-size:34px">${f.score ?? "–"}</div><div class="tiny muted">${f.trend.length ? "Derniers jours : " + f.trend.join(" · ") : "Aucun check-in récent"}</div></div>
      <div class="panel"><div class="muted tiny">Charge 7 jours</div><div class="display num" style="font-size:34px">${fmt(f.load)}</div><div class="tiny muted">${f.loadPrev ? `${f.load > f.loadPrev ? "+" : ""}${fmt((f.load / f.loadPrev - 1) * 100)} % vs semaine passée` : "Pas de semaine précédente"}</div></div>
      <div class="panel"><div class="muted tiny">Poids</div><div class="display num" style="font-size:34px">${f.weight ? fmt(f.weight, 1) : "–"}</div><div class="tiny muted">${gap !== null ? (gap > 0 ? `+${fmt(gap, 1)} % au-dessus des ${esc(f.className || "")}` : `Dans la limite des ${esc(f.className || "")}`) : ""}</div></div>
      <div class="panel"><div class="muted tiny">Sparring dur</div><div class="display num" style="font-size:34px">${f.sparring}</div><div class="tiny muted">séances sur 7 jours</div></div>
    </div>
    ${f.alert ? `<p class="notice is-alert" style="margin-top:12px">${esc(f.alert)}</p>` : ""}
    ${(f.st?.combos || []).length ? `<h3 class="h-sec" style="font-size:18px">Ses combos fétiches</h3><ul class="list">${f.st.combos.map((c) => `<li><div><div style="font-weight:650">${esc(c.name)}</div><div class="meta">${esc(c.seq.join(" · "))}${c.when ? " — " + esc(c.when) : ""}</div></div></li>`).join("")}</ul>` : ""}
    ${(() => { if (f.minor) return ""; const nt = nutritionTargets(f.p, dayPlan(f.p, todayKey(), f.st), f.st); return nt?.kcal ? `<p class="small" style="margin-top:12px">Besoin calorique aujourd'hui : <b>${fmt(nt.kcal)} kcal</b> · repos ${fmt(nt.calc.rmr)} · entraînement ${fmt(nt.calc.trainTotal)}${nt.calc.deficit ? ` · déficit ${fmt(nt.calc.deficit)}` : ""}${nt.calc.missing.length ? " · profil incomplet" : ""}</p>` : ""; })()}
    ${(() => { const c = f.st?.checkins?.[todayKey()]; return c && (c.hr || c.hrv) ? `<p class="small" style="margin-top:12px">Montre ce matin : ${c.hr ? `FC repos <b>${c.hr} bpm</b>${c.hrBase ? ` (moyenne ${c.hrBase})` : ""}` : ""}${c.hr && c.hrv ? " · " : ""}${c.hrv ? `VFC <b>${c.hrv} ms</b>${c.hrvBase ? ` (moyenne ${c.hrvBase})` : ""}` : ""}</p>` : ""; })()}
    ${f.weights?.length > 1 ? `<h3 class="h-sec" style="font-size:18px">Poids</h3>${sparkline(f.weights.slice(-30).map((x) => ({ v: x.kg })), { unit: " kg" })}` : ""}
    ${f.lastSeen ? `<p class="hint">Dernière ouverture de l'appli : ${esc(new Date(f.lastSeen).toLocaleString("fr-FR", { weekday: "long", hour: "2-digit", minute: "2-digit" }))}</p>` : ""}
    ${f.st?.program ? (() => { const pr = f.st.program; const n = Math.floor((new Date() - new Date(pr.start + "T12:00:00")) / (7 * 86400000)) + 1; const done = Object.values(pr.done || {}).filter(Boolean).length; return `<p class="notice small" style="margin-top:12px"><b>Programme de style</b> : ${esc(pr.name)} · ${n > 6 ? "terminé" : `semaine ${Math.max(1, n)} sur 6`} · ${done} tâche${done > 1 ? "s" : ""} cochée${done > 1 ? "s" : ""}</p>`; })() : ""}
    ${(f.st?.notes || []).length ? `<h3 class="h-sec" style="font-size:18px">Ses fiches techniques</h3>${[...f.st.notes].sort((a, b) => (b.updatedAt || b.date || "").localeCompare(a.updatedAt || a.date || "")).map((n) => `<details class="sys-card" style="margin-top:8px"><summary class="row">${noteCard(n)}</summary>${noteView(n)}</details>`).join("")}` : ""}
    ${(f.st?.systems || []).length ? `<h3 class="h-sec" style="font-size:18px">Ses systèmes</h3>${f.st.systems.map((x) => `<details class="sys-card" style="margin-top:8px"><summary><b>${esc(x.name)}</b></summary>${systemTree(x)}</details>`).join("")}` : ""}
    <div data-qs></div>
    <form data-msg style="margin-top:14px">
      <label class="field"><span>Message à ${esc(f.name.split(" ")[0])}</span><textarea class="input" name="body" rows="3" placeholder="Ex. On allège demain, viens me voir avant le cours."></textarea></label>
      <button class="btn block" style="margin-top:10px" ${live ? "" : "disabled"}>Envoyer</button>
      ${live ? "" : `<p class="hint">L'envoi de messages marche avec tes vrais fighters.</p>`}
    </form>`);
  if (live && f.id) sync.teamQuestions().then((all) => {
    const qs = all.filter((q) => q.person_id === f.id).slice(0, 10);
    const box = body.querySelector("[data-qs]"); if (!box || !qs.length) return;
    box.innerHTML = `<h3 class="h-sec" style="font-size:18px">Ses questions à l'assistant</h3>` + qs.map((q) => `<section class="panel" style="margin-top:8px">
      <div class="row between"><span class="badge tiny">${esc(TOPICS.find((t) => t.id === q.topic)?.label || q.topic)}</span><span class="tiny muted">${esc(new Date(q.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }))}</span></div>
      <p class="small" style="margin:8px 0">${esc(q.body)}</p>${q.answer ? `<div class="answer small">${fmtAnswer(q.answer)}</div>` : `<p class="tiny muted">En attente de réponse</p>`}</section>`).join("");
  }).catch(() => {});
  body.querySelector("[data-msg]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = e.target.body.value.trim(); if (!text || !live) return;
    try { await sync.send(f.id, text); closeSheet(); toast("Message envoyé"); }
    catch { toast("Envoi impossible : vérifie ta connexion"); }
  });
}

// ---------- gérer les comptes : doublons et suppression ----------
function openAccounts(after) {
  const body = openSheet("Gérer les comptes", `<p class="muted small">Chargement…</p>`);
  const when = (d) => (d ? new Date(d).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "jamais");
  const draw = (list) => {
    const count = {}; list.forEach((m) => { const k = m.name.trim().toLowerCase(); count[k] = (count[k] || 0) + 1; });
    // dans chaque doublon, le compte ouvert le plus récemment est celui à garder
    const latest = {}; list.forEach((m) => { const k = m.name.trim().toLowerCase(); if (!latest[k] || (m.last_seen || "") > (latest[k].last_seen || "")) latest[k] = m; });
    const dups = list.filter((m) => count[m.name.trim().toLowerCase()] > 1);
    body.innerHTML = `<p class="small muted" style="margin-top:0">${dups.length ? `Comptes en double en orange. Garde celui marqué « à garder » (le dernier utilisé) et supprime les autres.` : "Aucun compte en double."} Supprimer un compte efface aussi ses données, ses questions et ses messages : c'est définitif.</p>
      <ul class="list">${list.map((m) => { const dup = count[m.name.trim().toLowerCase()] > 1, keep = latest[m.name.trim().toLowerCase()] === m;
        return `<li${dup ? ' style="border-left:3px solid var(--warn);padding-left:10px"' : ""}><div style="min-width:0;flex:1"><div style="font-weight:700">${esc(m.name)}${m.me ? ` <span class="tiny muted">(toi)</span>` : ""}${dup && keep ? ` <span class="insigne">à garder</span>` : ""}</div>
          <div class="meta">${m.role === "coach" ? "Coach" : "Fighter"} · créé ${esc(when(m.created_at))} · dernière ouverture ${esc(when(m.last_seen))} · ${m.checkins} check-in${m.checkins > 1 ? "s" : ""}</div></div>
          ${m.me ? "" : `<button class="icon-btn" data-del="${m.id}" aria-label="Supprimer ${esc(m.name)}" style="color:var(--bad);flex:none">${icon("trash")}</button>`}</li>`; }).join("")}</ul>`;
    body.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", async () => {
      const m = list.find((x) => x.id === b.dataset.del);
      if (!confirm(`Supprimer définitivement le compte « ${m.name} » créé ${when(m.created_at)} ? Ses données seront effacées.`)) return;
      b.disabled = true;
      try { await sync.deleteMember(m.id); toast(`Compte « ${m.name} » supprimé`); load(); after?.(); }
      catch { b.disabled = false; toast("Suppression impossible : vérifie ta connexion"); }
    }));
  };
  const load = () => sync.members().then(draw).catch((e) => {
    body.innerHTML = /function|not find|could not|does not exist|404/i.test(e.message || "") ? `<p class="notice is-warn small">La gestion des comptes arrive bientôt : la base du club doit encore être mise à jour.</p>` : `<p class="notice is-warn small">Impossible de charger les comptes. Vérifie ta connexion.</p>`;
  });
  load();
}
