# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api\live-images.spec.ts >> Live Server Product Images Test >> Products should contain multiple images
- Location: e2e\api\live-images.spec.ts:7:3

# Error details

```
Error: apiRequestContext.get: getaddrinfo ENOTFOUND bucksheet.atozgadgetz.com
Call log:
  - → GET https://bucksheet.atozgadgetz.com/api/products
    - user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.7827.55 Safari/537.36
    - accept: */*
    - accept-encoding: gzip,deflate,br

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | // Use the live API domain as requested by the user
  4  | const LIVE_API_URL = 'https://bucksheet.atozgadgetz.com/api';
  5  | 
  6  | test.describe('Live Server Product Images Test', () => {
  7  |   test('Products should contain multiple images', async ({ request }) => {
  8  |     // 1. Fetch the list of products from the live server
> 9  |     const response = await request.get(`${LIVE_API_URL}/products`);
     |                                    ^ Error: apiRequestContext.get: getaddrinfo ENOTFOUND bucksheet.atozgadgetz.com
  10 |     expect(response.status()).toBe(200);
  11 |     
  12 |     const body = await response.json();
  13 |     expect(body.success).toBe(true);
  14 |     
  15 |     let productsList = [];
  16 |     if (body.data && body.data.products) {
  17 |        productsList = body.data.products;
  18 |     } else if (body.data) {
  19 |        productsList = body.data;
  20 |     }
  21 | 
  22 |     expect(Array.isArray(productsList)).toBe(true);
  23 |     expect(productsList.length).toBeGreaterThan(0);
  24 | 
  25 |     console.log(`\nFound ${productsList.length} products on the live server.`);
  26 |     console.log('Cross-checking the first 5 imported CJ products for multiple images...\n');
  27 | 
  28 |     // 2. Filter for products that look like CJ imports (they usually have long names or CJ SKUs)
  29 |     // We'll just grab the first 5 products to test their detail endpoints.
  30 |     const sampleProducts = productsList.slice(0, 5);
  31 |     
  32 |     let productsWithMultipleImages = 0;
  33 | 
  34 |     for (const p of sampleProducts) {
  35 |       // 3. Fetch product details
  36 |       const detailResponse = await request.get(`${LIVE_API_URL}/products/${p.slug}`);
  37 |       expect(detailResponse.status()).toBe(200);
  38 |       
  39 |       const detailBody = await detailResponse.json();
  40 |       expect(detailBody.success).toBe(true);
  41 |       
  42 |       const product = detailBody.data;
  43 |       
  44 |       // 4. Verify images exist
  45 |       expect(product).toHaveProperty('images');
  46 |       expect(Array.isArray(product.images)).toBe(true);
  47 |       
  48 |       const imageCount = product.images.length;
  49 |       
  50 |       console.log(`Product: ${product.name}`);
  51 |       console.log(`Link: https://atozgadgetz.com/product/${product.slug}`);
  52 |       console.log(`Images found: ${imageCount}`);
  53 |       
  54 |       // Log the image URLs for verification
  55 |       product.images.forEach((img: any, idx: number) => {
  56 |         console.log(`  - Image ${idx + 1}: ${img.url}`);
  57 |       });
  58 |       console.log('---');
  59 | 
  60 |       if (imageCount > 1) {
  61 |         productsWithMultipleImages++;
  62 |       }
  63 |     }
  64 | 
  65 |     console.log(`\nResult: ${productsWithMultipleImages} out of ${sampleProducts.length} checked products had multiple images.`);
  66 |     // We expect at least some products to have multiple images
  67 |     expect(productsWithMultipleImages).toBeGreaterThan(0);
  68 |   });
  69 | });
  70 | 
```