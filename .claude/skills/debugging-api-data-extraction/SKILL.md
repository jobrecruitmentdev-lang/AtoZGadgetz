---
name: debugging-api-data-extraction
description: |
  Systematic debugging process for "silent empty data" bugs — API call succeeds,
  HTTP 200 is returned, database is populated, but the UI renders nothing.
  Covers double-extraction bugs, swallowed fetch errors, wrapper return-shape
  mismatches, and the 6-layer trace protocol. Works across Next.js, React,
  FastAPI, Express, and any custom fetchApi wrapper pattern.
tools: [Read, Grep, Bash, PowerShell]
---

# Debugging API Data Extraction Bugs

## Role
You are a **Senior Debugging Engineer**. When this skill activates, do NOT guess.
Trace the data through every layer systematically before proposing any fix.
Never blame caching, networking, or the database until layers 1 and 2 are proven clean.

## When This Skill Activates
- UI shows empty state ("No products found", "No results") but the database has data
- API call returns HTTP 200 but the component renders nothing
- No console errors — the failure is completely silent
- A `?.map()`, `.filter()`, or `.reduce()` returns `[]` unexpectedly
- Any `undefined` or `null` where an array or object was expected from an API response

---

## The Bug Family: Double-Extraction

The most common silent-empty-data bug is **double extraction** — the API wrapper
already unwraps the response envelope, but the calling code unwraps it again.

```
API returns:      { success: true, data: [...8 products...] }
Wrapper returns:  json.data          → [...8 products...]   ← already an array
Calling code:     pData?.data?.map() → undefined.map()      ← array has no .data
Fallback:         || []              → []                    ← silent empty
UI renders:       "No products found"
```

Zero errors. Zero warnings. Fully silent.

---

## 6-Layer Debugging Protocol

Apply these layers **in order**. Stop at the layer where data disappears — that is the bug.

---

### Layer 1 — Verify the Backend (Rule Out DB + ORM + Routes)

**Action:** Call the API endpoint directly, outside the frontend.

```bash
# curl
curl -s http://localhost:3000/api/products | jq '.'
curl -s http://localhost:3000/api/products | jq '.data | length'

# With auth token
curl -s -H "Authorization: Bearer <TOKEN>" http://localhost:3000/api/products | jq '.'

# httpx (Python)
python -c "import httpx, json; r = httpx.get('http://localhost:8000/api/products'); print(json.dumps(r.json(), indent=2))"
```

**What you are checking:**
- Does the response contain data? (`count > 0`, `data.length > 0`)
- What is the exact shape? (`{ success, data: [] }` vs `{ items: [] }` vs `[]` bare array)

**Decision:** If backend returns data → proceed to Layer 2. If empty → bug is in DB/ORM/route, not the frontend.

---

### Layer 2 — Verify the Frontend Network Call

**Action:** Confirm the frontend is actually making the request and receiving the response.

```ts
// Temporarily add raw logging before any transformation
const raw = await fetch('/api/products')
console.log('[L2] status:', raw.status)
console.log('[L2] raw json:', await raw.clone().json())
```

```ts
// In Next.js server component
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`)
console.log('[L2] fetch ok:', res.ok, 'status:', res.status)
const body = await res.json()
console.log('[L2] body keys:', Object.keys(body))
console.log('[L2] body.data length:', body?.data?.length)
```

**Check for swallowed errors:**
```ts
// ✗ This pattern hides all errors
try {
  const data = await fetchApi('/products')
  return data
} catch (e) {
  return []  // ← error silently becomes empty array
}

// ✓ Always log before returning fallback
} catch (e) {
  console.error('[fetchApi /products] failed:', e)
  return []
}
```

**Decision:** If `raw.json()` has data but the variable after `fetchApi()` is empty → bug is in the wrapper (Layer 3).

---

### Layer 3 — Inspect the API Wrapper Return Shape (The Most Common Bug)

**Action:** Find the `fetchApi` / `apiClient` / `httpClient` wrapper and read exactly what it returns.

```bash
# Find the wrapper
grep -rn "fetchApi\|apiClient\|httpClient\|apiFetch" src/ --include="*.ts" -l
grep -rn "return json\." src/lib/ --include="*.ts"
```

**The double-extraction pattern to look for:**

```ts
// lib/api.ts — wrapper ALREADY extracts .data
async function fetchApi(url: string) {
  const res = await fetch(url)
  const json = await res.json()
  return json.data   // ← returns the array, NOT the envelope
}

// page.tsx — calling code WRONGLY extracts .data again
const pData = await fetchApi('/products')  // pData = [...] (array)
const products = pData?.data?.map(...)     // pData.data = undefined
//                      ^^^^^ BUG — array has no .data property
```

**Wrapper return shape catalogue — identify yours:**

| Wrapper returns | Correct calling pattern |
|---|---|
| `json` (full envelope) | `pData.data.map(...)` |
| `json.data` (array) | `pData.map(...)` |
| `json.data.items` (nested) | `pData.items.map(...)` |
| `{ data, meta }` (destructured) | `const { data } = await fetchApi(...)` |
| Bare array `[]` | `pData.map(...)` |

**Fix pattern:**
```ts
// If wrapper returns json.data (already unwrapped):
const products = pData?.map(p => ({...})) ?? []   // ✓

// If wrapper returns full json (not unwrapped):
const products = pData?.data?.map(p => ({...})) ?? []  // ✓
```

---

### Layer 4 — Trace the Variable Assignment Chain

**Action:** Walk backwards from the empty UI variable to its origin.

```bash
# Find where the empty variable is used
grep -n "filteredProducts\|No products\|length === 0" src/app/products/page.tsx

# Walk back the assignment chain
grep -n "filteredProducts\s*=" src/app/products/page.tsx
grep -n "initialProducts\s*=" src/app/products/page.tsx
grep -n "products\s*=" src/app/products/page.tsx
```

**Build the chain manually:**
```
UI renders empty  ← filteredProducts.length === 0
filteredProducts  ← useMemo(() => initialProducts.filter(...), [initialProducts])
initialProducts   ← prop passed from parent
products prop     ← assigned in Server Component: pData?.data?.map(...) || []
pData             ← await fetchApi('/products')   ← wrapper returns json.data (array)
                                   ↑ BUG: pData is already an array
                                     pData.data is undefined
                                     undefined?.map() → undefined
                                     undefined || [] → []
```

---

### Layer 5 — Verify the Fix with a Targeted Log

Before changing any production code, add one log to confirm your hypothesis:

```ts
const pData = await fetchApi('/products')
console.log('[L5 DEBUG] typeof pData:', typeof pData)
console.log('[L5 DEBUG] Array.isArray(pData):', Array.isArray(pData))
console.log('[L5 DEBUG] pData keys:', pData ? Object.keys(pData) : 'null/undefined')
console.log('[L5 DEBUG] pData?.data:', pData?.data)
console.log('[L5 DEBUG] pData?.length:', (pData as any)?.length)
```

If `Array.isArray(pData) === true` and `pData.data === undefined` → hypothesis confirmed.
Apply the fix. Remove the debug logs. Done.

---

### Layer 6 — Write a Regression Test

After fixing, always add a test that would have caught this:

```ts
// __tests__/api/products.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('fetchApi wrapper contract', () => {
  it('returns unwrapped array — not the envelope', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, data: [{ id: '1', name: 'Test' }] }),
    })
    const result = await fetchApi('/products')
    // Assert the return shape matches what calling code expects
    expect(Array.isArray(result)).toBe(true)  // wrapper returns array
    expect(result[0]).toHaveProperty('id')     // not nested under .data
  })
})
```

```ts
// __tests__/unit/ProductsPage.test.ts
import { render, screen } from '@testing-library/react'
import ProductsPage from '@/app/products/page'
import { vi } from 'vitest'

it('renders products when API returns data', async () => {
  vi.mock('@/lib/api', () => ({
    fetchApi: vi.fn().mockResolvedValue([
      { id: '1', name: 'Smart Watch', price: 4999 }
    ])
  }))
  render(await ProductsPage())
  expect(screen.getByText('Smart Watch')).toBeInTheDocument()
  expect(screen.queryByText(/no products/i)).not.toBeInTheDocument()
})
```

---

## Quick Diagnostic Commands

```bash
# 1. Find all .data.data or ?.data?.data double-access patterns (common bug signature)
grep -rn "\.data\.data\|?\.data?\.data" src/ --include="*.ts" --include="*.tsx"

# 2. Find all || [] fallbacks that could hide bugs
grep -rn "|| \[\]\|?? \[\]" src/ --include="*.ts" --include="*.tsx"

# 3. Find all catch blocks that swallow errors silently
grep -A2 "} catch" src/ --include="*.ts" -rn | grep "return \[\]"

# 4. Find the API wrapper(s) and their return statements
grep -rn "return json\." src/lib/ src/utils/ --include="*.ts"

# 5. Confirm a specific endpoint's response shape fast
curl -s http://localhost:3000/api/products | python -m json.tool | head -20

# 6. Detect upstream rate-limit flakiness: same request, twice, a few seconds apart —
#    if totals/lengths differ for identical params, it's throttling, not extraction
curl -s "http://localhost:8080/api/cj/browse?keyword=X&page=1&size=1"; sleep 3
curl -s "http://localhost:8080/api/cj/browse?keyword=X&page=1&size=1"
```

---

## Common Variants of This Bug

| Variant | Symptom | Root Cause |
|---|---|---|
| **Double extraction** | Empty list, no errors | `wrapper returns json.data`, caller does `.data` again |
| **Wrong key name** | Empty, no errors | API returns `items` but code reads `data` |
| **Swallowed catch** | Empty after network error | `catch(e) { return [] }` hides the real error |
| **Optional chain fallback** | Empty, no errors | `undefined?.map() ?? []` succeeds silently |
| **Env URL mismatch** | Empty, ECONNREFUSED in server logs | `NEXT_PUBLIC_API_URL` points to wrong host in that environment |
| **Serialization boundary** | Empty in client, populated on server | Non-serializable Prisma objects not JSON-safe; Next.js silently drops them |
| **Stale cache** | Empty after data was updated | `revalidate` not set, old static page served |
| **Upstream API rate limit (soft-fail)** | Empty, no errors, backend logs clean | Third-party API silently returns `success:true` with an empty result set when its own rate limit is hit, instead of an HTTP error — see below |

---

## Variant: Upstream Rate-Limited API Returns Empty Instead of an Error

Some third-party APIs don't fail loudly when throttled — they return `200 OK` with
an empty/zero-count payload, which your code then normalizes into "no results."
This looks identical to a double-extraction bug (Layer 1 curl even "succeeds"),
but the fix is entirely different: rate-limit your own outbound calls, don't touch
extraction code.

**How to tell the difference from a real empty state:**
1. Call the *exact same* upstream request twice in a row, a few seconds apart.
   If the result flips between empty and populated for identical params, it's not
   a data bug — it's throttling.
2. Check the raw upstream response body (not just your normalized shape) for an
   explicit rate-limit code/message alongside the empty ones — some APIs mix both
   behaviors (hard error sometimes, silent empty other times) under the same limit.
3. Grep your own logs for how many outbound calls to that host happened in the
   preceding 1-2 seconds. A burst right before the empty result is the tell.

**Real example (AtoZ Gadgetz / CJDropshipping, 2026-07):** `/cj/browse` returned
"No CJ products found" on the storefront. `curl` against the backend endpoint
directly reproduced it intermittently — same keyword, same params, alternating
between `total: 6000` and `total: 0`. Backend logs occasionally showed an explicit
CJ error (`code 1600200, "Too Many Requests, QPS limit is 1 time/1second"`), but
just as often showed nothing at all — CJ returned `success:true` with an empty
list instead of erroring. Root cause: zero outbound throttling: every category
page load fired an uncoordinated CJ search call, and CJ enforces 1 req/sec
account-wide. Fix: a shared axios instance (`cj-http.ts`) with a request
interceptor that serializes all outbound calls via a promise-chain mutex, gated to
one call per ~1.3s (1.1s wasn't enough margin — network jitter still produced
occasional overlaps; padding above the documented limit is necessary, not just
matching it exactly). Applied to every service hitting that API (auth, product
search/detail, orders, shipments) since they all draw from the same account quota.
Belt-and-suspenders: also added a single client-side retry-on-empty in the
component that calls the endpoint, since a transient throttle can still slip
through under load spikes.

**Fix pattern — serialize outbound calls to a shared quota:**
```ts
// api-http.ts — wrap the SDK/axios instance every service imports, don't
// patch each call site individually (root-cause fix, not N symptom fixes)
const MIN_INTERVAL_MS = 1300; // pad above the documented limit, don't match it exactly
let chain: Promise<void> = Promise.resolve();
let lastCallAt = 0;

function throttle(): Promise<void> {
  const turn = chain.then(async () => {
    const remaining = lastCallAt + MIN_INTERVAL_MS - Date.now();
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));
    lastCallAt = Date.now();
  });
  chain = turn.catch(() => {});
  return turn;
}

export const throttledHttp = axios.create();
throttledHttp.interceptors.request.use(async (config) => {
  await throttle();
  return config;
});
```

---

## Prevention Checklist

```
[ ] Every fetchApi wrapper has its return shape documented in a JSDoc comment
[ ] Wrapper return shape has a unit test (Layer 6 pattern above)
[ ] No catch block returns [] without console.error()
[ ] No .data?.data double-access patterns in codebase (grep check above)
[ ] Every API integration test asserts the rendered UI, not just the HTTP status
[ ] All environment API URLs are validated on app startup
```
