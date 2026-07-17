# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Structure

Two separate projects, always run commands inside the right folder:

| Folder | Stack |
|---|---|
| `AtoZ Gadget Backend Node/` | Node.js + Express 5 + Prisma + MySQL + TypeScript |
| `AtoZ Gadget Frontend Next/` | Next.js 16 App Router + React 19 + Tailwind CSS v4 + TypeScript |

---

## Backend (`AtoZ Gadget Backend Node/`)

### Commands
```bash
npm run dev        # tsx watch src/server.ts — hot reload
npm start          # tsx src/server.ts — production
npx prisma migrate dev --name <name>   # create and apply migration
npx prisma db push                     # sync schema without migration file
npx prisma studio                      # GUI for database
npx prisma generate                    # regenerate Prisma client after schema change
```

### Architecture — Layered MVC
Every domain follows the same 4-layer chain:

```
routes/*.routes.ts
  → controllers/*.controller.ts   (req/res, calls service)
  → services/*.service.ts         (business logic)
  → repositories/*.repository.ts  (Prisma queries only)
```

Validators (`validators/*.validator.ts`) use Zod and are called inside controllers before the service layer.

### Key Files
- `src/server.ts` — Express app, mounts all 23 route modules at `/api`
- `src/prisma.ts` — Singleton Prisma client
- `src/middlewares/auth.middleware.ts` — `authenticateJWT()` (Bearer token) and `authorizeRBAC()` (permission string check)
- `prisma/schema.prisma` — Single source of truth for 27 DB models

### Auth
- JWT (`SECRET_KEY` env), 1-hour expiry, role_id: 1=superadmin, 2=admin, 3=customer
- `requireAdminOrSuperAdmin()` middleware guards all write endpoints
- Password reset currently logs token to console — not production-ready

### Database
MySQL via Prisma ORM. `DATABASE_URL` in `.env`. Order placement uses `prisma.$transaction` to atomically deduct inventory, create order + items, and clear cart.

### Environment Variables (`.env`)
```
DATABASE_URL=mysql://root:@localhost:3306/atoz_gadgets_db
SECRET_KEY=...
PORT=8080
```

---

## Frontend (`AtoZ Gadget Frontend Next/`)

### Commands
```bash
npm run dev    # development server
npm run build  # production build
npm run lint   # ESLint
```

### Architecture — App Router with Proxy Pattern
- **Route groups:** `(storefront)/` for customers, `(admin)/` for admin dashboard
- **API calls from client** go to Next.js catch-all proxy at `app/api/[...path]/route.ts` → which forwards to the backend, injecting the Bearer token from the httpOnly cookie
- **API calls from server components** go direct to `process.env.API_URL` (bypasses proxy)
- `lib/api-client.ts` — universal `fetchApi<T>()` that auto-detects server vs client and routes accordingly

### State Management
React Context only — no Redux/Zustand:
- `components/auth/AuthContext.tsx` — user session, `logout()`, `refreshUser()`
- `components/storefront/CartContext.tsx` — cart state, depends on AuthContext

Provider order in `app/layout.tsx`: `AuthProvider → CartProvider → SmoothScrollProvider → PageTransition`

### Auth Flow
1. Login POST → `app/api/auth/login/route.ts` → backend → sets httpOnly cookie `access_token` (1 week)
2. `middleware.ts` guards `/account/**` and `/admin/**` — redirects to `/login` if no cookie
3. `AuthContext` calls `/api/auth/me` on app load to hydrate user state

### Styling
Tailwind CSS v4. Theme defined as CSS variables in `app/globals.css`. Key: accent color `#c9a962`, radius `1rem`. Animation stack: Framer Motion + GSAP + Lenis (smooth scroll) + split-type (text effects). Custom motion components live in `components/motion/`.

### Environment Variables (`.env.local`)
```
API_URL=http://localhost:8080/api
```

---

## CJDropshipping Integration — Current State & Roadmap

CJDropshipping is **not yet integrated**. The database schema is ready (Shipment, Order, Product models) but no CJ API calls exist. See the architecture plan at `CJ_DROPSHIPPING_PLAN.md` for the full end-to-end implementation guide.

### What exists today
- `Shipment` model: `courier_name`, `tracking_number`, `status`, `shipped_at`
- `Product` model: has fields for external supplier data but no `cj_product_id` yet
- Payment: placeholder CRUD only — no gateway (Razorpay/Stripe) integrated
