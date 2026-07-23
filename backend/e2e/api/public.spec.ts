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
    
    let productsList = [];
    if (body.data.products) {
       productsList = body.data.products;
       expect(Array.isArray(productsList)).toBe(true);
    } else {
       productsList = body.data;
       expect(Array.isArray(productsList)).toBe(true);
    }

    console.log(`\n--- Found ${productsList.length} products on the public endpoint ---`);
    const sample = productsList.slice(0, 10); // show top 10
    console.log('You can view these products at the following links:');
    sample.forEach((p: any) => {
      // Assuming frontend runs on localhost:3000
      console.log(`- Frontend URL: http://localhost:3000/product/${p.slug}`);
      console.log(`  API URL:      ${API_URL}/products/${p.slug}`);
      console.log(`  Name:         ${p.name}`);
    });
    console.log('--------------------------------------------------------------\n');
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
