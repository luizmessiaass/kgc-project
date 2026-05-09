# Architecture
_Last updated: 2026-05-07_

## Summary

KGC is a vanilla HTML/CSS/JS multi-page application (MPA) with no build step and no framework. Nine separate `.html` files serve as pages, linked via direct `<a href>` navigation and `window.location.href` assignments. All logic lives in two globally-loaded scripts — `script.js` and `products.js` — with state persisted exclusively in `localStorage`.

---

## Overall Pattern

**Type:** Static Multi-Page Application (MPA)
**Hosting model:** Any static file server (no backend, no SSR, no API)
**Build tooling:** None — files are served as-is
**Language:** Vanilla JavaScript (ES2020+, `async/await`, `BroadcastChannel`)

There is no router, no module bundler, no component system, and no framework. Each HTML file is a complete, standalone page that manually loads the same two scripts.

---

## Page Inventory

| File | Route (current) | Body class | Purpose |
|------|-----------------|------------|---------|
| `index.html` | `/` | `home` | Entry splash screen + main menu |
| `loja.html` | `/loja.html` | `page` | Product store grid |
| `product.html` | `/product.html?slug=<slug>` | `page` | Single product detail + add-to-cart |
| `checkout.html` | `/checkout.html` | `page` | Order form + WhatsApp dispatch |
| `colab.html` | `/colab.html` | `page` | Collabs/partnerships info |
| `contato.html` | `/contato.html` | `page` | Contact info + stub form |
| `media.html` | `/media.html` | `page` | Lookbook gallery + YouTube embed |
| `projetos.html` | `/projetos.html` | `page` | Projects placeholder |
| `sobre.html` | `/sobre.html` | `page` | Brand story |

---

## Page Routing and Navigation Model

Navigation is purely file-based — no client-side router exists.

**Entry flow:**
1. User lands on `index.html` (splash screen with `#start-screen`)
2. Clicks "Entrar na cena" → `customEnter()` triggers 2-second init overlay, then `enterScene()`
3. `enterScene()` hides `#start-screen`, reveals `#main-menu`
4. Menu tiles navigate via `onclick="location.href='<page>.html'"`

**Hash-based shortcut:** `index.html#menu` calls `enterScene()` directly on load — used by "Voltar ao Menu" back-links across all pages.

**Product routing:** Products use query-string routing. `loja.html` renders cards with `href="product.html?slug=<slug>"`. `product.html` reads `URLSearchParams` for `?slug=` and fetches the matching product.

**Back navigation pattern:** All pages except `index.html` have:
```html
<a href="index.html#menu" class="link-voltar">← Voltar ao Menu</a>
```
`loja.html` and `checkout.html` also link between each other directly.

---

## Script Loading Model

Every HTML page loads exactly these two scripts in this order, before the closing `</body>` tag:

```html
<script src="products.js"></script>
<script src="script.js"></script>
```

Both scripts expose functions globally (on `window`). There are no ES modules, no `import`/`export`, no bundling. Functions defined in `products.js` are called by inline `<script>` blocks within each HTML page.

**Global functions exposed by `products.js`:**
- `loadProducts()` — async, reads localStorage first, falls back to `products/products.json`
- `renderStore()` — populates `#store` grid on `loja.html`
- `renderProduct()` — populates `#product-detail` on `product.html`
- `updateCartCount()` — updates all `.cart-count` badge elements
- `renderCartModal()` — populates the cart overlay `<ul>`
- `removeFromCart(index)` — removes item from localStorage cart
- `selectColor(btn, value)` / `selectSize(btn, value)` — option button handlers
- `openZoom(src)` / `plusSlides(n)` — carousel and zoom handlers

**Global functions exposed by `script.js`:**
- `enterScene()` — transitions home from splash to menu
- `toggleCart()` — shows/hides cart overlay
- `goToCheckout()` — navigates to `checkout.html`
- `playClickSound()` — Web Audio API click sound
- `exportProducts()` — admin: downloads JSON blob

**Inline scripts in each HTML page:**
- `updateExploreProgress(pageId)` — site exploration tracker; duplicated verbatim in every page
- Page-specific init logic in `DOMContentLoaded` (e.g., `renderStore()`, `renderProduct()`, `renderCheckoutSummary()`, `setupMasks()`)

---

## Data Flow

### Product Data

```
products/products.json  (canonical source, 6 products)
        │
        ▼
loadProducts()  (products.js)
  1. Check localStorage key 'kgc_products_v1'
     └─ if present and items.length > 0 → use that (admin edits)
     └─ if absent → fetch('products/products.json')
  2. Filter: active !== false
        │
        ▼
renderStore()          → builds product-card HTML → injects into #store
renderProduct(?slug)   → finds product by slug → populates #product-detail
```

### Cart Flow

```
product.html (handleAddToCart)
  └─ writes to localStorage key 'cart'
       │
       ├─ updateCartCount() → updates .cart-count badges everywhere
       ├─ renderCartModal() → fills #cart-items <ul>
       └─ checkout.html (renderCheckoutSummary) → reads localStorage 'cart'
                  │
                  └─ finalizePurchase() → builds WhatsApp URL
                       └─ window.location.href = 'https://wa.me/<phone>?text=...'
```

Cart items stored as JSON array in `localStorage['cart']`:
```json
{
  "id": "<slug>-<size>-<color>",
  "name": "string",
  "price": 149.99,
  "slug": "kgc-camo-off-white",
  "image": "products/<slug>/<slug>_1.png",
  "color": "string",
  "size": "string",
  "quantity": 1
}
```

### Address Lookup (checkout.html only)

CEP input blur → `fetch('https://brasilapi.com.br/api/cep/v1/<cep>')` → autofills address fields.

---

## State Management

**No framework-level state.** All state is stored in `localStorage`:

| Key | Type | Set by | Read by |
|-----|------|--------|---------|
| `cart` | `JSON array` | `products.js handleAddToCart`, `removeFromCart` | `products.js`, `checkout.html` |
| `kgc_products_v1` | `JSON object {items:[]}` | Admin panel in `script.js` | `products.js loadProducts()` |
| `visitedPages` | `JSON array of strings` | `updateExploreProgress()` (inline, every page) | `updateExploreProgress()` |
| `kgc_explore_complete` | `"true"` | `updateExploreProgress()` | `updateExploreProgress()` |

Page-level transient state (module-scope variables in `products.js`):
- `currentProduct` — the loaded product object on `product.html`
- `selectedColor` / `selectedSize` — user selections
- `slideIndex` — current carousel position

These are reset on every page load (no persistence across navigation).

---

## Admin Panel

An embedded admin UI lives inside `script.js`. It is activated by a password code (`ADMIN_CODE = 'kgcadmin'`). The panel:
- Reads/writes product data to `localStorage['kgc_products_v1']`
- Triggers `location.reload()` after saves to refresh `loja.html` or `product.html`
- Has an `exportProducts()` function that downloads current state as `kgc-products.json`
- Uses `BroadcastChannel` ('kgc-products-chan') to sync across tabs (if supported)
- Is hidden by default in CSS via `#admin, .admin { display: none !important; }` unless `body.is-admin`

**Note:** The admin panel code in the committed `script.js` is partially stubbed — the `createAdminUI()` function body is referenced in comments but not fully present in the file. The full admin UI code is implied to exist in a previous version.

---

## CSS Architecture

A single file, `style.css`, styles all pages globally. There are no CSS modules, no Sass, no utility classes beyond inline styles.

**Body class strategy:**
- `body.home` — index.html layout (centered, fullscreen)
- `body.page` — all other pages (block layout, left-aligned, padded)

**Approach:** Monolithic stylesheet organized by component sections. Sections include: retro monitor, menu grid, store grid, cart modal, product detail, admin panel, explore bar, lightbox, media gallery, carousel, and various overlays.

Page-specific overrides are applied either via inline `<style>` blocks within individual HTML files (`checkout.html`, `colab.html`, `media.html`, `sobre.html`) or by scoping rules with unique IDs.

**External dependencies loaded via CDN:**
- Google Fonts: `Press Start 2P` (pixel/retro), `Oswald` (display)
- Font Awesome 6.4.0 (icon library)

---

## External Integrations

| Service | Used in | Purpose |
|---------|---------|---------|
| WhatsApp `wa.me` API | `checkout.html` | Order submission — redirects to WhatsApp with pre-filled message |
| BrasilAPI CEP endpoint | `checkout.html` | Address autofill from CEP |
| YouTube embed | `media.html` | Lookbook video |
| Google Fonts CDN | All pages via `style.css` | Typography |
| Font Awesome CDN | All pages | Icons |

---

## What Must Change for Next.js Migration

### Routing
- **Current:** File-based `.html` files with `?slug=` query strings
- **Next.js:** File-based routing in `app/` or `pages/`. Products become `app/loja/[slug]/page.tsx`. The `?slug=` pattern becomes a dynamic segment.
- `index.html#menu` hash navigation becomes internal client-side routing via `<Link>` or `router.push()`

### Script Loading
- **Current:** Two globally-loaded scripts with `window.*` functions
- **Next.js:** Each "global" function becomes a proper module export. `products.js` and `script.js` are split into importable modules/hooks.

### Data Loading
- **Current:** `fetch('products/products.json')` at runtime from a relative path
- **Next.js:** Products can be loaded at build time via `generateStaticParams` + `fs.readFileSync`, enabling static generation. Dynamic admin edits (via localStorage) remain client-side or migrate to a proper CMS/API.

### Product Catalog
- **Current:** `products/products.json` is a flat array; images live in `products/<slug>/<slug>_N.png`
- **Next.js:** The JSON schema maps directly to a TypeScript interface. Images move to `public/products/<slug>/` and reference via Next.js `<Image>` component.

### State / Cart
- **Current:** `localStorage` with direct `JSON.parse`/`JSON.stringify`
- **Next.js:** Wrap in a React context or Zustand store with localStorage persistence. `useCart()` hook replaces all direct localStorage access.

### Admin Panel
- **Current:** Client-side only, password-protected JS panel writing to localStorage
- **Next.js:** Should become a proper `/admin` route with server-side auth, or replaced by a CMS.

### Explore Bar
- **Current:** Duplicated 90-line IIFE in every `.html` file
- **Next.js:** Single `<ExploreBar>` component included in the root layout.

### Audio
- **Current:** `<audio id="bg-music">` in every page, autoplay attempted
- **Next.js:** Single audio controller in root layout or a custom hook.

### CSS
- **Current:** Monolithic `style.css` with inline style overrides
- **Next.js:** Can migrate to CSS Modules per component or Tailwind. `body.home` / `body.page` body classes become component-level class application.

### Checkout / Order Submission
- **Current:** WhatsApp redirect with URL-encoded text, no server involved
- **Next.js:** Same approach is valid and portable — `finalizePurchase()` logic becomes a client component action.
