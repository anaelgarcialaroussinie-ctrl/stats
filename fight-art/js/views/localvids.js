// Ma vidéothèque privée : les vidéos du disque dur du coach, lues directement sur l'ordinateur.
// Rien n'est envoyé en ligne : l'appli lit les fichiers sur place (Chrome ou Edge sur ordinateur).
import { esc, icon, openSheet, toast } from "../ui.js";
import { myNote, studyNotes } from "../study-notes.js";
import { store } from "../store.js";
import { PARCOURS_INTRO, PARCOURS_BELTS, resolveParcours } from "../parcours.js";
import { DISCIPLINES, classify, translateTitle, themeOf, themesOf, beltOf, BELTS, BELT_DISCS } from "../vid-classify.js";

const VIDEO = /\.(mp4|m4v|mov|webm|mkv|avi|wmv|mpg|mpeg|flv|ts)$/i;
const PLAYABLE = /\.(mp4|m4v|mov|webm|mkv)$/i;
export const localSupported = () => typeof window.showDirectoryPicker === "function";

// on garde l'accès au dossier d'une fois sur l'autre (le navigateur redemande juste l'autorisation)
const db = () => new Promise((ok, ko) => { const r = indexedDB.open("fap-local", 1); r.onupgradeneeded = () => r.result.createObjectStore("h"); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
async function saveHandle(h) { const d = await db(); await new Promise((ok, ko) => { const t = d.transaction("h", "readwrite"); try { t.objectStore("h").put(h, "dir"); } catch (e) { ko(e); return; } t.oncomplete = ok; t.onerror = ok; }); }
async function idbGet(k) { try { const d = await db(); return await new Promise((ok) => { const r = d.transaction("h").objectStore("h").get(k); r.onsuccess = () => ok(r.result); r.onerror = () => ok(undefined); }); } catch { return undefined; } }
let putT = {};
function idbPut(k, v) { clearTimeout(putT[k]); putT[k] = setTimeout(async () => { try { const d = await db(); d.transaction("h", "readwrite").objectStore("h").put(v, k); } catch {} }, 800); }
async function loadHandle() { try { const d = await db(); return await new Promise((ok) => { const r = d.transaction("h").objectStore("h").get("dir"); r.onsuccess = () => ok(r.result || null); r.onerror = () => ok(null); }); } catch { return null; } }

let files = [], root = null, fiches = {};
// fiches de travail préparées sur le disque : « Fiches Fight Art/fiches.json » à la racine du dossier choisi
async function loadFiches(dir) {
  try {
    const d = await dir.getDirectoryHandle("Fiches Fight Art");
    const f = await (await d.getFileHandle("fiches.json")).getFile();
    return JSON.parse(await f.text()) || {};
  } catch { return {}; }
}
const L = (x) => (Array.isArray(x) ? x : x ? [x] : []).filter(Boolean);
function ficheHtml(fi) {
  if (!fi) return "";
  const list = (t, a) => (L(a).length ? `<h4 class="sys-h">${t}</h4><ul class="bul">${L(a).map((x) => `<li class="small">${esc(String(x))}</li>`).join("")}</ul>` : "");
  const line = (t, v) => (v ? `<p class="small" style="margin:4px 0"><b>${t}</b> : ${esc(String(v))}</p>` : "");
  return `<section class="panel" style="margin-top:12px;padding:12px"><div class="tiny" style="font-weight:700;color:var(--tape)">Fiche de travail</div>
    ${fi.titre ? `<b>${esc(fi.titre)}</b>` : ""}
    ${fi.depart ? line("Position de départ", fi.depart) : ""}
    ${list("Points clés", fi.points_cles)}${list("Détails qui font marcher", fi.details)}${list("Erreurs fréquentes", fi.erreurs)}${list("Réactions et réponses", fi.reactions)}
    ${line("Drill solo", fi.drill_solo)}${line("Drill à deux", fi.drill_deux)}${line("Sparring à thème", fi.sparring)}
    ${list("Le système", fi.systeme)}
  </section>`;
}
async function scan(dir, onProgress) {
  const out = [];
  const SKIP = /^(\.|\$|System Volume Information$|RECYCLER$|Recovery$|Windows$|Program Files|ProgramData$|AppData$|node_modules$)/i;
  async function walk(h, path, depth) {
    if (depth > 10) return;
    try {
      for await (const [name, e] of h.entries()) {
        if (SKIP.test(name)) continue;
        if (e.kind === "directory") await walk(e, path ? `${path}/${name}` : name, depth + 1);
        else if (VIDEO.test(name)) { out.push({ path: path ? `${path}/${name}` : name, folder: path || "(racine)", name, handle: e }); if (out.length % 50 === 0) onProgress?.(out.length); }
      }
    } catch { /* dossier protégé ou illisible : on passe au suivant */ }
  }
  await walk(dir, "", 0);
  const conv = new Set(out.filter((f) => /\(lisible\)\.mp4$/i.test(f.name)).map((f) => `${f.folder}/${f.name.replace(/\s*\(lisible\)\.mp4$/i, "").toLowerCase()}`));
  for (let i = out.length - 1; i >= 0; i--) { const f = out[i]; if (!/\(lisible\)\.mp4$/i.test(f.name) && conv.has(`${f.folder}/${f.name.replace(VIDEO, "").toLowerCase()}`)) out.splice(i, 1); }
  const nat = (a, b) => a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" });
  return out.sort((a, b) => nat(a.folder, b.folder) || nat(a.name, b.name));
}
// ---- instructionals : on remonte au vrai dossier de l'instructional ----
// les dossiers « conteneurs » (00-NEW-BJJ-2024, cd01, Pack - …, Collection…) et les sous-dossiers de chapitres sont sautés
const CONTAINER = /^(0{2,}|0+[\s_-]|cd\s?\d+$|dis[ck]\s?\d*$|dvd\s?\d*$|pack\b|new[\s_-]|\d{4}$|videos?$|vids?$|bjj$|grappling$|lutte$|mma$|boxe$|boxing$|instructionals?$|seminars?$|seminaires?$|.*\b(full|complete|whole)\s+(collection|pack)\b|.*\bcollection\b|.*\bbundle\b)/i;
export function instrOf(folder) {
  if (!folder || folder === "(racine)") return { root: "(racine)", chapter: "" };
  const parts = folder.split("/");
  let i = 0;
  while (i < parts.length - 1 && CONTAINER.test(parts[i].trim())) i++;
  return { root: parts.slice(0, i + 1).join("/"), chapter: parts.slice(i + 1).join(" · ") };
}
const lastSeg = (root) => root.split("/").pop();
const titleOf = (g) => (g.loose ? `Vidéos isolées · ${lastSeg(g.root)}` : translateTitle(lastSeg(g.root)));
const dupKey = (root) => lastSeg(root).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\[[^\]]*\]|\([^)]*\)|1080p|720p|2160p|web|mp4/g, "").replace(/[^a-z0-9]/g, "");

// classement d'un instructional (dossier conteneur compris : « 00LUTTE », « 000 - MMA »… donnent la discipline)
function classifyGroup(g, over) {
  const o = over[g.root] || {};
  // le nom de l'instructional et de ses vidéos d'abord ; les dossiers parents (« 00LUTTE »…) seulement si ça ne suffit pas
  const own = `${lastSeg(g.root)} ${lastSeg(g.root)} ${g.names.slice(0, 25).join(" ")}`;
  const text = `${g.root} ${own}`;
  let auto = classify(own); if (auto.id === "autre") auto = classify(text);
  g.disc = DISCIPLINES.find((d) => d.id === (o.disc || g.cdisc)) || auto;
  g.theme = themesOf(g.disc.id).find((t) => t.id === (o.theme || g.ctheme)) || themeOf(g.disc.id, text);
  g.belt = BELT_DISCS.includes(g.disc.id) ? (BELTS.find((b) => b.id === (o.belt || g.cbelt)) || beltOf(text, g.theme.id)) : null;
  g.fixed = Boolean(over[g.root]);
  g.loose = g.root === "(racine)" || CONTAINER.test(lastSeg(g.root).trim()); // vidéos posées en vrac dans un dossier conteneur
  return g;
}
function buildGroups(list) {
  const map = new Map();
  for (const f of list) {
    const { root: r, chapter } = instrOf(f.folder);
    f.chapter = chapter;
    let g = map.get(r);
    if (!g) map.set(r, (g = { root: r, items: [], names: [], count: 0 }));
    g.items.push(f); g.count++;
    if (g.names.length < 25) g.names.push(chapter ? `${chapter} ${f.name}` : f.name);
  }
  return [...map.values()];
}

// catalogue synchronisé sur le compte du coach (lui seul) : un instructional par ligne, déjà classé (léger)
function catalogFromGroups(groups) {
  const over = {};
  return { v: 2, at: new Date().toISOString(), root: root?.name || "", items: groups.map((g) => { classifyGroup(g, over); return [g.root, g.count, g.disc.id, g.belt?.id || "", g.theme.id]; }) };
}
function saveCatalog() {
  const cat = catalogFromGroups(buildGroups(files));
  store.update((s) => { s.localCatalog = cat; if (Object.keys(fiches).length) s.localFiches = { ...(s.localFiches || {}), ...fiches }; });
}
// ancien format (tous les noms de fichiers, trop lourd) → nouveau format compact
try {
  const c = store.get().localCatalog;
  if (c && !c.v && c.folders) {
    const list = Object.entries(c.folders).flatMap(([folder, names]) => names.map((name) => ({ folder, name })));
    const cat = catalogFromGroups(buildGroups(list)); cat.root = c.root || "";
    store.update((s) => { s.localCatalog = cat; });
  }
} catch { /* rien de grave : le catalogue sera refait au prochain passage sur l'ordinateur */ }
function groupsFromCatalog() {
  const c = store.get().localCatalog;
  if (c?.v !== 2) return [];
  return c.items.map(([r, n, d, b, t]) => ({ root: r, items: [], names: [], count: n, cdisc: d, cbelt: b, ctheme: t }));
}
const folderName = (folder) => { const p = folder.split("/"); const last = p.pop(); return p.length && /^(vol|volume|part|partie|disc|disque|dvd|chapter|chapitre|\d)/i.test(last) ? `${p.pop()} · ${last}` : last; };
const linkOf = (r) => (store.get().localLinks || {})[r] || "";

// ---- envoi sur Google Drive : sélection + script (rclone) qui range tout par discipline / ceinture / catégorie ----
const DRIVE_ROOT = "Fight Art Videotheque";
const BUDGET = 1.8e12; // ~1,8 To utilisables sur un abonnement 2 To
const safe = (x) => String(x).normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[<>:"/\\|?*%!^&]/g, " ").replace(/\s+/g, " ").trim();
export function drivePath(g) {
  const di = DISCIPLINES.indexOf(g.disc) + 1;
  const parts = [DRIVE_ROOT, `${String(di).padStart(2, "0")} ${safe(g.disc.label)}`];
  if (g.belt) parts.push(`${BELTS.indexOf(g.belt) + 1} ${safe(g.belt.label)}`);
  const ti = themesOf(g.disc.id).findIndex((t) => t.id === g.theme.id) + 1;
  parts.push(`${String(ti).padStart(2, "0")} ${safe(g.theme.label)}`);
  parts.push(safe(g.loose ? `Videos isolees - ${lastSeg(g.root)}` : lastSeg(g.root)).slice(0, 120));
  return parts.join("/");
}
const driveSearch = (g) => `https://drive.google.com/drive/search?q=${encodeURIComponent(`"${safe(lastSeg(g.root)).slice(0, 120)}"`)}`;
const driveSel = () => store.get().driveSel || {};
// auteurs de référence : priorité dans la sélection automatique
const TOP = /danaher|gordon ryan|lachlan|craig jones|musumeci|firas|zahabi|melanson|ryan hall|jason rau|bodoni|wiltse|demian maia|marcelo|bernardo faria|roger gracie|john smith|jordan burroughs|ben askren|cael|kolat|jimmy pedro|travis stevens|neil adams|renier|luta|aoj|mendes|galvao|tonon|vallimont|eli knight|chael/i;
function autoScore(g, dupSeen) {
  let s = 0;
  const t = g.root.toLowerCase();
  if (TOP.test(t)) s += 3;
  if (g.belt?.id === "blanche" && /fundament|basics|foundation|essential|beginner|101|bases/i.test(t)) s += 2;
  if (g.count >= 3 && g.count <= 60) s += 1;
  if (g.okRatio !== undefined) s += g.okRatio; // vidéos lisibles : un petit plus
  if (dupSeen.has(dupKey(g.root))) s -= 10; // doublon d'un instructional déjà choisi
  return s;
}
function autoPick(groups) {
  const pick = {}, dupSeen = new Set();
  const per = { luta: 3, jjb: 2, grappling: 2, lutte: 3, mma: 3, judo: 2, boxe: 2, pieds: 2, prepa: 1, autre: 0 };
  const buckets = new Map();
  for (const g of groups) { const k = `${g.disc.id}|${g.belt?.id || ""}|${g.theme.id}`; if (!buckets.has(k)) buckets.set(k, []); buckets.get(k).push(g); }
  for (const [k, list] of buckets) {
    const disc = k.split("|")[0];
    let n = per[disc] ?? 1;
    if (k.endsWith("|autres")) n = Math.min(n, 1);
    const ranked = list.map((g) => ({ g, s: autoScore(g, dupSeen) })).sort((a, b) => b.s - a.s);
    for (const { g, s } of ranked.slice(0, n)) { if (s < -5) continue; pick[g.root] = 1; dupSeen.add(dupKey(g.root)); }
  }
  return pick;
}
const fmtSize = (b) => (b >= 1e12 ? `${(b / 1e12).toFixed(2).replace(".", ",")} To` : b >= 1e9 ? `${Math.round(b / 1e9)} Go` : `${Math.round(b / 1e6)} Mo`);
let sizeCache = {}; // taille par instructional (octets)
async function groupSize(g) {
  if (sizeCache[g.root] !== undefined) return sizeCache[g.root];
  let tot = 0;
  for (const f of g.items) { try { tot += (await f.handle.getFile()).size; } catch {} }
  sizeCache[g.root] = tot; idbPut("sizes", sizeCache);
  return tot;
}
function driveScript(groups) {
  const L = [
    "@echo off", "chcp 65001 >nul", "title Fight Art - envoi vers Google Drive", "cd /d \"%~dp0\"",
    "echo ============================================================",
    "echo  Envoi de ta selection vers TON Google Drive (prive)",
    "echo  Range par discipline, ceinture et categorie.",
    "echo  Tu peux fermer et relancer : il reprend ou il s'est arrete.",
    "echo ============================================================", "echo.",
    "where rclone >nul 2>nul", "if errorlevel 1 (",
    "  echo Installation de l'outil d'envoi rclone, une seule fois...",
    "  winget install -e --id Rclone.Rclone --accept-source-agreements --accept-package-agreements",
    "  echo.", "  echo C'est installe. Ferme cette fenetre puis relance ce fichier.", "  pause", "  exit /b", ")",
    "rclone listremotes | findstr /b /c:\"fightart:\" >nul", "if errorlevel 1 (",
    "  echo Une page Google va s'ouvrir : connecte-toi avec le compte du Drive et accepte.",
    "  rclone config create fightart drive scope=drive",
    ")",
    "set \"SRC=%~dp0\"", "set N=0",
  ];
  groups.forEach((g, i) => {
    const src = (g.root === "(racine)" ? "" : g.root.replace(/\//g, "\\")).replace(/%/g, "%%");
    const dst = drivePath(g).replace(/%/g, "%%");
    L.push(`echo [${i + 1}/${groups.length}] ${safe(lastSeg(g.root)).slice(0, 70)}`);
    L.push(`rclone copy "%SRC%${src}" "fightart:${dst}" --transfers 3 --checkers 8 --drive-stop-on-upload-limit --stats-one-line -P${g.loose ? " --max-depth 1" : ""}`);
    L.push("if errorlevel 7 goto limite");
  });
  L.push("echo.", "echo Termine ! Tout est sur ton Google Drive, dossier \"" + DRIVE_ROOT + "\".", "pause", "exit /b",
    ":limite", "echo.", "echo Google limite l'envoi a 750 Go par jour : relance ce fichier demain, il reprendra ou il s'est arrete.", "pause", "exit /b", "");
  return L.join("\r\n");
}
function download(name, text, type = "application/octet-stream") {
  const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; a.click();
}

// convertisseur Windows : transforme les vidéos illisibles en MP4 (H.264) lisibles partout, à côté des originaux
const BAT = [
  "@echo off", "chcp 65001 >nul", "title Fight Art - videos lisibles",
  "where ffmpeg >nul 2>nul", "if errorlevel 1 (",
  "  echo Installation de ffmpeg, une seule fois...",
  "  winget install -e --id Gyan.FFmpeg --accept-source-agreements --accept-package-agreements",
  "  echo.", "  echo C'est installe. Ferme cette fenetre puis relance ce fichier.", "  pause", "  exit /b", ")",
  "echo Conversion des videos de ce dossier et de ses sous-dossiers.", "echo Tu peux laisser tourner : les videos deja faites sont sautees.", "echo.",
  "for /r \"%~dp0.\" %%F in (*.mp4 *.m4v *.mov *.mkv *.avi *.wmv *.mpg *.mpeg *.flv *.ts *.webm) do call :conv \"%%F\"",
  "echo.", "echo Termine. Rouvre la videotheque dans l'appli (bouton Rouvrir).", "pause", "exit /b",
  ":conv",
  "set \"N=%~n1\"",
  "if not \"%N:(lisible)=%\"==\"%N%\" exit /b",
  "set \"OUT=%~dpn1 (lisible).mp4\"",
  "if exist \"%OUT%\" exit /b",
  "set \"VC=\"",
  "for /f \"usebackq delims=\" %%C in (`ffprobe -v error -select_streams v:0 -show_entries stream^=codec_name -of csv^=p^=0 \"%~1\"`) do set \"VC=%%C\"",
  "if /i \"%~x1\"==\".mp4\" if /i \"%VC%\"==\"h264\" exit /b",
  "if /i \"%~x1\"==\".m4v\" if /i \"%VC%\"==\"h264\" exit /b",
  "if /i \"%~x1\"==\".webm\" exit /b",
  "echo Conversion : %~nx1  [%VC%]",
  "if /i \"%VC%\"==\"h264\" (",
  "  ffmpeg -hide_banner -loglevel error -stats -i \"%~1\" -map 0:v:0 -map 0:a:0? -c:v copy -c:a aac -b:a 160k -movflags +faststart \"%OUT%\"",
  ") else (",
  "  ffmpeg -hide_banner -loglevel error -stats -i \"%~1\" -map 0:v:0 -map 0:a:0? -c:v libx264 -preset veryfast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart \"%OUT%\"",
  ")",
  "if errorlevel 1 del \"%OUT%\" 2>nul",
  "exit /b", "",
].join("\r\n");
function downloadConverter() {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([BAT], { type: "application/octet-stream" }));
  a.download = "Rendre-lisible-Fight-Art.bat"; a.click();
  toast("Convertisseur téléchargé");
}
const convHelp = `<b>Rendre les vidéos lisibles</b> : télécharge le convertisseur, mets-le dans le dossier d'un instructional sur ton disque dur, puis double-clique dessus. Il crée à côté de chaque vidéo une copie « (lisible).mp4 » que l'appli lit partout (PC, Drive, téléphone). La première fois, il installe l'outil gratuit ffmpeg (Windows te demande d'accepter), puis tu le relances. Compte environ 10 à 30 min par heure de vidéo : commence par les instructionals que tu utilises.`;
const pretty = (n) => n.replace(VIDEO, "").replace(/\s*\(lisible\)\s*$/i, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

// test réel de lisibilité : le navigateur doit décoder la première image (pas juste reconnaître le fichier)
// (gardé dans la base locale du navigateur : trop gros pour le stockage simple)
let okCache = {};
const saveOk = () => idbPut("ok", okCache);
const cacheReady = (async () => { okCache = (await idbGet("ok")) || {}; sizeCache = (await idbGet("sizes")) || {}; try { localStorage.removeItem("fap:playable"); } catch {} })();
const MIME0 = { mp4: "video/mp4", m4v: "video/mp4", mov: "video/mp4", webm: "video/webm", mkv: "video/webm" };
function probe(f) {
  return new Promise(async (res) => {
    if (!PLAYABLE.test(f.name)) return res(0);
    let file; try { file = await f.handle.getFile(); } catch { return res(null); }
    const ext = (f.name.split(".").pop() || "").toLowerCase();
    const u = URL.createObjectURL(file.type ? file : new Blob([file], { type: MIME0[ext] || "video/mp4" }));
    const v = document.createElement("video"); v.muted = true; v.preload = "auto";
    let done = false;
    const fin = (ok) => { if (done) return; done = true; clearTimeout(t); v.removeAttribute("src"); try { v.load(); } catch {} URL.revokeObjectURL(u); res(ok); };
    v.onloadeddata = () => fin(v.videoWidth > 0 ? 1 : 0);
    v.onerror = () => fin(0);
    const t = setTimeout(() => fin(null), 20000); // disque lent : on retentera plus tard
    v.src = u;
  });
}
let testing = false;
async function testAll(onStep) {
  if (testing) return; testing = true;
  // une vidéo testée par dossier (les vidéos d'un même dossier ont le même format) : bien plus rapide
  await cacheReady;
  const seen = new Set(), todo = [];
  for (const f of files) { if (!f.handle || okCache[f.path] !== undefined || okCache[`dir:${f.folder}`] !== undefined || seen.has(f.folder)) continue; seen.add(f.folder); todo.push(f); }
  let n = 0, i = 0;
  const worker = async () => {
    while (i < todo.length) {
      const f = todo[i++]; const r = await probe(f);
      if (r !== null) { okCache[f.path] = r; okCache[`dir:${f.folder}`] = r; }
      n++; if (n % 20 === 0) { saveOk(); onStep?.(n, todo.length, false); }
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  saveOk(); testing = false; onStep?.(n, todo.length, true);
}

export function openLocalVideos() {
  const body = openSheet("Ma vidéothèque privée", "");
  let q = "", disc = "", onlyOk = true, theme = "", belt = "";
  const phone = !localSupported();
  const intro = phone ? `<p class="small muted" style="margin-top:0">Sur téléphone : ton catalogue, tes fiches et tes notes. Les instructionals envoyés sur ton Google Drive (★) s'ouvrent avec « Regarder sur Drive ». Tout reste privé : personne d'autre ne voit ces liens.</p>` : `<p class="small muted" style="margin-top:0">Les vidéos de ton disque dur, rangées par discipline et lues directement sur ton ordinateur : rien n'est mis en ligne, elles restent visibles par toi seul. Sous chaque vidéo : sa fiche de travail (si elle est prête sur le disque) et tes notes.</p>`;

  const okFor = (f) => okCache[f.path] ?? okCache[`dir:${f.folder}`];
  let view = "parcours"; // parcours | all | drive
  const draw = () => {
    let groups;
    if (phone) {
      groups = groupsFromCatalog();
      fiches = { ...(store.get().localFiches || {}) };
      if (!groups.length) { body.innerHTML = intro + `<p class="notice is-warn small">Ouvre d'abord la vidéothèque une fois sur ton ordinateur (Chrome ou Edge, disque branché) : le catalogue arrive ensuite ici automatiquement.</p>`; return; }
    } else if (!files.length) { body.innerHTML = intro + `<button class="btn tape-btn block" data-pick>${icon("play")} Choisir le dossier des vidéos sur mon disque dur</button><p class="hint">Le navigateur te demande quel dossier ouvrir et l'autorisation de le lire. Les fichiers ne quittent pas ton ordinateur.</p>`; return; }
    const notes = studyNotes();
    const sel = driveSel();
    let tested = 0, okN = 0;
    if (!phone) { for (const f of files) { const o = okFor(f); if (o !== undefined) { tested++; if (o === 1) okN++; } } }
    const pending = phone ? 0 : files.length - tested;
    if (!phone) {
      const base = onlyOk ? files.filter((f) => okFor(f) === 1) : files;
      groups = buildGroups(base);
    }
    const over = store.get().localClass || {};
    groups.forEach((g) => classifyGroup(g, over));
    if (q) groups = groups.filter((g) => g.root.toLowerCase().includes(q) || translateTitle(lastSeg(g.root)).toLowerCase().includes(q) || g.items.some((i) => i.name.toLowerCase().includes(q)));
    if (view === "drive") groups = groups.filter((g) => sel[g.root]);
    const counts = {}; groups.forEach((g) => { counts[g.disc.id] = (counts[g.disc.id] || 0) + 1; });
    const inDisc = disc ? groups.filter((g) => g.disc.id === disc) : groups;
    const shown = inDisc.filter((g) => (!theme || g.theme.id === theme) && (!belt || g.belt?.id === belt));
    // ordre : discipline → ceinture (blanche à noire) → catégorie dans l'ordre d'apprentissage → titre
    const nat = (a, b) => a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" });
    const rank = (g) => [DISCIPLINES.indexOf(g.disc), g.belt ? BELTS.indexOf(g.belt) : 0, themesOf(g.disc.id).findIndex((t) => t.id === g.theme.id)];
    const ordered = [...shown].sort((a, b) => { const ra = rank(a), rb = rank(b); return ra[0] - rb[0] || ra[1] - rb[1] || ra[2] - rb[2] || nat(lastSeg(a.root), lastSeg(b.root)); });
    const subChips = !disc ? "" : `${BELT_DISCS.includes(disc) ? `<div class="chips" style="margin-bottom:6px"><button class="chip" data-vbelt="" aria-pressed="${!belt}">Toutes ceintures</button>${BELTS.filter((b) => inDisc.some((g) => g.belt?.id === b.id)).map((b) => `<button class="chip" data-vbelt="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${b.color};border:1px solid #555;margin-right:6px"></span>${esc(b.label.replace("Ceinture ", ""))} · ${inDisc.filter((g) => g.belt?.id === b.id).length}</button>`).join("")}</div>` : ""}
      <div class="chips" style="margin-bottom:8px"><button class="chip" data-vtheme="" aria-pressed="${!theme}">Toutes catégories</button>${themesOf(disc).filter((t) => inDisc.some((g) => g.theme.id === t.id)).map((t) => `<button class="chip" data-vtheme="${t.id}" aria-pressed="${theme === t.id}">${esc(t.label)} · ${inDisc.filter((g) => g.theme.id === t.id).length}</button>`).join("")}</div>`;
    const head = (g, gi) => {
      const prev = ordered[gi - 1];
      let h = "";
      if (!prev || prev.disc !== g.disc) h += `<h3 class="sys-h" style="color:${g.disc.color};margin-top:16px">${esc(g.disc.label)}</h3>`;
      if (g.belt && (!prev || prev.disc !== g.disc || prev.belt !== g.belt)) h += `<div class="row" style="gap:8px;margin:12px 0 4px;align-items:center"><span style="width:34px;height:10px;border-radius:3px;background:${g.belt.color};border:1px solid #555;flex:none"></span><b class="small">${esc(g.belt.label)}</b><span class="tiny muted">${esc(g.belt.sub)}</span></div>`;
      if (!prev || prev.disc !== g.disc || prev.belt !== g.belt || prev.theme.id !== g.theme.id) h += `<div class="tiny" style="margin:8px 0 4px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--muted)">${esc(g.theme.label)}</div>`;
      return h;
    };
    const classer = (g) => `<details style="margin:6px 0"><summary class="tiny muted" style="cursor:pointer">Classer autrement${g.fixed ? " (classé à la main)" : ""}</summary>
      <div class="row" style="gap:6px;flex-wrap:wrap;margin-top:6px">
        <select class="input" data-cls="disc" data-folder="${esc(g.root)}" style="flex:1;min-width:140px">${DISCIPLINES.map((d) => `<option value="${d.id}"${d === g.disc ? " selected" : ""}>${esc(d.label)}</option>`).join("")}</select>
        ${g.belt ? `<select class="input" data-cls="belt" data-folder="${esc(g.root)}" style="flex:1;min-width:140px">${BELTS.map((b) => `<option value="${b.id}"${b === g.belt ? " selected" : ""}>${esc(b.label)}</option>`).join("")}</select>` : ""}
        <select class="input" data-cls="theme" data-folder="${esc(g.root)}" style="flex:1;min-width:160px">${themesOf(g.disc.id).map((t) => `<option value="${t.id}"${t.id === g.theme.id ? " selected" : ""}>${esc(t.label)}</option>`).join("")}</select>
        ${g.fixed ? `<button class="btn ghost small" data-clsreset="${esc(g.root)}">Classement auto</button>` : ""}
      </div></details>`;
    const watch = (g) => {
      const l = linkOf(g.root) || (sel[g.root] ? driveSearch(g) : "");
      return `<div class="row" style="gap:8px;margin:6px 0;flex-wrap:wrap">${l ? `<a class="btn tape-btn small" href="${esc(l)}" target="_blank" rel="noopener">${icon("play")} Regarder sur Drive</a>` : ""}<button class="btn ghost small" data-flink="${esc(g.root)}">${linkOf(g.root) ? "Modifier le lien" : "Lien privé (Drive, Plex…)"}</button></div>`;
    };
    const card = (g) => `<details class="sys-card" data-g="${esc(g.root)}" style="border-left:4px solid ${g.belt ? g.belt.color : g.disc.color}"${q && ordered.length < 6 ? " open" : ""}><summary><span class="row between" style="gap:8px;align-items:flex-start"><span style="min-width:0"><b>${esc(titleOf(g))}</b><span class="tiny muted" style="display:block">${esc(lastSeg(g.root))} · ${g.count} vidéo${g.count > 1 ? "s" : ""}${sizeCache[g.root] ? ` · ${fmtSize(sizeCache[g.root])}` : ""}${g.items.some((i) => notes[`local:${i.path}`]) ? " · notes" : ""}</span></span><button class="icon-btn" data-dsel="${esc(g.root)}" title="Sélection Drive" aria-pressed="${Boolean(sel[g.root])}" style="flex:none;font-size:18px;color:${sel[g.root] ? "var(--tape)" : "var(--muted)"}">${sel[g.root] ? "★" : "☆"}</button></span></summary>
        ${watch(g)}
        ${classer(g)}
        ${fiches[`${g.root}/__systeme__`] ? `<details style="margin:6px 0"><summary class="small" style="font-weight:700;cursor:pointer;color:var(--tape)">Fiche système de l'instructional</summary>${ficheHtml(fiches[`${g.root}/__systeme__`])}</details>` : ""}
        ${g.items.length ? `<div data-items></div>` : `<p class="tiny muted">${g.count} vidéos : ouvre-les avec « Regarder sur Drive ».</p>`}
      </details>`;
    const selN = Object.keys(sel).length;
    const allGroupsN = phone ? groups.length : buildGroups(files).length;
    const MAX = 250;
    const chipsRow = `<div class="chips" style="margin-bottom:8px"><button class="chip" data-view="all" aria-pressed="${view === "all"}">Toute la vidéothèque · ${allGroupsN}</button><button class="chip" data-view="parcours" aria-pressed="${view === "parcours"}">🥋 Parcours Fight Art</button><button class="chip" data-view="drive" aria-pressed="${view === "drive"}">★ Ma sélection Drive · ${selN}</button></div>`;
    if (view === "parcours") {
      const all = (phone ? groupsFromCatalog() : buildGroups(files)).map((g) => classifyGroup(g, over));
      const steps = resolveParcours(all);
      const found = steps.filter((x) => x.g);
      const allIn = found.every((x) => sel[x.g.root]);
      const discCol = (id) => DISCIPLINES.find((d) => d.id === id)?.color || "#888";
      body.innerHTML = intro + chipsRow + `
        <section class="panel" style="padding:12px;margin-bottom:10px">
          <b class="small">Parcours lutte + Luta Livre / grappling · blanche → violette</b>
          <p class="tiny muted" style="margin:4px 0 8px">${esc(PARCOURS_INTRO)} Les semaines indiquées sont celles du programme Luta Livre du club.</p>
          <p class="small" style="margin:0 0 8px"><b>${found.length}</b> étapes sur ${steps.length} trouvées sur ton disque${found.length ? ` · ${found.filter((x) => sel[x.g.root]).length} dans ta sélection Drive` : ""}</p>
          ${!phone && found.length ? `<button class="btn tape-btn small" data-parcsel ${allIn ? "disabled" : ""}>${allIn ? "Tout le parcours est dans ta sélection Drive" : "Mettre tout le parcours dans ma sélection Drive"}</button>` : ""}
        </section>
        ${PARCOURS_BELTS.map((b) => {
          const bb = BELTS.find((x) => x.id === b.id);
          return `<div class="row" style="gap:8px;margin:18px 0 4px;align-items:center"><span style="width:40px;height:12px;border-radius:3px;background:${bb.color};border:1px solid #555;flex:none"></span><h3 class="sys-h" style="margin:0">${esc(b.label)}</h3></div>
          <p class="tiny muted" style="margin:0 0 8px">${esc(b.goal)}</p>
          ${steps.filter((x) => x.belt === b.id).map((x) => `<div style="margin:10px 0 2px"><div class="row" style="gap:8px;align-items:baseline"><b style="color:var(--tape);min-width:22px">${x.n}.</b><span style="min-width:0"><b class="small">${esc(x.title)}</b> <span class="tiny muted">· ${esc(x.author)}</span><span class="tiny" style="display:block;color:var(--muted)"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${discCol(x.disc)};margin-right:5px"></span>${x.disc === "lutte" ? "Lutte" : x.disc === "luta" ? "Luta Livre" : "Grappling no-gi"} · programme : ${esc(x.sys)} · semaines ${esc(x.w)}</span><span class="tiny" style="display:block;margin-top:2px">${esc(x.why)}</span></span></div>
            ${x.g ? card(x.g) : `<p class="tiny muted" style="margin:4px 0 0 30px">Pas trouvé sur ton disque.</p>`}</div>`).join("")}`;
        }).join("")}`;
      lastGroups = found.map((x) => x.g);
      return;
    }
    body.innerHTML = intro + `
      <div class="row" style="gap:8px;margin-bottom:10px"><input class="input" data-q placeholder="Rechercher (technique, auteur…)" value="${esc(q)}" style="flex:1">${phone ? "" : `<button class="btn ghost small" data-pick>Changer de dossier</button>`}</div>
      <div class="chips" style="margin-bottom:8px"><button class="chip" data-view="all" aria-pressed="${view === "all"}">Toute la vidéothèque · ${allGroupsN}</button><button class="chip" data-view="parcours" aria-pressed="${view === "parcours"}">🥋 Parcours Fight Art</button><button class="chip" data-view="drive" aria-pressed="${view === "drive"}">★ Ma sélection Drive · ${selN}</button></div>
      ${phone ? "" : drivePanel(selN)}
      <div class="chips" style="margin-bottom:8px"><button class="chip" data-vdisc="" aria-pressed="${!disc}">Tout · ${groups.length}</button>${DISCIPLINES.filter((d) => counts[d.id]).map((d) => `<button class="chip" data-vdisc="${d.id}" aria-pressed="${disc === d.id}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${d.color};border:1px solid #555;margin-right:6px"></span>${esc(d.label)} · ${counts[d.id]}</button>`).join("")}</div>
      ${subChips}
      ${phone ? "" : `<div class="row between" style="gap:8px;margin-bottom:6px;flex-wrap:wrap"><p class="tiny muted" style="margin:0"><b style="color:var(--tape)">${okN} lisibles sur PC</b> / ${files.length} vidéos${pending ? ` · <span data-okprog>test en cours…</span>` : ""}</p><div class="chips"><button class="chip" data-onlyok="1" aria-pressed="${onlyOk}">Lisibles sur PC</button><button class="chip" data-onlyok="0" aria-pressed="${!onlyOk}">Tout</button></div></div>`}
      <p class="tiny muted">${shown.length} instructional${shown.length > 1 ? "s" : ""}${shown.length > MAX ? ` (les ${MAX} premiers affichés : choisis une discipline, une ceinture ou cherche)` : ""} · titres traduits automatiquement</p>
      ${!ordered.length && !phone && onlyOk && pending ? `<p class="muted small">Test de lisibilité en cours… les vidéos lisibles apparaissent ici au fur et à mesure.</p>` : ""}
      ${ordered.slice(0, MAX).map((g, gi) => `${head(g, gi)}${card(g)}`).join("")}
      <button class="btn ghost block" data-export style="margin-top:14px">Exporter le catalogue (pour préparer les fiches avec Claude)</button>`;
    // les listes de vidéos ne sont construites qu'à l'ouverture d'un instructional (des milliers de vidéos)
    lastGroups = ordered;
  };
  let lastGroups = [];
  const itemsHtml = (g) => {
    const notes = studyNotes();
    let prevCh = null;
    return g.items.map((i) => {
      const ch = i.chapter && i.chapter !== prevCh ? `<div class="tiny" style="margin:10px 0 2px;font-weight:700;color:var(--muted)">${esc(translateTitle(i.chapter))}</div>` : "";
      prevCh = i.chapter;
      const bad = okFor(i) === 0;
      return `${ch}<button class="row between" data-play="${esc(i.path)}" style="width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);color:inherit;padding:10px 0;gap:8px"><span style="min-width:0"><span class="small"${bad ? ' style="opacity:.55"' : ""}>${bad ? '<span class="tiny" style="color:#F25F5C">illisible sur PC · </span>' : ""}${esc(translateTitle(pretty(i.name)))}${fiches[i.path] ? ` <span class="insigne">fiche</span>` : ""}${notes[`local:${i.path}`] ? ` <span class="tiny" style="color:var(--tape)">✎</span>` : ""}</span><span class="tiny muted" style="display:block">${esc(pretty(i.name))}</span></span>${icon("play", 'style="width:18px;height:18px;flex:none"')}</button>`;
    }).join("");
  };
  body.addEventListener("toggle", (e) => {
    const d = e.target;
    if (!d.matches?.("details[data-g]") || !d.open) return;
    const box = d.querySelector("[data-items]");
    if (!box || box.childElementCount) return;
    const g = lastGroups.find((x) => x.root === d.dataset.g);
    if (g) box.innerHTML = itemsHtml(g);
  }, true);
  const drivePanel = (selN) => {
    const sel = driveSel();
    const known = Object.keys(sel).filter((r) => sizeCache[r] !== undefined);
    const tot = known.reduce((a, r) => a + sizeCache[r], 0);
    return `<section class="panel" style="padding:12px;margin-bottom:10px">
      <b class="small">Envoyer sur Google Drive</b>
      <p class="tiny muted" style="margin:4px 0 8px">Choisis les instructionals avec l'étoile ☆, ou laisse l'appli proposer une sélection équilibrée (par discipline, ceinture et catégorie, sans doublons, auteurs de référence en priorité). Ensuite, un seul fichier envoie tout sur ton Drive, déjà rangé.</p>
      <p class="small" style="margin:0 0 8px"><b>${selN}</b> instructional${selN > 1 ? "s" : ""} sélectionné${selN > 1 ? "s" : ""}${selN ? ` · ${known.length < selN ? `taille connue pour ${known.length}/${selN} : ` : ""}<b>${fmtSize(tot)}</b> / 2 To` : ""}${tot > BUDGET ? ` <span style="color:#F25F5C">· trop gros : enlève des instructionals</span>` : ""}</p>
      <div class="row" style="gap:8px;flex-wrap:wrap">
        <button class="btn tape-btn small" data-dauto>Proposer une sélection</button>
        ${selN ? `<button class="btn ghost small" data-dsize>Calculer la taille</button><button class="btn tape-btn small" data-dscript>Télécharger le fichier d'envoi</button><button class="btn ghost small" data-dclear>Tout désélectionner</button>` : ""}
      </div>
      <details style="margin-top:8px"><summary class="tiny muted" style="cursor:pointer">Comment ça marche</summary><ol class="small" style="padding-left:18px;margin:6px 0">
        <li>Prends l'abonnement Google One 2 To sur le compte Google qui recevra les vidéos.</li>
        <li>Mets le fichier d'envoi dans le dossier que tu as choisi dans l'appli (« ${esc(root?.name || "ton dossier")} »), puis double-clique dessus.</li>
        <li>La première fois : il installe l'outil d'envoi (accepte), tu le relances, une page Google s'ouvre : connecte-toi et accepte.</li>
        <li>Laisse tourner (la nuit). Google limite à 750 Go par jour : relance-le le lendemain, il reprend où il s'est arrêté.</li>
        <li>Sur ton Drive, tout arrive dans « ${DRIVE_ROOT} », rangé par discipline, ceinture et catégorie. Dans l'appli, « Regarder sur Drive » retrouve chaque instructional.</li>
      </ol></details>
    </section>`;
  };

  const pick = async () => {
    try { root = await window.showDirectoryPicker({ id: "fap-videos", mode: "read" }); }
    catch (e) {
      if (e?.name !== "AbortError") { body.innerHTML += `<p class="notice is-warn small" style="margin-top:10px">Le navigateur refuse ce dossier (souvent la racine du disque, ex. « D: », car elle contient des fichiers système). Choisis plutôt le dossier principal des vidéos, à l'intérieur du disque.</p>`; }
      return;
    }
    try { await saveHandle(root); } catch { /* on redemandera le dossier la prochaine fois */ }
    await load();
  };
  const load = async () => {
    body.innerHTML = intro + `<p class="muted small" data-prog>Lecture du disque dur…</p>`;
    try { files = (await scan(root, (n) => { const p = body.querySelector("[data-prog]"); if (p) p.textContent = `Lecture du disque dur… ${n} vidéos trouvées`; })).filter((f) => !f.path.startsWith("Fiches Fight Art/")); fiches = { ...(store.get().localFiches || {}), ...(await loadFiches(root)) }; saveCatalog(); await cacheReady; }
    catch (e) { files = []; toast("Impossible de lire ce dossier : le disque est-il bien branché ?"); body.innerHTML = `<p class="notice is-warn small">Lecture impossible (${esc(e?.message || "erreur inconnue")}). Vérifie que le disque est branché, puis choisis le dossier principal des vidéos.</p><button class="btn tape-btn block" data-pick style="margin-top:10px">Choisir le dossier</button>`; return; }
    draw();
    let last = 0;
    testAll((n, tot, end) => {
      if (!body.isConnected) return;
      const p = body.querySelector("[data-okprog]"); if (p && !end) p.textContent = `test en cours : ${n}/${tot} (les lisibles s'ajoutent au fur et à mesure)`;
      // on rafraîchit la liste de temps en temps, sans fermer un dossier ouvert ni la recherche en cours
      if (end || (n - last >= 60 && !body.querySelector("details[open]") && document.activeElement?.dataset?.q === undefined)) { last = n; draw(); }
    });
  };

  body.addEventListener("click", async (e) => {
    if (e.target.closest("[data-pick]")) { await pick(); return; }
    if (e.target.closest("[data-grant]")) {
      try { if ((await root.requestPermission({ mode: "read" })) === "granted") await load(); }
      catch { root = null; body.innerHTML = intro + `<p class="notice is-warn small">L'ancien dossier ne répond plus (disque débranché, ou lettre du disque changée). Choisis-le à nouveau.</p><button class="btn tape-btn block" data-pick style="margin-top:10px">Choisir le dossier des vidéos</button>`; }
      return;
    }
    const fl = e.target.closest("[data-flink]");
    if (fl) {
      const folder = fl.dataset.flink;
      const v = prompt(`Lien privé du dossier « ${folderName(folder)} » (Plex, Google Drive ou OneDrive ; laisser vide pour retirer) :`, linkOf(folder));
      if (v === null) return;
      const url = v.trim();
      if (url && !/^https:\/\//i.test(url)) { toast("Colle un lien qui commence par https://"); return; }
      store.update((s) => { s.localLinks = { ...(s.localLinks || {}) }; if (url) s.localLinks[folder] = url; else delete s.localLinks[folder]; });
      toast(url ? "Lien enregistré (visible par toi seul)" : "Lien retiré"); draw(); return;
    }
    const ds = e.target.closest("[data-dsel]");
    if (ds) { e.preventDefault(); const r = ds.dataset.dsel; store.update((s) => { s.driveSel = { ...(s.driveSel || {}) }; if (s.driveSel[r]) delete s.driveSel[r]; else s.driveSel[r] = 1; }); draw(); return; }
    const vw = e.target.closest("[data-view]");
    if (vw) { view = vw.dataset.view; draw(); return; }
    if (e.target.closest("[data-parcsel]")) {
      const over = store.get().localClass || {};
      const steps = resolveParcours(buildGroups(files).map((g) => classifyGroup(g, over))).filter((x) => x.g);
      store.update((s) => { s.driveSel = { ...(s.driveSel || {}) }; steps.forEach((x) => { s.driveSel[x.g.root] = 1; }); });
      draw(); toast(`${steps.length} instructionals du parcours ajoutés : calcul de la taille…`);
      await sizeAll(); return;
    }
    if (e.target.closest("[data-dclear]")) { if (confirm("Vider toute la sélection Drive ?")) { store.update((s) => { s.driveSel = {}; }); draw(); } return; }
    if (e.target.closest("[data-dauto]")) {
      const over = store.get().localClass || {};
      const gs = buildGroups(files).map((g) => classifyGroup(g, over));
      gs.forEach((g) => { const t = g.items.filter((f) => okFor(f) !== undefined); if (t.length) g.okRatio = t.filter((f) => okFor(f) === 1).length / t.length; });
      const pick = autoPick(gs);
      const had = Object.keys(driveSel()).length;
      if (had && !confirm(`Remplacer ta sélection actuelle (${had}) par la sélection proposée (${Object.keys(pick).length}) ?`)) return;
      store.update((s) => { s.driveSel = pick; });
      view = "drive"; draw(); toast(`${Object.keys(pick).length} instructionals proposés : calcul de la taille…`);
      await sizeAll(); return;
    }
    if (e.target.closest("[data-dsize]")) { await sizeAll(); return; }
    if (e.target.closest("[data-dscript]")) {
      const over = store.get().localClass || {}, sel = driveSel();
      const gs = buildGroups(files).filter((g) => sel[g.root]).map((g) => classifyGroup(g, over));
      if (!gs.length) { toast("Sélection vide sur ce dossier"); return; }
      download("Envoi-Drive-Fight-Art.bat", driveScript(gs));
      toast("Fichier d'envoi téléchargé : mets-le dans le dossier choisi, puis double-clique");
      return;
    }
    const ok = e.target.closest("[data-onlyok]");
    if (ok) { onlyOk = ok.dataset.onlyok === "1"; draw(); return; }
    const dc = e.target.closest("[data-vdisc]");
    if (dc) { disc = dc.dataset.vdisc; theme = ""; belt = ""; draw(); return; }
    const tc = e.target.closest("[data-vtheme]");
    if (tc) { theme = tc.dataset.vtheme; draw(); return; }
    const bc = e.target.closest("[data-vbelt]");
    if (bc) { belt = bc.dataset.vbelt; draw(); return; }
    const rs = e.target.closest("[data-clsreset]");
    if (rs) { store.update((s) => { s.localClass = { ...(s.localClass || {}) }; delete s.localClass[rs.dataset.clsreset]; }); toast("Classement automatique remis"); draw(); return; }
    const pl = e.target.closest("[data-play]");
    if (pl) { const f = files.find((x) => x.path === pl.dataset.play); if (f) playVideo(f, () => { openLocalVideos(); }); return; }
    if (e.target.closest("[data-conv]")) { downloadConverter(); return; }
    if (e.target.closest("[data-export]")) {
      const rows = [["dossier", "fichier"], ...files.map((f) => [f.folder, f.name])];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })); a.download = "catalogue-videos.csv"; a.click();
      toast("Catalogue téléchargé : envoie-le à Claude pour préparer les fiches");
    }
  });
  // taille de la sélection (lecture des tailles de fichiers sur le disque, sans les ouvrir)
  const sizeAll = async () => {
    const sel = driveSel();
    const gs = buildGroups(files).filter((g) => sel[g.root] && sizeCache[g.root] === undefined);
    let n = 0;
    for (const g of gs) { await groupSize(g); if (++n % 10 === 0 && body.isConnected) { const p = body.querySelector("[data-dsize]"); if (p) p.textContent = `Calcul… ${n}/${gs.length}`; } }
    if (!body.isConnected) return;
    // trop gros pour 2 To : on retire les moins prioritaires (catégories « divers » et doublons d'abord)
    const over = store.get().localClass || {};
    const all = buildGroups(files).filter((g) => sel[g.root]).map((g) => classifyGroup(g, over));
    let tot = all.reduce((a, g) => a + (sizeCache[g.root] || 0), 0);
    if (tot > BUDGET) {
      const dup = new Set();
      const ranked = all.map((g) => { const s = autoScore(g, dup); dup.add(dupKey(g.root)); return { g, s: s - (g.theme.id === "autres" ? 2 : 0) - (g.belt?.id === "marron" ? 1 : 0) }; }).sort((a, b) => a.s - b.s);
      const drop = [];
      for (const { g } of ranked) { if (tot <= BUDGET) break; tot -= sizeCache[g.root] || 0; drop.push(g.root); }
      if (drop.length && confirm(`La sélection dépasse 2 To. Retirer automatiquement les ${drop.length} instructionals les moins prioritaires ?`)) store.update((s) => { s.driveSel = { ...(s.driveSel || {}) }; drop.forEach((r) => delete s.driveSel[r]); });
    }
    draw(); toast("Taille calculée");
  };
  body.addEventListener("change", (e) => {
    const sel = e.target.closest("[data-cls]");
    if (!sel) return;
    const folder = sel.dataset.folder;
    // on fige le classement actuel de l'instructional, puis on applique le choix
    const box = sel.closest("div");
    const cur = Object.fromEntries([...box.querySelectorAll("[data-cls]")].map((x) => [x.dataset.cls, x.value]));
    if (sel.dataset.cls === "disc") { delete cur.theme; delete cur.belt; }
    store.update((s) => { s.localClass = { ...(s.localClass || {}), [folder]: cur }; });
    toast("Classement enregistré"); draw();
  });
  body.addEventListener("input", (e) => { if (e.target.matches("[data-q]")) { q = e.target.value.trim().toLowerCase(); const pos = e.target.selectionStart; draw(); const i = body.querySelector("[data-q]"); i.focus(); i.setSelectionRange(pos, pos); } });

  // reprise : le dossier choisi la dernière fois
  draw();
  if (!phone && !files.length) loadHandle().then(async (h) => {
    if (!h) return;
    root = h;
    let perm = "prompt"; try { perm = await h.queryPermission({ mode: "read" }); } catch {}
    if (perm === "granted") await load();
    else body.innerHTML = intro + `<button class="btn tape-btn block" data-grant>${icon("play")} Rouvrir « ${esc(h.name)} »</button><button class="btn ghost block" data-pick style="margin-top:8px">Choisir un autre dossier</button><p class="hint">Branche le disque dur avant d'appuyer.</p>`;
  });
}

const MIME = { mp4: "video/mp4", m4v: "video/mp4", mov: "video/mp4", webm: "video/webm", mkv: "video/webm" };

// retrouve le fichier : d'abord par son lien direct, sinon en repartant du dossier choisi (après autorisation)
async function getVideoFile(f) {
  try { return await f.handle.getFile(); } catch (first) {
    if (!root) throw first;
    try { if ((await root.queryPermission({ mode: "read" })) !== "granted") await root.requestPermission({ mode: "read" }); } catch {}
    let d = root; const parts = f.path.split("/");
    for (const p of parts.slice(0, -1)) d = await d.getDirectoryHandle(p);
    const h = await d.getFileHandle(parts[parts.length - 1]);
    f.handle = h;
    return await h.getFile();
  }
}

async function playVideo(f, back) {
  let url = "";
  const ext = (f.name.split(".").pop() || "").toLowerCase();
  // la fiche s'ouvre tout de suite : on voit toujours quelque chose, même si la vidéo pose problème
  const body = openSheet(translateTitle(pretty(f.name)), `
    <button class="btn ghost small" data-back style="margin-bottom:10px">${icon("back")} Retour à la vidéothèque</button>
    <div data-player><p class="muted small">Ouverture de la vidéo…</p></div>
    <p class="tiny muted" style="margin:8px 0 0">${esc(pretty(f.name))} · ${esc(f.folder)}</p>
    ${ficheHtml(fiches[f.path])}
    ${myNote(`local:${f.path}`, `Vidéo privée · ${pretty(f.name)}`, { placeholder: "Points clés, détails, erreurs, drills à faire, semaine du programme où l'utiliser…" })}`,
    { close: () => { if (url) URL.revokeObjectURL(url); } });
  body.querySelector("[data-back]").addEventListener("click", () => back?.());
  const box = body.querySelector("[data-player]");
  const vlc = `Ouvre-la avec VLC (gratuit) depuis ton disque dur : <b>${esc(f.folder)}</b>.`;

  if (!f.handle) {
    const l = linkOf(f.folder);
    box.innerHTML = l ? `<a class="btn tape-btn block" href="${esc(l)}" target="_blank" rel="noopener">${icon("play")} Regarder sur mon Drive</a><p class="hint">Le dossier s'ouvre dans Drive / OneDrive : choisis la vidéo « ${esc(f.name)} ».</p>`
      : `<p class="notice is-warn small">Pas encore de lien pour cet instructional. Reviens à la vidéothèque et appuie sur « Ajouter le lien privé » sous son titre.</p>`;
    return;
  }
  let file;
  try { file = await getVideoFile(f); }
  catch (e) {
    box.innerHTML = `<p class="notice is-warn small">Le navigateur n'arrive pas à lire ce fichier (${esc(e?.name || "")}${e?.message ? ` : ${esc(e.message)}` : ""}).<br>Vérifie que le disque est branché, puis rouvre la vidéothèque et appuie sur « Rouvrir ». Si le chemin du dossier est très long, raccourcis le nom du dossier sur le disque.</p>`;
    return;
  }
  if (!PLAYABLE.test(f.name)) { box.innerHTML = `<p class="notice is-warn small">Ce format (.${esc(ext)}) ne se lit pas dans un navigateur.</p><p class="small">${convHelp}</p><button class="btn tape-btn block" data-conv2>Télécharger le convertisseur</button>`; box.querySelector("[data-conv2]").addEventListener("click", downloadConverter); return; }

  const blob = file.type ? file : new Blob([file], { type: MIME[ext] || "video/mp4" });
  url = URL.createObjectURL(blob);
  box.innerHTML = `<video src="${url}" controls playsinline preload="metadata" style="width:100%;max-height:70vh;border-radius:12px;background:#000"></video>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn ghost small" data-tab>Ouvrir en grand dans un onglet</button></div><p data-verr></p>`;
  const v = box.querySelector("video"), err = box.querySelector("[data-verr]");
  box.querySelector("[data-tab]").addEventListener("click", () => window.open(url, "_blank"));
  const codecMsg = (why) => { err.innerHTML = `<span class="notice is-warn small" style="display:block">${why} ${convHelp}<br><button class="btn tape-btn small" data-conv2 style="margin-top:8px">Télécharger le convertisseur</button><br>En attendant, essaie « Ouvrir en grand dans un onglet », ou ${vlc}</span>`; };
  err.addEventListener("click", (e) => { if (e.target.closest("[data-conv2]")) downloadConverter(); });
  v.addEventListener("loadeddata", () => { if (v.videoWidth) { okCache[f.path] = 1; saveOk(); } });
  v.addEventListener("error", () => { okCache[f.path] = 0; saveOk(); });
  v.addEventListener("error", () => { const c = v.error?.code; codecMsg(c === 4 ? "Le navigateur ne sait pas décoder cette vidéo." : `Lecture impossible (code ${c || "?"}).`); });
  v.addEventListener("loadedmetadata", () => { if (!v.videoWidth) codecMsg("Le son passe mais pas l'image."); });
}
