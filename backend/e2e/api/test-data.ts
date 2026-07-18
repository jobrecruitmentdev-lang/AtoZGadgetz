// e2e/api/test-data.ts

export const API_URL = 'https://bukcsheet.atozgadgetz.com/api';

// Generate a random email so tests don't fail due to unique constraint if run repeatedly
// Or use a static one but handle 400s safely. We'll use a semi-static one for the primary test user.
export const TEST_USER = {
  first_name: 'Test',
  last_name: 'UserE2E',
  email: `e2etest_${Date.now()}@atozgadgetz.com`, // using timestamp to ensure uniqueness per test run for registration test
  mobile: `1234567890`,
  password: 'Password123!'
};

// We will also keep a static user for authenticated routes (login and get token)
export const STATIC_USER = {
  first_name: 'Static',
  last_name: 'TestUser',
  email: 'static_e2e@atozgadgetz.com',
  mobile: '0987654321',
  password: 'Password123!'
};
