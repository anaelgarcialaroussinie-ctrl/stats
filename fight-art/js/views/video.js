// Coach perso vidéo : on extrait quelques images d'une vidéo, le téléphone estime la posture (MediaPipe),
// et on peut tout envoyer au coach perso (l'assistant) pour une analyse détaillée.
import { store, todayKey } from "../store.js";
import { esc, icon, openSheet, closeSheet, toast } from "../ui.js";
import { sync } from "../sync.js";

const MP = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";
const MODEL = "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
let landmarker = null;
async function getLandmarker() {
  if (landmarker) return landmarker;
  const { FilesetResolver, PoseLandmarker } = await import(`${MP}/vision_bundle.mjs`);
  const vision = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
  const make = (delegate) => PoseLandmarker.createFromOptions(vision, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: "IMAGE", numPoses: 1 });
  try { landmarker = await make("GPU"); } catch { landmarker = await make("CPU"); }
  return landmarker;
}

export const KINDS = [
  { id: "garde", label: "Ma garde debout", hint: "Filme-toi en garde, corps entier, de face puis de profil, en bougeant un peu." },
  { id: "lutte", label: "Ma posture de lutte", hint: "Filme-toi en posture de lutte et pendant tes entrées (pas de pénétration), de profil." },
  { id: "technique", label: "Une technique", hint: "Filme la technique en entier, de profil si possible. Choisis les images clés." },
];

const P = (lm, i, W, H) => ({ x: lm[i].x * W, y: lm[i].y * H, v: lm[i].visibility ?? 1 });
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const angle = (a, b, c) => { const v1 = [a.x - b.x, a.y - b.y], v2 = [c.x - b.x, c.y - b.y]; const d = (v1[0] * v2[0] + v1[1] * v2[1]) / (Math.hypot(...v1) * Math.hypot(...v2) || 1); return Math.acos(Math.max(-1, Math.min(1, d))) * 180 / Math.PI; };

// mesures sur une image (coordonnées en pixels)
export function measure(lm, W, H, kind) {
  const g = (i) => P(lm, i, W, H);
  const [nose, mL, mR, sL, sR, eL, eR, wL, wR, hL, hR, kL, kR, aL, aR] = [0, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].map(g);
  const seen = (...ps) => ps.every((p) => p.v > 0.5);
  const sMid = { x: (sL.x + sR.x) / 2, y: (sL.y + sR.y) / 2 }, hMid = { x: (hL.x + hR.x) / 2, y: (hL.y + hR.y) / 2 };
  const torso = dist(sMid, hMid) || 1, shW = dist(sL, sR);
  const profile = shW < 0.45 * torso;
  const out = [];
  const mouthY = (mL.y + mR.y) / 2;
  if (kind !== "lutte" && seen(wL, wR, mL, mR)) {
    const low = [["gauche", wL], ["droite", wR]].filter(([, w]) => w.y > mouthY + 0.18 * torso).map(([s]) => s);
    out.push(low.length ? { k: "mains", ok: false, t: `Main ${low.join(" et ")} basse : sous le menton.`, tip: "Les deux poings reviennent à hauteur de pommettes après chaque coup." } : { k: "mains", ok: true, t: "Mains hautes, à hauteur du visage." });
  }
  if (kind !== "lutte" && !profile && seen(eL, eR, sL, sR)) {
    const wide = Math.max(Math.abs(eL.x - sL.x), Math.abs(eR.x - sR.x)) > 0.55 * shW;
    out.push(wide ? { k: "coudes", ok: false, t: "Coudes écartés du corps.", tip: "Coudes serrés devant les côtes : ils protègent le foie et ferment le chemin des uppercuts." } : { k: "coudes", ok: true, t: "Coudes près du corps." });
  }
  if (seen(aL, aR)) {
    const r = profile ? Math.abs(aL.x - aR.x) / torso : dist(aL, aR) / (shW || 1);
    if (profile) out.push(r < 0.6 ? { k: "appuis", ok: false, t: "Pieds trop rapprochés dans l'axe : peu de base.", tip: "Un pas de profondeur entre les pieds, pour pouvoir avancer, reculer et sprawler." } : r > 1.6 ? { k: "appuis", ok: false, t: "Appuis très longs : base lente à déplacer.", tip: "Raccourcis un peu la garde pour bouger plus vite." } : { k: "appuis", ok: true, t: "Profondeur des appuis correcte." });
    else out.push(r < 0.9 ? { k: "appuis", ok: false, t: "Pieds trop serrés (moins que la largeur d'épaules).", tip: "Pieds au moins à la largeur des épaules pour la stabilité et la défense de lutte." } : r > 2.1 ? { k: "appuis", ok: false, t: "Appuis très larges.", tip: "Trop large : tu perds en mobilité. Reviens vers 1 à 1,5 largeur d'épaules." } : { k: "appuis", ok: true, t: "Largeur des appuis correcte." });
  }
  // la flexion des genoux et l'inclinaison du buste ne se lisent que de profil
  if (profile && (seen(hL, kL, aL) || seen(hR, kR, aR))) {
    const ang = Math.min(seen(hL, kL, aL) ? angle(hL, kL, aL) : 999, seen(hR, kR, aR) ? angle(hR, kR, aR) : 999);
    if (kind === "lutte") out.push(ang > 150 ? { k: "genoux", ok: false, t: `Jambes peu fléchies (${Math.round(ang)}°) pour une posture de lutte.`, tip: "Descends le niveau avec les jambes, hanches sous toi, sans pencher le dos." } : { k: "genoux", ok: true, t: `Bonne flexion des jambes (${Math.round(ang)}°).` });
    else out.push(ang > 168 ? { k: "genoux", ok: false, t: `Jambes presque tendues (${Math.round(ang)}°).`, tip: "Genoux légèrement fléchis : tu réagis plus vite et tu défends mieux les amenées." } : ang < 120 ? { k: "genoux", ok: false, t: `Très fléchi (${Math.round(ang)}°) pour une garde debout.`, tip: "Garde un peu plus haute pour bouger et frapper." } : { k: "genoux", ok: true, t: `Genoux souples (${Math.round(ang)}°).` });
  }
  if (profile && seen(sL, sR, hL, hR)) {
    const lean = Math.abs(Math.atan2(sMid.x - hMid.x, hMid.y - sMid.y) * 180 / Math.PI);
    if (kind === "lutte") out.push(lean > 55 ? { k: "dos", ok: false, t: `Buste très penché (${Math.round(lean)}°).`, tip: "Dos plus droit, tête haute : sinon genou et guillotine." } : { k: "dos", ok: true, t: `Buste bien placé (${Math.round(lean)}°).` });
    else if (lean > 30) out.push({ k: "dos", ok: false, t: `Buste penché (${Math.round(lean)}°).`, tip: "Buste plus droit, poids au centre : tu restes mobile et moins exposé aux genoux." });
    if (kind === "lutte" && seen(nose)) out.push(nose.y > sMid.y + 0.05 * torso ? { k: "tete", ok: false, t: "Tête plus basse que les épaules.", tip: "Tête haute, regard devant : la tête basse ouvre la guillotine et le front headlock." } : { k: "tete", ok: true, t: "Tête haute." });
  }
  if (!profile && kind !== "garde") out.push({ k: "vue", ok: false, t: "Image de face : les angles des genoux et du dos ne se mesurent bien que de profil.", tip: "Ajoute une image filmée de profil." });
  return { profile, items: out };
}

function drawSkeleton(ctx, lm, W, H) {
  const pairs = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
  ctx.lineWidth = Math.max(2, W / 180); ctx.strokeStyle = "#B8F34B"; ctx.fillStyle = "#B8F34B";
  pairs.forEach(([a, b]) => { if ((lm[a].visibility ?? 1) > 0.5 && (lm[b].visibility ?? 1) > 0.5) { ctx.beginPath(); ctx.moveTo(lm[a].x * W, lm[a].y * H); ctx.lineTo(lm[b].x * W, lm[b].y * H); ctx.stroke(); } });
  [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach((i) => { if ((lm[i].visibility ?? 1) > 0.5) { ctx.beginPath(); ctx.arc(lm[i].x * W, lm[i].y * H, ctx.lineWidth * 1.4, 0, Math.PI * 2); ctx.fill(); } });
}

export function openVideoCoach(after) {
  let kind = "garde", frames = [], url = null;
  const body = openSheet("Analyse vidéo", "");
  const cleanup = () => { if (url) URL.revokeObjectURL(url); };
  const drawStart = () => {
    body.innerHTML = `
      <p class="small" style="margin-top:0">Ton coach perso regarde ta posture : le téléphone repère ton squelette sur quelques images, mesure ta garde, tes appuis et tes angles, puis tu peux envoyer le tout pour une analyse détaillée.</p>
      <div class="chips">${KINDS.map((k) => `<button class="chip" data-kind="${k.id}" aria-pressed="${k.id === kind}">${esc(k.label)}</button>`).join("")}</div>
      <p class="hint">${esc(KINDS.find((k) => k.id === kind).hint)} Bonne lumière, une seule personne dans l'image.</p>
      <label class="btn tape-btn block" style="margin-top:12px">${icon("camera")} Choisir ou filmer une vidéo<input type="file" accept="video/*" data-file hidden></label>
      <p class="hint">La vidéo reste sur ton téléphone : seules les images que tu choisis (4 au maximum) sont envoyées si tu demandes l'analyse du coach perso.</p>`;
  };
  const drawPick = () => {
    body.innerHTML = `
      <video data-v src="${url}" playsinline muted controls style="width:100%;border-radius:14px;background:#000;max-height:46vh"></video>
      <div class="row" style="gap:8px;margin-top:10px"><button class="btn small" data-cap>${icon("camera")} Prendre cette image</button><button class="btn ghost small" data-auto>4 images automatiques</button></div>
      <p class="hint">Mets la vidéo sur pause aux moments clés (garde installée, entrée, fin de technique) et prends l'image. ${frames.length}/4.</p>
      <div class="frames">${frames.map((f, i) => `<div class="frame"><img src="${f.url}" alt="Image ${i + 1}"><button class="icon-btn" data-rm="${i}" aria-label="Retirer">${icon("close")}</button></div>`).join("")}</div>
      <button class="btn tape-btn block" data-analyse style="margin-top:12px" ${frames.length ? "" : "disabled"}>Analyser ma posture</button>`;
  };
  const capture = (video) => {
    const W = 360, H = Math.round(W * video.videoHeight / video.videoWidth) || 640;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    c.getContext("2d").drawImage(video, 0, 0, W, H);
    frames.push({ url: c.toDataURL("image/jpeg", 0.62), canvas: c });
  };
  const seek = (v, t) => new Promise((res) => { const h = () => { v.removeEventListener("seeked", h); res(); }; v.addEventListener("seeked", h); v.currentTime = t; });

  const analyse = async () => {
    body.innerHTML = `<p class="muted small">Analyse en cours : chargement du détecteur de posture (la première fois, quelques secondes)…</p>`;
    let lmk = null;
    try { lmk = await getLandmarker(); } catch { lmk = null; }
    const results = [];
    for (const f of frames) {
      let r = null;
      if (lmk) { try { const out = lmk.detect(f.canvas); const lm = out.landmarks?.[0]; if (lm) { r = measure(lm, f.canvas.width, f.canvas.height, kind); const c2 = document.createElement("canvas"); c2.width = f.canvas.width; c2.height = f.canvas.height; const ctx = c2.getContext("2d"); ctx.drawImage(f.canvas, 0, 0); drawSkeleton(ctx, lm, c2.width, c2.height); r.overlay = c2.toDataURL("image/jpeg", 0.7); } } catch { r = null; } }
      results.push(r);
    }
    // synthèse : un point est « à corriger » s'il l'est sur au moins la moitié des images où il est mesuré
    const agg = {};
    results.filter(Boolean).forEach((r) => r.items.forEach((it) => { (agg[it.k] ||= []).push(it); }));
    const summary = Object.values(agg).map((list) => { const bad = list.filter((x) => !x.ok); return bad.length >= list.length / 2 && bad.length ? bad[0] : list.find((x) => x.ok) || list[0]; });
    const txt = summary.length ? summary.map((s) => `${s.ok ? "OK" : "À corriger"} : ${s.t}`).join("\n") : "";
    store.update((st) => { st.videoChecks = [...(st.videoChecks || []).slice(-19), { date: todayKey(), kind, summary: summary.map((s) => ({ ok: s.ok, t: s.t })) }]; });
    const live = sync.connected() && !window.FAP_PREVIEW;
    body.innerHTML = `
      ${!lmk ? `<p class="notice is-warn small">Le détecteur de posture n'a pas pu se charger (connexion ou téléphone trop ancien). Tu peux quand même envoyer tes images au coach perso.</p>` : !results.some(Boolean) ? `<p class="notice is-warn small">Aucun corps détecté : filme-toi en entier, de plus loin, avec une bonne lumière.</p>` : ""}
      <div class="frames">${frames.map((f, i) => `<div class="frame"><img src="${results[i]?.overlay || f.url}" alt="Image ${i + 1}"></div>`).join("")}</div>
      ${summary.length ? `<h3 class="sys-h">Ce que le téléphone mesure</h3>${summary.map((s) => `<div class="vc-item ${s.ok ? "ok" : "bad"}"><b>${s.ok ? "OK" : "À corriger"}</b> · ${esc(s.t)}${s.tip ? `<div class="tiny" style="margin-top:4px">${esc(s.tip)}</div>` : ""}</div>`).join("")}
        <p class="hint">Mesures automatiques sur une vidéo en 2D : approximatives (angle de la caméra, vêtements, mouvement). À confirmer avec ton coach.</p>` : ""}
      <h3 class="sys-h">Analyse détaillée par ton coach perso</h3>
      <label class="field"><span>Ta question</span><textarea class="input" data-q rows="3" placeholder="Ex. Est-ce que ma garde est assez fermée ? Je me fais toucher au crochet."></textarea></label>
      <label class="row small" style="margin-top:8px"><input type="checkbox" data-share checked style="width:20px;height:20px"><span>Mon coach peut voir ma question et la réponse</span></label>
      <button class="btn tape-btn block" data-send style="margin-top:10px" ${live ? "" : "disabled"}>Envoyer images et mesures au coach perso</button>
      ${live ? `<p class="hint">Réponse dans « Mes questions » de l'assistant, en général dans l'heure, entre 8 h et minuit.</p>` : `<p class="hint">Relie ton téléphone à l'équipe pour envoyer l'analyse.</p>`}
      <button class="btn ghost block" data-again style="margin-top:8px">Analyser une autre vidéo</button>`;
    body.querySelector("[data-again]").addEventListener("click", () => { frames = []; cleanup(); url = null; drawStart(); });
    body.querySelector("[data-send]")?.addEventListener("click", async (e) => {
      const q = body.querySelector("[data-q]").value.trim();
      const k = KINDS.find((x) => x.id === kind).label;
      const text = `Analyse vidéo : ${k}.\n${q ? `Ma question : ${q}\n` : ""}${txt ? `Mesures automatiques (approximatives) :\n${txt}` : "Pas de mesure automatique disponible."}`;
      e.target.disabled = true; e.target.textContent = "Envoi…";
      try { await sync.askFrames("video", text, body.querySelector("[data-share]").checked, frames.map((f) => f.url)); toast("Envoyé au coach perso"); cleanup(); closeSheet(); after?.(); }
      catch (x) { e.target.disabled = false; e.target.textContent = "Envoyer images et mesures au coach perso"; toast(x.code === "too_many" ? "Limite de questions atteinte aujourd'hui" : "Envoi impossible : vérifie ta connexion"); }
    });
  };

  body.addEventListener("click", async (e) => {
    const k = e.target.closest("[data-kind]"); if (k) { kind = k.dataset.kind; drawStart(); return; }
    const v = body.querySelector("[data-v]");
    if (e.target.closest("[data-cap]") && v) { if (frames.length >= 4) { toast("4 images maximum"); return; } if (!v.videoWidth) { toast("Lance la vidéo puis mets sur pause"); return; } capture(v); const t = v.currentTime; drawPick(); body.querySelector("[data-v]").currentTime = t; return; }
    if (e.target.closest("[data-auto]") && v) {
      if (!v.duration || !isFinite(v.duration)) { toast("Vidéo en cours de chargement"); return; }
      frames = []; for (const r of [0.15, 0.38, 0.62, 0.85]) { await seek(v, v.duration * r); capture(v); } drawPick(); return;
    }
    const rm = e.target.closest("[data-rm]"); if (rm) { frames.splice(Number(rm.dataset.rm), 1); drawPick(); return; }
    if (e.target.closest("[data-analyse]")) analyse();
  });
  body.addEventListener("change", (e) => {
    const f = e.target.closest("[data-file]"); if (!f || !f.files?.[0]) return;
    cleanup(); url = URL.createObjectURL(f.files[0]); frames = []; drawPick();
  });
  drawStart();
}
