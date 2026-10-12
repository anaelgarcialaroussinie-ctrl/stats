// Carte de profil : bannière, photo, insignes de style, modèles UFC.
import { esc, avatarHtml, openSheet, toast } from "../ui.js";
import { sync } from "../sync.js";
import { store } from "../store.js";

export const BADGE_GROUPS = [
  { label: "Discipline", items: [
    { id: "mma", label: "MMA complet" }, { id: "boxe", label: "Boxeur" }, { id: "kick", label: "Kickboxeur" },
    { id: "thai", label: "Muay thaï" }, { id: "lutte", label: "Lutteur" }, { id: "grappler", label: "Grappler" },
    { id: "luta", label: "Luta Livre" }, { id: "jjb", label: "Jiu-jitsu" }, { id: "judo", label: "Judoka" },
    { id: "sambo", label: "Sambiste" }, { id: "karate", label: "Karatéka" },
  ] },
  { label: "Style", items: [
    { id: "volume", label: "Volume" }, { id: "contre", label: "Contreur" }, { id: "pression", label: "Pression" },
    { id: "ko", label: "Finisseur KO" }, { id: "soum", label: "Soumission" }, { id: "cage", label: "Lutte contre la cage" },
    { id: "clinch", label: "Clinch" }, { id: "jambes", label: "Clés de jambes" }, { id: "gnp", label: "Ground and pound" },
    { id: "switch", label: "Change de garde" }, { id: "cardio", label: "Cardio" }, { id: "technicien", label: "Technicien" },
  ] },
];
export const MAX_BADGES = 4;
const ALL = BADGE_GROUPS.flatMap((g) => g.items);
export const badgeLabel = (id) => ALL.find((b) => b.id === id)?.label || id;

const isImg = (x) => typeof x === "string" && /^data:image\/(jpeg|png|webp);base64,/.test(x);

export function profileCard(p = {}, { models = [] } = {}) {
  const badges = (p.badges || []).filter((id) => ALL.some((b) => b.id === id));
  return `<div class="pcard">
    <div class="pcard-banner${isImg(p.banner) ? "" : " is-default"}" data-banner-view>${isImg(p.banner) ? `<img src="${p.banner}" alt="">` : ""}</div>
    <div class="pcard-body">
      ${avatarHtml(p.name || "", p.photo, "avatar avatar-xl pcard-avatar")}
      <div class="pcard-name">${esc(p.name || "")}</div>
      <div class="pcard-badges" data-badges-view>${badges.length ? badges.map((id) => `<span class="insigne">${esc(badgeLabel(id))}</span>`).join("") : `<span class="tiny muted">Aucun insigne choisi</span>`}</div>
      ${p.styleName ? `<div class="small" style="margin-top:8px">Style : <b>${esc(p.styleName)}</b></div>` : ""}
      ${models.length ? `<div class="tiny muted" style="margin-top:8px">Modèles : ${models.map(esc).join(" · ")}</div>` : ""}
    </div>
  </div>`;
}

export function badgePicker(selected = []) {
  return BADGE_GROUPS.map((g) => `<div class="tiny muted" style="margin:10px 0 6px;font-weight:700">${esc(g.label)}</div>
    <div class="chips">${g.items.map((b) => `<button type="button" class="chip" data-badge="${b.id}" aria-pressed="${selected.includes(b.id)}">${esc(b.label)}</button>`).join("")}</div>`).join("");
}

// profils de l'équipe : chacun peut consulter la carte des autres
let people = null;
export async function loadProfiles() {
  if (window.FAP_PREVIEW || !sync.connected()) {
    const p = store.get().profile || {};
    people = [{ id: "me", me: true, name: p.name, role: p.role, photo: p.photo, banner: p.banner, badges: p.badges || [], styleName: p.styleName, favFighters: store.get().favFighters || [] }];
    return people;
  }
  try { people = await sync.profiles(); } catch { /* hors ligne */ }
  return people || [];
}
export const cachedProfiles = () => people || [];

export function openProfileView(person, back) {
  if (!person) return;
  const body = openSheet(person.me ? "Mon profil (vu par l'équipe)" : person.name, `
    ${profileCard(person, { models: person.favFighters || [] })}
    <p class="tiny muted" style="margin-top:10px">${person.role === "coach" ? "Coach du club" : "Fighter du club"}${person.me ? " · c'est ce que voient les autres membres quand ils ouvrent ton profil" : ""}</p>
    ${back ? `<button class="btn ghost block" data-back style="margin-top:12px">Retour à l'équipe</button>` : ""}`);
  body.querySelector("[data-back]")?.addEventListener("click", back);
}

export function openTeamProfiles() {
  const body = openSheet("Profils de l'équipe", `<p class="muted small">Chargement…</p>`);
  const draw = (list) => {
    body.innerHTML = list.length ? `<p class="small muted" style="margin-top:0">Touche un membre pour voir sa carte : photo, bannière, insignes et style.</p>
      <ul class="list">${list.map((x, i) => `<li role="button" tabindex="0" data-person="${i}">${avatarHtml(x.name || "", x.photo)}<div style="min-width:0;flex:1"><div style="font-weight:700">${esc(x.name || "")}${x.me ? ` <span class="tiny muted">(moi)</span>` : ""}</div><div class="meta">${x.role === "coach" ? "Coach" : "Fighter"}${x.styleName ? " · " + esc(x.styleName) : ""}</div></div></li>`).join("")}</ul>`
      : `<p class="muted small">Aucun profil pour l'instant.</p>`;
    body.querySelectorAll("[data-person]").forEach((li) => li.addEventListener("click", () => openProfileView(list[Number(li.dataset.person)], openTeamProfiles)));
  };
  if (cachedProfiles().length) draw(cachedProfiles());
  loadProfiles().then((l) => { if (body.isConnected) draw(l); }).catch(() => toast("Impossible de charger les profils"));
}

// ouvre le profil d'une personne par son identifiant (messages, etc.)
export async function openProfileById(id, name) {
  const list = cachedProfiles().length ? cachedProfiles() : await loadProfiles();
  const person = list.find((x) => x.id === id);
  if (person) openProfileView(person); else toast(`Profil de ${name || "ce membre"} indisponible`);
}
