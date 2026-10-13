// Parcours Fight Art pour le club : les vidéos gratuites des références (Nicolas Renier, John Danaher, Lachlan Giles,
// Gordon Ryan, Ryan Hall, John Smith), en français ou avec sous-titres français, de la ceinture blanche à la violette.
import { esc, openSheet, toast } from "../ui.js";
import { myNote } from "../study-notes.js";
import { sync } from "../sync.js";
import { PARCOURS_BELTS } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

// a : auteur · lang : fr = vidéo en français, en = anglais avec sous-titres français
// Ordre dans chaque ceinture : debout → défense → garde → demi-garde → passage → latéral → montée → dos → jambes → soumissions.
const VIDEOS = [
  // ---------- BLANCHE : survivre, se relever, contrôler ----------
  { belt: "blanche", pos: "Pour commencer", a: "Nicolas Renier", id: "19ISpT8Gv3I", lang: "fr", t: "Sparring de 4 minutes de Luta Livre", pts: ["Regarde comment il reste toujours en contrôle avant d'attaquer.", "Les transitions s'enchaînent sans pause : position, puis soumission.", "Le rythme : calme quand il contrôle, explosif sur l'ouverture."] },
  { belt: "blanche", pos: "Debout : lutte", a: "Nicolas Renier", id: "abEedf1m4Mo", lang: "en", t: "Intégrer la lutte au grappling", pts: ["La lutte sert à arriver dessus, pas seulement à faire tomber.", "Des entrées simples et sûres, sans exposer le cou.", "Finir l'amenée en contrôle, pas en lâchant."] },
  { belt: "blanche", pos: "Debout : lutte", a: "Lachlan Giles", id: "7igJLHdcg1I", lang: "en", t: "Le double leg en no-gi", pts: ["Changer de niveau en pliant les jambes, pas en se penchant.", "Le pas de pénétration va entre ses pieds, tête haute, dos droit.", "Finir en tournant ou en poussant sur l'angle, pas en tirant tout droit."] },
  { belt: "blanche", pos: "Debout : lutte", a: "John Smith", id: "2bEGb61bGpg", lang: "en", t: "Finir le low single", pts: ["Tête à l'extérieur, contre sa hanche : à l'abri de la guillotine.", "Remonter en gardant la jambe collée à toi.", "Finir en angle plutôt qu'en poussant droit devant."] },
  { belt: "blanche", pos: "Défense", a: "Nicolas Renier", id: "ppFg_2RmDto", lang: "fr", t: "2e ligne de défense : le coude (concept de John Danaher)", pts: ["Coudes collés au corps : la plupart des clés de bras deviennent impossibles.", "Si le coude sort, le récupérer avant qu'il isole le bras.", "Se défendre par étapes : mains, coudes, puis position."] },
  { belt: "blanche", pos: "Défense", a: "Lachlan Giles", id: "Ti7gpEVwMmE", lang: "en", t: "Les fondamentaux des sorties", pts: ["Les cadres (avant-bras, genoux) d'abord, le mouvement ensuite.", "Pont et crevette créent l'espace, puis on remet la garde ou on se relève.", "Ne jamais pousser bras tendus : il s'appuie dessus."] },
  { belt: "blanche", pos: "Défense", a: "John Danaher", id: "cuXq-k__9lQ", lang: "en", t: "Sortir du latéral", pts: ["Cadres sur son cou et sa hanche avant de bouger.", "Pont puis crevette pour créer l'espace.", "Remettre le genou dans l'espace, puis la garde."] },
  { belt: "blanche", pos: "Défense", a: "John Danaher", id: "EMEueexp9zU", lang: "en", t: "Sortir de la montée", pts: ["Coudes collés : ne pas lui donner les bras.", "Pont pour le déséquilibrer, puis sortie coude-genou.", "Récupérer la demi-garde ou la garde, ne pas rester à plat."] },
  { belt: "blanche", pos: "Défense", a: "Lachlan Giles", id: "Ly89G4iCTSQ", lang: "en", t: "Sortir de la tortue en roulant vers la garde", pts: ["En tortue sans prise : d'abord protéger le cou.", "Rouler vers la garde pour ne pas rester en dessous.", "Garder les coudes collés aux genoux pendant la sortie."] },
  { belt: "blanche", pos: "Garde", a: "John Danaher", id: "ce_0XT1BBQA", lang: "en", t: "La rétention de garde", pts: ["Tes jambes restent toujours entre toi et lui.", "Tourner sur le dos et les épaules pour remettre les pieds face à lui.", "Distance : très près ou loin, jamais entre les deux."] },
  { belt: "blanche", pos: "Garde", a: "Nicolas Renier", id: "ZSDGlElHSYQ", lang: "en", t: "Le jeu du dessous", pts: ["Dessous, jamais à plat : sur le côté, cadres en place.", "Garder les jambes entre toi et lui.", "Chercher à revenir dessus ou à te relever, pas à attendre."] },
  { belt: "blanche", pos: "Garde", a: "Gordon Ryan", id: "nU9YxDabnSU", lang: "en", t: "Comprendre la garde fermée", pts: ["Casser sa posture avant toute attaque.", "Prendre un angle en sortant les hanches sur le côté.", "Enchaîner : s'il se redresse, renversement ; s'il pousse, soumission."] },
  { belt: "blanche", pos: "Montée", a: "Nicolas Renier", id: "1mTj7PA2SPw", lang: "en", t: "Contrôler la montée", pts: ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Base large contre ses ponts.", "Contrôler avant d'attaquer."] },

  // ---------- BLEUE : construire ses positions et finir ----------
  { belt: "bleue", pos: "Debout : lutte", a: "John Danaher", id: "-rC5-LeRu2o", lang: "en", t: "Les amenées les plus simples en no-gi", pts: ["Choisir des amenées simples et sûres, sans exposer le cou.", "Une amenée n'est finie que quand tu contrôles dessus.", "Enchaîner selon sa réaction : il recule, il pousse, il tourne."] },
  { belt: "bleue", pos: "Défense", a: "Gordon Ryan", id: "juaHGE92Vec", lang: "en", t: "Sortir de la guillotine", pts: ["Main sur son poignet, menton rentré.", "Passer du côté de son bras pour l'empêcher de serrer.", "Ne pas tirer la tête en arrière."] },
  { belt: "bleue", pos: "Garde", a: "John Danaher", id: "gOFADlBRlgY", lang: "en", t: "Comprendre la garde ouverte no-gi", pts: ["Deux gardes de base en no-gi : assise et sur le dos.", "Assis : prêt à lutter ou à te relever ; sur le dos : contrôle de la distance.", "Passer de l'une à l'autre selon qu'il est debout ou à genoux."] },
  { belt: "bleue", pos: "Demi-garde", a: "John Danaher", id: "Ze10eulM1xg", lang: "en", t: "Construire son jeu de demi-garde no-gi", pts: ["Sur le côté, jamais à plat dos.", "L'underhook côté jambe piégée est la clé.", "Trois directions : vers son dos, vers la lutte, vers ses jambes."] },
  { belt: "bleue", pos: "Demi-garde", a: "Nicolas Renier", id: "NSGkmvh8-Wc", lang: "fr", t: "Prendre le dos depuis la demi-garde", pts: ["Prendre l'underhook côté jambe piégée.", "Passer sous lui pour arriver dans son dos.", "Ceinture et crochets avant qu'il se retourne."] },
  { belt: "bleue", pos: "Passage de garde", a: "John Danaher", id: "isv_6Hd1Iac", lang: "en", t: "Bien passer la garde en no-gi", pts: ["Contrôler ses jambes ou ses hanches avant de passer.", "Choisir sa famille de passage : par-dessus, autour ou en dessous.", "Passage fini = poitrine contre poitrine, hanches contrôlées, 3 secondes."] },
  { belt: "bleue", pos: "Passage de garde", a: "Nicolas Renier", id: "7Ghi4-3Ef0g", lang: "fr", t: "Passage de garde knee slice", pts: ["Le genou coupe en diagonale à travers sa cuisse.", "Contrôler la tête ou prendre l'underhook pendant le passage.", "Finir hanches basses, poitrine contre poitrine."] },
  { belt: "bleue", pos: "Passage de garde", a: "Nicolas Renier", id: "GIsb-RFpSfU", lang: "fr", t: "Passer la garde papillon", pts: ["Neutraliser ses crochets avant de passer.", "Poids bas, pas de poids sur les genoux.", "Contourner ou écraser selon sa réaction."] },
  { belt: "bleue", pos: "Montée", a: "John Danaher", id: "8FbGenSia08", lang: "en", t: "Attaquer depuis la montée", pts: ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Isoler un bras avant d'attaquer.", "Garder la base (mains au sol) contre ses ponts."] },
  { belt: "bleue", pos: "Dos", a: "Nicolas Renier", id: "1wrC1xoLn6Y", lang: "en", t: "Prendre le dos", pts: ["La ceinture (seatbelt) avant les crochets.", "Suivre sa rotation au lieu de le retenir.", "Crochets à l'intérieur des cuisses, jamais chevilles croisées."] },
  { belt: "bleue", pos: "Dos", a: "Nicolas Renier", id: "PLHwIEN8c3k", lang: "en", t: "Attaquer le dos", pts: ["Gagner la bataille des mains avant l'étranglement.", "Ta tête collée à la sienne.", "S'il défend le cou : changer d'attaque, garder le dos."] },
  { belt: "bleue", pos: "Jambes", a: "Gordon Ryan", id: "uxCWCwnF6EQ", lang: "en", t: "Sortir d'une clé de talon", pts: ["Cacher le talon, garder le genou dans l'axe.", "Ne jamais tourner dans le sens de la clé de talon.", "Taper tôt à l'entraînement. Clés de talon : adultes confirmés uniquement."] },
  { belt: "bleue", pos: "Soumissions", a: "Lachlan Giles", id: "mLLQBxG1ojo", lang: "en", t: "La série kimura depuis la demi-garde", pts: ["Prise en figure 4 : ta main sur son poignet, ton autre bras sous le sien.", "Depuis la demi-garde, la kimura sert aussi à renverser.", "Décoller son bras du corps avant de tourner."] },
  { belt: "bleue", pos: "Soumissions", a: "Nicolas Renier", id: "3Nm6DjvXwBo", lang: "fr", t: "Contre-attaque de la kimura en clé de bras", pts: ["Quand il défend la kimura, son bras s'offre pour la clé de bras.", "Garder le contrôle de son poignet pendant le changement.", "Une attaque qui en prépare une autre."] },
  { belt: "bleue", pos: "Soumissions", a: "Nicolas Renier", id: "N9vAGJu4ocs", lang: "en", t: "Guillotine : bras dedans ou bras dehors", pts: ["Choisir la version selon où est son bras.", "Poignet sous le menton, pas sur la mâchoire.", "Serrer avec les hanches, pas seulement les bras."] },

  // ---------- VIOLETTE : connecter les systèmes ----------
  { belt: "violette", pos: "Debout : lutte", a: "John Danaher", id: "Lxvwd26mYss", lang: "en", t: "Body lock de face ou de côté", pts: ["Body lock de face ou de côté : chaque prise a ses projections.", "Mains jointes à la taille, hanches collées sous les siennes.", "Les crochets de jambe finissent plus sûrement que la force."] },
  { belt: "violette", pos: "Front headlock", a: "Gordon Ryan", id: "8hzRbpUfawY", lang: "en", t: "Les attaques depuis le front headlock", pts: ["Son menton sous ton aisselle, ton poids sur sa nuque.", "Te décaler sur le côté pour faire tomber son poids vers l'avant.", "Selon sa réaction : guillotine, d'arce ou prise de dos."] },
  { belt: "violette", pos: "Passage de garde", a: "Gordon Ryan", id: "r-FNcolHsg4", lang: "en", t: "Le passage en body lock", pts: ["Mains jointes autour de ses hanches, tête basse et collée.", "Écraser ses hanches au sol avant de libérer tes jambes.", "Stabiliser en latéral avant d'attaquer."] },
  { belt: "violette", pos: "Passage de garde", a: "Nicolas Renier", id: "6ZhjBVtgkXI", lang: "en", t: "Passer la demi-garde", pts: ["Crossface et underhook : il doit rester à plat.", "Libérer le genou piégé petit à petit.", "Stabiliser en latéral ou en montée avant d'attaquer."] },
  { belt: "violette", pos: "Latéral", a: "John Danaher", id: "Nk47F1A3epo", lang: "en", t: "Du latéral au dos quand il se retourne", pts: ["Quand il se retourne pour sortir du latéral, son dos s'ouvre.", "Suivre sa rotation au lieu de le retenir.", "Placer les crochets et la ceinture avant qu'il ne se relève."] },
  { belt: "violette", pos: "Latéral", a: "Nicolas Renier", id: "lXpFF0W2AxM", lang: "fr", t: "Latéral : compression musculaire", pts: ["Isoler le bras depuis le latéral.", "Le contrôle d'abord, la pression ensuite.", "Compression : finir lentement, le partenaire tape tôt."] },
  { belt: "violette", pos: "Montée", a: "Nicolas Renier", id: "K8U6yVSsO_4", lang: "fr", t: "La guillotine depuis la montée : son système", pts: ["Depuis la montée, quand il pousse, son cou s'ouvre.", "Un système : chaque défense mène à l'option suivante.", "Garder la montée pendant la mise en place."] },
  { belt: "violette", pos: "Dos", a: "Ryan Hall", id: "7WCuDZ_OAnY", lang: "en", t: "Finir en kimura depuis le crucifix", pts: ["Depuis le crucifix, son bras piégé ouvre les finitions.", "Contrôler avant de finir, toujours.", "Finir lentement à l'entraînement : épaules fragiles."] },
  { belt: "violette", pos: "Dos", a: "Lachlan Giles", id: "9TRErC6vbKo", lang: "en", t: "Sortir du dos en no-gi", pts: ["Deux mains sur le bras qui étrangle : le cou d'abord.", "Faire glisser les épaules au sol du côté de son bras du dessous.", "Retirer un crochet, puis tourner face à lui."] },
  { belt: "violette", pos: "Jambes", a: "Gordon Ryan", id: "AamW7ZXYgJ4", lang: "en", t: "De l'underhook à l'ashi garami", pts: ["L'underhook sur sa jambe ouvre l'entrée en ashi garami.", "Contrôler ses hanches et son genou avant la finition.", "Finir lentement ; s'il défend bien, passer la garde."] },
  { belt: "violette", pos: "Jambes", a: "Nicolas Renier", id: "DCIllKf8wzY", lang: "fr", t: "Clé de cheville : trouver l'espace et la bonne pression", pts: ["Créer l'espace avant de serrer.", "La bonne pression vient de l'axe du corps, pas des bras.", "Monter la pression progressivement : le partenaire tape tôt."] },
  { belt: "violette", pos: "Soumissions", a: "Nicolas Renier", id: "W2o8_w98QGs", lang: "en", t: "Compression du biceps", pts: ["Une compression se met en place après le contrôle.", "Bloquer le bras avant de serrer.", "Très dangereuse : finir lentement à l'entraînement."] },
  { belt: "violette", pos: "Analyse de combat", a: "Nicolas Renier", id: "dMrnv72HtoY", lang: "fr", t: "Retour technique sur son combat à l'ADXC 4", pts: ["Voir comment les techniques passent en compétition.", "Repérer ses choix : quand il attaque, quand il contrôle.", "Comparer avec ton propre jeu."] },
];

const params = (lang) => `autoplay=1&rel=0&hl=fr${lang === "en" ? "&cc_load_policy=1&cc_lang_pref=fr" : ""}`;

export function openParcoursClub() {
  let belt = "", extra = [];
  const coach = sync.role() === "coach";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const card = (v) => `<div class="sys-card" style="border-left:4px solid ${col(v.belt)};margin:10px 0;padding:10px 12px">
      <div class="row between" style="gap:8px"><span class="tiny muted">${esc(v.pos)}</span><span class="tiny" style="font-weight:800;color:${v.lang === "fr" ? "var(--tape)" : "#9AA3AE"}">${v.lang === "fr" ? "🇫🇷 En français" : "VO · sous-titres FR"}</span></div>
      <b class="small">${esc(v.t)}</b> <span class="tiny muted">· ${esc(v.a || "")}</span>
      ${v.id ? `<button data-yt="${v.id}" data-lang="${v.lang}" aria-label="Lire" style="position:relative;display:block;width:100%;margin:8px 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>` : `<a class="btn ghost small" href="${esc(v.url)}" target="_blank" rel="noopener" style="margin:8px 0">Regarder</a>`}
      ${v.pts?.length ? `<div class="tiny" style="font-weight:800;color:var(--tape);text-transform:uppercase;letter-spacing:.04em">Points importants</div><ul class="bul" style="margin:4px 0 6px">${v.pts.map((n) => `<li class="small">${esc(n)}</li>`).join("")}</ul>` : ""}
      ${coach && v.linkId ? `<button class="btn ghost small" data-rm="${esc(v.linkId)}">Retirer</button>` : ""}
      ${myNote(`parcours-club:${v.id || v.url}`, `Parcours · ${v.t}`, { placeholder: "Ce que je retiens, mes drills, ce qui a marché…" })}
    </div>`;
  const draw = () => {
    const all = [...VIDEOS, ...extra];
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les meilleures vidéos gratuites des références (Nicolas Renier, John Danaher, Lachlan Giles, Gordon Ryan, Ryan Hall, John Smith), dans l'ordre d'apprentissage, de la ceinture blanche à la violette. Regarde celles de ta ceinture dans l'ordre, retiens les points importants, puis travaille-les à l'entraînement.</p>
      <p class="tiny muted" style="margin:0 0 10px">Vidéo en anglais sans sous-titres français ? Dans le lecteur : ⚙ → Sous-titres → Traduire automatiquement → Français.</p>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      ${coach ? `<button class="btn ghost small" data-add style="margin-bottom:6px">+ Ajouter une vidéo au parcours</button>` : ""}
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
        return { belt: b, lang: lang || "fr", pos: "Ajoutée par le coach", a: "", t: l.title, id: ytId(l.url), url: l.url, pts: String(l.note || "").split(" / ").map((x) => x.trim()).filter(Boolean), linkId: l.id };
      });
    } catch { extra = []; }
    if (body.isConnected) draw();
  };
  body.addEventListener("click", async (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;margin:8px 0;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?${params(th.dataset.lang)}" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const b = e.target.closest("[data-b]"); if (b) { belt = b.dataset.b; draw(); return; }
    if (e.target.closest("[data-add]")) {
      const url = prompt("Lien YouTube de la vidéo :", ""); if (!url) return;
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
