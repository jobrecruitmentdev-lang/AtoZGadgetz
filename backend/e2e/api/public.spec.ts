import { test, expect } from '@playwright/test';
import { API_URL } from './test-data';

test.describe('Public API Tests (Read-Only)', () => {

  test('GET /categories should return category list', async ({ request }) => {
    const response = await request.get(`${API_URL}/categories`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /products should return products list', async ({ request }) => {
    const response = await request.get(`${API_URL}/products`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    // Products response usually paginated or wrapped in an array
    if (body.data.products) {
       expect(Array.isArray(body.data.products)).toBe(true);
    } else {
       expect(Array.isArray(body.data)).toBe(true);
    }
  });

  test('GET /brands should return brands list', async ({ request }) => {
    const response = await request.get(`${API_URL}/brands`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
  });

  test('GET /offer should return active offers', async ({ request }) => {
    const response = await request.get(`${API_URL}/offer/active`);
    expect([200, 404]).toContain(response.status()); // It might be 404 if no active offers exist, which is fine
  });

  test('GET /banner should return active banners', async ({ request }) => {
    const response = await request.get(`${API_URL}/banner/active`);
    expect([200, 404]).toContain(response.status());
  });

});
