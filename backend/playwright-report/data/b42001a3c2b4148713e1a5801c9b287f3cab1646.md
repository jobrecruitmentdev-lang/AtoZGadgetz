# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\user.spec.ts >> Authenticated User API Tests >> GET /wishlist should return user wishlist
- Location: e2e\api\user.spec.ts:45:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { API_URL, STATIC_USER } from './test-data';
  3  | 
  4  | test.describe('Authenticated User API Tests', () => {
  5  |   let token = '';
  6  | 
  7  |   test.beforeAll(async ({ request }) => {
  8  |     // Ensure the static user is logged in and we have a token
  9  |     const loginResponse = await request.post(`${API_URL}/auth/login`, {
  10 |       data: { email: STATIC_USER.email, password: STATIC_USER.password }
  11 |     });
  12 |     
  13 |     if (loginResponse.ok()) {
  14 |       const body = await loginResponse.json();
  15 |       token = body.data?.access_token || '';
  16 |     } else {
  17 |       // If login failed, it might be because the user doesn't exist yet (tests run out of order)
  18 |       await request.post(`${API_URL}/auth/register`, { data: STATIC_USER });
  19 |       const retryResponse = await request.post(`${API_URL}/auth/login`, {
  20 |         data: { email: STATIC_USER.email, password: STATIC_USER.password }
  21 |       });
  22 |       const body = await retryResponse.json();
  23 |       token = body.data?.access_token || '';
  24 |     }
  25 |   });
  26 | 
  27 |   test('GET /address should return user addresses', async ({ request }) => {
  28 |     const response = await request.get(`${API_URL}/address`, {
  29 |       headers: { Authorization: `Bearer ${token}` }
  30 |     });
  31 |     expect(response.status()).toBe(200);
  32 |     const body = await response.json();
  33 |     expect(body.success).toBe(true);
  34 |   });
  35 | 
  36 |   test('GET /cart should return user cart', async ({ request }) => {
  37 |     const response = await request.get(`${API_URL}/cart`, {
  38 |       headers: { Authorization: `Bearer ${token}` }
  39 |     });
  40 |     expect(response.status()).toBe(200);
  41 |     const body = await response.json();
  42 |     expect(body.success).toBe(true);
  43 |   });
  44 | 
  45 |   test('GET /wishlist should return user wishlist', async ({ request }) => {
  46 |     const response = await request.get(`${API_URL}/wishlist`, {
  47 |       headers: { Authorization: `Bearer ${token}` }
  48 |     });
> 49 |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  50 |     const body = await response.json();
  51 |     expect(body.success).toBe(true);
  52 |   });
  53 | 
  54 |   test('GET /order should return user orders', async ({ request }) => {
  55 |     const response = await request.get(`${API_URL}/order`, {
  56 |       headers: { Authorization: `Bearer ${token}` }
  57 |     });
  58 |     expect([200, 404]).toContain(response.status()); // 404 might mean no orders found, which is ok for a test user
  59 |   });
  60 | 
  61 | });
  62 | 
```