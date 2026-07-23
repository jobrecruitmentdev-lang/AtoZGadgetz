// e2e/api/test-data.ts

export const API_URL = process.env.API_URL || 'http://127.0.0.1:8080/api';

// Generate a random email so tests don't fail due to unique constraint if run repeatedly
// Or use a static one but handle 400s safely. We'll use a semi-static one for the primary test user.
export const TEST_USER = {
  first_name: 'Test',
  last_name: 'UserE2E',
  email: `e2etest_${Date.now()}@atozgadgetz.com`, // using timestamp to ensure uniqueness per test run for registration test
  mobile: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  password: 'Password123!'
};

// We will also keep a static user for authenticated routes (login and get token)
export const STATIC_USER = {
  first_name: 'Static',
  last_name: 'TestUser',
  email: 'static_e2e@atozgadgetz.com',
  mobile: '+10987654321',
  password: 'Password123!'
};

// Seeded by prisma/seed.ts — role_id 1 (SuperAdmin), used for admin-only CJ routes
export const ADMIN_USER = {
  email: 'admin@atozgadgets.com',
  password: 'admin123',
};
