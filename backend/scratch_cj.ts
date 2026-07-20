import { CjProductService } from './src/services/cj/cj-product.service.js';
import { CjAuthService } from './src/services/cj/cj-auth.service.js';

async function test() {
  console.log('Fetching products from CJ...');
  const data = await CjProductService.searchProducts('earbuds', 1, 1);
  console.log('Search Products listV2 result:', JSON.stringify(data, null, 2));

  if (data && data.list && data.list.length > 0) {
    const pid = data.list[0].pid;
    console.log(`\nFetching detail for PID: ${pid}`);
    const detail = await CjProductService.getProductDetail(pid);
    console.log(`Product detail has ${detail.productImages?.length || 0} images`);
    console.log(detail.productImages);
  }
}

test().catch(console.error);
