// Illustrations originales des positions (schémas simples) : toi en vert, le partenaire en gris.
const ME = "#C6F432", HIM = "#9AA3AE";
const S = 7; // épaisseur des membres
const line = (pts, c, w = S) => `<polyline points="${pts.map((p) => p.join(",")).join(" ")}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
// personne vue de profil : tête, tronc (épaule → hanche), bras (épaule → coude → main), jambes (hanche → genou → pied)
function body(c, { head, sh, hip, arms = [], legs = [] }) {
  return `<g>${legs.map((l) => line([hip, ...l], c)).join("")}${line([sh, hip], c, 13)}${arms.map((a) => line([sh, ...a], c, 6)).join("")}<circle cx="${head[0]}" cy="${head[1]}" r="10" fill="${c}"/></g>`;
}
const ground = `<line x1="10" y1="152" x2="250" y2="152" stroke="currentColor" stroke-opacity=".25" stroke-width="2"/>`;
const label = (x, y, t, anchor = "middle") => `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="11" font-weight="700" fill="currentColor">${t}</text>`;
const arrow = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#F5A524" stroke-width="2.5" marker-end="url(#ah)"/>`;
const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#F5A524"/></marker></defs>`;
const wrap = (inner, cap) => `<figure style="margin:8px 0"><svg viewBox="0 0 260 170" role="img" aria-label="${cap}" style="width:100%;max-width:420px;display:block;margin:auto;color:var(--text,#eee)">${defs}${ground}${inner}</svg><figcaption class="tiny muted" style="text-align:center">${cap} · <span style="color:${ME}">toi</span> / <span style="color:${HIM}">partenaire</span></figcaption></figure>`;

const P = {
  debout: () => wrap(
    body(ME, { head: [78, 48], sh: [80, 62], hip: [86, 100], arms: [[[100, 76], [116, 68]], [[96, 82], [112, 84]]], legs: [[[70, 124], [62, 151]], [[104, 124], [112, 151]]] })
    + body(HIM, { head: [182, 48], sh: [180, 62], hip: [174, 100], arms: [[[160, 76], [144, 68]], [[164, 82], [148, 84]]], legs: [[[190, 124], [198, 151]], [[156, 124], [148, 151]]] })
    + arrow(100, 138, 132, 138) + label(130, 18, "Stance basse, mains devant") + label(130, 166, "changer de niveau avant d'entrer"),
    "Debout : garde de lutte"),
  fhl: () => wrap(
    body(ME, { head: [96, 46], sh: [100, 60], hip: [96, 104], arms: [[[124, 78], [140, 100]], [[118, 88], [146, 108]]], legs: [[[84, 128], [76, 151]], [[110, 128], [116, 151]]] })
    + body(HIM, { head: [138, 104], sh: [152, 98], hip: [200, 92], arms: [[[140, 124], [132, 140]]], legs: [[[204, 124], [214, 151]], [[222, 120], [236, 151]]] })
    + label(130, 18, "Son menton sous ton aisselle") + arrow(196, 58, 158, 90) + label(252, 52, "poids sur sa nuque", "end"),
    "Front headlock"),
  gfermee: () => wrap(
    body(ME, { head: [36, 140], sh: [52, 142], hip: [108, 140], arms: [[[90, 120], [132, 84]], [[84, 128], [120, 104]]], legs: [[[136, 108], [172, 112]], [[140, 124], [176, 122]]] })
    + body(HIM, { head: [140, 72], sh: [146, 86], hip: [160, 124], arms: [[[124, 112], [100, 134]]], legs: [[[182, 150], [214, 151]]] })
    + label(130, 18, "Garde fermée : casser la posture") + arrow(150, 50, 136, 64),
    "Garde fermée"),
  gouverte: () => wrap(
    body(ME, { head: [36, 140], sh: [52, 142], hip: [104, 140], arms: [[[86, 122], [124, 108]]], legs: [[[124, 112], [160, 106]], [[132, 128], [166, 128]]] })
    + body(HIM, { head: [168, 56], sh: [172, 70], hip: [182, 106], arms: [[[152, 92], [128, 106]], [[158, 98], [138, 116]]], legs: [[[174, 128], [178, 151]], [[202, 126], [214, 151]]] })
    + label(130, 18, "Pieds et mains : la barrière") + label(118, 98, "cadres", "end"),
    "Garde ouverte"),
  demigarde: () => wrap(
    body(ME, { head: [40, 140], sh: [56, 140], hip: [110, 142], arms: [[[86, 118], [116, 104]]], legs: [[[140, 132], [160, 146]], [[146, 146], [172, 140]]] })
    + body(HIM, { head: [66, 102], sh: [80, 110], hip: [150, 116], arms: [[[60, 128], [48, 132]]], legs: [[[162, 140], [156, 151]], [[196, 140], [226, 148]]] })
    + label(130, 18, "Sur le côté, underhook") + arrow(108, 86, 112, 102),
    "Demi-garde"),
  passage: () => wrap(
    body(HIM, { head: [36, 140], sh: [52, 142], hip: [104, 140], legs: [[[118, 112], [140, 100]], [[124, 124], [146, 116]]] })
    + body(ME, { head: [150, 64], sh: [158, 78], hip: [186, 108], arms: [[[146, 98], [136, 104]], [[150, 104], [140, 118]]], legs: [[[176, 130], [180, 151]], [[206, 128], [220, 151]]] })
    + label(130, 18, "Contrôler les jambes, puis contourner") + arrow(200, 60, 230, 90),
    "Passage de garde"),
  lateral: () => wrap(
    body(HIM, { head: [40, 140], sh: [56, 142], hip: [120, 142], arms: [[[70, 128], [84, 120]]], legs: [[[160, 144], [200, 146]], [[160, 134], [196, 136]]] })
    + body(ME, { head: [62, 116], sh: [74, 122], hip: [110, 104], arms: [[[60, 140], [44, 148]], [[96, 136], [120, 140]]], legs: [[[132, 132], [150, 150]], [[118, 140], [96, 150]]] })
    + label(130, 18, "Poitrine contre poitrine, hanches basses") + arrow(110, 70, 100, 96),
    "Latéral"),
  montee: () => wrap(
    body(HIM, { head: [40, 140], sh: [56, 142], hip: [120, 142], arms: [[[74, 126], [92, 116]]], legs: [[[160, 144], [200, 146]], [[160, 134], [196, 136]]] })
    + body(ME, { head: [88, 64], sh: [92, 78], hip: [104, 124], arms: [[[78, 104], [66, 130]], [[106, 104], [118, 120]]], legs: [[[76, 136], [62, 148]], [[130, 136], [146, 148]]] })
    + label(130, 18, "Genoux hauts, base large") + arrow(150, 96, 132, 130),
    "Montée"),
  dos: () => wrap(
    body(HIM, { head: [128, 76], sh: [134, 90], hip: [152, 138], arms: [[[150, 112], [164, 104]]], legs: [[[190, 130], [228, 146]]] })
    + body(ME, { head: [108, 74], sh: [110, 90], hip: [108, 140], arms: [[[130, 96], [150, 102]], [[126, 108], [148, 112]]], legs: [[[150, 120], [170, 134]]] })
    + label(130, 18, "Ceinture + crochets, tête collée") + arrow(176, 60, 140, 84),
    "Dos"),
  jambes: () => wrap(
    body(ME, { head: [36, 138], sh: [52, 140], hip: [104, 140], arms: [[[96, 122], [118, 116]]], legs: [[[136, 124], [150, 142]], [[132, 140], [160, 150]]] })
    + body(HIM, { head: [206, 62], sh: [202, 76], hip: [190, 112], arms: [[[214, 100], [220, 126]]], legs: [[[150, 118], [112, 116]], [[200, 134], [206, 151]]] })
    + label(130, 18, "Genou en ligne, talon caché") + arrow(130, 90, 118, 110),
    "Jambes (ashi garami)"),
};
export const positionIllus = (pos) => (P[pos] ? P[pos]() : "");
