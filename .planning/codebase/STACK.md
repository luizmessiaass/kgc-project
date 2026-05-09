# Technology Stack

_Last updated: 2026-05-07_

## Summary

KGC is a fully static, zero-dependency website for a Brazilian streetwear brand. It is written in plain HTML5, CSS3, and vanilla JavaScript ES2020+ with no build step, no bundler, no package manager, and no server-side code. All pages are `.html` files loaded directly in a browser; the only network calls are to two CDNs (fonts, icons), one external REST API (CEP lookup), and one external video embed (YouTube).

---

## Languages

**Primary:**
- **HTML5** — All 9 pages: `index.html`, `loja.html`, `product.html`, `checkout.html`, `colab.html`, `contato.html`, `media.html`, `projetos.html`, `sobre.html`
- **CSS3** — Single shared stylesheet `style.css` (1 660 lines). Also `style.css.bak` (previous backup, not served).
- **JavaScript (ES2020+)** — Two shared scripts: `script.js` and `products.js`. Also `script.js.bak` (backup). Features used: `async/await`, `fetch`, `BroadcastChannel`, `URLSearchParams`, `localStorage`, `AudioContext`, `FormData`, CSS custom properties via JS.

**Secondary / Data:**
- **JSON** — `products/products.json` is the static product catalogue (6 products).

---

## Runtime Environment

- **Browser-only** — No Node.js, no server, no runtime.
- **Hosting model:** Static file server or any CDN capable of serving flat HTML files (e.g., GitHub Pages, Vercel static, Netlify).
- **No build required** — Files are served as-is.
- **Language target:** `pt-BR` (`<html lang="pt-BR">` on every page).

---

## Frameworks & Libraries

**None installed locally.** All dependencies are loaded from CDN at runtime:

| Library | Version | CDN URL | Used for |
|---|---|---|---|
| Font Awesome | 6.4.0 | `https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css` | Icons (cart, store, menu tiles, etc.) |
| Google Fonts — Oswald | 500 weight | `https://fonts.googleapis.com/css2?family=Oswald:wght@500&display=swap` | Body text, product info |
| Google Fonts — Press Start 2P | Regular | `https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap` | Pixel/retro headings, buttons, labels |

All three are declared via `<link>` tags in `<head>` on every page and in `@import` at the top of `style.css`.

---

## Build Tools

**None.** There is no:
- `package.json` / npm / yarn / pnpm
- Webpack, Vite, Rollup, Parcel, or any bundler
- TypeScript compiler or Babel transpiler
- CSS preprocessor (no Sass/Less/PostCSS)
- Task runner (no Gulp/Grunt)
- Linter config (no `.eslintrc`, `.prettierrc`, etc.)

---

## Package Manager

Not applicable — no packages are installed.

---

## Data Layer

**Product Catalogue:**
- Source of truth: `products/products.json` (static JSON, 6 products)
- Fields per product: `slug`, `name`, `description`, `price`, `original_price`, `colors`, `sizes`
- Product images: `products/{slug}/{slug}_1.png` through `_{N}.png` (convention-based paths)

**Admin Override:**
- `script.js` contains an embedded admin panel that writes edited product data to `localStorage` under key `kgc_products_v1`.
- `products.js` checks `localStorage` first; falls back to `products/products.json` via `fetch()`.
- No backend — admin changes are browser-local only.

**Cart:**
- Stored in `localStorage` under key `cart`.
- Schema: `Array<{ id, name, price, slug, image, color, size, quantity }>`.

**Explore Progress:**
- Stored in `localStorage` under keys `visitedPages` (array of page IDs) and `kgc_explore_complete` (boolean flag).

---

## Audio

- Single MP3 file `intro.mp3` at project root, used as looping background music on all pages via `<audio id="bg-music" loop>`.
- Click sound effects generated procedurally via the Web Audio API (`AudioContext`, `OscillatorNode`) in `script.js` — no additional audio files.

---

## Media Assets

| Location | Type | Count | Purpose |
|---|---|---|---|
| `assets/logo.gif` | GIF animation | 1 | Brand logo, used as favicon and inline image |
| `kgc.gif` | GIF animation | 1 | Root-level GIF (unused reference — not linked in any HTML) |
| `assets/lookbook/thumb_IMG_*.jpg` | JPEG thumbnails | 34 | Lookbook gallery thumbnails in `media.html` |
| `assets/lookbook/IMG_*.jpg` / `*.png` | Full-res images | ~70 | Lightbox full-resolution lookbook photos |
| `products/{slug}/{slug}_N.png` | PNG | 4–5 per product | Product gallery images |

---

## CSS Architecture

- **Single file:** `style.css` — all styles are global, no modules, no scoping.
- **Fonts declared twice:** once as `@import` in `style.css` and once as `<link>` in each HTML `<head>`.
- **Custom properties:** `--vh`, `--pad`, `--safe-top`, `--safe-bottom` (used for mobile/iOS safe-area layout).
- **No CSS framework** (no Bootstrap, Tailwind, etc.).
- **Responsive breakpoints:** `max-width: 480px`, `600px`, `768px`, `900px` via standard `@media` queries.
- **`env()` safe-area support** for iPhone notch: `env(safe-area-inset-top/bottom/right)`.

---

## JavaScript Architecture

- **Two shared scripts loaded on every page** (via `<script src="products.js">` then `<script src="script.js">`):
  - `products.js` — store rendering, cart management, product detail, carousel, zoom modal
  - `script.js` — scene entry, audio, admin panel, cart UI toggle, lightbox, click sounds, explore bar
- **Page-specific inline `<script>` blocks** at the bottom of each HTML file handle page initialization (e.g., calling `renderStore()`, `renderProduct()`, `updateExploreProgress()`).
- **Global function style** — most functions are attached to `window` or declared at global scope. No modules (`import`/`export` not used).
- **`BroadcastChannel` API** — referenced in `script.js` admin IIFE for potential cross-tab sync (guarded with feature detection).

---

## Browser Compatibility Target

- Modern evergreen browsers (Chrome, Safari, Firefox, Edge).
- iOS Safari-specific handling: `viewport-fit=cover`, `env(safe-area-inset-*)`, `font-size: 16px` on inputs to prevent zoom.
- No IE11 or legacy browser support.

---

## Deployment

- No CI/CD pipeline detected.
- No Dockerfile, server config, or deployment scripts present.
- Compatible with any static hosting: open `index.html` locally, or upload to GitHub Pages / Netlify / Vercel (static export mode).
