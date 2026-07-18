import { test, expect } from '@playwright/test';
import { API_URL, STATIC_USER } from './test-data';

test.describe('Authenticated User API Tests', () => {
  let token = '';

  test.beforeAll(async ({ request }) => {
    // Ensure the static user is logged in and we have a token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: STATIC_USER.email, password: STATIC_USER.password }
    });
    
    if (loginResponse.ok()) {
      const body = await loginResponse.json();
      token = body.data?.access_token || '';
    } else {
      // If login failed, it might be because the user doesn't exist yet (tests run out of order)
      await request.post(`${API_URL}/auth/register`, { data: STATIC_USER });
      const retryResponse = await request.post(`${API_URL}/auth/login`, {
        data: { email: STATIC_USER.email, password: STATIC_USER.password }
      });
      const body = await retryResponse.json();
      token = body.data?.access_token || '';
    }
  });

  test('GET /address should return user addresses', async ({ request }) => {
    const response = await request.get(`${API_URL}/address`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('GET /cart should return user cart', async ({ request }) => {
    const response = await request.get(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('GET /wishlist should return user wishlist', async ({ request }) => {
    const response = await request.get(`${API_URL}/wishlist`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test('GET /order/mine should return user orders', async ({ request }) => {
    const response = await request.get(`${API_URL}/order/mine`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    expect([200, 404]).toContain(response.status()); // 404 might mean no orders found, which is ok for a test user
  });

});
