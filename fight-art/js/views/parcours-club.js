// Parcours Fight Art pour le club : uniquement les vidéos gratuites choisies, de la ceinture blanche à la violette,
// avec pour chacune les points importants (écrits avec nos mots).
import { esc, openSheet } from "../ui.js";
import { myNote } from "../study-notes.js";
import { PARCOURS, POSITIONS, PARCOURS_BELTS, freeVideos } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

const NOTES = {
  Ti7gpEVwMmE: ["Les cadres (avant-bras, genoux) d'abord, le mouvement ensuite.", "Pont et crevette créent l'espace, puis on remet la garde ou on se relève.", "Ne jamais pousser bras tendus : il s'appuie dessus."],
  "7igJLHdcg1I": ["Changer de niveau en pliant les jambes, pas en se penchant.", "Le pas de pénétration va entre ses pieds, tête haute, dos droit.", "Finir en tournant ou en poussant sur l'angle, pas en tirant tout droit."],
  "2bEGb61bGpg": ["Tête à l'extérieur, contre sa hanche : à l'abri de la guillotine.", "Remonter en gardant la jambe collée à toi.", "Finir en angle plutôt qu'en poussant droit devant."],
  "-rC5-LeRu2o": ["En no-gi, choisir des amenées simples et sûres, sans exposer le cou.", "Une amenée n'est finie que quand tu contrôles dessus.", "Enchaîner selon sa réaction : il recule, il pousse, il tourne."],
  Lxvwd26mYss: ["Body lock de face ou de côté : chaque prise a ses projections.", "Mains jointes à la taille, hanches collées sous les siennes.", "Les crochets de jambe finissent plus sûrement que la force."],
  Ly89G4iCTSQ: ["En tortue sans prise : d'abord protéger le cou.", "Rouler vers la garde pour ne pas rester en dessous.", "Garder les coudes collés aux genoux pendant la sortie."],
  "8hzRbpUfawY": ["Son menton sous ton aisselle, ton poids sur sa nuque.", "Te décaler sur le côté pour faire tomber son poids vers l'avant.", "Selon sa réaction : guillotine, d'arce ou prise de dos."],
  nU9YxDabnSU: ["Casser sa posture avant toute attaque.", "Prendre un angle en sortant les hanches sur le côté.", "Enchaîner : s'il se redresse, renversement ; s'il pousse, soumission."],
  ce_0XT1BBQA: ["Tes jambes restent toujours entre toi et lui.", "Tourner sur le dos et les épaules pour remettre les pieds face à lui.", "Distance : très près ou loin, jamais entre les deux."],
  gOFADlBRlgY: ["Deux gardes de base en no-gi : assise et sur le dos.", "Assis : prêt à lutter ou à te relever ; sur le dos : contrôle de la distance.", "Passer de l'une à l'autre selon qu'il est debout ou à genoux."],
  CjJibH91RkE: ["Déséquilibrer avant de renverser.", "Chaque attaque prépare la suivante s'il défend.", "Suivre le renversement pour finir dessus."],
  Ze10eulM1xg: ["Sur le côté, jamais à plat dos.", "L'underhook côté jambe piégée est la clé.", "Trois directions : vers son dos, vers la lutte, vers ses jambes."],
  isv_6Hd1Iac: ["Contrôler ses jambes ou ses hanches avant de passer.", "Choisir sa famille de passage : par-dessus, autour ou en dessous.", "Passage fini = poitrine contre poitrine, hanches contrôlées, 3 secondes."],
  "r-FNcolHsg4": ["Mains jointes autour de ses hanches, tête basse et collée.", "Écraser ses hanches au sol avant de libérer tes jambes.", "Stabiliser en latéral avant d'attaquer."],
  "cuXq-k__9lQ": ["Cadres sur son cou et sa hanche avant de bouger.", "Pont puis crevette pour créer l'espace.", "Remettre le genou dans l'espace, puis la garde."],
  EMEueexp9zU: ["Coudes collés : ne pas lui donner les bras.", "Pont pour le déséquilibrer, puis sortie coude-genou.", "Récupérer la demi-garde ou la garde, ne pas rester à plat."],
  "q-69iv2-icc": ["Depuis le nord-sud, isoler son bras avant d'attaquer.", "Ton poids sur sa poitrine pendant la prise.", "Décoller son bras du corps avant de tourner."],
  Nk47F1A3epo: ["Quand il se retourne pour sortir du latéral, son dos s'ouvre.", "Suivre sa rotation au lieu de le retenir.", "Placer les crochets et la ceinture avant qu'il ne se relève."],
  "8FbGenSia08": ["Genoux hauts, poids sur ses hanches puis sa poitrine.", "Isoler un bras avant d'attaquer.", "Garder la base (mains au sol) contre ses ponts."],
  kft2AkvKhWU: ["Contrôler ses hanches pour tenir la montée.", "Monter progressivement de la montée basse à la montée haute.", "S'il se tourne : prends le dos."],
  NUMXYYjEszU: ["Prendre la ceinture (seatbelt) avant les crochets.", "Ta tête collée à la sienne.", "Crochets à l'intérieur de ses cuisses, jamais chevilles croisées."],
  "7WCuDZ_OAnY": ["Depuis le crucifix, son bras piégé ouvre les finitions.", "Contrôler avant de finir, toujours.", "Finir lentement à l'entraînement : épaules fragiles."],
  "9TRErC6vbKo": ["Deux mains sur le bras qui étrangle : le cou d'abord.", "Faire glisser les épaules au sol du côté de son bras du dessous.", "Retirer un crochet, puis tourner face à lui."],
  uxCWCwnF6EQ: ["Cacher le talon, garder le genou dans l'axe.", "Ne jamais tourner dans le sens de la clé de talon.", "Taper tôt à l'entraînement. Clés de talon : adultes confirmés uniquement."],
  AamW7ZXYgJ4: ["L'underhook sur sa jambe ouvre l'entrée en ashi garami.", "Contrôler ses hanches et son genou avant la finition.", "Finir lentement ; s'il défend bien, passer la garde."],
  KC66GKalJcU: ["La défense commence avant la clé : coudes collés, menton rentré.", "Libérer d'abord la partie qu'il contrôle (bras ou cou).", "Une sortie bien faite mène à ta propre attaque."],
  juaHGE92Vec: ["Main sur son poignet, menton rentré.", "Passer du côté de son bras pour l'empêcher de serrer.", "Ne pas tirer la tête en arrière."],
  mLLQBxG1ojo: ["Prise en figure 4 : ta main sur son poignet, ton autre bras sous le sien.", "Depuis la demi-garde, la kimura sert aussi à renverser.", "Décoller son bras du corps avant de tourner."],
  Veqp_HoCof4: ["Bras sous le menton, poignet contre sa gorge.", "Serrer avec les hanches et la poitrine, pas seulement les bras.", "Idéale sur un shot mal placé : tête basse, cou exposé."],
};
const RENIER = ["La chaîne officielle de Nicolas Renier, référence de la Luta Livre.", "Choisis les vidéos de soumissions de base et de contrôle.", "Position, isolement, puis finition."];

export function openParcoursClub() {
  let belt = "";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const posName = (id) => POSITIONS.find((p) => p.id === id)?.label || id;
  const steps = PARCOURS.filter((x) => freeVideos(x).length);
  const draw = () => {
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les vidéos choisies par le coach, de la ceinture blanche à la violette. Regarde celle de ta ceinture, retiens les points importants, puis travaille-les à l'entraînement.</p>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      ${PARCOURS_BELTS.filter((b) => !belt || b.id === belt).map((b) => `
        <div class="row" style="gap:8px;margin:18px 0 6px;align-items:center"><span style="width:40px;height:12px;border-radius:3px;background:${col(b.id)};border:1px solid #555;flex:none"></span><h3 class="sys-h" style="margin:0">Ceinture ${esc(b.label.toLowerCase())}</h3></div>
        ${steps.filter((x) => x.belt === b.id).map((x) => freeVideos(x).map((v) => `<div class="sys-card" style="border-left:4px solid ${col(x.belt)};margin:10px 0;padding:10px 12px">
          <div class="tiny muted">${esc(posName(x.pos))}</div>
          <b class="small">${esc(v.t)}</b> <span class="tiny muted">· ${esc(v.a)}</span>
          ${v.id ? `<button data-yt="${v.id}" aria-label="Lire" style="position:relative;display:block;width:100%;margin:8px 0;padding:0;border:0;border-radius:10px;overflow:hidden;background:#000;aspect-ratio:16/9;cursor:pointer"><img src="https://i.ytimg.com/vi/${v.id}/hqdefault.jpg" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:0;display:grid;place-items:center"><span style="width:56px;height:56px;border-radius:50%;background:rgba(198,244,50,.95);display:grid;place-items:center;color:#111;font-size:22px">▶</span></span></button>` : `<a class="btn ghost small" href="${esc(v.url)}" target="_blank" rel="noopener" style="margin:8px 0">Ouvrir la chaîne</a>`}
          <div class="tiny" style="font-weight:800;color:var(--tape);text-transform:uppercase;letter-spacing:.04em">Points importants</div>
          <ul class="bul" style="margin:4px 0 6px">${(v.id ? NOTES[v.id] || [] : RENIER).map((n) => `<li class="small">${esc(n)}</li>`).join("")}</ul>
          ${myNote(`parcours-club:${v.id || v.url}`, `Parcours · ${v.t}`, { placeholder: "Ce que je retiens, mes drills, ce qui a marché…" })}
        </div>`).join("")).join("")}`).join("")}`;
  };
  body.addEventListener("click", (e) => {
    const th = e.target.closest("[data-yt]");
    if (th) { th.outerHTML = `<div style="position:relative;padding-top:56.25%;margin:8px 0;border-radius:10px;overflow:hidden;background:#000"><iframe src="https://www.youtube-nocookie.com/embed/${th.dataset.yt}?autoplay=1&rel=0" title="Vidéo" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen style="position:absolute;inset:0;width:100%;height:100%;border:0"></iframe></div>`; return; }
    const b = e.target.closest("[data-b]"); if (b) { belt = b.dataset.b; draw(); }
  });
  draw();
}
