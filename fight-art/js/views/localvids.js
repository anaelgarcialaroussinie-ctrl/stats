// Ma vidéothèque privée : les vidéos du disque dur du coach, lues directement sur l'ordinateur.
// Rien n'est envoyé en ligne : l'appli lit les fichiers sur place (Chrome ou Edge sur ordinateur).
import { esc, icon, openSheet, toast } from "../ui.js";
import { myNote, studyNotes } from "../study-notes.js";
import { store } from "../store.js";
import { DISCIPLINES, classify, translateTitle } from "../vid-classify.js";

const VIDEO = /\.(mp4|m4v|mov|webm|mkv|avi|wmv|mpg|mpeg|flv|ts)$/i;
const PLAYABLE = /\.(mp4|m4v|mov|webm|mkv)$/i;
export const localSupported = () => typeof window.showDirectoryPicker === "function";

// on garde l'accès au dossier d'une fois sur l'autre (le navigateur redemande juste l'autorisation)
const db = () => new Promise((ok, ko) => { const r = indexedDB.open("fap-local", 1); r.onupgradeneeded = () => r.result.createObjectStore("h"); r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error); });
async function saveHandle(h) { const d = await db(); await new Promise((ok, ko) => { const t = d.transaction("h", "readwrite"); try { t.objectStore("h").put(h, "dir"); } catch (e) { ko(e); return; } t.oncomplete = ok; t.onerror = ok; }); }
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
  const nat = (a, b) => a.localeCompare(b, "fr", { numeric: true, sensitivity: "base" });
  return out.sort((a, b) => nat(a.folder, b.folder) || nat(a.name, b.name));
}
// catalogue synchronisé sur le compte du coach (lui seul) : titres + dossiers, pas les vidéos
function saveCatalog() {
  const folders = {};
  files.forEach((f) => { (folders[f.folder] ||= []).push(f.name); });
  store.update((s) => { s.localCatalog = { at: new Date().toISOString(), root: root?.name || "", folders }; if (Object.keys(fiches).length) s.localFiches = { ...(s.localFiches || {}), ...fiches }; });
}
function fromCatalog() {
  const c = store.get().localCatalog;
  if (!c?.folders) return [];
  return Object.entries(c.folders).flatMap(([folder, names]) => names.map((name) => ({ path: folder === "(racine)" ? name : `${folder}/${name}`, folder, name, handle: null })));
}
// nom affiché d'un dossier : « Vol 1 » seul ne dit rien, on garde le nom de l'instructional au-dessus
const folderName = (folder) => { const p = folder.split("/"); const last = p.pop(); return p.length && /^(vol|volume|part|partie|disc|disque|dvd|chapter|chapitre|\d)/i.test(last) ? `${p.pop()} · ${last}` : last; };
const linkOf = (folder) => (store.get().localLinks || {})[folder] || "";
const pretty = (n) => n.replace(VIDEO, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

export function openLocalVideos() {
  const body = openSheet("Ma vidéothèque privée", "");
  let q = "", disc = "";
  const phone = !localSupported();
  const intro = phone ? `<p class="small muted" style="margin-top:0">Sur téléphone : ton catalogue, tes fiches et tes notes. Pour regarder, ajoute à chaque instructional le lien privé de son dossier sur ton Google Drive ou OneDrive (partage « restreint », toi seul). Les liens restent sur ton compte coach, personne d'autre ne les voit.</p>` : `<p class="small muted" style="margin-top:0">Les vidéos de ton disque dur, rangées par discipline et lues directement sur ton ordinateur : rien n'est mis en ligne, elles restent visibles par toi seul. Sous chaque vidéo : sa fiche de travail (si elle est prête sur le disque) et tes notes.</p>`;

  const draw = () => {
    if (!localSupported()) {
      if (!files.length) { files = fromCatalog(); fiches = { ...(store.get().localFiches || {}) }; }
      if (!files.length) { body.innerHTML = intro + `<p class="notice is-warn small">Ouvre d'abord la vidéothèque une fois sur ton ordinateur (Chrome ou Edge, disque branché) : le catalogue arrive ensuite ici automatiquement.</p>`; return; }
    }
    if (!files.length) { body.innerHTML = intro + `<button class="btn tape-btn block" data-pick>${icon("play")} Choisir le dossier des vidéos sur mon disque dur</button><p class="hint">Le navigateur te demande quel dossier ouvrir et l'autorisation de le lire. Les fichiers ne quittent pas ton ordinateur.</p>`; return; }
    const notes = studyNotes();
    const list = q ? files.filter((f) => f.path.toLowerCase().includes(q)) : files;
    const groups = [];
    list.forEach((f) => { let g = groups.find((x) => x.folder === f.folder); if (!g) groups.push(g = { folder: f.folder, items: [] }); g.items.push(f); });
    // chaque instructional reçoit sa discipline (nom du dossier + noms des vidéos)
    groups.forEach((g) => { g.disc = classify(`${g.folder} ${g.folder} ${g.items.slice(0, 30).map((i) => i.name).join(" ")}`); });
    const counts = {}; groups.forEach((g) => { counts[g.disc.id] = (counts[g.disc.id] || 0) + 1; });
    const shown = disc ? groups.filter((g) => g.disc.id === disc) : groups;
    const ordered = DISCIPLINES.flatMap((d) => shown.filter((g) => g.disc.id === d.id));
    body.innerHTML = intro + `
      <div class="row" style="gap:8px;margin-bottom:10px"><input class="input" data-q placeholder="Rechercher (technique, auteur…)" value="${esc(q)}" style="flex:1">${phone ? "" : `<button class="btn ghost small" data-pick>Changer de dossier</button>`}</div>
      <div class="chips" style="margin-bottom:8px"><button class="chip" data-vdisc="" aria-pressed="${!disc}">Tout · ${groups.length}</button>${DISCIPLINES.filter((d) => counts[d.id]).map((d) => `<button class="chip" data-vdisc="${d.id}" aria-pressed="${disc === d.id}"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${d.color};margin-right:6px"></span>${esc(d.label)} · ${counts[d.id]}</button>`).join("")}</div>
      <p class="tiny muted">${files.length} vidéos dans ${new Set(files.map((f) => f.folder)).size} dossiers${root ? ` · dossier « ${esc(root.name)} »` : ""} · ${(() => { const n = files.filter((f) => fiches[f.path]).length; return n + (n > 1 ? " fiches prêtes" : " fiche prête"); })()} · titres traduits automatiquement</p>
      ${ordered.slice(0, 300).map((g, gi) => `${gi === 0 || ordered[gi - 1].disc.id !== g.disc.id ? `<h3 class="sys-h" style="color:${g.disc.color};margin-top:14px">${esc(g.disc.label)}</h3>` : ""}<details class="sys-card" style="border-left:4px solid ${g.disc.color}"${q ? " open" : ""}><summary><b>${esc(translateTitle(folderName(g.folder)))}</b><span class="tiny muted" style="display:block">${esc(folderName(g.folder))} · ${g.items.length} vidéo${g.items.length > 1 ? "s" : ""}${g.items.some((i) => notes[`local:${i.path}`]) ? " · notes" : ""}</span></summary>
        <div class="row" style="gap:8px;margin:6px 0;flex-wrap:wrap">${linkOf(g.folder) ? `<a class="btn tape-btn small" href="${esc(linkOf(g.folder))}" target="_blank" rel="noopener">${icon("play")} Regarder (mon Drive)</a>` : ""}<button class="btn ghost small" data-flink="${esc(g.folder)}">${linkOf(g.folder) ? "Modifier le lien" : "Ajouter le lien privé (Drive / OneDrive)"}</button></div>
        ${fiches[`${g.folder}/__systeme__`] ? `<details style="margin:6px 0"><summary class="small" style="font-weight:700;cursor:pointer;color:var(--tape)">Fiche système de l'instructional</summary>${ficheHtml(fiches[`${g.folder}/__systeme__`])}</details>` : ""}
        ${g.items.map((i) => `<button class="row between" data-play="${esc(i.path)}" style="width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);color:inherit;padding:10px 0;gap:8px"><span style="min-width:0"><span class="small">${esc(translateTitle(pretty(i.name)))}${fiches[i.path] ? ` <span class="insigne">fiche</span>` : ""}${notes[`local:${i.path}`] ? ` <span class="tiny" style="color:var(--tape)">✎</span>` : ""}</span><span class="tiny muted" style="display:block">${esc(pretty(i.name))}</span></span>${icon("play", 'style="width:18px;height:18px;flex:none"')}</button>`).join("")}
      </details>`).join("")}
      <button class="btn ghost block" data-export style="margin-top:14px">Exporter le catalogue (pour préparer les fiches avec Claude)</button>`;
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
    try { files = (await scan(root, (n) => { const p = body.querySelector("[data-prog]"); if (p) p.textContent = `Lecture du disque dur… ${n} vidéos trouvées`; })).filter((f) => !f.path.startsWith("Fiches Fight Art/")); fiches = { ...(store.get().localFiches || {}), ...(await loadFiches(root)) }; saveCatalog(); }
    catch (e) { files = []; toast("Impossible de lire ce dossier : le disque est-il bien branché ?"); body.innerHTML = `<p class="notice is-warn small">Lecture impossible (${esc(e?.message || "erreur inconnue")}). Vérifie que le disque est branché, puis choisis le dossier principal des vidéos.</p><button class="btn tape-btn block" data-pick style="margin-top:10px">Choisir le dossier</button>`; return; }
    draw();
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
      const v = prompt(`Lien privé du dossier « ${folderName(folder)} » sur ton Google Drive ou OneDrive (laisser vide pour retirer) :`, linkOf(folder));
      if (v === null) return;
      const url = v.trim();
      if (url && !/^https:\/\//i.test(url)) { toast("Colle un lien qui commence par https://"); return; }
      store.update((s) => { s.localLinks = { ...(s.localLinks || {}) }; if (url) s.localLinks[folder] = url; else delete s.localLinks[folder]; });
      toast(url ? "Lien enregistré (visible par toi seul)" : "Lien retiré"); draw(); return;
    }
    const dc = e.target.closest("[data-vdisc]");
    if (dc) { disc = dc.dataset.vdisc; draw(); return; }
    const pl = e.target.closest("[data-play]");
    if (pl) { const f = files.find((x) => x.path === pl.dataset.play); if (f) playVideo(f, () => { openLocalVideos(); }); return; }
    if (e.target.closest("[data-export]")) {
      const rows = [["dossier", "fichier"], ...files.map((f) => [f.folder, f.name])];
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
      const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv" })); a.download = "catalogue-videos.csv"; a.click();
      toast("Catalogue téléchargé : envoie-le à Claude pour préparer les fiches");
    }
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
  if (!PLAYABLE.test(f.name)) { box.innerHTML = `<p class="notice is-warn small">Ce format (.${esc(ext)}) ne se lit pas dans un navigateur. ${vlc}</p>`; return; }

  const blob = file.type ? file : new Blob([file], { type: MIME[ext] || "video/mp4" });
  url = URL.createObjectURL(blob);
  box.innerHTML = `<video src="${url}" controls playsinline preload="metadata" style="width:100%;max-height:70vh;border-radius:12px;background:#000"></video>
    <div class="row" style="gap:8px;margin-top:8px;flex-wrap:wrap"><button class="btn ghost small" data-tab>Ouvrir en grand dans un onglet</button></div><p data-verr></p>`;
  const v = box.querySelector("video"), err = box.querySelector("[data-verr]");
  box.querySelector("[data-tab]").addEventListener("click", () => window.open(url, "_blank"));
  const codecMsg = (why) => { err.innerHTML = `<span class="notice is-warn small" style="display:block">${why} C'est souvent une vidéo encodée en HEVC (H.265), que Chrome sur PC ne sait pas toujours lire. Essaie « Ouvrir en grand dans un onglet », sinon dans Edge (avec l'extension gratuite « Extensions vidéo HEVC » de Microsoft), ou ${vlc}</span>`; };
  v.addEventListener("error", () => { const c = v.error?.code; codecMsg(c === 4 ? "Le navigateur ne sait pas décoder cette vidéo." : `Lecture impossible (code ${c || "?"}).`); });
  v.addEventListener("loadedmetadata", () => { if (!v.videoWidth) codecMsg("Le son passe mais pas l'image."); });
}
