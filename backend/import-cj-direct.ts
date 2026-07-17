import { PrismaClient } from '@prisma/client';
import { CjProductService } from './src/services/cj/cj-product.service';
import { config } from 'dotenv';
config();

const prisma = new PrismaClient();

async function main() {
  try {
    let category = await prisma.category.findFirst({ where: { slug: 'gadgets' } });
    if (!category) category = await prisma.category.create({ data: { name: 'Gadgets', slug: 'gadgets' } });

    let subcategory = await prisma.subCategory.findFirst({ where: { slug: 'tech' } });
    if (!subcategory) subcategory = await prisma.subCategory.create({ data: { name: 'Tech', slug: 'tech', category_id: category.id } });

    const pids = [
      "2602090253531609700", // 7-inch Bluetooth Wireless Tablet For Kids
      "2601110313081639200", // Dimensity 9300 Tablet Device
      "2043262782472708097"  // Telephone cord hair ring
    ];

    console.log(`Importing ${pids.length} products...`);
    
    let imported = 0;
    for (const pid of pids) {
      try {
        console.log(`Importing: ${pid}`);
        await new Promise(r => setTimeout(r, 1500)); await CjProductService.importProduct(pid, category.id, subcategory.id, 2.0);
        imported++;
      } catch (err: any) {
        console.error(`Failed to import ${pid}:`, err.message);
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
