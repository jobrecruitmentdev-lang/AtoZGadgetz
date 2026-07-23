import { PrismaClient } from '@prisma/client';
import { CjProductService } from './src/services/cj/cj-product.service.js';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  // 1. Delete dummy products
  console.log('Cleaning up dummy products...');
  const deletedDummies = await prisma.product.deleteMany({
    where: { sku: { startsWith: 'DUMMY-' } },
  });
  console.log(`Deleted ${deletedDummies.count} dummy products.`);

  // 2. Fetch categories
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
    where: { id: { in: [1, 2, 3, 12] } }
  });

  const categoryMap = {
    'Audio & Sound': 'earbuds',
    'Gaming': 'gaming mouse',
    'Smart Home': 'smart light',
    'Mobile Accessories': 'power bank'
  };

  console.log('Starting CJ Dropshipping import...');
  let totalImported = 0;

  for (const cat of categories) {
    const keyword = categoryMap[cat.name as keyof typeof categoryMap] || 'gadget';
    const subcatId = cat.subcategories.length > 0 ? cat.subcategories[0].id : 1;
    
    console.log(`Searching CJ for '${keyword}'... (target: 100)`);
    
    // We need 100 products. Let's fetch 2 pages of 50 or 5 pages of 20
    let fetchedPids: string[] = [];
    
    for (let page = 1; page <= 5; page++) {
      try {
        const searchData = await CjProductService.searchProducts(keyword, page, 20);
        let list: any[] = [];
        if (searchData && searchData.content) {
           const content = Array.isArray(searchData.content) ? searchData.content : [searchData.content];
           for (const c of content) {
               if (c.productList && Array.isArray(c.productList)) {
                  list.push(...c.productList);
               } else if (c.id || c.pid) {
                  list.push(c);
               }
           }
        } else if (searchData && searchData.list) {
           list = searchData.list;
        }

        if (list.length > 0) {
          for (const item of list) {
            if (item.pid || item.id) {
              fetchedPids.push(item.pid || item.id);
            }
          }
        }
      } catch (err) {
        console.error(`Search error on page ${page} for ${keyword}:`, err);
      }
    }
    
    // De-duplicate PIDs
    fetchedPids = Array.from(new Set(fetchedPids)).slice(0, 100);
    console.log(`Found ${fetchedPids.length} unique products for '${keyword}'. Importing...`);
    
    let catImported = 0;
    for (const pid of fetchedPids) {
      try {
        await CjProductService.importProduct(pid, cat.id, subcatId, 2.0);
        catImported++;
        process.stdout.write('.');
      } catch (err: any) {
        // Ignore if already imported or not found
      }
    }
    console.log(`\nSuccessfully imported ${catImported} real products to ${cat.name}.`);
    totalImported += catImported;
  }

  console.log(`Finished CJ import! Total imported: ${totalImported}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
