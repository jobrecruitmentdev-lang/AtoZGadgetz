import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from '../api/test-data';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

async function getAdminToken(request: any) {
  const res = await request.post(`${API_URL}/auth/login`, { data: ADMIN_USER });
  const body = await res.json();
  return body.data?.access_token || '';
}

async function getCustomerToken(request: any) {
  const res = await request.post(`${API_URL}/auth/login`, { data: STATIC_USER });
  const body = await res.json();
  return body.data?.access_token || '';
}

test.describe('Admin Panel — E2E Security & Authorization Suite', () => {

  test('1. Unauthenticated request to strict Admin routes returns 401 Unauthorized', async ({ request }) => {
    const strictAdminEndpoints = [
      `${API_URL}/cj/inventory/sync-all`,
      `${API_URL}/cj/categories/sync`,
      `${API_URL}/audit-log`,
      `${API_URL}/media-file`,
    ];

    for (const ep of strictAdminEndpoints) {
      const res = await request.get(ep);
      expect(res.status()).toBe(401);
    }
  });

  test('2. Non-admin customer user receives 403 Forbidden on strict Admin routes', async ({ request }) => {
    const customerToken = await getCustomerToken(request);
    expect(customerToken).toBeTruthy();

    const strictAdminEndpoints = [
      `${API_URL}/cj/inventory/sync-all`,
      `${API_URL}/cj/categories/sync`,
      `${API_URL}/audit-log`,
      `${API_URL}/media-file`,
    ];

    for (const ep of strictAdminEndpoints) {
      const res = await request.get(ep, {
        headers: { Authorization: `Bearer ${customerToken}` },
      });
      expect(res.status()).toBe(403);
    }
  });

  test('3. Admin user authenticated access succeeds on Admin endpoints', async ({ request }) => {
    const adminToken = await getAdminToken(request);
    expect(adminToken).toBeTruthy();

    const res = await request.get(`${API_URL}/audit-log`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});

test.describe('Admin Panel — CJ Gateway Import & Pagination Suite', () => {

  test('4. CJ Gateway Browse endpoint supports page pagination and custom batch size', async ({ request }) => {
    const resPage1 = await request.get(`${API_URL}/cj/browse?keyword=gadgets&page=1&size=12`);
    expect(resPage1.status()).toBe(200);
    const body1 = await resPage1.json();
    expect(body1.success).toBe(true);
    expect(Array.isArray(body1.data?.list)).toBe(true);

    const resPage2 = await request.get(`${API_URL}/cj/browse?keyword=gadgets&page=2&size=12`);
    expect(resPage2.status()).toBe(200);
    const body2 = await resPage2.json();
    expect(body2.success).toBe(true);
  });

  test('5. CJ Gateway handles XSS and special characters safely without 500 crashes', async ({ request }) => {
    const xssPayloads = [
      "<script>alert('xss')</script>",
      "' OR '1'='1",
      "'; DROP TABLE products;--",
      "../../etc/passwd",
    ];

    for (const payload of xssPayloads) {
      const res = await request.get(`${API_URL}/cj/browse?keyword=${encodeURIComponent(payload)}&page=1&size=12`);
      expect(res.status()).not.toBe(500);
      const body = await res.json();
      expect(body).toHaveProperty('success');
    }
  });
});

test.describe('Admin Panel — Frontend Routes E2E Health Checks', () => {

  test('6. Admin Catalog Import UI endpoint health check', async ({ request }) => {
    const res = await request.get(`${FRONTEND_URL}/admin/catalog/import`);
    expect(res.status()).toBe(200);
  });

  test('7. Admin Catalog Products UI endpoint health check', async ({ request }) => {
    const res = await request.get(`${FRONTEND_URL}/admin/catalog/products`);
    expect(res.status()).toBe(200);
  });

  test('8. Admin Categories UI endpoint health check', async ({ request }) => {
    const res = await request.get(`${FRONTEND_URL}/admin/categories`);
    expect(res.status()).toBe(200);
  });

  test('9. Admin Orders UI endpoint health check', async ({ request }) => {
    const res = await request.get(`${FRONTEND_URL}/admin/orders`);
    expect(res.status()).toBe(200);
  });
});
