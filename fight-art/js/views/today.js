import { store, todayKey, addDays, dayIndex } from "../store.js";
import { DAYS } from "../data.js";
import { openPlanning, loadThemes, cachedThemes, mondayOf, seasonCard } from "./planning.js";
import { loadSeason, cachedSeason } from "../season.js";
import { openNote } from "./notes.js";
import { programWeek, openProgram } from "./stylelab.js";
import { esc, icon, meter } from "../ui.js";
import { dayPlan, readinessAdvice, alerts, nutritionTargets, dayTotals, frDate, isMinor } from "../engine.js";
import { openCheckin, openBlock } from "./sessions.js";
import { sync } from "../sync.js";
import { openSheet, closeSheet, toast } from "../ui.js";

let selDay = null; // jour affiché (null = aujourd'hui)

export function renderToday(el, ctx, params = {}) {
  const st = store.get();
  const p = st.profile;
  const today = todayKey();
  if (params.day) selDay = params.day;
  const key = selDay || today;
  const isToday = key === today, isFuture = key > today;
  const plan = dayPlan(p, key, st);
  const c = st.checkins[key];
  const r = plan.readiness;
  const done = st.sessions[key]?.done || {};
  const al = alerts(st, key);
  const nt = nutritionTargets(p, plan);
  const tot = dayTotals(st.food[key]);

  const hello = new Date().getHours() < 18 ? "Bonjour" : "Bonsoir";
  const tape = `<div class="tape">
    <div class="tape-row">
      <div><div class="tape-date">${esc(frDate(key))}</div><div class="tape-title display">${isToday ? `${hello} ${esc(p.name)}` : isFuture ? "Ce qui t'attend" : "Ta journée"}</div></div>
      ${r ? `<div class="tape-score display"><b class="num">${r.score}</b><span>forme · ${esc(r.label)}</span></div>` : ""}
    </div></div>`;

  const monday = addDays(key, -dayIndex(key));
  const strip = `<div class="daynav">
      <button class="icon-btn" data-week="-7" aria-label="Semaine précédente">${icon("back")}</button>
      <div class="daynav-days">${[...Array(7)].map((_, i) => { const k = addDays(monday, i); const pl = dayPlan(p, k, st); const busy = pl.club || pl.kind; return `<button class="dn-day${k === key ? " on" : ""}${k === today ? " today" : ""}" data-day="${k}"><span>${DAYS[i]}</span><b class="num">${Number(k.slice(8))}</b><i class="${pl.club ? "club" : pl.kind ? "sc" : ""}"></i></button>`; }).join("")}</div>
      <button class="icon-btn" data-week="7" aria-label="Semaine suivante" style="transform:scaleX(-1)">${icon("back")}</button>
    </div>
    ${isToday ? "" : `<button class="btn ghost small" data-day="${today}" style="margin:-4px 0 12px">Revenir à aujourd'hui</button>`}`;

  const checkin = c || !isToday ? "" : `<section class="panel">
      <h3>Comment tu te sens ce matin ?</h3>
      <p class="muted small" style="margin:4px 0 12px">30 secondes : sommeil, fatigue, moral, douleurs. Ton programme s'adapte à tes réponses.</p>
      <button class="btn tape-btn block" data-act="checkin">Faire mon check-in</button>
    </section>`;

  const advice = r ? readinessAdvice(r, c).map((t) => `<p class="notice ${r.level === "bad" ? "is-alert" : r.level === "warn" ? "is-warn" : ""}">${esc(t)}</p>`).join("") : "";
  const alertsHtml = al.map((a) => `<p class="notice ${a.level === "bad" ? "is-alert" : "is-warn"}">${esc(a.text)}</p>`).join("");

  const compet = plan.dtc !== null && plan.dtc >= 0 ? `<div class="row between panel"><div><div style="font-weight:700">Combat dans ${plan.dtc} jour${plan.dtc > 1 ? "s" : ""}</div><div class="muted small">${plan.dtc <= 7 ? "Semaine du combat : plus de préparation physique, affûtage." : plan.dtc <= 21 ? "Approche du combat : préparation physique réduite." : "Camp en cours."}</div></div><span class="tape-small">J-${plan.dtc}</span></div>` : "";

  const items = plan.blocks.map((b) => {
    const isDone = !!done[b.id];
    const action = b.type === "rest" ? "" : isFuture ? (["mobility", "movement", "strength"].includes(b.type) ? `<button class="go" data-block="${b.id}">Voir</button>` : `<span class="tiny muted">Prévu</span>`) : `<button class="go" data-block="${b.id}">${isDone ? "Revoir" : b.type === "club" ? "Noter" : "Commencer"}</button>`;
    return `<li class="plan-item ${isDone ? "done" : ""}"><div><div class="t">${esc(b.title)}</div><div class="d">${esc(b.detail)}</div></div>${action}</li>`;
  }).join("");

  const food = nt?.minor
    ? `<p class="muted small">Une source de protéines à chaque repas, des féculents adaptés à l'activité du jour, des fruits et des légumes, et de l'eau tout au long de la journée.</p>`
    : nt ? `<p class="muted small">Objectifs d'aujourd'hui : ${esc(nt.loadLabel)}.</p>${meter("Calories", tot.kcal, nt.kcal, " kcal")}${meter("Protéines", tot.p, nt.p, " g")}${meter("Glucides", tot.c, nt.c, " g")}` : "";

  const me = sync.personId();
  const received = sync.cachedInbox().filter((m) => m.to_id === me);
  const lastMsg = received[0];
  const unread = received.filter((m) => !m.read_at).length;
  const msgHtml = lastMsg ? `<section class="panel" style="margin-bottom:12px">
      <div class="row between"><h3>${unread ? `<span class="dot bg-bad" style="margin-right:6px"></span>` : ""}Message de ${esc(lastMsg.from_name)}</h3><span class="tiny muted">${esc(new Date(lastMsg.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }))}</span></div>
      <p style="margin:8px 0 12px">${esc(lastMsg.body)}</p>
      <button class="btn ghost small" data-act="reply">Voir et répondre</button></section>` : "";

  const clubCard = plan.blocks.find((b) => b.classes?.length);
  const pw = isToday ? programWeek(st) : null;
  const progCard = pw && !pw.over && pw.n >= 1 ? `<button class="panel row between" data-prog style="width:100%;text-align:left;margin-top:12px"><div><div class="tiny muted">Programme de style · semaine ${pw.n} sur 6</div><div style="font-weight:700">${esc(pw.prog.name)}</div><div class="muted small">${esc(pw.title)} · ${pw.done} tâche${pw.done > 1 ? "s" : ""} faite${pw.done > 1 ? "s" : ""} cette semaine</div></div>${icon("back", 'style="width:20px;height:20px;transform:scaleX(-1);flex:none"')}</button>` : pw?.over ? `<p class="notice small" style="margin-top:12px">Programme « ${esc(pw.prog.name)} » terminé : fais le bilan avec ton coach et crée ton prochain style dans l'Academy.</p>` : "";
  const tips = isToday ? [...al.map((x) => ({ t: x.text, lvl: x.level })), ...(r ? readinessAdvice(r, c).map((t) => ({ t, lvl: r.level })) : [])] : [];
  el.innerHTML = `
    ${tape}
    ${strip}
    ${isToday ? msgHtml : ""}
    ${checkin}
    ${tips.length ? `<section class="panel tips ${tips.some((x) => x.lvl === "bad") ? "is-bad" : tips.some((x) => x.lvl === "warn") ? "is-warn" : ""}"><h3>Conseils du jour</h3><ul class="bul">${tips.map((x) => `<li class="small">${esc(x.t)}</li>`).join("")}</ul></section>` : ""}
    ${compet}
    ${clubCard ? `<section class="panel" style="margin-top:12px"><h3>Au club ${isToday ? "aujourd'hui" : esc(frDate(key, { weekday: "long" }))}</h3>
      ${clubCard.classes.some((c) => ["mma-fond", "mma-dev", "sparring", "team-ven", "team-sam"].includes(c.id)) ? `<div style="margin-top:10px">${seasonCard(key, p, { compact: true })}</div>` : ""}${clubCard.classes.map((c) => { const t = cachedThemes(mondayOf(key))[c.id]; return `<div class="row between" style="margin-top:10px;align-items:flex-start"><div><b>${esc(c.name)}</b><div class="tiny muted">${esc(c.stage)}</div><div class="small" data-theme-for="${c.id}">${t ? `Thème : <b>${esc(t)}</b>` : ""}</div></div><span class="badge num" style="flex:none">${c.start.replace(":", "h")} – ${c.end.replace(":", "h")}</span></div>`; }).join("")}
      <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn ghost small" data-planning>Planning du club</button>${isFuture ? "" : `<button class="btn small" data-classnote>${icon("edit")} Ma fiche du cours</button>`}</div></section>` : ""}
    <h2 class="h-sec">${isToday ? "Programme du jour" : isFuture ? "Programme prévu" : "Programme de ce jour"}</h2>
    <section class="panel"><ol class="plan">${items}</ol></section>
    ${progCard}
    ${isToday ? `<h2 class="h-sec">Nutrition</h2>
    <section class="panel">${food}
      <button class="btn ghost block" data-act="food" style="margin-top:14px">${icon("plus")} Ajouter un repas</button>
    </section>` : isFuture ? "" : `<p class="hint">Nutrition de ce jour : onglet Nutrition, en changeant de date.</p>`}
    ${c && isToday ? `<button class="btn ghost small" data-act="checkin" style="margin-top:16px">Modifier mon check-in</button>` : ""}
  `;


  el.querySelector("[data-act=reply]")?.addEventListener("click", () => openThread(lastMsg.from_id, lastMsg.from_name, ctx));
  el.querySelectorAll("[data-act=checkin]").forEach((b) => b.addEventListener("click", () => openCheckin(key, ctx.refresh)));
  el.querySelector("[data-act=assistant]")?.addEventListener("click", () => ctx.go("assistant"));
  el.querySelector("[data-planning]")?.addEventListener("click", () => openPlanning(key));
  el.querySelector("[data-prog]")?.addEventListener("click", () => { const sty = (st.styles || []).find((x) => x.id === pw.prog.styleId) || { id: pw.prog.styleId, name: pw.prog.name, fighters: [] }; openProgram(sty, null, ctx.refresh, pw.n); });
  el.querySelector("[data-classnote]")?.addEventListener("click", () => {
    const th = cachedThemes(mondayOf(key)); const c = clubCard.classes.find((x) => th[x.id]) || clubCard.classes[0];
    openNote(null, ctx.refresh, { title: th[c.id] || "", source: c.name, date: key, cat: c.name.includes("Luta") ? "Luta Livre" : "Debout" });
  });
  if (clubCard && !cachedSeason()) loadSeason().then((x) => { if (x && el.isConnected) ctx.refresh(); });
  if (clubCard) loadThemes(mondayOf(key)).then((th) => { clubCard.classes.forEach((c) => { const box = el.querySelector(`[data-theme-for="${c.id}"]`); if (box && th[c.id]) box.innerHTML = `Thème : <b>${esc(th[c.id])}</b>`; }); });
  el.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => { selDay = b.dataset.day === today ? null : b.dataset.day; ctx.refresh(); }));
  el.querySelectorAll("[data-week]").forEach((b) => b.addEventListener("click", () => { selDay = addDays(key, Number(b.dataset.week)); if (selDay === today) selDay = null; ctx.refresh(); }));
  el.querySelector("[data-act=food]")?.addEventListener("click", () => ctx.go("food", { add: true }));
  el.querySelectorAll("[data-block]").forEach((b) => b.addEventListener("click", () => {
    const block = plan.blocks.find((x) => x.id === b.dataset.block);
    openBlock(key, block, ctx.refresh, ctx.go);
  }));
}

function openThread(otherId, otherName, ctx) {
  const me = sync.personId();
  const msgs = sync.cachedInbox().filter((m) => m.from_id === otherId || m.to_id === otherId).slice(0, 30).reverse();
  sync.markRead();
  const body = openSheet(otherName, `
    <div class="stack">${msgs.map((m) => `<div class="panel" style="${m.from_id === me ? "margin-left:40px;background:var(--surface-2)" : "margin-right:40px"}"><p style="margin:0">${esc(m.body)}</p><div class="tiny muted" style="margin-top:4px">${m.from_id === me ? "Toi" : esc(m.from_name)} · ${esc(new Date(m.created_at).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }))}</div></div>`).join("")}</div>
    <form data-reply style="margin-top:14px"><label class="field"><span>Ta réponse</span><textarea class="input" name="body" rows="3"></textarea></label><button class="btn tape-btn block" style="margin-top:10px">Envoyer</button></form>`);
  body.querySelector("[data-reply]").addEventListener("submit", async (e) => {
    e.preventDefault(); const t = e.target.body.value.trim(); if (!t) return;
    try { await sync.send(otherId, t); closeSheet(); toast("Message envoyé"); ctx.refresh(); } catch { toast("Envoi impossible : vérifie ta connexion"); }
  });
}
