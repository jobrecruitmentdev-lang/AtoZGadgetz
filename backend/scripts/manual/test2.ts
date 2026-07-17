import { CjProductService } from './src/services/cj/cj-product.service';
import { config } from 'dotenv';
config();

async function main() {
  const searchResults = await CjProductService.searchProducts('phone', 1, 5);
  console.log(searchResults ? 'Got results' : 'No results');
  console.log('List exists?', !!searchResults?.list);
  console.log('Array?', Array.isArray(searchResults));
  console.log('Keys:', searchResults ? Object.keys(searchResults) : 'none');
}
main();
