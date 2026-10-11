import { store, todayKey, addDays } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast, sparkline } from "../ui.js";
import { weeklyLoad, readiness, morphology, findClass, brzycki, fmt, fmtTime, isMinor, frDate } from "../engine.js";
import { TESTS, DAYS } from "../data.js";

export function renderProgress(el, ctx) {
  const st = store.get();
  const p = st.profile;
  const key = todayKey();
  const w = [...st.weights].sort((a, b) => a.date.localeCompare(b.date));
  const lastW = w[w.length - 1];
  const cl = findClass(p);
  const load = weeklyLoad(st, key);
  const morpho = morphology(p);
  const ready = [...Array(14)].map((_, i) => addDays(key, -13 + i)).map((d) => st.checkins[d] ? { d, v: readiness(st.checkins[d]).score } : null).filter(Boolean);
  const maxDaily = Math.max(1, ...load.daily);

  // écart à la catégorie (AIS : poids au réveil <= 5 à 7 % au-dessus)
  let weightNote = "";
  if (lastW && cl && p.goal === "compet" && !isMinor(p)) {
    const gap = (lastW.kg / cl.maxKg - 1) * 100;
    weightNote = `<p class="notice ${gap > 7 ? "is-alert" : gap > 5 ? "is-warn" : ""}" style="margin-top:10px">${gap <= 0 ? `Tu es dans la limite des ${esc(cl.label)} (${fmt(cl.maxKg, 1)} kg).` : `${fmt(gap, 1)} % au-dessus de la limite des ${esc(cl.label)} (${fmt(cl.maxKg, 1)} kg).`} ${gap > 7 ? "Au-delà de 5 à 7 % au réveil, il faut revoir la catégorie avec ton coach." : ""}</p>`;
  }

  const testsHtml = TESTS.filter((t) => !(isMinor(p) && t.ratio)).map((t) => {
    const hist = st.tests.filter((x) => x.id === t.id).sort((a, b) => a.date.localeCompare(b.date));
    const last = hist[hist.length - 1];
    let status = "";
    if (last) {
      let ok = null;
      if (t.ratio && lastW) ok = last.value >= t.ratio(p) * lastW.kg;
      else if (t.target) ok = t.better === "down" ? last.value <= t.target(p) : last.value >= t.target(p);
      status = ok === null ? "" : `<span class="dot ${ok ? "bg-good" : "bg-warn"}" aria-label="${ok ? "Objectif atteint" : "En progression"}"></span>`;
    }
    const shown = last ? (t.id === "row2k" ? fmtTime(last.value) : fmt(last.value, 1) + " " + t.unit) : "–";
    const delta = hist.length > 1 ? last.value - hist[hist.length - 2].value : null;
    return `<li data-test="${t.id}" role="button" tabindex="0"><div><div style="font-weight:650">${esc(t.name)}</div><div class="meta">${esc(t.ref(p))}</div></div>
      <div class="right row">${status}<div><b>${shown}</b>${delta !== null ? `<div class="meta">${delta > 0 ? "+" : ""}${t.id === "row2k" ? delta + " s" : fmt(delta, 1)}</div>` : ""}</div></div></li>`;
  }).join("");

  const morphoHtml = morpho ? `
    <div class="grid3">
      <div><div class="muted tiny">Catégorie</div><div style="font-weight:700">${esc(morpho.cl.label)}${morpho.cl.sex === "F" ? " (F)" : ""}</div></div>
      <div><div class="muted tiny">Taille</div><div style="font-weight:700">${fmt(p.height)} cm</div><div class="tiny muted">médiane UFC ${fmt(morpho.cl.height)}</div></div>
      <div><div class="muted tiny">Envergure</div><div style="font-weight:700">${p.reach ? fmt(p.reach) + " cm" : "–"}</div><div class="tiny muted">médiane UFC ${fmt(morpho.cl.reach)}</div></div>
    </div>
    <p class="small" style="margin-top:12px">Gabarit <b>${esc(morpho.hBand)}</b>${morpho.rBand ? `, allonge <b>${esc(morpho.rBand)}</b>` : ""} pour la catégorie.</p>
    <div class="stack" style="margin-top:10px">${morpho.axes.map((a) => `<div class="notice"><div style="font-weight:700">${esc(a.title)}</div><div class="small">${esc(a.text)}</div><div class="small muted" style="margin-top:4px">À surveiller : ${esc(a.watch)}</div></div>`).join("")}</div>
    <p class="hint" style="margin-top:10px">Des tendances, pas des règles : le gabarit n'explique qu'une petite partie du style. On valide en sparring, avec ton coach.</p>`
    : `<p class="muted small">Renseigne ta taille et ton envergure dans ton profil pour situer ton gabarit dans ta catégorie.</p>`;

  el.innerHTML = `
    <h1 class="display" style="margin:6px 0 14px">Progrès</h1>

    <h2 class="h-sec" style="margin-top:6px">Poids</h2>
    <section class="panel">
      <div class="row between"><div><div class="display num" style="font-size:36px">${lastW ? fmt(lastW.kg, 1) + " kg" : "–"}</div><div class="muted small">${lastW ? "Pesée du " + esc(frDate(lastW.date, { day: "numeric", month: "long" })) : "Pèse-toi le matin, au réveil"}</div></div>
      <button class="btn small" data-weight>${icon("plus")} Pesée</button></div>
      <div style="margin-top:10px">${sparkline(w.slice(-30).map((x) => ({ v: x.kg })), { unit: " kg" })}</div>
      ${weightNote}
    </section>

    <h2 class="h-sec">Charge d'entraînement</h2>
    <section class="panel">
      <div class="grid2">
        <div><div class="muted tiny">7 derniers jours</div><div class="display num" style="font-size:32px">${fmt(load.week)}</div></div>
        <div><div class="muted tiny">7 jours précédents</div><div class="display num" style="font-size:32px;color:var(--muted)">${fmt(load.prev)}</div></div>
      </div>
      <div class="row" style="align-items:flex-end;gap:6px;height:70px;margin-top:12px" aria-label="Charge par jour">
        ${load.daily.map((v, i) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px"><div style="width:100%;height:${Math.max(3, (v / maxDaily) * 54)}px;background:${i === 6 ? "var(--ink)" : "var(--line)"};border-radius:6px"></div><span class="tiny muted">${DAYS[(new Date(addDays(key, -6 + i) + "T12:00").getDay() + 6) % 7].slice(0, 1)}</span></div>`).join("")}
      </div>
      <p class="hint" style="margin-top:10px">Charge = intensité ressentie × minutes. Monotonie : ${load.monotony ? fmt(load.monotony, 1) : "–"} ${load.monotony > 2 ? "· trop élevée, ajoute de vrais jours légers" : "(au-dessus de 2 = signal d'alerte)"}.</p>
    </section>

    <h2 class="h-sec">Forme</h2>
    <section class="panel">${sparkline(ready.map((r) => ({ v: r.v })))}<p class="hint">Score de forme des check-ins des 14 derniers jours.</p></section>

    <h2 class="h-sec">Tests</h2>
    <section class="panel"><p class="muted small">À faire à l'arrivée, puis toutes les 8 semaines. Touche un test pour ajouter un résultat.</p><ul class="list">${testsHtml}</ul></section>

    <h2 class="h-sec">Gabarit et style</h2>
    <section class="panel">${morphoHtml}</section>
  `;

  el.querySelector("[data-weight]").addEventListener("click", () => openWeight(ctx.refresh));
  el.querySelectorAll("[data-test]").forEach((li) => li.addEventListener("click", () => openTest(TESTS.find((t) => t.id === li.dataset.test), ctx.refresh)));
}

function openWeight(after) {
  const body = openSheet("Pesée", `<form class="stack" data-w>
    <label class="field"><span>Poids au réveil (kg)</span><input class="input num" name="kg" inputmode="decimal" required autofocus></label>
    <button class="btn tape-btn block">Enregistrer</button></form>`);
  body.querySelector("[data-w]").addEventListener("submit", (e) => {
    e.preventDefault();
    const kg = Number(e.target.kg.value.replace(",", "."));
    if (!kg) return;
    const date = todayKey();
    store.update((s) => { s.weights = s.weights.filter((x) => x.date !== date); s.weights.push({ date, kg }); s.profile.weight = kg; });
    closeSheet(); toast("Pesée enregistrée"); after();
  });
}

function openTest(t, after) {
  const rm = !!t.ratio;
  const body = openSheet(t.name, `<p class="muted">${esc(t.how)}</p>
    <form class="stack" data-t style="margin-top:12px">
      ${rm ? `<div class="grid2"><label class="field"><span>Charge (kg)</span><input class="input num" name="kg" inputmode="decimal" required></label>
        <label class="field"><span>Répétitions (1 à 11)</span><input class="input num" name="reps" inputmode="numeric" required></label></div><p class="hint" data-est></p>`
      : t.id === "row2k" ? `<div class="grid2"><label class="field"><span>Minutes</span><input class="input num" name="min" inputmode="numeric" required></label><label class="field"><span>Secondes</span><input class="input num" name="sec" inputmode="numeric" value="0"></label></div>`
      : `<label class="field"><span>Résultat (${esc(t.unit)})</span><input class="input num" name="v" inputmode="decimal" required></label>`}
      <button class="btn tape-btn block">Enregistrer</button></form>`);
  const f = body.querySelector("[data-t]");
  const num = (x) => Number(String(f[x]?.value || "").replace(",", "."));
  f.addEventListener("input", () => { if (rm) { const e = brzycki(num("kg"), num("reps")); body.querySelector("[data-est]").textContent = e ? `Maximum estimé : ${fmt(e, 1)} kg` : "Entre 1 et 11 répétitions pour une estimation fiable."; } });
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    let value;
    if (rm) value = brzycki(num("kg"), num("reps"));
    else if (t.id === "row2k") value = num("min") * 60 + num("sec");
    else value = num("v");
    if (!value) return toast("Résultat invalide");
    store.update((s) => s.tests.push({ date: todayKey(), id: t.id, value: Math.round(value * 10) / 10 }));
    closeSheet(); toast("Résultat enregistré"); after();
  });
}
