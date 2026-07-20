import { test, expect } from '@playwright/test';

test.describe('Backend API Tests', () => {
  // Root of the API server (not /api — /health and 404s are unprefixed routes).
  // Defaults to local; override with BACKEND_ROOT_URL to point elsewhere.
  const API_URL = process.env.BACKEND_ROOT_URL || 'http://127.0.0.1:8080';

  test('health endpoint should return status: ok', async ({ request }) => {
    const response = await request.get(`${API_URL}/health`);
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  // A basic test that verifies the API responds securely on a non-existent or auth route
  test('unauthorized or missing endpoints return appropriate error', async ({ request }) => {
    const response = await request.get(`${API_URL}/non-existent-route-for-e2e`);
    expect(response.status()).toBe(404);
  });
});
