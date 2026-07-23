import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../../src/server.js';

let server: http.Server;
let baseUrl: string;

const SQLI_PAYLOADS = [
  "' OR '1'='1",
  "' OR 1=1--",
  "'; DROP TABLE products;--",
  "' UNION SELECT NULL,NULL,NULL--",
  "admin'--",
  "\" OR \"1\"=\"1",
];

describe('Security Audit — SQL Injection & Auth Protection', () => {
  before(() => {
    return new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address() as any;
        baseUrl = `http://localhost:${address.port}`;
        resolve();
      });
    });
  });

  after(() => {
    return new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  describe('GET /api/cj/browse — search params protection', () => {
    SQLI_PAYLOADS.forEach((payload) => {
      it(`safely handles SQLi payload: ${payload.slice(0, 30)}`, async () => {
        const res = await fetch(`${baseUrl}/api/cj/browse?keyword=${encodeURIComponent(payload)}`);

        // Must NEVER crash with 500 (unhandled DB syntax error)
        assert.notStrictEqual(res.status, 500, 'Endpoint crashed with 500 internal server error');

        const text = await res.text();
        assert.doesNotMatch(text, /syntax error/i, 'Database syntax error leaked');
        assert.doesNotMatch(text, /mysql error/i, 'MySQL error details leaked');
        assert.doesNotMatch(text, /unclosed quotation/i, 'Unclosed quotation error leaked');
      });
    });
  });

  describe('RBAC & Auth Guard Verification', () => {
    it('rejects product import attempts without JWT token', async () => {
      const res = await fetch(`${baseUrl}/api/cj/products/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cjPid: 'CJTEST123', categoryId: 1, subcategoryId: 1 }),
      });

      assert.strictEqual(res.status, 401, 'Unauthorized request allowed without token');
      const body = await res.json() as any;
      assert.strictEqual(body.success, false);
    });

    it('rejects shipment sync attempts without admin privileges', async () => {
      const res = await fetch(`${baseUrl}/api/cj/shipments/sync-all`, { method: 'POST' });
      assert.strictEqual(res.status, 401);
    });
  });
});
