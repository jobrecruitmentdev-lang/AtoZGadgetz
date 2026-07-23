import 'dotenv/config';

import { CjAuthService } from '../../src/services/cj/cj-auth.service.js';
import { CjProductService } from '../../src/services/cj/cj-product.service.js';

async function main() {
  console.log('[verify-cj-api] Starting CJ API verification...\n');

  const token = await CjAuthService.getAccessToken();
  console.log('[verify-cj-api] Token type:', token === 'SANDBOX_DEMO_TOKEN' ? 'SANDBOX/FALLBACK' : 'LIVE');
  console.log('[verify-cj-api] Token prefix:', token.substring(0, 20) + '...\n');

  console.log('[verify-cj-api] Searching products (keyword: gadget, page: 1, size: 5)...');
  const searchData = await CjProductService.searchProducts('gadget', 1, 5);
  console.log('[verify-cj-api] Search returned', searchData.list.length, 'products, total:', searchData.total);
  if (searchData.list.length > 0) {
    console.log('[verify-cj-api] First product sample:');
    console.log(JSON.stringify(searchData.list[0], null, 2));
  }

  console.log('\n[verify-cj-api] Testing product detail (using first result PID if available)...');
  const pid = searchData.list[0]?.pid || '2602090253531609700';
  const detail = await CjProductService.getProductDetail(pid);
  console.log('[verify-cj-api] Detail for PID', pid, ':');
  console.log(JSON.stringify(detail, null, 2));

  console.log('\n[verify-cj-api] Verification complete.');
}

main().catch((err) => {
  console.error('[verify-cj-api] FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
});
