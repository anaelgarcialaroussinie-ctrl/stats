// Carte de profil : bannière, photo, insignes de style, modèles UFC.
import { esc, avatarHtml } from "../ui.js";

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
      ${models.length ? `<div class="tiny muted" style="margin-top:8px">Modèles : ${models.map(esc).join(" · ")}</div>` : ""}
    </div>
  </div>`;
}

export function badgePicker(selected = []) {
  return BADGE_GROUPS.map((g) => `<div class="tiny muted" style="margin:10px 0 6px;font-weight:700">${esc(g.label)}</div>
    <div class="chips">${g.items.map((b) => `<button type="button" class="chip" data-badge="${b.id}" aria-pressed="${selected.includes(b.id)}">${esc(b.label)}</button>`).join("")}</div>`).join("");
}
