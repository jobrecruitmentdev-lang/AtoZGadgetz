import { CjProductService } from './src/services/cj/cj-product.service';
import { config } from 'dotenv';
config();

async function main() {
  const data = await CjProductService.getProductDetail("2602090253531609700");
  console.log(JSON.stringify(data, null, 2));
}

main();
