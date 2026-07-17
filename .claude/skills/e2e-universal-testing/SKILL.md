---
name: e2e-universal-testing
description: |
  End-to-end testing skill covering ALL layers and ALL major tech stacks.
  Activates for: unit tests, API tests, function tests, security tests, auth tests,
  integration tests, and SQL injection (SQLi) tests. Universal — works across
  Next.js, React, Node.js, FastAPI, Django, Laravel, Spring Boot, Go, Rails,
  React Native, Flutter, PostgreSQL, MySQL, MongoDB.
tools: [Read, Write, Bash, PowerShell, Grep, Glob]
---

# E2E Universal Testing Skill

## Role
You are a **Senior QA Architect and Security Engineer**. Your job is to write, run, and fix tests — not to explain concepts. Every invocation of this skill results in actual test files written to disk and commands run to execute them.

## Core Mandate
- **Always write real test code.** Never only explain.
- **Never break existing tests.** Only add — never delete passing tests.
- **Cover happy path + edge cases + failure modes** for every tested unit.
- **Security tests are mandatory** on any auth route, DB query, or API endpoint.

---

## 1. Tech Stack → Test Tool Decision Table

| Layer | Stack | Primary Tool | Secondary |
|---|---|---|---|
| Unit | TypeScript / JS | **Vitest** | Jest |
| Unit | Python | **Pytest** | unittest |
| Unit | Java / Spring | **JUnit 5** | Mockito |
| Unit | Go | **go test** | testify |
| Unit | PHP / Laravel | **PHPUnit** | Pest |
| Unit | Ruby / Rails | **RSpec** | Minitest |
| Unit | Dart / Flutter | **flutter_test** | mockito |
| API | REST (any stack) | **Vitest + supertest** OR **pytest + httpx** | Postman/Newman |
| API | GraphQL | **Vitest + graphql-request** | Apollo Client test utils |
| API | gRPC | **grpc-testing** | Buf |
| E2E UI | Next.js / React | **Playwright** | Cypress |
| E2E UI | Mobile (RN) | **Detox** | Maestro |
| E2E UI | Flutter | **integration_test** | Patrol |
| Integration | DB (Postgres/MySQL) | **Testcontainers** | in-memory SQLite |
| Integration | Redis | **ioredis-mock** | Testcontainers |
| Security | Any | **OWASP ZAP** + manual payloads | Semgrep SAST |
| SQLi | Any DB | **sqlmap** (authorized env) + manual payload suite | parameterized query audit |
| Auth | JWT / OAuth | **Custom Vitest/Pytest** + **jwt-decode** | Burp Suite |
| Load | Any | **k6** | Artillery |

**Rule:** Always prefer the Primary tool. Only use Secondary if Primary is incompatible.

---

## 2. Universal File & Folder Conventions

```
project/
  __tests__/           ← JS/TS unit + integration tests
    unit/
    integration/
    api/
    security/
    auth/
  tests/               ← Python tests (pytest discovers automatically)
    unit/
    integration/
    api/
    security/
    auth/
  e2e/                 ← Playwright / Cypress / Detox
    specs/
    fixtures/
    helpers/
  src/
    __tests__/         ← co-located unit tests (acceptable alternative)
```

**Test file naming:**
- JS/TS: `*.test.ts` or `*.spec.ts`
- Python: `test_*.py` or `*_test.py`
- Go: `*_test.go` (same package)
- Java: `*Test.java` (Maven/Gradle convention)

---

## 3. Unit Testing

### 3.1 TypeScript / Next.js / Node.js (Vitest)

**Setup:**
```bash
npm i -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

**`vitest.config.ts`:**
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 },
    },
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

**Pattern — Pure function unit test:**
```ts
// __tests__/unit/utils/price.test.ts
import { describe, it, expect } from 'vitest'
import { formatPrice, applyDiscount } from '@/lib/utils/price'

describe('formatPrice', () => {
  it('formats INR correctly', () => {
    expect(formatPrice(1999, 'INR')).toBe('₹1,999.00')
  })
  it('handles zero', () => {
    expect(formatPrice(0, 'INR')).toBe('₹0.00')
  })
  it('throws on negative', () => {
    expect(() => formatPrice(-1, 'INR')).toThrow('Price cannot be negative')
  })
})

describe('applyDiscount', () => {
  it('applies percentage discount', () => {
    expect(applyDiscount(1000, 10)).toBe(900)
  })
  it('never returns below zero', () => {
    expect(applyDiscount(100, 200)).toBe(0)
  })
})
```

**Pattern — React Component unit test:**
```tsx
// __tests__/unit/components/ProductCard.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProductCard } from '@/components/ProductCard'

const mockProduct = { id: '1', name: 'Test Gadget', price: 999, stock: 5 }

describe('ProductCard', () => {
  it('renders product name and price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Test Gadget')).toBeInTheDocument()
    expect(screen.getByText('₹999')).toBeInTheDocument()
  })

  it('shows out-of-stock when stock is 0', () => {
    render(<ProductCard product={{ ...mockProduct, stock: 0 }} />)
    expect(screen.getByText(/out of stock/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeDisabled()
  })

  it('calls onAddToCart with product id on click', async () => {
    const onAddToCart = vi.fn()
    render(<ProductCard product={mockProduct} onAddToCart={onAddToCart} />)
    await userEvent.click(screen.getByRole('button', { name: /add to cart/i }))
    expect(onAddToCart).toHaveBeenCalledWith('1')
    expect(onAddToCart).toHaveBeenCalledTimes(1)
  })
})
```

**Run:**
```bash
npx vitest run                          # single run
npx vitest run --coverage               # with coverage
npx vitest watch                        # watch mode
npx vitest run __tests__/unit           # specific folder
```

---

### 3.2 Python / FastAPI / Django (Pytest)

**Setup:**
```bash
pip install pytest pytest-asyncio pytest-cov httpx factory-boy faker
```

**`pytest.ini`:**
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
addopts = --cov=app --cov-report=term-missing --cov-fail-under=80
```

**Pattern — Pure function:**
```python
# tests/unit/test_price_utils.py
import pytest
from app.utils.price import format_price, apply_discount

def test_format_price_inr():
    assert format_price(1999, "INR") == "₹1,999.00"

def test_format_price_zero():
    assert format_price(0, "INR") == "₹0.00"

def test_format_price_negative_raises():
    with pytest.raises(ValueError, match="Price cannot be negative"):
        format_price(-1, "INR")

@pytest.mark.parametrize("price,discount,expected", [
    (1000, 10, 900),
    (500, 50, 250),
    (100, 200, 0),   # cannot go below 0
])
def test_apply_discount(price, discount, expected):
    assert apply_discount(price, discount) == expected
```

**Pattern — Async service:**
```python
# tests/unit/test_product_service.py
import pytest
from unittest.mock import AsyncMock, patch
from app.services.product import ProductService

@pytest.fixture
def product_service():
    return ProductService()

@pytest.mark.asyncio
async def test_get_product_returns_product(product_service):
    mock_product = {"id": "1", "name": "Test", "price": 999}
    with patch.object(product_service, "repository") as repo:
        repo.find_by_id = AsyncMock(return_value=mock_product)
        result = await product_service.get_product("1")
    assert result["name"] == "Test"

@pytest.mark.asyncio
async def test_get_product_not_found_raises(product_service):
    with patch.object(product_service, "repository") as repo:
        repo.find_by_id = AsyncMock(return_value=None)
        with pytest.raises(ValueError, match="Product not found"):
            await product_service.get_product("nonexistent")
```

**Run:**
```bash
pytest                                  # all tests
pytest tests/unit -v                    # unit only, verbose
pytest -k "test_price" -v              # name filter
pytest --cov=app --cov-report=html     # with HTML coverage
```

---

## 4. API Testing

### 4.1 REST API — TypeScript (Vitest + Supertest)

**Setup:**
```bash
npm i -D supertest @types/supertest
```

**Pattern:**
```ts
// __tests__/api/products.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '@/server'
import { prisma } from '@/lib/prisma'

let server: ReturnType<typeof app.listen>

beforeAll(async () => {
  server = app.listen(0)  // random port
  await prisma.$connect()
})

afterAll(async () => {
  server.close()
  await prisma.$disconnect()
})

describe('GET /api/products', () => {
  it('returns 200 with products array', async () => {
    const res = await request(server).get('/api/products')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('data')
    expect(Array.isArray(res.body.data)).toBe(true)
  })

  it('supports pagination via ?page=1&limit=10', async () => {
    const res = await request(server).get('/api/products?page=1&limit=10')
    expect(res.status).toBe(200)
    expect(res.body.data.length).toBeLessThanOrEqual(10)
    expect(res.body).toHaveProperty('total')
    expect(res.body).toHaveProperty('page', 1)
  })

  it('returns 400 on invalid limit', async () => {
    const res = await request(server).get('/api/products?limit=abc')
    expect(res.status).toBe(400)
    expect(res.body).toHaveProperty('error')
  })
})

describe('POST /api/products', () => {
  it('creates a product when authenticated', async () => {
    const token = await getTestAdminToken()
    const res = await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'New Gadget', price: 1999, stock: 10 })
    expect(res.status).toBe(201)
    expect(res.body.data).toMatchObject({ name: 'New Gadget', price: 1999 })
  })

  it('returns 401 without auth token', async () => {
    const res = await request(server)
      .post('/api/products')
      .send({ name: 'New Gadget', price: 1999 })
    expect(res.status).toBe(401)
  })

  it('returns 422 on missing required fields', async () => {
    const token = await getTestAdminToken()
    const res = await request(server)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '' })   // missing price
    expect(res.status).toBe(422)
    expect(res.body.errors).toBeDefined()
  })
})
```

### 4.2 REST API — Python (Pytest + httpx + FastAPI TestClient)

```python
# tests/api/test_products_api.py
import pytest
from httpx import AsyncClient
from app.main import app
from tests.factories import ProductFactory

@pytest.mark.asyncio
async def test_list_products_returns_200():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/v1/products")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert isinstance(data["data"], list)

@pytest.mark.asyncio
async def test_create_product_requires_auth():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/products", json={"name": "Test", "price": 100})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_product_with_valid_token(auth_headers):
    payload = {"name": "Smart Watch", "price": 4999, "stock": 20}
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/products", json=payload, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["data"]["name"] == "Smart Watch"

@pytest.mark.parametrize("invalid_payload,expected_status", [
    ({}, 422),
    ({"name": ""}, 422),
    ({"name": "x", "price": -1}, 422),
    ({"name": "x", "price": "not-a-number"}, 422),
])
@pytest.mark.asyncio
async def test_create_product_validation(invalid_payload, expected_status, auth_headers):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/v1/products", json=invalid_payload, headers=auth_headers)
    assert response.status_code == expected_status
```

### 4.3 GraphQL API Testing

```ts
// __tests__/api/graphql.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/server'

const GQL = (query: string, variables = {}) =>
  request(app).post('/api/graphql').send({ query, variables })

describe('GraphQL — products query', () => {
  it('fetches products list', async () => {
    const res = await GQL(`query { products { id name price } }`)
    expect(res.status).toBe(200)
    expect(res.body.errors).toBeUndefined()
    expect(Array.isArray(res.body.data.products)).toBe(true)
  })

  it('rejects introspection in production', async () => {
    process.env.NODE_ENV = 'production'
    const res = await GQL(`{ __schema { types { name } } }`)
    expect(res.body.errors?.[0]?.message).toMatch(/introspection/i)
    process.env.NODE_ENV = 'test'
  })
})
```

---

## 5. Function Testing

Function testing = verifying a single exported function handles ALL input classes correctly.

### 5.1 Input Classification Matrix (apply to every function)

| Class | Examples | Must Test |
|---|---|---|
| **Valid / happy path** | expected inputs | ✓ |
| **Boundary values** | 0, -1, MAX_INT, empty string, single char | ✓ |
| **Null / undefined** | null, undefined, NaN | ✓ |
| **Wrong type** | string where number expected | ✓ |
| **Oversized inputs** | 10MB string, 1M-item array | ✓ |
| **Special characters** | `<script>`, `' OR 1=1`, `../../../etc/passwd` | ✓ |
| **Concurrent calls** | parallel invocations, race conditions | ✓ on async functions |

### 5.2 Function Test Template (TS)

```ts
// __tests__/unit/functions/validateEmail.test.ts
import { describe, it, expect } from 'vitest'
import { validateEmail } from '@/lib/validators'

describe('validateEmail — all input classes', () => {
  // Happy path
  it.each([
    'user@example.com',
    'user+tag@sub.domain.com',
    'user123@company.co.in',
  ])('accepts valid email: %s', (email) => {
    expect(validateEmail(email)).toBe(true)
  })

  // Invalid format
  it.each([
    'notanemail',
    '@nodomain.com',
    'user@',
    'user @example.com',
    '',
  ])('rejects invalid email: %s', (email) => {
    expect(validateEmail(email)).toBe(false)
  })

  // Null/undefined
  it('returns false for null', () => expect(validateEmail(null as any)).toBe(false))
  it('returns false for undefined', () => expect(validateEmail(undefined as any)).toBe(false))

  // Security inputs — must NOT throw, must return false
  it.each([
    '<script>alert(1)</script>@x.com',
    "' OR '1'='1",
    '../../../etc/passwd',
    'A'.repeat(10000) + '@x.com',
  ])('safely handles attack input: %s', (input) => {
    expect(() => validateEmail(input)).not.toThrow()
    expect(validateEmail(input)).toBe(false)
  })
})
```

---

## 6. Integration Testing

### 6.1 Database Integration (Testcontainers — TS)

```bash
npm i -D testcontainers @testcontainers/postgresql
```

```ts
// __tests__/integration/db/product-repository.test.ts
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { ProductRepository } from '@/repositories/product'

let prisma: PrismaClient
let container: PostgreSqlContainer

beforeAll(async () => {
  container = await new PostgreSqlContainer().start()
  prisma = new PrismaClient({
    datasources: { db: { url: container.getConnectionUri() } },
  })
  await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS products ...`
}, 60_000)

afterAll(async () => {
  await prisma.$disconnect()
  await container.stop()
})

describe('ProductRepository', () => {
  it('creates and retrieves a product', async () => {
    const repo = new ProductRepository(prisma)
    const created = await repo.create({ name: 'Test', price: 999, stock: 10 })
    expect(created.id).toBeDefined()
    const found = await repo.findById(created.id)
    expect(found?.name).toBe('Test')
  })

  it('returns null for non-existent id', async () => {
    const repo = new ProductRepository(prisma)
    const result = await repo.findById('non-existent-uuid')
    expect(result).toBeNull()
  })
})
```

### 6.2 Database Integration (Python + Testcontainers)

```python
# tests/integration/test_product_repository.py
import pytest
from testcontainers.postgres import PostgresContainer
from sqlalchemy import create_engine
from app.repositories.product import ProductRepository

@pytest.fixture(scope="module")
def db_engine():
    with PostgresContainer("postgres:16") as postgres:
        engine = create_engine(postgres.get_connection_url())
        # run migrations
        yield engine

def test_create_and_retrieve_product(db_engine):
    repo = ProductRepository(db_engine)
    product = repo.create(name="Smart Watch", price=4999, stock=20)
    assert product.id is not None
    retrieved = repo.find_by_id(product.id)
    assert retrieved.name == "Smart Watch"

def test_find_by_id_returns_none_for_missing(db_engine):
    repo = ProductRepository(db_engine)
    assert repo.find_by_id("00000000-0000-0000-0000-000000000000") is None
```

### 6.3 Third-Party API Integration (Mock + Contract)

```ts
// __tests__/integration/payment/razorpay.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { RazorpayService } from '@/services/payment/razorpay.service'

// Mock Razorpay SDK at module level
vi.mock('razorpay', () => ({
  default: vi.fn().mockImplementation(() => ({
    orders: {
      create: vi.fn().mockResolvedValue({
        id: 'order_test123',
        amount: 99900,
        currency: 'INR',
        status: 'created',
      }),
    },
  })),
}))

describe('RazorpayService', () => {
  let service: RazorpayService

  beforeEach(() => {
    service = new RazorpayService()
  })

  it('creates an order with correct amount in paise', async () => {
    const order = await service.createOrder({ amount: 999, currency: 'INR' })
    expect(order.id).toMatch(/^order_/)
    expect(order.amount).toBe(99900)  // 999 * 100 paise
  })

  it('throws if amount is zero', async () => {
    await expect(service.createOrder({ amount: 0, currency: 'INR' }))
      .rejects.toThrow('Amount must be greater than zero')
  })
})
```

---

## 7. Auth Testing

### 7.1 JWT Auth Test Suite (TS)

```ts
// __tests__/auth/jwt.test.ts
import { describe, it, expect, vi } from 'vitest'
import request from 'supertest'
import { app } from '@/server'
import { signJWT, verifyJWT } from '@/lib/auth/jwt'
import { createTestUser, deleteTestUser } from '../helpers/user'

describe('JWT Auth', () => {
  describe('token generation', () => {
    it('signs a valid JWT with correct payload', () => {
      const token = signJWT({ userId: '123', role: 'user' })
      const decoded = verifyJWT(token)
      expect(decoded.userId).toBe('123')
      expect(decoded.role).toBe('user')
    })

    it('token expires — rejects expired token', async () => {
      const expiredToken = signJWT({ userId: '123' }, { expiresIn: '0s' })
      await new Promise(r => setTimeout(r, 100))
      expect(() => verifyJWT(expiredToken)).toThrow(/expired/i)
    })

    it('rejects tampered token', () => {
      const token = signJWT({ userId: '123' })
      const tampered = token.slice(0, -5) + 'XXXXX'
      expect(() => verifyJWT(tampered)).toThrow()
    })

    it('rejects token with wrong secret', () => {
      const fakeToken = require('jsonwebtoken').sign({ userId: '123' }, 'wrong-secret')
      expect(() => verifyJWT(fakeToken)).toThrow()
    })
  })

  describe('protected routes', () => {
    it('returns 401 with no token', async () => {
      const res = await request(app).get('/api/me')
      expect(res.status).toBe(401)
    })

    it('returns 401 with malformed Bearer token', async () => {
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', 'Bearer notavalidtoken')
      expect(res.status).toBe(401)
    })

    it('returns 401 with missing Bearer prefix', async () => {
      const token = signJWT({ userId: '123' })
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', token)  // missing "Bearer "
      expect(res.status).toBe(401)
    })

    it('returns 200 with valid token', async () => {
      const user = await createTestUser()
      const token = signJWT({ userId: user.id, role: 'user' })
      const res = await request(app)
        .get('/api/me')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(user.id)
      await deleteTestUser(user.id)
    })
  })

  describe('RBAC — role-based access', () => {
    it('user cannot access admin-only route', async () => {
      const token = signJWT({ userId: '123', role: 'user' })
      const res = await request(app)
        .delete('/api/admin/users/456')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(403)
    })

    it('admin can access admin-only route', async () => {
      const token = signJWT({ userId: 'admin1', role: 'admin' })
      const res = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${token}`)
      expect(res.status).toBe(200)
    })
  })
})
```

### 7.2 OAuth / NextAuth Session Test (TS)

```ts
// __tests__/auth/session.test.ts
import { describe, it, expect, vi } from 'vitest'
import { GET as sessionHandler } from '@/app/api/auth/[...nextauth]/route'
import { getServerSession } from 'next-auth'

vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

describe('Session-protected Server Action', () => {
  it('throws UNAUTHORIZED when no session', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)
    const { myProtectedAction } = await import('@/app/actions/protected')
    await expect(myProtectedAction()).rejects.toThrow('UNAUTHORIZED')
  })

  it('executes when valid session exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: '1', email: 'test@example.com', role: 'user' },
      expires: '9999-01-01',
    })
    const { myProtectedAction } = await import('@/app/actions/protected')
    await expect(myProtectedAction()).resolves.toBeDefined()
  })
})
```

### 7.3 Auth Test — Python / FastAPI

```python
# tests/auth/test_auth_routes.py
import pytest
from httpx import AsyncClient
from app.main import app
from app.core.security import create_access_token

@pytest.mark.asyncio
async def test_login_returns_token():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "correctPassword123"
        })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_wrong_password_returns_401():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/auth/login", json={
            "email": "test@example.com",
            "password": "wrongPassword"
        })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_without_token():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/me")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_expired_token_rejected():
    expired_token = create_access_token({"sub": "user1"}, expires_delta=-1)
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/api/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_user_cannot_access_admin_route(user_token):
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.delete("/admin/users/1", headers={"Authorization": f"Bearer {user_token}"})
    assert response.status_code == 403
```

---

## 8. Security Testing

### 8.1 OWASP Top 10 — Test Checklist

For every route/endpoint, verify:

| OWASP | Test | Pass Condition |
|---|---|---|
| A01 Broken Access Control | Access resource of different user by ID | 403 / 404 (not 200) |
| A01 RBAC | User hits admin endpoint | 403 |
| A02 Cryptographic Failures | Passwords stored in plaintext | grep DB for plaintext (none) |
| A03 Injection | SQLi payloads in all inputs | Parameterized queries used, no 500 |
| A03 XSS | `<script>alert(1)</script>` in inputs | Escaped in output, CSP blocks |
| A04 Insecure Design | Missing rate limits on login | 429 after N attempts |
| A05 Security Misconfiguration | Debug mode, stack traces in prod | No stack traces in response |
| A07 Auth Failures | Brute force, no lockout | Account lockout after 5 failures |
| A09 Logging | Auth failures logged | Yes (check log output) |
| A10 SSRF | URL input with internal IP | Blocked (not fetched) |

### 8.2 XSS / Input Injection Security Tests (TS)

```ts
// __tests__/security/xss.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/server'

const XSS_PAYLOADS = [
  '<script>alert(1)</script>',
  '"><img src=x onerror=alert(1)>',
  "javascript:alert('xss')",
  '<svg onload=alert(1)>',
  '{{7*7}}',            // template injection probe
  '${7*7}',            // JS template literal injection
]

describe('XSS Protection', () => {
  XSS_PAYLOADS.forEach(payload => {
    it(`safely handles XSS payload: ${payload.slice(0, 30)}`, async () => {
      const token = await getTestUserToken()
      const res = await request(app)
        .post('/api/reviews')
        .set('Authorization', `Bearer ${token}`)
        .send({ content: payload, productId: 'prod_1' })

      // Must not echo raw payload — must be escaped or rejected
      expect(res.body.data?.content).not.toContain('<script>')
      expect(res.body.data?.content).not.toContain('onerror=')
      // Status must not be 500 (must be handled gracefully)
      expect(res.status).not.toBe(500)
    })
  })
})

describe('SSRF Protection', () => {
  const SSRF_URLS = [
    'http://169.254.169.254/latest/meta-data/',  // AWS metadata
    'http://localhost:5432',                       // local DB
    'http://0.0.0.0',
    'file:///etc/passwd',
  ]

  SSRF_URLS.forEach(url => {
    it(`blocks SSRF URL: ${url}`, async () => {
      const res = await request(app)
        .post('/api/fetch-url')
        .send({ url })
      expect(res.status).toBeGreaterThanOrEqual(400)
    })
  })
})

describe('Rate Limiting', () => {
  it('blocks after 5 failed login attempts', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app).post('/auth/login')
        .send({ email: 'user@test.com', password: 'wrong' })
    }
    const res = await request(app).post('/auth/login')
      .send({ email: 'user@test.com', password: 'wrong' })
    expect(res.status).toBe(429)
  })
})
```

### 8.3 Security Headers Check

```ts
// __tests__/security/headers.test.ts
describe('Security Headers', () => {
  it('sets all required security headers', async () => {
    const res = await request(app).get('/')
    expect(res.headers['x-frame-options']).toBe('DENY')
    expect(res.headers['x-content-type-options']).toBe('nosniff')
    expect(res.headers['referrer-policy']).toBe('strict-origin-when-cross-origin')
    expect(res.headers['content-security-policy']).toBeDefined()
    expect(res.headers['strict-transport-security']).toMatch(/max-age=\d+/)
    expect(res.headers['x-powered-by']).toBeUndefined()  // must not expose stack
  })

  it('does not expose server version', async () => {
    const res = await request(app).get('/')
    expect(res.headers['server']).not.toMatch(/express|nginx\/\d|apache/i)
  })
})
```

---

## 9. SQL Injection (SQLi) Testing

### 9.1 SQLi Test Payload Library

**Classic payloads:**
```
' OR '1'='1
' OR 1=1--
' OR 1=1#
" OR "1"="1
'; DROP TABLE users;--
' UNION SELECT NULL,NULL,NULL--
' AND 1=CONVERT(int,(SELECT TOP 1 name FROM sysobjects WHERE xtype='U'))--
' OR SLEEP(5)--          ← time-based blind
' OR 1=1 LIMIT 1--
```

**Error-based payloads:**
```
'
''
`
``
,
"
""
/
//
\
\\
;
' OR '
' OR 1
' OR 1 --
```

**Second-order SQLi (stored then executed):**
```
admin'--
admin' #
' OR 1=1/*
```

### 9.2 Automated SQLi Test Suite (TS)

```ts
// __tests__/security/sqli.test.ts
import { describe, it, expect } from 'vitest'
import request from 'supertest'
import { app } from '@/server'

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "'; DROP TABLE products;--",
  "' UNION SELECT NULL,NULL,NULL--",
  "' OR SLEEP(5)--",
  "1' AND '1'='1",
  "admin'--",
  "' OR 1=1#",
  "\" OR \"1\"=\"1",
]

// Rule: SQLi payloads must NEVER return 200 with data leakage
// Acceptable responses: 400 (validation), 422 (unprocessable), 404, but NEVER 500 (raw DB error)

describe('SQL Injection Protection', () => {
  describe('GET /api/products?search= — search input', () => {
    SQLI_PAYLOADS.forEach(payload => {
      it(`search param is safe against: ${payload.slice(0, 40)}`, async () => {
        const res = await request(app)
          .get(`/api/products?search=${encodeURIComponent(payload)}`)
        // Must never cause 500 (unhandled DB error = raw query used)
        expect(res.status).not.toBe(500)
        // Must not return a DB error message
        const body = JSON.stringify(res.body)
        expect(body).not.toMatch(/syntax error/i)
        expect(body).not.toMatch(/pg error/i)
        expect(body).not.toMatch(/mysql error/i)
        expect(body).not.toMatch(/unclosed quotation/i)
        expect(body).not.toMatch(/sql/i)
      })
    })
  })

  describe('POST /auth/login — email/password fields', () => {
    SQLI_PAYLOADS.forEach(payload => {
      it(`login field safe against: ${payload.slice(0, 40)}`, async () => {
        const res = await request(app)
          .post('/auth/login')
          .send({ email: payload, password: payload })
        expect(res.status).not.toBe(500)
        expect(res.status).not.toBe(200)  // must NOT successfully log in with SQLi
        const body = JSON.stringify(res.body)
        expect(body).not.toMatch(/syntax error/i)
      })
    })
  })

  describe('GET /api/products/:id — path param', () => {
    SQLI_PAYLOADS.forEach(payload => {
      it(`path param safe against: ${payload.slice(0, 40)}`, async () => {
        const res = await request(app)
          .get(`/api/products/${encodeURIComponent(payload)}`)
        expect(res.status).not.toBe(500)
        expect(JSON.stringify(res.body)).not.toMatch(/sql/i)
      })
    })
  })
})
```

### 9.3 Parameterized Query Audit (Static Analysis)

**Run this before ANY PR merge involving DB queries:**

```bash
# Find raw string interpolation in SQL queries — MUST return zero results
grep -r "query\`" --include="*.ts" src/
grep -rn "\.query.*\$\{" --include="*.ts" src/
grep -rn "\.query.*\+.*req\." --include="*.ts" src/
grep -rn "f\"SELECT" --include="*.py" app/
grep -rn "format.*SELECT" --include="*.py" app/
grep -rn "% SELECT" --include="*.py" app/
```

**Safe pattern (parameterized — ALWAYS use this):**
```ts
// ✓ SAFE — Prisma parameterizes automatically
const product = await prisma.product.findFirst({
  where: { name: { contains: userInput } }
})

// ✓ SAFE — Raw query with $1 placeholder
await prisma.$queryRaw`SELECT * FROM products WHERE name = ${userInput}`

// ✗ UNSAFE — NEVER DO THIS
await prisma.$queryRawUnsafe(`SELECT * FROM products WHERE name = '${userInput}'`)
```

```python
# ✓ SAFE — SQLAlchemy parameterized
result = db.execute(select(Product).where(Product.name == user_input))

# ✓ SAFE — psycopg2 parameterized
cursor.execute("SELECT * FROM products WHERE name = %s", (user_input,))

# ✗ UNSAFE — NEVER DO THIS
cursor.execute(f"SELECT * FROM products WHERE name = '{user_input}'")
```

### 9.4 sqlmap (Authorized Environments Only)

```bash
# Only run against DEV / STAGING — NEVER production

# Basic scan
sqlmap -u "http://localhost:3000/api/products?search=test" --level=3 --risk=2

# With auth token
sqlmap -u "http://localhost:3000/api/products" \
  --headers="Authorization: Bearer <TEST_TOKEN>" \
  --level=3 --risk=2

# POST body scan
sqlmap -u "http://localhost:3000/auth/login" \
  --data='{"email":"test@test.com","password":"test"}' \
  --content-type="application/json" \
  --level=3 --risk=2

# Generate report
sqlmap -u "http://localhost:3000/api/products?id=1" \
  --level=5 --risk=3 \
  --output-dir=./security-reports/sqlmap
```

---

## 10. E2E UI Testing (Playwright)

```bash
npm i -D @playwright/test
npx playwright install chromium firefox webkit
```

**`playwright.config.ts`:**
```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
})
```

**E2E test pattern:**
```ts
// e2e/specs/checkout.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('user can complete purchase with Razorpay', async ({ page }) => {
    // Add product to cart
    await page.click('[data-testid="product-card"]:first-child [data-testid="add-to-cart"]')
    await expect(page.locator('[data-testid="cart-count"]')).toHaveText('1')

    // Go to checkout
    await page.click('[data-testid="cart-icon"]')
    await page.click('[data-testid="checkout-btn"]')

    // Fill shipping info
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="address"]', '123 Test Street, Navrangpura')
    await page.click('[data-testid="continue-to-payment"]')

    // Mock Razorpay (E2E should not hit real gateway)
    await page.evaluate(() => {
      window.Razorpay = class {
        constructor(opts: any) { this.opts = opts }
        open() { this.opts.handler({ razorpay_payment_id: 'pay_test123', razorpay_order_id: 'order_test123', razorpay_signature: 'sig_test' }) }
      }
    })

    await page.click('[data-testid="pay-now-btn"]')
    await expect(page.locator('[data-testid="order-success"]')).toBeVisible()
    await expect(page.locator('[data-testid="order-id"]')).toContainText('order_')
  })

  test('shows error on payment failure', async ({ page }) => {
    // ... setup cart ...
    await page.evaluate(() => {
      window.Razorpay = class {
        constructor(opts: any) { this.opts = opts }
        open() { this.opts.modal.ondismiss() }
      }
    })
    await page.click('[data-testid="pay-now-btn"]')
    await expect(page.locator('[data-testid="payment-error"]')).toBeVisible()
  })
})
```

**Run:**
```bash
npx playwright test                     # all browsers
npx playwright test e2e/specs/checkout  # specific spec
npx playwright test --headed            # see the browser
npx playwright show-report              # open HTML report
```

---

## 11. Running All Tests — Universal Commands

### JavaScript / TypeScript Projects
```bash
# Unit
npx vitest run --coverage

# API + Integration
npx vitest run __tests__/api __tests__/integration

# Security
npx vitest run __tests__/security

# E2E
npx playwright test

# All at once
npm run test:all
```

**`package.json` scripts:**
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage",
    "test:api": "vitest run __tests__/api",
    "test:security": "vitest run __tests__/security",
    "test:e2e": "playwright test",
    "test:all": "vitest run --coverage && playwright test"
  }
}
```

### Python Projects
```bash
# All tests
pytest -v

# Unit only
pytest tests/unit -v

# API only
pytest tests/api -v

# Security
pytest tests/security -v

# With coverage
pytest --cov=app --cov-report=html --cov-fail-under=80

# Specific test
pytest tests/auth/test_jwt.py::test_expired_token_rejected -v
```

---

## 12. CI/CD Integration (GitHub Actions)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-api-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_PASSWORD: testpass
          POSTGRES_DB: testdb
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:testpass@localhost:5432/testdb
      - uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '22' }
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run build
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: semgrep/semgrep-action@v1
        with:
          config: >-
            p/owasp-top-ten
            p/nodejs
            p/typescript
            p/secrets
```

---

## 13. Coverage Thresholds (Non-Negotiable)

| Metric | Minimum | Target |
|---|---|---|
| Lines | 80% | 90% |
| Functions | 80% | 90% |
| Branches | 70% | 85% |
| Statements | 80% | 90% |
| Auth routes | **100%** | 100% |
| Payment routes | **100%** | 100% |
| DB query functions | **100%** | 100% |

---

## 14. Quick-Start Checklist (Run Before Every PR)

```
[ ] Unit tests pass:         npx vitest run
[ ] Coverage thresholds met: npx vitest run --coverage
[ ] API tests pass:          npx vitest run __tests__/api
[ ] Auth tests pass:         npx vitest run __tests__/auth
[ ] Security tests pass:     npx vitest run __tests__/security
[ ] SQLi grep clean:         grep -rn "queryRawUnsafe\|f\"SELECT\|\.query.*\${" src/ app/
[ ] E2E tests pass:          npx playwright test
[ ] No TypeScript errors:    npx tsc --noEmit
[ ] No lint errors:          npx eslint src/
[ ] Security headers set:    curl -I http://localhost:3000 | grep -i "x-frame\|csp\|hsts"
```

---

## 15. When This Skill Activates

Invoke this skill when:
- Writing any test file (`.test.ts`, `.spec.ts`, `test_*.py`)
- Reviewing a PR that touches auth, payments, or DB queries
- Setting up a new route or API endpoint (tests required before merge)
- Running a security audit
- Debugging a failing test (read trace → fix → re-run)
- Adding a new DB model (parameterized query audit required)
- Any SQLi, XSS, CSRF, or SSRF concern is raised

**Never merge code that:**
- Has no tests for new auth routes
- Uses string interpolation in DB queries
- Returns 500 on malformed input
- Has coverage below thresholds
- Has `queryRawUnsafe` or equivalent
