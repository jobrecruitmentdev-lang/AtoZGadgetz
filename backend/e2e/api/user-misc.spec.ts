import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from './test-data';

async function getToken(request: any, creds: { email: string; password: string }) {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const body = await res.json();
  return body.data?.access_token || '';
}

test.describe('Product Review API', () => {
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /product-review is public', async ({ request }) => {
    const response = await request.get(`${API_URL}/product-review`);
    expect(response.status()).toBe(200);
  });

  test('POST /product-review without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/product-review`, {
      data: { product_id: 1, rating: 5, comment: 'great' },
    });
    expect(response.status()).toBe(401);
  });

  test('POST /product-review escapes/handles XSS in comment without crashing', async ({ request }) => {
    const response = await request.post(`${API_URL}/product-review`, {
      data: { product_id: 1, rating: 5, comment: '<script>alert(1)</script>' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).not.toBe(500);
    if (response.status() < 300) {
      const body = await response.json();
      expect(JSON.stringify(body)).not.toContain('<script>alert(1)</script>');
    }
  });
});

test.describe('Notification API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /notification without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/notification`);
    expect(response.status()).toBe(401);
  });

  test('GET /notification with token returns 200 (any authenticated user)', async ({ request }) => {
    const response = await request.get(`${API_URL}/notification`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(200);
  });

  test('POST /notification as non-admin returns 403', async ({ request }) => {
    const response = await request.post(`${API_URL}/notification`, {
      data: { title: 'x', message: 'x' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('POST /notification as admin succeeds', async ({ request }) => {
    const response = await request.post(`${API_URL}/notification`, {
      data: { title: 'E2E Test', message: 'created by e2e test', user_id: 1 },
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).not.toBe(401);
    expect(response.status()).not.toBe(403);
  });
});

test.describe('User Session API', () => {
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /user-session without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/user-session`);
    expect(response.status()).toBe(401);
  });

  test('GET /user-session with token returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/user-session`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(200);
  });
});

test.describe('Analytics Event API', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
  });

  test('POST /analytics-event is public (client-side tracking beacon, no auth)', async ({ request }) => {
    const response = await request.post(`${API_URL}/analytics-event`, {
      data: { event_type: 'page_view', page: '/e2e-test' },
    });
    expect(response.status()).not.toBe(401);
  });

  test('GET /analytics-event without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/analytics-event`);
    expect(response.status()).toBe(401);
  });

  test('GET /analytics-event as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/analytics-event`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });
});

test.describe('Media File API (admin-only)', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /media-file without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/media-file`);
    expect(response.status()).toBe(401);
  });

  test('GET /media-file as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/media-file`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /media-file as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/media-file`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });
});

test.describe('Audit Log API (admin-only, report.view)', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /audit-log without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/audit-log`);
    expect(response.status()).toBe(401);
  });

  test('GET /audit-log as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/audit-log`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /audit-log as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/audit-log`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });
});
