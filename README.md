# DENCHI Olshoppe

A rebuilt, redesigned Denchi Olshoppe storefront — fashion, lifestyle and
indulgence. Content, products, prices and contact details are taken from the
existing Denchi Olshoppe site; the interface, layout and interactions are new.

## Run it

No build step and no dependencies. Either:

* open `index.html` directly in a browser, or
* serve the folder (`npx serve .` / `python -m http.server`) if you prefer
  clean URLs for the font requests.

Run the headless checks with:

```
node test.js
```

## Structure

```
index.html            markup shell: header, overlays, main, footer
assets/css/
  tokens.css          colour, type, spacing, motion, surface tokens
  base.css            reset, typography, layout primitives, reveal motion
  components.css      header, buttons, cards, sheets, cart, forms, footer
  views.css           hero, editorial, feature, contact, policy layouts
  responsive.css      desktop → laptop → tablet → mobile
assets/js/
  data.js             all site content (single source of truth)
  art.js              deterministic SVG artwork generator
  store.js            cart + wishlist state, localStorage, pub/sub
  ui.js               helpers, icons, product card component
  views.js            page templates (home / shop / benefits / policy)
  app.js              router, header, grid, overlays, forms, toasts
test.js               headless smoke tests (node test.js)
```

## Routes

`#/home` · `#/shop` · `#/benefits` · `#/policy/faq` · `#/policy/privacy` ·
`#/policy/shipping` · `#/policy/refund` · `#/policy/terms` ·
`#/policy/accessibility`

## Notes

* **Imagery** — the project ships no photography, so all visuals are generated
  as small deterministic SVG data-URIs (no network requests, no broken images).
  Replace any `<img>` with a real photograph when assets are available.
* **Checkout** — no payment backend is connected. The cart is fully functional
  and the checkout button states this honestly, pointing to Customer Care.
* **Forms** — the contact form validates, then hands the message to the
  visitor's email client via `mailto:`. The newsletter validates and confirms
  the preference locally; it does not pretend to reach a mailing list.
* **Policies** — only FAQ has published content. The other policy pages are
  honest placeholders that route visitors to Customer Care rather than
  inventing legal or commercial terms.
