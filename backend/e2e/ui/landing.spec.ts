import { test, expect } from '@playwright/test';

test.describe('Frontend UI Tests', () => {
  test('Landing page should load successfully', async ({ page }) => {
    // Navigate to the base URL (https://atozgadgetz.com)
    await page.goto('/');

    // Wait for the page to be fully loaded
    await page.waitForLoadState('domcontentloaded');

    // Basic sanity checks: ensure title is not empty, meaning it actually rendered
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Ensure the main layout element exists
    const bodyVisible = await page.isVisible('body');
    expect(bodyVisible).toBeTruthy();
  });
});
