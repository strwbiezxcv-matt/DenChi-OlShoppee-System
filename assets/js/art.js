/* =========================================================
   DENCHI OLSHOPPE — Generative artwork
   The source project ships no photography, so every visual
   is produced as a small, deterministic SVG data-URI: no
   network requests, no broken images, infinitely crisp.
   Swap a <div class="art"> for a real <img> at any time.
   ========================================================= */
window.DenchiArt = (function () {
  'use strict';

  /* Stable string hash → seeded pseudo-random sequence */
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return h;
  }

  function rng(seed) {
    let s = seed || 1;
    return function () {
      s ^= s << 13; s >>>= 0;
      s ^= s >> 17;
      s ^= s << 5;  s >>>= 0;
      return s / 4294967296;
    };
  }

  const PALETTES = {
    denim:   { a: '#dfe7ef', b: '#9db2c6', ink: '#22303f', glow: '#f4f7fa' },
    indigo:  { a: '#e3e6ef', b: '#8f9ac0', ink: '#232842', glow: '#f6f7fc' },
    stone:   { a: '#eeeae3', b: '#b8ac9b', ink: '#3b332a', glow: '#faf8f4' },
    cocoa:   { a: '#f0e4d6', b: '#b98a63', ink: '#3a2a1d', glow: '#fbf5ee' },
    espresso:{ a: '#e7ded4', b: '#9c8574', ink: '#332721', glow: '#f7f2ec' },
    sage:    { a: '#e6ebe4', b: '#9fae9c', ink: '#2b332a', glow: '#f5f8f4' },
    cream:   { a: '#f7f1e4', b: '#d9c49a', ink: '#3a2f1f', glow: '#fdfaf4' },
    /* category tones used by the editorial / category artwork */
    clothes: { a: '#dde6ee', b: '#93a9bf', ink: '#22303f', glow: '#f5f8fb' },
    bags:    { a: '#ece0d4', b: '#ab8467', ink: '#3a2a1d', glow: '#fbf6f0' },
    foods:   { a: '#f6efe0', b: '#d3bb90', ink: '#3b301f', glow: '#fdfaf3' },
    'denchi-hero': { a: '#8e9a9c', b: '#3d3a36', ink: '#17140f', glow: '#e8e2d8' }
  };

  function palette(key) {
    return PALETTES[key] || PALETTES.stone;
  }

  function uri(svg) {
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg.replace(/\s{2,}/g, ' '));
  }

  /* Generic composition: tonal field, soft light, drifting arcs */
  function scene(key, opts) {
    opts = opts || {};
    const p = palette(key);
    const w = opts.w || 900;
    const h = opts.h || 1100;
    const r = rng(hash(key + (opts.seed || '')));
    const uid = 'g' + hash(key + (opts.seed || '')).toString(36);

    let shapes = '';
    const count = 3;
    for (let i = 0; i < count; i++) {
      const cx = Math.round(r() * w);
      const cy = Math.round(r() * h);
      const rad = Math.round((0.18 + r() * 0.3) * Math.max(w, h));
      shapes +=
        '<circle cx="' + cx + '" cy="' + cy + '" r="' + rad +
        '" fill="' + p.glow + '" opacity="' + (0.16 + i * 0.09).toFixed(2) + '"/>';
    }

    const bands = 5;
    for (let i = 0; i < bands; i++) {
      const y = Math.round((h / bands) * i + r() * 40);
      shapes +=
        '<path d="M0 ' + y + ' Q ' + Math.round(w * 0.5) + ' ' + (y - 40 - r() * 60) +
        ' ' + w + ' ' + (y + 20) + '" stroke="' + p.ink + '" stroke-width="1" fill="none" opacity="0.07"/>';
    }

    return uri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + p.a + '"/><stop offset="1" stop-color="' + p.b + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + uid + ')"/>' +
      shapes +
      '<rect x="24" y="24" width="' + (w - 48) + '" height="' + (h - 48) +
      '" fill="none" stroke="' + p.ink + '" stroke-opacity="0.16"/>' +
      '</svg>'
    );
  }

  /* Product composition: garment-like silhouette on tonal field */
  function product(product, index) {
    const index0 = typeof index === 'number' ? index : 0;
    const key = (product.id || 'x') + index0;
    const p = palette(product.tone || 'denim');
    const w = 800, h = 1000;
    const r = rng(hash(key));
    const uid = 'p' + hash(key).toString(36);

    /* abstract garment silhouette — waistband + two legs */
    const cx = w / 2;
    const top = 250 + r() * 30;
    const waist = top + 170;
    const hem = 800 - r() * 30;
    const gap = 16 + r() * 22;

    const garment =
      '<path d="M ' + (cx - 150) + ' ' + top +
      ' L ' + (cx + 150) + ' ' + top +
      ' L ' + (cx + 168) + ' ' + waist +
      ' L ' + (cx - 168) + ' ' + waist + ' Z" fill="' + p.ink + '" opacity="0.86"/>' +
      '<path d="M ' + (cx - 168) + ' ' + waist +
      ' L ' + (cx - gap) + ' ' + waist +
      ' L ' + (cx - gap - 6) + ' ' + hem +
      ' L ' + (cx - 176) + ' ' + hem + ' Z" fill="' + p.ink + '" opacity="0.78"/>' +
      '<path d="M ' + (cx + gap) + ' ' + waist +
      ' L ' + (cx + 168) + ' ' + waist +
      ' L ' + (cx + 176) + ' ' + hem +
      ' L ' + (cx + gap + 6) + ' ' + hem + ' Z" fill="' + p.ink + '" opacity="0.78"/>' +
      '<line x1="' + (cx - 150) + '" y1="' + (top + 58) + '" x2="' + (cx + 150) + '" y2="' + (top + 58) +
      '" stroke="' + p.glow + '" stroke-opacity="0.5"/>' +
      '<circle cx="' + (cx + 120) + '" cy="' + (top + 108) + '" r="9" fill="' + p.glow + '" opacity="0.8"/>' +
      '<circle cx="' + (cx + 120) + '" cy="' + (top + 140) + '" r="9" fill="' + p.glow + '" opacity="0.8"/>';

    return uri(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img">' +
      '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0.6" y2="1">' +
      '<stop offset="0" stop-color="' + p.a + '"/><stop offset="1" stop-color="' + p.b + '"/></linearGradient></defs>' +
      '<rect width="' + w + '" height="' + h + '" fill="url(#' + uid + ')"/>' +
      '<circle cx="' + (200 + r() * 400) + '" cy="' + (260 + r() * 200) + '" r="230" fill="' + p.glow + '" opacity="0.34"/>' +
      '<line x1="70" y1="0" x2="70" y2="' + h + '" stroke="' + p.ink + '" stroke-opacity="0.07"/>' +
      '<line x1="' + (w - 70) + '" y1="0" x2="' + (w - 70) + '" y2="' + h + '" stroke="' + p.ink + '" stroke-opacity="0.07"/>' +
      garment +
      '</svg>'
    );
  }

  return { scene, product, palette, PALETTES };
})();
