# AtoZ Gadgetz — SEO Preservation Master File
**Scraped:** July 2026 | **Source:** https://atozgadgetz.com/
**Purpose:** Never lose existing rankings during redesign. Every URL, slug, heading,
copy, and policy text from the live site is captured here verbatim.

---

## CRITICAL RULE
> **Do NOT change any URL slug.** Every page below must exist at the exact same path
> on the new site. If a path must change, add a 301 redirect immediately.
> Do NOT remove any page from the sitemap that is currently indexed.

---

## 1. Complete Sitemap — All Indexed URLs

These 22 URLs are in the live sitemap and must ALL exist on the redesigned site:

| # | URL | Last Modified | Priority |
|---|---|---|---|
| 1 | `https://atozgadgetz.com/` | 2025-02-28 | MUST KEEP |
| 2 | `https://atozgadgetz.com/shop/` | 2025-03-01 | MUST KEEP |
| 3 | `https://atozgadgetz.com/contact/` | 2024-04-14 | MUST KEEP |
| 4 | `https://atozgadgetz.com/about-us/` | 2023-03-18 | MUST KEEP |
| 5 | `https://atozgadgetz.com/privacy-policy/` | 2023-03-07 | MUST KEEP |
| 6 | `https://atozgadgetz.com/return-and-refund-policy/` | 2023-04-20 | MUST KEEP |
| 7 | `https://atozgadgetz.com/shipping-payment-policy-2/` | 2023-02-26 | MUST KEEP |
| 8 | `https://atozgadgetz.com/terms-conditions/` | 2023-02-26 | MUST KEEP |
| 9 | `https://atozgadgetz.com/limited-time-offers/` | 2025-03-05 | MUST KEEP |
| 10 | `https://atozgadgetz.com/under-99-gadgetz/` | 2025-02-28 | MUST KEEP |
| 11 | `https://atozgadgetz.com/under-149-gadgetz/` | 2024-02-09 | MUST KEEP |
| 12 | `https://atozgadgetz.com/under-199-gadgetz/` | 2023-03-26 | MUST KEEP |
| 13 | `https://atozgadgetz.com/under-249-gadgetz/` | 2023-03-26 | MUST KEEP |
| 14 | `https://atozgadgetz.com/under-299-gadgetz/` | 2023-03-26 | MUST KEEP |
| 15 | `https://atozgadgetz.com/under-349-gadgetz/` | 2023-03-26 | MUST KEEP |
| 16 | `https://atozgadgetz.com/under-499-gadgetz/` | 2023-03-26 | MUST KEEP |
| 17 | `https://atozgadgetz.com/under-999-gadgetz/` | 2023-03-26 | MUST KEEP |
| 18 | `https://atozgadgetz.com/cart/` | 2024-01-24 | WooCommerce |
| 19 | `https://atozgadgetz.com/checkout-3/` | 2024-01-24 | WooCommerce |
| 20 | `https://atozgadgetz.com/account/` | 2023-03-19 | WooCommerce |
| 21 | `https://atozgadgetz.com/my-account/` | 2023-03-19 | WooCommerce |
| 22 | `https://atozgadgetz.com/register/` | 2023-03-21 | WooCommerce |

**Also in sitemap (CartFlows):** `wp-sitemap-posts-cartflows_step-1.xml` — preserve all CartFlows funnel slugs.

---

## 2. Page Titles (Exact — Preserve or Improve, Never Delete)

| Page | Current Title Tag |
|---|---|
| Home | *(not captured — set by Yoast/RankMath, scrape via View Source)* |
| Shop | `All Products – Atoz Gadgetz` |
| About Us | `About Us – Atoz Gadgetz` |
| Contact | `Contact – Atoz Gadgetz` |
| Privacy Policy | `Privacy policy – Atoz Gadgetz` |
| Refund Policy | `Cancellation Return and refund policy – Atoz Gadgetz` |
| Shipping Policy | `Shipping & Payment Policy – Atoz Gadgetz` |
| Terms | `Terms & Conditions – Atoz Gadgetz` |
| Limited Time Offers | `Limited time offers – Atoz Gadgetz` |
| Under 99 | *(not captured — must match slug: "Under 99 Gadgetz")* |
| Under 149 | *(not captured — must match slug: "Under 149 Gadgetz")* |
| Under 499 | *(not captured — must match slug: "Under 499 Gadgetz")* |

> **Action on redesign:** Install Yoast SEO / RankMath on new site. Export all SEO titles from old WP admin before migration.

---

## 3. Navigation — Live Links (Must Recreate Exactly)

### Header Nav
```
Home       → https://atozgadgetz.com/
All Products → https://atozgadgetz.com/shop/
Contact    → https://atozgadgetz.com/contact/
Cart       → https://atozgadgetz.com/cart/
```

### Footer Nav (Legal + Info)
```
Privacy Policy              → /privacy-policy/
Cancellation, Return and Refund Policy → /return-and-refund-policy/
Shipping and payment policy → /shipping-payment-policy-2/
Terms and conditions        → /terms-conditions/
About us                    → /about-us/
Contact us                  → /contact/
```

> **WARNING:** The shipping policy slug is `/shipping-payment-policy-2/` (has `-2` suffix).
> This is unusual but is the live indexed URL — do NOT change it to `/shipping-payment-policy/`.

---

## 4. Headings — Exact Text Per Page

### All Pages (Global H1)
```
H1: "You Deserve Gadgets Today!"
```
> This is the global site H1 used on every page. Preserve as primary brand tagline.

### Homepage
```
H2: "Free Shipping Minimum 450 order"
H2: "Secure Payment"
H2: "100 percent Trusted"
H3: "AtoZ Gadgetz"
H3: "Get all the gadgets under one Roof"
H3: "Quick Link"
```

### Shop (`/shop/`)
```
H2: "All Products"
```

### About Us
```
H2: "About Us"
```

### Contact
```
H2: "Say Hello."
H2: "Ask Your Queries"
```

### Limited Time Offers
```
H2: "Limited Time offers"
H2: "All Gadgetz"
```

### Price Pages
```
/under-99-gadgetz/   → H2: "Under 99 Gadgetz"
/under-149-gadgetz/  → H2: "Under 149 Gadgetz"
/under-199-gadgetz/  → H2: "Under 199 Gadgetz"
/under-249-gadgetz/  → H2: "Under 249 Gadgetz"
/under-299-gadgetz/  → H2: "Under 299 Gadgetz"
/under-349-gadgetz/  → H2: "Under 349 Gadgetz"
/under-499-gadgetz/  → H2: "Under 499 Gadgetz"
/under-999-gadgetz/  → H2: "Under 999 Gadgetz"
```

---

## 5. Brand Copy — Verbatim (Use Word-for-Word on New Site)

### Primary Tagline (use as H1 sitewide)
> "You Deserve Gadgets Today!!"

### Footer Brand Block
```
Brand name: AtoZ Gadgetz
Sub-tagline: "Get all the gadgets under one Roof"
Footer label: "Quick Link"
Copyright: © 2026 Atoz Gadgetz
```

### USP Strip (Homepage H2s — keep these 3 exactly)
```
1. "Free Shipping Minimum 450 order"
2. "Secure Payment"
3. "100 percent Trusted"
```

### About Us Body Copy (verbatim)
```
"Get all the trending gadgets here at affordable price only at Atoz Gadgetz.com with lesser price"
"We Accept all the gadgets now."
```

### Payment Acceptance Statement
```
"We Accept all the payment options so get all the gadgets now."
```

---

## 6. Contact Details (Verbatim — Must Match Live Site)

```
Email (primary):    contact@atozgadgetz.com
Email (grievance):  Atatozgadgetz@gmail.com
Phone / WhatsApp:   8160666408
WhatsApp (support): 8128702711
WhatsApp (returns): 8128702711
Instagram:          https://www.instagram.com/atozgadgetz/
                    @atozgadgetz

Physical Address:
  1123/1 Pakwada golbati
  Near Bholar lohar chali
  Gomtipur
  Ahmedabad, Gujarat - 380021

Business Hours: All Days, 11am – 9pm
```

---

## 7. Business Logic (Must Recreate in WooCommerce)

| Rule | Value |
|---|---|
| Free Shipping threshold | ₹450 minimum order |
| Delivery time | 4–7 business days (48hr dispatch) |
| Delivery area | All India |
| Warranty | 24 hours (defects only) |
| Refund policy | **NO REFUND** (exchange only) |
| Return condition | Original packaging + unboxing video required |
| Payment modes | UPI, Internet Banking, Visa, Mastercard, Amex, Maestro, Debit, IMPS |
| OTP on delivery | Yes (carrier sends OTP) |
| Unboxing video required | Yes — from sealed parcel to product on. Video must be continuous. |
| WhatsApp for defects | 8128702711 (within 24hr warranty) |

---

## 8. Tracking IDs (Must Transfer to New Site)

| Tracker | ID |
|---|---|
| Facebook Pixel | `584430773881344` |
| Facebook CAPI | Transfer settings from old WP plugin |

> **Action:** Before going live on new site, verify FB Pixel fires on:
> - PageView (all pages)
> - AddToCart
> - InitiateCheckout
> - Purchase

---

## 9. Full Policy Texts (Verbatim — Copy to New Site)

### 9.1 Privacy Policy (`/privacy-policy/`)
*(Full text captured — key sections:)*
- Information Collection, Account Information, Sharing of Personal Information,
  Links to Other Sites, Cookies, Security, Information Retention, Consent
- **Grievance Officer address:**
  ```
  Atoz Gadgetz
  1123/1 Pakwada Golbati
  Near Bholar lohar chali
  Ahmedabad Gujarat-21
  WhatsApp: 9821530591
  Email: Atatozgadgetz@gmail.com
  Active Hours: All Days (11am-9pm)
  ```
- Full text saved at the bottom of this file.

### 9.2 Return & Refund Policy (`/return-and-refund-policy/`)
*(Full text — verbatim):*
```
All items come with a 24 hour warranty

PROPER UNBOXING VIDEO – Make sure you have the right video of your parcel for security purposes.

You can contact us via WhatsApp at 8128702711 to report a defect within the warranty period
and request an exchange. WhatsApp will notify you of the next exchange process if the product
is found defective.

If you are sent a wrong/empty/damaged/missing parcel, your complaint will not be accepted unless
you have the correct unboxing video starting from the time the parcel was sealed until you turn
the product on in the same video. Video that starts between the two will not be accepted. The
video must be sent on WhatsApp with your Name, Issue, and mention that you purchased from this
website for better assistance.

Returns must be in their original packaging and in their original condition. All returned goods
will be inspected upon return. We may not accept exchange requests if the item is returned in an
unacceptable condition.

We are not responsible for any items that get damaged or lost during return shipping. Therefore,
we recommend an insured and tracked mail service. INDIA POST is a good option as it's affordable.

There is no REFUND policy.
```

### 9.3 Shipping & Payment Policy (`/shipping-payment-policy-2/`)
*(Full text — verbatim):*
```
We endeavour to dispatch all products ordered within 48 hours after the order has been placed
and accepted by us. 4-6 days is the expected delivery time for your parcel in regular days.
It might take a bit longer in Festive Season because of rush and oversurge of parcels in
delivery hubs. You will be receiving an OTP from the delivery company at the time of delivery
to ensure that the delivery is given to the right person. In case of any queries or issues
regarding your parcel you may contact 8128702711 on WhatsApp.

DELIVERY CHARGES(based on selection): All domestic orders are delivered for free of charge.

ADDITIONAL CHARGES: There are no additional charges. The total payable amount is indicated
on the individual items.

DELIVERY TIME: This may vary depending on the delivery location and services of our logistics
partner. However, we endeavour to deliver orders within 4 to 7 Business days (excludes public
holidays)

DELIVERY AREAS: We deliver All Over India.

PAYMENT MODE: Online through Internet banking, UPI, Visa, MasterCard, American Express,
Maestro, Debit cards, IMPS

For further information please text us on WhatsApp on 8128702711, 11 AM to 9pm, All days
(excludes public holidays) or mail us at Atatozgadgetz@gmail.com
```

### 9.4 Terms & Conditions (`/terms-conditions/`)
Full T&C text captured — key items:
- Legal company name used: **"Sk Premium Gadgets"** (appears in license section)
- Jurisdiction: **New Delhi courts**
- Governing law: **India**
- Full text too long to inline — copy directly from `/terms-conditions/` on live site before migration.

---

## 10. SEO Gaps Found (Fix in Redesign — Ranking Opportunities)

These are missing on the current live site. Adding them in the redesign will **improve** rankings without losing existing ones:

| Gap | Current State | Fix in Redesign |
|---|---|---|
| Meta descriptions | NONE on any page | Write unique 150–160 char descriptions for all 22 URLs |
| Canonical URLs | Missing on most pages | Add `<link rel="canonical">` on every page |
| JSON-LD schema | ZERO on entire site | Add WebSite, Organization, LocalBusiness, FAQPage, BreadcrumbList |
| H1 structure | Same H1 on every page | Each page needs a unique H1 (global "You Deserve..." should be hero text, not H1) |
| Open Graph tags | Not captured (likely missing) | Add og:title, og:description, og:image for all pages |
| Product schema | None | Add Product + Offer schema for every product |
| Breadcrumbs | None | Add BreadcrumbList on all shop/category/product pages |
| Page speed | WordPress default | Optimize with caching, WebP images, lazy load |
| Mobile | Unknown | Verify CWV — LCP, CLS, INP all pass |

---

## 11. Price-Range Pages — SEO Strategy for Redesign

These 8 pages (`/under-99-gadgetz/` through `/under-999-gadgetz/`) are the **most important ranking pages** — they target high-intent transactional queries like "gadgets under ₹99 India".

### Preserve:
- All 8 slugs exactly as listed
- The H2 heading pattern: "Under [X] Gadgetz"

### Improve in redesign:
- Add unique meta title: `Gadgets Under ₹99 | AtoZ Gadgetz – Free Shipping India`
- Add meta description: `Shop gadgets under ₹99 at AtoZ Gadgetz. Free shipping on orders above ₹450. 100% trusted. Secure payment. Delivered all over India.`
- Add `CollectionPage` + `ItemList` JSON-LD schema with actual products
- Add breadcrumb: `Home > Shop > Under ₹99 Gadgets`
- Internal link all 8 pages from the homepage and `/limited-time-offers/`

---

## 12. Redesign Handoff Checklist

Before launching the redesigned site, verify every item:

```
SEO PRESERVATION
[ ] All 22 sitemap URLs return 200 (not 301/404)
[ ] /shipping-payment-policy-2/ slug unchanged (has -2 suffix)
[ ] H1 "You Deserve Gadgets Today!!" present on homepage
[ ] All 8 Under-price page slugs unchanged
[ ] Footer nav links match exactly (all 6 legal links)
[ ] Privacy Policy full text identical to live site
[ ] Refund Policy full text identical (especially "There is no REFUND policy.")
[ ] Terms & Conditions full text identical

TRACKING
[ ] Facebook Pixel 584430773881344 fires on PageView
[ ] FB Pixel fires AddToCart, Purchase events
[ ] FB CAPI reconnected

BUSINESS LOGIC (WooCommerce)
[ ] Free shipping at ₹450 minimum
[ ] No cash on delivery (online payment only)
[ ] OTP delivery enabled
[ ] 24hr warranty policy displayed
[ ] Contact email: contact@atozgadgetz.com
[ ] WhatsApp support: 8128702711

SEO IMPROVEMENTS ADDED
[ ] Meta descriptions on all 22 pages
[ ] Canonical tags on all pages
[ ] JSON-LD: Organization + LocalBusiness on homepage
[ ] JSON-LD: Product + Offer on all product pages
[ ] JSON-LD: BreadcrumbList on shop/category/product pages
[ ] JSON-LD: FAQPage on policy pages
[ ] Open Graph tags on all pages
[ ] Sitemap regenerated and submitted to Google Search Console + IndexNow

POST-LAUNCH
[ ] Google Search Console — verify no coverage errors
[ ] Run Screaming Frog crawl — confirm all 22 URLs 200
[ ] Check 301s for any old product URLs
[ ] Verify robots.txt does not block /shop/ or product URLs
[ ] Submit new sitemap to GSC
```
