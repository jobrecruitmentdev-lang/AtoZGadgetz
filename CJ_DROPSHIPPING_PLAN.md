# CJDropshipping End-to-End Architecture Plan
## AtoZGadgets — Products → Payments → Delivery

> Last updated: 2026-07-15

---

## Overview

This document describes how to wire CJDropshipping into the existing AtoZGadgets stack
(Node.js backend + Next.js frontend) covering the full lifecycle:
product import → storefront listing → checkout → payment → CJ order placement → shipment tracking.

---

## Strategic Context

### Phase 1 → Phase 2 Roadmap

```
Phase 1 (Now):   CJDropshipping as fulfilment supplier
                 → No warehouse, no upfront stock, fast to market

Phase 2 (Later): Own inventory in own warehouse
                 → Better margins, faster delivery, brand control
```

**Core principle:** All CJ-specific data lives in **additive new tables/columns only**.
Existing `Product`, `Order`, `Shipment` tables are **not structurally altered** — we only add
nullable foreign keys pointing to new CJ tables. Switching to own inventory = flip `fulfillment_type`
flag and stop calling CJ APIs. No schema migration needed at that point.

---

## International Payment Strategy

### Payment Gateway Comparison (Razorpay vs Cashfree vs Stripe vs PayPal vs Payoneer)
Choosing a gateway balances **Fees** against **Checkout Reliability / Card Acceptance**.

| Gateway | Best For | Fees (International) | Reliability / Conversion | Pros / Cons |
|---|---|---|---|---|
| **Razorpay / Cashfree** | Indian Market / Startups | ~3% + 18% GST | Medium (US/EU banks often decline) | **Pro:** Lowest fees, auto FIRA compliance. **Con:** High international card decline rate. |
| **Stripe** | Global Dropshipping | ~4.3% + 2% FX markup | **Highest** (Global trust) | **Pro:** Best conversion rates, Apple/Google Pay. **Con:** High fees, Invite-Only in India (requires IEC). |
| **PayPal** | Global Backup | ~4.4% + ~4% FX markup | Very High | **Pro:** Widely trusted alternative to credit cards. **Con:** Extremely expensive (~8.4% total). |
| **Payoneer** | B2B / Freelancers | 1% to 2% | N/A (Not an e-commerce checkout) | **Pro:** Great for B2B. **Con:** Cannot be used as a customer checkout gateway. |

### Strategic Implementation: Dual Gateway (Option B)
Since Stripe is strictly invite-only and requires significant compliance, the most accessible stack for an Indian dropshipping business is:
- **Razorpay/Cashfree:** Primary card processor for both domestic and international.
- **PayPal:** Essential fallback for international buyers whose cards get blocked by Razorpay.

**Implementation:** Route by detected customer country at checkout:
- `IN` → Razorpay
- Everything else → Razorpay (Cards) + PayPal (Wallet)

Both settle to your Indian bank account. CJ Wallet topped up separately via PayPal/Payoneer.

### Add to `.env`
```
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

---

## 1. CJDropshipping API Credentials

Add to backend `.env`:
```
CJ_API_KEY=your_cj_api_key
CJ_API_EMAIL=your_cj_account_email
CJ_API_BASE_URL=https://developers.cjdropshipping.com/api2.0/v1
```

CJ API uses email + API key to get an access token (valid 24h). Store it in memory/Redis and refresh automatically.

---

## 2. Database Schema — Additive Only (No Existing Table Changes)

### Design Principle
**Never alter existing `Product`, `Order`, `Shipment` tables structurally.**
All CJ data lives in new dedicated tables. Existing tables only gain a nullable FK pointer.
When Phase 2 (own inventory) starts, set `fulfillment_type = "own"` — zero migration needed.

### New tables to add in `prisma/schema.prisma`

```prisma
// NEW: fulfillment metadata lives here, not on Product/Order
model CjProduct {
  id              String   @id @default(uuid())
  cj_pid          String   @unique    // CJ product ID
  cj_vid          String?             // CJ variant ID (per variant)
  supplier_price  Decimal             // CJ's cost price to us
  last_synced_at  DateTime @updatedAt

  // Back-reference to our Product (nullable — future own products have no CjProduct)
  product         Product? @relation(fields: [product_id], references: [id])
  product_id      String?  @unique
}

model CjOrder {
  id            String   @id @default(uuid())
  cj_order_id   String   @unique    // CJ's internal order number
  cj_status     String              // CJ order stage
  placed_at     DateTime @default(now())

  order         Order    @relation(fields: [order_id], references: [id])
  order_id      String   @unique
}

model CjShipment {
  id              String   @id @default(uuid())
  cj_tracking_id  String?
  carrier_name    String?            // CJPacket, DHL, PostNL, etc.
  tracking_url    String?
  cj_status       String?

  shipment        Shipment @relation(fields: [shipment_id], references: [id])
  shipment_id     String   @unique
}
```

### Minimal additions to existing tables (nullable FKs only)

```prisma
model Product {
  // ...all existing fields unchanged...
  fulfillment_type  String   @default("cj")  // "cj" | "own" — phase switch flag
  cj_product        CjProduct?               // null when fulfillment_type = "own"
}

model Order {
  // ...all existing fields unchanged...
  cj_order          CjOrder?                 // null when fulfillment_type = "own"
}

model Shipment {
  // ...all existing fields unchanged...
  cj_shipment       CjShipment?              // null when fulfillment_type = "own"
}
```

### Migration
```bash
npx prisma migrate dev --name add_cj_tables
```

### Phase 2 Switch (Own Inventory)
When moving to own stock for a product:
1. Set `Product.fulfillment_type = "own"`
2. Stop calling CJ APIs for that product's orders
3. `CjProduct`, `CjOrder`, `CjShipment` records for old orders remain as history
4. No schema changes, no data loss

---

## 3. Backend — New Service Layer

### File structure to create
```
src/
  services/
    cj/
      cj-auth.service.ts       ← token management (24h cache)
      cj-product.service.ts    ← product search + import → writes CjProduct table
      cj-order.service.ts      ← place order on CJ → writes CjOrder table
      cj-shipment.service.ts   ← tracking sync → writes CjShipment table
    payment/
      razorpay.service.ts      ← Indian customers (UPI, cards, Net Banking)
      stripe.service.ts        ← international customers (cards, Apple Pay, Klarna)
  routes/
    cj.routes.ts               ← admin-only CJ management + /api/cj/webhook
    payment.routes.ts          ← /create-order, /razorpay/verify, /stripe/webhook
  controllers/
    cj.controller.ts
    payment.controller.ts      ← gateway routing logic by country
```

### 3a. CJ Auth Service (`cj-auth.service.ts`)
```ts
// GET /v1/authentication/getAccessToken
// POST body: { email, accessKey }
// Returns: { accessToken, expiresIn }
// Cache token in memory, refresh when expired
```

### 3b. CJ Product Service (`cj-product.service.ts`)

**Search products:**
```
GET /v1/product/list?categoryKeyword=gadget&pageNum=1&pageSize=20
```

**Get product detail (variants, images, price):**
```
GET /v1/product/query?pid=CJ_PRODUCT_ID
```

**Import to local DB:**
```ts
async importProduct(cjPid: string) {
  const cjProduct = await this.getProductDetail(cjPid)
  // Map CJ fields → Prisma Product + ProductVariant + ProductImage
  // Set is_dropship = true, cj_product_id = cjPid
  // Set supplier_price from CJ, selling_price = supplier_price * markup
}
```

### 3c. CJ Order Service (`cj-order.service.ts`)

Called **after payment is confirmed**:

```ts
async placeCJOrder(orderId: string) {
  const order = await prisma.order.findUnique({ include: { items: true, user: true } })

  // Build CJ order payload
  const cjPayload = {
    orderNumber: order.id,
    shippingZip: order.shipping_zip,
    shippingCountryCode: "IN",
    shippingPhone: order.user.phone,
    shippingCustomerName: order.user.name,
    shippingAddress: order.shipping_address,
    products: order.items.map(item => ({
      vid: item.variant.cj_variant_id,
      quantity: item.quantity
    }))
  }

  // POST /v1/shopping/order/createOrder
  const cjResponse = await cjApi.post('/shopping/order/createOrder', cjPayload)

  // Save CJ order ID
  await prisma.order.update({
    where: { id: orderId },
    data: { cj_order_id: cjResponse.data.orderId }
  })
}
```

### 3d. CJ Shipment Service (`cj-shipment.service.ts`)

**Poll tracking (run via cron every 6 hours):**
```ts
async syncShipments() {
  // GET /v1/logistic/order/list?orderNum=CJ_ORDER_ID
  // Update Shipment.tracking_number, carrier_name, status, tracking_url
  // If status === "delivered" → update Order.status = "Delivered"
}
```

---

## 4. Payment Gateway Integration (Dual: Razorpay + Stripe)

Payment confirmed **before** CJ order placement. Gateway chosen by customer country at checkout.

### Files to modify
- `src/services/payment/razorpay.service.ts` — Razorpay SDK (Indian customers)
- `src/services/payment/stripe.service.ts` — Stripe SDK (international customers)
- `src/routes/payment.routes.ts` — unified verify + webhook endpoints

### Razorpay Flow (India — `countryCode === "IN"`)
```
Frontend: Razorpay checkout JS widget
    ↓ success → razorpay_payment_id, razorpay_order_id, razorpay_signature
    ↓
Backend: POST /api/payment/razorpay/verify
    → HMAC verify (razorpay_order_id + "|" + razorpay_payment_id)
    → Payment.status = "paid" → Order.status = "Confirmed"
    → cjOrderService.placeCJOrder(orderId)
```

### Stripe Flow (International)
```
Frontend: Stripe Payment Element (supports Apple Pay, Google Pay, cards, Klarna)
    ↓ success → payment_intent_id
    ↓
Backend: POST /api/payment/stripe/verify  OR  Stripe webhook → /api/payment/stripe/webhook
    → verify PaymentIntent status = "succeeded"
    → Payment.status = "paid" → Order.status = "Confirmed"
    → cjOrderService.placeCJOrder(orderId)
```

### Gateway routing logic (frontend checkout)
```ts
const gateway = userCountry === "IN" ? "razorpay" : "stripe"
// POST /api/payment/create-order { gateway, amount, currency, orderId }
// Backend returns { razorpay_order_id } or { stripe_client_secret }
```

### CJ Wallet top-up (separate, manual for now)
CJ doesn't accept Razorpay/Stripe directly. Fund CJ Wallet via PayPal or Payoneer from dashboard.
Enable auto-debit on CJ so orders submit automatically once wallet has balance.

---

## 5. Frontend Changes

### 5a. Admin — CJ Product Import Page
**New route:** `app/(admin)/admin/catalog/import/page.tsx`

```
Search bar → hits GET /api/cj/products?keyword=xxx
Results grid → each card has "Import" button
Import → POST /api/cj/products/import { cjPid }
Success → product appears in /admin/catalog/products
```

### 5b. Checkout — Razorpay Integration
**Modify:** `app/(storefront)/checkout/page.tsx`

```ts
// 1. POST /api/payment/create-order → get razorpay_order_id
// 2. Open Razorpay modal with key_id + amount + order_id
// 3. On success callback → POST /api/payment/verify with signature
// 4. On verification success → redirect to /order-success
```

### 5c. Order Tracking Page
**New route:** `app/(storefront)/account/orders/[id]/tracking/page.tsx`

```
GET /api/order/:id → shows Order + Shipment
Display: carrier, tracking number, live status, tracking URL link
```

---

## 6. End-to-End Flow Summary

```
[ADMIN] Search CJDropshipping catalog
    → Import product → Product (fulfillment_type="cj") + CjProduct record
    → Set selling price (supplier_price × markup)
    → Publish product to storefront

[CUSTOMER] Browse storefront → Add to cart → Checkout
    → Backend detects country → routes to Razorpay (IN) or Stripe (international)
    → Payment confirmed → Order.status = "Confirmed"

[BACKEND — auto] CJ order placement (triggered by payment webhook)
    → POST to CJ API with CjProduct.cj_vid + quantity + shipping address
    → CjOrder record created (cj_order_id saved)
    → CJ fulfils from their warehouse (50+ worldwide)

[BACKEND — real-time] CJ webhook → POST /api/cj/webhook
    → Update CjShipment: carrier, tracking_url, status
    → Notify customer on "Shipped" event

[CUSTOMER] View tracking in /account/orders/[id]/tracking
    → Shows CjShipment data (carrier, tracking number, live status)

--- Phase 2 (own inventory) ---
[ADMIN] Set Product.fulfillment_type = "own" per product
    → Same Order/Shipment flow, CJ services bypassed
    → CjProduct/CjOrder/CjShipment history preserved for analytics
```

---

## 7. Implementation Order (Priority)

| # | Task | Files | Notes |
|---|---|---|---|
| 1 | Prisma: add CjProduct, CjOrder, CjShipment tables + FK fields | `prisma/schema.prisma` | Additive only |
| 2 | CJ auth token service | `src/services/cj/cj-auth.service.ts` | Cache token 24h |
| 3 | CJ product search + import | `src/services/cj/cj-product.service.ts` | Writes to CjProduct, links to Product |
| 4 | Razorpay payment verify (Indian customers) | `src/services/payment/razorpay.service.ts` | HMAC verify |
| 5 | Stripe payment verify (international customers) | `src/services/payment/stripe.service.ts` | PaymentIntent + webhook |
| 6 | Gateway router at checkout | `src/controllers/payment.controller.ts` | Route by country |
| 7 | CJ order placement (post-payment) | `src/services/cj/cj-order.service.ts` | Writes to CjOrder |
| 8 | Shipment tracking via CJ webhooks | `src/services/cj/cj-shipment.service.ts` | Writes to CjShipment; add `POST /api/cj/webhook` |
| 9 | Frontend: admin CJ product import UI | `app/(admin)/admin/catalog/import/` | — |
| 10 | Frontend: dual gateway checkout | `app/(storefront)/checkout/page.tsx` | Auto-detect country |
| 11 | Frontend: order tracking page | `app/(storefront)/account/orders/[id]/tracking/` | — |

### Phase 2 Checklist (Own Inventory — future)
- [ ] Add warehouse/stock management tables (additive)
- [ ] Set `Product.fulfillment_type = "own"` per product
- [ ] New fulfilment service that doesn't call CJ APIs
- [ ] CJ history data untouched — full audit trail preserved

---

## 8. Complete CJDropshipping API Reference

Base URL: `https://developers.cjdropshipping.com/api2.0/v1`
Docs: https://developers.cjdropshipping.cn/en/api/introduction.html

> **Rate limits:** 1,000 requests/day (free tier) · 1 IP max 3 users · Token valid 24h

---

### Authentication

| Purpose | Method | Endpoint |
|---|---|---|
| Get access token | POST | `/authentication/getAccessToken` |

**Body:** `{ email, accessKey }` → returns `{ accessToken, expiresIn }`
Cache the token in memory and refresh before expiry. All subsequent requests need `CJ-Access-Token` header.

---

### Product APIs

| Purpose | Method | Endpoint | Key Params |
|---|---|---|---|
| Search products (v2, Elasticsearch) | GET | `/product/listV2` | `keyWord`, `page`, `size`, `minPrice`, `maxPrice`, `categoryId`, `countryCode` |
| Product detail + images | GET | `/product/query` | `pid` |
| Query variant by vid | GET | `/product/variant/queryByVid` | `vid` |
| List product categories | GET | `/product/getCategory` | — |
| Bind CJ variant to your SKU | POST | `/product/conn/connection` | platform variant id + CJ vid |
| Get inventory by variant | GET | `/product/variant/queryByVid` | returns `totalStock`, `cjStock`, `factoryStock` per warehouse country |

**Inventory response includes:**
- `variantSellPrice` — CJ's price to you
- Stock levels split by: CJ warehouse, factory, verified overseas warehouse (US, EU, etc.)

---

### Order APIs (Outbound)

| Purpose | Method | Endpoint |
|---|---|---|
| Create order | POST | `/shopping/order/createOrder` |
| Submit order for fulfilment | POST | `/shopping/order/submitOrder` |
| Poll order creation progress | GET | `/shopping/order/progress` |
| Get order detail | GET | `/shopping/order/getOrderDetail` |
| Cancel order (unpaid only) | POST | `/shopping/order/cancelOrder` |
| Query address candidates | GET | `/shopping/order/address/list` |

**Create order body includes:**
```json
{
  "orderNumber": "your_internal_order_id",
  "shippingCountryCode": "IN",
  "shippingAddress": "...",
  "shippingZip": "...",
  "shippingPhone": "...",
  "shippingCustomerName": "...",
  "products": [{ "vid": "CJ_VARIANT_ID", "quantity": 2 }],
  "shippingLine": "CJPacket"
}
```

**Order goes through stages:** Created → Submitted → In Production → Shipped → Delivered

---

### Logistics & Tracking APIs

| Purpose | Method | Endpoint |
|---|---|---|
| Get available shipping methods | GET | `/logistic/freightCalculate` |
| Get tracking info by CJ order | GET | `/logistic/order/list` |
| Get tracking by tracking number | GET | `/logistic/track/query` |

**Supported carriers via CJ:** CJPacket, YunExpress, 4PX, USPS, DHL, PostNL
**Delivery estimate:** 7–15 days worldwide, 5–10 days to US

**Tracking response includes:** `trackingNumber`, `carrierName`, `trackingUrl`, `status`, `lastEvent`, `estimatedDelivery`

---

### Warehouse APIs

| Purpose | Method | Endpoint |
|---|---|---|
| List CJ warehouses | GET | `/logistic/warehouse/list` |
| Query private inventory | GET | `/shopping/order/product/query` |

**50+ warehouses globally** — US, EU, CN, and other regions.
Private inventory (your own stock in CJ warehouse) supported via separate endpoints.

---

### Finance / Wallet APIs

| Purpose | Method | Endpoint |
|---|---|---|
| Get wallet balance | GET | `/finance/wallet/getBalance` |
| Top up wallet | — | Via CJ dashboard (no API) |

**Payment methods accepted by CJ:** PayPal, Payoneer, Credit Card, CJ Wallet
Pre-authorization supported: charge wallet automatically on order submission (no manual approval needed).

> For AtoZGadgets: top up CJ Wallet via dashboard → enable auto-pay → orders submitted automatically after customer payment clears Razorpay.

---

### Webhooks

CJ supports webhooks for:
- Order status changes (Submitted / In Production / Shipped / Delivered / Cancelled)
- Shipment tracking updates
- Inventory level changes

**Setup:** Register webhook URL in CJ developer dashboard → CJ POSTs to your endpoint on each event.

Recommended webhook endpoint to add to backend:
```
POST /api/cj/webhook
  → verify CJ signature header
  → update Order.status, Shipment.tracking_number, Shipment.status
  → push notification to customer
```

This replaces the polling cron (Section 3d) with real-time push updates.

---

### Sandbox / Testing

CJ provides a sandbox environment for testing order creation without real fulfilment.
Configure via `CJ_API_BASE_URL=https://sandbox-developers.cjdropshipping.com/api2.0/v1` in `.env`.
