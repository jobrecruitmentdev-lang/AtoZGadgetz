import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Run tests sequentially to avoid resource exhaustion
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker to be "humanly" slow and avoid hitting server limits
  reporter: 'html',
  use: {
    baseURL: 'https://atozgadgetz.com',
    trace: 'on-first-retry',
    // Slow down interactions to emulate human speed and reduce server load
    launchOptions: {
      slowMo: 1000, 
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
