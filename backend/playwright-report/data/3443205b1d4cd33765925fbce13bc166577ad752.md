# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: ui\auth-register-login.spec.ts >> Auth UI — Register and Login >> registers a new user and logs in with email/password
- Location: e2e\ui\auth-register-login.spec.ts:7:3

# Error details

```
PrismaClientValidationError: 
Invalid `prisma.emailActivationToken.findFirst()` invocation:

{
  where: {
    email: "pw_e2e_1784790530387@atozgadgetz.com"
  },
  orderBy: {
    expiresAt: "desc",
    ~~~~~~~~~
?   id?: SortOrder,
?   email?: SortOrder,
?   token_hash?: SortOrder,
?   expires_at?: SortOrder,
?   used_at?: SortOrder | SortOrderInput,
?   created_at?: SortOrder,
?   ip_address?: SortOrder | SortOrderInput,
?   user_agent?: SortOrder | SortOrderInput
  }
}

Unknown argument `expiresAt`. Did you mean `expires_at`? Available options are marked with ?.
```

# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - banner [ref=e4]:
      - generic [ref=e5]: Free worldwide shipping on orders over $30 · 7–15 day delivery · Secure checkout
      - generic [ref=e6]:
        - link "AtoZ Gadgetz Logo AtoZ Gadgetz" [ref=e7] [cursor=pointer]:
          - /url: /
          - img "AtoZ Gadgetz Logo" [ref=e8]
          - generic [ref=e9]: AtoZ Gadgetz
        - generic [ref=e12]:
          - img [ref=e13]
          - searchbox "Search gadgets, electronics, smart home..." [ref=e16]
          - generic:
            - generic: ⌘
            - text: K
          - button "Search" [ref=e17]
        - generic [ref=e18]:
          - link "Account" [ref=e19] [cursor=pointer]:
            - /url: /login
            - img [ref=e20]
          - link "Wishlist" [ref=e23] [cursor=pointer]:
            - /url: /wishlist
            - img [ref=e24]
          - button "Cart" [ref=e26]:
            - img [ref=e27]
      - navigation [ref=e33]:
        - link "All Products" [ref=e34] [cursor=pointer]:
          - /url: /products
        - button "Electronics" [ref=e36]:
          - text: Electronics
          - img [ref=e37]
        - button "Smart Home" [ref=e40]:
          - text: Smart Home
          - img [ref=e41]
        - button "Home Gadgets" [ref=e44]:
          - text: Home Gadgets
          - img [ref=e45]
        - button "More" [ref=e48]:
          - text: More
          - img [ref=e49]
        - button "Deals" [ref=e52]:
          - text: Deals
          - img [ref=e53]
    - main [ref=e55]:
      - generic [ref=e58]:
        - heading "Create Account" [level=1] [ref=e59]
        - paragraph [ref=e60]: Email activation + international mobile setup for secure checkout.
        - generic [ref=e61]:
          - generic [ref=e62]:
            - generic [ref=e63]: Email
            - textbox [ref=e64]: pw_e2e_1784790530387@atozgadgetz.com
          - button "Sending activation link..." [active] [ref=e65]:
            - generic [ref=e66]: Sending activation link...
        - paragraph [ref=e67]:
          - text: Already have an account?
          - link "Sign in" [ref=e68] [cursor=pointer]:
            - /url: /login
    - contentinfo [ref=e69]:
      - generic [ref=e70]:
        - generic [ref=e71]:
          - generic [ref=e72]:
            - link "AtoZ Gadgetz Logo Get all the gadgets under one Roof" [ref=e73] [cursor=pointer]:
              - /url: /
              - img "AtoZ Gadgetz Logo" [ref=e74]
              - generic [ref=e75]: Get all the gadgets under one Roof
            - paragraph [ref=e76]: Shop trending gadgets at affordable prices. Free shipping on qualifying orders. 100% trusted. Delivered worldwide from 50+ global warehouses.
            - generic [ref=e77]:
              - link "contact@atozgadgetz.com" [ref=e78] [cursor=pointer]:
                - /url: mailto:contact@atozgadgetz.com
                - img [ref=e79]
                - text: contact@atozgadgetz.com
              - link "Instagram @atozgadgetzofficial" [ref=e82] [cursor=pointer]:
                - /url: https://www.instagram.com/atozgadgetzofficial/
                - img [ref=e83]
                - text: Instagram @atozgadgetzofficial
          - generic [ref=e87]:
            - heading "Shop" [level=4] [ref=e88]
            - list [ref=e89]:
              - listitem [ref=e90]:
                - link "All Products" [ref=e91] [cursor=pointer]:
                  - /url: /products
              - listitem [ref=e92]:
                - link "Electronics" [ref=e93] [cursor=pointer]:
                  - /url: /category/electronics
              - listitem [ref=e94]:
                - link "Home & Kitchen" [ref=e95] [cursor=pointer]:
                  - /url: /category/home-kitchen
              - listitem [ref=e96]:
                - link "Smart Home" [ref=e97] [cursor=pointer]:
                  - /url: /category/smart-home
              - listitem [ref=e98]:
                - link "Gaming" [ref=e99] [cursor=pointer]:
                  - /url: /category/gaming
              - listitem [ref=e100]:
                - link "Limited Time Offers" [ref=e101] [cursor=pointer]:
                  - /url: /limited-time-offers
          - generic [ref=e102]:
            - heading "Shop by Price" [level=4] [ref=e103]
            - list [ref=e104]:
              - listitem [ref=e105]:
                - link "Under $10 / ₹99" [ref=e106] [cursor=pointer]:
                  - /url: /under-99-gadgetz
              - listitem [ref=e107]:
                - link "Under ₹149" [ref=e108] [cursor=pointer]:
                  - /url: /under-149-gadgetz
              - listitem [ref=e109]:
                - link "Under $20 / ₹199" [ref=e110] [cursor=pointer]:
                  - /url: /under-199-gadgetz
              - listitem [ref=e111]:
                - link "Under ₹249" [ref=e112] [cursor=pointer]:
                  - /url: /under-249-gadgetz
              - listitem [ref=e113]:
                - link "Under ₹299" [ref=e114] [cursor=pointer]:
                  - /url: /under-299-gadgetz
              - listitem [ref=e115]:
                - link "Under $50 / ₹499" [ref=e116] [cursor=pointer]:
                  - /url: /under-499-gadgetz
              - listitem [ref=e117]:
                - link "Under $100 / ₹999" [ref=e118] [cursor=pointer]:
                  - /url: /under-999-gadgetz
          - generic [ref=e119]:
            - heading "Support & Legal" [level=4] [ref=e120]
            - list [ref=e121]:
              - listitem [ref=e122]:
                - link "About Us" [ref=e123] [cursor=pointer]:
                  - /url: /about-us
              - listitem [ref=e124]:
                - link "Contact Us" [ref=e125] [cursor=pointer]:
                  - /url: /contact
              - listitem [ref=e126]:
                - link "Shipping & Payment Policy" [ref=e127] [cursor=pointer]:
                  - /url: /shipping-payment-policy-2
              - listitem [ref=e128]:
                - link "Cancellation, Return & Refund" [ref=e129] [cursor=pointer]:
                  - /url: /return-and-refund-policy
              - listitem [ref=e130]:
                - link "Privacy Policy" [ref=e131] [cursor=pointer]:
                  - /url: /privacy-policy
              - listitem [ref=e132]:
                - link "Terms & Conditions" [ref=e133] [cursor=pointer]:
                  - /url: /terms-conditions
        - generic [ref=e134]:
          - generic [ref=e135]:
            - generic [ref=e136]: Visa
            - generic [ref=e137]: Mastercard
            - generic [ref=e138]: Amex
            - generic [ref=e139]: Maestro
            - generic [ref=e140]: UPI
            - generic [ref=e141]: Net Banking
            - generic [ref=e142]: Debit Card
            - generic [ref=e143]: IMPS
          - paragraph [ref=e144]: We Accept all the payment options so get all the gadgets now.
        - generic [ref=e145]:
          - paragraph [ref=e146]: © 2026 Atoz Gadgetz ·Premium Gadgets with AtoZ· All rights reserved.
          - generic [ref=e147]:
            - generic [ref=e148]: All Days 11am – 9pm IST
            - generic [ref=e149]: ·
            - generic [ref=e150]: Worldwide Delivery
  - button "Open Next.js Dev Tools" [ref=e156] [cursor=pointer]:
    - img [ref=e157]
  - alert [ref=e160]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | import { PrismaClient } from '@prisma/client';
  3  | 
  4  | const prisma = new PrismaClient();
  5  | 
  6  | test.describe('Auth UI — Register and Login', () => {
  7  |   test('registers a new user and logs in with email/password', async ({ page, context }) => {
  8  |     const suffix = Date.now();
  9  |     const email = `pw_e2e_${suffix}@atozgadgetz.com`;
  10 |     const password = 'Password123!';
  11 |     const mobile = `+919${String(suffix).slice(-9)}`;
  12 | 
  13 |     await page.goto('/register');
  14 |     
  15 |     // Step 1: Request magic link
  16 |     const emailInput = page.locator('form input').first();
  17 |     await emailInput.fill(email);
  18 |     await page.getByText(/Send Magic Activation Link/i).click();
  19 |     
  20 |     // Wait for the token to be generated in DB
  21 |     await page.waitForTimeout(2000);
> 22 |     const tokenRecord = await prisma.emailActivationToken.findFirst({
     |                         ^ PrismaClientValidationError: 
  23 |       where: { email },
  24 |       orderBy: { expiresAt: 'desc' },
  25 |     });
  26 |     expect(tokenRecord).not.toBeNull();
  27 |     
  28 |     // Step 2: Complete registration with magic link
  29 |     await page.goto(`/register?activationToken=${tokenRecord?.token}`);
  30 |     
  31 |     const registerInputs = page.locator('form input');
  32 |     // Assuming the order is: First Name, Last Name, Mobile, Password
  33 |     await registerInputs.nth(0).fill('Playwright');
  34 |     await registerInputs.nth(1).fill('Tester');
  35 |     await registerInputs.nth(2).fill(mobile);
  36 |     await registerInputs.nth(3).fill(password);
  37 |     
  38 |     await page.getByText(/Complete Profile/i).click();
  39 | 
  40 |     await page.waitForURL((url) => {
  41 |       const p = url.pathname;
  42 |       return p.startsWith('/account') || p.startsWith('/admin') || p === '/';
  43 |     });
  44 | 
  45 |     const cookies = await context.cookies();
  46 |     const tokenCookie = cookies.find((c) => c.name === 'token');
  47 |     expect(tokenCookie?.value).toBeTruthy();
  48 |   });
  49 | });
  50 | 
```