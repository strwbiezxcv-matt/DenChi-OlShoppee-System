/* =========================================================
   DENCHI OLSHOPPE — UI helpers + shared components
   ========================================================= */
window.DenchiUI = (function () {
  'use strict';

  const peso = new Intl.NumberFormat('en-PH', {
    style: 'currency', currency: 'PHP', minimumFractionDigits: 2
  });

  function money(n) { return peso.format(n); }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  }

  const ICONS = {
    search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"/><path d="M16.5 16.5 21 21"/></svg>',
    bag: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 8h12l-1 12H7L6 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.6-7 9-7 9Z"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    menu: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    arrow: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 12h14"/></svg>',
    mail: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 3h3l2 5-2.5 1.5a12 12 0 0 0 6 6L16 13l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 4 5a2 2 0 0 1 2-2Z"/></svg>',
    pin: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z"/><circle cx="12" cy="10" r="2.5"/></svg>'
  };

  function icon(name) { return ICONS[name] || ''; }

  function onSale(p) {
    return typeof p.compareAt === 'number' && p.compareAt > p.price;
  }

  function discount(p) {
    if (!onSale(p)) return 0;
    return Math.round((1 - p.price / p.compareAt) * 100);
  }

  /* ---------------- Product card ---------------- */
  function productCard(p, index) {
    const i = index || 0;
    const sale = onSale(p);
    const off = discount(p);
    const art = window.DenchiArt.product(p, i);
    const wished = window.DenchiStore.inWishlist(p.id);

    const badges = [];
    if (p.badge) badges.push('<span class="badge badge--hot">' + esc(p.badge) + '</span>');
    if (p.isNew && !p.badge) badges.push('<span class="badge badge--new">New</span>');
    if (off) badges.push('<span class="badge badge--off">-' + off + '%</span>');

    return (
      '<article class="card reveal" data-product="' + esc(p.id) + '" data-index="' + i + '">' +
        '<div class="card__media">' +
          '<img class="card__img" src="' + art + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="800" height="1000">' +
          (badges.length ? '<div class="card__badges">' + badges.join('') + '</div>' : '') +
          '<button type="button" class="card__wish' + (wished ? ' is-on' : '') + '" data-wish="' + esc(p.id) + '"' +
            ' aria-pressed="' + (wished ? 'true' : 'false') + '"' +
            ' aria-label="' + (wished ? 'Remove ' : 'Save ') + esc(p.name) + (wished ? ' from' : ' to') + ' wishlist">' +
            icon('heart') + '</button>' +
          '<div class="card__veil">' +
            '<button type="button" class="btn btn--solid btn--block" data-add="' + esc(p.id) + '">' +
              '<span>Add to Cart</span>' + icon('bag') +
            '</button>' +
            '<button type="button" class="btn btn--ghost btn--block" data-quick="' + esc(p.id) + '">Quick View</button>' +
          '</div>' +
        '</div>' +
        '<div class="card__body">' +
          '<p class="card__eyebrow">' + esc(p.category === 'clothes' ? 'Premium Clothes' : p.category) + '</p>' +
          '<h3 class="card__title"><button type="button" class="linkish" data-quick="' + esc(p.id) + '">' + esc(p.name) + '</button></h3>' +
          '<p class="card__price">' +
            (sale ? '<s>' + money(p.compareAt) + '</s><span class="card__now">' + money(p.price) + '</span>' : '<span>' + money(p.price) + '</span>') +
          '</p>' +
        '</div>' +
      '</article>'
    );
  }

  return { money, esc, el, $, $$, icon, ICONS, productCard, onSale, discount };
})();
