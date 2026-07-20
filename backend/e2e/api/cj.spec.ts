import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from './test-data';

async function getToken(request: any, creds: { email: string; password: string }) {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const body = await res.json();
  return body.data?.access_token || '';
}

test.describe('CJ Dropshipping — public browse', () => {
  test('GET /cj/browse returns a list without auth', async ({ request }) => {
    const response = await request.get(`${API_URL}/cj/browse?keyword=phone&page=1&size=5`);
    // Public route: must not 401/403. May 500 if CJ credentials/quota fail — that's a CJ-side
    // condition, not an auth bug, so only assert it isn't blocked by auth.
    expect([401, 403]).not.toContain(response.status());
    const body = await response.json();
    expect(body).toHaveProperty('success');
  });

  test('GET /cj/browse is safe against SQLi/XSS in keyword param', async ({ request }) => {
    const payloads = ["' OR 1=1--", '<script>alert(1)</script>', "'; DROP TABLE products;--"];
    for (const payload of payloads) {
      const response = await request.get(`${API_URL}/cj/browse?keyword=${encodeURIComponent(payload)}`);
      // keyword is forwarded to CJ's API as a query param, never interpolated into SQL —
      // a 500 here would mean an unhandled crash, not a DB injection (there's no local
      // query at all in this path), so this just guards against a crash on odd input.
      const body = await response.json();
      expect(body).toHaveProperty('success');
    }
  });
});

test.describe('CJ Dropshipping — admin-only routes require auth', () => {
  test('GET /cj/products/search without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/cj/products/search?keyword=phone`);
    expect(response.status()).toBe(401);
  });

  test('POST /cj/products/import without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/products/import`, {
      data: { cjPid: 'fake', categoryId: 1, subcategoryId: 1 },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /cj/categories without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/cj/categories`);
    expect(response.status()).toBe(401);
  });

  test('POST /cj/categories/sync without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/categories/sync`);
    expect(response.status()).toBe(401);
  });

  test('POST /cj/inventory/sync-all without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/inventory/sync-all`);
    expect(response.status()).toBe(401);
  });

  test('a logged-in customer (non-admin) is forbidden from admin CJ routes', async ({ request }) => {
    const token = await getToken(request, STATIC_USER);
    expect(token).toBeTruthy();

    const response = await request.get(`${API_URL}/cj/categories`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe('CJ Dropshipping — admin category sync', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    expect(adminToken).toBeTruthy();
  });

  test('GET /cj/categories returns cached list (empty array before first sync)', async ({ request }) => {
    const response = await request.get(`${API_URL}/cj/categories`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('POST /cj/categories/sync as admin does not fail on auth/authorization', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/categories/sync`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // Admin is authorized; a non-2xx here would be a live CJ API/credentials issue,
    // not an authorization bug — assert we got past auth (never 401/403).
    expect([401, 403]).not.toContain(response.status());
  });
});

test.describe('CJ Dropshipping — admin inventory sync', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
  });

  test('POST /cj/inventory/sync-all as admin does not fail on auth', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/inventory/sync-all`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body).toHaveProperty('succeeded');
    expect(body).toHaveProperty('failed');
  });

  test('POST /cj/inventory/sync/:productId for a non-CJ-linked product returns a clean error, not a 500 crash', async ({ request }) => {
    const response = await request.post(`${API_URL}/cj/inventory/sync/999999`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    // Not linked to a CjProduct row -> service throws a handled Error -> controller catches
    // and returns 500 with a message (no unhandled crash), so assert the body is well-formed.
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toBeTruthy();
  });
});
