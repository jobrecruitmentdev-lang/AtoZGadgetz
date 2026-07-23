# AtoZGadgets Workspace Custom Rules & Architecture Guidelines

## Catalog Management Strategy: Local-to-Live Staging
- **Resource Conservation Rule:** Never execute live bulk CJDropshipping API searches or heavy external product queries directly on the production live server to avoid hitting CJ rate limits (1,000 requests/day) and server CPU/memory spikes.
- **Admin Gateway Workflow:**
  1. Use the local Admin Panel Gateway (`/admin/catalog/import`) to search, filter by budget/markup, and import products into the local database (`atoz_gadgets_db`).
  2. Perform quality review and price customization locally.
  3. Run `npm run sync:live -- --push` or use `cj_products_export.json` to push curated product records directly from local database to live production server.
- **Data Integrity Rule:** All imported products must preserve the nullable foreign key pointer in `CjProduct` table to allow seamless Phase 2 switching to own inventory (`fulfillment_type: 'own'`) without data loss.
- **Test Isolation & Data Cleanup Rule:** Automated security or unit tests must use isolated database transactions or unique test prefixes (`E2E-TEST-*`). Test scripts must never leave raw XSS payloads (`<script>`) or dummy test records in the development/production database view. Run `npm run db:clean-garbage` to purge test artifacts.

