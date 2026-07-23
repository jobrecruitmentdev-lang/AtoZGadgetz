import { test, expect } from '@playwright/test';

test.describe('Category Pages E2E Tests', () => {
  const categories = [
    { name: 'Audio', slug: 'audio' },
    { name: 'Mobile Accessories', slug: 'mobile-accessories' },
    { name: 'Smart Home', slug: 'smart-home' },
    { name: 'Gaming', slug: 'gaming' },
  ];

  for (const category of categories) {
    test(`Category page for ${category.name} should load and contain products`, async ({ page }) => {
      await page.goto(`/category/${category.slug}`);
      await page.waitForLoadState('domcontentloaded');

      // Assert that the 'No products found' message is NOT visible
      const noProductsMsg = page.locator('text=No products found for this category');
      await expect(noProductsMsg).not.toBeVisible();

      // Assert that at least one product is loaded and visible
      // Product cards usually link to /product/...
      const productLinks = page.locator('a[href^="/product/"]');
      const count = await productLinks.count();
      expect(count).toBeGreaterThan(0);
    });
  }
});
