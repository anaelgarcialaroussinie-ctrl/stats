// Feuilles de séance partagées : check-in, mobilité, force, séance club, RPE.
import { store, todayKey, uid, addDays } from "../store.js";
import { STRENGTH, MOBILITY, MOVEMENT, PAIN_ZONES } from "../data.js";
import { EX, SUBS, PREHAB, WARMUP, PAIN_RULE, scPhase } from "../sc-data.js";
import { computeQualities } from "../qualities.js";
import { esc, icon, openSheet, closeSheet, toast, scale } from "../ui.js";
import { readiness, readinessAdvice, suggestedLoad, isMinor, fmt, brzycki } from "../engine.js";
import { guideInline } from "../drill-guides.js";

const ensureDay = (s, key) => (s.sessions[key] ||= { logs: [], done: {} });

export function markDone(key, blockId, log) {
  store.update((s) => {
    const day = ensureDay(s, key);
    day.done[blockId] = true;
    if (log) day.logs = [...day.logs.filter((l) => l.id !== blockId), { id: blockId, at: new Date().toISOString(), ...log }];
  });
}

// ---------- check-in ----------
export function openCheckin(key = todayKey(), after) {
  const prev = store.get().checkins[key];
  const c = prev ? { ...prev } : { sleepH: 7.5, sleepQ: 3, fatigue: 2, soreness: 2, mood: 4, pain: false, painZones: [], painLevel: 3, cycle: "" };
  const p = store.get().profile;
  const lastW = [...(store.get().weights || [])].filter((w) => w.date <= key).sort((a, b) => a.date.localeCompare(b.date)).pop();
  if (c.kg === undefined) c.kg = (store.get().weights || []).find((w) => w.date === key)?.kg ?? "";
  const base = watchBaseline(key);
  const body = openSheet("Check-in du matin", `
    <form data-ci class="stack">
      <label class="field"><span>Heures de sommeil</span>
        <div class="row"><input class="input num" type="range" min="3" max="11" step="0.5" name="sleepH" value="${c.sleepH}" style="padding:0;min-height:36px"><b class="num" data-out="sleepH" style="min-width:52px;text-align:right">${fmt(c.sleepH, 1)} h</b></div></label>
      <div><span class="small" style="font-weight:600">Qualité du sommeil</span>${scale("sleepQ", c.sleepQ, "Très mauvaise", "Excellente")}</div>
      <div><span class="small" style="font-weight:600">Fatigue</span>${scale("fatigue", c.fatigue, "En pleine forme", "Épuisé")}</div>
      <div><span class="small" style="font-weight:600">Courbatures</span>${scale("soreness", c.soreness, "Aucune", "Très fortes")}</div>
      <div><span class="small" style="font-weight:600">Moral</span>${scale("mood", c.mood, "Très bas", "Au top")}</div>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Une douleur ?</span>
        <div class="chips"><button type="button" class="chip" data-pain="0" aria-pressed="${!c.pain}">Non</button><button type="button" class="chip" data-pain="1" aria-pressed="${c.pain}">Oui</button></div></div>
      <div data-painbox ${c.pain ? "" : "hidden"} class="stack">
        <div class="chips">${PAIN_ZONES.map((z) => `<button type="button" class="chip" data-zone="${esc(z)}" aria-pressed="${c.painZones.includes(z)}">${esc(z)}</button>`).join("")}</div>
        <label class="field"><span>Intensité de la douleur : <b data-out="painLevel">${c.painLevel}</b> / 10</span><input type="range" min="1" max="10" name="painLevel" value="${c.painLevel}" style="width:100%"></label>
      </div>
      <div class="panel" style="padding:12px">
        <div class="row between"><span class="small" style="font-weight:700">Pesée du matin</span><span class="tiny muted">${lastW && lastW.date !== key ? `dernière : ${fmt(lastW.kg, 1)} kg` : ""}</span></div>
        <label class="field" style="margin-top:6px"><span class="tiny muted">À jeun, après être passé aux toilettes, toujours sur la même balance</span>
          <div class="row"><input class="input num" name="kg" inputmode="decimal" placeholder="${lastW ? fmt(lastW.kg, 1) : "Ex. 72,4"}" value="${c.kg === "" ? "" : fmt(c.kg, 1)}" style="flex:1"><b>kg</b></div></label>
      </div>
      <div class="panel" style="padding:12px">
        <div class="row between"><span class="small" style="font-weight:700">Ma montre (facultatif)</span><button type="button" class="btn ghost small" data-watch>${icon("plus")} Importer</button></div>
        <div class="grid2" style="margin-top:6px">
          <label class="field"><span class="tiny muted">FC au repos</span><div class="row"><input class="input num" name="hr" inputmode="numeric" value="${c.hr ?? ""}" placeholder="${base.hr ? Math.round(base.hr) : "Ex. 55"}"><b class="tiny">bpm</b></div></label>
          <label class="field"><span class="tiny muted">VFC (HRV)</span><div class="row"><input class="input num" name="hrv" inputmode="numeric" value="${c.hrv ?? ""}" placeholder="${base.hrv ? Math.round(base.hrv) : "Ex. 60"}"><b class="tiny">ms</b></div></label>
        </div>
        <p class="hint" style="margin:4px 0 0">${base.n >= 5 ? `Ta moyenne habituelle : ${base.hr ? Math.round(base.hr) + " bpm" : ""}${base.hr && base.hrv ? " · " : ""}${base.hrv ? Math.round(base.hrv) + " ms" : ""}.` : "Après 5 matins renseignés, l'appli compare chaque matin à ta moyenne habituelle."} <a href="#" data-howwatch>Relier ma montre</a></p>
      </div>
      ${p?.sex === "F" && p?.trackCycle ? `<label class="field"><span>Cycle (facultatif)</span><select class="input" name="cycle"><option value="">Ne pas renseigner</option><option value="regles" ${c.cycle === "regles" ? "selected" : ""}>Règles</option><option value="autre" ${c.cycle === "autre" ? "selected" : ""}>Autre phase</option></select></label>` : ""}
      <button class="btn tape-btn block">Valider mon check-in</button>
    </form>`);
  const form = body.querySelector("[data-ci]");
  form.addEventListener("input", (e) => {
    const t = e.target;
    if (t.name === "sleepH") { c.sleepH = Number(t.value); form.querySelector('[data-out="sleepH"]').textContent = fmt(c.sleepH, 1) + " h"; }
    if (t.name === "painLevel") { c.painLevel = Number(t.value); form.querySelector('[data-out="painLevel"]').textContent = t.value; }
    if (t.name === "cycle") c.cycle = t.value;
    if (["kg", "hr", "hrv"].includes(t.name)) { const v = Number(String(t.value).replace(",", ".")); c[t.name] = t.value.trim() === "" || !isFinite(v) ? (t.name === "kg" ? "" : undefined) : v; }
  });
  form.addEventListener("click", async (e) => {
    if (e.target.closest("[data-howwatch]")) { e.preventDefault(); openWatchHelp(); return; }
    const b = e.target.closest("button[type=button]");
    if (!b) return;
    if (b.dataset.watch !== undefined) {
      const got = await readWatchClipboard();
      if (!got) { toast("Rien à importer : lance d'abord le raccourci « Fight Art montre »"); return; }
      for (const k of ["hr", "hrv", "kg"]) if (got[k] !== undefined) { c[k] = got[k]; const inp = form.querySelector(`[name="${k}"]`); if (inp) inp.value = k === "kg" ? fmt(got[k], 1) : Math.round(got[k]); }
      toast("Données de la montre importées");
      return;
    }
    if (b.dataset.scale) {
      c[b.dataset.scale] = Number(b.dataset.v);
      form.querySelectorAll(`[data-scale="${b.dataset.scale}"]`).forEach((x) => x.setAttribute("aria-pressed", x === b));
    }
    if (b.dataset.pain !== undefined) {
      c.pain = b.dataset.pain === "1";
      form.querySelectorAll("[data-pain]").forEach((x) => x.setAttribute("aria-pressed", x === b));
      form.querySelector("[data-painbox]").hidden = !c.pain;
    }
    if (b.dataset.zone) {
      const z = b.dataset.zone; const i = c.painZones.indexOf(z);
      if (i >= 0) c.painZones.splice(i, 1); else c.painZones.push(z);
      b.setAttribute("aria-pressed", i < 0);
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const kg = Number(c.kg);
    if (c.kg !== "" && (!isFinite(kg) || kg < 25 || kg > 250)) { toast("Vérifie ton poids"); return; }
    if (c.hr !== undefined && (c.hr < 25 || c.hr > 140)) { toast("Vérifie ta fréquence cardiaque au repos"); return; }
    if (c.hrv !== undefined && (c.hrv < 5 || c.hrv > 300)) { toast("Vérifie ta variabilité cardiaque"); return; }
    if (base.n >= 5) { c.hrBase = base.hr ? Math.round(base.hr) : undefined; c.hrvBase = base.hrv ? Math.round(base.hrv) : undefined; }
    store.update((s) => {
      s.checkins[key] = { ...c, at: new Date().toISOString() };
      if (c.kg !== "" && isFinite(kg)) { s.weights = (s.weights || []).filter((w) => w.date !== key); s.weights.push({ date: key, kg }); if (key >= ((s.weights || []).map((w) => w.date).sort().pop() || "")) s.profile.weight = kg; }
    });
    const r = readiness(c);
    closeSheet();
    toast(`Check-in enregistré · forme ${r.score}/100`);
    after?.();
  });
}

// moyenne des 30 derniers matins (FC repos, VFC) : la référence de chacun
function watchBaseline(key) {
  const st = store.get();
  const prev = Object.entries(st.checkins || {}).filter(([d]) => d < key && d >= addDays(key, -30)).map(([, x]) => x);
  const avg = (k) => { const v = prev.map((x) => Number(x[k])).filter((x) => x > 0); return v.length >= 5 ? v.reduce((a, b) => a + b, 0) / v.length : null; };
  return { hr: avg("hr"), hrv: avg("hrv"), n: Math.max(prev.filter((x) => x.hr).length, prev.filter((x) => x.hrv).length) };
}

// le raccourci iPhone copie une ligne « FA hr=52 hrv=61 kg=72.4 » dans le presse-papiers
async function readWatchClipboard() {
  let txt = "";
  try { txt = await navigator.clipboard.readText(); } catch { return null; }
  if (!/FA/i.test(txt)) return null;
  const num = (k) => { const m = txt.match(new RegExp(k + "\\s*[=:]\\s*([0-9]+(?:[.,][0-9]+)?)", "i")); return m ? Number(m[1].replace(",", ".")) : undefined; };
  const out = { hr: num("hr"), hrv: num("hrv"), kg: num("kg") };
  if (out.hr === undefined && out.hrv === undefined && out.kg === undefined) return null;
  if (out.kg !== undefined) out.kg = Math.round(out.kg * 10) / 10;
  return out;
}

export function openWatchHelp() {
  openSheet("Relier ma montre", `
    <p class="small" style="margin-top:0">Une appli web ne peut pas lire Santé directement. La solution : un raccourci iPhone qui récupère tes chiffres du matin dans Santé, puis un bouton « Importer » dans ton check-in. Ça marche avec toutes les montres qui envoient leurs données dans Santé (Apple Watch, Garmin, Polar, Withings, Fitbit, Coros, Whoop…) et avec les balances connectées.</p>
    <h3 class="sys-h">Créer le raccourci (une seule fois, 3 minutes)</h3>
    <ol class="bul small" style="padding-left:18px">
      <li>Ouvre l'app <b>Raccourcis</b> → <b>+</b> → nomme-le <b>Fight Art montre</b>.</li>
      <li>Ajoute l'action <b>Rechercher des échantillons de santé</b> : type <b>Fréquence cardiaque au repos</b>, trier par <b>Date de début</b>, ordre <b>Plus récent d'abord</b>, limite <b>1</b>.</li>
      <li>Ajoute <b>Obtenir les détails des échantillons de santé</b> → <b>Valeur</b>.</li>
      <li>Refais les étapes 2 et 3 pour <b>Variabilité du rythme cardiaque</b>, puis pour <b>Poids</b> (si tu as une balance connectée).</li>
      <li>Ajoute <b>Texte</b> et écris : <b>FA hr=</b>[valeur 1] <b>hrv=</b>[valeur 2] <b>kg=</b>[valeur 3], en insérant les valeurs avec les variables.</li>
      <li>Ajoute <b>Copier dans le presse-papiers</b>, puis <b>Afficher une notification</b> : « Ouvre Fight Art et importe ».</li>
    </ol>
    <h3 class="sys-h">Chaque matin</h3>
    <ol class="bul small" style="padding-left:18px">
      <li>Lance le raccourci (widget, Siri « Fight Art montre », ou une automatisation à ton heure de réveil).</li>
      <li>Ouvre l'appli → check-in → <b>Importer</b> (autorise le collage si l'iPhone le demande).</li>
    </ol>
    <p class="hint">Sans raccourci, tu peux aussi recopier les deux chiffres affichés par ta montre. Prends-les toujours au réveil, avant de te lever : c'est la comparaison avec ta propre moyenne qui compte, pas le chiffre seul.</p>`);
}

// ---------- RPE ----------
export function rpePicker(value) {
  return `<div class="grid3" style="grid-template-columns:repeat(5,1fr)">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => `<button type="button" class="set" data-rpe="${v}" aria-pressed="${v === value}">${v}</button>`).join("")}</div>
  <div class="scale-legend"><span>Très facile</span><span>Maximal</span></div>`;
}

export function openLog(key, block, after) {
  const prev = store.get().sessions[key]?.logs?.find((l) => l.id === block.id);
  const v = { rpe: prev?.rpe || 6, minutes: prev?.minutes || block.minutes || 60, sparring: prev?.sparring || "none", note: prev?.note || "" };
  const p = store.get().profile;
  const body = openSheet(block.title, `
    <form data-log class="stack">
      <label class="field"><span>Durée (minutes)</span><input class="input num" name="minutes" inputmode="numeric" value="${v.minutes}"></label>
      <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Intensité ressentie de la séance</span>${rpePicker(v.rpe)}</div>
      ${block.type === "club" ? `<div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Sparring</span>
        <div class="chips">${[["none", "Aucun"], ["grappling", "Grappling"], ["light", "Frappe légère"], ["hard", "Frappe dure"]].filter(([id]) => !(isMinor(p) && id === "hard")).map(([id, l]) => `<button type="button" class="chip" data-sp="${id}" aria-pressed="${v.sparring === id}">${l}</button>`).join("")}</div></div>` : ""}
      <label class="field"><span>Note (facultatif)</span><textarea class="input" name="note" rows="2" placeholder="Ce qui a marché, ce qui est à retravailler">${esc(v.note)}</textarea></label>
      <p class="hint">Note l'intensité 30 minutes après la séance : 1 = très facile, 10 = effort maximal.</p>
      <button class="btn tape-btn block">Enregistrer la séance</button>
    </form>`);
  const form = body.querySelector("[data-log]");
  form.addEventListener("click", (e) => {
    const b = e.target.closest("button[type=button]"); if (!b) return;
    if (b.dataset.rpe) { v.rpe = Number(b.dataset.rpe); form.querySelectorAll("[data-rpe]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
    if (b.dataset.sp) { v.sparring = b.dataset.sp; form.querySelectorAll("[data-sp]").forEach((x) => x.setAttribute("aria-pressed", x === b)); }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    v.minutes = Number(form.minutes.value) || 0; v.note = form.note.value.trim();
    markDone(key, block.id, { title: block.title, type: block.type, ...v });
    closeSheet(); toast("Séance enregistrée"); after?.();
  });
}

// ---------- mobilité / mouvement ----------
export function openRoutine(key, block, after) {
  const R = block.type === "mobility" ? MOBILITY : MOVEMENT;
  const done = new Set();
  const body = openSheet(R.title, `
    <p class="muted">${R.minutes} minutes. Coche au fur et à mesure.</p>
    <ul class="list" style="margin-top:8px">${R.items.map((it, i) => `<li><div style="min-width:0;flex:1"><div style="font-weight:650">${esc(it.name)}</div><div class="meta">${esc(it.detail)}</div>${guideInline(it.name)}</div>
      <button type="button" class="icon-btn" data-it="${i}" aria-pressed="false" aria-label="Fait">${icon("check")}</button></li>`).join("")}</ul>
    <button class="btn tape-btn block" data-finish style="margin-top:16px">Terminer</button>`);
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-it]");
    if (b) { const i = b.dataset.it; done.has(i) ? done.delete(i) : done.add(i); b.style.background = done.has(i) ? "var(--good)" : ""; b.style.color = done.has(i) ? "#fff" : ""; }
    if (e.target.closest("[data-finish]")) { markDone(key, block.id, { title: R.title, type: block.type, minutes: R.minutes, rpe: 2 }); closeSheet(); toast("Bloc terminé"); after?.(); }
  });
}

// ---------- force et explosivité (version MMA, adaptée aux blessures) ----------
const daysTo = (p, key) => (p?.competitionDate ? Math.round((new Date(p.competitionDate + "T12:00:00") - new Date(key + "T12:00:00")) / 86400000) : null);

// construit la séance du jour : remplace les exercices qui sollicitent une zone douloureuse ou fragile
export function buildStrength(p, st, key, block) {
  const S = STRENGTH[block.kind];
  const home = p.equipment === "home" || isMinor(p);
  const base = home ? S.home : S.gym;
  const c = st.checkins[key];
  const acute = c?.pain ? (c.painZones || []) : [];
  const chronic = p.injuries || [];
  const zones = [...new Set([...acute, ...chronic])];
  const phase = scPhase(daysTo(p, key));
  const changes = [];
  const resolve = (item, section) => {
    const ex = EX[item.id];
    const hit = zones.find((z) => ex.zones.includes(z));
    let out = { ...item, ex };
    if (hit) {
      const subId = SUBS[hit]?.[item.id];
      const sub = subId && EX[subId];
      if (sub && !sub.zones.some((z) => zones.includes(z))) { out = { ...item, id: subId, ex: sub, adapted: `${ex.name} remplacé (${hit.toLowerCase()})` }; changes.push(`${ex.name} → ${sub.name} (${hit.toLowerCase()})`); }
      else { changes.push(`${ex.name} retiré (${hit.toLowerCase()})`); return null; }
    }
    let sets = out.sets;
    if (section === "strength" && block.mode === "light") sets = Math.min(sets, 3);
    if (section === "strength" && phase.id === "power") sets = Math.max(2, sets - 1);
    if (section !== "strength" && block.mode === "light") sets = Math.max(2, sets - 1);
    return { ...out, sets };
  };
  const sections = [
    { key: "power", title: "1 · Explosivité", hint: "Système nerveux frais : chaque répétition à 100 % de vitesse, repos complet.", items: base.power.map((i) => resolve(i, "power")).filter(Boolean) },
    { key: "strength", title: "2 · Force", hint: block.kind === "vitesse" ? "Charges modérées, vitesse maximale. La série s'arrête quand la vitesse baisse." : "Garde 2 répétitions en réserve. Technique parfaite avant la charge.", items: base.strength.map((i) => resolve(i, "strength")).filter(Boolean) },
    { key: "mma", title: "3 · Spécifique MMA", hint: "Nuque, grip, tronc, adducteurs, ischio-jambiers : ce qui protège et ce qui sert au combat.", items: base.mma.map((i) => resolve(i, "mma")).filter(Boolean) },
  ];
  // adaptation au profil athlétique (tests, charges, forme)
  const qual = computeQualities(p, st);
  const pr = qual.priority;
  const bump = (sec, pred) => { const it = sections.find((x) => x.key === sec)?.items.find(pred); if (it) it.sets += 1; return it; };
  if (pr === "force" && block.kind !== "vitesse") { const it = bump("strength", (i) => i.ex.load || true); if (it) changes.push(`${it.ex.name} : une série de plus (priorité force)`); }
  if (pr === "explo") { sections[0].items.forEach((i) => { i.sets += 1; }); if (sections[0].items.length) changes.push("Explosivité : une série de plus sur chaque exercice (priorité explosivité)"); if (block.kind === "volume" && !sections[0].items.some((i) => i.id === "broad") && !zones.some((z) => EX.broad.zones.includes(z))) { sections[0].items.push({ id: "broad", ex: EX.broad, sets: 3, reps: "3", rest: "90 s" }); changes.push("Saut en longueur ajouté (priorité explosivité)"); } }
  if (pr === "haut") { const it = bump("strength", (i) => ["pullup", "row", "csrow", "h_pull"].includes(i.id)); if (it) changes.push(`${it.ex.name} : une série de plus (priorité tirage)`); }
  const prev = zones.filter((z) => PREHAB[z]).slice(0, 2);
  if (prev.length) sections.push({ key: "prehab", title: "4 · Prévention ciblée", hint: `Pour ${prev.map((z) => z.toLowerCase()).join(" et ")}.`, items: prev.flatMap((z) => PREHAB[z].items.slice(0, 2).map(([name, dose]) => ({ id: null, name, dose, zone: z }))) });
  const hard = c?.pain && Number(c.painLevel) >= 5;
  return { S, home, sections, changes, zones, phase, hard, acute, qual };
}

export function openStrength(key, block, after) {
  const st = store.get();
  const p = st.profile;
  const B = buildStrength(p, st, key, block);
  const { S, home } = B;
  const log = {};
  const all = B.sections.flatMap((sec) => sec.items.filter((i) => i.id).map((i) => ({ ...i, sec: sec.key })));
  all.forEach((i) => { log[i.id] = { kg: i.ex.load && !home ? (suggestedLoad({ id: i.id, inc: i.ex.inc }, st, block.mode) ?? st.lifts?.[i.id]?.kg ?? "") : "", sets: Array(i.sets).fill(false) }; });
  let rpe = 7;

  const exHtml = (i) => {
    if (!i.id) return `<div class="ex"><div class="ex-head"><span class="ex-name">${esc(i.name)}</span><span class="ex-presc">${esc(i.dose)}</span></div>${guideInline(i.name)}</div>`;
    const L = log[i.id]; const loaded = i.ex.load && !home;
    const sug = loaded ? suggestedLoad({ id: i.id, inc: i.ex.inc }, st, block.mode) : null;
    return `<div class="ex" data-ex="${i.id}">
      <div class="ex-head"><span class="ex-name">${esc(i.ex.name)}</span><span class="ex-presc">${i.sets} × ${esc(String(i.reps))}</span></div>
      <div class="tiny muted">Repos ${esc(i.rest)}${i.note ? " · " + esc(i.note) : ""}${loaded ? (sug ? ` · charge proposée ${fmt(sug, 1)} kg` : " · première fois : monte progressivement jusqu'à une charge propre et rapide") : ""}</div>
      ${i.adapted ? `<div class="tiny" style="color:var(--warn);margin-top:2px">Adapté : ${esc(i.adapted)}</div>` : ""}
      ${guideInline(i.ex.name)}
      ${loaded ? `<div class="row" style="margin-top:8px"><input class="input num" style="max-width:120px;min-height:40px" inputmode="decimal" data-kg="${i.id}" value="${L.kg}" placeholder="kg"><span class="tiny muted">kg de travail</span></div>` : ""}
      <div class="sets">${L.sets.map((_, k) => `<button type="button" class="set" data-set="${i.id}:${k}" aria-pressed="false">Série ${k + 1}</button>`).join("")}</div>
    </div>`;
  };

  const body = openSheet(`Prépa physique · ${S.title}`, `
    <div class="row" style="gap:6px;flex-wrap:wrap"><span class="badge tiny">${esc(S.focus)}</span><span class="badge tiny">Phase : ${esc(B.phase.label)}</span>${home ? `<span class="badge tiny">Version maison</span>` : ""}</div>
    <p class="muted small" style="margin-top:8px">${esc(S.why)}${block.mode === "light" ? " Forme moyenne aujourd'hui : séries réduites, charges −10 %." : ""}${p.level === 1 ? " Niveau Fondations : technique parfaite avant la charge, descente contrôlée, montée explosive." : ""}</p>
    ${B.phase.id !== "dev" ? `<p class="notice small">${esc(B.phase.text)}</p>` : ""}
    ${B.changes.length ? `<div class="notice is-warn small"><b>Séance adaptée${B.zones.length ? ` à ${esc(B.zones.map((z) => z.toLowerCase()).join(", "))}` : ""}${B.qual.priority ? `${B.zones.length ? " et" : ""} à ton profil` : ""}</b><ul class="bul" style="margin-top:6px">${B.changes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
    ${B.hard ? `<p class="notice is-alert small">Douleur (${esc(B.acute.join(", ").toLowerCase())}) notée ce matin à 5 sur 10 ou plus : si elle persiste plus de quelques jours, va voir un kiné ou un médecin.</p>` : ""}
    <div class="panel small" style="margin-top:10px;padding:12px"><b>Échauffement</b> · ${esc(WARMUP)}</div>
    ${B.sections.map((sec) => sec.items.length ? `<h3 class="sys-h">${esc(sec.title)}</h3><p class="tiny muted" style="margin:0 0 6px">${esc(sec.hint)}</p><div class="panel" style="padding:4px 16px">${sec.items.map(exHtml).join("")}</div>` : "").join("")}
    ${block.kind === "volume" ? `<div class="panel" style="margin-top:12px"><h3>Cardio de fin de séance</h3><p class="muted small" style="margin-top:4px">${B.qual.priority === "cardio" ? "Priorité endurance : 6 × 1 min fort, 1 min léger, puis 2 × 5 min au rythme d'un combat." : "Rameur, ski erg ou vélo : 3 × 5 min au rythme d'un combat, 1 min de repos."} Les jours lourd et rapide, pas de cardio long juste après : il réduit les gains de force et de puissance.</p></div>` : ""}
    <p class="hint">${esc(PAIN_RULE)}</p>
    <div style="margin-top:16px"><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Intensité ressentie de la séance</span>${rpePicker(rpe)}</div>
    <button class="btn tape-btn block" data-finish style="margin-top:16px">Terminer la séance</button>`);

  body.addEventListener("input", (e) => { const id = e.target.dataset.kg; if (id) log[id].kg = e.target.value; });
  body.addEventListener("click", (e) => {
    const s = e.target.closest("[data-set]");
    if (s) { const [id, k] = s.dataset.set.split(":"); log[id].sets[k] = !log[id].sets[k]; s.setAttribute("aria-pressed", log[id].sets[k]); }
    const r = e.target.closest("[data-rpe]");
    if (r) { rpe = Number(r.dataset.rpe); body.querySelectorAll("[data-rpe]").forEach((x) => x.setAttribute("aria-pressed", x === r)); }
    if (e.target.closest("[data-finish]")) {
      store.update((s2) => {
        s2.lifts ||= {};
        all.forEach((i) => {
          const L = log[i.id]; const kg = Number(String(L.kg).replace(",", "."));
          if (kg > 0) {
            const allDone = L.sets.every(Boolean);
            const kgBase = block.mode === "light" ? kg / 0.9 : kg; // on garde la référence pleine charge
            const reps = Number(i.reps);
            s2.lifts[i.id] = { kg: kgBase, allDone: allDone && block.mode !== "light", rpe, date: key, e1rm: reps ? brzycki(kg, reps) : null };
          }
        });
      });
      markDone(key, block.id, { title: `Prépa physique · ${S.title}`, type: "strength", minutes: 60, rpe });
      closeSheet(); toast("Séance de force enregistrée"); after?.();
    }
  });
}

// ---------- programme de prévention par zone ----------
export function openPrehab(zone, after) {
  const P = PREHAB[zone];
  const body = openSheet(`Renforcer : ${zone.toLowerCase()}`, `
    <p class="small">${esc(P.why)}</p>
    <div class="panel" style="padding:4px 16px;margin-top:10px">${P.items.map(([n, d]) => `<div class="ex"><div class="ex-head"><span class="ex-name">${esc(n)}</span><span class="ex-presc">${esc(d)}</span></div>${guideInline(n)}</div>`).join("")}</div>
    <p class="hint">${esc(PAIN_RULE)}</p>
    <p class="hint">À faire 2 à 3 fois par semaine, en fin d'entraînement ou les jours sans prépa physique. Douleur importante, gonflement ou instabilité : avis médical d'abord.</p>
    <button class="btn tape-btn block" data-done style="margin-top:12px">C'est fait</button>`);
  body.querySelector("[data-done]").addEventListener("click", () => {
    store.update((s) => { const day = ensureDay(s, todayKey()); day.logs = [...day.logs, { id: `prehab-${zone}-${Date.now()}`, at: new Date().toISOString(), title: `Prévention · ${zone}`, type: "prehab", minutes: 12, rpe: 3 }]; });
    closeSheet(); toast("Prévention notée"); after?.();
  });
}

export function openBlock(key, block, after, go) {
  if (block.type === "mobility" || block.type === "movement") return openRoutine(key, block, after);
  if (block.type === "strength") return openStrength(key, block, after);
  if (block.type === "drills") return go?.("train");
  return openLog(key, block, after);
}
