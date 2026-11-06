/* =========================================================
   DENCHI OLSHOPPE — App controller
   Hash router, header behaviour, footer, product grid,
   cart / wishlist / search overlays, forms and toasts.
   No dependencies.
   ========================================================= */
(function () {
  'use strict';

  const { $, $$, esc, money, icon, productCard } = window.DenchiUI;
  const Store = window.DenchiStore;
  const Views = window.DenchiViews;
  const D = window.DENCHI;
  const A = window.DenchiArt;

  const PAGE_SIZE = 4;          /* grid renders PAGE_SIZE, Load More adds more */
  const main = $('#main');

  let lastFocus = null;
  let gridState = { source: [], shown: PAGE_SIZE, filter: 'all', sort: 'featured', query: '' };

  /* ---------------- toast ---------------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-on');
      setTimeout(function () { toastEl.hidden = true; }, 260);
    }, 2600);
  }

  /* ---------------- header ---------------- */
  function buildNav() {
    const items = D.nav.map(function (n) {
      return '<li><a class="navlink" href="' + n.route + '" data-route="' + n.route.slice(2) + '">' + esc(n.label) + '</a></li>';
    }).join('');
    $('#primary-nav').innerHTML = items;

    const mobile = D.nav.map(function (n) {
      return '<li><a class="mobilenav__link" href="' + n.route + '" data-route="' + n.route.slice(2) + '">' +
        esc(n.label) + '<span aria-hidden="true">' + icon('arrow') + '</span></a></li>';
    }).join('') +
      D.policies.map(function (p) {
        return '<li><a class="mobilenav__link mobilenav__link--sub" href="#/policy/' + esc(p.id) + '">' + esc(p.title) + '</a></li>';
      }).join('');
    $('#mobile-nav-list').innerHTML = mobile;
  }

  function markActiveNav() {
    const route = (location.hash || '#/home').slice(2).split('/')[0];
    $$('[data-route]').forEach(function (a) {
      const on = a.getAttribute('data-route') === route;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
  }

  const hdr = $('[data-hdr]');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      const y = window.scrollY;
      hdr.classList.toggle('is-stuck', y > 24);
      hdr.classList.toggle('is-light', y < 40 && !!$('.hero'));
      ticking = false;
    });
  }

  /* ---------------- footer ---------------- */
  function buildFooter() {
    const c = D.contact;
    const col = function (title, links) {
      return '<div class="ftr__col"><h2 class="ftr__title">' + esc(title) + '</h2><ul class="ftr__list">' +
        links.map(function (l) {
          return '<li><a href="' + l[1] + '">' + esc(l[0]) + '</a></li>';
        }).join('') + '</ul></div>';
    };

    $('[data-footer]').innerHTML =
      '<div class="wrap ftr__inner">' +
        '<div class="ftr__brand">' +
          '<a class="brand brand--ftr" href="#/home"><span class="brand__mark" aria-hidden="true">D</span><span class="brand__name">Denchi</span></a>' +
          '<p class="ftr__blurb">' + esc(D.site.tagline) + '</p>' +
          '<p class="ftr__blurb ftr__blurb--soft">' + esc(D.site.blurb) + '</p>' +
        '</div>' +
        col('Navigate', D.nav.map(function (n) { return [n.label, n.route]; })
          .concat([['New Arrivals', '#/shop']])) +
        col('Policies', D.policies.map(function (p) { return [p.title, '#/policy/' + p.id]; })) +
        '<div class="ftr__col ftr__col--care">' +
          '<h2 class="ftr__title">Customer Care</h2>' +
          '<ul class="ftr__list ftr__list--care">' +
            '<li><a href="mailto:' + esc(c.email) + '">' + esc(c.email) + '</a></li>' +
            '<li><a href="tel:' + esc(c.phoneHref) + '">' + esc(c.phone) + '</a></li>' +
            '<li><span>' + c.addressLines.map(esc).join('<br>') + '</span></li>' +
          '</ul>' +
          '<a class="btn btn--outline ftr__cta" href="#/shop">Shop the collection</a>' +
        '</div>' +
      '</div>' +
      '<div class="wrap ftr__base">' +
        '<p>&copy; ' + new Date().getFullYear() + ' ' + esc(D.site.name) + ' Olshoppe. All rights reserved.</p>' +
        '<p>Prices in Philippine Peso (₱).</p>' +
      '</div>';
  }

  /* ---------------- scroll reveal ---------------- */
  let io;
  function initReveal(root) {
    if (!('IntersectionObserver' in window)) {
      $$('.reveal', root || document).forEach(function (n) { n.classList.add('is-in'); });
      return;
    }
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    }
    $$('.reveal:not(.is-in)', root || document).forEach(function (n) { io.observe(n); });
  }

  /* ---------------- overlay sheets ---------------- */
  const sheets = {
    menu: $('#mobile-nav'), search: $('#search-sheet'),
    cart: $('#cart-sheet'), wishlist: $('#wish-sheet'), quick: $('#quick-sheet')
  };
  let openSheetName = null;

  function syncBurger() {
    const burger = $('[data-open-menu]');
    if (burger) burger.setAttribute('aria-expanded', openSheetName === 'menu' ? 'true' : 'false');
  }

  function openSheet(name) {
    const node = sheets[name];
    if (!node) return;
    closeSheet(true);
    lastFocus = document.activeElement;
    node.hidden = false;
    openSheetName = name;
    document.body.classList.add('is-locked');
    requestAnimationFrame(function () { node.classList.add('is-open'); });
    syncBurger();
    const focusable = node.querySelector('input, button, [href], select, textarea');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }

  function closeSheet(silent) {
    const node = sheets[openSheetName];
    if (!node) return;
    node.classList.remove('is-open');
    openSheetName = null;
    document.body.classList.remove('is-locked');
    syncBurger();
    setTimeout(function () { if (!openSheetName) node.hidden = true; }, 280);
    if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('click', function (e) {
    const t = e.target;
    if (t.closest('[data-close-sheet]')) {
      /* links inside a sheet must still navigate, so only swallow
         the click for buttons / scrims */
      if (!t.closest('a')) e.preventDefault();
      closeSheet();
      return;
    }
    if (t.closest('[data-open-cart]')) { e.preventDefault(); renderCart(); openSheet('cart'); return; }
    if (t.closest('[data-open-wishlist]')) { e.preventDefault(); renderWishlist(); openSheet('wishlist'); return; }
    if (t.closest('[data-open-search]')) { e.preventDefault(); openSearch(); return; }
    if (t.closest('[data-open-menu]')) { e.preventDefault(); openSheet('menu'); return; }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openSheetName) { e.preventDefault(); closeSheet(); }
    if (e.key === '/' && !openSheetName && !/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); openSearch();
    }
  });

  function openSearch() {
    openSheet('search');
    const input = $('#global-search');
    input.value = '';
    renderSearchResults('');
  }

  function renderSearchResults(q) {
    const box = $('[data-search-results]');
    const term = q.trim().toLowerCase();
    if (!term) {
      box.innerHTML = '<p class="searchbox__hint">Start typing to search New Arrivals — try “denim”, “skirt” or “shorts”.</p>';
      return;
    }
    const hits = D.products.filter(function (p) {
      return (p.name + ' ' + p.category).toLowerCase().indexOf(term) > -1;
    });
    if (!hits.length) {
      box.innerHTML = '<div class="searchbox__empty"><p class="h3">No matches for “' + esc(q) + '”</p>' +
        '<p class="lede">Check the spelling, or browse the full store instead.</p>' +
        '<a class="btn btn--outline" href="#/shop" data-close-sheet>Go to Shop</a></div>';
      return;
    }
    box.innerHTML =
      '<p class="searchbox__count">' + hits.length + ' result' + (hits.length > 1 ? 's' : '') + ' for “' + esc(q) + '”</p>' +
      '<ul class="searchlist">' + hits.map(function (p) {
        return '<li><button type="button" class="searchitem" data-quick="' + esc(p.id) + '">' +
          '<img src="' + A.product(p, 0) + '" alt="" width="200" height="250" loading="lazy">' +
          '<span class="searchitem__name">' + esc(p.name) + '</span>' +
          '<span class="searchitem__price">' + money(p.price) + '</span></button></li>';
      }).join('') + '</ul>' +
      '<a class="btn btn--outline btn--block" href="#/shop" data-close-sheet>View all products</a>';
  }

  /* ---------------- quick view ---------------- */
  function openQuickView(id) {
    const p = D.products.filter(function (x) { return x.id === id; })[0];
    if (!p) return;
    const cat = D.categories.filter(function (c) { return c.id === p.category; })[0];
    $('[data-quick-body]').innerHTML =
      '<div class="quick">' +
        '<div class="quick__media"><img src="' + A.product(p, 0) + '" alt="' + esc(p.name) + '" width="800" height="1000"></div>' +
        '<div class="quick__body">' +
          '<p class="kicker">' + esc(cat ? cat.name : p.category) + '</p>' +
          '<h2 class="h2" id="quick-h">' + esc(p.name) + '</h2>' +
          '<p class="quick__price">' +
            (window.DenchiUI.onSale(p)
              ? '<s>' + money(p.compareAt) + '</s><span>' + money(p.price) + '</span>'
              : '<span>' + money(p.price) + '</span>') +
          '</p>' +
          '<p class="lede">' + esc(cat ? cat.long : '') + '</p>' +
          '<div class="quick__actions">' +
            '<button type="button" class="btn btn--solid btn--lg" data-add="' + esc(p.id) + '">Add to Cart</button>' +
            '<button type="button" class="btn btn--outline btn--lg" data-wish="' + esc(p.id) + '">' +
              (Store.inWishlist(p.id) ? 'Saved to wishlist' : 'Save to wishlist') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    openSheet('quick');
  }

  /* ---------------- cart + wishlist ---------------- */
  function renderCart() {
    const lines = Store.cartLines();
    const body = $('[data-cart-body]');
    const foot = $('[data-cart-foot]');
    const count = Store.cartCount();
    $('[data-cart-title-count]').textContent = count ? '(' + count + ')' : '';

    if (!lines.length) {
      body.innerHTML =
        '<div class="empty">' +
          '<span class="empty__icon" aria-hidden="true">' + icon('bag') + '</span>' +
          '<h3 class="h3">Your cart is empty</h3>' +
          '<p class="lede">Browse the New Arrivals and add a piece you love.</p>' +
          '<a class="btn btn--solid" href="#/shop" data-close-sheet>Start shopping</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }

    body.innerHTML = '<ul class="cartlist">' + lines.map(function (l) {
      return (
        '<li class="cartline">' +
          '<img class="cartline__img" src="' + A.product(l, 0) + '" alt="' + esc(l.name) + '" width="200" height="250" loading="lazy">' +
          '<div class="cartline__body">' +
            '<h3 class="cartline__name">' + esc(l.name) + '</h3>' +
            '<p class="cartline__price">' + money(l.price) + ' each</p>' +
            '<div class="qty" role="group" aria-label="Quantity for ' + esc(l.name) + '">' +
              '<button type="button" data-qty="-1" data-id="' + esc(l.id) + '" aria-label="Decrease quantity">' + icon('minus') + '</button>' +
              '<span aria-live="polite">' + l.qty + '</span>' +
              '<button type="button" data-qty="1" data-id="' + esc(l.id) + '" aria-label="Increase quantity">' + icon('plus') + '</button>' +
            '</div>' +
          '</div>' +
          '<div class="cartline__end">' +
            '<p class="cartline__total">' + money(l.lineTotal) + '</p>' +
            '<button type="button" class="linkish linkish--sm" data-remove="' + esc(l.id) + '">Remove</button>' +
          '</div>' +
        '</li>'
      );
    }).join('') + '</ul>';

    foot.innerHTML =
      '<div class="cart__totals"><span>Subtotal</span><strong>' + money(Store.cartSubtotal()) + '</strong></div>' +
      '<p class="cart__note">Shipping and any applicable taxes are calculated at checkout.</p>' +
      '<button type="button" class="btn btn--solid btn--lg btn--block" data-checkout>Proceed to Checkout</button>' +
      '<a class="btn btn--outline btn--block" href="#/shop" data-close-sheet>Continue shopping</a>' +
      '<p class="cart__legal">No payment is processed on this site yet. To complete your order, email us at ' +
        '<a href="mailto:' + esc(D.contact.email) + '">' + esc(D.contact.email) + '</a> or call ' + esc(D.contact.phone) + '.</p>';
  }

  function renderWishlist() {
    const items = Store.wishlistProducts();
    const body = $('[data-wish-body]');
    $('[data-wish-title-count]').textContent = items.length ? '(' + items.length + ')' : '';
    if (!items.length) {
      body.innerHTML =
        '<div class="empty">' +
          '<span class="empty__icon" aria-hidden="true">' + icon('heart') + '</span>' +
          '<h3 class="h3">Nothing saved yet</h3>' +
          '<p class="lede">Tap the heart on any product to keep it here for later.</p>' +
          '<a class="btn btn--solid" href="#/shop" data-close-sheet>Browse products</a>' +
        '</div>';
      return;
    }
    body.innerHTML = '<ul class="cartlist">' + items.map(function (p) {
      return (
        '<li class="cartline">' +
          '<img class="cartline__img" src="' + A.product(p, 0) + '" alt="' + esc(p.name) + '" width="200" height="250" loading="lazy">' +
          '<div class="cartline__body">' +
            '<h3 class="cartline__name">' + esc(p.name) + '</h3>' +
            '<p class="cartline__price">' + money(p.price) + '</p>' +
            '<div class="cartline__actions">' +
              '<button type="button" class="linkish linkish--sm" data-add="' + esc(p.id) + '">Add to cart</button>' +
              '<button type="button" class="linkish linkish--sm" data-wish="' + esc(p.id) + '">Remove</button>' +
            '</div>' +
          '</div>' +
        '</li>'
      );
    }).join('') + '</ul>';
  }

  function syncCounts() {
    const c = Store.cartCount(), w = Store.wishlistCount();
    [['[data-cart-count]', c], ['[data-wish-count]', w]].forEach(function (pair) {
      const el = $(pair[0]);
      el.textContent = pair[1];
      el.hidden = pair[1] === 0;
    });
  }

  Store.subscribe(function (event, payload) {
    syncCounts();
    if (openSheetName === 'cart') renderCart();
    if (openSheetName === 'wishlist') renderWishlist();
    if (event.indexOf('cart') === 0) bump($('[data-open-cart]'));
    if (event === 'wishlist:toggle' && payload && openSheetName !== 'quick') {
      const btn = $('[data-wish="' + payload.id + '"].card__wish');
      if (btn) {
        btn.classList.toggle('is-on', payload.active);
        btn.setAttribute('aria-pressed', payload.active ? 'true' : 'false');
      }
    }
  });

  function bump(el) {
    if (!el) return;
    el.classList.remove('is-bumped');
    void el.offsetWidth;          /* restart the animation */
    el.classList.add('is-bumped');
  }

  /* ---------------- product grid ---------------- */
  function filteredProducts() {
    let list = D.products.slice();
    if (gridState.filter !== 'all') {
      list = list.filter(function (p) { return p.category === gridState.filter; });
    }
    const q = gridState.query.trim().toLowerCase();
    if (q) list = list.filter(function (p) { return p.name.toLowerCase().indexOf(q) > -1; });

    const sorters = {
      'price-asc': function (a, b) { return a.price - b.price; },
      'price-desc': function (a, b) { return b.price - a.price; },
      name: function (a, b) { return a.name.localeCompare(b.name); },
      new: function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0); },
      featured: function () { return 0; }
    };
    return list.sort(sorters[gridState.sort] || sorters.featured);
  }

  function renderGrid(scope) {
    const grid = $('[data-grid="' + scope + '"]', main);
    if (!grid) return;
    const scopeEl = grid.closest('.section') || main;
    const list = filteredProducts();
    const slice = list.slice(0, gridState.shown);
    const more = $('[data-load-more]', scopeEl);
    const count = $('[data-grid-count]', scopeEl);
    const empty = $('[data-empty]', scopeEl);

    grid.innerHTML = slice.map(function (p, i) { return productCard(p, i); }).join('');
    initReveal(grid);

    if (empty) empty.hidden = list.length > 0;
    if (more) more.hidden = list.length <= gridState.shown;
    if (count) {
      count.textContent = list.length
        ? 'Showing ' + slice.length + ' of ' + list.length + ' product' + (list.length > 1 ? 's' : '')
        : '';
    }
  }

  function activeGridScope() {
    const grid = $('[data-grid]', main);
    return grid ? grid.getAttribute('data-grid') : null;
  }

  function resetGrid() {
    gridState.shown = PAGE_SIZE;
    gridState.filter = 'all';
    gridState.sort = 'featured';
    gridState.query = '';
  }

  /* ---------------- delegated interactions ---------------- */
  document.addEventListener('click', function (e) {
    const add = e.target.closest('[data-add]');
    const wish = e.target.closest('[data-wish]');
    const quick = e.target.closest('[data-quick]');
    const more = e.target.closest('[data-load-more]');
    const reset = e.target.closest('[data-reset]');
    const qty = e.target.closest('[data-qty]');
    const rm = e.target.closest('[data-remove]');
    const chip = e.target.closest('[data-filter]');
    const checkout = e.target.closest('[data-checkout]');

    if (add) {
      const id = add.getAttribute('data-add');
      const p = D.products.filter(function (x) { return x.id === id; })[0];
      Store.add(id, 1);
      if (add.classList.contains('btn')) {
        const label = add.querySelector('span') || add;
        const original = label.textContent;
        add.classList.add('is-added');
        label.textContent = 'Added ✓';
        setTimeout(function () { add.classList.remove('is-added'); label.textContent = original; }, 1400);
      }
      toast((p ? p.name : 'Item') + ' added to cart');
      if (openSheetName === 'wishlist') { renderCart(); closeSheet(true); openSheet('cart'); }
      return;
    }
    if (wish) {
      const id = wish.getAttribute('data-wish');
      const on = Store.toggleWish(id);
      if (!wish.classList.contains('card__wish')) {
        wish.textContent = on ? 'Saved to wishlist' : 'Save to wishlist';
      }
      toast(on ? 'Saved to wishlist' : 'Removed from wishlist');
      return;
    }
    if (quick) { e.preventDefault(); openQuickView(quick.getAttribute('data-quick')); return; }
    if (more) { gridState.shown += PAGE_SIZE; renderGrid(activeGridScope()); return; }
    if (reset) {
      resetGrid();
      const s = $('#shop-search'); if (s) s.value = '';
      const so = $('#shop-sort'); if (so) so.value = 'featured';
      $$('[data-filter]').forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-filter') === 'all');
      });
      renderGrid('shop');
      return;
    }
    if (qty) {
      const id = qty.getAttribute('data-id');
      const line = Store.cartLines().filter(function (l) { return l.id === id; })[0];
      if (line) Store.setQty(id, line.qty + parseInt(qty.getAttribute('data-qty'), 10));
      return;
    }
    if (rm) { Store.remove(rm.getAttribute('data-remove')); toast('Removed from cart'); return; }
    if (chip) {
      $$('[data-filter]').forEach(function (b) { b.classList.remove('is-active'); });
      chip.classList.add('is-active');
      gridState.filter = chip.getAttribute('data-filter');
      gridState.shown = PAGE_SIZE;
      renderGrid('shop');
      return;
    }
    if (checkout) {
      toast('Checkout is not connected yet — our team will confirm your order by email or phone.');
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.id === 'global-search') { renderSearchResults(e.target.value); return; }
    if (e.target.id === 'shop-search') {
      gridState.query = e.target.value;
      gridState.shown = PAGE_SIZE;
      renderGrid('shop');
    }
  });

  document.addEventListener('change', function (e) {
    if (e.target.id === 'shop-sort') {
      gridState.sort = e.target.value;
      gridState.shown = PAGE_SIZE;
      renderGrid('shop');
    }
  });

  /* ---------------- forms ---------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  function setError(form, name, message) {
    const slot = form.querySelector('[data-error-for="' + name + '"]');
    const input = form.querySelector('[name="' + name + '"]');
    if (slot) slot.textContent = message || '';
    if (input) {
      input.classList.toggle('is-invalid', !!message);
      input.setAttribute('aria-invalid', message ? 'true' : 'false');
    }
  }

  function setStatus(form, message, kind) {
    const el = form.querySelector('[data-status]');
    if (!el) return;
    el.textContent = message;
    el.className = 'form__status' + (kind ? ' is-' + kind : '');
  }

  const CONTACT_FIELDS = [
    ['firstName', 'Please enter your first name.'],
    ['lastName', 'Please enter your last name.'],
    ['email', 'Please enter a valid email address.'],
    ['phone', 'Please enter a valid phone number.'],
    ['message', 'Please tell us how we can help.']
  ];

  document.addEventListener('submit', function (e) {
    const form = e.target;

    if (form.id === 'contact-form') {
      e.preventDefault();
      let firstBad = null;
      CONTACT_FIELDS.forEach(function (pair) {
        const input = form.querySelector('[name="' + pair[0] + '"]');
        const val = (input.value || '').trim();
        let bad = !val;
        if (!bad && pair[0] === 'email') bad = !EMAIL_RE.test(val);
        if (!bad && pair[0] === 'phone') bad = val.replace(/\D/g, '').length < 7;
        setError(form, pair[0], bad ? pair[1] : '');
        if (bad && !firstBad) firstBad = input;
      });
      if (firstBad) {
        setStatus(form, 'Please check the highlighted fields.', 'error');
        firstBad.focus();
        return;
      }

      const data = {};
      CONTACT_FIELDS.forEach(function (p) {
        data[p[0]] = form.querySelector('[name="' + p[0] + '"]').value.trim();
      });
      const subject = 'Website enquiry — ' + data.firstName + ' ' + data.lastName;
      const bodyText = 'Name: ' + data.firstName + ' ' + data.lastName +
        '\nEmail: ' + data.email + '\nPhone: ' + data.phone + '\n\n' + data.message;

      form.reset();
      CONTACT_FIELDS.forEach(function (p) { setError(form, p[0], ''); });
      setStatus(form, 'Thanks ' + data.firstName + ' — your message is ready to send from your email app.', 'ok');

      const btn = form.querySelector('[type="submit"]');
      if (!$('.form__mail', form)) {
        const link = document.createElement('a');
        link.className = 'btn btn--outline form__mail';
        link.href = 'mailto:' + form.getAttribute('data-mailto') +
          '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(bodyText);
        link.textContent = 'Open in your email app';
        form.insertBefore(link, btn.nextSibling);
      }
      return;
    }

    if (form.id === 'newsletter-form') {
      e.preventDefault();
      const input = form.querySelector('#news-email');
      const consent = form.querySelector('#news-consent');
      const value = (input.value || '').trim();
      if (!EMAIL_RE.test(value)) {
        input.classList.add('is-invalid');
        input.setAttribute('aria-invalid', 'true');
        setStatus(form, 'Please enter a valid email address.', 'error');
        input.focus();
        return;
      }
      if (!consent.checked) {
        setStatus(form, 'Please tick the box to confirm you would like to subscribe.', 'error');
        consent.focus();
        return;
      }
      input.classList.remove('is-invalid');
      input.setAttribute('aria-invalid', 'false');
      input.value = '';
      consent.checked = false;
      setStatus(form, 'Thank you — your subscription preference has been recorded. To be added permanently, email ' +
        D.contact.email + '.', 'ok');
    }
  });

  document.addEventListener('input', function (e) {
    if (e.target.classList && e.target.classList.contains('is-invalid')) {
      e.target.classList.remove('is-invalid');
      e.target.setAttribute('aria-invalid', 'false');
    }
  });

  /* ---------------- router ---------------- */
  function pageTitle(head, sub) {
    const base = 'DENCHI Olshoppe';
    if (head === 'shop') return 'Shop — ' + base;
    if (head === 'benefits') return 'Benefits — ' + base;
    if (head === 'policy') {
      const p = D.policies.filter(function (x) { return x.id === sub; })[0];
      return (p ? p.title : 'Policies') + ' — ' + base;
    }
    return 'DENCHI Olshoppe — Fashion, lifestyle, and indulgence';
  }

  function route() {
    const hash = location.hash || '#/home';
    const parts = hash.replace('#/', '').split('/');
    const head = parts[0];

    let html;
    if (head === 'shop') html = Views.shop();
    else if (head === 'benefits') html = Views.benefits();
    else if (head === 'policy') html = Views.policy(parts[1]);
    else if (head === 'home' || head === '') html = Views.home();
    else html = Views.notFound();

    if (openSheetName) closeSheet(true);
    main.innerHTML = html;

    gridState.shown = PAGE_SIZE;
    const scope = activeGridScope();
    if (scope) renderGrid(scope);

    initReveal(main);
    markActiveNav();
    hdr.classList.toggle('is-light', !!$('.hero'));
    onScroll();
    window.scrollTo(0, 0);
    document.title = pageTitle(head, parts[1]);
  }

  /* ---------------- boot ---------------- */
  function init() {
    buildNav();
    buildFooter();
    syncCounts();
    window.addEventListener('hashchange', route);
    window.addEventListener('scroll', onScroll, { passive: true });
    route();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();