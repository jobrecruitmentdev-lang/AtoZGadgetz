import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from './test-data';

async function getToken(request: any, creds: { email: string; password: string }) {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const body = await res.json();
  return body.data?.access_token || '';
}

// Banner, Homepage Section, Offer, Coupon — public GET, admin-only writes (authorizeRBAC)
test.describe('Banner API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /banner is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/banner`);
    expect(response.status()).toBe(200);
  });

  test('POST /banner without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/banner`, { data: {} });
    expect(response.status()).toBe(401);
  });

  test('POST /banner as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/banner`, {
      data: { title: 'x' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe('Homepage Section API', () => {
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /homepage-section is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/homepage-section`);
    expect(response.status()).toBe(200);
  });

  test('POST /homepage-section as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/homepage-section`, {
      data: {},
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe('Offer API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /offer is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/offer`);
    expect(response.status()).toBe(200);
  });

  test('POST /offer without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/offer`, { data: {} });
    expect(response.status()).toBe(401);
  });

  test('POST /offer as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/offer`, {
      data: {},
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe('Coupon API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /coupon is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/coupon`);
    expect(response.status()).toBe(200);
  });

  test('POST /coupon without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/coupon`, { data: {} });
    expect(response.status()).toBe(401);
  });

  test('POST /coupon as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/coupon`, {
      data: { code: 'X' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  // update/delete allow any authenticated user per the route definition (no RBAC guard) —
  // documenting current behavior, not asserting it's ideal; a customer editing another
  // user's coupon would only be caught at the service/ownership-check layer if one exists.
  test('PUT /coupon/:id only requires authentication, not admin role', async ({ request }) => {
    const response = await request.put(`${API_URL}/coupon/999999`, {
      data: { code: 'DOESNOTEXIST' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).not.toBe(401);
    expect(response.status()).not.toBe(403);
  });
});
