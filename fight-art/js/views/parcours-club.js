// Parcours Fight Art pour le club : les vidéos gratuites des références (Nicolas Renier, John Danaher, Lachlan Giles,
// Gordon Ryan, Ryan Hall, John Smith), en français ou avec sous-titres français, de la ceinture blanche à la violette.
import { esc, openSheet, toast } from "../ui.js";
import { myNote } from "../study-notes.js";
import { sync } from "../sync.js";
import { PARCOURS_BELTS } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

// Ce qu'il faut maîtriser pour passer à la ceinture suivante (synthèse des repères de progression BJJ / grappling
// les plus utilisés : sécurité, sorties, une garde, un renversement, deux passages, contrôles, soumissions de base,
// puis, en bleue, défense de toutes les familles, jeu connecté et enchaînements).
const GOALS = {
  blanche: { next: "bleue", list: [
    "Rester calme et en sécurité : taper tôt, connaître l'ordre des positions (dos > montée > latéral > garde).",
    "Debout : une garde de lutte, changer de niveau, une attaque aux jambes, défendre l'amenée.",
    "Sortir de la montée, du latéral, du dos et de la tortue.",
    "Tenir une garde : garde fermée et rétention de garde.",
    "Réussir au moins un renversement.",
    "Passer la garde de deux façons (à distance et en pression), puis stabiliser.",
    "Tenir dessus : montée, latéral, dos (3 secondes sans perdre).",
    "Finir les soumissions de base : étranglement arrière, clé de bras, triangle, kimura, guillotine.",
  ] },
  bleue: { next: "violette", list: [
    "Défendre tôt toutes les familles : étranglements, front headlock, triangle, clés d'épaule et de bras, clés de jambes.",
    "Lutter en enchaînant : amenées no-gi, body lock, front headlock offensif, transition debout → sol.",
    "Avoir plusieurs gardes reliées (ouverte, demi-garde, dog fight) et des renversements enchaînés.",
    "Avoir plusieurs familles de passage et les enchaîner (pression, contournement, demi-garde, body lock).",
    "Naviguer entre latéral, montée et dos sans perdre le contrôle.",
    "Un système de dos complet : prise, contrôle, finition.",
    "Enchaîner les soumissions (si l'une est défendue, la suivante est prête).",
    "Jambes : se protéger, puis attaquer en sécurité (clé de cheville droite).",
  ] },
  violette: { next: "marron", list: [
    "Construire son jeu personnel (son « A-game ») et le relier.",
    "Comprendre les concepts et pas seulement les gestes.",
    "Des systèmes de finition de haut niveau (compressions, crucifix, jambes).",
    "S'adapter à l'adversaire et à la compétition.",
  ] },
};

// a : auteur · lang : fr = vidéo en français, en = anglais avec sous-titres français · c : numéro du point à maîtriser
const VIDEOS = [
  // ---------- BLANCHE → objectif ceinture bleue ----------
  { belt: "blanche", c: 1, a: "Nicolas Renier", id: "19ISpT8Gv3I", lang: "fr", t: "Sparring de 4 minutes de Luta Livre", pts: ["Regarde comment il reste toujours en contrôle avant d'attaquer.", "Les transitions s'enchaînent sans pause : position, puis soumission.", "Le rythme : calme quand il contrôle, explosif sur l'ouverture."] },
  { belt: "blanche", c: 1, a: "Nicolas Renier", id: "ppFg_2RmDto", lang: "fr", t: "2e ligne de défense : le coude (concept de John Danaher)", pts: ["Coudes collés au corps : la plupart des clés de bras deviennent impossibles.", "Si le coude sort, le récupérer avant qu'il isole le bras.", "Se défendre par étapes : mains, coudes, puis position."] },
  { belt: "blanche", c: 2, a: "Lachlan Giles", id: "7igJLHdcg1I", lang: "en", t: "Le double leg en no-gi", pts: ["Changer de niveau en pliant les jambes, pas en se penchant.", "Le pas de pénétration va entre ses pieds, tête haute, dos droit.", "Finir en tournant ou en poussant sur l'angle, pas en tirant tout droit."] },
  { belt: "blanche", c: 2, a: "John Smith", id: "2bEGb61bGpg", lang: "en", t: "Finir le low single", pts: ["Tête à l'extérieur, contre sa hanche : à l'abri de la guillotine.", "Remonter en gardant la jambe collée à toi.", "Finir en angle plutôt qu'en poussant droit devant."] },
  { belt: "blanche", c: 3, a: "Lachlan Giles", id: "Ti7gpEVwMmE", lang: "en", t: "Les fondamentaux des sorties", pts: ["Les cadres (avant-bras, genoux) d'abord, le mouvement ensuite.", "Pont et crevette créent l'espace, puis on remet la garde ou on se relève.", "Ne jamais pousser bras tendus : il s'appuie dessus."] },
  { belt: "blanche", c: 3, a: "Lachlan Giles", id: "S5zkk2B7pfw", lang: "en", t: "Sortir de la montée : la bataille la plus importante", pts: ["Coudes collés : ne pas lui donner les bras.", "Pont pour le déséquilibrer, puis sortie coude-genou.", "Récupérer la demi-garde ou la garde, ne pas rester à plat."] },
  { belt: "blanche", c: 3, a: "John Danaher", id: "cuXq-k__9lQ", lang: "en", t: "Sortir du latéral", pts: ["Cadres sur son cou et sa hanche avant de bouger.", "Pont puis crevette pour créer l'espace.", "Remettre le genou dans l'espace, puis la garde."] },
  { belt: "blanche", c: 3, a: "Lachlan Giles", id: "9TRErC6vbKo", lang: "en", t: "Sortir du dos", pts: ["Deux mains sur le bras qui étrangle : le cou d'abord.", "Faire glisser les épaules au sol du côté de son bras du dessous.", "Retirer un crochet, puis tourner face à lui."] },
  { belt: "blanche", c: 3, a: "Lachlan Giles", id: "Ly89G4iCTSQ", lang: "en", t: "Sortir de la tortue en roulant vers la garde", pts: ["En tortue sans prise : d'abord protéger le cou.", "Rouler vers la garde pour ne pas rester en dessous.", "Garder les coudes collés aux genoux pendant la sortie."] },
  { belt: "blanche", c: 4, a: "John Danaher", id: "ce_0XT1BBQA", lang: "en", t: "La rétention de garde", pts: ["Tes jambes restent toujours entre toi et lui.", "Tourner sur le dos et les épaules pour remettre les pieds face à lui.", "Distance : très près ou loin, jamais entre les deux."] },
  { belt: "blanche", c: 4, a: "Gordon Ryan", id: "nU9YxDabnSU", lang: "en", t: "Comprendre la garde fermée", pts: ["Casser sa posture avant toute attaque.", "Prendre un angle en sortant les hanches sur le côté.", "Enchaîner : s'il se redresse, renversement ; s'il pousse, soumission."] },
  { belt: "blanche", c: 5, a: "John Danaher", id: "fcZJvERQcw0", lang: "en", t: "Le renversement en ciseau avec la prise 2 contre 1", pts: ["La prise 2 contre 1 sur son bras l'empêche de se rattraper.", "Déséquilibrer d'abord, renverser ensuite.", "Finir directement en montée."] },
  { belt: "blanche", c: 5, a: "Lachlan Giles", id: "65oxIM5llsk", lang: "en", t: "Le renversement le plus important de la demi-garde", pts: ["Sur le côté, avec l'underhook, jamais à plat.", "Monter sur son dos ou sa jambe pour le faire basculer.", "Finir dessus et stabiliser."] },
  { belt: "blanche", c: 6, a: "Lachlan Giles", id: "Zp9O6YpHKeE", lang: "en", t: "5 conseils pour passer n'importe quelle garde en no-gi", pts: ["Contrôler les jambes avant de chercher les bras.", "Garder une posture solide, hanches basses.", "Passer, puis stabiliser 3 secondes."] },
  { belt: "blanche", c: 6, a: "Nicolas Renier", id: "7Ghi4-3Ef0g", lang: "fr", t: "Passage de garde knee slice", pts: ["Le genou coupe en diagonale à travers sa cuisse.", "Contrôler la tête ou prendre l'underhook pendant le passage.", "Finir hanches basses, poitrine contre poitrine."] },
  { belt: "blanche", c: 7, a: "Nicolas Renier", id: "1mTj7PA2SPw", lang: "en", t: "Contrôler la montée", pts: ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Base large contre ses ponts.", "Contrôler avant d'attaquer."] },
  { belt: "blanche", c: 7, a: "John Danaher", id: "NUMXYYjEszU", lang: "en", t: "Placer les crochets et tenir le dos", pts: ["Prendre la ceinture (seatbelt) avant les crochets.", "Ta tête collée à la sienne.", "Crochets à l'intérieur de ses cuisses, jamais chevilles croisées."] },
  { belt: "blanche", c: 8, a: "John Danaher", id: "l8-JI7NND3E", lang: "en", t: "L'étranglement arrière parfait", pts: ["Gagner la bataille des mains avant d'étrangler.", "Le coude sous son menton, ta main derrière sa tête.", "Serrer en gonflant la poitrine, pas en tirant."] },
  { belt: "blanche", c: 8, a: "John Danaher", id: "GshEzcqlUbY", lang: "en", t: "La clé de bras parfaite", pts: ["Contrôler le bras avant de tomber en arrière.", "Genoux serrés, hanches collées à son épaule.", "Pouce vers le haut, monter les hanches lentement."] },
  { belt: "blanche", c: 8, a: "John Danaher", id: "LDE0fkzZT6I", lang: "en", t: "Le triangle, même avec des jambes courtes", pts: ["Un bras dedans, un bras dehors.", "Prendre l'angle pour fermer le triangle.", "Tirer la tête et serrer les genoux."] },
  { belt: "blanche", c: 8, a: "Lachlan Giles", id: "VG904IeScWE", lang: "en", t: "De la kimura à la clé de bras, du dessous", pts: ["Prise en figure 4 : ta main sur son poignet, ton autre bras sous le sien.", "S'il défend la kimura, son bras s'ouvre pour la clé de bras.", "Décoller son bras du corps avant de tourner."] },
  { belt: "blanche", c: 8, a: "Gordon Ryan", id: "Veqp_HoCof4", lang: "en", t: "La guillotine", pts: ["Bras sous le menton, poignet contre sa gorge.", "Serrer avec les hanches et la poitrine, pas seulement les bras.", "Idéale sur un shot mal placé : tête basse, cou exposé."] },

  // ---------- BLEUE → objectif ceinture violette ----------
  { belt: "bleue", c: 1, a: "Gordon Ryan", id: "juaHGE92Vec", lang: "en", t: "Sortir de la guillotine", pts: ["Main sur son poignet, menton rentré.", "Passer du côté de son bras pour l'empêcher de serrer.", "Ne pas tirer la tête en arrière."] },
  { belt: "bleue", c: 1, a: "Lachlan Giles", id: "Ss49jnCob0w", lang: "en", t: "Éviter et défendre le triangle", pts: ["Ne jamais laisser un bras dedans et un bras dehors.", "Posture droite et coudes à l'intérieur de ses genoux.", "S'il ferme : sortir la tête et empiler (stack) tôt."] },
  { belt: "bleue", c: 1, a: "Gordon Ryan", id: "uxCWCwnF6EQ", lang: "en", t: "Sortir d'une clé de talon", pts: ["Cacher le talon, garder le genou dans l'axe.", "Ne jamais tourner dans le sens de la clé de talon.", "Taper tôt à l'entraînement. Clés de talon : adultes confirmés uniquement."] },
  { belt: "bleue", c: 2, a: "John Danaher", id: "-rC5-LeRu2o", lang: "en", t: "Les amenées les plus simples en no-gi", pts: ["Choisir des amenées simples et sûres, sans exposer le cou.", "Une amenée n'est finie que quand tu contrôles dessus.", "Enchaîner selon sa réaction : il recule, il pousse, il tourne."] },
  { belt: "bleue", c: 2, a: "John Danaher", id: "Lxvwd26mYss", lang: "en", t: "Body lock de face ou de côté", pts: ["Chaque prise a ses projections.", "Mains jointes à la taille, hanches collées sous les siennes.", "Les crochets de jambe finissent plus sûrement que la force."] },
  { belt: "bleue", c: 2, a: "Gordon Ryan", id: "8hzRbpUfawY", lang: "en", t: "Les attaques depuis le front headlock", pts: ["Son menton sous ton aisselle, ton poids sur sa nuque.", "Te décaler sur le côté pour faire tomber son poids vers l'avant.", "Selon sa réaction : guillotine, d'arce ou prise de dos."] },
  { belt: "bleue", c: 3, a: "John Danaher", id: "gOFADlBRlgY", lang: "en", t: "Comprendre la garde ouverte no-gi", pts: ["Deux gardes de base en no-gi : assise et sur le dos.", "Assis : prêt à lutter ou à te relever ; sur le dos : contrôle de la distance.", "Passer de l'une à l'autre selon qu'il est debout ou à genoux."] },
  { belt: "bleue", c: 3, a: "John Danaher", id: "Ze10eulM1xg", lang: "en", t: "Construire son jeu de demi-garde no-gi", pts: ["Sur le côté, jamais à plat dos.", "L'underhook côté jambe piégée est la clé.", "Trois directions : vers son dos, vers la lutte, vers ses jambes."] },
  { belt: "bleue", c: 3, a: "Lachlan Giles", id: "rNxVLwBrhsY", lang: "en", t: "Renverser les lutteurs depuis la demi-garde", pts: ["Contre un lutteur, la demi-garde mène au dog fight.", "Underhook et tête haute pour remonter.", "Finir en lutte ou en prise de dos."] },
  { belt: "bleue", c: 3, a: "Nicolas Renier", id: "NSGkmvh8-Wc", lang: "fr", t: "Prendre le dos depuis la demi-garde", pts: ["Prendre l'underhook côté jambe piégée.", "Passer sous lui pour arriver dans son dos.", "Ceinture et crochets avant qu'il se retourne."] },
  { belt: "bleue", c: 4, a: "John Danaher", id: "isv_6Hd1Iac", lang: "en", t: "Bien passer la garde en no-gi", pts: ["Contrôler ses jambes ou ses hanches avant de passer.", "Choisir sa famille de passage : par-dessus, autour ou en dessous.", "Passage fini = poitrine contre poitrine, hanches contrôlées, 3 secondes."] },
  { belt: "bleue", c: 4, a: "Nicolas Renier", id: "GIsb-RFpSfU", lang: "fr", t: "Passer la garde papillon", pts: ["Neutraliser ses crochets avant de passer.", "Poids bas, pas de poids sur les genoux.", "Contourner ou écraser selon sa réaction."] },
  { belt: "bleue", c: 4, a: "Lachlan Giles", id: "qrlXfEOk_44", lang: "en", t: "Passer la demi-garde en no-gi", pts: ["Crossface et underhook : il doit rester à plat.", "Libérer le genou piégé petit à petit.", "Stabiliser en latéral ou en montée avant d'attaquer."] },
  { belt: "bleue", c: 4, a: "Gordon Ryan", id: "r-FNcolHsg4", lang: "en", t: "Le passage en body lock", pts: ["Mains jointes autour de ses hanches, tête basse et collée.", "Écraser ses hanches au sol avant de libérer tes jambes.", "Stabiliser en latéral avant d'attaquer."] },
  { belt: "bleue", c: 5, a: "John Danaher", id: "Nk47F1A3epo", lang: "en", t: "Du latéral au dos quand il se retourne", pts: ["Quand il se retourne pour sortir du latéral, son dos s'ouvre.", "Suivre sa rotation au lieu de le retenir.", "Placer les crochets et la ceinture avant qu'il ne se relève."] },
  { belt: "bleue", c: 5, a: "John Danaher", id: "8FbGenSia08", lang: "en", t: "Attaquer depuis la montée", pts: ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Isoler un bras avant d'attaquer.", "Garder la base (mains au sol) contre ses ponts."] },
  { belt: "bleue", c: 6, a: "Nicolas Renier", id: "1wrC1xoLn6Y", lang: "en", t: "Prendre le dos", pts: ["La ceinture (seatbelt) avant les crochets.", "Suivre sa rotation au lieu de le retenir.", "Crochets à l'intérieur des cuisses, jamais chevilles croisées."] },
  { belt: "bleue", c: 6, a: "Nicolas Renier", id: "PLHwIEN8c3k", lang: "en", t: "Attaquer le dos", pts: ["Gagner la bataille des mains avant l'étranglement.", "Ta tête collée à la sienne.", "S'il défend le cou : changer d'attaque, garder le dos."] },
  { belt: "bleue", c: 7, a: "Lachlan Giles", id: "mLLQBxG1ojo", lang: "en", t: "La série kimura depuis la demi-garde", pts: ["Depuis la demi-garde, la kimura sert aussi à renverser.", "Chaque défense ouvre l'option suivante.", "Décoller son bras du corps avant de tourner."] },
  { belt: "bleue", c: 7, a: "Nicolas Renier", id: "3Nm6DjvXwBo", lang: "fr", t: "Contre-attaque de la kimura en clé de bras", pts: ["Quand il défend la kimura, son bras s'offre pour la clé de bras.", "Garder le contrôle de son poignet pendant le changement.", "Une attaque qui en prépare une autre."] },
  { belt: "bleue", c: 7, a: "Nicolas Renier", id: "N9vAGJu4ocs", lang: "en", t: "Guillotine : bras dedans ou bras dehors", pts: ["Choisir la version selon où est son bras.", "Poignet sous le menton, pas sur la mâchoire.", "Serrer avec les hanches, pas seulement les bras."] },
  { belt: "bleue", c: 8, a: "Nicolas Renier", id: "DCIllKf8wzY", lang: "fr", t: "Clé de cheville : trouver l'espace et la bonne pression", pts: ["Créer l'espace avant de serrer.", "La bonne pression vient de l'axe du corps, pas des bras.", "Monter la pression progressivement : le partenaire tape tôt."] },
  { belt: "bleue", c: 8, a: "Gordon Ryan", id: "AamW7ZXYgJ4", lang: "en", t: "De l'underhook à l'ashi garami", pts: ["L'underhook sur sa jambe ouvre l'entrée en ashi garami.", "Contrôler ses hanches et son genou avant la finition.", "Finir lentement ; s'il défend bien, passer la garde."] },

  // ---------- VIOLETTE → vers la ceinture marron ----------
  { belt: "violette", c: 1, a: "Lachlan Giles", id: "eSTQxXLUpgo", lang: "en", t: "Quel style de garde jouer ? Avantages et limites", pts: ["Choisir sa garde selon son corps et son style.", "Chaque style a ses forces et ses failles.", "Construire son jeu autour de ce qui marche pour toi."] },
  { belt: "violette", c: 2, a: "Nicolas Renier", id: "K8U6yVSsO_4", lang: "fr", t: "La guillotine depuis la montée : son système", pts: ["Depuis la montée, quand il pousse, son cou s'ouvre.", "Un système : chaque défense mène à l'option suivante.", "Garder la montée pendant la mise en place."] },
  { belt: "violette", c: 3, a: "Nicolas Renier", id: "lXpFF0W2AxM", lang: "fr", t: "Latéral : compression musculaire", pts: ["Isoler le bras depuis le latéral.", "Le contrôle d'abord, la pression ensuite.", "Compression : finir lentement, le partenaire tape tôt."] },
  { belt: "violette", c: 3, a: "Nicolas Renier", id: "W2o8_w98QGs", lang: "en", t: "Compression du biceps", pts: ["Une compression se met en place après le contrôle.", "Bloquer le bras avant de serrer.", "Très dangereuse : finir lentement à l'entraînement."] },
  { belt: "violette", c: 3, a: "Ryan Hall", id: "7WCuDZ_OAnY", lang: "en", t: "Finir en kimura depuis le crucifix", pts: ["Depuis le crucifix, son bras piégé ouvre les finitions.", "Contrôler avant de finir, toujours.", "Finir lentement à l'entraînement : épaules fragiles."] },
  { belt: "violette", c: 3, a: "Nicolas Renier", id: "fajHA6YtChI", lang: "en", t: "Entrée en clé de pied", pts: ["L'entrée compte plus que la finition.", "Contrôler son genou et ses hanches pendant l'entrée.", "S'il défend, enchaîner vers le passage."] },
  { belt: "violette", c: 4, a: "Nicolas Renier", id: "dMrnv72HtoY", lang: "fr", t: "Retour technique sur son combat à l'ADXC 4", pts: ["Voir comment les techniques passent en compétition.", "Repérer ses choix : quand il attaque, quand il contrôle.", "Comparer avec ton propre jeu."] },
];

const params = (lang) => `autoplay=1&rel=0&hl=fr${lang === "en" ? "&cc_load_policy=1&cc_lang_pref=fr" : ""}`;

export function openParcoursClub() {
  let belt = "", extra = [];
  const coach = sync.role() === "coach";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const card = (v) => `<div class="sys-card" style="border-left:4px solid ${col(v.belt)};margin:10px 0;padding:10px 12px">
      <div class="row between" style="gap:8px"><span class="tiny muted">${esc(v.pos || "")}</span><span class="tiny" style="font-weight:800;color:${v.lang === "fr" ? "var(--tape)" : "#9AA3AE"}">${v.lang === "fr" ? "🇫🇷 En français" : "VO · sous-titres FR"}</span></div>
      <b class="small">${esc(v.t)}</b> <span class="tiny muted">· ${esc(v.a || "")}</span>
      ${v.id ? `<button data-yt="${v.id}" data-lang="${v.lang}" aria-label="Lire" style="position:relative;display:block;width:100%;margin:8px 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>` : `<a class="btn ghost small" href="${esc(v.url)}" target="_blank" rel="noopener" style="margin:8px 0">Regarder</a>`}
      ${v.pts?.length ? `<div class="tiny" style="font-weight:800;color:var(--tape);text-transform:uppercase;letter-spacing:.04em">Points importants</div><ul class="bul" style="margin:4px 0 6px">${v.pts.map((n) => `<li class="small">${esc(n)}</li>`).join("")}</ul>` : ""}
      ${coach && v.linkId ? `<button class="btn ghost small" data-rm="${esc(v.linkId)}">Retirer</button>` : ""}
      ${myNote(`parcours-club:${v.id || v.url}`, `Parcours · ${v.t}`, { placeholder: "Ce que je retiens, mes drills, ce qui a marché…" })}
    </div>`;
  const draw = () => {
    const all = [...VIDEOS, ...extra];
    body.innerHTML = `<p class="small muted" style="margin-top:0">Pour chaque ceinture : ce que tu dois maîtriser pour passer à la suivante, et pour chaque point, les meilleures vidéos gratuites des références (Nicolas Renier, John Danaher, Lachlan Giles, Gordon Ryan, Ryan Hall, John Smith). Avance point par point.</p>
      <p class="tiny muted" style="margin:0 0 10px">Vidéo en anglais sans sous-titres français ? Dans le lecteur : ⚙ → Sous-titres → Traduire automatiquement → Français.</p>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      ${coach ? `<button class="btn ghost small" data-add style="margin-bottom:6px">+ Ajouter une vidéo au parcours</button>` : ""}
      ${PARCOURS_BELTS.filter((b) => !belt || b.id === belt).map((b) => {
        const g = GOALS[b.id];
        return `<div class="row" style="gap:8px;margin:20px 0 6px;align-items:center"><span style="width:40px;height:12px;border-radius:3px;background:${col(b.id)};border:1px solid #555;flex:none"></span><h3 class="sys-h" style="margin:0">Ceinture ${esc(b.label.toLowerCase())}</h3></div>
        <div class="panel" style="padding:10px 12px;margin-bottom:8px"><div class="tiny" style="font-weight:800;text-transform:uppercase;letter-spacing:.04em">Pour passer ceinture ${esc(g.next)}, tu dois savoir :</div>
          <ol style="margin:6px 0 0;padding-left:20px">${g.list.map((x) => `<li class="small" style="margin:3px 0">${esc(x)}</li>`).join("")}</ol></div>
        ${g.list.map((x, i) => { const vs = all.filter((v) => v.belt === b.id && (v.c || 0) === i + 1); return vs.length ? `<div class="tiny" style="margin:14px 0 2px;font-weight:800;color:var(--tape)">${i + 1}. ${esc(x)}</div>${vs.map(card).join("")}` : ""; }).join("")}
        ${all.filter((v) => v.belt === b.id && !v.c).map(card).join("")}`;
      }).join("")}
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

// pour les parcours guidés : la même sélection de vidéos
export const LUTA_VIDEOS = VIDEOS;
