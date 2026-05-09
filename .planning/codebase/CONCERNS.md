# CONCERNS
_Last updated: 2026-05-07_

## Summary

KGC is a static multi-page site with no build pipeline, no module system, and no server. All logic runs in the browser using global functions, `localStorage` as the database, and WhatsApp as the checkout backend. The biggest migration risks are the `localStorage`-only data model, the deeply copied `updateExploreProgress` code block present verbatim in every HTML file, and the extreme CSS specificity layering built up by successive hotfix patches. The contact form and checkout flow are cosmetic-only — no data is ever persisted server-side.

---

## Technical Debt

### `.bak` files reveal a major architectural refactor mid-development

`script.js.bak` is the original file; `script.js` is a trimmed rewrite. Key differences:

- **`script.js.bak`** is 1648 lines and contains the complete admin panel (with SHA-256 login, lead-capture gate, BroadcastChannel sync, and a `loadProductsDynamic` fallback). It also contains `renderStore()` and `renderProduct()` inline.
- **`script.js`** (current) is 185 lines and is a partial rewrite. It references functions like `renderStore`, `renderCartModal`, and `renderProduct` that now live in `products.js`, but the file is truncated — the `createAdminUI()` body contains placeholder comments ("Vou abreviar aqui para focar na integração") and the Admin UI is never actually instantiated from this file. The admin panel from `script.js.bak` was never cleanly ported.

**Impact:** The admin panel accessible via `Ctrl+Shift+A` runs from `script.js.bak` logic that is not present in the current `script.js`. If `script.js.bak` is not loaded, the admin toggle button and panel never appear. The current `script.js` has a stub `createAdminUI()` that does nothing.

**Fix approach:** Determine which file is actually deployed. The `.bak` extension suggests it is not loaded. The admin panel from `script.js.bak` must be ported to `script.js` or `products.js`.

---

### `updateExploreProgress` is copy-pasted into all 8 inner pages verbatim

Every HTML file — `loja.html`, `product.html`, `checkout.html`, `colab.html`, `contato.html`, `media.html`, `projetos.html`, `sobre.html` — contains an identical ~35-line IIFE for the progress bar inside a `<script>` tag at the bottom of `<body>`. This includes the page-list array `['home','loja','projetos',...]`, the `localStorage` read/write, and the overlay logic.

**Impact:** Any bug fix or feature change in progress bar logic requires editing 8+ files. Any divergence in the copied array (e.g. adding a new page ID) breaks progress tracking inconsistently.

**Fix approach:** Extract to a shared `explore.js` module. In Next.js, this becomes a layout-level component.

---

### Global CSS `button { width: 100% }` rule causes cascading overrides

`style.css` line 343 sets `button { width: 100%; }` globally. This causes every button — including cart remove buttons, size selector buttons, admin buttons, and checkout buttons — to fill its container. The file then patches this with increasingly specific overrides: `#size-options .option-btn { width: auto !important; }`, `.kgc-btn-mini { ... }`, `#kgc-admin-sheet button { ... }`.

**Impact:** Any new button requires knowing about this override chain. The `!important` usage is pervasive.

**Fix approach:** In Next.js/Tailwind, remove the global rule and use explicit utility classes. No `!important` should be needed.

---

### Duplicate CSS rule blocks appear three times in `style.css`

The following rule groups are literally repeated in `style.css` at three different points:

- `:root { --pad: ... }` and all associated `#store`, `.menu-grid`, `#product-detail` grid overrides (lines 992–1001 and lines 1038–1048)
- The `#kgc-gate` full-center block (lines 1012–1019 and 1085–1091)
- The brand/logo hard-reset block (lines 974–989 and 1027–1035 and 1099–1107)

These were appended as "V2" and "V3" hotfix blocks. `style.css.bak` ends at a clean state without these duplicates; they were added after.

**Fix approach:** During migration, consolidate to single authoritative rules per component.

---

### `products.js` and `script.js.bak` both define `renderStore()` and `loadProducts()`

`products.js` defines `renderStore()` (async, fetches from localStorage then JSON file). `script.js.bak` also defines a separate `renderStore(items)` (synchronous, takes a pre-loaded array). Both files are loaded by every page. Whichever is parsed last wins, and that is `script.js.bak` — meaning the `products.js` version may be shadowed.

**Impact:** Product rendering behavior is undefined depending on load order and which file is active.

---

### Inline styles are pervasive across all HTML files

`product.html`, `checkout.html`, `colab.html`, `sobre.html` all contain `<style>` blocks inside `<head>`. `loja.html`, `contato.html`, and several others use per-element `style="..."` attributes extensively (e.g. `style="text-align:center; margin-bottom:20px;"` repeated).

**Impact:** Styling is split across `style.css`, per-page `<style>` blocks, and inline attributes. There is no single source of truth.

---

### `script.js` instantiates `AudioContext` at module load time (line 103)

```js
const clickSoundContext = new (window.AudioContext || window.webkitAudioContext)();
```

This runs immediately when `script.js` is parsed, before any user interaction. Modern browsers (Chrome 71+, Safari 12.1+) require AudioContext to be created or resumed after a user gesture.

**Impact:** The AudioContext starts in `suspended` state silently. The retro click sounds may never play without additional `resume()` logic.

---

## Security Concerns

### WhatsApp phone number is hardcoded in `checkout.html`

`checkout.html` line 413:
```js
const phone = "5511945352659";
```

This personal phone number is exposed in the HTML source and will appear in any git repository, CDN cache, or view-source inspection.

**Impact:** Number is publicly visible to anyone who views source. Not a security vulnerability per se, but it should be a server-side environment variable in the Next.js version.

---

### Contact form (`contato.html`) does nothing

```js
onsubmit="event.preventDefault(); alert('Mensagem enviada! Em breve entraremos em contato.'); this.reset();"
```

The form fires `alert()` and resets. No data is sent anywhere. Users believe their message was delivered.

**Impact:** Complete loss of all contact form submissions. This is a broken user-facing feature.

---

### Admin code is hardcoded as a plain string in two separate places

`script.js.bak` defines `const ADMIN_CODE = 'kgcadmin'` at the top of the IIFE (line 254) and again inside the lead-gate IIFE (line 955). The code is also mentioned in an admin UI tooltip: `"Dica: edite o código no script (const ADMIN_CODE)."`.

**Impact:** Anyone who views source sees the admin password. The V3 SHA-256 login added later (`script.js.bak` lines 1434–1590) improves this, but the older plain-text login path still exists and may still be active.

---

### Admin session persisted in `localStorage` with no expiry

`script.js.bak` line 681: `localStorage.setItem('kgc_admin_on', '1')` — this flag grants admin access on any subsequent page load. There is no timeout or token rotation.

**Impact:** Anyone who logs in once on a shared device remains admin indefinitely until `localStorage` is cleared.

---

### `innerHTML` used with product name/description data from `localStorage`

`products.js` line 111–125 uses `container.innerHTML = products.map(p => \`...\${p.name}...\`).join('')`. If an admin saves a product with a name containing `<script>` tags, it will execute when the store renders.

**Impact:** Stored XSS risk via admin panel. Low risk currently (admin access required), but will become a concern if the admin panel ever has remote access.

---

### CEP lookup goes to a third-party API without HTTPS validation

`checkout.html` line 318: `fetch('https://brasilapi.com.br/api/cep/v1/${cep}')` — this is an external API call from client-side code. No error sanitization is applied to the returned `data.street` value before writing it into the input field via `.value = data.street`.

---

## Performance Issues

### `intro.mp3` is referenced but its file size is unknown and autoplay is attempted

Every inner page (`loja.html`, `product.html`, `checkout.html`, `colab.html`, `contato.html`, `media.html`, `projetos.html`, `sobre.html`) includes:
```html
<audio id="bg-music" autoplay loop>
  <source src="intro.mp3" type="audio/mpeg">
</audio>
```

All major browsers block audio autoplay without prior user interaction. The audio will silently fail on every page except after the user has interacted on `index.html`. Despite this, the `<audio>` tag is present and parsed on every page load.

**Fix approach:** In Next.js, manage audio state globally (e.g. via Zustand or Context) so it only plays once after user interaction on the home page.

---

### Lookbook gallery loads 34 thumbnail files on page load

`media.html` hard-codes 34 `<figure>` elements each with a thumbnail `<img>` with `loading="lazy"`. The thumbnails use `thumb_img_*.jpg` naming (lowercase), but the HTML references `thumb_IMG_*.jpg` (uppercase). On case-sensitive filesystems (Linux production servers), these will 404.

Additionally, there are 132 files in `assets/lookbook/` (98 raw PNG originals + 34 thumbnails + 34 JPG originals). The raw PNGs are not referenced anywhere in the code but exist on disk.

---

### Product images stored as base64 Data URLs in `localStorage`

When admin uploads product images, `products.js.bak` converts them to PNG Data URLs and stores them in `localStorage` under `kgc_products_v1`. `localStorage` has a ~5MB limit per origin. Each 1600px PNG Data URL can reach 2.5MB (the code's defined `MAX_DATAURL_LEN`).

**Impact:** With even two or three high-resolution product photos, `localStorage` quota will be exceeded silently. Products may fail to save without user-visible error. This is the primary scaling limit of the current system.

**Fix approach:** In Next.js, product images must be uploaded to a proper storage service (e.g. Supabase Storage, Cloudinary, or S3). Product data should be stored in a database, not localStorage.

---

### Font Awesome loaded from CDN on every page

All 9 pages load:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

This is ~400KB of CSS for icons of which only 6 are used: `fa-store`, `fa-project-diagram`, `fa-users`, `fa-info-circle`, `fa-phone`, `fa-film`, `fa-shopping-cart`.

**Fix approach:** In Next.js, use `react-icons` and import only the specific icons used.

---

### Google Fonts loaded with two separate `@import` calls

`style.css` lines 1–3 import `Oswald` and `Press Start 2P` in two separate requests. These are render-blocking.

---

### `logo.gif` is an animated GIF used as favicon and brand mark

An animated GIF as favicon can cause CPU spikes in some browsers. No WebP or static fallback is offered.

---

## Accessibility Issues

### Menu tiles use `onclick="location.href='...'"` instead of `<a>` tags

`index.html` lines 31–55: all 6 menu tiles are `<div class="menu-tile" onclick="location.href='loja.html'">`. These are not keyboard-navigable, not screen-reader accessible, and have no `role` or `tabindex`.

**Impact:** The entire main navigation is inaccessible to keyboard users and screen readers.

---

### No `role`, `aria-label`, or `tabindex` on interactive `<div>` elements

The cart icon (`<div id="cart-icon" onclick="toggleCart()">`) is a `<div>`, not a `<button>`. Same pattern for carousel navigation arrows (`.prev`, `.next` are `<a>` tags with no `href`, using only `onclick`).

---

### Lookbook image alt text is non-descriptive

All 34 lookbook images use generic alt text: `alt="Lookbook KGC 01"` through `alt="Lookbook KGC 34"`. These provide no meaningful description for screen reader users.

---

### No `<label>` elements on most form fields

`contato.html` form inputs (`nome`, `email`, `mensagem`) have `placeholder` text but no `<label>` elements. `checkout.html` uses `.label-retro` class on `<label>` tags only for section headings, not individual fields (e.g. the `nome`, `telefone`, `email`, `cep` fields have no linked `<label>`).

---

### Color contrast on inactive elements likely fails WCAG AA

Menu tile text and icons on the `#fafafa` background (light beige monitor) with dark colors are likely fine. However, the `.hint` class (`color: #bdbdbd`) on `#0d0d0d` background (checkout/gate card) may fall below 4.5:1 ratio.

---

### No `lang` on inner pages (only on `<html>`)

All pages correctly set `lang="pt-BR"` on `<html>`, which is correct.

---

## SEO Issues

### No `<meta name="description">` on any page

All 9 HTML files include only `<title>` and `<meta charset>` and `<meta name="viewport">`. There are no description, keywords, Open Graph, or Twitter Card meta tags anywhere.

**Impact:** Poor social sharing previews, no search engine snippet text.

---

### Product pages have no unique, crawlable URLs

`product.html?slug=kgc-camo-off-white` is a single HTML file that renders content via JavaScript after page load. Search engines may not index dynamically-rendered content. There is no static HTML for any individual product.

**Fix approach:** In Next.js, use `getStaticPaths` + `getStaticProps` with `pages/product/[slug].tsx` to generate static HTML per product.

---

### `projetos.html` is a placeholder with no real content

The entire page body is:
```html
<p style="text-align:center; max-width:600px; margin:20px auto;">
  Em breve você encontrará aqui projetos, coleções e colaborações especiais da marca KGC. Fique ligado para novidades!
</p>
```

This is thin content that provides no SEO value and counts as a visited page in the explore bar.

---

### `colab.html` has one external link and no content

The entire content is: "Projetos secretos e parcerias exclusivas." and one link to `brechodocorre.com`. This page offers no meaningful content and will not rank for any query.

---

### Footer "Termos" and "Privacidade" links go to `href="#"` (dead links)

`index.html` line 57:
```html
<a href="#">Termos</a> | <a href="#">Privacidade</a>
```

These are non-functional. If the site processes any personal data (checkout, lead capture), having no privacy policy is a LGPD compliance gap.

---

### `<title>` tags are generic

- `index.html`: "KGC - Home"
- `loja.html`: "Loja - KGC"
- `product.html`: "Detalhes do Produto - KGC" (static, not updated per product)

The product page title never reflects the actual product name because it is set via JavaScript after load, not in the initial HTML.

---

## Browser Compatibility

### `webkitAudioContext` vendor prefix suggests legacy fallback is needed

`script.js` line 103 and `script.js.bak` line 891:
```js
new (window.AudioContext || window.webkitAudioContext)()
```

`webkitAudioContext` was removed from WebKit in 2023. The fallback is now dead code, but the pattern is harmless.

---

### `BroadcastChannel` lacks a fallback in `script.js`

```js
const chan = ('BroadcastChannel' in window) ? new BroadcastChannel(BC_NAME) : null;
```

Safari added `BroadcastChannel` in Safari 15.4. Older Safari will use `null` and cross-tab admin updates will not propagate. Given the target audience is mobile-heavy, this is a real gap.

---

### `createImageBitmap` used for admin image uploads

`script.js.bak` uses `createImageBitmap(file)` to process uploaded images. This is not supported in Safari before version 15. Admin image uploads would silently fail on older Safari.

---

### `100dvh` unit used in style.css

`style.css` line 1010: `.min-100 { min-height: 100dvh; }` — `dvh` is a modern unit not supported in Safari before 16 or Chrome before 108. The fallback `min-height: calc(var(--vh, 1vh) * 100)` is present, but only as a secondary value which is parsed first in some engines.

---

## Migration Risks (to Next.js + TypeScript)

### The entire data model is `localStorage`-only

Product data, cart, admin session, visited pages, explore progress, lead data, and admin credentials all live in `localStorage`. In Next.js with SSR, `localStorage` is not available during server rendering.

**What needs to change:**
- Products: move to a database (Supabase, PlanetScale, etc.) or static JSON served from the file system, fetched via `getStaticProps`
- Cart: move to React state + `localStorage` hydration on client, or a server session
- Admin: replace with a proper auth provider (NextAuth.js, Clerk, etc.)
- Explore progress: simple `localStorage` usage, but must be hydrated client-side

---

### Product routing is `?slug=` query string, not path-based

Current URL: `product.html?slug=kgc-camo-off-white`

In Next.js, this maps to `pages/product/[slug].tsx` or `app/product/[slug]/page.tsx`. The old `?slug=` pattern must be redirected.

**What needs to change:** Next.js dynamic routing replaces query-string routing. All internal links to `product.html?slug=X` must be updated to `/product/X`.

---

### The checkout "backend" is a WhatsApp redirect

`checkout.html` constructs a `wa.me/` URL with encoded order details and redirects the browser. There is no order database, no payment processing, no inventory check, and no email confirmation.

**What needs to change:** In Next.js, the checkout form data should POST to an API route (`/api/checkout`) which can send a WhatsApp message via the WhatsApp Business API, send a confirmation email, and optionally write to a database. The phone number must move to a server-side environment variable.

---

### DOM manipulation style is fully imperative, no component model

All UI is built by setting `innerHTML` on container elements:
- `renderStore()` sets `container.innerHTML = products.map(...).join('')`
- `renderCartModal()` sets `listEl.innerHTML = ''` then appends `li` elements
- `createRetroPopup()` uses `document.body.insertAdjacentHTML('beforeend', ...)`
- The admin panel is built entirely by creating DOM elements in JS

**What needs to change:** Each of these must be converted to React components. Shared state (cart, products) should use React Context or Zustand, not module-level variables.

---

### Module-level mutable state (`slideIndex`, `currentProduct`, `selectedColor`, `selectedSize`)

`products.js` lines 131–134:
```js
let slideIndex = 1;
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
```

These are global mutable variables that track product page state. In React, these become `useState` hooks in a `ProductPage` component.

---

### CSS is tightly coupled to specific HTML structure and class names

- The rule `body.page > h2` targets children of `body` directly — this will break in Next.js where `body` is managed by the framework and pages are rendered inside a layout wrapper
- The rule `body.page > p a[target="_blank"]` in `colab.html`'s inline style targets paragraph-child anchors, not a component class
- The `#retro-monitor` layout assumes `body` is a full-viewport flex container

**What needs to change:** All CSS must be rewritten using Tailwind, CSS Modules, or styled-components. No rules targeting `body > *` or relying on the body being a flex container can survive intact.

---

### `onclick` attributes on HTML elements require global function scope

Multiple elements use `onclick="funcName()"` as HTML attributes:
- `onclick="toggleCart()"` (all pages)
- `onclick="goToCheckout()"` (all pages)
- `onclick="location.href='loja.html'"` (menu tiles)
- `onclick="plusSlides(-1)"` / `onclick="plusSlides(1)"` (carousel)
- `onclick="removeFromCart(${index})"` (cart items, inside innerHTML)
- `onclick="selectColor(this, '${color}')"` (inside innerHTML string)

In React, event handlers are passed as props. The pattern of generating HTML strings with inline event attributes breaks in JSX. The `removeFromCart(index)` and `selectColor(this, value)` patterns inside `innerHTML` are particularly problematic.

---

### `intro.mp3` audio state must be managed across route transitions

In a multi-page static site, audio is loaded fresh on every page navigation. In Next.js (SPA routing), the audio must persist across client-side navigations. This requires a persistent audio component in the root layout that does not unmount on route change.

---

### Assets need path normalization

- `assets/lookbook/thumb_IMG_7713.jpg` in HTML (uppercase `IMG`) vs actual files `thumb_img_7713.jpg` (lowercase) — will 404 on Linux hosting
- `products/products.json` is fetched via relative URL — in Next.js, static assets serve from `public/` and the fetch must be updated to `/products/products.json` or replaced with a database call
- `assets/placeholder.png` is referenced in code but does not exist in `assets/` directory

---

## Missing / Incomplete Features

### No payment integration

The checkout collects payment method (PIX, credit card, boleto) but does nothing with the selection. All three options result in the same WhatsApp redirect. There is no PIX key display, no credit card form, no boleto generation.

---

### No order confirmation or email receipt

After the WhatsApp redirect, the user's cart is not cleared. There is no confirmation page, no order ID tracking, and no email sent to the customer.

---

### The cart does not clear after checkout

After `finalizePurchase()` calls `window.location.href = 'https://wa.me/...'`, the `localStorage` cart remains intact. Re-opening the cart after checkout shows the same items.

---

### `projetos.html` and `colab.html` are stub pages

Both pages contain placeholder content with no real information. They count toward the explore-bar 100% total, which means users who complete the bar may have only seen placeholder content.

---

### Product images in `products.json` have no `images` field

The `products/products.json` file defines 6 products with `slug`, `name`, `description`, `price`, `original_price`, `colors`, and `sizes` — but no `images` field. The `loadProducts()` fallback in `products.js` handles this:

```js
else img = `products/${p.slug}/${p.slug}_1.png`;
```

This means products loaded from JSON rely on file-system image naming convention, not explicit image references. Adding or renaming images requires matching both the directory name and file naming pattern.

---

## Data Concerns

### `products.json` schema is inconsistent with `localStorage` schema

`products.json` stores `colors` and `sizes` as comma-separated strings:
```json
"colors": "Off-White",
"sizes": "PP,P,M,G,GG"
```

The admin panel saves products to `localStorage` with `colors` and `sizes` as arrays:
```js
colors: ['Off-White'],
sizes: ['PP', 'P', 'M', 'G', 'GG']
```

`products.js` handles both via:
```js
let colorsList = Array.isArray(p.colors) ? p.colors : (p.colors ? p.colors.split(',') : []);
```

**Impact:** The JSON file format is not a valid representation of what the admin saves. Exporting from admin and using it as a drop-in replacement for `products.json` would break parsing unless the split/array check is also preserved.

**Fix approach:** In Next.js, normalize the schema. Use arrays everywhere. Update `products.json` to match.

---

### No product `id` field in `products.json`

Products in `products.json` have no `id` field — only `slug`. The admin panel assigns UUID-based IDs. If products are ever migrated from JSON to admin-managed localStorage, the ID field mismatch means edit/delete operations will fail (they look up by `id`).

---

### `localStorage` cart uses an `id` field composed of `slug-size-color`

Cart items are keyed by:
```js
id: `${currentProduct.slug}-${selectedSize}-${selectedColor}`
```

This means two products with the same slug, size, and color cannot coexist in the cart — the quantity is incremented instead. This is correct behavior, but the composite key approach is fragile: renaming a product slug after a user has items in their cart orphans those items permanently.

---

### No inventory or stock tracking

Products have no `stock` or `quantity` field. The checkout can accept any quantity without checking availability. Orders may be placed for out-of-stock items with no feedback.

---

### Lead capture data (`kgc_leads_v1`) is stored only in the user's browser

The lead-capture gate in `script.js.bak` saves lead data (name, email, phone, UTM params) to `localStorage` on the visitor's device. The admin exports this as CSV via `Ctrl+Shift+E`. If the visitor clears their localStorage, all their lead data is permanently lost. There is no server-side persistence.

**Impact:** Lead data is unreliable and ephemeral. This feature provides no real marketing value as implemented.
