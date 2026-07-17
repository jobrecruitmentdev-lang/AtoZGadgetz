---
name: logo-brand-guidelines
description: Enforces logo and brand identity standards when designing, reviewing, or implementing UI — covering logo variations, clearspace, sizing, color specs, typography, do's/don'ts, co-branding, and file format rules. Sourced from Frontify Logo Usage Guidelines.
tools: [WebFetch, Read, Glob]
---

## Purpose

Use this skill whenever working on:
- UI components that display the brand logo (navbar, footer, splash screen, email templates)
- Marketing assets, thumbnails, social media images
- Co-branding with partner logos (e.g. CJDropshipping, payment gateways)
- Reviewing designs for brand compliance before shipping

Source: https://www.frontify.com/en/guide/logo-usage-guidelines

---

## 1. Logo Variations — Always Use the Right Version

Every brand must provide **at minimum 4 logo variants**. Always pick the correct one for context:

| Variant | When to Use |
|---|---|
| **Primary Logo** | Default — represents core brand identity. Use everywhere possible. |
| **Secondary Logo** | Smaller spaces, mobile navbars, app icons, favicons |
| **Inverse / Light** | Dark backgrounds, hero sections with dark overlays |
| **Monochrome** | Single-color print, embroidery, watermarks, PDF headers |
| **Horizontal** | Wide containers — desktop headers, email headers |
| **Vertical / Stacked** | Square containers — social avatars, loading screens |

**Rule:** Never use the primary logo where a secondary or monochrome variant is specified. Never stretch or recolor a variant to fake a missing one.

---

## 2. Clearspace (Spacing Around Logo)

Clearspace = the minimum protected zone around the logo where **no other element may appear**.

### Rules
- Clearspace must be defined relative to a unit derived from the logo itself (e.g. the height of the wordmark's capital letter, or a fixed pixel value)
- Apply clearspace from: document edges, other logos, body text, buttons, decorative elements
- **Too much whitespace** → logo looks small and insignificant
- **Too little whitespace** → logo loses visual balance and looks cramped

### In Code (CSS)
```css
.logo-wrapper {
  /* Always use padding, never margin, so background color extends correctly */
  padding: var(--logo-clearspace); /* define as CSS variable per brand token */
  display: inline-flex;
  align-items: center;
}
```

### Implementation Checklist
- [ ] Logo has padding on all 4 sides equal to clearspace unit
- [ ] No text, icon, or UI element overlaps the clearspace zone
- [ ] On mobile, clearspace is preserved (not collapsed)

---

## 3. Sizing Rules

### Minimum Size
Define a **minimum px/pt size** below which the logo becomes illegible. Never render below it.

| Context | Typical Minimum |
|---|---|
| Digital / screen | 80px wide (verify against brand spec) |
| Print | 20mm wide |
| Favicon | 16×16px — use icon-only mark, never full wordmark |

### Maximum Size
On everyday documents and UI, set a maximum size to prevent arbitrary oversizing that makes the logo dominate the layout inappropriately.

### Always
- Scale **proportionally** — never change the aspect ratio
- Use `width` only (not both `width` and `height`) in HTML/CSS to preserve ratio:

```html
<!-- Correct -->
<img src="/logo.svg" width="160" alt="Brand logo" />

<!-- Wrong — can distort if container aspect ratio differs -->
<img src="/logo.svg" width="160" height="60" alt="Brand logo" />
```

---

## 4. Color Specifications

Every logo color must be documented in **all 4 formats**. Never approximate or eyedrop from a screenshot.

| Format | Use Case |
|---|---|
| **HEX** | Web / digital (#RRGGBB) |
| **RGB** | Screen, CSS `rgb()` values |
| **CMYK** | Offset printing |
| **Pantone (PMS)** | Spot color printing, merchandise |

### In CSS — Use Brand Tokens
```css
:root {
  --brand-primary: #[HEX from brand spec];
  --brand-secondary: #[HEX from brand spec];
  --brand-monochrome-dark: #000000;
  --brand-monochrome-light: #FFFFFF;
}
```

### Logo on Backgrounds
| Background | Logo Version |
|---|---|
| White / light | Primary color logo |
| Dark / black | Inverse (light) logo |
| Brand color background | Monochrome white logo |
| Photo / busy background | Logo with protective padding or white container |

**Never** place the color logo directly on a background color that clashes or reduces contrast below WCAG AA (4.5:1 ratio).

---

## 5. Typography Rules (for Logotype / Wordmark)

If the logo includes a typemark (text as part of the logo):

- Use the **exact specified font and weight** — never substitute with a system font
- Respect exact **letter spacing** and **capitalization** as defined (e.g. all caps, title case, or mixed case like "AtoZGadgets" not "Atozgadgets")
- Never retype the wordmark using a font — always use the logo file
- The wordmark file (SVG/EPS) is the single source of truth

---

## 6. Do's and Don'ts

### Do
- Use provided logo files (SVG for web, EPS/PDF for print, PNG with transparency for documents)
- Maintain clearspace on all sides
- Use the correct variant for the context (see Section 1)
- Test logo legibility at the intended render size before shipping

### Never Do
| Misuse | Why It's Wrong |
|---|---|
| Stretch or squash the logo | Distorts brand mark, looks unprofessional |
| Recolor the logo | Breaks brand consistency, creates unrecognized variants |
| Add drop shadows, gradients, or effects | Alters the designed appearance |
| Place on a low-contrast background | Reduces legibility and brand recognition |
| Rotate or skew the logo | Unintended associations, brand damage |
| Crop the logo | Removes parts of the mark or wordmark |
| Use a low-resolution raster (pixelated PNG) where SVG exists | Looks poor in high-DPI / retina screens |
| Recreate the logo using fonts/icons | Only official files are authorized |
| Animate the logo without brand-approved animation files | Unauthorized animation is a brand violation |
| Use an old/outdated version | Check brand portal for the current file |

---

## 7. File Formats

| Format | When to Use |
|---|---|
| **SVG** | Web — always prefer for logos; scales infinitely, tiny file size |
| **PNG (transparent)** | Documents, presentations, places where SVG isn't supported |
| **EPS / PDF** | Print production, large-format (billboard, banners) |
| **WebP** | Web images where SVG isn't appropriate (photo-based logos) |
| **ICO / PNG 16–512px** | Favicon and app icon variants |

In Next.js:
```tsx
import Image from 'next/image'

// For SVG logos — use next/image with unoptimized or inline SVG
<Image
  src="/brand/logo-primary.svg"
  width={160}
  height={40}
  alt="AtoZGadgets"
  priority          // above-fold logos should be priority
/>
```

---

## 8. Co-Branding Rules

When displaying our logo alongside a partner logo (CJDropshipping, Razorpay, Stripe, payment badges):

- Both logos must be **similarly sized** — neither should dominate unless hierarchy requires it
- Maintain clearspace between logos (at least 1× the clearspace unit of each logo)
- Separate with a visual divider if needed (thin rule / `|` divider), not by proximity alone
- Never merge, overlap, or blend the two logos
- Position: our logo **first** (left or top) in the reading direction for primary contexts
- On partner-provided assets (e.g. "Powered by Stripe"), use their official badge files — never recreate

```tsx
{/* Co-branding example */}
<div className="flex items-center gap-6">
  <Image src="/brand/logo-primary.svg" width={120} height={32} alt="AtoZGadgets" />
  <span className="w-px h-8 bg-outline-variant" aria-hidden="true" />
  <Image src="/partners/razorpay-badge.svg" width={100} height={32} alt="Powered by Razorpay" />
</div>
```

---

## 9. External Use (Partners, Press, Affiliates)

When sharing logo assets externally:
- Only share files from the **official brand asset pack** — not screenshots or exports from design tools
- Always include a one-page usage summary (do's / don'ts) with the asset zip
- Specify the exact context the external party may use the logo in
- Revoke access when partnership ends

---

## 10. Audit Checklist — Before Every UI Merge

Run before merging any component that uses the logo:

- [ ] Correct logo variant for the context (primary / secondary / inverse / mono)
- [ ] SVG format used for web rendering
- [ ] Clearspace preserved on all 4 sides (no element inside protected zone)
- [ ] Proportional scaling (aspect ratio locked)
- [ ] Minimum size respected (not below legibility threshold)
- [ ] Contrast ratio of logo against background ≥ 4.5:1 (WCAG AA)
- [ ] `alt` text set and meaningful (not "logo" — use brand name)
- [ ] `priority` prop set if logo is above the fold (Next.js)
- [ ] No CSS `filter`, `transform`, or `box-shadow` applied to the logo element
- [ ] Co-branding follows spacing and sizing rules if applicable
- [ ] File is from the official brand asset pack (not a screenshot)

---

## Reference

- Full guide: https://www.frontify.com/en/guide/logo-usage-guidelines
- Industry examples: TikTok (multi-variant), Alpine (print applications), Beyond Gravity (color-by-background system)
- Brand portal tool: https://www.frontify.com (for teams managing brand assets at scale)
