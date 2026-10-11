import { esc } from "../ui.js";
import { LEVELS, ORIGINS, DAYS } from "../data.js";

export function renderOnboarding(root, { onDone, checkCode, restore, prefillCode = "" }) {
  const d = { role: "fighter", code: prefillCode, teamName: "", name: "", sex: "H", birthYear: "", weight: "", height: "", reach: "", level: 1, origin: "none", goal: "perf", competitionDate: "", equipment: "gym", clubDays: [1, 3], scDays: [0, 2, 4], consent: false, parental: false };
  let step = 0;
  let error = "";
  let busy = false;

  const minor = () => d.birthYear && new Date().getFullYear() - Number(d.birthYear) < 18;
  const stepsFor = () => ["who", "body", "practice", "week", "consent"];

  function chips(name, list, current, multi = false) {
    return `<div class="chips" role="group">${list.map((o) => {
      const on = multi ? current.includes(o.id) : current === o.id;
      return `<button type="button" class="chip" data-chip="${name}" data-id="${o.id}" data-multi="${multi}" aria-pressed="${on}">${esc(o.label)}</button>`;
    }).join("")}</div>`;
  }
  const dayList = DAYS.map((l, i) => ({ id: i, label: l }));

  function view() {
    const steps = stepsFor();
    const s = steps[step];
    let body = "";
    if (s === "who") body = `
      <img class="onb-logo" src="icons/logo.png" alt="Fight Art, MMA et Luta Livre">
      <h1 class="display">Performance</h1>
      <p class="muted" style="margin-top:12px">Ta préparation, ta nutrition et ton jeu, au même endroit. Deux minutes pour faire connaissance.</p>
      <div class="stack" style="margin-top:22px">
        <label class="field"><span>Ton prénom</span><input class="input" name="name" autocomplete="given-name" value="${esc(d.name)}" placeholder="Ex. Yanis"></label>
        <label class="field"><span>Code d'équipe</span><input class="input num" name="code" autocapitalize="characters" autocomplete="off" value="${esc(d.code)}" placeholder="Ex. FA-XXXXXX"></label>
        <p class="hint" style="margin-top:-4px">Ton coach te donne ce code. Il te relie à ton équipe.</p>
        <button type="button" class="btn ghost small" data-restore style="align-self:flex-start">J'ai déjà un compte sur un autre téléphone</button>
      </div>`;
    if (s === "body") body = `
      <h2 class="display">Ton gabarit</h2>
      <p class="muted">Il sert à adapter tes objectifs et à situer ton allonge dans ta catégorie.</p>
      <div class="stack" style="margin-top:16px">
        <div>${chips("sex", [{ id: "H", label: "Homme" }, { id: "F", label: "Femme" }], d.sex)}</div>
        <div class="grid2">
          <label class="field"><span>Année de naissance</span><input class="input num" name="birthYear" inputmode="numeric" maxlength="4" value="${esc(d.birthYear)}" placeholder="2001"></label>
          <label class="field"><span>Poids (kg)</span><input class="input num" name="weight" inputmode="decimal" value="${esc(d.weight)}" placeholder="72"></label>
          <label class="field"><span>Taille (cm)</span><input class="input num" name="height" inputmode="numeric" value="${esc(d.height)}" placeholder="178"></label>
          <label class="field"><span>Envergure (cm)</span><input class="input num" name="reach" inputmode="numeric" value="${esc(d.reach)}" placeholder="182"></label>
        </div>
        <p class="hint">Envergure : bras tendus à l'horizontale, du bout d'un majeur à l'autre. Tu pourras la renseigner plus tard.</p>
      </div>`;
    if (s === "practice") body = `
      <h2 class="display">Ta pratique</h2>
      <div class="stack" style="margin-top:14px">
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Ton niveau</span>
          ${chips("level", LEVELS.map((l) => ({ id: l.id, label: l.label })), d.level)}
          <p class="hint">${esc(LEVELS.find((l) => l.id === d.level)?.hint)}</p></div>
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Sport pratiqué avant le MMA</span>${chips("origin", ORIGINS, d.origin)}</div>
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Ton objectif</span>
          ${chips("goal", [{ id: "perf", label: "Progresser" }, { id: "weight", label: "Perdre du poids" }, { id: "compet", label: "Préparer un combat" }], d.goal)}</div>
        ${d.goal === "compet" ? `<label class="field"><span>Date du combat</span><input class="input" type="date" name="competitionDate" value="${esc(d.competitionDate)}"></label>` : ""}
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Pour la préparation physique</span>
          ${chips("equipment", [{ id: "gym", label: "J'ai accès à une salle" }, { id: "home", label: "À la maison" }], d.equipment)}</div>
      </div>`;
    if (s === "week") body = `
      <h2 class="display">Ta semaine</h2>
      <p class="muted">L'appli construit ton programme autour de tes entraînements au club.</p>
      <div class="stack" style="margin-top:14px">
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Jours d'entraînement au club</span>${chips("clubDays", dayList, d.clubDays, true)}</div>
        <div><span class="small" style="font-weight:600;display:block;margin-bottom:6px">Jours de préparation physique (2 ou 3)</span>${chips("scDays", dayList, d.scDays, true)}
        <p class="hint">Par défaut lundi, mercredi, vendredi : lourd, rapide, volume.</p></div>
      </div>`;
    if (s === "consent") body = `
      <h2 class="display">Tes données</h2>
      <p>Tu vas noter ton sommeil, ta forme, tes douleurs et ce que tu manges. Ce sont des données de santé : elles servent uniquement à adapter ton programme et sont visibles par toi et ton coach.</p>
      <p class="muted small">L'appli conseille et ajuste, elle ne remplace pas un médecin, un kiné ou un diététicien.</p>
      <label class="row" style="margin-top:14px;align-items:flex-start"><input type="checkbox" name="consent" ${d.consent ? "checked" : ""} style="width:22px;height:22px;margin-top:2px"><span>J'accepte que mes données servent à personnaliser mon suivi.</span></label>
      ${minor() ? `<label class="row" style="margin-top:12px;align-items:flex-start"><input type="checkbox" name="parental" ${d.parental ? "checked" : ""} style="width:22px;height:22px;margin-top:2px"><span>J'ai moins de 18 ans : un parent a donné son accord.</span></label>
      <p class="notice small" style="margin-top:12px">Pour les moins de 18 ans, l'appli ne propose ni coupe de poids, ni compléments, ni objectifs caloriques, et bloque les coups à la tête en sparring.</p>` : ""}`;

    const last = step === steps.length - 1;
    const can = !busy && (s !== "who" || (d.name.trim().length > 0 && d.code.trim().length >= 6));
    const canFinish = s !== "consent" || (d.consent && (!minor() || d.parental));
    root.innerHTML = `<main class="onb">
      <div class="steps-dots" aria-hidden="true">${steps.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div>
      <form data-onb novalidate>${body}
        ${error ? `<p class="notice is-alert small" style="margin-top:16px">${esc(error)}</p>` : ""}
        <div class="row" style="margin-top:28px">
          ${step > 0 ? `<button type="button" class="btn ghost" data-back>Retour</button>` : ""}
          <button class="btn ${last ? "tape-btn" : ""} block" ${can && canFinish ? "" : "disabled"}>${busy ? "Un instant…" : last ? "Créer mon espace" : "Continuer"}</button>
        </div>
      </form></main>`;
    bind();
  }

  function bind() {
    const form = root.querySelector("[data-onb]");
    form.addEventListener("input", (e) => {
      const t = e.target;
      if (t.type === "checkbox") d[t.name] = t.checked; else d[t.name] = t.value;
      if (t.name === "name" || t.name === "code" || t.type === "checkbox" || t.name === "birthYear") {
        const btn = form.querySelector("button:not([type=button])");
        const s = stepsFor()[step];
        const ok = (s !== "who" || (d.name.trim() && d.code.trim().length >= 6)) && (s !== "consent" || (d.consent && (!minor() || d.parental)));
        btn.disabled = !ok;
      }
    });
    form.querySelectorAll("[data-chip]").forEach((b) => b.addEventListener("click", () => {
      const name = b.dataset.chip; const raw = b.dataset.id; const id = isNaN(raw) ? raw : Number(raw);
      if (b.dataset.multi === "true") {
        const arr = d[name]; const i = arr.indexOf(id);
        if (i >= 0) arr.splice(i, 1); else arr.push(id);
      } else d[name] = id;
      view();
    }));
    form.querySelector("[data-back]")?.addEventListener("click", () => { step--; view(); });
    form.querySelector("[data-restore]")?.addEventListener("click", () => {
      root.innerHTML = `<main class="onb"><h2 class="display">Retrouver mon compte</h2>
        <p class="muted" style="margin-top:8px">Sur ton autre téléphone : Profil, puis « Code de connexion ». Copie-le et colle-le ici.</p>
        <form data-rest class="stack" style="margin-top:16px"><label class="field"><span>Code de connexion</span><input class="input num" name="t" autocomplete="off" required></label>
        <p class="notice is-alert small" data-err hidden></p>
        <div class="row"><button type="button" class="btn ghost" data-cancel>Retour</button><button class="btn tape-btn block">Me reconnecter</button></div></form></main>`;
      root.querySelector("[data-cancel]").addEventListener("click", view);
      root.querySelector("[data-rest]").addEventListener("submit", async (e) => {
        e.preventDefault();
        const err = root.querySelector("[data-err]");
        try { await restore(e.target.t.value); }
        catch (x) { err.hidden = false; err.textContent = x.code === "invalid_token" ? "Code inconnu. Vérifie qu'il est copié en entier." : "Connexion impossible. Vérifie ta connexion internet."; }
      });
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const steps = stepsFor();
      error = "";
      if (steps[step] === "who") {
        busy = true; view();
        try {
          const res = await checkCode(d.code);
          busy = false;
          if (!res) { error = "Code d'équipe inconnu. Vérifie-le auprès de ton coach."; view(); return; }
          d.role = res.role; d.teamName = res.team_name;
        } catch { busy = false; error = "Connexion impossible pour vérifier le code. Vérifie ta connexion internet."; view(); return; }
      }
      if (step < steps.length - 1) { step++; view(); window.scrollTo(0, 0); return; }
      const profile = { ...d, name: d.name.trim(), code: undefined, createdAt: new Date().toISOString() };
      ["weight", "height", "reach", "birthYear"].forEach((k) => { profile[k] = profile[k] ? Number(String(profile[k]).replace(",", ".")) : null; });
      if (profile.goal !== "compet") profile.competitionDate = "";
      busy = true; view();
      try { await onDone(profile, d.code.trim()); }
      catch (x) { busy = false; error = x.message || "Création impossible. Réessaie dans un instant."; view(); }
    });
  }
  view();
}
