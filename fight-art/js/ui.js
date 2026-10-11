// Petits outils d'interface : échappement, icônes, feuille du bas, toast.
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const P = {
  today: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  food: '<path d="M7 3v8m-2.5-8v5a2.5 2.5 0 0 0 5 0V3M7 11v10m10-18c-2 1.5-3 4-3 7 0 2 1 3 3 3v8"/>',
  train: '<path d="M3 9v6m3-8v10M18 7v10m3-8v6M6 12h12"/>',
  progress: '<path d="M4 19h16M6 15l4-4 3 3 5-6"/>',
  team: '<path d="M8.5 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm7 0a3 3 0 1 0 0-6M3 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5m1-5c2.3.2 4 1.8 4.5 5"/>',
  scan: '<path d="M4 8V5a1 1 0 0 1 1-1h3m8 0h3a1 1 0 0 1 1 1v3m0 8v3a1 1 0 0 1-1 1h-3m-8 0H5a1 1 0 0 1-1-1v-3M7 9v6m3-6v6m3-6v6m4-6v6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  search: '<path d="M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Zm9 2-4-4"/>',
  play: '<path d="M8 5v14l11-7z"/>',
  pause: '<path d="M8 5v14M16 5v14"/>',
  timer: '<path d="M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l2.5 2.5M9.5 2h5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  trash: '<path d="M5 7h14M10 7V4h4v3m-7 0 1 13h8l1-13"/>',
  check: '<path d="M5 12.5 10 17l9-10"/>',
  water: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
  academy: '<path d="M3 9.5 12 5l9 4.5-9 4.5z"/><path d="M7 11.5V16c0 1.2 2.2 2.5 5 2.5s5-1.3 5-2.5v-4.5M21 9.5V15"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
};
export const icon = (name, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${P[name] || ""}</svg>`;

// feuille du bas
let onClose = null;
export function openSheet(title, html, { onMount, close } = {}) {
  const root = document.getElementById("sheet-root");
  if (onClose) { try { onClose(); } catch {} onClose = null; }
  root.innerHTML = `<div class="sheet-backdrop" data-sheet-bg><section class="sheet" role="dialog" aria-modal="true" aria-label="${esc(title)}">
    <div class="sheet-grip"></div>
    <div class="sheet-head"><h2 class="display">${esc(title)}</h2><button class="icon-btn" data-sheet-close aria-label="Fermer">${icon("close")}</button></div>
    <div class="sheet-body">${html}</div></section></div>`;
  onClose = close || null;
  const bg = root.querySelector("[data-sheet-bg]");
  bg.addEventListener("click", (e) => { if (e.target === bg) closeSheet(); });
  root.querySelector("[data-sheet-close]").addEventListener("click", closeSheet);
  document.body.style.overflow = "hidden";
  const body = root.querySelector(".sheet-body");
  onMount?.(body);
  setTimeout(() => root.querySelector("[data-sheet-close]")?.focus(), 50);
  return body;
}
export function closeSheet() {
  const root = document.getElementById("sheet-root");
  if (!root.innerHTML) return;
  onClose?.(); onClose = null;
  root.innerHTML = "";
  document.body.style.overflow = "";
}
export function sheetBody() { return document.querySelector("#sheet-root .sheet-body"); }

let tt;
export function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg; el.classList.add("show");
  clearTimeout(tt); tt = setTimeout(() => el.classList.remove("show"), 2200);
}

export function scale(name, value, low, high) {
  return `<div class="scale" role="group" aria-label="${esc(name)}">${[1, 2, 3, 4, 5].map((v) => `<button type="button" data-scale="${name}" data-v="${v}" aria-pressed="${v === value}">${v}</button>`).join("")}</div>
  <div class="scale-legend"><span>${esc(low)}</span><span>${esc(high)}</span></div>`;
}

export function meter(label, value, target, unit = "") {
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const over = target && value > target * 1.1;
  return `<div class="meter"><div class="meter-top"><span>${esc(label)}</span><span class="num"><b>${Math.round(value)}</b> / ${Math.round(target)}${unit}</span></div>
  <div class="bar ${over ? "over" : ""}"><i style="width:${pct}%"></i></div></div>`;
}

export function initials(name = "") {
  return name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export function sparkline(points, { unit = "", height = 120 } = {}) {
  if (points.length < 2) return `<p class="muted small">Ajoute au moins deux mesures pour voir la courbe.</p>`;
  const W = 320, H = height, pad = 22;
  const ys = points.map((p) => p.v), min = Math.min(...ys), max = Math.max(...ys);
  const span = max - min || 1;
  const x = (i) => pad + (i / (points.length - 1)) * (W - pad * 2);
  const y = (v) => pad / 2 + (1 - (v - min) / span) * (H - pad * 1.6);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.v).toFixed(1)}`).join(" ");
  const last = points[points.length - 1];
  return `<svg class="spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Évolution de ${min} à ${max}${unit}">
    <line class="gd" x1="${pad}" x2="${W - pad}" y1="${y(max)}" y2="${y(max)}"/><line class="gd" x1="${pad}" x2="${W - pad}" y1="${y(min)}" y2="${y(min)}"/>
    <text x="0" y="${y(max) + 4}">${max}</text><text x="0" y="${y(min) + 4}">${min}</text>
    <path class="ln" d="${d}"/><circle class="pt" cx="${x(points.length - 1)}" cy="${y(last.v)}" r="4.5"/>
  </svg>`;
}
