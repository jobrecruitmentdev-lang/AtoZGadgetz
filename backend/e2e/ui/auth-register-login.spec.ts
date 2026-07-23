import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

test.describe('Auth UI — Register and Login', () => {
  test.skip('registers a new user and logs in with email/password', async ({ page, context }) => {
    const suffix = Date.now();
    const email = `pw_e2e_${suffix}@atozgadgetz.com`;
    const password = 'Password123!';
    const mobile = `+919${String(suffix).slice(-9)}`;

    await page.goto('/register');
    
    // Step 1: Request magic link
    const emailInput = page.locator('form input').first();
    await emailInput.fill(email);
    await page.getByText(/Send Magic Activation Link/i).click();
    
    // Wait for the token to be generated in DB
    await page.waitForTimeout(2000);
    const tokenRecord = await prisma.emailActivationToken.findFirst({
      where: { email },
      orderBy: { expiresAt: 'desc' },
    });
    expect(tokenRecord).not.toBeNull();
    
    // Step 2: Complete registration with magic link
    await page.goto(`/register?activationToken=${tokenRecord?.token}`);
    
    const registerInputs = page.locator('form input');
    // Assuming the order is: First Name, Last Name, Mobile, Password
    await registerInputs.nth(0).fill('Playwright');
    await registerInputs.nth(1).fill('Tester');
    await registerInputs.nth(2).fill(mobile);
    await registerInputs.nth(3).fill(password);
    
    await page.getByText(/Complete Profile/i).click();

    await page.waitForURL((url) => {
      const p = url.pathname;
      return p.startsWith('/account') || p.startsWith('/admin') || p === '/';
    });

    const cookies = await context.cookies();
    const tokenCookie = cookies.find((c) => c.name === 'token');
    expect(tokenCookie?.value).toBeTruthy();
  });
});
