// Réponse immédiate : l'appli cherche dans tout son contenu (techniques, risques et parades, armes,
// réactions, zones, gardes, combinaisons, drills, Luta Livre, règles nutrition et santé) ce qui répond à la question.
// Aucun réseau : la réponse s'affiche en moins d'une seconde.
import { TECHS, MAIN_TECHS, tech } from "./systems-data.js";
import { REACTIONS, WEAPONS, QUESTIONS, weaponsFor } from "./discussion-data.js";
import { ZONES, STANCES, ARTS, CLASSIC_COMBOS, PROFILES } from "./academy-data.js";
import { GLOSSARY } from "./luta-data.js";
import { GUIDES } from "./drill-guides.js";
import { DRILL_GROUPS } from "./data.js";

const norm = (s = "") => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[’']/g, " ");
const STOP = new Set("a au aux avec ce ces cet cette comment dans de des du elle en est et etre il ils je j la le les leur lui ma mais me mes moi mon ne nous on ou par pas plus pour qu que quand qui sa se ses si son sur ta te tes toi ton tu un une vos votre vous y d l n m s t c qu quoi faire fais fait avoir ai as souvent toujours tres trop bien bon bonne mal du coup quel quelle quels quelles est-ce mieux comme".split(" "));
const stem = (w) => w.length > 4 ? w.replace(/(ements|ement|ations|ation|euses|euse|eurs|eur|ees|ee|es|s|x|e)$/, "") : w;
// synonymes du combat : un mot de la question ouvre ses équivalents
const SYN = [
  ["entree", "shot", "amenee", "takedown", "double", "single", "penetration", "tirer", "rentrer", "projection"],
  ["lutte", "lutteur", "wrestling", "amenee", "takedown", "double", "single", "sprawl"],
  ["timing", "moment", "lire", "lecture", "reaction", "anticiper", "temps"],
  ["sprawl", "defense", "defendre", "contrer", "contre"],
  ["cage", "grillage", "mur", "bascule"],
  ["sol", "grappling", "garde", "passage", "montee", "dos", "soumission", "luta"],
  ["peur", "stress", "angoisse", "fige", "blocage", "panique", "trac"],
  ["frappe", "coup", "boxe", "poing", "jab", "direct", "crochet", "uppercut"],
  ["pied", "kick", "lowkick", "mollet", "middle", "teep"],
  ["fatigue", "cardio", "souffle", "endurance", "vide", "epuise"],
  ["manger", "repas", "nutrition", "calorie", "proteine", "glucide", "faim", "poids"],
  ["douleur", "mal", "blessure", "blesse", "genou", "epaule", "dos", "cheville"],
  ["clinch", "corps", "underhook", "nuque", "genoux"],
  ["feinte", "feinter", "piege", "provoquer"],
  ["distance", "portee", "deplacement", "angle", "recul"],
];
const synOf = new Map(); SYN.forEach((g) => g.forEach((w) => synOf.set(stem(w), g.map(stem))));
const tokens = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1 && !STOP.has(w)).map(stem);

const RULES = [
  { title: "Le timing de tes entrées de lutte", kw: "entree lutte timing moment shot amenee takedown double single subir defense sprawl rentrer tirer", body: ["Entre sur sa frappe : quand il lance un direct ou un crochet, il est sur une jambe et ses mains sont loin de tes jambes. Change de niveau sous le coup.", "Ou entre après ta frappe : jab ou direct qui fait monter sa garde, puis changement de niveau dans la foulée.", "Pars de la distance orange : si tu dois faire deux pas, c'est trop loin et il voit venir.", "Tête haute, finis en angle (shot + virage) et enchaîne si la première entrée est bloquée : jambe, cage, dos."] },
  { title: "Défendre les amenées au sol", kw: "defense defendre lutte amenee takedown sprawl double single lutteur garder debout", body: ["Garde les hanches loin et les mains prêtes : underhooks et contrôle de la tête.", "Sprawl : jambes en arrière, hanches lourdes, puis remonte vite en garde.", "Frappe à la sortie : le lutteur qui rate son entrée est exposé (uppercut, genou, guillotine).", "Contre la cage : underhook, tourne, ne laisse pas tes deux pieds collés au grillage."] },
  { title: "Peur et blocage en sparring", kw: "peur stress fige blocage panique trac sparring coup prendre", body: ["La peur est normale et se travaille par paliers : sparring léger et positionnel d'abord, l'intensité monte par étapes.", "Visualisation 3 fois par semaine : la situation en détail, à vitesse réelle, et ta bonne réaction.", "Respiration lente quelques minutes avant la séance.", "Dis-le au coach : il adapte les partenaires et les thèmes."] },
  { title: "Manger autour de l'entraînement", kw: "manger repas nutrition faim avant apres entrainement energie vide glucide", body: ["1 à 4 h avant : un repas riche en glucides, pauvre en graisses et en fibres.", "Après : protéines et glucides dans les 2 heures.", "Une source de protéines à chaque repas, toutes les 3 à 4 heures.", "Ton besoin du jour et le détail du calcul sont dans l'onglet Nutrition."] },
  { title: "Perdre du poids pour une catégorie", kw: "poids perdre coupe categorie pesee maigrir secher", body: ["Perte progressive : environ 0,5 % du poids par semaine, l'appli calcule ton déficit.", "Au réveil, pas plus de 5 à 7 % au-dessus de la catégorie avant la dernière semaine.", "Jamais de jeûne, de diurétiques ou de sauna seul : la coupe finale se fait avec le coach.", "Moins de 18 ans : aucune coupe de poids."] },
  { title: "Fatigue, jambes lourdes, cardio", kw: "fatigue cardio souffle endurance vide epuise jambes lourdes stagne", body: ["Regarde ta charge dans Progrès : une hausse brutale ou une semaine monotone fatiguent.", "Ton check-in du matin adapte la séance : sommeil, fatigue, FC de repos.", "Sépare explosivité et cardio d'au moins 3 heures quand c'est possible.", "Au moins un jour sans entraînement par semaine."] },
  { title: "Douleur ou blessure", kw: "douleur blessure blesse genou epaule dos cheville poignet coude choc tete", body: ["Évite le mouvement qui fait mal et signale la douleur dans ton check-in : le programme s'adapte.", "Douleur qui dure, gonflement, déformation, perte de force, fourmillements : médecin ou kiné.", "Choc à la tête avec maux de tête, vertiges ou nausées : arrêt du contact et médecin sous 24 à 48 h."], safety: true },
  { title: "Gérer la pression en compétition", kw: "competition mental pression moyens stress combat trac confiance", body: ["Une routine d'avant combat (échauffement, respiration, mots-clés) aide à retrouver ses repères.", "Fixe des objectifs de progression (un geste, une situation), pas seulement le résultat.", "Si le moral reste bas plusieurs jours, parles-en. En cas de détresse : 3114, gratuit, 24 h/24."], safety: true },
];

let INDEX = null;
function build() {
  const docs = [];
  const add = (d) => { d.tk = tokens(`${d.title} ${d.title} ${d.text}`); d.tt = tokens(d.title); docs.push(d); };
  MAIN_TECHS.forEach((t) => add({ kind: "Technique", title: t.name, open: { tech: t.id },
    text: `${t.zone} ${t.counters.map((c) => `${c.text} ${c.answerText || ""}`).join(" ")} ${t.reduce || ""} ${t.opens.map((o) => tech(o)?.name || "").join(" ")}`,
    lines: [...t.counters.slice(0, 3).map((c) => `Risque : ${c.text}${c.answerText ? ` Ta réponse : ${c.answerText}` : ""}`), t.reduce ? `À retenir : ${t.reduce}` : "", t.opens.length ? `Elle ouvre : ${t.opens.map((o) => tech(o)?.name).filter(Boolean).join(", ")}.` : ""].filter(Boolean) }));
  WEAPONS.forEach((w) => add({ kind: "Arme décisive", title: w.name, open: { weapon: w.id }, text: `${w.when} ${w.why} ${w.setup} ${w.risk.join(" ")}`,
    lines: [`Quand : ${w.when}`, `Préparation : ${w.setup}`, `Risque : ${w.risk[0]}`] }));
  REACTIONS.forEach((r) => add({ kind: "Lire l'adversaire", title: r.name, open: { reaction: r.id }, text: `${r.gap} ${weaponsFor(r.id).map((w) => w.name).join(" ")} reaction timing lire`,
    lines: [`La faille : ${r.gap}`, `Ce qui l'exploite : ${weaponsFor(r.id).map((w) => w.name).join(", ")}.`] }));
  QUESTIONS.forEach((q, i) => add({ kind: "Combinaison", title: q.name, open: { question: i }, text: `${q.asks} ${q.zone}`, lines: [`La question posée : ${q.asks}`] }));
  ZONES.forEach((z) => add({ kind: "Zone du combat", title: z.title, open: { module: "zones" }, text: `${z.lead} ${z.ranges.map((r) => r.text).join(" ")} ${z.goals.join(" ")} ${z.keys.join(" ")} ${z.dangers.join(" ")}`,
    lines: [z.lead, `Objectifs : ${z.goals.join(" · ")}`, `Dangers : ${z.dangers.join(" · ")}`] }));
  STANCES.forEach((s) => add({ kind: "Garde", title: s.name, open: { module: "stances" }, text: `${s.text} ${s.tip}`, lines: [s.text, `À retenir : ${s.tip}`] }));
  ARTS.forEach((a) => add({ kind: "Art du MMA", title: a.name, open: { module: "arts" }, text: `${a.brings} ${a.adapt}`, lines: [a.brings, `À adapter : ${a.adapt}`] }));
  PROFILES.forEach((p) => add({ kind: "Profil d'adversaire", title: p.name, open: { module: "profiles" }, text: `${p.how} ${p.beat}`, lines: [p.how, `Pour le battre : ${p.beat}`] }));
  CLASSIC_COMBOS.forEach((c) => add({ kind: "Combinaison", title: c.name, open: { module: "combos" }, text: `${c.opens} ${c.exposes} ${c.tip}`, lines: [c.opens, `Expose à : ${c.exposes}`, c.tip] }));
  GLOSSARY.forEach((g) => add({ kind: "Luta Livre", title: g.term, open: { module: "luta" }, text: g.def, lines: [g.def] }));
  DRILL_GROUPS.forEach((g) => g.drills.forEach((d) => { const gd = GUIDES[d.name]; add({ kind: `Drill · ${g.title}`, title: d.name, open: { guide: d.name, how: d.how },
    text: `${d.how} ${gd ? gd.steps.join(" ") + " " + gd.errors.join(" ") : ""} drill`, lines: [d.how, gd?.errors?.length ? `Erreurs fréquentes : ${gd.errors.join(" · ")}` : ""].filter(Boolean) }); }));
  RULES.forEach((r) => add({ kind: "Repères", title: r.title, text: `${r.kw} ${r.body.join(" ")}`, lines: r.body, safety: r.safety }));
  return docs;
}

// les 3 contenus les plus proches de la question, avec un score de confiance
export function instantAnswer(question) {
  INDEX ||= build();
  const q = tokens(question);
  const nq = norm(question);
  // « j'ai mal au genou » = douleur ; « j'ai du mal à » = difficulté
  const pain = /(douleur|blessure|blesse|entorse|choc a la tete)/.test(nq) || (/mal (au|aux|a la|a l |dans)/.test(nq) && !/du mal a /.test(nq));
  if (!q.length) return [];
  const expanded = new Map(); // mot → poids (1 pour le mot de la question, 0,5 pour un synonyme)
  q.forEach((w) => { expanded.set(w, 1); (synOf.get(w) || []).forEach((s) => { if (!expanded.has(s)) expanded.set(s, 0.5); }); });
  const df = new Map(); INDEX.forEach((d) => new Set(d.tk).forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const N = INDEX.length;
  const scored = INDEX.map((d) => {
    const set = new Set(d.tk), tset = new Set(d.tt);
    let s = 0;
    expanded.forEach((wt, w) => { if (set.has(w)) s += wt * Math.log(1 + N / (df.get(w) || 1)) * (tset.has(w) ? 2.5 : 1); });
    if (d.safety && pain && d.title.startsWith("Douleur")) s += 40;
    return { d, s };
  }).filter((x) => x.s > 2.5).sort((a, b) => b.s - a.s);
  // douleur : seulement les repères santé, pas de technique qui porte le même nom (genou, coude…)
  if (pain) return scored.filter((x) => x.d.safety && x.d.title.startsWith("Douleur")).slice(0, 1).map((x) => x.d);
  // variété : pas trois contenus du même type
  const out = [], kinds = {};
  for (const x of scored) { const k = x.d.kind.split(" · ")[0]; if ((kinds[k] || 0) >= 2) continue; kinds[k] = (kinds[k] || 0) + 1; out.push(x.d); if (out.length >= 3) break; }
  return out;
}
