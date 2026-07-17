# AtoZ Gadgetz — International Expansion Reference
**Added:** July 2026 | Targets US/Global market via CJDropshipping

---

## Strategy (from international_target.txt)

Target: US market (Best Buy–style full catalog)

**Top-demand categories:**
Electronics & Accessories, Home & Kitchen, Beauty & Skincare, Pet Products,
Fitness Equipment, Office & WFH, Automotive, Baby, Toys & Games, Garden

**Trust signals US buyers need:**
SSL (HTTPS), clear shipping times, easy returns, contact page, about us,
customer reviews, FAQs, secure payment badges, product high-quality images

---

## International Category Tree (implemented in Header megamenu)

```
Electronics         → /category/electronics
  Mobile Accessories, Laptop Accessories, Smart Home, Audio, Cameras,
  Gaming, Power Banks, Smartwatches, Chargers & Cables

Home & Kitchen      → /category/home-kitchen
  Kitchen Gadgets, Air Fryers, Blenders, Coffee Accessories,
  Storage, Cleaning, Home Decor, Lighting, Bathroom

Beauty              → /category/beauty
  Skin Care, Hair Care, Grooming, Makeup, Nail Care, Beauty Tools, Wellness

Health & Sports     → /category/health
  Fitness Equipment, Supplements, Massage, Yoga, Health Monitors,
  Cycling, Camping, Travel Gear

Automotive          → /category/automotive
Pet Supplies        → /category/pet-supplies
Office              → /category/office
Fashion             → /category/fashion
Baby                → /category/baby
Toys & Games        → /category/toys-games
Garden              → /category/garden
Seasonal            → /category/seasonal
```

---

## Price Pages — India (₹) + International ($) Mapping

| Route (preserved) | India price | US equiv |
|---|---|---|
| /under-99-gadgetz/ | ₹99 | ~$1.20 / "Under $10" |
| /under-149-gadgetz/ | ₹149 | ~$1.80 |
| /under-199-gadgetz/ | ₹199 | ~$2.40 / "Under $20" |
| /under-249-gadgetz/ | ₹249 | ~$3 |
| /under-299-gadgetz/ | ₹299 | ~$3.60 |
| /under-349-gadgetz/ | ₹349 | ~$4.20 |
| /under-499-gadgetz/ | ₹499 | ~$6 / "Under $50" |
| /under-999-gadgetz/ | ₹999 | ~$12 / "Under $100" |

**Rule:** All 8 slugs are preserved unchanged. Both price systems
displayed so India SEO is not lost and international buyers understand.

---

## Keyword Strategy (from international_target.txt)

Target combinations:
Product + Brand + Model + Feature + Material + Color + Price + Use Case + Audience + Occasion + Location

Content clusters per category (build these as blog/guide pages):
- Best [Category] Gadgets
- [Category] Gadgets Under $X
- Best [Product Type]
- [Product A] vs [Product B]
- How to Choose a [Product]
- Gift Guides (Christmas, Valentine's, Mother's Day)
- Seasonal pages (Black Friday, Halloween)

---

## Payment Gateway (implemented)

| Customer location | Gateway | Currency |
|---|---|---|
| India (IN) | Razorpay | INR |
| International | Razorpay (cards) | USD |

**Razorpay Env Vars:**
```
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
```

Frontend: Razorpay.js loaded at checkout, modal opens on "Pay" click.
Backend verifies HMAC signature → places CJ order automatically.

---

## CJDropshipping Integration Status

| Component | Status |
|---|---|
| `cj-auth.service.ts` | Done — token cache, 24h refresh |
| `cj-product.service.ts` | Done — search + import |
| `cj-order.service.ts` | Done — create + submit + cancel |
| `cj-shipment.service.ts` | Done — sync + webhook handler |
| `cj.controller.ts` | Done |
| `cj.routes.ts` | Done — mounted at /api/cj |
| Admin import UI | Done — /admin/catalog/import |
| Order tracking page | Done — /account/orders/[id]/tracking |
| CJ webhook endpoint | Done — POST /api/cj/webhook |

**CJ Env Vars:**
```
CJ_API_EMAIL=your_cj_email
CJ_API_KEY=your_cj_api_key
CJ_API_BASE_URL=https://developers.cjdropshipping.com/api2.0/v1
```

---

## Frontend International Changes

| File | Change |
|---|---|
| `Header.tsx` | Megamenu with 13 categories + Deals dropdown for price ranges |
| `app/(storefront)/page.tsx` | Full international homepage: hero, 13-category grid, price sections, trust signals, JSON-LD |
| `Footer.tsx` | International footer: all 6 legal links preserved + international categories + payment badges |
| `checkout/page.tsx` | Razorpay integration, international address form with country selector |
| `category/[slug]/page.tsx` | SEO metadata per category + breadcrumb JSON-LD |
| `account/orders/[id]/tracking/page.tsx` | Live tracking from CjShipment |
| `app/layout.tsx` | International metadata, en_US locale |

---

## Shipment Tracking Flow

```
Customer places order → Razorpay payment confirmed
  → backend: POST /api/payment/razorpay/verify
  → CjOrderService.placeOrder() called automatically
  → CJ fulfils from warehouse (50+ global)
  → CJ webhook → POST /api/cj/webhook → CjShipmentService.handleWebhook()
  → CjShipment record updated (tracking number, carrier, URL, status)
  → Customer sees tracking at /account/orders/[id]/tracking
  → Live carrier URL shown in tracking page
```

Estimated delivery: 7–15 business days worldwide, 5–10 days to US.

---

## Checklist Before Going International Live

```
BACKEND
[ ] Add CJ_API_EMAIL + CJ_API_KEY to .env
[ ] Add RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET to .env
[ ] Register CJ webhook: POST /api/cj/webhook in CJ developer dashboard
[ ] Run: npx prisma migrate dev --name add_cj_tables (if not done)
[ ] Test CJ product search + import via admin panel
[ ] Test Razorpay payment in sandbox mode

FRONTEND
[ ] Add NEXT_PUBLIC_RAZORPAY_KEY_ID to .env.local (for display only)
[ ] Verify Razorpay.js loads on checkout page
[ ] Test full checkout flow end-to-end
[ ] Verify category pages load correctly
[ ] Verify tracking page shows shipment data

SEO
[ ] All 22 India URLs still return 200
[ ] New category pages return 200
[ ] JSON-LD on homepage validates (Schema Markup Validator)
[ ] Meta descriptions present on all pages
[ ] Submit updated sitemap to Google Search Console
```
