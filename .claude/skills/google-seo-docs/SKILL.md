---
name: google-seo-docs
description: Fetches and applies authoritative Google SEO guidelines covering fundamentals, crawling/indexing, e-commerce, international SEO, and monitoring — sourced directly from Google Search Central documentation.
tools: [WebFetch, WebSearch]
---

## Purpose

Use this skill whenever you need to audit, implement, debug, or advise on SEO for this project.
Always consult the canonical Google documentation below before giving recommendations.
Never rely on outdated blog posts or assumptions — pull from source.

---

## Official Google SEO Documentation Index

### Fundamentals
- **SEO Starter Guide** — https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- **How Search Works** — https://developers.google.com/search/docs/fundamentals/how-search-works
- **Do I Need SEO?** — https://developers.google.com/search/docs/fundamentals/do-i-need-seo
- **Get on Google** — https://developers.google.com/search/docs/fundamentals/get-on-google
- **AI Optimization Guide (GEO/AEO)** — https://developers.google.com/search/docs/fundamentals/ai-optimization-guide

### Crawling & Indexing
- **301 Redirects** — https://developers.google.com/search/docs/crawling-indexing/301-redirects
- **Request Recrawl** — https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
- **Consolidate Duplicate URLs (Canonical)** — https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- **Control What You Share** — https://developers.google.com/search/docs/crawling-indexing/control-what-you-share
- **Sitemaps Overview** — https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview
- **robots.txt** — https://developers.google.com/search/docs/crawling-indexing/robots/intro

### Monitoring & Debugging
- **Search Console Setup** — https://developers.google.com/search/docs/monitor-debug/search-console-start
- **Debug Traffic Drops** — https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops
- **GA + Search Console Integration** — https://developers.google.com/search/docs/monitor-debug/google-analytics-search-console

### E-commerce & Specialty
- **E-commerce SEO** — https://developers.google.com/search/docs/specialty/ecommerce
- **International SEO (hreflang, geo-targeting)** — https://developers.google.com/search/docs/specialty/international

### Webmaster Tools
- **Google Search Console** — https://search.google.com/search-console
- **Rich Results Test** — https://search.google.com/test/rich-results
- **PageSpeed Insights** — https://pagespeed.web.dev/
- **Webmaster Community** — https://support.google.com/webmasters/community

---

## When to Use Each Reference

| Situation | Go To |
|---|---|
| Page not indexed / not appearing on Google | Crawling & Indexing → Request Recrawl + robots.txt |
| Duplicate content / canonical issues | Consolidate Duplicate URLs |
| Ranking drop investigation | Debug Traffic Drops + Search Console |
| Setting up a new site | SEO Starter Guide + Get on Google + Sitemaps |
| Product/category pages for e-commerce | E-commerce SEO |
| Multilingual or India+global targeting | International SEO |
| Rich snippets / schema not showing | Rich Results Test |
| AI search (ChatGPT, Perplexity, Gemini) citations | AI Optimization Guide |
| Page speed / Core Web Vitals | PageSpeed Insights |
| Old URL changed → new URL | 301 Redirects |

---

## Execution Process

1. **Identify the SEO task type** (audit / implement / debug / advise)
2. **Select the relevant Google doc URL** from the index above
3. **Fetch the doc** using WebFetch to get current guidance (docs change — always fetch live)
4. **Apply to the project** — never paraphrase; implement exactly what Google specifies
5. **Verify** using the appropriate tool (Rich Results Test, Search Console, PageSpeed)

---

## Core SEO Rules for This Project (AtoZGadgets — Next.js App Router)

### Always Implement
- Canonical URL per page (`<link rel="canonical">` via Next.js Metadata API)
- OG tags + Twitter Card on every page
- JSON-LD structured data: `Product`, `BreadcrumbList`, `Organization`, `FAQPage` where applicable
- `robots.txt` at `/` — allow storefront, block `/admin/**`, `/api/**`
- `sitemap.xml` — auto-generated, include all product and category pages
- `hreflang` if/when adding language variants for international expansion

### E-commerce Specific (from Google E-commerce SEO doc)
- Product schema with `price`, `availability`, `review` for rich results
- Pagination with `rel="next"` / `rel="prev"` or canonical to first page
- Avoid thin pages for variant URLs — use canonical to main product page
- Structured breadcrumbs on all category + product pages

### International SEO (India → Global)
- Use `hreflang="en-IN"` for India-targeted content
- `hreflang="en"` for global English fallback
- `x-default` hreflang for homepage
- Geo-signal via `addressCountry: "IN"` in Organization schema

### Never Do
- Block CSS/JS in robots.txt (Google needs to render them)
- Use `noindex` on paginated pages that should rank
- Duplicate H1 across pages
- Set `<meta name="robots" content="noindex">` on product pages
- Use JavaScript-only navigation without fallback links

---

## Quick Audit Checklist

Run this before every deploy or SEO task:

- [ ] All pages have unique `<title>` (50-60 chars)
- [ ] All pages have unique `<meta description>` (150-160 chars)
- [ ] Canonical tag present and correct on every page
- [ ] robots.txt allows Googlebot on storefront pages
- [ ] sitemap.xml submitted to Search Console
- [ ] No broken internal links (404s)
- [ ] Core Web Vitals: LCP < 2.5s, CLS < 0.1, INP < 200ms
- [ ] Product pages have JSON-LD `Product` schema
- [ ] Rich Results Test passes on key page types
- [ ] Search Console shows no manual actions or coverage errors
