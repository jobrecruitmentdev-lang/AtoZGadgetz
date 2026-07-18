# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\public.spec.ts >> Public API Tests (Read-Only) >> GET /categories should return category list
- Location: e2e\api\public.spec.ts:6:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 500
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { API_URL } from './test-data';
  3  | 
  4  | test.describe('Public API Tests (Read-Only)', () => {
  5  | 
  6  |   test('GET /categories should return category list', async ({ request }) => {
  7  |     const response = await request.get(`${API_URL}/categories`);
> 8  |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  9  |     const body = await response.json();
  10 |     expect(body.success).toBe(true);
  11 |     expect(Array.isArray(body.data)).toBe(true);
  12 |   });
  13 | 
  14 |   test('GET /products should return products list', async ({ request }) => {
  15 |     const response = await request.get(`${API_URL}/products`);
  16 |     expect(response.status()).toBe(200);
  17 |     const body = await response.json();
  18 |     expect(body.success).toBe(true);
  19 |     // Products response usually paginated or wrapped in an array
  20 |     if (body.data.products) {
  21 |        expect(Array.isArray(body.data.products)).toBe(true);
  22 |     } else {
  23 |        expect(Array.isArray(body.data)).toBe(true);
  24 |     }
  25 |   });
  26 | 
  27 |   test('GET /brands should return brands list', async ({ request }) => {
  28 |     const response = await request.get(`${API_URL}/brands`);
  29 |     expect(response.status()).toBe(200);
  30 |     const body = await response.json();
  31 |     expect(body.success).toBe(true);
  32 |     expect(Array.isArray(body.data)).toBe(true);
  33 |   });
  34 | 
  35 |   test('GET /offer should return active offers', async ({ request }) => {
  36 |     const response = await request.get(`${API_URL}/offer/active`);
  37 |     expect([200, 404]).toContain(response.status()); // It might be 404 if no active offers exist, which is fine
  38 |   });
  39 | 
  40 |   test('GET /banner should return active banners', async ({ request }) => {
  41 |     const response = await request.get(`${API_URL}/banner/active`);
  42 |     expect([200, 404]).toContain(response.status());
  43 |   });
  44 | 
  45 | });
  46 | 
```