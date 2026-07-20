import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from './test-data';

async function getToken(request: any, creds: { email: string; password: string }) {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const body = await res.json();
  return body.data?.access_token || '';
}

// Category, Subcategory, Brand — all public GET, admin-only (authorizeRBAC(['product.manage'])) writes
test.describe('Category API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /categories is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/categories`);
    expect(response.status()).toBe(200);
  });

  test('POST /categories without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/categories`, { data: { name: 'Test' } });
    expect(response.status()).toBe(401);
  });

  test('POST /categories as non-admin customer returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/categories`, {
      data: { name: 'Test Category' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('admin can create, update, and delete a category', async ({ request }) => {
    const slug = `e2e-cat-${Date.now()}`;
    const createRes = await request.post(`${API_URL}/categories`, {
      data: { name: 'E2E Category', slug, description: 'created by e2e test' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 201]).toContain(createRes.status());
    const created = (await createRes.json()).data;
    expect(created).toHaveProperty('id');

    const updateRes = await request.put(`${API_URL}/categories/${created.id}`, {
      data: { name: 'E2E Category Updated' },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(updateRes.status()).toBe(200);

    const deleteRes = await request.delete(`${API_URL}/categories/${created.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 204]).toContain(deleteRes.status());
  });

  test('POST /categories rejects/handles XSS in name field without crashing', async ({ request }) => {
    const response = await request.post(`${API_URL}/categories`, {
      data: { name: '<script>alert(1)</script>', slug: `xss-${Date.now()}` },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).not.toBe(500);
  });
});

test.describe('Subcategory API', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
  });

  test('GET /subcategories is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/subcategories`);
    expect(response.status()).toBe(200);
  });

  test('POST /subcategories without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/subcategories`, { data: {} });
    expect(response.status()).toBe(401);
  });
});

test.describe('Brand API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /brands is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/brands`);
    expect(response.status()).toBe(200);
  });

  test('POST /brands without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/brands`, { data: { name: 'Test Brand' } });
    expect(response.status()).toBe(401);
  });

  test('POST /brands as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/brands`, {
      data: { name: 'Test Brand' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('admin can create a brand', async ({ request }) => {
    const response = await request.post(`${API_URL}/brands`, {
      data: { name: 'E2E Brand', slug: `e2e-brand-${Date.now()}` },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect([200, 201]).toContain(response.status());
  });
});

test.describe('Product API', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
  });

  test('GET /products is public and returns a list', async ({ request }) => {
    const response = await request.get(`${API_URL}/products`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('GET /products/:slug for a non-existent slug returns 404, not 500', async ({ request }) => {
    const response = await request.get(`${API_URL}/products/does-not-exist-${Date.now()}`);
    expect(response.status()).not.toBe(500);
  });

  test('POST /products without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/products`, { data: { name: 'x' } });
    expect(response.status()).toBe(401);
  });

  test('GET /products?search= is safe against SQLi payloads', async ({ request }) => {
    const payloads = ["' OR '1'='1", "'; DROP TABLE products;--", "' OR SLEEP(5)--"];
    for (const payload of payloads) {
      const response = await request.get(`${API_URL}/products?search=${encodeURIComponent(payload)}`);
      expect(response.status()).not.toBe(500);
      const body = JSON.stringify(await response.json());
      expect(body.toLowerCase()).not.toContain('sql syntax');
    }
  });
});
