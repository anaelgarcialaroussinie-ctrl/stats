// Sons du club : cloche de ring, claquette des 10 secondes, bips, voix et vibration.
// Tout est synthétisé (pas de fichier audio) et réglable dans le minuteur.
import { store } from "./store.js";

let ac;
const ctx = () => {
  try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch {}
  return ac;
};
export const soundPrefs = () => ({ sound: true, voice: true, vibrate: true, volume: 0.8, ...(store.get().soundPrefs || {}) });
export const setSoundPrefs = (patch) => store.update((s) => { s.soundPrefs = { ...soundPrefs(), ...patch }; });

// à appeler sur un geste de l'utilisateur (bouton) : iPhone n'autorise le son qu'après un toucher
export function unlockAudio() {
  const a = ctx(); if (!a) return;
  try { const b = a.createBuffer(1, 1, 22050), s = a.createBufferSource(); s.buffer = b; s.connect(a.destination); s.start(0); } catch {}
  try { window.speechSynthesis?.getVoices(); } catch {}
}

function tone(freq, start, dur, gain, type = "sine") {
  const a = ctx(); if (!a) return;
  const o = a.createOscillator(), g = a.createGain();
  o.type = type; o.frequency.value = freq; o.connect(g); g.connect(a.destination);
  g.gain.setValueAtTime(0.0001, start); g.gain.exponentialRampToValueAtTime(Math.max(gain, 0.0002), start + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.start(start); o.stop(start + dur + 0.05);
}

// cloche de ring : partiels inharmoniques qui résonnent
export function bell(times = 1) {
  const p = soundPrefs(); if (!p.sound) return;
  const a = ctx(); if (!a) return;
  const v = p.volume;
  for (let i = 0; i < times; i++) {
    const t = a.currentTime + i * 0.42;
    [[830, 0.5, 1.6], [1660, 0.22, 1.1], [2490, 0.14, 0.8], [3320, 0.08, 0.5], [1245, 0.12, 1.3]].forEach(([f, g, d]) => tone(f, t, d, g * v));
  }
}
// claquette en bois des 10 dernières secondes (deux claquements secs)
export function clapper() {
  const p = soundPrefs(); if (!p.sound) return;
  const a = ctx(); if (!a) return;
  for (let i = 0; i < 2; i++) {
    const t = a.currentTime + i * 0.16;
    const len = Math.floor(a.sampleRate * 0.05), buf = a.createBuffer(1, len, a.sampleRate), d = buf.getChannelData(0);
    for (let k = 0; k < len; k++) d[k] = (Math.random() * 2 - 1) * Math.pow(1 - k / len, 4);
    const s = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain();
    s.buffer = buf; f.type = "bandpass"; f.frequency.value = 1800; f.Q.value = 1.2; g.gain.value = 1.4 * p.volume;
    s.connect(f); f.connect(g); g.connect(a.destination); s.start(t);
  }
}
export function beep(freq = 880, ms = 120, times = 1) {
  const p = soundPrefs(); if (!p.sound) return;
  const a = ctx(); if (!a) return;
  for (let i = 0; i < times; i++) tone(freq, a.currentTime + i * (ms / 1000 + 0.08), ms / 1000, 0.45 * p.volume, "square");
}
export function speak(text) {
  const p = soundPrefs(); if (!p.voice || !window.speechSynthesis) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text); u.lang = "fr-FR"; u.rate = 1.05; u.volume = p.volume;
    const fr = speechSynthesis.getVoices().find((v) => v.lang?.startsWith("fr")); if (fr) u.voice = fr;
    speechSynthesis.speak(u);
  } catch {}
}
export function buzz(pattern = [200]) { if (soundPrefs().vibrate) try { navigator.vibrate?.(pattern); } catch {} }
// petite mélodie de rappel (notifications dans l'appli)
export function chime() { beep(988, 110); setTimeout(() => beep(1319, 160), 150); buzz([120, 80, 120]); }
