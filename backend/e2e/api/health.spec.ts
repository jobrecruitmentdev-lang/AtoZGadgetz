import { test, expect } from '@playwright/test';

test.describe('Backend API Tests', () => {
  // Use the API URL for these tests instead of the baseURL (UI)
  const API_URL = 'https://bukcsheet.atozgadgetz.com';

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
