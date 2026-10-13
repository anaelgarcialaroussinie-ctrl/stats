// Parcours Fight Art pour le club : vidéos YouTube de Nicolas Renier (NRFight, BJJ Fanatics, BJJ Fanatics France),
// en français ou avec sous-titres français, de la ceinture blanche à la violette, avec les points importants.
import { esc, openSheet, toast } from "../ui.js";
import { myNote } from "../study-notes.js";
import { sync } from "../sync.js";
import { PARCOURS_BELTS } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

// lang : fr = vidéo en français · en = anglais, sous-titres français
const VIDEOS = [
  // ---------- BLANCHE : survivre, se relever, contrôler ----------
  { belt: "blanche", pos: "La Luta Livre en vrai", id: "19ISpT8Gv3I", lang: "fr", t: "Sparring de 4 minutes de Luta Livre", pts: ["Regarde comment il reste toujours en contrôle avant d'attaquer.", "Les transitions s'enchaînent sans pause : position, puis soumission.", "Le rythme : calme quand il contrôle, explosif sur l'ouverture."] },
  { belt: "blanche", pos: "Debout : lutte", id: "abEedf1m4Mo", lang: "en", t: "Intégrer la lutte au grappling", pts: ["La lutte sert à arriver dessus, pas seulement à faire tomber.", "Des entrées simples et sûres, sans exposer le cou.", "Finir l'amenée en contrôle, pas en lâchant."] },
  { belt: "blanche", pos: "Garde", id: "ZSDGlElHSYQ", lang: "en", t: "Le jeu du dessous", pts: ["Dessous, jamais à plat : sur le côté, cadres en place.", "Garder les jambes entre toi et lui.", "Chercher à revenir dessus ou à te relever, pas à attendre."] },
  { belt: "blanche", pos: "Montée", id: "1mTj7PA2SPw", lang: "en", t: "Contrôler la montée", pts: ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Base large contre ses ponts.", "Contrôler avant d'attaquer."] },
  { belt: "blanche", pos: "Défense", id: "ppFg_2RmDto", lang: "fr", t: "2e ligne de défense : le coude (concept de John Danaher)", pts: ["Coudes collés au corps : la plupart des clés de bras deviennent impossibles.", "Si le coude sort, le récupérer avant qu'il isole le bras.", "Se défendre par étapes : mains, coudes, puis position."] },

  // ---------- BLEUE : construire ses positions et finir ----------
  { belt: "bleue", pos: "Passage de garde", id: "7Ghi4-3Ef0g", lang: "fr", t: "Passage de garde knee slice", pts: ["Le genou coupe en diagonale à travers sa cuisse.", "Contrôler la tête ou prendre l'underhook pendant le passage.", "Finir hanches basses, poitrine contre poitrine."] },
  { belt: "bleue", pos: "Passage de garde", id: "GIsb-RFpSfU", lang: "fr", t: "Passer la garde papillon", pts: ["Neutraliser ses crochets avant de passer.", "Poids bas, pas de poids sur les genoux.", "Contourner ou écraser selon sa réaction."] },
  { belt: "bleue", pos: "Passage de garde", id: "6ZhjBVtgkXI", lang: "en", t: "Passer la demi-garde", pts: ["Crossface et underhook : il doit rester à plat.", "Libérer le genou piégé petit à petit.", "Stabiliser en latéral ou en montée avant d'attaquer."] },
  { belt: "bleue", pos: "Demi-garde", id: "NSGkmvh8-Wc", lang: "fr", t: "Prendre le dos depuis la demi-garde", pts: ["Prendre l'underhook côté jambe piégée.", "Passer sous lui pour arriver dans son dos.", "Ceinture et crochets avant qu'il se retourne."] },
  { belt: "bleue", pos: "Latéral", id: "lXpFF0W2AxM", lang: "fr", t: "Latéral : compression musculaire", pts: ["Isoler le bras depuis le latéral.", "Le contrôle d'abord, la pression ensuite.", "Compression : finir lentement, le partenaire tape tôt."] },
  { belt: "bleue", pos: "Dos", id: "1wrC1xoLn6Y", lang: "en", t: "Prendre le dos", pts: ["La ceinture (seatbelt) avant les crochets.", "Suivre sa rotation au lieu de le retenir.", "Crochets à l'intérieur des cuisses, jamais chevilles croisées."] },
  { belt: "bleue", pos: "Dos", id: "PLHwIEN8c3k", lang: "en", t: "Attaquer le dos", pts: ["Gagner la bataille des mains avant l'étranglement.", "Ta tête collée à la sienne.", "S'il défend le cou : changer d'attaque, garder le dos."] },
  { belt: "bleue", pos: "Soumissions", id: "3Nm6DjvXwBo", lang: "fr", t: "Contre-attaque de la kimura en clé de bras", pts: ["Quand il défend la kimura, son bras s'offre pour la clé de bras.", "Garder le contrôle de son poignet pendant le changement.", "Une attaque qui en prépare une autre."] },
  { belt: "bleue", pos: "Soumissions", id: "N9vAGJu4ocs", lang: "en", t: "Guillotine : bras dedans ou bras dehors", pts: ["Choisir la version selon où est son bras.", "Poignet sous le menton, pas sur la mâchoire.", "Serrer avec les hanches, pas seulement les bras."] },

  // ---------- VIOLETTE : connecter les systèmes ----------
  { belt: "violette", pos: "Montée → soumission", id: "K8U6yVSsO_4", lang: "fr", t: "La guillotine depuis la montée : son système", pts: ["Depuis la montée, quand il pousse, son cou s'ouvre.", "Un système : chaque défense mène à l'option suivante.", "Garder la montée pendant la mise en place."] },
  { belt: "violette", pos: "Jambes", id: "DCIllKf8wzY", lang: "fr", t: "Clé de cheville : trouver l'espace et la bonne pression", pts: ["Créer l'espace avant de serrer.", "La bonne pression vient de l'axe du corps, pas des bras.", "Monter la pression progressivement : le partenaire tape tôt."] },
  { belt: "violette", pos: "Jambes", id: "fajHA6YtChI", lang: "en", t: "Entrée en clé de pied", pts: ["L'entrée compte plus que la finition.", "Contrôler son genou et ses hanches pendant l'entrée.", "S'il défend, enchaîner vers le passage."] },
  { belt: "violette", pos: "Soumissions", id: "W2o8_w98QGs", lang: "en", t: "Compression du biceps", pts: ["Une compression se met en place après le contrôle.", "Bloquer le bras avant de serrer.", "Très dangereuse : finir lentement à l'entraînement."] },
  { belt: "violette", pos: "Soumissions", id: "QzdAix8eT5I", lang: "en", t: "Soumission coude sur le mollet, depuis la papillon (dessus)", pts: ["Une attaque depuis le dessus de la garde papillon.", "Le coude sert de levier contre le mollet.", "À réserver aux pratiquants confirmés, en finissant lentement."] },
  { belt: "violette", pos: "Analyse de combat", id: "dMrnv72HtoY", lang: "fr", t: "Retour technique sur son combat à l'ADXC 4", pts: ["Voir comment les techniques passent en compétition.", "Repérer ses choix : quand il attaque, quand il contrôle.", "Comparer avec ton propre jeu."] },
];

const params = (lang) => `autoplay=1&rel=0&hl=fr${lang === "en" ? "&cc_load_policy=1&cc_lang_pref=fr" : ""}`;

export function openParcoursClub() {
  let belt = "", extra = [];
  const coach = sync.role() === "coach";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const card = (v) => `<div class="sys-card" style="border-left:4px solid ${col(v.belt)};margin:10px 0;padding:10px 12px">
      <div class="row between" style="gap:8px"><span class="tiny muted">${esc(v.pos)}</span><span class="tiny" style="font-weight:800;color:${v.lang === "fr" ? "var(--tape)" : "#9AA3AE"}">${v.lang === "fr" ? "🇫🇷 En français" : "VO · sous-titres FR"}</span></div>
      <b class="small">${esc(v.t)}</b> <span class="tiny muted">· Nicolas Renier</span>
      ${v.id ? `<button data-yt="${v.id}" data-lang="${v.lang}" aria-label="Lire" style="position:relative;display:block;width:100%;margin:8px 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>` : `<a class="btn ghost small" href="${esc(v.url)}" target="_blank" rel="noopener" style="margin:8px 0">Regarder</a>`}
      ${v.pts?.length ? `<div class="tiny" style="font-weight:800;color:var(--tape);text-transform:uppercase;letter-spacing:.04em">Points importants</div><ul class="bul" style="margin:4px 0 6px">${v.pts.map((n) => `<li class="small">${esc(n)}</li>`).join("")}</ul>` : ""}
      ${coach && v.linkId ? `<button class="btn ghost small" data-rm="${esc(v.linkId)}">Retirer</button>` : ""}
      ${myNote(`parcours-club:${v.id || v.url}`, `Parcours · ${v.t}`, { placeholder: "Ce que je retiens, mes drills, ce qui a marché…" })}
    </div>`;
  const draw = () => {
    const all = [...VIDEOS, ...extra];
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les vidéos techniques de Nicolas Renier, en français ou sous-titrées en français, de la ceinture blanche à la violette. Regarde celles de ta ceinture, retiens les points importants, puis travaille-les à l'entraînement.</p>
      <p class="tiny muted" style="margin:0 0 10px">Vidéo en anglais sans sous-titres français ? Dans le lecteur : ⚙ → Sous-titres → Traduire automatiquement → Français.</p>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      ${coach ? `<button class="btn ghost small" data-add style="margin-bottom:6px">+ Ajouter une vidéo de Nicolas Renier</button>` : ""}
      ${PARCOURS_BELTS.filter((b) => !belt || b.id === belt).map((b) => `
        <div class="row" style="gap:8px;margin:18px 0 4px;align-items:center"><span style="width:40px;height:12px;border-radius:3px;background:${col(b.id)};border:1px solid #555;flex:none"></span><h3 class="sys-h" style="margin:0">Ceinture ${esc(b.label.toLowerCase())}</h3></div>
        <p class="tiny muted" style="margin:0 0 4px">${esc(b.goal)}</p>
        ${all.filter((v) => v.belt === b.id).map(card).join("")}`).join("")}
      <a class="btn ghost block" href="https://www.youtube.com/@NRFight/videos" target="_blank" rel="noopener" style="margin-top:14px">Toute la chaîne de Nicolas Renier</a>`;
  };
  const ytId = (u) => (String(u).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/) || [])[1];
  const load = async () => {
    try {
      extra = ((await sync.links()) || []).filter((l) => String(l.topic || "").startsWith("parcours-club:")).map((l) => {
        const [, b, lang] = l.topic.split(":");
        return { belt: b, lang: lang || "fr", pos: "Ajoutée par le coach", t: l.title, id: ytId(l.url), url: l.url, pts: String(l.note || "").split(" / ").map((x) => x.trim()).filter(Boolean), linkId: l.id };
      });
    } catch { extra = []; }
    if (body.isConnected) draw();
  };
  body.addEventListener("click", async (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;margin:8px 0;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?${params(th.dataset.lang)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const b = e.target.closest("[data-b]"); if (b) { belt = b.dataset.b; draw(); return; }
    if (e.target.closest("[data-add]")) {
      const url = prompt("Lien YouTube de la vidéo de Nicolas Renier :", ""); if (!url) return;
      if (!/^https:\/\//i.test(url.trim())) { toast("Colle un lien qui commence par https://"); return; }
      const t = prompt("Titre en français :", ""); if (!t) return;
      const bl = (prompt("Ceinture : blanche, bleue ou violette ?", "blanche") || "").trim().toLowerCase();
      if (!["blanche", "bleue", "violette"].includes(bl)) { toast("Ceinture : blanche, bleue ou violette"); return; }
      const lang = confirm("La vidéo est-elle en français ? (OK = oui, Annuler = anglais sous-titré)") ? "fr" : "en";
      const pts = prompt("Points importants, séparés par « / » :", "") || "";
      try { await sync.saveLink({ title: t.trim(), url: url.trim(), topic: `parcours-club:${bl}:${lang}`, note: pts }); toast("Vidéo ajoutée au parcours"); await load(); } catch { toast("Impossible d'enregistrer : vérifie la connexion"); }
      return;
    }
    const rm = e.target.closest("[data-rm]");
    if (rm && confirm("Retirer cette vidéo du parcours ?")) {
      const l = extra.find((x) => x.linkId === rm.dataset.rm);
      try { await sync.saveLink({ id: l.linkId, title: l.t, url: l.url, topic: `parcours-club:${l.belt}:${l.lang}`, note: l.pts.join(" / "), archived: true }); await load(); } catch { toast("Impossible de retirer : vérifie la connexion"); }
    }
  });
  draw(); load();
}
