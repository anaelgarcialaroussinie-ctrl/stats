// Parcours Fight Art côté fighters : le plan (positions, ceintures, transitions, semaines du programme),
// où trouver le contenu officiel, et les notes perso. Les vidéos achetées du coach ne sont pas partagées.
import { esc, openSheet } from "../ui.js";
import { myNote } from "../study-notes.js";
import { PARCOURS, POSITIONS, PARCOURS_BELTS } from "../parcours.js";
import { BELTS } from "../vid-classify.js";

const q = (step) => `${step.author} ${step.m[0].source.replace(/\\[.*+?^${}()|[\]\\]|\(\?!.*?\)|\$|\\s\+|\\/g, " ").replace(/\s+/g, " ").trim()}`;
const yt = (step) => `https://www.youtube.com/results?search_query=${encodeURIComponent(q(step))}`;
const web = (step) => `https://www.google.com/search?q=${encodeURIComponent(`${q(step)} instructional`)}`;

export function openParcoursPublic() {
  let belt = "", pos = "";
  const body = openSheet("Parcours Fight Art", "");
  const col = (id) => BELTS.find((b) => b.id === id)?.color || "#888";
  const name = (id) => POSITIONS.find((p) => p.id === id)?.label || id;
  const draw = () => {
    const vis = PARCOURS.filter((x) => (!belt || x.belt === belt) && (!pos || x.pos === pos));
    body.innerHTML = `<p class="small muted" style="margin-top:0">Les instructionals choisis par le coach, rangés par position, de la ceinture blanche à la violette, avec les semaines du programme où ils servent. Une étape à la fois : regarde, retiens 2 ou 3 détails, drille, teste en sparring à thème.</p>
      <p class="tiny notice" style="margin:0 0 10px">Ce sont des formations payantes : elles ne sont pas diffusées dans l'appli. Les liens montrent les extraits gratuits des auteurs et où se procurer la version officielle. Le coach enseigne ces techniques en cours.</p>
      <div class="chips" style="margin-bottom:6px"><button class="chip" data-b="" aria-pressed="${!belt}">Toutes ceintures</button>${PARCOURS_BELTS.map((b) => `<button class="chip" data-b="${b.id}" aria-pressed="${belt === b.id}"><span style="display:inline-block;width:14px;height:6px;border-radius:2px;background:${col(b.id)};border:1px solid #555;margin-right:6px"></span>${esc(b.label)}</button>`).join("")}</div>
      <div class="chips" style="margin-bottom:10px"><button class="chip" data-p="" aria-pressed="${!pos}">Toutes positions</button>${POSITIONS.filter((p) => PARCOURS.some((x) => x.pos === p.id && (!belt || x.belt === belt))).map((p) => `<button class="chip" data-p="${p.id}" aria-pressed="${pos === p.id}">${esc(p.label)}</button>`).join("")}</div>
      ${POSITIONS.filter((p) => vis.some((x) => x.pos === p.id)).map((p) => `<section style="margin:16px 0 6px">
        <div class="row between" style="gap:8px;align-items:baseline"><h3 class="sys-h" style="margin:0">${esc(p.label)}</h3><span class="tiny muted">programme : ${esc(p.sys)}</span></div>
        <p class="tiny muted" style="margin:2px 0 6px">${esc(p.note)}</p>
        ${p.to.length ? `<div class="row" style="gap:6px;flex-wrap:wrap;margin-bottom:6px"><span class="tiny muted">Transitions →</span>${p.to.map(([id, how]) => `<button class="chip" data-p="${id}" style="font-size:12px">${esc(name(id))} <span class="muted">(${esc(how)})</span></button>`).join("")}</div>` : ""}
        ${vis.filter((x) => x.pos === p.id).map((x) => `<div class="sys-card" style="border-left:4px solid ${col(x.belt)};margin:8px 0;padding:10px 12px">
          <b class="small">${esc(x.title)}</b> <span class="tiny muted">· ${esc(x.author)} · semaines ${esc(x.w)}</span>
          <p class="tiny" style="margin:4px 0 8px">${esc(x.why)}</p>
          <div class="row" style="gap:8px;flex-wrap:wrap"><a class="btn ghost small" href="${yt(x)}" target="_blank" rel="noopener">Extraits gratuits</a><a class="btn ghost small" href="${web(x)}" target="_blank" rel="noopener">Version officielle</a></div>
          ${myNote(`parcours:${x.pos}:${x.title}`, `Parcours · ${x.title}`, { placeholder: "Les 2 ou 3 détails que je retiens, mes drills, ce qui a marché en sparring…" })}
        </div>`).join("")}
      </section>`).join("")}`;
  };
  body.addEventListener("click", (e) => {
    const b = e.target.closest("[data-b]"); if (b) { belt = b.dataset.b; draw(); return; }
    const p = e.target.closest("[data-p]"); if (p) { pos = p.dataset.p; draw(); body.closest(".sheet")?.scrollTo?.({ top: 0 }); }
  });
  draw();
}
