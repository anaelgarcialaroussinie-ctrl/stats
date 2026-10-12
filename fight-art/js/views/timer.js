// Minuteur de rounds plein écran, avec le nom du drill de chaque round,
// la cloche de ring, la claquette des 10 secondes, la voix et la vibration.
import { esc, icon } from "../ui.js";
import { fmtTime } from "../engine.js";
import { bell, clapper, beep, speak, buzz, unlockAudio, soundPrefs, setSoundPrefs } from "../sound.js";

export function runTimer({ work, rest, rounds, names = [], title = "Minuteur", onDone }) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:80";
  document.body.appendChild(host);
  document.body.style.overflow = "hidden";
  let phase = "prep", left = 10, round = 1, paused = false, wake = null, timer;
  // l'heure de fin de la phase : le décompte reste juste même si le téléphone ralentit l'appli
  let endAt = Date.now() + left * 1000, lastSec = left;
  navigator.wakeLock?.request("screen").then((w) => (wake = w)).catch(() => {});
  unlockAudio();
  const nameOf = (r) => (names.length ? names[(r - 1) % names.length] : "");
  speak(nameOf(1) ? `Prépare-toi. Premier round : ${nameOf(1)}` : "Prépare-toi");

  const draw = () => {
    const pr = soundPrefs();
    const label = phase === "prep" ? "Prépare-toi" : phase === "work" ? "Travail" : phase === "rest" ? "Repos" : "Terminé";
    const name = phase === "done" ? "Bien joué." : nameOf(round);
    const nextName = phase === "rest" && names.length ? "Ensuite : " + nameOf(round + 1) : "";
    host.innerHTML = `<div class="timer-full ${phase === "work" ? "work" : "rest"}" style="padding:calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 20px)">
      <div class="row between" style="position:absolute;top:calc(env(safe-area-inset-top) + 12px);left:16px;right:16px;gap:8px">
        <span class="small" style="font-weight:700;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(title)}</span>
        <div class="row" style="gap:6px;flex:none">
          <button class="chip" data-snd="sound" aria-pressed="${pr.sound}">Son</button>
          <button class="chip" data-snd="voice" aria-pressed="${pr.voice}">Voix</button>
          <button class="icon-btn" data-x aria-label="Arrêter">${icon("close")}</button></div></div>
      <div class="timer-face">
        <div class="timer-phase">${label}</div>
        <div class="timer-clock display">${phase === "done" ? "✓" : fmtTime(left)}</div>
        <div class="timer-round">${phase === "done" ? `${rounds} rounds terminés` : `Round ${round} / ${rounds}`}</div>
        ${name && phase !== "done" ? `<div class="display" style="font-size:30px;margin-top:22px;padding:0 10px">${esc(phase === "rest" ? nextName : name)}</div>` : ""}
      </div>
      <div class="row" style="justify-content:center;margin-top:26px;gap:14px">
        ${phase === "done" ? `<button class="btn" data-x>Fermer</button>` : `<button class="btn" data-pause style="min-width:150px">${paused ? icon("play") + " Reprendre" : icon("pause") + " Pause"}</button><button class="btn ghost" data-skip>Passer</button>`}
      </div>
      <p class="tiny" style="text-align:center;margin-top:18px;opacity:.7">Cloche au début et à la fin du round, claquette à 10 secondes. Sur iPhone, coupe le mode silencieux pour entendre.</p></div>`;
    host.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", close));
    host.querySelectorAll("[data-snd]").forEach((b) => b.addEventListener("click", () => { unlockAudio(); const k = b.dataset.snd; setSoundPrefs({ [k]: !soundPrefs()[k] }); draw(); }));
    host.querySelector("[data-pause]")?.addEventListener("click", () => { paused = !paused; if (!paused) endAt = Date.now() + left * 1000; unlockAudio(); draw(); });
    host.querySelector("[data-skip]")?.addEventListener("click", () => { left = 0; next(); draw(); });
  };

  const setPhase = (p, secs) => { phase = p; left = secs; lastSec = secs; endAt = Date.now() + secs * 1000; };
  const next = () => {
    if (phase === "prep") { setPhase("work", work); bell(1); buzz([300]); speak(rounds > 1 ? `Round 1` : "C'est parti"); return; }
    if (phase === "work") {
      if (round >= rounds) { phase = "done"; bell(3); buzz([300, 120, 300, 120, 300]); speak("Terminé. Bien joué."); clearInterval(timer); onDone?.(); return; }
      setPhase("rest", rest); bell(2); buzz([200, 100, 200]); speak(nameOf(round + 1) && names.length > 1 ? `Repos. Ensuite : ${nameOf(round + 1)}` : "Repos"); return;
    }
    if (phase === "rest") { round++; setPhase("work", work); bell(1); buzz([300]); speak(round === rounds ? "Dernier round" : `Round ${round}`); }
  };
  const tick = () => {
    if (paused || phase === "done") return;
    left = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
    if (left === lastSec) return;
    for (let s = lastSec - 1; s >= left; s--) {
      if (phase === "work" && s === 10 && work > 15) { clapper(); buzz([80, 60, 80]); }
      if ((phase === "rest" || phase === "prep") && s <= 3 && s > 0) beep(660, 90);
    }
    lastSec = left;
    if (left <= 0) next();
    draw();
  };
  function close() { clearInterval(timer); wake?.release?.(); try { speechSynthesis?.cancel(); } catch {} host.remove(); document.body.style.overflow = ""; }
  draw();
  timer = setInterval(tick, 250);
}
