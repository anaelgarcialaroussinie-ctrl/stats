// Open Food Facts : base alimentaire libre et gratuite.
const FIELDS = "code,product_name,product_name_fr,brands,nutriments,serving_quantity,image_front_small_url";

function normalize(p) {
  if (!p) return null;
  const n = p.nutriments || {};
  const kcal = n["energy-kcal_100g"] ?? (n.energy_100g ? n.energy_100g / 4.184 : null);
  if (kcal === null || kcal === undefined) return null;
  return {
    code: p.code,
    name: (p.product_name_fr || p.product_name || "Produit sans nom").trim(),
    brand: (p.brands || "").split(",")[0].trim(),
    kcal: Number(kcal) || 0,
    p: Number(n.proteins_100g) || 0,
    c: Number(n.carbohydrates_100g) || 0,
    f: Number(n.fat_100g) || 0,
    serving: Number(p.serving_quantity) || null,
    img: p.image_front_small_url || "",
    source: "Open Food Facts",
  };
}

export async function byBarcode(code) {
  const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=${FIELDS}`);
  if (!r.ok) throw new Error("network");
  const j = await r.json();
  if (j.status !== 1) return null;
  return normalize({ ...j.product, code });
}

export async function search(q) {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=${FIELDS}&lc=fr&cc=fr`;
  const r = await fetch(url);
  if (!r.ok) throw new Error("network");
  const j = await r.json();
  return (j.products || []).map(normalize).filter(Boolean);
}

// ---------- scanner de code-barres ----------
let zxingPromise;
function loadZxing() {
  if (window.ZXing) return Promise.resolve(window.ZXing);
  zxingPromise ||= new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@zxing/library@0.21.3/umd/index.min.js";
    s.onload = () => res(window.ZXing); s.onerror = rej;
    document.head.appendChild(s);
  });
  return zxingPromise;
}

export async function startScanner(video, onCode) {
  let stopped = false, stream, reader, raf;
  const stop = () => {
    stopped = true;
    cancelAnimationFrame(raf);
    try { reader?.reset(); } catch {}
    stream?.getTracks().forEach((t) => t.stop());
  };
  if ("BarcodeDetector" in window) {
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    video.srcObject = stream; await video.play();
    const det = new window.BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });
    const tick = async () => {
      if (stopped) return;
      try { const codes = await det.detect(video); if (codes[0]) { stop(); onCode(codes[0].rawValue); return; } } catch {}
      raf = requestAnimationFrame(tick);
    };
    tick();
  } else {
    const ZX = await loadZxing();
    const hints = new Map();
    hints.set(ZX.DecodeHintType.POSSIBLE_FORMATS, [ZX.BarcodeFormat.EAN_13, ZX.BarcodeFormat.EAN_8, ZX.BarcodeFormat.UPC_A, ZX.BarcodeFormat.UPC_E]);
    reader = new ZX.BrowserMultiFormatReader(hints);
    await reader.decodeFromConstraints({ video: { facingMode: "environment" } }, video, (res) => {
      if (res && !stopped) { const code = res.getText(); stop(); onCode(code); }
    });
  }
  return stop;
}
