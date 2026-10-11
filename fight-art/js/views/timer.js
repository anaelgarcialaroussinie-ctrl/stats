// Minuteur de rounds plein écran, avec le nom du drill de chaque round.
import { esc, icon } from "../ui.js";
import { fmtTime } from "../engine.js";

let ac;
function beep(freq = 880, ms = 180, times = 1) {
  try {
    ac ||= new (window.AudioContext || window.webkitAudioContext)();
    for (let i = 0; i < times; i++) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(ac.destination);
      const t = ac.currentTime + i * (ms / 1000 + 0.08);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.4, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + ms / 1000);
      o.start(t); o.stop(t + ms / 1000 + 0.02);
    }
  } catch {}
}

export function runTimer({ work, rest, rounds, names = [], title = "Minuteur", onDone }) {
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:80";
  document.body.appendChild(host);
  document.body.style.overflow = "hidden";
  let phase = "prep", left = 10, round = 1, paused = false, wake = null, timer;
  navigator.wakeLock?.request("screen").then((w) => (wake = w)).catch(() => {});
  try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); ac.resume?.(); } catch {}

  const draw = () => {
    const label = phase === "prep" ? "Prépare-toi" : phase === "work" ? "Travail" : phase === "rest" ? "Repos" : "Terminé";
    const name = phase === "done" ? "Bien joué." : names.length ? names[(round - 1) % names.length] : "";
    const nextName = phase === "rest" && names.length ? "Ensuite : " + names[round % names.length] : "";
    host.innerHTML = `<div class="timer-full ${phase === "work" ? "work" : "rest"}" style="padding:calc(env(safe-area-inset-top) + 16px) 20px calc(env(safe-area-inset-bottom) + 20px)">
      <div class="row between" style="position:absolute;top:calc(env(safe-area-inset-top) + 12px);left:16px;right:16px">
        <span class="small" style="font-weight:700">${esc(title)}</span>
        <button class="icon-btn" data-x aria-label="Arrêter">${icon("close")}</button></div>
      <div class="timer-face">
        <div class="timer-phase">${label}</div>
        <div class="timer-clock display">${phase === "done" ? "✓" : fmtTime(left)}</div>
        <div class="timer-round">${phase === "done" ? `${rounds} rounds terminés` : `Round ${round} / ${rounds}`}</div>
        ${name && phase !== "done" ? `<div class="display" style="font-size:30px;margin-top:22px;padding:0 10px">${esc(phase === "rest" ? nextName : name)}</div>` : ""}
      </div>
      <div class="row" style="justify-content:center;margin-top:26px;gap:14px">
        ${phase === "done" ? `<button class="btn" data-x>Fermer</button>` : `<button class="btn" data-pause style="min-width:150px">${paused ? icon("play") + " Reprendre" : icon("pause") + " Pause"}</button><button class="btn ghost" data-skip>Passer</button>`}
      </div></div>`;
    host.querySelectorAll("[data-x]").forEach((b) => b.addEventListener("click", close));
    host.querySelector("[data-pause]")?.addEventListener("click", () => { paused = !paused; draw(); });
    host.querySelector("[data-skip]")?.addEventListener("click", () => { left = 0; tick(true); });
  };

  const next = () => {
    if (phase === "prep") { phase = "work"; left = work; beep(1046, 260); return; }
    if (phase === "work") {
      if (round >= rounds) { phase = "done"; beep(784, 220, 3); clearInterval(timer); onDone?.(); return; }
      phase = "rest"; left = rest; beep(523, 300, 2); return;
    }
    if (phase === "rest") { round++; phase = "work"; left = work; beep(1046, 260); }
  };
  const tick = (force) => {
    if (paused && !force) return;
    if (!force) left--;
    if (left <= 3 && left > 0 && phase !== "done") beep(660, 90);
    if (left <= 0) next();
    draw();
  };
  function close() { clearInterval(timer); wake?.release?.(); host.remove(); document.body.style.overflow = ""; }
  draw();
  timer = setInterval(tick, 1000);
}
