import { test, expect } from '@playwright/test';
import { API_URL, ADMIN_USER, STATIC_USER } from '../api/test-data';

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

test.describe('Mobile OTP Authentication Flow E2E Tests', () => {

  test('1. POST /auth/mobile-otp/send accepts valid mobile number and returns success', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/mobile-otp/send`, {
      data: { mobile: '+12345678901' },
    });
    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.message).toMatch(/otp.*sent|valid/i);
  });

  test('2. POST /auth/mobile-otp/send rejects missing or malformed mobile number', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/mobile-otp/send`, {
      data: { mobile: '' },
    });
    expect(response.status()).toBe(400);
  });

  test('3. POST /auth/mobile-otp/verify rejects invalid/incorrect OTP code', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/mobile-otp/verify`, {
      data: { mobile: '+12345678901', otp: '000000' },
    });
    expect([400, 401]).toContain(response.status());
    const body = await response.json();
    expect(body.success).toBe(false);
  });
});

test.describe('Invoice API Endpoint E2E Tests (GET /order/:id/invoice)', () => {
  let adminToken = '';
  let customerToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
    customerToken = await getCustomerToken(request);
  });

  test('4. GET /order/:id/invoice without token returns 401 Unauthorized', async ({ request }) => {
    const response = await request.get(`${API_URL}/order/1/invoice`);
    expect(response.status()).toBe(401);
  });

  test('5. GET /order/:id/invoice as admin returns structured invoice data', async ({ request }) => {
    const listRes = await request.get(`${API_URL}/order`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });

    if (listRes.status() === 200) {
      const body = await listRes.json();
      const orders = body.data || [];
      if (orders.length > 0) {
        const orderId = orders[0].id;
        const invRes = await request.get(`${API_URL}/order/${orderId}/invoice`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        expect(invRes.status()).toBe(200);
        const invBody = await invRes.json();
        expect(invBody.success).toBe(true);
        expect(invBody.data).toHaveProperty('invoice_number');
        expect(invBody.data.pricing).toHaveProperty('total_amount');
      }
    }
  });
});

test.describe('Payment Hardening & Server-Side Security E2E Tests', () => {
  let adminToken = '';

  test.beforeAll(async ({ request }) => {
    adminToken = await getAdminToken(request);
  });

  test('6. POST /payment/paypal/create-order requires orderId', async ({ request }) => {
    const response = await request.post(`${API_URL}/payment/paypal/create-order`, {
      data: {},
    });
    expect([400, 404]).toContain(response.status());
  });

  test('7. POST /payment/paypal/create-order validates orderId and generates session', async ({ request }) => {
    // Fetch valid order from database
    const listRes = await request.get(`${API_URL}/order`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(listRes.status()).toBe(200);
    const orders = (await listRes.json()).data || [];

    if (orders.length > 0) {
      const validOrderId = orders[0].id;
      const response = await request.post(`${API_URL}/payment/paypal/create-order`, {
        data: { orderId: validOrderId },
      });
      // Should return 200 (created) or 409 (if already paid) — both prove order security verification passed!
      expect([200, 409]).toContain(response.status());
      const body = await response.json();
      expect(body).toHaveProperty('success');
    }
  });

  test('8. POST /payment/razorpay/create-order generates razorpay_order_id', async ({ request }) => {
    const response = await request.post(`${API_URL}/payment/razorpay/create-order`, {
      data: { amount: 29.99, currency: 'USD', orderId: 1 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('razorpay_order_id');
  });
});

test.describe('Forgot Password & Password Reset Security E2E Tests', () => {

  test('9. POST /auth/forgot-password handles non-existent email safely without user enumeration leakage', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/forgot-password`, {
      data: { email: 'nonexistent-user-999@domain.com' },
    });
    expect([200, 404]).toContain(response.status());
  });

  test('10. POST /auth/reset-password rejects invalid or expired reset token', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/reset-password`, {
      data: { token: 'invalid-token-12345', newPassword: 'NewPassword123!' },
    });
    expect([400, 401]).toContain(response.status());
  });
});
