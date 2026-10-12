// Fiches « comment faire » des drills solo et de la mobilité : étapes, erreurs fréquentes, recherche vidéo.
// Les vidéos sont proposées via une recherche YouTube ciblée (les liens fixes finissent par disparaître).
import { esc, icon, openSheet } from "./ui.js";
import { EX, PREHAB } from "./sc-data.js";

export const GUIDES = {
  // ---- lutte debout
  "Position (garde de lutte)": { steps: ["Pieds un peu plus larges que les épaules, un pied légèrement devant.", "Genoux fléchis, poids sur l'avant des pieds.", "Dos droit, tête haute, regard devant.", "Coudes près du corps, mains devant toi, prêtes à saisir."], errors: ["Se pencher en avant avec le dos.", "Jambes tendues.", "Coudes écartés : les underhooks sont offerts."], yt: "wrestling stance basics" },
  "Déplacement en garde (motion)": { steps: ["Pour avancer, le pied avant part en premier ; pour reculer, le pied arrière.", "Pour tourner, pivote sur le pied avant, le pied arrière suit.", "Change de jambe avant sur place, puis en avançant.", "Garde la même hauteur pendant tout le déplacement."], errors: ["Croiser les pieds.", "Se redresser en se déplaçant.", "Sautiller trop haut : tu perds ta base."], yt: "wrestling stance and motion drill" },
  "Changement de niveau": { steps: ["En garde, plie les genoux pour descendre d'un coup.", "Le dos reste droit, la tête haute.", "Remonte aussitôt en garde.", "Enchaîne : haut, bas, haut, en te déplaçant."], errors: ["Plier le dos au lieu des jambes.", "Baisser la tête.", "Rester en bas."], yt: "wrestling level change drill" },
  "Soulever (lifting)": { steps: ["Hanches sous le centre de gravité de l'adversaire (ou du sac).", "Dos droit, poitrine contre lui.", "Pousse avec les jambes et les hanches vers le haut.", "Repose en contrôlant, ne le lâche pas."], errors: ["Tirer avec le dos.", "Hanches trop loin derrière."], yt: "wrestling lifting drill" },
  "Pas arrière (back step)": { steps: ["En garde face à l'adversaire imaginaire.", "Pied avant qui avance, puis pivot : le pied arrière passe derrière, entre les pieds de l'adversaire.", "Ton dos tourne vers lui, hanches basses, sous les siennes.", "Reviens et refais des deux côtés."], errors: ["Hanches trop hautes.", "Pieds trop écartés à la fin du pivot."], yt: "back step drill wrestling hip toss" },
  "Arc arrière (back arch)": { steps: ["Dos à un mur, à un pas de distance.", "Pousse les hanches vers l'avant et cambre en regardant derrière toi.", "Descends les mains le long du mur, puis remonte.", "Plus tard, avec un partenaire ou un mannequin."], errors: ["Plier les genoux sans pousser les hanches.", "Aller trop loin trop tôt."], yt: "back arch drill wrestling" },
  "Duck under": { steps: ["Main sur le biceps ou le triceps de l'adversaire imaginaire.", "Change de niveau en poussant son bras vers le haut.", "La tête passe sous son aisselle, pas d'angle vers l'extérieur.", "Remonte derrière lui, mains autour de la taille."], errors: ["Passer la tête sans changer de niveau.", "Rester devant au lieu de prendre l'angle."], yt: "duck under wrestling drill" },
  "Snap down": { steps: ["Mains sur la nuque, coudes serrés.", "Recule d'un pas en tirant d'un coup sec vers le bas.", "Fais tomber sa tête sous ses hanches.", "Enchaîne : tour derrière ou guillotine."], errors: ["Tirer sans reculer.", "Se pencher avec lui."], yt: "snap down wrestling drill" },
  "Lutte de mains (hand fighting)": { steps: ["Contrôle les poignets, ne laisse pas les tiens.", "Prends le 2 contre 1 : tes deux mains sur un bras.", "Travaille le collier (main sur la nuque) et l'underhook.", "Bouge en même temps : jamais immobile."], errors: ["Rester statique.", "Laisser ses mains libres sur ta nuque."], yt: "wrestling hand fighting drills" },
  "Pas de pénétration (drop step)": { steps: ["En garde, baisse le niveau en pliant les jambes, pas le dos.", "Grand pas avant, le genou avant descend vers le sol.", "Tête haute, dos droit, hanches sous toi.", "Ramène le pied arrière et remonte en garde."], errors: ["Plonger tête la première.", "Taper le genou au sol trop fort.", "Rester en bas après l'entrée."], yt: "penetration step wrestling drill" },
  "Sprawl": { steps: ["Depuis la garde, lance les jambes en arrière.", "Hanches au sol, poitrine lourde, mains prêtes à contrôler la tête.", "Ramène les pieds sous toi d'un coup.", "Reviens en garde, prêt à frapper."], errors: ["Tomber à genoux au lieu de lancer les jambes.", "Hanches en l'air.", "Remonter trop lentement."], yt: "how to sprawl wrestling drill" },
  "Shot + virage (turn the corner)": { steps: ["En garde, change de niveau et fais ton pas de pénétration, genou avant vers le sol.", "Sans te relever, pivote sur le genou au sol et le pied avant : ramène la jambe arrière en arc de cercle.", "Tu tournes d'un quart à un demi-tour pour finir en angle, comme pour courir autour de l'adversaire.", "Remonte en garde face à la nouvelle direction, puis repars de l'autre côté."], errors: ["Se relever avant d'avoir pivoté.", "Tête basse pendant la rotation.", "Ne tourner que d'un côté."], yt: "double leg turn the corner drill" },
  "Shots en shadow": { steps: ["Feinte de frappe ou de main.", "Changement de niveau et pas de pénétration.", "Finition imaginée : double-leg ou single-leg.", "Retour en garde immédiat."], errors: ["Entrer de trop loin.", "Oublier la feinte.", "Rester au sol après la finition."], yt: "shadow wrestling shots drill" },
  // ---- sol
  "Shrimp (sortie de hanche)": { steps: ["Sur le dos, un pied au sol près des fesses.", "Pousse sur ce pied et sur l'épaule opposée.", "Envoie la hanche vers l'arrière, mains devant comme pour repousser.", "Enchaîne le long du tapis, des deux côtés."], errors: ["Rester à plat sur le dos.", "Pousser avec les mains au lieu de la hanche."], yt: "shrimp hip escape drill bjj" },
  "Pont et pont + shrimp": { steps: ["Sur le dos, pieds près des fesses.", "Monte les hanches très haut, par-dessus une épaule.", "Redescends et enchaîne une sortie de hanche du même côté."], errors: ["Pont droit vers le plafond au lieu de passer par-dessus l'épaule.", "Pieds trop loin des fesses."], yt: "bridge and shrimp drill bjj mount escape" },
  "Relevé technique": { steps: ["Assis, une main au sol derrière toi, le pied du même côté tendu vers l'avant (cadre).", "L'autre pied au sol, l'autre main protège le visage.", "Soulève les hanches et fais passer la jambe tendue en arrière, loin derrière toi.", "Tu te retrouves en garde, à distance."], errors: ["Se relever face à l'adversaire, la tête en avant.", "Ramener la jambe sous soi au lieu de derrière."], yt: "technical stand up drill" },
  "Sit-out et hip heist": { steps: ["À quatre pattes (tortue).", "Passe une jambe sous l'autre en t'asseyant de côté.", "Pivote les hanches pour te retrouver face à l'adversaire imaginaire.", "Reviens à quatre pattes, puis de l'autre côté."], errors: ["Mettre trop de poids sur les mains.", "Rester assis sans pivoter."], yt: "sit out hip heist wrestling drill" },
  "Granby roll": { steps: ["À genoux, épaule au sol, tête rentrée sur le côté.", "Roule sur les épaules (jamais sur la nuque), jambes groupées.", "Finis face à l'adversaire, garde remise."], errors: ["Rouler sur la tête ou la nuque.", "Aller trop vite au début."], yt: "granby roll drill tutorial" },
  "Chutes (ukemi)": { steps: ["Accroupi, menton rentré sur la poitrine.", "Roule en arrière sur le dos arrondi.", "Frappe le sol avec les bras pour répartir le choc.", "Fais aussi les chutes sur le côté."], errors: ["Laisser la tête taper le sol.", "Poser les mains en arrière pour se rattraper (poignets)."], yt: "judo breakfall ukemi tutorial" },
  // ---- boxe
  "Shadow jab seul": { steps: ["Jab en avançant d'un pas.", "Jab en reculant.", "Jab au corps en descendant avec les jambes.", "Le bras revient aussi vite qu'il part, menton derrière l'épaule."], errors: ["Laisser tomber la main arrière.", "Pousser le jab au lieu de le claquer."], yt: "how to throw a jab boxing shadow drill" },
  "Shadow enchaînements": { steps: ["Choisis 2 à 4 coups.", "Frappe en tournant les hanches à chaque coup.", "Finis toujours par une sortie d'angle ou un retour en garde."], errors: ["Rester devant l'adversaire imaginaire après la combinaison.", "Enchaîner sans tourner les hanches."], yt: "boxing shadow boxing combinations drill" },
  "Esquives et retours": { steps: ["Esquive en penchant la tête sur le côté, menée par les jambes.", "Le menton reste rentré, les mains en garde.", "Contre aussitôt avec la main du côté opposé."], errors: ["Esquiver avec le dos seulement.", "Fermer les yeux.", "Esquiver sans contrer."], yt: "boxing slip and counter drill" },
  "Feinte puis contre": { steps: ["Feinte courte : épaule ou main, sans s'engager.", "Petite pause pour lire la réaction imaginaire.", "Contre avec les hanches."], errors: ["Feinte trop longue.", "Contre sans pause."], yt: "boxing feints drill" },
  // ---- kickboxing
  "Low kick au mollet": { steps: ["Petit pas de la jambe avant vers l'extérieur.", "Frappe le mollet avec le tibia, en tournant la hanche.", "Mains hautes pendant le coup.", "Reviens en garde tout de suite."], errors: ["Mains qui tombent.", "Coup trop large et lent."], yt: "calf kick tutorial mma" },
  "Blocage de low kick": { steps: ["Lève le genou vers le coude, de côté.", "Le poids reste sur la jambe d'appui.", "Repose et contre aussitôt."], errors: ["Reculer la jambe au lieu de la lever.", "Perdre l'équilibre en arrière."], yt: "how to check a leg kick muay thai" },
  "Enchaînements hollandais": { steps: ["Poings pour faire monter la garde : jab, direct, crochet.", "Finis par un low kick de la jambe arrière.", "Même enchaînement répété jusqu'à l'automatisme."], errors: ["Low kick qui part sans préparation.", "Rester devant après le kick."], yt: "dutch kickboxing combinations drill" },
  "Genoux en clinch (shadow)": { steps: ["Mains derrière une nuque imaginaire, coudes serrés.", "Tire la tête vers le bas pendant que le genou monte.", "Hanches vers l'avant à chaque genou, alterne les jambes."], errors: ["Genou qui monte sans hanche.", "Coudes écartés."], yt: "muay thai clinch knees shadow drill" },
  // ---- MMA
  "Frappe puis amenée au sol": { steps: ["Jab, direct.", "Imagine qu'il contre : change de niveau sous le coup.", "Pas de pénétration et finition contre la cage imaginaire."], errors: ["Changer de niveau trop loin.", "Tête basse pendant l'entrée."], yt: "mma strike to takedown drill" },
  "Sprawl puis frappe": { steps: ["Sprawl.", "Remonte en garde.", "Enchaîne un direct ou un crochet."], errors: ["Rester en bas.", "Remonter sans garde."], yt: "sprawl and brawl drill" },
  "Se relever contre la cage (mur)": { steps: ["Assis dos au mur, pieds sous toi.", "Mains en cadre, poignets contrôlés imaginaires.", "Pousse sur les jambes et remonte en glissant le dos le long du mur.", "Une fois debout, sors sur le côté."], errors: ["Se relever en se penchant en avant.", "Laisser les jambes loin du mur."], yt: "wall walk get up cage mma" },
  "Shadow grappling complet": { steps: ["Debout : feinte, amenée au sol.", "Passage de garde, contrôle.", "Ground and pound, puis relevé.", "Imagine l'adversaire à chaque étape."], errors: ["Aller trop vite et bâcler les positions."], yt: "shadow grappling solo drill" },
  // ---- mobilité et mouvement
  "Squat de repos": { steps: ["Pieds largeur d'épaules ou un peu plus, talons au sol.", "Descends tout en bas, dos détendu.", "Respire, bouge doucement d'un côté à l'autre."], errors: ["Talons qui décollent : écarte les pieds ou tiens-toi à un support."], yt: "deep squat hold mobility" },
  "Ouverture de hanche 90/90": { steps: ["Assis, une jambe devant pliée à 90°, l'autre derrière pliée à 90°.", "Buste droit, change de côté en levant les genoux.", "Va lentement, sans les mains si possible."], errors: ["S'effondrer en arrière.", "Forcer sur le genou."], yt: "90 90 hip switch mobility" },
  "Extension de hanche (fente basse)": { steps: ["Un genou au sol, l'autre pied devant.", "Avance les hanches en serrant la fesse de la jambe arrière.", "Garde le buste droit, respire."], errors: ["Creuser le bas du dos."], yt: "low lunge hip flexor stretch" },
  "Rotations thoraciques au sol": { steps: ["Sur le côté, genoux pliés à 90° devant toi.", "Ouvre le bras du dessus vers l'autre côté en suivant la main des yeux.", "Les genoux restent collés au sol."], errors: ["Les genoux se soulèvent."], yt: "open book thoracic rotation" },
  "Suspension passive": { steps: ["Suspends-toi à une barre, bras tendus.", "Relâche les épaules et respire.", "Pieds au sol si besoin pour alléger."], errors: ["Se balancer.", "Lâcher brusquement."], yt: "dead hang passive hang" },
  "Nuque : isométrie dans les 4 directions": { steps: ["Main contre le front, pousse la tête contre la main sans bouger.", "Pareil sur l'arrière et sur chaque côté.", "Pression moyenne, respiration continue."], errors: ["Pousser fort d'un coup.", "Bloquer la respiration."], yt: "neck isometric exercises 4 way" },
  "Suspension active": { steps: ["Suspendu à la barre, bras tendus.", "Abaisse et serre les omoplates sans plier les bras.", "Tiens la position."], errors: ["Plier les bras.", "Hausser les épaules."], yt: "active hang scapular engagement" },
  "Locomotion au sol (marche de l'ours, crabe)": { steps: ["Ours : à quatre pattes, genoux juste au-dessus du sol, avance main et pied opposés.", "Crabe : assis, mains derrière, hanches levées, avance et recule.", "Reste lent et contrôlé."], errors: ["Fesses trop hautes.", "Aller vite en perdant le contrôle."], yt: "bear crawl crab walk animal flow" },
  "Vagues de colonne": { steps: ["Debout, genoux souples.", "Fais onduler la colonne vertèbre par vertèbre, de la tête au bassin.", "Puis en arrière et sur les côtés."], errors: ["Bouger tout le dos d'un bloc."], yt: "spinal wave tutorial" },
  "Jeu de réaction (bâton ou balle)": { steps: ["Un partenaire lâche un bâton ou lance une balle sans prévenir.", "Attrape-le le plus vite possible.", "Varie les mains et les positions."], errors: ["Anticiper au lieu de réagir."], yt: "reaction stick drop drill" },
};

// exercices de prépa physique et de prévention
Object.values(EX).forEach((e) => { if (!GUIDES[e.name]) GUIDES[e.name] = { steps: e.steps, errors: e.errors, yt: e.yt }; });
Object.values(PREHAB).forEach((z) => z.items.forEach(([n, d]) => { if (!GUIDES[n]) GUIDES[n] = { steps: [d], errors: [], yt: n }; }));

export const hasGuide = (name) => Boolean(GUIDES[name]);
const ytUrl = (q) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

// version dépliable, à placer sous un exercice
export function guideInline(name) {
  const g = GUIDES[name]; if (!g) return "";
  return `<details class="guide"><summary>Comment faire ?</summary>
    <ol class="plan-steps">${g.steps.map((x) => `<li class="small">${esc(x)}</li>`).join("")}</ol>
    ${g.errors.length ? `<p class="tiny" style="margin:6px 0"><b>À éviter</b> : ${g.errors.map(esc).join(" · ")}</p>` : ""}
    <a class="btn small" href="${ytUrl(g.yt)}" target="_blank" rel="noopener">${icon("play")} Voir en vidéo</a>
  </details>`;
}

export function openGuide(name, how = "") {
  const g = GUIDES[name];
  openSheet(name, g ? `
    ${how ? `<p class="muted small">${esc(how)}</p>` : ""}
    <h3 class="sys-h">Comment faire</h3>
    <ol class="plan-steps">${g.steps.map((s) => `<li class="small">${esc(s)}</li>`).join("")}</ol>
    <div class="notice is-warn small" style="margin-top:12px"><b>Erreurs fréquentes</b><ul class="bul" style="margin-top:6px">${g.errors.map((e) => `<li>${esc(e)}</li>`).join("")}</ul></div>
    <a class="btn tape-btn block" style="margin-top:14px" href="${ytUrl(g.yt)}" target="_blank" rel="noopener">${icon("play")} Voir des vidéos du mouvement</a>
    <p class="hint">Ouvre une recherche YouTube ciblée sur ce mouvement. Ton coach peut aussi ajouter sa vidéo de référence dans la vidéothèque du club.</p>`
    : `<p class="small">${esc(how)}</p>`);
}
