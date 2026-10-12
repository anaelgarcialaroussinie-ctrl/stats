// Ma vidéothèque privée : les vidéos du disque dur du coach, lues directement sur l'ordinateur.
// Rien n'est envoyé en ligne : l'appli lit les fichiers sur place (Chrome ou Edge sur ordinateur).
import { esc, icon, openSheet, toast } from "../ui.js";
import { myNote, studyNotes } from "../study-notes.js";
import { store } from "../store.js";

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
const pretty = (n) => n.replace(VIDEO, "").replace(/[_]+/g, " ").replace(/\s+/g, " ").trim();

export function openLocalVideos() {
  const body = openSheet("Ma vidéothèque privée", "");
  let q = "";
  const intro = `<p class="small muted" style="margin-top:0">Les vidéos de ton disque dur, rangées par dossier et lues directement sur ton ordinateur : rien n'est mis en ligne, elles restent visibles par toi seul. Sous chaque vidéo : sa fiche de travail (si elle est prête sur le disque) et tes notes.</p>`;

  const draw = () => {
    if (!localSupported()) { body.innerHTML = intro + `<p class="notice is-warn small">Ouvre l'appli sur ton ordinateur, dans Chrome ou Edge, avec le disque dur branché. Sur téléphone, les navigateurs ne peuvent pas lire un disque dur. Tes notes, elles, suivent sur tous tes appareils.</p>`; return; }
    if (!files.length) { body.innerHTML = intro + `<button class="btn tape-btn block" data-pick>${icon("play")} Choisir le dossier des vidéos sur mon disque dur</button><p class="hint">Le navigateur te demande quel dossier ouvrir et l'autorisation de le lire. Les fichiers ne quittent pas ton ordinateur.</p>`; return; }
    const notes = studyNotes();
    const list = q ? files.filter((f) => f.path.toLowerCase().includes(q)) : files;
    const groups = [];
    list.forEach((f) => { let g = groups.find((x) => x.folder === f.folder); if (!g) groups.push(g = { folder: f.folder, items: [] }); g.items.push(f); });
    body.innerHTML = intro + `
      <div class="row" style="gap:8px;margin-bottom:10px"><input class="input" data-q placeholder="Rechercher (technique, auteur…)" value="${esc(q)}" style="flex:1"><button class="btn ghost small" data-pick>Changer de dossier</button></div>
      <p class="tiny muted">${files.length} vidéos dans ${new Set(files.map((f) => f.folder)).size} dossiers${root ? ` · dossier « ${esc(root.name)} »` : ""} · ${(() => { const n = files.filter((f) => fiches[f.path]).length; return n + (n > 1 ? " fiches prêtes" : " fiche prête"); })()}</p>
      ${groups.slice(0, 200).map((g) => `<details class="sys-card"${q ? " open" : ""}><summary><b>${esc(g.folder.split("/").pop())}</b><span class="tiny muted" style="display:block">${esc(g.folder.includes("/") ? g.folder.split("/").slice(0, -1).join(" › ") + " · " : "")}${g.items.length} vidéo${g.items.length > 1 ? "s" : ""}${g.items.some((i) => notes[`local:${i.path}`]) ? " · notes" : ""}</span></summary>
        ${fiches[`${g.folder}/__systeme__`] ? `<details style="margin:6px 0"><summary class="small" style="font-weight:700;cursor:pointer;color:var(--tape)">Fiche système de l'instructional</summary>${ficheHtml(fiches[`${g.folder}/__systeme__`])}</details>` : ""}
        ${g.items.map((i) => `<button class="row between" data-play="${esc(i.path)}" style="width:100%;text-align:left;background:none;border:0;border-top:1px solid var(--line);color:inherit;padding:10px 0;gap:8px"><span class="small">${esc(pretty(i.name))}${fiches[i.path] ? ` <span class="insigne">fiche</span>` : ""}${notes[`local:${i.path}`] ? ` <span class="tiny" style="color:var(--tape)">✎</span>` : ""}</span>${icon("play", 'style="width:18px;height:18px;flex:none"')}</button>`).join("")}
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
    try { files = (await scan(root, (n) => { const p = body.querySelector("[data-prog]"); if (p) p.textContent = `Lecture du disque dur… ${n} vidéos trouvées`; })).filter((f) => !f.path.startsWith("Fiches Fight Art/")); fiches = { ...(store.get().localFiches || {}), ...(await loadFiches(root)) }; }
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
  if (localSupported() && !files.length) loadHandle().then(async (h) => {
    if (!h) return;
    root = h;
    let perm = "prompt"; try { perm = await h.queryPermission({ mode: "read" }); } catch {}
    if (perm === "granted") await load();
    else body.innerHTML = intro + `<button class="btn tape-btn block" data-grant>${icon("play")} Rouvrir « ${esc(h.name)} »</button><button class="btn ghost block" data-pick style="margin-top:8px">Choisir un autre dossier</button><p class="hint">Branche le disque dur avant d'appuyer.</p>`;
  });
}

async function playVideo(f, back) {
  let url = "";
  try { url = URL.createObjectURL(await f.handle.getFile()); } catch { toast("Vidéo introuvable : le disque est-il branché ?"); return; }
  const body = openSheet(pretty(f.name), `
    <button class="btn ghost small" data-back style="margin-bottom:10px">${icon("back")} Retour à la vidéothèque</button>
    ${PLAYABLE.test(f.name) ? `<video src="${url}" controls playsinline preload="metadata" style="width:100%;border-radius:12px;background:#000"></video>` : `<p class="notice is-warn small">Ce format (${esc(f.name.split(".").pop())}) ne se lit pas dans le navigateur : ouvre-le avec VLC depuis ton disque dur.</p>`}
    <p class="tiny muted" style="margin:8px 0 0">${esc(f.folder)}</p>
    ${ficheHtml(fiches[f.path])}
    ${myNote(`local:${f.path}`, `Vidéo privée · ${pretty(f.name)}`, { placeholder: "Points clés, détails, erreurs, drills à faire, semaine du programme où l'utiliser…" })}`,
    { close: () => URL.revokeObjectURL(url) });
  body.querySelector("[data-back]").addEventListener("click", () => { URL.revokeObjectURL(url); back?.(); });
}
