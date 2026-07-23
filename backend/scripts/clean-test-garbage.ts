import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function cleanTitle(rawName: string): string {
  if (!rawName) return 'AtoZ Gadget Product';
  let cleaned = rawName.trim();

  // Handle JSON array strings e.g. ["智能发热服..."]
  if (cleaned.startsWith('[') && cleaned.endsWith(']')) {
    try {
      const parsed = JSON.parse(cleaned);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cleaned = parsed[parsed.length - 1] || parsed[0] || 'AtoZ Gadget Product';
      }
    } catch {
      cleaned = cleaned.replace(/^\["|"\]$/g, '').replace(/","/g, ' ');
    }
  }

  // Replace Chinese characters with English clean names if purely Chinese
  if (/[\u4e00-\u9fa5]/.test(cleaned)) {
    if (cleaned.includes('充电宝') || cleaned.includes('Power bank')) return 'AtoZ High-Capacity Portable Power Bank';
    if (cleaned.includes('耳机') || cleaned.includes('Earbuds')) return 'AtoZ Pro Wireless Stereo Earbuds';
    if (cleaned.includes('鼠标') || cleaned.includes('Mouse')) return 'AtoZ Precision RGB Gaming Mouse';
    if (cleaned.includes('小夜灯') || cleaned.includes('Light')) return 'AtoZ Smart LED Sensor Night Light';
    if (cleaned.includes('台灯')) return 'AtoZ Smart Desk Reading Lamp';
    return 'AtoZ Premium Smart Gadget';
  }

  return cleaned;
}

async function cleanTestGarbage() {
  console.log('==============================================');
  console.log('  DATABASE GARBAGE & TEST DATA CLEANUP TOOL  ');
  console.log('==============================================\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to MySQL Database.');

    // 1. Delete test categories (<script>, xss-*, e2e-*)
    const deletedCategories = await prisma.category.deleteMany({
      where: {
        OR: [
          { name: { contains: '<script>' } },
          { slug: { contains: 'xss-' } },
          { name: { contains: 'E2E' } },
        ],
      },
    });
    console.log(`🧹 Cleaned up ${deletedCategories.count} test/XSS dump categories.`);

    // 2. Delete test brands (E2E Brand, etc.)
    const deletedBrands = await prisma.brand.deleteMany({
      where: {
        OR: [
          { name: { contains: 'E2E' } },
          { slug: { contains: 'e2e-' } },
        ],
      },
    });
    console.log(`🧹 Cleaned up ${deletedBrands.count} dummy test brands.`);

    // 3. Clean Chinese & JSON Array Product Titles
    const products = await prisma.product.findMany();
    let updatedProductsCount = 0;

    for (const prod of products) {
      const sanitizedName = cleanTitle(prod.name);
      if (sanitizedName !== prod.name) {
        await prisma.product.update({
          where: { id: prod.id },
          data: {
            name: sanitizedName,
            title: sanitizedName,
          },
        });
        updatedProductsCount++;
      }
    }
    console.log(`✨ Sanitized ${updatedProductsCount} product titles (removed Chinese JSON dump text).`);

    console.log('\n==============================================');
    console.log('✅ DATABASE CLEANUP COMPLETE');
    console.log('==============================================\n');
  } catch (error: any) {
    if (error.message?.includes("Can't reach database server")) {
      console.log('⚠️ Local MySQL DB is currently offline (localhost:3306). Start MySQL in XAMPP to run cleanup.');
    } else {
      console.error('❌ Error during cleanup:', error.message);
    }
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestGarbage();
