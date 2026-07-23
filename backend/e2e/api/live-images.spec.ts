import { test, expect } from '@playwright/test';

// Use the live API domain as requested by the user
const LIVE_API_URL = 'https://bucksheet.atozgadgetz.com/api';

test.describe('Live Server Product Images Test', () => {
  test('Products should contain multiple images', async ({ request }) => {
    // 1. Fetch the list of products from the live server
    const response = await request.get(`${LIVE_API_URL}/products`);
    expect(response.status()).toBe(200);
    
    const body = await response.json();
    expect(body.success).toBe(true);
    
    let productsList = [];
    if (body.data && body.data.products) {
       productsList = body.data.products;
    } else if (body.data) {
       productsList = body.data;
    }

    expect(Array.isArray(productsList)).toBe(true);
    expect(productsList.length).toBeGreaterThan(0);

    console.log(`\nFound ${productsList.length} products on the live server.`);
    console.log('Cross-checking the first 5 imported CJ products for multiple images...\n');

    // 2. Filter for products that look like CJ imports (they usually have long names or CJ SKUs)
    // We'll just grab the first 5 products to test their detail endpoints.
    const sampleProducts = productsList.slice(0, 5);
    
    let productsWithMultipleImages = 0;

    for (const p of sampleProducts) {
      // 3. Fetch product details
      const detailResponse = await request.get(`${LIVE_API_URL}/products/${p.slug}`);
      expect(detailResponse.status()).toBe(200);
      
      const detailBody = await detailResponse.json();
      expect(detailBody.success).toBe(true);
      
      const product = detailBody.data;
      
      // 4. Verify images exist
      expect(product).toHaveProperty('images');
      expect(Array.isArray(product.images)).toBe(true);
      
      const imageCount = product.images.length;
      
      console.log(`Product: ${product.name}`);
      console.log(`Link: https://atozgadgetz.com/product/${product.slug}`);
      console.log(`Images found: ${imageCount}`);
      
      // Log the image URLs for verification
      product.images.forEach((img: any, idx: number) => {
        console.log(`  - Image ${idx + 1}: ${img.url}`);
      });
      console.log('---');

      if (imageCount > 1) {
        productsWithMultipleImages++;
      }
    }

    console.log(`\nResult: ${productsWithMultipleImages} out of ${sampleProducts.length} checked products had multiple images.`);
    // We expect at least some products to have multiple images
    expect(productsWithMultipleImages).toBeGreaterThan(0);
  });
});
