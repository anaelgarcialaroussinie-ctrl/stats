// Parcours Fight Art côté fighters : le plan (positions, ceintures, transitions, semaines du programme),
// où trouver le contenu officiel, et les notes perso. Les vidéos achetées du coach ne sont pas partagées.
import { esc, openSheet, toast } from "../ui.js";
import { sync } from "../sync.js";
import { myNote } from "../study-notes.js";
import { positionIllus } from "../parcours-illus.js";
import { ficheCours } from "../parcours-fiches.js";
import { PARCOURS, POSITIONS, PARCOURS_BELTS, freeVideos } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

const q = (step) => `${step.author} ${step.m[0].source.replace(/\\[.*+?^${}()|[\]\\]|\(\?!.*?\)|\$|\\s\+|\\/g, " ").replace(/\s+/g, " ").trim()}`;
const yt = (step) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q(step))}`;
const web = (step) => `https://www.google.com/search?q=${encodeURIComponent(`${q(step)} instructional`)}`;

// vidéo YouTube : lecture intégrée (sans cookies) ; autre lien : bouton
const ytId = (u) => (String(u).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/) || [])[1];
const key = (x) => `parcours:${x.pos}:${x.title}`.slice(0, 120);

export function openParcoursPublic() {
  let belt = "", pos = "", links = [];
  const coach = sync.role() === "coach";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const name = (id) => POSITIONS.find((p) => p.id === id)?.label || id;
  const draw = () => {
    const vis = PARCOURS.filter((x) => (!belt || x.belt === belt) && (!pos || x.pos === pos));
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les instructionals choisis par le coach, rangés par position, de la ceinture blanche à la violette, avec les semaines du programme où ils servent. Une étape à la fois : regarde, retiens 2 ou 3 détails, drille, teste en sparring à thème.</p>
      <p class="tiny notice" style="margin:0 0 10px">Sous chaque étape : une vidéo gratuite d'un grand pédagogue (Danaher, Lachlan Giles, Gordon Ryan, Ryan Hall, John Smith), la fiche de cours, et les démos du coach. Choisis ta ceinture et une position pour aller droit au but.</p>
      <div class="chips" style="margin-bottom:6px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes ceintures</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-p="" aria-pressed="${!pos}">Toutes positions</button>${POSITIONS.filter((p) => PARCOURS.some((x) => x.pos === p.id && (!belt || x.belt === belt))).map((p) => `<button class="chip" data-p="${p.id}" aria-pressed="${pos === p.id}">${esc(p.label)}</button>`).join("")}</div>
      ${POSITIONS.filter((p) => vis.some((x) => x.pos === p.id)).map((p) => `<section style="margin:16px 0 6px">
        <div class="row between" style="gap:8px;align-items:baseline"><h3 class="sys-h" style="margin:0">${esc(p.label)}</h3><span class="tiny muted">programme : ${esc(p.sys)}</span></div>
        <p class="tiny muted" style="margin:2px 0 6px">${esc(p.note)}</p>
        ${positionIllus(p.id)}
        ${p.to.length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="tiny muted">Transitions →</span>${p.to.map(([id, how]) => `<button class="chip" data-p="${id}" style="font-size:12px">${esc(name(id))} <span class="muted">(${esc(how)})</span></button>`).join("")}</div>` : ""}
        ${vis.filter((x) => x.pos === p.id).map((x) => `<div class="sys-card" style="border-left:4px solid ${col(x.belt)};margin:8px 0;padding:10px 12px">
          <b class="small">${esc(x.title)}</b> <span class="tiny muted">· ${esc(x.author)} · semaines ${esc(x.w)}</span>
          <p class="tiny" style="margin:4px 0 8px">${esc(x.why)}</p>
          <details class="fiche-d"${pos ? " open" : ""}><summary class="small" style="font-weight:800;cursor:pointer;color:var(--tape)">Fiche de cours</summary>${ficheCours(x, esc)}</details>
          ${freeVideos(x).map((v) => v.id ? `<div style="margin:6px 0"><button class="yt-thumb" data-yt="${v.id}" aria-label="Lire ${esc(v.t)}" style="position:relative;display:block;width:100%;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:58px;height:58px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:24px">▶</span></span></button><p class="tiny muted" style="margin:4px 0 0">Vidéo gratuite · ${esc(v.a)} · « ${esc(v.t)} »</p></div>` : `<a class="btn ghost small" href="${esc(v.url)}" target="_blank" rel="noopener" style="margin:6px 0">${esc(v.t)}</a>`).join("")}
          ${links.filter((l) => l.topic === key(x)).map((l) => `<div style="margin:6px 0">${ytId(l.url) ? `<div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${ytId(l.url)}" title="${esc(l.title)}" loading="lazy" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>` : `<a class="btn tape-btn small" href="${esc(l.url)}" target="_blank" rel="noopener">Regarder : ${esc(l.title)}</a>`}${l.note ? `<p class="tiny muted" style="margin:4px 0 0">${esc(l.note)}</p>` : ""}${coach ? `<button class="btn ghost small" data-rmlink="${esc(l.id)}" style="margin-top:4px">Retirer cette vidéo</button>` : ""}</div>`).join("")}
          <div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn ghost small" href="${yt(x)}" target="_blank" rel="noopener">Extraits gratuits</a><a class="btn ghost small" href="${web(x)}" target="_blank" rel="noopener">Version officielle</a>${coach ? `<button class="btn tape-btn small" data-addv="${esc(key(x))}" data-t="${esc(x.title)}">+ Vidéo pour les fighters</button>` : ""}</div>
          ${myNote(`parcours:${x.pos}:${x.title}`, `Parcours · ${x.title}`, { placeholder: "Les 2 ou 3 détails que je retiens, mes drills, ce qui a marché en sparring…" })}
        </div>`).join("")}
      </section>`).join("")}`;
  };
  body.addEventListener("click", async (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?autoplay=1&rel=0" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const add = e.target.closest("[data-addv]");
    if (add) {
      const url = prompt("Lien de la vidéo pour cette étape (YouTube non répertorié de ta démo, ou vidéo gratuite officielle de l'auteur) :", "");
      if (!url) return;
      if (!/^https:\/\//i.test(url.trim())) { toast("Colle un lien qui commence par https://"); return; }
      const note = prompt("Un mot pour les fighters (facultatif) :", "") || "";
      try { await sync.saveLink({ title: add.dataset.t, url: url.trim(), topic: add.dataset.addv, note }); toast("Vidéo ajoutée au parcours"); await load(); } catch { toast("Impossible d'enregistrer : vérifie la connexion"); }
      return;
    }
    const rm = e.target.closest("[data-rmlink]");
    if (rm) {
      const l = links.find((x) => x.id === rm.dataset.rmlink); if (!l || !confirm("Retirer cette vidéo du parcours ?")) return;
      try { await sync.saveLink({ ...l, archived: true }); await load(); } catch { toast("Impossible de retirer : vérifie la connexion"); }
      return;
    }
    const b = e.target.closest("[data-b]"); if (b) { belt = b.dataset.b; draw(); return; }
    const p = e.target.closest("[data-p]"); if (p) { pos = p.dataset.p; draw(); body.closest(".sheet")?.scrollTo?.({ top: 0 }); }
  });
  const load = async () => { try { links = ((await sync.links()) || []).filter((l) => String(l.topic || "").startsWith("parcours:") && !l.archived); } catch { links = []; } if (body.isConnected) draw(); };
  draw(); load();
}
