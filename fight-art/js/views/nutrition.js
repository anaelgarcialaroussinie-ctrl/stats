import { store, todayKey, addDays, uid } from "../store.js";
import { esc, icon, meter, openSheet, closeSheet, toast, sheetBody } from "../ui.js";
import { dayPlan, nutritionTargets, dayTotals, frDate, fmt } from "../engine.js";
import { MEALS, QUICK_FOODS } from "../data.js";
import { byBarcode, search, startScanner } from "../off.js";

let viewKey = null;

const mealNow = () => { const h = new Date().getHours(); return h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 18 ? "snack" : "dinner"; };

export function renderNutrition(el, ctx, params = {}) {
  viewKey ||= todayKey();
  const st = store.get();
  const p = st.profile;
  const key = viewKey;
  const plan = dayPlan(p, key, st);
  const nt = nutritionTargets(p, plan);
  const entries = st.food[key] || [];
  const tot = dayTotals(entries);
  const water = st.water[key] || 0;
  const isToday = key === todayKey();

  const targets = nt?.minor
    ? `<p class="muted">Pour les moins de 18 ans, pas d'objectif chiffré : une source de protéines à chaque repas, des féculents selon l'activité, des fruits et des légumes, et de l'eau tout au long de la journée.</p>`
    : `<div class="row between"><h3>${fmt(tot.kcal)} <span class="muted small">/ ${fmt(nt.kcal)} kcal</span></h3><span class="badge">${esc(nt.loadLabel)}</span></div>
       ${meter("Protéines", tot.p, nt.p, " g")}${meter("Glucides", tot.c, nt.c, " g")}${meter("Lipides", tot.f, nt.f, " g")}
       <p class="hint" style="margin-top:12px">Vise environ ${nt.perMealP} g de protéines par repas, toutes les 3 à 4 heures. Les glucides suivent ta charge d'entraînement du jour.</p>`;

  const meals = MEALS.map((m) => {
    const list = entries.filter((e) => e.meal === m.id);
    const t = dayTotals(list);
    return `<section class="panel">
      <div class="row between"><h3>${esc(m.label)}</h3><span class="muted small num">${list.length ? fmt(t.kcal) + " kcal" : ""}</span></div>
      ${list.length ? `<ul class="list" style="margin-top:6px">${list.map((e) => `<li>
        <div class="row" style="min-width:0">${e.img ? `<img class="food-thumb" src="${esc(e.img)}" alt="" loading="lazy">` : ""}<div style="min-width:0"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(e.name)}</div><div class="meta num">${fmt(e.grams)} g · P ${fmt(e.p)} · G ${fmt(e.c)} · L ${fmt(e.f)}</div></div></div>
        <div class="row"><span class="right num">${fmt(e.kcal)}</span><button class="icon-btn" data-del="${e.id}" aria-label="Supprimer ${esc(e.name)}">${icon("trash")}</button></div></li>`).join("")}</ul>` : ""}
      <button class="btn ghost small" data-add="${m.id}" style="margin-top:10px">${icon("plus")} Ajouter</button>
    </section>`;
  }).join("");

  el.innerHTML = `
    <div class="row between" style="margin:4px 0 10px">
      <button class="icon-btn" data-day="-1" aria-label="Jour précédent">${icon("back")}</button>
      <div style="text-align:center"><div class="display" style="font-size:28px">${isToday ? "Aujourd'hui" : esc(frDate(key, { weekday: "long" }))}</div><div class="muted small">${esc(frDate(key, { day: "numeric", month: "long" }))}</div></div>
      <button class="icon-btn" data-day="1" aria-label="Jour suivant" ${isToday ? "disabled style='opacity:.3'" : ""}>${icon("back", 'style="transform:scaleX(-1)"')}</button>
    </div>
    <section class="panel">${targets}</section>
    <div class="grid2" style="margin-top:12px">
      <button class="btn tape-btn" data-scan>${icon("scan")} Scanner</button>
      <button class="btn ghost" data-add="${mealNow()}">${icon("search")} Rechercher</button>
    </div>
    <h2 class="h-sec">Repas</h2>
    <div class="stack">${meals}</div>
    <h2 class="h-sec">Hydratation</h2>
    <section class="panel row between">
      <div><div class="display num" style="font-size:34px">${fmt(water, 2)} L</div><div class="muted small">Pèse-toi avant et après l'entraînement pour savoir combien boire ensuite.</div></div>
      <div class="row"><button class="icon-btn" data-water="-0.25" aria-label="Retirer un verre">−</button><button class="btn small" data-water="0.25">+ 25 cl</button></div>
    </section>`;

  el.querySelectorAll("[data-day]").forEach((b) => b.addEventListener("click", () => { viewKey = addDays(viewKey, Number(b.dataset.day)); if (viewKey > todayKey()) viewKey = todayKey(); ctx.refresh(); }));
  el.querySelectorAll("[data-add]").forEach((b) => b.addEventListener("click", () => openAdd(key, b.dataset.add, ctx.refresh)));
  el.querySelector("[data-scan]").addEventListener("click", () => openScan(key, mealNow(), ctx.refresh));
  el.querySelectorAll("[data-del]").forEach((b) => b.addEventListener("click", () => {
    store.update((s) => { s.food[key] = (s.food[key] || []).filter((e) => e.id !== b.dataset.del); });
    ctx.refresh(); toast("Aliment supprimé");
  }));
  el.querySelectorAll("[data-water]").forEach((b) => b.addEventListener("click", () => {
    store.update((s) => { s.water[key] = Math.max(0, Math.round(((s.water[key] || 0) + Number(b.dataset.water)) * 100) / 100); });
    ctx.refresh();
  }));
  if (params.add) openAdd(key, mealNow(), ctx.refresh);
}

// ---------- ajout ----------
function openAdd(key, meal, after) {
  const body = openSheet("Ajouter un aliment", `
    <form data-search class="row" role="search">
      <input class="input" name="q" placeholder="Rechercher : skyr, riz, banane…" autocomplete="off" enterkeyhint="search">
      <button class="icon-btn" aria-label="Rechercher">${icon("search")}</button>
    </form>
    <div class="grid2" style="margin-top:10px"><button class="btn ghost small" data-scan>${icon("scan")} Scanner</button><button class="btn ghost small" data-manual>Saisie libre</button></div>
    <div data-results style="margin-top:14px">
      <h3 style="margin-bottom:4px">Aliments courants</h3>
      <p class="tiny muted">Valeurs moyennes pour 100 g.</p>
      <ul class="list">${QUICK_FOODS.map((f, i) => `<li data-quick="${i}" role="button" tabindex="0"><div><div style="font-weight:600">${esc(f.name)}</div><div class="meta num">${f.kcal} kcal · P ${f.p} · G ${f.c} · L ${f.f}</div></div>${icon("plus", 'style="width:20px;height:20px"')}</li>`).join("")}</ul>
    </div>`);
  const results = body.querySelector("[data-results]");
  body.querySelector("[data-search]").addEventListener("submit", async (e) => {
    e.preventDefault();
    const q = e.target.q.value.trim(); if (!q) return;
    results.innerHTML = `<p class="muted">Recherche dans Open Food Facts…</p>`;
    try {
      const list = await search(q);
      results.innerHTML = list.length ? `<ul class="list">${list.map((f, i) => `<li data-res="${i}" role="button" tabindex="0">
          <div class="row" style="min-width:0">${f.img ? `<img class="food-thumb" src="${esc(f.img)}" alt="" loading="lazy">` : ""}<div style="min-width:0"><div style="font-weight:600">${esc(f.name)}</div><div class="meta">${esc(f.brand)} · ${fmt(f.kcal)} kcal / 100 g</div></div></div>${icon("plus", 'style="width:20px;height:20px;flex:none"')}</li>`).join("")}</ul>`
        : `<p class="muted">Aucun produit trouvé pour « ${esc(q)} ». Essaie un autre mot ou la saisie libre.</p>`;
      results._list = list;
    } catch {
      results.innerHTML = `<p class="notice is-warn">Recherche impossible : vérifie ta connexion internet, ou utilise les aliments courants et la saisie libre.</p>`;
    }
  });
  body.addEventListener("click", (e) => {
    const q = e.target.closest("[data-quick]");
    if (q) return openPortion(key, meal, { ...QUICK_FOODS[q.dataset.quick], source: "Valeurs moyennes" }, after);
    const r = e.target.closest("[data-res]");
    if (r) return openPortion(key, meal, results._list[r.dataset.res], after);
    if (e.target.closest("[data-scan]")) return openScan(key, meal, after);
    if (e.target.closest("[data-manual]")) return openManual(key, meal, after);
  });
}

function openPortion(key, meal, food, after) {
  let grams = food.serving || 100;
  let m = meal;
  const calc = () => ({ kcal: food.kcal * grams / 100, p: food.p * grams / 100, c: food.c * grams / 100, f: food.f * grams / 100 });
  const body = openSheet("Quantité", `
    <div class="row">${food.img ? `<img class="food-thumb" src="${esc(food.img)}" alt="" style="width:56px;height:56px">` : ""}
      <div><h3>${esc(food.name)}</h3><div class="muted small">${esc(food.brand || food.source || "")}</div></div></div>
    <label class="field" style="margin-top:16px"><span>Quantité (g)</span><input class="input num" name="g" inputmode="decimal" value="${grams}"></label>
    <div class="chips" style="margin-top:8px">${[50, 100, 150, 200, 250].map((g) => `<button type="button" class="chip" data-g="${g}">${g} g</button>`).join("")}${food.serving ? `<button type="button" class="chip" data-g="${food.serving}">1 portion</button>` : ""}</div>
    <div class="chips" style="margin-top:14px">${MEALS.map((x) => `<button type="button" class="chip" data-meal="${x.id}" aria-pressed="${x.id === m}">${esc(x.label)}</button>`).join("")}</div>
    <div class="panel grid2" style="margin-top:14px" data-sum></div>
    <button class="btn tape-btn block" data-ok style="margin-top:16px">Ajouter au journal</button>`);
  const sum = body.querySelector("[data-sum]");
  const draw = () => { const v = calc(); sum.innerHTML = `<div><div class="display num" style="font-size:30px">${fmt(v.kcal)}</div><div class="muted small">kcal</div></div><div class="small num">Protéines ${fmt(v.p, 1)} g<br>Glucides ${fmt(v.c, 1)} g<br>Lipides ${fmt(v.f, 1)} g</div>`; };
  draw();
  const input = body.querySelector("[name=g]");
  input.addEventListener("input", () => { grams = Number(input.value.replace(",", ".")) || 0; draw(); });
  body.addEventListener("click", (e) => {
    const g = e.target.closest("[data-g]"); if (g) { grams = Number(g.dataset.g); input.value = grams; draw(); }
    const mm = e.target.closest("[data-meal]"); if (mm) { m = mm.dataset.meal; body.querySelectorAll("[data-meal]").forEach((x) => x.setAttribute("aria-pressed", x === mm)); }
    if (e.target.closest("[data-ok]")) {
      if (!grams) return toast("Indique une quantité");
      const v = calc();
      store.update((s) => { (s.food[key] ||= []).push({ id: uid(), meal: m, name: food.name, brand: food.brand || "", code: food.code || "", img: food.img || "", grams, ...v, at: new Date().toISOString() }); });
      closeSheet(); toast(`${food.name} ajouté`); after?.();
    }
  });
}

function openManual(key, meal, after) {
  const body = openSheet("Saisie libre", `
    <form data-man class="stack">
      <label class="field"><span>Nom</span><input class="input" name="name" required placeholder="Ex. Plat du midi"></label>
      <p class="hint">Valeurs pour 100 g, ou pour la portion entière si tu mets 100 comme quantité.</p>
      <div class="grid2">
        <label class="field"><span>Calories</span><input class="input num" name="kcal" inputmode="decimal" required></label>
        <label class="field"><span>Protéines (g)</span><input class="input num" name="p" inputmode="decimal" value="0"></label>
        <label class="field"><span>Glucides (g)</span><input class="input num" name="c" inputmode="decimal" value="0"></label>
        <label class="field"><span>Lipides (g)</span><input class="input num" name="f" inputmode="decimal" value="0"></label>
      </div>
      <button class="btn block">Continuer</button>
    </form>`);
  body.querySelector("[data-man]").addEventListener("submit", (e) => {
    e.preventDefault(); const f = e.target; const n = (x) => Number(String(f[x].value).replace(",", ".")) || 0;
    openPortion(key, meal, { name: f.name.value.trim() || "Aliment", kcal: n("kcal"), p: n("p"), c: n("c"), f: n("f"), source: "Saisie libre" }, after);
  });
}

function openScan(key, meal, after) {
  let stop = null;
  const body = openSheet("Scanner un produit", `
    <div class="scanner"><video playsinline muted></video><div class="frame"></div></div>
    <p class="muted small" data-msg style="margin-top:10px">Place le code-barres du produit dans le cadre.</p>
    <form data-code class="row" style="margin-top:6px"><input class="input num" name="code" inputmode="numeric" placeholder="Ou tape le code-barres"><button class="btn small">Valider</button></form>`,
    { close: () => stop?.() });
  const msg = body.querySelector("[data-msg]");
  const lookup = async (code) => {
    msg.textContent = `Code ${code} : recherche du produit…`;
    try {
      const food = await byBarcode(code);
      if (!food) { msg.textContent = `Produit ${code} introuvable dans Open Food Facts. Utilise la recherche ou la saisie libre.`; return; }
      stop?.(); openPortion(key, meal, food, after);
    } catch { msg.textContent = "Connexion impossible. Vérifie ta connexion internet."; }
  };
  body.querySelector("[data-code]").addEventListener("submit", (e) => { e.preventDefault(); const c = e.target.code.value.replace(/\D/g, ""); if (c) lookup(c); });
  startScanner(body.querySelector("video"), (code) => { if (navigator.vibrate) navigator.vibrate(40); lookup(code); })
    .then((s) => { stop = s; if (!sheetBody()) s(); })
    .catch(() => { msg.textContent = "Caméra indisponible : autorise l'accès à la caméra dans les réglages, ou tape le code-barres."; });
}
