import { test, expect } from '@playwright/test';
import { API_URL, STATIC_USER, TEST_USER } from './test-data';

test.describe('Auth API Tests', () => {
  // Test Registration
  test('POST /auth/register should register a new user', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/register`, {
      data: TEST_USER
    });
    
    // We expect 201 Created or 200 OK
    expect([200, 201]).toContain(response.status());
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('id');
  });

  // Test missing mobile validation
  test('POST /auth/register should fail if mobile is missing', async ({ request }) => {
    const { mobile, ...invalidUser } = TEST_USER;
    const response = await request.post(`${API_URL}/auth/register`, {
      data: invalidUser
    });
    
    // Should be 400 Bad Request
    expect(response.status()).toBe(400);
  });

  // Setup static user for login/me testing
  test.beforeAll(async ({ request }) => {
    // Attempt to register the static user. Ignore error if already exists.
    await request.post(`${API_URL}/auth/register`, {
      data: STATIC_USER
    });
  });

  // Test Login
  test('POST /auth/login should authenticate user and return token', async ({ request }) => {
    const response = await request.post(`${API_URL}/auth/login`, {
      data: {
        email: STATIC_USER.email,
        password: STATIC_USER.password
      }
    });
    
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty('access_token');
  });

  // Test /me without token
  test('GET /auth/me should return 200 with null data without token', async ({ request }) => {
    const response = await request.get(`${API_URL}/auth/me`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.data).toBeNull();
  });

  // Test /me with token
  test('GET /auth/me should succeed with valid token', async ({ request }) => {
    // Get token
    const loginResponse = await request.post(`${API_URL}/auth/login`, {
      data: { email: STATIC_USER.email, password: STATIC_USER.password }
    });
    const loginBody = await loginResponse.json();
    const token = loginBody.data.access_token;

    // Use token
    const meResponse = await request.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    expect(meResponse.status()).toBe(200);
    const meBody = await meResponse.json();
    expect(meBody.success).toBe(true);
    expect(meBody.data.email).toBe(STATIC_USER.email);
  });
});
