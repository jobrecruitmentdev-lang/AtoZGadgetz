import { PrismaClient } from '@prisma/client';
import { CjProductService } from './src/services/cj/cj-product.service';
import { config } from 'dotenv';
config();

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('1. Setting up categories...');
    let category = await prisma.category.findFirst({ where: { slug: 'gadgets' } });
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'Gadgets', slug: 'gadgets', description: 'Cool gadgets' }
      });
    }

    let subcategory = await prisma.subCategory.findFirst({ where: { slug: 'tech' } });
    if (!subcategory) {
      subcategory = await prisma.subCategory.create({
        data: { name: 'Tech', slug: 'tech', category_id: category.id }
      });
    }

    console.log('2. Fetching products from CJ Dropshipping API...');
    const searchResults = await CjProductService.searchProducts('phone', 1, 5);
    
    const productsArray = searchResults.list || searchResults.content || (Array.isArray(searchResults) ? searchResults[0]?.list : null);
    
    if (!productsArray || productsArray.length === 0) {
      console.log('No products found from CJ API. Check API Key or keyword.');
      return;
    }

    console.log(`Found ${productsArray.length} products. Importing top 3...`);
    
    let imported = 0;
    for (const item of productsArray.slice(0, 3)) {
      try {
        const pid = item.pid || item.id || item.sku;
        console.log(`Importing: ${item.productNameEn || item.nameEn || item.productName} (${pid})`);
        await CjProductService.importProduct(pid, category.id, subcategory.id, 2.0); // 2.0x markup
        imported++;
      } catch (err: any) {
        console.error(`Failed to import ${item.pid}:`, err.message);
      }
    }
    
    console.log(`\nSuccessfully imported ${imported} products from CJ Dropshipping!`);
  } catch (error: any) {
    console.error('Error in import script:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
