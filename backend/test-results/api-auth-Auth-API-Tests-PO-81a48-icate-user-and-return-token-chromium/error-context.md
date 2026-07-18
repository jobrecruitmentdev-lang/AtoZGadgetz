# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\auth.spec.ts >> Auth API Tests >> POST /auth/login should authenticate user and return token
- Location: e2e\api\auth.spec.ts:38:3

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 200
Received: 401
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { API_URL, STATIC_USER, TEST_USER } from './test-data';
  3  | 
  4  | test.describe('Auth API Tests', () => {
  5  |   // Test Registration
  6  |   test('POST /auth/register should register a new user', async ({ request }) => {
  7  |     const response = await request.post(`${API_URL}/auth/register`, {
  8  |       data: TEST_USER
  9  |     });
  10 |     
  11 |     // We expect 201 Created or 200 OK
  12 |     expect([200, 201]).toContain(response.status());
  13 |     const body = await response.json();
  14 |     expect(body.success).toBe(true);
  15 |     expect(body.data).toHaveProperty('id');
  16 |   });
  17 | 
  18 |   // Test missing mobile validation
  19 |   test('POST /auth/register should fail if mobile is missing', async ({ request }) => {
  20 |     const { mobile, ...invalidUser } = TEST_USER;
  21 |     const response = await request.post(`${API_URL}/auth/register`, {
  22 |       data: invalidUser
  23 |     });
  24 |     
  25 |     // Should be 400 Bad Request
  26 |     expect(response.status()).toBe(400);
  27 |   });
  28 | 
  29 |   // Setup static user for login/me testing
  30 |   test.beforeAll(async ({ request }) => {
  31 |     // Attempt to register the static user. Ignore error if already exists.
  32 |     await request.post(`${API_URL}/auth/register`, {
  33 |       data: STATIC_USER
  34 |     });
  35 |   });
  36 | 
  37 |   // Test Login
  38 |   test('POST /auth/login should authenticate user and return token', async ({ request }) => {
  39 |     const response = await request.post(`${API_URL}/auth/login`, {
  40 |       data: {
  41 |         email: STATIC_USER.email,
  42 |         password: STATIC_USER.password
  43 |       }
  44 |     });
  45 |     
> 46 |     expect(response.status()).toBe(200);
     |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  47 |     const body = await response.json();
  48 |     expect(body.success).toBe(true);
  49 |     expect(body.data).toHaveProperty('access_token');
  50 |   });
  51 | 
  52 |   // Test /me without token
  53 |   test('GET /auth/me should fail without token', async ({ request }) => {
  54 |     const response = await request.get(`${API_URL}/auth/me`);
  55 |     expect(response.status()).toBe(401);
  56 |   });
  57 | 
  58 |   // Test /me with token
  59 |   test('GET /auth/me should succeed with valid token', async ({ request }) => {
  60 |     // Get token
  61 |     const loginResponse = await request.post(`${API_URL}/auth/login`, {
  62 |       data: { email: STATIC_USER.email, password: STATIC_USER.password }
  63 |     });
  64 |     const loginBody = await loginResponse.json();
  65 |     const token = loginBody.data.access_token;
  66 | 
  67 |     // Use token
  68 |     const meResponse = await request.get(`${API_URL}/auth/me`, {
  69 |       headers: {
  70 |         Authorization: `Bearer ${token}`
  71 |       }
  72 |     });
  73 |     
  74 |     expect(meResponse.status()).toBe(200);
  75 |     const meBody = await meResponse.json();
  76 |     expect(meBody.success).toBe(true);
  77 |     expect(meBody.data.email).toBe(STATIC_USER.email);
  78 |   });
  79 | });
  80 | 
```