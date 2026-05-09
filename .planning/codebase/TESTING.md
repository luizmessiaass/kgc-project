# Testing Patterns
_Last updated: 2026-05-07_

## Summary

The KGC project has zero automated tests. There are no test files, no test runner configuration, no test framework, and no CI pipeline. All quality assurance is entirely manual. This document describes the confirmed absence of testing infrastructure, what manual coverage is implied by the codebase, and the complete test plan required for a safe migration to TypeScript + Next.js.

---

## Existing Test Infrastructure

**Test files found:** None  
**Test runner:** Not installed  
**Assertion library:** None  
**Test framework:** None  
**CI/CD pipeline:** None  
**`package.json`:** Does not exist — no npm project at all

There is no `jest.config.*`, `vitest.config.*`, `cypress.config.*`, `playwright.config.*`, `.mocharc`, or any equivalent file anywhere in the project root or subdirectories.

---

## What Manual Testing Currently Covers

Based on the codebase, manual testing of the following flows is implied before any release:

### 1. Home Page Entry Flow
- Landing on `index.html` shows the retro monitor with logo and "Entrar na cena" button
- Clicking the button triggers the init overlay (2-second animation), then transitions to the main menu
- Direct URL `index.html#menu` skips the entry screen and goes straight to menu
- Cart icon is hidden until `enterScene()` is called

### 2. Product Browsing (Loja)
- `loja.html` loads and shows "Carregando inventário..." text initially
- Products render from `products/products.json` via `fetch` (or from localStorage if admin data exists)
- Products are sorted newest-first by `created_at`
- Each product card shows image, name, and price
- Broken images fall back to `assets/placeholder.png`
- Clicking a product card navigates to `product.html?slug={slug}`

### 3. Product Detail View
- `product.html?slug={slug}` loads and shows "Carregando..." initially
- Product data populates: name (`#p-name`), price (`#p-price`), description (`#p-desc`)
- If `original_price > price`, the strikethrough price and discount badge show
- Image carousel renders: arrows navigate between images; broken images self-hide
- Clicking an image opens the zoom modal (`#img-zoom-modal`)
- Color options render as `.option-btn` buttons (or "Única" if no colors)
- Size options render as `.option-btn` buttons (or "Único" if no sizes)
- Clicking "Adicionar ao Carrinho" without selecting size shows notification "Selecione um tamanho!"
- Clicking without color shows "Selecione uma cor!"
- Valid add increments cart count in `#cart-icon .cart-count`
- Adding same item (slug + size + color) increments quantity, not duplicate entry

### 4. Cart Interaction
- Cart icon (`#cart-icon`) is always visible on inner pages
- Clicking cart icon toggles `#cart-overlay` visibility
- Cart modal shows all items with name, size, color, quantity, subtotal
- "X" button removes item from cart and updates count
- "Ir para Checkout" / "Finalizar Compra" navigates to `checkout.html`
- Cart count badge hides when cart is empty

### 5. Checkout Flow
- `checkout.html` shows order summary at top from localStorage cart
- Empty cart shows "Seu carrinho está vazio."
- Phone field auto-formats: `(11) 94535-2659`
- CEP field auto-formats: `01310-100`
- On CEP blur (8 digits), brasilapi.com.br is called and fills address, city, state fields
- Invalid CEP clears address and focuses field manually
- Form `required` validation fires before submission
- Pressing Enter inside form does NOT submit (blocked by `onkeydown`)
- "ENVIAR PEDIDO NO ZAP" button calls `finalizePurchase()` → opens `wa.me/5511945352659?text=...` deeplink
- WhatsApp message contains: order ID, customer data, delivery address, itemized products, total, payment method

### 6. Contact Form
- `contato.html` shows contact info (email, phone, address)
- Form has name, email, message fields — all `required`
- Submitting shows `alert('Mensagem enviada! Em breve entraremos em contato.')` and resets form
- Note: form submission is purely cosmetic — no actual backend call is made

### 7. Navigation
- All `.menu-tile` clicks on home menu navigate to correct pages
- "← Voltar ao Menu" links return to `index.html#menu` (which triggers `enterScene()` on load)
- "Voltar à Loja" on product page returns to `loja.html`
- Back/forward browser navigation works (no broken state)

### 8. Explore Bar Progress
- Each page registers its `data-page-id` to `visitedPages` in localStorage
- Progress bar fills proportionally: 1 page = 11%, 9 pages = 100%
- Reaching 100% shows overlay "Você zerou o site." once (guarded by `kgc_explore_complete` flag)
- Overlay auto-dismisses after 3 seconds
- Progress persists across sessions (localStorage)

### 9. Lightbox (Media Page)
- `media.html` shows lookbook grid of 34 images with thumbnails
- Clicking a thumbnail opens lightbox with `data-full` high-res image
- Clicking outside the image, clicking X button, or pressing Escape closes lightbox
- Body scroll locks while lightbox is open

### 10. Click Sounds
- Clicking any `button`, `.menu-tile`, `#cart-icon`, or `a` plays a brief 8-bit click sound via Web Audio API

### 11. Admin Panel
- `script.js` contains admin code gated by IIFE — not easily testable manually without knowing `ADMIN_CODE = 'kgcadmin'`
- Admin edits products saved to `localStorage` key `kgc_products_v1`
- Admin-edited products override the `products.json` source

---

## Test Plan for Next.js Migration

All tests below should be written **before** migration begins (test-first) or **in parallel** with each migrated page.

### Recommended Stack
```bash
# Unit + integration
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# E2E
npm install --save-dev playwright @playwright/test
```

---

### Unit Tests

#### `src/lib/cart.ts` (extracted cart logic)
```typescript
// What to test:
test('addToCart increments quantity for duplicate item id')
test('addToCart pushes new item for unique id')
test('removeFromCart splices by index')
test('calculateTotal sums price * quantity across items')
test('getCartCount sums all quantities')
```

#### `src/lib/products.ts` (extracted product loading)
```typescript
test('loadProducts returns localStorage items when present and non-empty')
test('loadProducts falls back to fetch when localStorage is empty')
test('loadProducts filters out items where active === false')
test('loadProducts sorts by created_at descending')
test('loadProducts returns [] on fetch error')
```

#### `src/lib/exploreProgress.ts`
```typescript
test('updateExploreProgress adds current page to visitedPages if not present')
test('updateExploreProgress does not duplicate page visits')
test('updateExploreProgress calculates percentage correctly (1/9 pages = 11%)')
test('updateExploreProgress caps at 100%')
test('updateExploreProgress sets kgc_explore_complete on first completion')
test('updateExploreProgress does not set flag again if already set')
```

#### `src/lib/checkout.ts`
```typescript
test('generateOrderId returns 14-digit YYYYMMDDHHmmss string')
test('formatWhatsAppMessage includes order ID, customer name, address, items, total')
test('formatWhatsAppMessage handles items with no size (Único) gracefully')
test('formatWhatsAppMessage handles items with no color (Padrão) gracefully')
```

#### `src/lib/masks.ts`
```typescript
test('formatPhone (11) formats 11-digit number correctly')
test('formatPhone (10) formats 10-digit number correctly')
test('formatCEP formats 8-digit number as 00000-000')
```

---

### Component Tests (React Testing Library)

#### `<ProductCard>`
```typescript
test('renders product name, price, and image')
test('uses placeholder image on onerror')
test('links to /produto/{slug}')
```

#### `<CartModal>`
```typescript
test('renders empty state when cart is empty')
test('renders each item with name, size, color, quantity, subtotal')
test('remove button calls removeFromCart with correct index')
test('total reflects sum of all items')
test('Finalizar Compra button navigates to /checkout')
```

#### `<ProductDetail>`
```typescript
test('renders loading state before data arrives')
test('renders product not found when slug has no match')
test('renders name, price, description after load')
test('shows original price and discount badge when original_price > price')
test('hides original price when no discount')
test('renders color buttons from product.colors')
test('renders size buttons from product.sizes')
test('shows "Única" when colors array is empty')
test('shows "Único" when sizes array is empty')
test('Add to Cart button disabled or shows error without size selected')
test('Add to Cart button disabled or shows error without color selected')
```

#### `<Carousel>`
```typescript
test('renders all images as carousel items')
test('first image is active on mount')
test('plusSlides(1) advances to next image')
test('plusSlides(-1) wraps to last image from first')
test('plusSlides(1) wraps to first image from last')
test('clicking image calls openZoom with correct src')
```

#### `<CheckoutForm>`
```typescript
test('renderCheckoutSummary shows items from cart')
test('renderCheckoutSummary shows empty message when cart is empty')
test('CEP field auto-fills address on valid CEP lookup')
test('CEP field shows manual placeholder on API error')
test('phone field masks input to (DD) NNNNN-NNNN format')
test('form does not submit when required fields are empty')
test('finalizePurchase opens wa.me deeplink with correct phone')
test('finalizePurchase message contains order ID, customer data, and total')
```

#### `<ExploreBar>`
```typescript
test('renders current progress from localStorage')
test('shows 0% on first visit with empty localStorage')
test('overlay shows once at 100%')
test('overlay does not show again on re-render when flag is set')
```

#### `<Lightbox>`
```typescript
test('opens with correct src when image is clicked')
test('closes on X button click')
test('closes on backdrop click')
test('closes on Escape key')
test('body overflow is hidden while open')
test('body overflow is restored on close')
```

---

### E2E Tests (Playwright)

These tests verify complete user flows exactly as they work in the current site.

#### Flow 1: Home Entry
```typescript
test('home page shows retro monitor with entry button')
test('clicking Entrar na cena shows init overlay then main menu')
test('visiting index.html#menu skips intro and shows menu directly')
test('all 6 menu tiles link to correct pages')
```

#### Flow 2: Product Browsing
```typescript
test('loja page loads and renders product cards from products.json')
test('product card click navigates to /produto/{slug}')
test('store is empty message shown when no products exist')
```

#### Flow 3: Product Detail + Add to Cart
```typescript
test('product detail page loads product data by slug')
test('carousel arrows navigate between images')
test('clicking image opens zoom modal')
test('add to cart without size shows error notification')
test('add to cart without color shows error notification')
test('selecting size and color then adding to cart increments cart count')
test('adding same item twice increments quantity to 2')
```

#### Flow 4: Cart Management
```typescript
test('cart icon shows item count badge after adding product')
test('opening cart modal shows added item with correct details')
test('removing item from cart updates count and modal')
test('empty cart hides count badge')
test('clicking Finalizar Compra navigates to /checkout')
```

#### Flow 5: Checkout
```typescript
test('checkout page shows order summary with items and total')
test('empty cart shows empty state message')
test('CEP field auto-fills street on valid CEP')
test('phone field formats to Brazilian mobile format')
test('submitting without required fields shows validation errors')
test('ENVIAR PEDIDO NO ZAP button opens wa.me deeplink')
```

#### Flow 6: Contact Form
```typescript
test('contact page renders form with nome, email, mensagem fields')
test('submitting valid form shows success alert and resets form')
test('submitting empty form triggers required validation')
```

#### Flow 7: Navigation and Explore Bar
```typescript
test('explore bar shows current percentage on each page')
test('visiting all 9 pages brings progress to 100%')
test('explore overlay appears once at 100% then does not appear again')
test('Voltar ao Menu links return to home main menu')
```

#### Flow 8: Media / Lightbox
```typescript
test('media page renders 34 lookbook images in grid')
test('clicking an image opens lightbox with high-res src')
test('Escape key closes lightbox')
test('clicking outside image closes lightbox')
```

---

## LocalStorage Keys Reference
The test suite must mock or clear these keys between tests:

| Key | Purpose | Format |
|---|---|---|
| `cart` | Shopping cart items | `JSON array of CartItem` |
| `kgc_products_v1` | Admin-edited products | `{ items: Product[] }` |
| `visitedPages` | Explore bar page tracking | `JSON array of string page IDs` |
| `kgc_explore_complete` | Flag: overlay shown once | `'true'` or absent |

Recommended test setup:
```typescript
beforeEach(() => {
  localStorage.clear();
});
```

---

## Critical Flows Priority

| Priority | Flow | Risk if Broken |
|---|---|---|
| P0 | Add to cart → Checkout → WhatsApp | Revenue-critical |
| P0 | Product loading (JSON + localStorage fallback) | Store visibility |
| P1 | Product detail: size/color selection | Cart integrity |
| P1 | CEP auto-fill on checkout | UX friction |
| P2 | Explore bar progress | Feature parity |
| P2 | Lightbox on media page | Feature parity |
| P3 | Contact form alert | Low stakes (no backend) |
| P3 | Click sounds | Cosmetic |
