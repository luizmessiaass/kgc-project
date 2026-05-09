# Codebase Structure
_Last updated: 2026-05-07_

## Summary

The project is a flat, no-build-step static site. All HTML pages, scripts, and styles live at the project root. Product images are organized into per-product folders under `products/`. Lookbook and brand assets live under `assets/`. There are no `node_modules`, no `package.json`, and no configuration files.

---

## Full Directory Tree

```
KGC PROJECT/
│
├── index.html               # Entry point — splash screen + main menu
├── loja.html                # Product store grid page
├── product.html             # Product detail page (reads ?slug= from URL)
├── checkout.html            # Order form + WhatsApp dispatch page
├── colab.html               # Collabs/partnerships page
├── contato.html             # Contact info + stub form page
├── media.html               # Lookbook gallery + YouTube video page
├── projetos.html            # Projects placeholder page
├── sobre.html               # Brand story/about page
│
├── script.js                # Core script: menu, audio, admin panel, cart UI, lightbox
├── script.js.bak            # Backup of previous script.js version (not loaded)
├── products.js              # Store engine: data loading, cart logic, rendering
│
├── style.css                # Global stylesheet for all pages
├── style.css.bak            # Backup of previous style.css (not loaded)
│
├── intro.mp3                # Background music, autoplay on all pages except index
├── kgc.gif                  # Brand GIF (present but not referenced in current HTML)
│
├── assets/
│   ├── logo.gif             # Animated brand logo, used as favicon + hero image
│   └── lookbook/            # Lookbook photo library (132 files total)
│       ├── IMG_7713.jpg     # Full-resolution lookbook photos (34 photos)
│       ├── ...              # (named IMG_XXXX.jpg)
│       ├── thumb_IMG_7713.jpg  # Thumbnail versions for grid display (34 thumbs)
│       └── ...              # (named thumb_IMG_XXXX.jpg)
│                            # Note: media.html references lowercase filenames
│                            # (thumb_IMG_*.jpg) — verify case on deployment server
│
├── products/
│   ├── products.json        # Canonical product catalog (6 products, see schema below)
│   ├── bermuda-cargo-tatica-camo/
│   │   ├── bermuda-cargo-tatica-camo_1.png
│   │   ├── bermuda-cargo-tatica-camo_2.png
│   │   ├── bermuda-cargo-tatica-camo_3.png
│   │   └── bermuda-cargo-tatica-camo_4.png
│   ├── bone-trucker-kgc-keep-going/
│   │   ├── bone-trucker-kgc-keep-going_1.png
│   │   ├── bone-trucker-kgc-keep-going_2.png
│   │   ├── bone-trucker-kgc-keep-going_3.png
│   │   ├── bone-trucker-kgc-keep-going_4.png
│   │   └── bone-trucker-kgc-keep-going_5.png
│   ├── hustler-black/
│   │   ├── hustler-black_1.png
│   │   ├── hustler-black_2.png
│   │   ├── hustler-black_3.png
│   │   ├── hustler-black_4.png
│   │   └── hustler-black_5.png
│   ├── jhorts-moletom-kgc-essential/
│   │   ├── jhorts-moletom-kgc-essential_1.png
│   │   ├── jhorts-moletom-kgc-essential_2.png
│   │   └── jhorts-moletom-kgc-essential_3.png
│   ├── kgc-camo-off-white/
│   │   ├── kgc-camo-off-white_1.png
│   │   ├── kgc-camo-off-white_2.png
│   │   ├── kgc-camo-off-white_3.png
│   │   ├── kgc-camo-off-white_4.png
│   │   └── kgc-camo-off-white_5.png
│   └── kgc-collegiate-black-yellow/
│       ├── kgc-collegiate-black-yellow_1.png
│       ├── kgc-collegiate-black-yellow_2.png
│       ├── kgc-collegiate-black-yellow_3.png
│       └── kgc-collegiate-black-yellow_4.png
│
└── .planning/
    └── codebase/            # GSD analysis documents (this file's directory)
```

---

## Directory Responsibilities

### Root `/`
Contains all deliverable files. No subdirectory organization for source code. Scripts, styles, HTML pages, and media files coexist at the same level.

### `assets/`
- `logo.gif` — The animated KGC brand logo. Used as favicon (`<link rel="icon">`) and as the hero image on `index.html` and in the header of `product.html` and `checkout.html`.
- `assets/lookbook/` — Houses the complete lookbook photo set used exclusively by `media.html`. Each photo has two variants: a full-resolution `.jpg` (for the lightbox) and a `thumb_` prefixed `.jpg` (for the grid). All 34 pairs are hardcoded as `<figure>` elements in `media.html`.

### `products/`
Product-specific images and the catalog JSON. Each product has its own folder named identically to its `slug` value in `products.json`. Images follow the naming convention `<slug>_<N>.png` where `N` starts at 1.

**Image resolution:** Images are `.png`, not `.webp`. No responsive variants (no `@2x`, no `srcset`).

**Image count per product:**
- `bermuda-cargo-tatica-camo`: 4 images
- `bone-trucker-kgc-keep-going`: 5 images
- `hustler-black`: 5 images
- `jhorts-moletom-kgc-essential`: 3 images
- `kgc-camo-off-white`: 5 images
- `kgc-collegiate-black-yellow`: 4 images

---

## Entry Points

**User entry:** `index.html` — the only page meant to be opened directly. All others are reachable from the main menu.

**Script entry:** `products.js` loaded first, then `script.js`. Both execute immediately on parse (module-scope side effects: `AudioContext` creation, `DOMContentLoaded` listeners, `updateCartCount()`).

**Data entry:** `products/products.json` — fetched at runtime by `loadProducts()` in `products.js` when no admin data exists in `localStorage`.

---

## Key File Purposes

### `index.html`
The splash/home page. Contains two panels inside `#retro-monitor`: `#start-screen` (initial state, visible) and `#main-menu` (hidden until `enterScene()` is called). Hosts the exploration progress tracker logic (inline script), the cart overlay, and the background audio element. The only page that does NOT autoplay audio — the user must click "Entrar na cena".

### `loja.html`
Renders the product grid into `#store`. Calls `renderStore()` from `products.js` on `DOMContentLoaded`. The `#store` div starts with a placeholder "Carregando inventário..." text.

### `product.html`
Reads `?slug=` from the URL. Calls `renderProduct()` from `products.js`. Contains the image carousel (`#p-gallery`), zoom modal (`#img-zoom-modal`), color/size selectors, and add-to-cart button. The `[data-logo]` heading acts as a clickable logo link back to `index.html`.

### `checkout.html`
The most self-contained page. Contains all checkout logic inline (not in shared scripts): `renderCheckoutSummary()`, `setupMasks()`, `finalizePurchase()`, `generateOrderId()`. The submit action builds a pre-formatted WhatsApp message and redirects to `https://wa.me/5511945352659?text=<encoded>`. Also fetches BrasilAPI for CEP lookup. The contact phone is hardcoded: `5511945352659`.

### `script.js`
Core runtime. Responsibilities:
- `enterScene()` — home menu transition
- Admin panel (password-gated, writes to `localStorage['kgc_products_v1']`)
- `toggleCart()` / `goToCheckout()` — cart UI
- Web Audio API click sound on interactive elements
- Mobile `--vh` CSS variable fix
- Lightbox for `media.html` (handles `.media-item img` clicks)
- `exportProducts()` — JSON download utility

### `products.js`
Store engine. Responsibilities:
- `loadProducts()` — async data loading with localStorage-first strategy
- `renderStore()` — builds product card HTML for `loja.html`
- `renderProduct()` — builds product detail for `product.html`
- Cart CRUD via localStorage (add, remove, count, render modal)
- Carousel (`renderCarousel`, `plusSlides`, `openZoom`)
- Retro notification popup (`createRetroPopup`, `showNotification`)

### `style.css`
Single global stylesheet (1,660 lines). Not split by page or component. Contains all responsive breakpoints, all component states, and all animation keyframes. Page-specific styles that don't fit the global model are placed in `<style>` blocks inside individual HTML files.

---

## Shared vs Page-Specific Assets

### Shared (used on every page)
- `style.css` — global styles
- `script.js` — cart, audio, admin
- `products.js` — cart count badge, cart modal
- `assets/logo.gif` — favicon
- `intro.mp3` — background audio
- CDN: Font Awesome 6.4.0, Google Fonts (Press Start 2P, Oswald)
- HTML structure: cart overlay (`#cart-overlay`), cart icon (`#cart-icon`), explore bar (`.explore-bar`), explore overlay (`#explore-overlay`)

### Page-Specific Assets
- `assets/lookbook/*.jpg` — `media.html` only
- `products/<slug>/*.png` — `loja.html` + `product.html` only
- `kgc.gif` — not referenced by any current HTML file
- Inline `<style>` blocks — `checkout.html`, `colab.html`, `media.html`, `sobre.html`

---

## Data Files and Schema

### `products/products.json`

Top-level format: JSON array (not wrapped in an object). Each element:

```json
{
  "slug": "kgc-camo-off-white",
  "name": "KGC Camo Off-White",
  "description": "...",
  "price": 149.99,
  "original_price": 189.90,
  "colors": "Off-White",
  "sizes": "PP,P,M,G,GG"
}
```

**Field details:**

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `slug` | string | Yes | URL-safe identifier; must match folder name under `products/` |
| `name` | string | Yes | Display name |
| `description` | string | Yes | Used in product detail, rendered with `white-space: pre-line` |
| `price` | number | Yes | Current selling price in BRL |
| `original_price` | number | No | If present and > `price`, shows strikethrough + discount badge |
| `colors` | string | No | Comma-separated color names (e.g., `"Preto,Branco"`), or a single value |
| `sizes` | string | No | Comma-separated size labels (e.g., `"PP,P,M,G,GG"` or `"40,42,44"`) |

**Fields used by admin panel but NOT in current `products.json`:**

| Field | Type | Notes |
|-------|------|-------|
| `images` | string[] | Array of image paths — overrides the `<slug>_N.png` convention |
| `active` | boolean | If `false`, product is excluded from `loadProducts()` result |
| `created_at` | string (ISO date) | Used for sort order in `renderStore()` |

When `images` is absent, `renderCarousel()` generates paths as `products/<slug>/<slug>_1.png` through `products/<slug>/<slug>_5.png` and hides broken images via `onerror="this.style.display='none'"`.

---

## Naming Conventions

**HTML files:** lowercase, hyphenated where multi-word (`loja.html`, not `Store.html`)

**JS files:** `camelCase` function names. No file-level namespacing.

**CSS classes:** kebab-case (`.product-card`, `.explore-bar`, `.link-voltar`)

**CSS IDs:** camelCase or kebab-case mixed (e.g., `#cart-overlay`, `#kgc-admin-sheet`, `#p-gallery`)

**Product slugs:** kebab-case, match folder name exactly (`bermuda-cargo-tatica-camo`)

**Product images:** `<slug>_<N>.png` where N is 1-based integer with no padding

**Lookbook images:** `IMG_XXXX.jpg` (full) and `thumb_IMG_XXXX.jpg` (thumbnail); HTML references them with lowercase `img_` prefix — verify case sensitivity on Linux servers

---

## Where to Add New Code for Next.js Migration

### New page route
- Create `app/<route>/page.tsx` (App Router) or `pages/<route>.tsx` (Pages Router)
- Port body content from corresponding `.html` file
- Page ID for explore bar becomes a prop or constant per file

### New product
- Add entry to `products/products.json` (or future database)
- Create folder `products/<slug>/` with images `<slug>_1.png`, `<slug>_2.png`, etc.
- Slug must be URL-safe and match folder name exactly

### Shared layout elements
- Cart overlay, audio player, explore bar — move to `app/layout.tsx` root layout component
- These currently repeat verbatim across all 9 HTML files

### Product images in Next.js
- Move `products/<slug>/` to `public/products/<slug>/`
- Move `assets/` to `public/assets/`
- Reference via `/products/<slug>/<slug>_1.png` (absolute from public root)
- Wrap in Next.js `<Image>` component for optimization

### Cart state
- Extract localStorage reads/writes from `products.js` into a React context (`CartContext`)
- Or use Zustand with a localStorage persist middleware

### Styles
- `style.css` can be imported globally in `app/globals.css`
- Inline `<style>` blocks in HTML files become CSS Modules per component

### New lookbook images
- Add `IMG_XXXX.jpg` + `thumb_IMG_XXXX.jpg` to `assets/lookbook/`
- In Next.js, add corresponding `<figure>` to `app/media/page.tsx` (or make the gallery data-driven)
