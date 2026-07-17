---
name: atozgadgetz-redesign
description: |
  Full redesign skill for atozgadgetz.com — a WooCommerce gadget store.
  Contains all live SEO data scraped from the site (URLs, headings, copy,
  policies, contact details, tracking IDs, business logic).
  Use this skill whenever touching the AtoZ Gadgetz site so rankings are
  never lost and brand copy is never changed incorrectly.
  All verbatim page content, slugs, and policies are in SEO_PRESERVATION.md.
tools: [Read, Write, Bash, WebFetch]
---

# AtoZ Gadgetz Website Redesign Skill

## FIRST — Always Read SEO_PRESERVATION.md
Before making any change to the site, read `SEO_PRESERVATION.md` in this folder.
It contains every live URL, heading, policy text, contact number, and tracking ID
scraped from the live site in July 2026. Nothing in that file should be deleted
or altered on the new site without a 301 redirect in place.

---

## Site Facts

| Property | Value |
|---|---|
| Domain | https://atozgadgetz.com/ |
| Platform | WordPress + WooCommerce (legacy) → Next.js + Express (current rebuild) |
| Brand name | AtoZ Gadgetz / Atoz Gadgetz |
| Legal entity |Premium Gadgets with AtoZ|
| Primary tagline | "You Deserve Gadgets Today!!" |
| Sub-tagline | "Get all the gadgets under one Roof" |
| Location | Ahmedabad, Gujarat, India |
| Contact email | contact@atozgadgetz.com — the **only** customer-facing contact channel now |
| Instagram | @atozgadgetzofficial — `https://www.instagram.com/atozgadgetzofficial/` |
| FB Pixel ID | 584430773881344 |
| Brand colour | WooCommerce price text: `#0D743B` (green) |
| Exchange window | 7 days (was "30-Day Exchange" pre-2026-07-16) |
| Delivery estimate | "10–15 days (as fast as possible for our beloved customers)" — the standard copy across the site |

### 2026-07-16 rebrand decision — do not reintroduce these

The user explicitly removed the following from every customer-facing surface. Do not
add them back even if the SEO_PRESERVATION.md scrape below still shows them — that
file is a historical record of the *old* WordPress site, not a spec for the current
one:
- **No WhatsApp anywhere** (was 8128702711 and 8160666408, and a third number
  9821530591 on the privacy policy grievance-officer block). Email
  (`contact@atozgadgetz.com`) is the sole contact method now.
- **No physical address anywhere** (was "1123/1 Pakwada Golbati, Gomtipur,
  Ahmedabad, Gujarat 380021"). This includes the JSON-LD Organization schema's
  `address` field and the privacy-policy Grievance Officer block — **flag to the
  user if a Grievance Officer disclosure without an address may not satisfy India's
  IT Act 2000 requirements**; that's a legal call, not ours to make silently.
- **Never display "CJDropshipping" / "CJ Dropshipping"** anywhere a customer can
  see it — not in Footer copy, homepage copy, or the CJ live-catalog browse
  component's loading/error/empty-state text. Internal/admin surfaces (the admin
  catalog import tool) and backend code identifiers are fine to keep as-is.
- Logo: the source file `public/brand/atoz-logo.png` is a full lockup (icon +
  "ATOZGADGETZ" wordmark stacked vertically, 1254×1254). Never pass that whole
  file into a `rounded-full`/circular frame — it clips the wordmark and the icon
  edges. Use the pre-cropped `public/brand/atoz-icon.png` (644×644, just the
  circular icon mark, tightly centered) for every circular logo placement
  instead. If the source lockup ever changes, recrop with the same approach:
  find the icon's pixel bounding box (excluding the wordmark), add symmetric
  padding, verify the crop bottom stays above the wordmark's top edge.

---

## 1. The Golden Rule — URL Preservation

**Never change a slug. Never.** Every one of these 22 URLs is indexed.
If a URL must move, add a 301 redirect the same day.

```
/                           ← homepage
/shop/                      ← all products
/contact/
/about-us/
/privacy-policy/
/return-and-refund-policy/
/shipping-payment-policy-2/ ← NOTE: has "-2" suffix — do NOT rename
/terms-conditions/
/limited-time-offers/
/under-99-gadgetz/          ← high-intent ranking page
/under-149-gadgetz/
/under-199-gadgetz/
/under-249-gadgetz/
/under-299-gadgetz/
/under-349-gadgetz/
/under-499-gadgetz/
/under-999-gadgetz/
/cart/
/checkout-3/
/account/
/my-account/
/register/
```

---

## 2. Pre-Redesign Checklist (Do Before Touching Anything)

- [ ] Export Yoast/RankMath SEO data (titles + descriptions for all pages)
- [ ] Download all media from WP Media Library (logo, favicon, product images, banners)
- [ ] Export WooCommerce product CSV (all products, prices, SKUs, images)
- [ ] Export CartFlows funnel steps (slugs captured in `wp-sitemap-posts-cartflows_step-1.xml`)
- [ ] Screenshot all existing pages for visual reference
- [ ] Note Facebook Pixel ID: `584430773881344`
- [ ] Export Contact Form 7 configurations
- [ ] Export WooCommerce shipping rules (free shipping at ₹450)
- [ ] Export WooCommerce payment gateway settings
- [ ] Run Screaming Frog crawl → save as baseline CSV

---

## 3. Brand Copy Rules

### Always Preserve (Word-for-Word)
```
Primary H1/tagline:  "You Deserve Gadgets Today!!"
Footer brand:        "AtoZ Gadgetz"
Footer sub:          "Get all the gadgets under one Roof"
USP 1:               "Free Shipping Minimum 450 order"
USP 2:               "Secure Payment"
USP 3:               "100 percent Trusted"
Payment copy:        "We Accept all the payment options so get all the gadgets now."
```

### Policy Copy
All policy texts are saved verbatim in `SEO_PRESERVATION.md` Section 9.
Copy them directly — do not paraphrase. The refund policy must retain:
> "There is no REFUND policy."

---

## 4. Heading Structure Per Page

Every page currently uses the same H1 globally. In the redesign, fix this:
- Global hero text "You Deserve Gadgets Today!!" → make it `<p>` or hero copy, NOT `<h1>`
- Each page gets its own unique `<h1>` (see below)

| Page | New H1 (redesign) | Preserve H2 |
|---|---|---|
| Home | "AtoZ Gadgetz — Gadgets Under One Roof" | Free Shipping / Secure Payment / 100% Trusted |
| Shop | "All Products" | Category filters |
| Under ₹99 | "Gadgets Under ₹99" | "Under 99 Gadgetz" (keep as section H2) |
| Under ₹149 | "Gadgets Under ₹149" | "Under 149 Gadgetz" |
| Limited Offers | "Limited Time Offers" | "All Gadgetz" |
| About Us | "About Us" | — |
| Contact | "Contact AtoZ Gadgetz" | "Say Hello." / "Ask Your Queries" |

---

## 5. SEO Improvements to Add in Redesign

The live site has **zero meta descriptions, zero JSON-LD, zero canonical tags**.
Adding these will only improve rankings — they cannot hurt existing ones.

### Meta Descriptions (Write for Each Page)

```
Homepage:
"Shop trending gadgets at AtoZ Gadgetz — free shipping on orders above ₹450.
Gadgets under ₹99, ₹149, ₹499 and more. 100% trusted. Delivered all over India."

Shop:
"Browse all products at AtoZ Gadgetz. Affordable gadgets with free shipping above
₹450. Secure online payment. Delivered pan-India in 4–7 business days."

Under ₹99:
"Shop gadgets under ₹99 at AtoZ Gadgetz. Free shipping on orders above ₹450.
100% trusted seller. Secure payment. Delivered all over India."

Under ₹149:
"Gadgets under ₹149 at AtoZ Gadgetz. Affordable trending gadgets with free
shipping. Secure payment — UPI, cards, net banking. Pan-India delivery."

Contact:
"Contact AtoZ Gadgetz — email contact@atozgadgetz.com or WhatsApp 8128702711.
Available all days 11am–9pm. Ahmedabad, Gujarat."

About Us:
"AtoZ Gadgetz — get all the trending gadgets under one roof at affordable prices.
Serving customers all over India with free shipping and secure payment."
```

### JSON-LD Schema (Add to Homepage)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://atozgadgetz.com/#organization",
      "name": "AtoZ Gadgetz",
      "url": "https://atozgadgetz.com/",
      "logo": "https://atozgadgetz.com/wp-content/uploads/logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+91-8160666408",
        "contactType": "customer service",
        "availableLanguage": ["English", "Hindi", "Gujarati"],
        "hoursAvailable": "Mo-Su 11:00-21:00"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "1123/1 Pakwada Golbati, Near Bholar Lohar Chali, Gomtipur",
        "addressLocality": "Ahmedabad",
        "addressRegion": "Gujarat",
        "postalCode": "380021",
        "addressCountry": "IN"
      },
      "sameAs": ["https://www.instagram.com/atozgadgetz/"]
    },
    {
      "@type": "WebSite",
      "@id": "https://atozgadgetz.com/#website",
      "url": "https://atozgadgetz.com/",
      "name": "AtoZ Gadgetz",
      "description": "Shop trending gadgets at affordable prices. Free shipping above ₹450. 100% trusted. Delivered all over India.",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://atozgadgetz.com/?s={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ]
}
```

### JSON-LD for Price Pages (Add to each /under-X-gadgetz/ page)

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Gadgets Under ₹99",
  "url": "https://atozgadgetz.com/under-99-gadgetz/",
  "description": "Shop gadgets under ₹99 at AtoZ Gadgetz with free shipping above ₹450.",
  "breadcrumb": {
    "@type": "BreadcrumbList",
    "itemListElement": [
      {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://atozgadgetz.com/"},
      {"@type": "ListItem", "position": 2, "name": "Shop", "item": "https://atozgadgetz.com/shop/"},
      {"@type": "ListItem", "position": 3, "name": "Under ₹99 Gadgets", "item": "https://atozgadgetz.com/under-99-gadgetz/"}
    ]
  }
}
```

---

## 6. WooCommerce Business Logic (Must Recreate)

| Setting | Value |
|---|---|
| Free shipping rule | Minimum order ₹450 |
| Delivery time display | "4-7 Business Days" |
| Delivery area | All India |
| Warranty display | "24 Hour Warranty" on product pages |
| Refund | None — display "No Refund Policy" clearly |
| Exchange | Via WhatsApp 8128702711 within 24hr |
| Unboxing video required | Yes — state on order confirmation page |
| Payment methods | UPI, Internet Banking, Visa, Mastercard, Amex, Maestro, Debit, IMPS |
| COD | NOT offered |

---

## 7. Tracking Setup (Post-Redesign)

```
Facebook Pixel ID:  584430773881344
Implementation:     Via PixelYourSite or Meta for WooCommerce plugin
Events required:    PageView, ViewContent, AddToCart, InitiateCheckout, Purchase
CAPI:               Enable Server-Side events (requires FB Conversions API token)
```

Verify pixel fires using Facebook Pixel Helper extension before launch.

---

## 8. URL Redirect Map (If Any Product Changes)

If a product is discontinued or renamed, add 301 redirects using the
**Redirection** WordPress plugin:

```
Old URL                          → New URL
/product/old-product-slug/       → /shop/  (if discontinued)
/product/renamed-product/        → /product/new-slug/  (if renamed)
```

Never let a previously-indexed product URL return 404.

---

## 9. Post-Launch Verification Steps

```bash
# 1. Crawl entire site — check for 404s
screaming-frog --crawl https://atozgadgetz.com --save-crawl baseline.seospider

# 2. Check all 8 price pages return 200
for slug in under-99-gadgetz under-149-gadgetz under-199-gadgetz under-249-gadgetz under-299-gadgetz under-349-gadgetz under-499-gadgetz under-999-gadgetz; do
  curl -o /dev/null -s -w "%{http_code} https://atozgadgetz.com/$slug/\n" "https://atozgadgetz.com/$slug/"
done

# 3. Verify shipping policy slug (has -2 suffix)
curl -o /dev/null -s -w "%{http_code}\n" "https://atozgadgetz.com/shipping-payment-policy-2/"

# 4. Submit new sitemap to IndexNow + Google Search Console
```

---

## 10. Reference Files in This Skill Folder

| File | Contents |
|---|---|
| `SKILL.md` | This file — rules + workflow |
| `SEO_PRESERVATION.md` | All live URLs, headings, copy, policies, contacts scraped verbatim July 2026 |
