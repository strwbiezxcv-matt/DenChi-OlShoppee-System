/* Headless smoke test: loads the data layer, artwork, store,
   UI helpers and view templates in Node and renders every
   route, checking for runtime errors and broken markup. */
const fs = require('fs');
const vm = require('vm');

const files = ['data.js', 'art.js', 'store.js', 'ui.js', 'views.js'];
const sandbox = {
  console,
  localStorage: {
    _d: {},
    getItem(k) { return this._d[k] || null; },
    setItem(k, v) { this._d[k] = String(v); }
  },
  Intl,
  requestAnimationFrame: (fn) => fn()
};
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
vm.createContext(sandbox);

files.forEach((f) => {
  vm.runInContext(fs.readFileSync('assets/js/' + f, 'utf8'), sandbox, { filename: f });
});

const D = sandbox.DENCHI;
let fail = 0;
function check(label, cond, extra) {
  if (!cond) { fail++; console.log('  FAIL  ' + label + (extra ? ' :: ' + extra : '')); }
  else console.log('  ok    ' + label);
}

/* ---- content integrity (must match the source site) ---- */
console.log('\n[content]');
check('6 products', D.products.length === 6);
check('sale prices correct',
  D.products[0].price === 170.1 && D.products[0].compareAt === 189 &&
  D.products[1].price === 151.2 && D.products[1].compareAt === 189);
check('full prices intact',
  D.products[2].price === 189 && D.products[3].price === 239 &&
  D.products[4].price === 239 && D.products[5].price === 189);
check('3 categories', D.categories.length === 3);
check('6 policy links', D.policies.length === 6);
check('contact details preserved',
  D.contact.email === 'denchi.olshoppe@gmail.com' &&
  D.contact.phone === '0969 - 275 - 9695' &&
  D.contact.addressLines[0] === '0590 Palayan Street');

/* ---- artwork ---- */
console.log('\n[artwork]');
const art = sandbox.DenchiArt.product(D.products[0], 0);
check('product svg data-uri', art.startsWith('data:image/svg+xml'), art.slice(0, 40));
check('product art is deterministic', art === sandbox.DenchiArt.product(D.products[0], 0));
check('product art varies per item', art !== sandbox.DenchiArt.product(D.products[1], 0));
check('scene data-uri', sandbox.DenchiArt.scene('foods', {}).startsWith('data:image/svg+xml'));

/* ---- store ---- */
console.log('\n[store]');
const S = sandbox.DenchiStore;
S.add('p1', 1);
S.add('p1', 2);
S.add('p3', 1);
check('cart count = 4', S.cartCount() === 4, String(S.cartCount()));
check('subtotal correct', Math.abs(S.cartSubtotal() - (170.1 * 3 + 189)) < 0.001, String(S.cartSubtotal()));
S.setQty('p1', 1);
check('setQty works', S.cartCount() === 2);
S.remove('p3');
check('remove works', S.cartCount() === 1);
check('wishlist toggles', S.toggleWish('p2') === true && S.inWishlist('p2') && S.wishlistCount() === 1);
check('persisted to storage', !!sandbox.localStorage.getItem('denchi.state.v1'));

/* ---- views render for every route ---- */
console.log('\n[views]');
const V = sandbox.DenchiViews;
const routes = {
  home: V.home(),
  shop: V.shop(),
  benefits: V.benefits(),
  'policy/faq': V.policy('faq'),
  'policy/privacy': V.policy('privacy'),
  'policy/terms': V.policy('terms'),
  'policy/accessibility': V.policy('accessibility'),
  'policy/shipping': V.policy('shipping'),
  'policy/refund': V.policy('refund'),
  'bad route': V.notFound()
};

Object.keys(routes).forEach((name) => {
  const html = routes[name];
  const open = (html.match(/<(div|section|article|ul|form|nav|main|header|footer)\b/g) || []).length;
  const close = (html.match(/<\/(div|section|article|ul|form|nav|main|header|footer)>/g) || []).length;
  check(name + ' renders (' + html.length + ' chars)', html.length > 300);
  check(name + ' tags balanced', open === close, open + ' open / ' + close + ' close');
  check(name + ' no undefined in output', html.indexOf('undefined') === -1);
  check(name + ' no [object Object]', html.indexOf('[object Object]') === -1);
});

/* ---- required content present on home ---- */
const home = routes.home;
console.log('\n[home content]');
check('hero headline', home.indexOf('New Drops.') > -1 && home.indexOf('Better Fits.') > -1);
check('CTA Shop Now', home.indexOf('>Shop Now<') > -1);
check('CTA Explore Collection', home.indexOf('>Explore Collection<') > -1);
check('Why Choose section', home.indexOf('Why Choose Denchi Olshoppe?') > -1);
check('New Arrival grid', home.indexOf('data-grid="arrivals"') > -1);
check('Load More control', home.indexOf('data-load-more') > -1);
check('Editorial heading', home.indexOf('Elevate Your Style and Indulge Your Taste') > -1);
check('Tiramisu feature', home.indexOf('Best Tiramisu In Town') > -1);
check('Newest product', home.indexOf('Explore the Newest Product on our store') > -1);
check('Contact section', home.indexOf('Contact Our Customer Care') > -1);
check('Newsletter', home.indexOf('Subscribe to our newsletter') > -1);
check('Contact form fields',
  ['f-firstName', 'f-lastName', 'f-email', 'f-phone', 'f-message'].every((id) => home.indexOf(id) > -1));

/* ---- product card markup ---- */
console.log('\n[card]');
const card = sandbox.DenchiUI.productCard(D.products[0], 0);
check('card has alt text', card.indexOf('alt="' + D.products[0].name + '"') > -1);
check('card shows sale price', card.indexOf('₱170.10') > -1);
check('card shows original price', card.indexOf('<s>₱189.00</s>') > -1);
check('card has add to cart', card.indexOf('data-add="p1"') > -1);
check('card has wishlist', card.indexOf('data-wish="p1"') > -1);
check('card has quick view', card.indexOf('data-quick="p1"') > -1);
check('card has Hot badge', card.indexOf('badge--hot') > -1);
check('card has discount badge', card.indexOf('-10%') > -1, 'expected -10%');

/* ---- every visible button / link is wired ---- */
console.log('\n[dead buttons & links]');
const all = Object.keys(routes).map((k) => routes[k]).join('\n');
const buttons = all.match(/<button[^>]*>/g) || [];
const unhooked = buttons.filter((b) =>
  !/data-(add|wish|quick|load-more|reset|checkout|open-|close-sheet|filter|qty|remove)/.test(b) && !/type="submit"/.test(b));
check('all buttons wired (' + buttons.length + ')', unhooked.length === 0, unhooked.join(' | '));

const anchors = all.match(/<a [^>]*>/g) || [];
const deadLinks = anchors.filter((a) => !/href="#\/|href="mailto:|href="tel:/.test(a));
check('all links resolve (' + anchors.length + ')', deadLinks.length === 0, deadLinks.join(' | '));

console.log('\n' + (fail ? fail + ' CHECK(S) FAILED' : 'ALL CHECKS PASSED'));
process.exit(fail ? 1 : 0);

