// Labo de style : on mélange plusieurs combattants UFC, on croise avec le profil du fighter, et on en tire un style.
import { store, uid, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { morphology, findClass } from "../engine.js";
import { loadFighters, faceSlot, fillFaces, inspirations, bars, pct, n1, FIN_LINK, favorites } from "./models.js";
import { openDiscussion } from "./discussion.js";
import { openExplorer } from "./systems.js";
import { QUESTIONS } from "../discussion-data.js";
import { badgeLabel } from "./identity.js";

const KEYS = ["slpm", "sapm", "acc", "head", "body", "leg", "dist", "clinch", "ground", "td15", "tdacc", "tdd", "ctrl", "sub15", "kd15", "sdef"];
const mean = (xs) => { const v = xs.filter((x) => x != null && !isNaN(x)); return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null; };

const ARCH = {
  volume: { label: "Striker de volume", suffix: "au volume de frappe", drills: ["Boxe", "Transitions MMA"], questions: ["Jab, direct, crochet, direct", "Double jab, direct"], weapons: ["lhookend", "checkhook", "liver"], techs: ["jab", "cross"], base: ["striking"], badges: ["boxe", "kick", "volume"] },
  kick: { label: "Kickeur technique", suffix: "qui travaille les jambes", drills: ["Kickboxing et muay thaï", "Boxe"], questions: ["Low kicks répétés", "Jab, direct, feinte de low"], weapons: ["highkick", "qmark", "switch"], techs: ["calf", "lowkick"], base: ["striking"], badges: ["kick", "thai", "karate"] },
  clinch: { label: "Combattant de clinch et de pression", suffix: "de clinch et de pression", drills: ["Kickboxing et muay thaï", "Transitions MMA"], questions: ["Clinch, genoux au corps", "Jab, jab, pression vers la cage"], weapons: ["kneeclinch", "elbow", "uppercut"], techs: ["clinch", "bodylock"], base: ["striking", "wrestling"], badges: ["clinch", "pression", "thai"] },
  wrestle: { label: "Lutteur dominant", suffix: "qui lutte et contrôle", drills: ["Lutte et Luta Livre debout", "Transitions MMA"], questions: ["Frappe pour faire réagir le lutteur", "Jab, jab, pression vers la cage"], weapons: ["double", "guillotine"], techs: ["double", "single", "bodylock", "gnp"], base: ["wrestling"], badges: ["lutte", "cage", "gnp"] },
  grapple: { label: "Grappler soumission", suffix: "qui cherche la soumission", drills: ["Au sol", "Lutte et Luta Livre debout"], questions: ["Frappe pour faire réagir le lutteur"], weapons: ["guillotine", "double"], techs: ["frontheadlock", "back", "rnc"], base: ["grappling"], badges: ["grappler", "luta", "jjb", "soum"] },
};

export async function blend(names) {
  const db = await loadFighters();
  const fs = names.map((n) => db.f.find((x) => x.n === n)).filter(Boolean);
  const b = Object.fromEntries(KEYS.map((k) => [k, mean(fs.map((f) => f[k]))]));
  const a = Object.fromEntries(KEYS.map((k) => [k, mean(fs.map((f) => db.avg[f.wc]?.[k]))]));
  const all = db.f;
  const g = Object.fromEntries(KEYS.map((k) => { const v = all.map((f) => f[k]).filter((x) => x != null); const m = mean(v); const sd = Math.sqrt(mean(v.map((x) => (x - m) ** 2))) || 1; return [k, { m, sd }]; }));
  const z = (k) => (b[k] == null ? 0 : (b[k] - g[k].m) / g[k].sd);
  const scores = { volume: z("slpm") + 0.5 * z("dist"), kick: z("leg") + 0.5 * z("dist"), clinch: z("clinch") + 0.3 * z("slpm"), wrestle: z("td15") + z("ctrl"), grapple: z("sub15") + 0.5 * z("ctrl") };
  const order = Object.entries(scores).sort((x, y) => y[1] - x[1]);
  const fins = {};
  fs.forEach((f) => f.fin.forEach(([t, c]) => { fins[t] = (fins[t] || 0) + c; }));
  return {
    fs, b, a, primary: order[0][0], secondary: order[1][1] > 0.25 ? order[1][0] : null,
    ko: fs.reduce((t, f) => t + f.ko, 0), sub: fs.reduce((t, f) => t + f.sub, 0), dec: fs.reduce((t, f) => t + f.dec, 0),
    fins: Object.entries(fins).sort((x, y) => y[1] - x[1]).slice(0, 6),
    h: mean(fs.map((f) => f.h)), r: mean(fs.map((f) => f.r)), stances: [...new Set(fs.map((f) => f.st).filter(Boolean))],
  };
}

export const styleName = (B) => `${ARCH[B.primary].label}${B.secondary ? `, ${ARCH[B.secondary].suffix}` : ""}`;

// ce que ça donne pour moi
function fit(B, p) {
  const out = [];
  const A = ARCH[B.primary];
  const mo = morphology(p);
  const cl = findClass(p);
  if (p.height && p.reach && B.h && B.r) {
    const myApe = p.reach - p.height, theirApe = B.r - B.h;
    if (myApe >= theirApe + 3) out.push(`Ton allonge est grande pour ta taille (+${Math.round(myApe)} cm), plus que la moyenne de tes modèles (+${Math.round(theirApe)} cm) : le jeu à distance te sera encore plus naturel.`);
    else if (myApe <= theirApe - 3) out.push(`Ton allonge relative (${myApe >= 0 ? "+" : ""}${Math.round(myApe)} cm) est plus courte que celle de tes modèles (+${Math.round(theirApe)} cm) : ${["volume", "kick"].includes(B.primary) ? "pour leur jeu de distance, compense par les déplacements et les entrées en angle." : "leur jeu de corps à corps te convient bien."}`);
    else out.push(`Ton rapport taille-allonge est proche de celui de tes modèles : leur façon de gérer la distance est transposable.`);
  }
  if (mo && cl) {
    const distanceStyle = ["volume", "kick"].includes(B.primary);
    if (mo.hBand === "petit" && distanceStyle) out.push(`Tu es plutôt petit pour les ${cl.label} : un style de distance te demandera un excellent jeu de jambes. Ajoute de la pression et des entrées de lutte comme plan B.`);
    if (mo.hBand === "grand" && !distanceStyle) out.push(`Tu es plutôt grand pour les ${cl.label} : ce style de corps à corps marche, mais garde un jab et des coups de pied longs pour ne pas gâcher ton allonge.`);
    if (mo.hBand === "petit" && !distanceStyle) out.push(`Plutôt petit pour les ${cl.label} : à l'UFC, les combattants de pression et de lutte sont souvent plus petits que leur catégorie. Ce style colle à ton gabarit.`);
    if (mo.hBand === "grand" && distanceStyle) out.push(`Plutôt grand pour les ${cl.label} : le jeu de distance de ce style colle à ton gabarit.`);
  }
  const ORIG = { striking: "boxe, kick ou muay thaï", wrestling: "lutte, judo ou sambo", grappling: "jiu-jitsu ou Luta Livre" };
  if (p.origin && p.origin !== "none") out.push(A.base.includes(p.origin) ? `Ta base en ${ORIG[p.origin]} est un vrai atout pour ce style.` : `Ta base en ${ORIG[p.origin]} n'est pas le cœur de ce style : c'est elle qui fera ta différence, pendant que tu construis le reste.`);
  const match = (p.badges || []).filter((b) => A.badges.includes(b));
  if (match.length) out.push(`Tes insignes ${match.map((b) => `« ${badgeLabel(b)} »`).join(" et ")} vont dans le sens de ce style.`);
  if (!out.length) out.push("Complète ta taille, ton allonge et ton passé sportif dans ton profil pour voir comment ce style colle à ton gabarit.");
  return out;
}

export async function openStyle(style, onTrap, after) {
  const s = { ...style };
  const body = openSheet("Mon style", `<p class="muted small">Analyse en cours…</p>`);
  let B; try { B = await blend(s.fighters); } catch { body.innerHTML = `<p class="notice is-warn small">Impossible de charger les données UFC. Vérifie ta connexion.</p>`; return; }
  if (B.fs.length < 2) { body.innerHTML = `<p class="muted">Il faut au moins deux combattants.</p>`; return; }
  const p = store.get().profile || {};
  const A = ARCH[B.primary];
  if (!s.name) s.name = styleName(B);
  const saved = (store.get().styles || []).some((x) => x.id === s.id);
  const ideas = inspirations(B.b, B.a);
  const total = Math.max(1, B.ko + B.sub + B.dec);
  const qs = A.questions.map((n) => QUESTIONS.findIndex((q) => q.name === n)).filter((i) => i >= 0);
  body.innerHTML = `
    <div class="faces-row" style="margin-bottom:10px">${B.fs.map((f) => faceSlot(f.n)).join("")}</div>
    <div class="tiny muted">${esc(B.fs.map((f) => f.n).join(" + "))}</div>
    <label class="field" style="margin-top:10px"><span>Nom du style</span><input class="input" data-name maxlength="80" value="${esc(s.name)}"></label>
    <p class="small" style="margin-top:8px">Profil dominant : <b>${esc(A.label)}</b>${B.secondary ? `, avec une touche de <b>${esc(ARCH[B.secondary].label.toLowerCase())}</b>` : ""}.</p>

    <h3 class="sys-h">Comment ce style gagne</h3>
    <div class="winbar"><i class="ko" style="flex:${B.ko}"></i><i class="sub" style="flex:${B.sub}"></i><i class="dec" style="flex:${B.dec}"></i></div>
    <div class="row small" style="gap:14px;margin-top:6px;flex-wrap:wrap"><span><span class="dot ko"></span> KO ${Math.round(B.ko / total * 100)} %</span><span><span class="dot sub"></span> Soumission ${Math.round(B.sub / total * 100)} %</span><span><span class="dot dec"></span> Décision ${Math.round(B.dec / total * 100)} %</span></div>

    ${ideas.length ? `<h3 class="sys-h">Les piliers du style</h3><div class="stack" style="gap:8px">${ideas.map((i) => `<section class="panel" style="padding:12px"><p class="small" style="margin:0">${esc(i.text.replace(/^Il /, "Ce style ").replace(/ il /g, " ce style "))}</p>${i.act ? `<button class="link" data-go="${i.act[0]}|${i.act[1]}" style="margin-top:6px">${esc(i.cta)} →</button>` : ""}</section>`).join("")}</div>` : ""}

    <h3 class="sys-h">Pour toi</h3>
    <ul class="bul">${fit(B, p).map((x) => `<li class="small">${esc(x)}</li>`).join("")}</ul>

    ${B.fins.length ? `<h3 class="sys-h">L'arsenal de finition</h3><div class="stack" style="gap:6px">${B.fins.map(([t, c]) => { const lk = FIN_LINK[t]; return `<div class="row between small"><span>${esc(t)} <span class="muted">× ${c}</span></span>${lk ? `<button class="link" data-go="${lk[0]}|${lk[1]}">Voir la fiche</button>` : ""}</div>`; }).join("")}</div>` : ""}

    <h3 class="sys-h">Où et d'où ce style frappe</h3>
    ${bars([["Tête", B.b.head, B.a.head], ["Corps", B.b.body, B.a.body], ["Jambes", B.b.leg, B.a.leg]])}
    ${bars([["Distance", B.b.dist, B.a.dist], ["Clinch", B.b.clinch, B.a.clinch], ["Sol", B.b.ground, B.a.ground]])}
    <p class="tiny muted">Moyenne de tes modèles ; le trait blanc marque la moyenne de leurs catégories.</p>
    <table class="stats"><tbody>
      <tr><td>Frappes placées par minute</td><td class="num"><b>${n1(B.b.slpm)}</b></td></tr>
      <tr><td>Frappes évitées</td><td class="num"><b>${pct(B.b.sdef)}</b></td></tr>
      <tr><td>Amenées tentées par 15 min</td><td class="num"><b>${n1(B.b.td15)}</b></td></tr>
      <tr><td>Défense d'amenée</td><td class="num"><b>${pct(B.b.tdd)}</b></td></tr>
      <tr><td>Temps en contrôle</td><td class="num"><b>${pct(B.b.ctrl)}</b></td></tr>
      <tr><td>Soumissions tentées par 15 min</td><td class="num"><b>${n1(B.b.sub15)}</b></td></tr>
    </tbody></table>

    <h3 class="sys-h">Le plan pour le construire</h3>
    <div class="stack" style="gap:8px">
      <div class="small"><b>Drills solo</b> : ${A.drills.map(esc).join(", ")} (onglet Séances).</div>
      ${qs.length ? `<div class="small"><b>Combinaisons à travailler</b> : ${qs.map((i) => `<button class="link" data-q="${i}">${esc(QUESTIONS[i].name)}</button>`).join(" · ")}</div>` : ""}
      <div class="small"><b>Armes décisives</b> : ${A.weapons.map((w) => `<button class="link" data-go="w|${w}">${esc(w === "lhookend" ? "Crochet en fin de combinaison" : w === "checkhook" ? "Check hook" : w === "liver" ? "Crochet au foie" : w === "highkick" ? "High kick" : w === "qmark" ? "Point d'interrogation" : w === "switch" ? "Switch kick" : w === "kneeclinch" ? "Genou au clinch" : w === "elbow" ? "Coude" : w === "uppercut" ? "Uppercut" : w === "double" ? "Double-leg" : "Guillotine")}</button>`).join(" · ")}</div>
      <div class="small"><b>Systèmes à construire</b> : ${A.techs.map((t) => `<button class="link" data-go="t|${t}">${esc({ jab: "Jab", cross: "Direct", calf: "Low kick au mollet", lowkick: "Low kick", clinch: "Entrée au clinch", bodylock: "Ceinture arrière", double: "Double-leg", single: "Single-leg", gnp: "Ground and pound", frontheadlock: "Front headlock", back: "Prise de dos", rnc: "Étranglement arrière" }[t] || t)}</button>`).join(" · ")}</div>
    </div>

    <div class="stack" style="margin-top:16px">
      <button class="btn tape-btn block" data-save>${saved ? "Enregistrer les changements" : "Garder ce style"}</button>
      <button class="btn ghost block" data-main>${p.styleName === s.name ? "Affiché sur mon profil" : "Afficher sur mon profil"}</button>
      <button class="btn ghost block" data-remix>Modifier le mélange</button>
      ${saved ? `<button class="btn ghost block" data-del style="color:var(--bad)">Supprimer ce style</button>` : ""}
    </div>
    <p class="hint">Un style est une piste de travail tirée des statistiques, pas une vérité : teste-le en sparring à thème et ajuste avec ton coach.</p>`;
  fillFaces(body);
  const save = () => { s.name = body.querySelector("[data-name]").value.trim() || styleName(B); s.updatedAt = todayKey(); store.update((st) => { st.styles = [...(st.styles || []).filter((x) => x.id !== s.id), { id: s.id, name: s.name, fighters: s.fighters, createdAt: s.createdAt || todayKey(), updatedAt: s.updatedAt }]; }); };
  body.addEventListener("click", (e) => {
    const g = e.target.closest("[data-go]");
    if (g) { const [type, id] = g.dataset.go.split("|"); if (type === "w") openDiscussion({ w: id }, onTrap); if (type === "d") openDiscussion({ tab: id }, onTrap); if (type === "t") openExplorer(id, after); return; }
    const q = e.target.closest("[data-q]"); if (q) { openDiscussion({ q: Number(q.dataset.q) }, onTrap); return; }
    if (e.target.closest("[data-save]")) { save(); toast("Style enregistré"); closeSheet(); after?.(); return; }
    if (e.target.closest("[data-main]")) { save(); store.update((st) => { st.profile = { ...st.profile, styleName: s.name }; }); toast("Style affiché sur ton profil"); closeSheet(); after?.(); return; }
    if (e.target.closest("[data-remix]")) { openStyleLab(s, onTrap, after); return; }
    const d = e.target.closest("[data-del]");
    if (d) { if (!d.dataset.armed) { d.dataset.armed = "1"; d.textContent = "Confirmer la suppression"; return; } store.update((st) => { st.styles = (st.styles || []).filter((x) => x.id !== s.id); if (st.profile?.styleName === s.name) delete st.profile.styleName; }); closeSheet(); toast("Style supprimé"); after?.(); }
  });
}

export function openStyleLab(existing, onTrap, after) {
  const s = existing ? { ...existing, fighters: [...existing.fighters] } : { id: uid(), name: "", fighters: [...favorites()].slice(0, 4), createdAt: todayKey() };
  const body = openSheet("Labo de style", `<p class="muted small">Chargement…</p>`);
  let q = "";
  loadFighters().then((db) => {
    const draw = () => {
      const pool = q ? db.f.filter((f) => f.n.toLowerCase().includes(q)).slice(0, 12) : favorites().map((n) => db.f.find((f) => f.n === n)).filter(Boolean);
      body.innerHTML = `
        <p class="small" style="margin-top:0">Choisis de 2 à 6 combattants à mélanger. L'appli fait la moyenne de leurs chiffres, la croise avec ton gabarit et ton profil, et en tire un style.</p>
        <h3 class="sys-h">Mon mélange (${s.fighters.length})</h3>
        <div class="chips">${s.fighters.length ? s.fighters.map((n) => `<button class="chip" data-rm="${esc(n)}">${faceSlot(n, "face face-sm")} ${esc(n)} ✕</button>`).join("") : `<span class="muted small">Aucun combattant pour l'instant.</span>`}</div>
        <input class="input" type="search" data-search placeholder="Chercher un combattant UFC" value="${esc(q)}" style="margin-top:14px">
        <div class="tiny muted" style="margin:8px 0 4px">${q ? "Résultats" : "Mes modèles"}</div>
        ${pool.length ? `<ul class="list">${pool.map((f) => `<li role="button" tabindex="0" data-add="${esc(f.n)}">${faceSlot(f.n)}<div style="min-width:0;flex:1"><div style="font-weight:700">${esc(f.n)}</div><div class="meta">${esc(f.wc)} · ${esc(f.p)}</div></div><span class="${s.fighters.includes(f.n) ? "insigne" : "tiny muted"}">${s.fighters.includes(f.n) ? "Dans le mélange" : "Ajouter"}</span></li>`).join("")}</ul>` : `<p class="muted small">${q ? "Aucun résultat." : "Ajoute d'abord des modèles UFC, ou cherche un combattant ci-dessus."}</p>`}
        <button class="btn tape-btn block" data-mix style="margin-top:14px" ${s.fighters.length >= 2 ? "" : "disabled"}>Créer le style</button>`;
      const inp = body.querySelector("[data-search]");
      inp.addEventListener("input", () => { q = inp.value.trim().toLowerCase(); const pos = inp.selectionStart; draw(); const i2 = body.querySelector("[data-search]"); i2.focus(); i2.setSelectionRange(pos, pos); });
      fillFaces(body);
    };
    body.addEventListener("click", (e) => {
      const r = e.target.closest("[data-rm]"); if (r) { s.fighters = s.fighters.filter((n) => n !== r.dataset.rm); draw(); return; }
      const a = e.target.closest("[data-add]");
      if (a) { const n = a.dataset.add; if (s.fighters.includes(n)) s.fighters = s.fighters.filter((x) => x !== n); else if (s.fighters.length >= 6) { toast("6 combattants maximum"); return; } else s.fighters.push(n); draw(); return; }
      if (e.target.closest("[data-mix]")) { if (!existing) s.name = ""; openStyle(s, onTrap, after); }
    });
    draw();
  }).catch(() => { body.innerHTML = `<p class="notice is-warn small">Impossible de charger les données UFC. Vérifie ta connexion.</p>`; });
}
