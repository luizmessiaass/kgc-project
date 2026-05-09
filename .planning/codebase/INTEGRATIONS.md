# External Integrations

_Last updated: 2026-05-07_

## Summary

KGC integrates with four external services: Google Fonts (typography), cdnjs/Font Awesome (icons), YouTube (video embed), and BrasilAPI (CEP/postal-code lookup). The checkout flow does not use any payment gateway — orders are submitted as a pre-formatted WhatsApp deep-link message to a hardcoded phone number. There is no analytics, no tracking pixels, no social login, and no email/form backend.

---

## CDN Resources

### Google Fonts

- **Service:** Google Fonts (fonts.googleapis.com / fonts.gstatic.com)
- **Loaded in:** `style.css` (via `@import`) **and** `<head>` of every HTML page (via `<link>`)
- **Fonts:**
  - `Oswald` weight 500 — body text, product descriptions, form labels
  - `Press Start 2P` — headings, buttons, pixel/retro UI elements
- **URL pattern:**
  ```
  https://fonts.googleapis.com/css2?family=Oswald:wght@500&display=swap
  https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap
  ```
- **Auth:** None (public CDN)
- **Failure impact:** UI degrades to fallback fonts (`sans-serif`, `monospace`). Layout will shift because both fonts have significantly different metrics.

### Font Awesome Icons

- **Service:** cdnjs.cloudflare.com
- **Version:** 6.4.0
- **Loaded in:** `<head>` of every HTML page
- **URL:**
  ```
  https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css
  ```
- **Auth:** None (public CDN)
- **Icons used:** `fa-shopping-cart`, `fa-store`, `fa-project-diagram`, `fa-users`, `fa-info-circle`, `fa-phone`, `fa-film`
- **Failure impact:** Menu tile icons and cart icon disappear; layout continues to function.

---

## Video Embed

### YouTube

- **Used in:** `media.html`
- **Embed type:** `<iframe>` with standard YouTube embed URL
- **Video ID:** `yzJlXG07MTo`
- **Full URL:**
  ```
  https://www.youtube.com/embed/yzJlXG07MTo
  ```
- **iframe attributes:** `loading="lazy"`, `allowfullscreen`, `allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"`
- **Auth:** None (public video)
- **Failure impact:** Video section shows blank area; rest of media gallery still works.

---

## REST APIs

### BrasilAPI — CEP Lookup

- **Service:** BrasilAPI (brasilapi.com.br)
- **Used in:** `checkout.html` inline `<script>` block, inside `setupMasks()` → CEP input `blur` handler
- **Purpose:** Auto-fill address fields (street, city, state) when the user types a valid 8-digit Brazilian postal code (CEP)
- **Endpoint:**
  ```
  GET https://brasilapi.com.br/api/cep/v1/{cep}
  ```
- **Response fields consumed:** `street`, `city`, `state`
- **Auth:** None (public free API)
- **Error handling:** `try/catch` around `fetch`; on failure, the address input placeholder changes to "Digite manualmente" and input is cleared
- **Failure impact:** User must type address manually; checkout still works

---

## Checkout / Order Submission

### WhatsApp Deep Link (wa.me)

- **Used in:** `checkout.html`, function `finalizePurchase()`
- **Mechanism:** On form submission, a plain-text order summary is built from cart `localStorage` data and customer form inputs. The browser is redirected to a `wa.me` deep link, which opens WhatsApp with the message pre-filled.
- **Phone number (hardcoded):** `5511945352659` (Brazil country code 55, DDD 11)
- **URL pattern:**
  ```
  https://wa.me/5511945352659?text={encodeURIComponent(message)}
  ```
- **Message content includes:** Order ID (timestamp-based), customer name/phone/email, delivery address (CEP, street, city, state, complement), itemized product list (name, size, color, quantity), total, payment method, observations
- **Auth:** None — relies on device having WhatsApp installed
- **Failure impact:** If WhatsApp is not installed, the redirect may fail silently or open the web version. There is no fallback confirmation or server-side order record.

**Important for migration:** This is the only "checkout" — there is no payment gateway (no Stripe, MercadoPago, PagSeguro, etc.). All payment processing happens off-platform via WhatsApp conversation.

---

## Payment

**No payment gateway is integrated.** The checkout form collects:
- Payment method preference via `<select>`: PIX, Cartão de Crédito, or Boleto Bancário
- This preference is included in the WhatsApp message text only

Actual payment is handled manually by the store owner outside the site.

---

## External Outbound Links

| Page | Link | Target |
|---|---|---|
| `colab.html` | `https://brechodocorre.com/` | Partner site (Brechó do Corre), opens in `_blank` |
| `contato.html` | `http://wa.me/5511945352659` | WhatsApp contact link |
| `contato.html` | `mailto:contato@kgc.com` | Email client |

---

## Analytics & Tracking

**None detected.** No Google Analytics, Meta Pixel, Hotjar, Plausible, or any other analytics/tracking script is present in any HTML file or JavaScript file.

---

## Social Media Embeds

**None.** No Instagram, Twitter/X, TikTok, or Facebook embeds or SDK scripts are present. The YouTube embed in `media.html` is the only social-platform integration.

---

## Authentication & Identity

**None.** There is no user login, no OAuth, no session management. The embedded admin panel in `script.js` uses a hardcoded passcode (`ADMIN_CODE = 'kgcadmin'`) compared client-side — this is not a real auth system.

---

## Browser Storage

All persistence is client-side only:

| Key | Storage | Schema | Used for |
|---|---|---|---|
| `cart` | `localStorage` | `Array<{id, name, price, slug, image, color, size, quantity}>` | Shopping cart |
| `kgc_products_v1` | `localStorage` | `{items: Array<Product>}` | Admin-edited product catalogue override |
| `visitedPages` | `localStorage` | `Array<string>` (page IDs) | Explore progress tracking |
| `kgc_explore_complete` | `localStorage` | `"true"` string | One-time completion popup flag |

---

## Environment Variables

**None.** The project has no `.env` file and no environment variable system. The WhatsApp phone number, admin passcode, and all other configuration values are hardcoded directly in HTML/JS source files.

---

## Webhooks & Server Callbacks

**None.** The site makes no outgoing webhook calls and has no server to receive incoming webhooks.

---

## Migration Notes (Vanilla → TypeScript + Next.js)

When converting to Next.js, the following integrations require special handling:

1. **Google Fonts / Font Awesome** — Replace CDN `<link>` tags with `next/font` (for Google Fonts) and an npm package or local copy for Font Awesome.
2. **BrasilAPI fetch** — Move to a Next.js API route (`/api/cep`) to avoid CORS issues and add server-side caching.
3. **WhatsApp checkout** — The `wa.me` redirect can stay as a client-side redirect but should be wrapped in a proper form action or API route for validation and logging.
4. **YouTube embed** — Use `next/image` is not applicable; keep as `<iframe>` or use `react-youtube` / `lite-youtube-embed`.
5. **localStorage** — Must be wrapped in `useEffect` or `typeof window !== 'undefined'` guards since Next.js SSR will not have access to `window`.
6. **Product catalogue** — `products/products.json` can be read at build time via `getStaticProps` / `generateStaticParams` and served as static data; the admin LocalStorage override would need a proper backend or CMS.
