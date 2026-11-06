/* =========================================================
   DENCHI OLSHOPPE — View templates
   Each view returns an HTML string; app.js mounts and
   enhances it. Shared sections are reused across views so
   nothing is duplicated.
   ========================================================= */
window.DenchiViews = (function () {
  'use strict';

  const { esc, money, icon, productCard } = window.DenchiUI;
  const A = window.DenchiArt;

  /* ---------- shared: contact + newsletter (used on Home & Shop) ---------- */
  function contactSection() {
    const c = window.DENCHI.contact;
    return (
      '<section class="section section--contact" id="contact" aria-labelledby="contact-h">' +
        '<div class="wrap contact__grid">' +
          '<div class="contact__intro reveal">' +
            '<p class="kicker">Customer Care</p>' +
            '<h2 class="h2" id="contact-h">' + esc(c.title) + '</h2>' +
            '<p class="lede">Questions about a piece, an order or a collaboration? Send us a note and our team will get back to you.</p>' +
            '<ul class="contact__list">' +
              '<li>' + icon('mail') + '<a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>' +
              '<li>' + icon('phone') + '<a href="tel:' + esc(c.phoneHref) + '">' + esc(c.phone) + '</a></li>' +
              '<li>' + icon('pin') + '<span>' + c.addressLines.map(esc).join('<br>') + '</span></li>' +
            '</ul>' +
          '</div>' +
          contactForm() +
        '</div>' +
      '</section>'
    );
  }

  function contactForm() {
    const c = window.DENCHI.contact;
    return (
      '<form class="form contact__form reveal" id="contact-form" novalidate data-mailto="' + esc(c.email) + '">' +
        '<p class="form__status" data-status role="status" aria-live="polite"></p>' +
        '<div class="field-row">' +
          field('First name', 'firstName', 'text', { required: true, autocomplete: 'given-name' }) +
          field('Last name', 'lastName', 'text', { required: true, autocomplete: 'family-name' }) +
        '</div>' +
        field('Email', 'email', 'email', { required: true, autocomplete: 'email' }) +
        field('Phone', 'phone', 'tel', { required: true, autocomplete: 'tel', hint: 'Optional' }) +
        field('Message', 'message', 'textarea', { required: true, rows: 5 }) +
        '<button type="submit" class="btn btn--solid btn--lg">Send message' + icon('arrow') + '</button>' +
      '</form>'
    );
  }

  function field(label, name, type, opts) {
    opts = opts || {};
    const cls = 'field' + (opts.wide ? ' field--wide' : '');
    const req = opts.required ? ' required aria-required="true"' : '';
    const input = type === 'textarea'
      ? '<textarea id="f-' + name + '" name="' + name + '" rows="' + (opts.rows || 4) + '"' + req +
        ' placeholder="How can we help?"></textarea>'
      : '<input id="f-' + name + '" name="' + name + '" type="' + type + '"' + req +
        ' autocomplete="' + (opts.autocomplete || 'off') + '" placeholder="' + esc(label) + '">';
    return (
      '<p class="' + cls + '">' +
        '<label for="f-' + name + '">' + esc(label) + (opts.required ? ' <span aria-hidden="true">*</span>' : '') + '</label>' +
        input +
        '<span class="field__error" data-error-for="' + name + '"></span>' +
      '</p>'
    );
  }

  function newsletterSection() {
    const n = window.DENCHI.newsletter;
    return (
      '<section class="section section--news" aria-labelledby="news-h">' +
        '<div class="wrap news reveal">' +
          '<div class="news__copy">' +
            '<p class="kicker">Newsletter</p>' +
            '<h2 class="h2" id="news-h">' + esc(n.heading) + '</h2>' +
            '<p class="lede">' + esc(n.text) + '</p>' +
          '</div>' +
          '<form class="news__form" id="newsletter-form" novalidate>' +
            '<label class="sr-only" for="news-email">Email address</label>' +
            '<input id="news-email" name="email" type="email" placeholder="your@email.com" autocomplete="email">' +
            '<button type="submit" class="btn btn--solid">Subscribe</button>' +
            '<p class="news__note">' +
              '<input type="checkbox" id="news-consent" name="consent">' +
              '<label for="news-consent">Yes, subscribe me to the newsletter.</label>' +
            '</p>' +
            '<p class="form__status" data-status role="status" aria-live="polite"></p>' +
          '</form>' +
        '</div>' +
      '</section>'
    );
  }

  /* ---------- shared: product grid with load more ---------- */
  function gridSection(opts) {
    opts = opts || {};
    const id = opts.id || 'arrivals';
    return (
      '<section class="section' + (opts.tone ? ' section--' + opts.tone : '') + '" id="' + id + '" aria-labelledby="' + id + '-h">' +
        '<div class="wrap">' +
          '<header class="section__head reveal">' +
            '<div>' +
              '<p class="kicker">' + esc(opts.kicker || 'The Edit') + '</p>' +
              '<h2 class="h2" id="' + id + '-h">' + esc(opts.heading) + '</h2>' +
            '</div>' +
            (opts.link ? '<a class="link-arrow" href="' + opts.link.route + '">' + esc(opts.link.label) + icon('arrow') + '</a>' : '') +
          '</header>' +
          '<div class="grid" data-grid="' + id + '"></div>' +
          '<div class="grid__more reveal">' +
            '<button type="button" class="btn btn--outline" data-load-more>Load More</button>' +
            '<p class="grid__count" data-grid-count role="status" aria-live="polite"></p>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  /* ---------- HOME ---------- */
  function home() {
    const d = window.DENCHI;
    const heroArt = A.scene('denchi-hero', { w: 1400, h: 1000 });
    const newestP = d.products.filter(function (p) { return p.id === d.newest.productId; })[0] || d.products[0];

    return hero(heroArt) + intro() + whyChoose() +
      window.DenchiViews.gridSection({
        id: 'arrivals', kicker: 'Just Landed', heading: 'New Arrival',
        link: { route: '#/shop', label: 'View all' }
      }) +
      editorial() + tiramisuFeature() + newestFeature(newestP) +
      contactSection() + newsletterSection();
  }

  function hero(art) {
    return (
      '<section class="hero" aria-labelledby="hero-h">' +
        '<div class="hero__media" aria-hidden="true">' +
          '<img src="' + art + '" alt="" width="1400" height="1000" fetchpriority="high" decoding="async">' +
        '</div>' +
        '<div class="wrap hero__inner">' +
          '<p class="kicker kicker--light anim" style="--d:.05s">Denchi Olshoppe</p>' +
          '<h1 class="h1 anim" style="--d:.12s" id="hero-h">' +
            'New Drops.<br>Better Fits.<br><em>Don’t miss out.</em>' +
          '</h1>' +
          '<p class="lede lede--light anim" style="--d:.2s">Wear confidence and own the moment with style that speaks first.</p>' +
          '<div class="hero__cta anim" style="--d:.28s">' +
            '<a class="btn btn--solid btn--lg" href="#/shop">Shop Now</a>' +
            '<a class="btn btn--outline btn--outline-light btn--lg" href="#/benefits">Explore Collection</a>' +
          '</div>' +
        '</div>' +
        '<div class="hero__foot">' +
          '<a class="hero__scroll" href="#/benefits"><span class="hero__scroll-line"></span>Scroll to discover</a>' +
        '</div>' +
      '</section>'
    );
  }

  function intro() {
    const d = window.DENCHI;
    const tiles = d.categories.map(function (c, i) {
      return (
        '<a class="tile reveal" href="#/benefits" style="--d:' + (i * 0.08) + 's">' +
          '<span class="tile__num">0' + (i + 1) + '</span>' +
          '<span class="tile__name">' + esc(c.name) + '</span>' +
          '<span class="tile__text">' + esc(c.short) + '</span>' +
          '<span class="tile__go" aria-hidden="true">' + icon('arrow') + '</span>' +
        '</a>'
      );
    }).join('');

    return (
      '<section class="section section--intro" id="intro" aria-labelledby="intro-h">' +
        '<div class="wrap intro">' +
          '<div class="intro__head reveal">' +
            '<p class="kicker">The Brand</p>' +
            '<h2 class="h2" id="intro-h">Denchi Olshoppe</h2>' +
            '<p class="h3-sub">' + esc(d.site.tagline) + '</p>' +
          '</div>' +
          '<div class="intro__body reveal">' +
            d.about.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') +
            '<p class="intro__blurb">' + esc(d.site.blurb) + '</p>' +
          '</div>' +
        '</div>' +
        '<div class="wrap"><div class="tiles">' + tiles + '</div></div>' +
      '</section>'
    );
  }

  function whyChoose() {
    const cards = window.DENCHI.benefits.map(function (b, i) {
      const cat = window.DENCHI.categories.filter(function (c) { return c.id === b.category; })[0];
      return (
        '<article class="pick pick--' + (i + 1) + ' reveal" style="--d:' + (i * 0.09) + 's">' +
          '<div class="pick__media">' +
            '<img src="' + A.scene(cat.id, { w: 900, h: 1100, seed: 'pick' + i }) + '" alt="" loading="lazy" decoding="async" width="900" height="1100">' +
            '<span class="pick__index" aria-hidden="true">0' + (i + 1) + '</span>' +
          '</div>' +
          '<div class="pick__body">' +
            '<h3 class="h3">' + esc(b.title) + '</h3>' +
            '<p class="pick__text">' + esc(b.text) + '</p>' +
            '<a class="btn btn--outline" href="#/benefits">Explore' + icon('arrow') + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    return (
      '<section class="section section--sand" id="why" aria-labelledby="why-h">' +
        '<div class="wrap">' +
          '<header class="section__head reveal">' +
            '<div>' +
              '<p class="kicker">Why Denchi</p>' +
              '<h2 class="h2" id="why-h">Why Choose Denchi Olshoppe?</h2>' +
            '</div>' +
            '<p class="section__note">Three worlds, one destination — style you can wear and flavour you can taste.</p>' +
          '</header>' +
          '<div class="picks">' + cards + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function editorial() {
    const d = window.DENCHI;
    const rows = d.editorial.items.map(function (item, i) {
      const cat = d.categories.filter(function (c) { return c.id === item.category; })[0];
      const flip = i % 2 === 1 ? ' row--flip' : '';
      return (
        '<article class="row' + flip + ' reveal">' +
          '<div class="row__media">' +
            '<img src="' + A.scene(cat.id, { w: 1200, h: 900, seed: 'ed' + i }) + '" alt="" loading="lazy" decoding="async" width="1200" height="900">' +
          '</div>' +
          '<div class="row__body">' +
            '<p class="kicker">0' + (i + 1) + ' — ' + esc(item.tag) + '</p>' +
            '<h3 class="h3">' + esc(cat.name) + '</h3>' +
            '<p class="row__text">' + esc(cat.long) + '</p>' +
            '<a class="link-arrow" href="#/benefits">Read more' + icon('arrow') + '</a>' +
          '</div>' +
        '</article>'
      );
    }).join('');

    return (
      '<section class="section" id="elevate" aria-labelledby="elevate-h">' +
        '<div class="wrap">' +
          '<header class="section__head section__head--center reveal">' +
            '<p class="kicker">The Collection</p>' +
            '<h2 class="h2" id="elevate-h">' + esc(d.editorial.heading) + '</h2>' +
          '</header>' +
          '<div class="rows">' + rows + '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function tiramisuFeature() {
    const t = window.DENCHI.tiramisu;
    return (
      '<section class="section section--feature" id="tiramisu" aria-labelledby="tir-h">' +
        '<div class="wrap feature">' +
          '<div class="feature__media reveal">' +
            '<img src="' + A.scene('cream', { w: 1100, h: 1100, seed: 'tiramisu' }) + '" alt="Artisan tiramisu, layered and finished with a dusting of cocoa" loading="lazy" decoding="async" width="1100" height="1100">' +
          '</div>' +
          '<div class="feature__body reveal" style="--d:.1s">' +
            '<p class="kicker kicker--light">' + esc(t.kicker) + '</p>' +
            '<h2 class="h2 h2--xl" id="tir-h">“' + esc(t.heading) + '”</h2>' +
            '<p class="lede lede--light">' + esc(t.text) + '</p>' +
            '<p class="feature__long">' + esc(t.long) + '</p>' +
            '<a class="btn btn--solid btn--lg" href="#/shop">Shop Now' + icon('arrow') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function newestFeature(p) {
    const d = window.DENCHI;
    return (
      '<section class="section section--sand" id="newest" aria-labelledby="newest-h">' +
        '<div class="wrap feature feature--rev">' +
          '<div class="feature__media reveal">' +
            '<img src="' + A.product(p, 0) + '" alt="' + esc(p.name) + '" loading="lazy" decoding="async" width="800" height="1000">' +
          '</div>' +
          '<div class="feature__body reveal" style="--d:.1s">' +
            '<p class="kicker">Latest Drop</p>' +
            '<h2 class="h2" id="newest-h">' + esc(d.newest.heading) + '</h2>' +
            '<h3 class="h3">' + esc(p.name) + '</h3>' +
            '<p class="feature__price">' +
              (window.DenchiUI.onSale(p)
                ? '<s>' + money(p.compareAt) + '</s><span>' + money(p.price) + '</span>'
                : '<span>' + money(p.price) + '</span>') +
            '</p>' +
            '<a class="btn btn--solid btn--lg" href="#/shop">Shop Now' + icon('arrow') + '</a>' +
          '</div>' +
        '</div>' +
      '</section>'
    );
  }

  function pageHead(kicker, heading, lede) {
    return (
      '<section class="pagehead">' +
        '<div class="wrap pagehead__inner">' +
          '<p class="kicker reveal">' + esc(kicker) + '</p>' +
          '<h1 class="h1 h1--page reveal" style="--d:.06s">' + esc(heading) + '</h1>' +
          (lede ? '<p class="lede reveal" style="--d:.12s">' + esc(lede) + '</p>' : '') +
        '</div>' +
      '</section>'
    );
  }

  function chips() {
    const cats = window.DENCHI.categories;
    return ['<button type="button" class="chip is-active" data-filter="all">All</button>']
      .concat(cats.map(function (c) {
        return '<button type="button" class="chip" data-filter="' + esc(c.id) + '">' + esc(c.name) + '</button>';
      })).join('');
  }

  /* ---------- SHOP ---------- */
  function shop() {
    return (
      pageHead('The Store', 'Shop', 'Browse the latest New Arrivals from Denchi Olshoppe.') +
      '<section class="section section--shop" aria-labelledby="shop-h">' +
        '<div class="wrap">' +
          '<h2 class="sr-only" id="shop-h">Products</h2>' +
          '<div class="toolbar reveal" role="search">' +
            '<div class="toolbar__search">' +
              '<label class="sr-only" for="shop-search">Search products</label>' + icon('search') +
              '<input id="shop-search" type="search" placeholder="Search products…" autocomplete="off">' +
            '</div>' +
            '<div class="toolbar__filters" role="group" aria-label="Filter by category">' + chips() + '</div>' +
            '<div class="toolbar__sort">' +
              '<label class="sr-only" for="shop-sort">Sort products</label>' +
              '<select id="shop-sort">' +
                '<option value="featured">Featured</option>' +
                '<option value="new">Newest</option>' +
                '<option value="price-asc">Price: Low to High</option>' +
                '<option value="price-desc">Price: High to Low</option>' +
                '<option value="name">Alphabetical</option>' +
              '</select>' +
            '</div>' +
          '</div>' +
          '<div class="grid" data-grid="shop"></div>' +
          '<div class="grid__empty" data-empty hidden>' +
            '<h3 class="h3">No products found</h3>' +
            '<p class="lede">Try a different search term, or clear the filters to see everything in the store.</p>' +
            '<button type="button" class="btn btn--outline" data-reset>Clear filters</button>' +
          '</div>' +
          '<div class="grid__more">' +
            '<button type="button" class="btn btn--outline" data-load-more>Load More</button>' +
            '<p class="grid__count" data-grid-count role="status" aria-live="polite"></p>' +
          '</div>' +
        '</div>' +
      '</section>' +
      contactSection() + newsletterSection()
    );
  }

  /* ---------- BENEFITS ---------- */
  function benefits() {
    return (
      pageHead('Why Denchi', 'Benefits', window.DENCHI.site.tagline) +
      whyChoose() + editorial() + tiramisuFeature() +
      contactSection() + newsletterSection()
    );
  }

  /* ---------- POLICY PAGES ---------- */
  function policy(id) {
    const d = window.DENCHI;
    const p = d.policies.filter(function (x) { return x.id === id; })[0];
    if (!p) return notFound();

    let body;
    if (p.ready) {
      body = '<div class="accordion reveal">' + d.faq.map(function (item, i) {
        return (
          '<details class="acc"' + (i === 0 ? ' open' : '') + '>' +
            '<summary><span>' + esc(item.q) + '</span><span class="acc__sign" aria-hidden="true"></span></summary>' +
            '<div class="acc__panel"><p>' + esc(item.a) + '</p></div>' +
          '</details>'
        );
      }).join('') + '</div>';
    } else {
      body =
        '<div class="notice reveal">' +
          '<h2 class="h3">This page is being prepared</h2>' +
          '<p class="lede">We have not published the full ' + esc(p.title.toLowerCase()) +
            ' text yet. Rather than publish terms we cannot stand behind, we would rather point you to a real person.</p>' +
          '<p class="lede">For anything about ' + esc(p.title.toLowerCase()) +
            ', contact our Customer Care and we will walk you through it.</p>' +
          '<div class="notice__actions">' +
            '<a class="btn btn--solid" href="mailto:' + esc(d.contact.email) + '">Email Customer Care</a>' +
            '<a class="btn btn--outline" href="tel:' + esc(d.contact.phoneHref) + '">' + esc(d.contact.phone) + '</a>' +
          '</div>' +
        '</div>';
    }

    return (
      pageHead('Policies', p.title, '') +
      '<section class="section section--policy"><div class="wrap wrap--narrow">' +
        '<nav class="crumbs reveal" aria-label="Breadcrumb">' +
          '<a href="#/home">Home</a><span aria-hidden="true"> / </span><span>' + esc(p.title) + '</span>' +
        '</nav>' +
        body +
        '<nav class="policylist reveal" aria-label="Other policies">' +
          d.policies.filter(function (x) { return x.id !== id; }).map(function (x) {
            return '<a class="policylist__link" href="#/policy/' + esc(x.id) + '">' + esc(x.title) + '</a>';
          }).join('') +
        '</nav>' +
      '</div></section>'
    );
  }

  function notFound() {
    return (
      pageHead('404', 'Page not found', '') +
      '<section class="section"><div class="wrap wrap--narrow center">' +
        '<p class="lede">The page you were looking for has moved or no longer exists.</p>' +
        '<a class="btn btn--solid btn--lg" href="#/home">Back to home</a>' +
      '</div></section>'
    );
  }

  return {
    home, hero, intro, whyChoose, editorial, tiramisuFeature, newestFeature,
    shop, benefits, policy, notFound, pageHead, chips,
    contactSection, contactForm, newsletterSection, gridSection, field
  };
})();
