import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from './test-data';

async function getToken(request: any, creds: { email: string; password: string }) {
  const res = await request.post(`${API_URL}/auth/login`, { data: creds });
  const body = await res.json();
  return body.data?.access_token || '';
}

test.describe('Order API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /order (admin list) without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/order`);
    expect(response.status()).toBe(401);
  });

  test('GET /order (admin list) as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/order`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /order (admin list) as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/order`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });

  test('GET /order/mine without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/order/mine`);
    expect(response.status()).toBe(401);
  });

  test('POST /order/place without token returns 401', async ({ request }) => {
    const response = await request.post(`${API_URL}/order/place`, { data: {} });
    expect(response.status()).toBe(401);
  });

  test('GET /order/:id for another user\'s (non-existent) order does not leak via 500', async ({ request }) => {
    const response = await request.get(`${API_URL}/order/999999`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect([403, 404]).toContain(response.status());
  });
});

test.describe('Payment API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /payment (admin) without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/payment`);
    expect(response.status()).toBe(401);
  });

  test('GET /payment (admin) as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/payment`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /payment as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/payment`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });

  test('POST /payment/razorpay/create-order without token returns 400', async ({ request }) => {
    const response = await request.post(`${API_URL}/payment/razorpay/create-order`, { data: { amount: 100 } });
    expect(response.status()).toBe(400);
  });

  test('POST /payment/razorpay/verify with tampered signature is rejected, not a 500', async ({ request }) => {
    const response = await request.post(`${API_URL}/payment/razorpay/verify`, {
      data: {
        razorpay_order_id: 'order_fake',
        razorpay_payment_id: 'pay_fake',
        razorpay_signature: 'not_a_real_signature',
      },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).not.toBe(500);
    expect(response.status()).not.toBe(200);
  });
});

test.describe('Shipment API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /shipment without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/shipment`);
    expect(response.status()).toBe(401);
  });

  test('GET /shipment as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/shipment`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /shipment as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/shipment`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });
});

test.describe('Return Order API', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /return-order (admin) without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/return-order`);
    expect(response.status()).toBe(401);
  });

  test('GET /return-order (admin) as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/return-order`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('POST /return-order only requires authentication (any logged-in user)', async ({ request }) => {
    const response = await request.post(`${API_URL}/return-order`, {
      data: { order_id: 999999, reason: 'e2e test' },
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).not.toBe(401);
  });
});

test.describe('Inventory API (admin-only, requires inventory.manage / bypassed for admin role)', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getToken(request, ADMIN_USER);
    customerToken = await getToken(request, STATIC_USER);
  });

  test('GET /inventory without token returns 401', async ({ request }) => {
    const response = await request.get(`${API_URL}/inventory`);
    expect(response.status()).toBe(401);
  });

  test('GET /inventory as non-admin returns 403', async ({ request }) => {
    const response = await request.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${customerToken}` },
    });
    expect(response.status()).toBe(403);
  });

  test('GET /inventory as admin returns 200', async ({ request }) => {
    const response = await request.get(`${API_URL}/inventory`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(response.status()).toBe(200);
  });
});
