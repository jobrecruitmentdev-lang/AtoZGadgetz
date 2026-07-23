import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import http from 'node:http';
import app from '../../src/server.js';

let server: http.Server;
let baseUrl: string;

describe('API Integration — CJDropshipping Gateway Endpoints', () => {
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

  describe('GET /api/cj/health', () => {
    it('returns 200 with connection status', async () => {
      const res = await fetch(`${baseUrl}/api/cj/health`);
      assert.strictEqual(res.status, 200);
      const data = await res.json() as any;
      assert.strictEqual(data.success, true);
      assert.ok(typeof data.data.connected === 'boolean');
      assert.ok(data.data.tokenType);
    });
  });

  describe('GET /api/cj/browse', () => {
    it('returns 200 with list structure', async () => {
      const res = await fetch(`${baseUrl}/api/cj/browse?keyword=gadgets&page=1&size=5`);
      assert.strictEqual(res.status, 200);
      const data = await res.json() as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.data.list);
      assert.ok(Array.isArray(data.data.list));
    });
  });

  describe('GET /api/cj/browse/hunt', () => {
    it('returns 200 for hunter mode search', async () => {
      const res = await fetch(`${baseUrl}/api/cj/browse/hunt?keyword=gadgets&minImages=2`);
      assert.strictEqual(res.status, 200);
      const data = await res.json() as any;
      assert.strictEqual(data.success, true);
      assert.ok(data.data.list);
    });
  });

  describe('POST /api/cj/products/auto-import', () => {
    it('returns 401 when no auth header is provided', async () => {
      const res = await fetch(`${baseUrl}/api/cj/products/auto-import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cjPid: 'CJTEST99' }),
      });
      assert.strictEqual(res.status, 401);
    });
  });
});
