# Coding Conventions
_Last updated: 2026-05-07_

## Summary

KGC is a hand-crafted, no-build-tool static site written in plain HTML, CSS, and vanilla JavaScript (ES2017+ features used: `async/await`, `const/let`, arrow functions, template literals, destructuring). There is no module system, no bundler, and no linter configuration. Conventions are organic and must be extracted from observed patterns across all source files. The goal of this document is to preserve the behavioral identity of the site during migration to TypeScript + Next.js.

---

## HTML Conventions

### Doctype and Language
- Every page begins with `<!DOCTYPE html>` on line 1.
- Every page uses `<html lang="pt-BR">` — Brazilian Portuguese.

### Head Structure (consistent across all pages)
The `<head>` block in every page follows this exact order:
```html
<meta charset="UTF-8">
<title>[Page Name] - KGC</title>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="stylesheet" href="style.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="preload" as="image" href="assets/logo.gif">
<link rel="icon" type="image/gif" href="assets/logo.gif">
```
- `viewport-fit=cover` is intentional — used for iPhone safe-area support.
- Font Awesome 6.4.0 is loaded from CDN on every page.
- `logo.gif` is preloaded as an image on every page.
- No OG meta tags, no description meta tag.

### Body Classes
Two distinct body contexts exist:
- `<body class="home">` — used only on `index.html`. Centers content vertically with flexbox.
- `<body class="page">` — used on all inner pages (`loja.html`, `product.html`, `checkout.html`, `contato.html`, `sobre.html`, `media.html`, `projetos.html`, `colab.html`). Uses block layout with left padding for desktop.

### Script Loading
Scripts are loaded at the **bottom of `<body>`**, before closing tag, in this order:
```html
<script src="products.js"></script>
<script src="script.js"></script>
```
`products.js` always comes before `script.js`. Inline `<script>` blocks follow immediately after, never before the external scripts.

### Inline Styles
Heavy use of inline styles is present throughout, especially on inner HTML elements:
- Layout overrides: `style="display:flex; gap:10px;"`
- Font overrides: `style="font-family:'Press Start 2P', monospace;"`
- Color overrides: `style="color:#f5c542;"`
- This is a **known inconsistency** — in migration, these should be replaced with Tailwind classes or CSS modules.

### Event Handlers in HTML
`onclick` attributes are used directly on elements throughout:
```html
<div class="menu-tile" onclick="location.href='loja.html'">
<button onclick="toggleCart()">Fechar</button>
<div id="cart-icon" onclick="toggleCart()">
```
This is the primary interaction pattern — no `addEventListener` wiring from HTML. Exception: `script.js` adds click sounds via `addEventListener` in `DOMContentLoaded`.

### Repeated Boilerplate Blocks
These blocks appear verbatim on **every single inner page** (copy-pasted, not shared via include):
1. Cart icon (`#cart-icon`)
2. Cart overlay modal (`#cart-overlay` + `#cart-modal`)
3. Background audio element (`#bg-music`)
4. Explore bar (`.explore-bar` + `data-page-id` attribute)
5. Explore overlay (`#explore-overlay`)
6. The entire `updateExploreProgress` IIFE script block

The only variation is `data-page-id` on `.explore-bar`, which uniquely identifies each page:
`home`, `loja`, `produto`, `projetos`, `colab`, `sobre`, `contato`, `media`, `product`, `checkout`.

### Navigation Pattern
All "back to menu" links use this structure:
```html
<div class="voltar-container">
  <a href="index.html#menu" class="link-voltar">← Voltar ao Menu</a>
</div>
```
Product-to-store links use `href="loja.html"`. Store-to-product links use `href="product.html?slug={slug}"`.

### Data Attributes
`data-page-id` on `.explore-bar` is the only custom data attribute in use. `data-full` on lookbook images stores the high-resolution image URL for the lightbox.

---

## CSS Conventions

### File
Single global stylesheet: `style.css`. No CSS variables for design tokens except:
```css
:root {
  --pad: clamp(12px, 4vw, 24px);
  --safe-top: env(safe-area-inset-top);
  --safe-bottom: env(safe-area-inset-bottom);
}
```
`--pad` is used via `padding: var(--pad)` on major layout containers.

### Naming: Flat + Semantic IDs
No BEM. No utility framework. Naming is a mix of:
- **IDs for unique regions**: `#retro-monitor`, `#start-screen`, `#main-menu`, `#store`, `#cart-icon`, `#cart-overlay`, `#cart-modal`, `#product-detail`, `#kgc-gate`, `#kgc-admin-panel`
- **Classes for reusable components**: `.menu-tile`, `.menu-grid`, `.product-card`, `.option-btn`, `.explore-bar`, `.explore-progress`, `.lightbox`, `.carousel-item`
- **Classes for state**: `.hidden` (display:none !important), `.active` (activates display:flex), `.selected` (button/swatch active state), `.spin` (animation), `.is-admin` (body class for admin visibility)
- **Utility classes**: `.icon-green`, `.icon-orange`, `.icon-blue`, `.icon-purple`, `.icon-red`, `.icon-darkgreen` — simple color overrides for Font Awesome icons

### Design Token Pattern (inlined, not variables)
The design system has consistent values but they are hardcoded, not in variables:
- **Primary gold**: `#f5c542` — used for borders, text, backgrounds throughout
- **Background dark**: `#111` — default dark surface
- **Body black**: `#000`
- **Text white**: `#fff`
- **Error red**: `#B22222` / `#ff5858`
- **Admin neon green**: `#39ff14`

### Typography Classes
Two fonts, applied via class or element selector:
- `'Press Start 2P'` — headings, buttons, UI labels, retro brand text
- `'Oswald'` — body font, product descriptions, form inputs

`h1, h2` globally use `'Press Start 2P'` with `color: #f5c542; text-transform: uppercase`.

### CSS Organization
The single `style.css` is organized in sections marked by comments:
```
/* --- RETRO MONITOR --- */
/* --- LOJA --- */
/* --- CARRINHO --- */
/* --- DETALHE PRODUTO --- */
/* === GATE OVERLAY & ADMIN === */
/* === V2 MOBILE UNIVERSAL === */
/* === V3: Gate logo spin === */
/* === Galeria de mídia === */
/* === EXPLORE BAR ANIMADA === */
/* --- ADIÇÕES PARA CORREÇÃO --- */
/* --- CORREÇÃO FINAL: CARROSSEL E TAMANHOS --- */
```
There are duplicate rules — for example, `.menu-grid`, `#store`, `#product-detail` are each defined multiple times as hotfixes were layered on top. The last rule in the file wins per CSS cascade.

### Responsive Strategy
- Mobile-first breakpoints: `max-width: 480px`, `max-width: 600px`, `max-width: 768px`, `max-width: 900px`
- Grid responsive via `repeat(auto-fit, ...)` and breakpoint overrides
- `clamp()` used for fluid font sizes and spacing
- `env(safe-area-inset-*)` used for iPhone notch/home bar
- `min()` used for capping widths: `width: min(560px, 92vw)`

### Button Global Override
A global `button` rule applies `width: 100%` to all buttons, which causes issues throughout and is then locally overridden with `!important` in multiple places:
```css
/* Global (problematic) */
button { width: 100%; ... }

/* Override */
.option-btn { width: auto !important; }
#kgc-admin-toggle { width: auto; }
```
This pattern — global rule broken by local `!important` overrides — should **not** be carried into the Next.js migration.

### Page-Specific Styles
`checkout.html`, `sobre.html`, `colab.html`, and `media.html` each contain `<style>` blocks inside `<head>` for page-specific overrides. These are not in `style.css`.

---

## JavaScript Conventions

### ES Version
ES2017+: `async/await`, `const`/`let`, arrow functions, template literals, `Array.prototype.find`, `URLSearchParams`, `fetch`, `BroadcastChannel`, `insertAdjacentHTML`. No transpilation — runs in modern browsers only.

### Variable Declarations
`const` for values that don't change, `let` for reassignable variables. No `var` observed in active code.

### Quotes
Double quotes `"..."` used in HTML attributes. Single quotes `'...'` predominate in JavaScript strings. Template literals `` `...` `` used for HTML generation in JS.

### Semicolons
Semicolons are used consistently at statement ends in both `script.js` and `products.js`.

### Indentation
2-space indentation in HTML files. 4-space indentation in JS files and inline `<script>` blocks. This inconsistency exists throughout.

### Module Pattern
No ES modules (`import`/`export`). The admin panel in `script.js` uses an IIFE for encapsulation:
```js
(function(){
  let state = { items: [], __formImages: [] };
  // ...
})();
```
The explore progress logic uses the same IIFE pattern on every page (copy-pasted).

### Global State via `window`
Functions that need to be callable from HTML `onclick` attributes or cross-file are explicitly placed on `window`:
```js
window.removeFromCart = function(index) { ... }
window.selectColor = function(btn, value) { ... }
window.selectSize = function(btn, value) { ... }
window.plusSlides = function(n) { ... }
window.openZoom = function(src) { ... }
window.exportProducts = function() { ... }
window.updateExploreProgress = updateExploreProgress;
```

### Mutable Page-Level State
Product detail page uses module-level mutable variables:
```js
let slideIndex = 1;
let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
```

### Function Naming
`camelCase` throughout: `enterScene`, `toggleCart`, `goToCheckout`, `updateCartCount`, `renderCartModal`, `renderStore`, `renderProduct`, `renderCarousel`, `handleAddToCart`, `setupMasks`, `finalizePurchase`, `generateOrderId`, `showNotification`, `createRetroPopup`, `updateExploreProgress`, `playClickSound`.

### Error Handling
`try/catch` used defensively around `localStorage` reads and `JSON.parse`:
```js
try { visited = JSON.parse(localStorage.getItem('visitedPages') || '[]'); } catch(e){ visited = []; }
```
`fetch` errors caught and logged: `.catch(() => {})` (silenced) or `.catch(e => console.log(...))`.
Audio autoplay errors silenced: `audio.play().catch(() => {})`.

### DOM Interaction
- `document.getElementById()` preferred for unique elements
- `document.querySelector()` / `document.querySelectorAll()` for class-based selection
- `innerHTML` used for bulk DOM generation from JS (no virtual DOM, no JSX)
- `insertAdjacentHTML('beforeend', ...)` used to inject popup HTML

### Data Persistence
`localStorage` is the sole persistence layer:
- `cart` — JSON array of cart items
- `kgc_products_v1` — JSON object `{ items: [...] }` for admin-edited products
- `visitedPages` — JSON array of visited page IDs for explore bar
- `kgc_explore_complete` — string `'true'` flag for popup shown state

### Async Data Loading
`products.js` uses a priority waterfall: localStorage first, `products/products.json` as fallback:
```js
async function loadProducts() {
  const localData = localStorage.getItem(LS_KEY_PRODUCTS);
  if (localData) { /* parse and return */ }
  const res = await fetch('products/products.json');
  // ...
}
```

### External API
CEP lookup via `https://brasilapi.com.br/api/cep/v1/{cep}` in `checkout.html`. Called on input blur.

### WhatsApp Checkout
Order submission redirects to WhatsApp deeplink with URL-encoded order text:
```js
window.location.href = `https://wa.me/${phone}?text=${message}`;
```
Phone number `5511945352659` is hardcoded in `checkout.html`.

---

## File Naming Conventions

| File | Pattern |
|---|---|
| Pages | lowercase, Portuguese names: `loja.html`, `contato.html`, `sobre.html`, `projetos.html`, `colab.html`, `media.html`, `checkout.html`, `product.html` |
| JS | lowercase: `script.js`, `products.js` |
| CSS | lowercase: `style.css` |
| Product slugs | kebab-case: `kgc-camo-off-white`, `hustler-black`, `bone-trucker-kgc-keep-going` |
| Product images | `{slug}/{slug}_1.png`, `{slug}/{slug}_2.png`, etc. |
| Lookbook thumbs | `thumb_IMG_XXXX.jpg` (prefix `thumb_` on thumbnail) |

---

## What to Preserve in Next.js Migration

### Must Preserve (behavioral identity)
1. **Retro aesthetic**: `'Press Start 2P'` font, `#f5c542` gold color, dark backgrounds, pixel-style elements.
2. **`localStorage` cart**: Same keys (`cart`, `kgc_products_v1`) expected if admin is preserved.
3. **Explore bar progress system**: page IDs must match: `home`, `loja`, `projetos`, `colab`, `sobre`, `contato`, `media`, `product`, `checkout`.
4. **WhatsApp checkout flow**: Phone `5511945352659`, message format, `wa.me` deeplink.
5. **CEP auto-fill**: brasilapi.com.br integration on checkout address field.
6. **Product slug routing**: `product.html?slug=kgc-camo-off-white` becomes `/produto/kgc-camo-off-white`.
7. **Audio autoplay silencing**: Never throw on audio play failure.
8. **Carousel + zoom**: Product image carousel with click-to-zoom modal.
9. **Lightbox**: Media gallery lightbox with `data-full` high-res image swap.
10. **Click sounds**: 8-bit click sound via Web Audio API on interactive elements.

### Patterns to Eliminate in Migration
1. **Global `button { width: 100% }` rule** — replaced by scoped component styles.
2. **Inline `style="..."` attributes** — replace with Tailwind or CSS modules.
3. **`onclick="..."` HTML attributes** — replace with React event handlers.
4. **Copy-pasted explore bar IIFE on every page** — replace with a shared `useExploreProgress` hook.
5. **Copy-pasted cart HTML on every page** — replace with a shared `<CartModal>` component.
6. **Copy-pasted audio element on every page** — replace with a shared layout component.
7. **Duplicate CSS rules** — consolidate into single canonical rule per component.
8. **`window.*` globals** — replaced by module exports and React state.
9. **`innerHTML` for DOM generation** — replaced by JSX.

---

## Comment Style
Comments are used descriptively to section code. Section headers use `---` and `===` delimiters:
```js
// --- 1. Carregamento Inteligente de Dados ---
// --- 2. Sistema de Carrinho ---
```
Inline comments are Portuguese. Code comments explaining "why" are common, e.g.:
```js
// O PULO DO GATO: Impede que o texto "R$ XX" quebre
```
Preserve Portuguese comment style in migration for consistency with existing codebase history.
