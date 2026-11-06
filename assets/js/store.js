/* =========================================================
   DENCHI OLSHOPPE — Client state
   Cart + wishlist are held in memory and mirrored to
   localStorage so they survive a refresh. There is no
   payment backend: checkout is surfaced honestly in the UI.
   ========================================================= */
window.DenchiStore = (function () {
  'use strict';

  const KEY = 'denchi.state.v1';
  const listeners = [];

  let state = { cart: [], wishlist: [], lastAdded: null };

  function read() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (Array.isArray(saved.cart)) state.cart = saved.cart.filter(validLine);
      if (Array.isArray(saved.wishlist)) state.wishlist = saved.wishlist;
    } catch (e) {
      /* storage unavailable (private mode) — run in memory only */
    }
  }

  function validLine(line) {
    return line && typeof line.id === 'string' && Number(line.qty) > 0;
  }

  function write() {
    try {
      localStorage.setItem(KEY, JSON.stringify({
        cart: state.cart,
        wishlist: state.wishlist
      }));
    } catch (e) { /* ignore quota / privacy errors */ }
  }

  function emit(event, payload) {
    listeners.forEach(function (fn) { fn(event, payload); });
  }

  function commit(event, payload) {
    write();
    emit(event, payload);
  }

  function find(id) {
    return window.DENCHI.products.filter(function (p) { return p.id === id; })[0] || null;
  }

  const api = {
    subscribe: function (fn) {
      listeners.push(fn);
      return function () {
        const i = listeners.indexOf(fn);
        if (i > -1) listeners.splice(i, 1);
      };
    },

    /* ---- cart ---- */
    cartCount: function () {
      return state.cart.reduce(function (n, l) { return n + l.qty; }, 0);
    },
    cartLines: function () {
      return state.cart.filter(function (l) { return !!find(l.id); }).map(function (l) {
        const p = find(l.id);
        return Object.assign({}, p, { qty: l.qty, lineTotal: l.qty * p.price });
      });
    },
    cartSubtotal: function () {
      return state.cart.reduce(function (n, l) {
        const p = find(l.id);
        return n + (p ? p.price * l.qty : 0);
      }, 0);
    },
    inCart: function (id) {
      return state.cart.some(function (l) { return l.id === id; });
    },

    add: function (id, qty) {
      const product = find(id);
      if (!product) return false;
      const amount = Math.max(1, parseInt(qty, 10) || 1);
      const line = state.cart.filter(function (l) { return l.id === id; })[0];
      if (line) line.qty += amount;
      else state.cart.push({ id: id, qty: amount });
      state.lastAdded = id;
      commit('cart:add', { id: id, qty: amount });
      return true;
    },
    setQty: function (id, qty) {
      const next = Math.max(0, parseInt(qty, 10) || 0);
      state.cart = state.cart
        .map(function (l) { return l.id === id ? { id: l.id, qty: next } : l; })
        .filter(function (l) { return l.qty > 0; });
      commit('cart:update', { id: id });
    },
    remove: function (id) {
      state.cart = state.cart.filter(function (l) { return l.id !== id; });
      commit('cart:remove', { id: id });
    },
    clearCart: function () {
      state.cart = [];
      commit('cart:clear', {});
    },

    /* ---- wishlist ---- */
    inWishlist: function (id) {
      return state.wishlist.indexOf(id) > -1;
    },
    toggleWish: function (id) {
      const i = state.wishlist.indexOf(id);
      if (i > -1) state.wishlist.splice(i, 1);
      else state.wishlist.push(id);
      commit('wishlist:toggle', { id: id, active: i === -1 });
      return i === -1;
    },
    wishlistCount: function () {
      return state.wishlist.length;
    },
    wishlistProducts: function () {
      return state.wishlist.map(find).filter(Boolean);
    },

    lastAdded: function () { return state.lastAdded; }
  };

  read();
  return api;
})();
