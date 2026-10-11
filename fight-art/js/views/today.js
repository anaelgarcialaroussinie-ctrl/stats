import { store, todayKey } from "../store.js";
import { esc, icon, meter } from "../ui.js";
import { dayPlan, readinessAdvice, alerts, nutritionTargets, dayTotals, frDate, isMinor } from "../engine.js";
import { openCheckin, openBlock } from "./sessions.js";
import { sync } from "../sync.js";
import { openSheet, closeSheet, toast } from "../ui.js";

export function renderToday(el, ctx) {
  const st = store.get();
  const p = st.profile;
  const key = todayKey();
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
      <div><div class="tape-date">${esc(frDate(key))}</div><div class="tape-title display">${hello} ${esc(p.name)}</div></div>
      ${r ? `<div class="tape-score display"><b class="num">${r.score}</b><span>forme · ${esc(r.label)}</span></div>` : ""}
    </div></div>`;

  const checkin = c ? "" : `<section class="panel">
      <h3>Comment tu te sens ce matin ?</h3>
      <p class="muted small" style="margin:4px 0 12px">30 secondes : sommeil, fatigue, moral, douleurs. Ton programme s'adapte à tes réponses.</p>
      <button class="btn tape-btn block" data-act="checkin">Faire mon check-in</button>
    </section>`;

  const advice = r ? readinessAdvice(r, c).map((t) => `<p class="notice ${r.level === "bad" ? "is-alert" : r.level === "warn" ? "is-warn" : ""}">${esc(t)}</p>`).join("") : "";
  const alertsHtml = al.map((a) => `<p class="notice ${a.level === "bad" ? "is-alert" : "is-warn"}">${esc(a.text)}</p>`).join("");

  const compet = plan.dtc !== null && plan.dtc >= 0 ? `<div class="row between panel"><div><div style="font-weight:700">Combat dans ${plan.dtc} jour${plan.dtc > 1 ? "s" : ""}</div><div class="muted small">${plan.dtc <= 7 ? "Semaine du combat : plus de préparation physique, affûtage." : plan.dtc <= 21 ? "Approche du combat : préparation physique réduite." : "Camp en cours."}</div></div><span class="tape-small">J-${plan.dtc}</span></div>` : "";

  const items = plan.blocks.map((b) => {
    const isDone = !!done[b.id];
    const action = b.type === "rest" ? "" : `<button class="go" data-block="${b.id}">${isDone ? "Revoir" : b.type === "club" ? "Noter" : "Commencer"}</button>`;
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

  el.innerHTML = `
    ${tape}
    ${msgHtml}
    ${checkin}
    ${alertsHtml}
    ${advice ? `<div class="stack" style="margin-bottom:6px">${advice}</div>` : ""}
    ${compet}
    <h2 class="h-sec">Programme du jour</h2>
    <section class="panel"><ol class="plan">${items}</ol></section>
    <h2 class="h-sec">Nutrition</h2>
    <section class="panel">${food}
      <button class="btn ghost block" data-act="food" style="margin-top:14px">${icon("plus")} Ajouter un repas</button>
    </section>
    ${c ? `<button class="btn ghost small" data-act="checkin" style="margin-top:16px">Modifier mon check-in</button>` : ""}
  `;

  el.querySelector("[data-act=reply]")?.addEventListener("click", () => openThread(lastMsg.from_id, lastMsg.from_name, ctx));
  el.querySelectorAll("[data-act=checkin]").forEach((b) => b.addEventListener("click", () => openCheckin(key, ctx.refresh)));
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
