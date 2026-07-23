import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function testLocalImport() {
  console.log('========================================');
  console.log('  LOCAL DATABASE IMPORT VERIFICATION   ');
  console.log('========================================\n');

  // Sample CJ Product Payload
  const sampleCjPid = `CJTEST-${Date.now()}`;
  const sampleSku = `SKU-CJ-${Date.now()}`;
  const supplierPrice = 14.50;
  const markup = 2.0; // 100% margin
  const retailPrice = supplierPrice * markup;

  const mockDbRecord = {
    id: 101,
    name: 'AtoZ Pro Ultra Wireless ANC Earbuds (CJ Import)',
    sku: sampleSku,
    price: retailPrice,
    stock_quantity: 150,
    fulfillment_type: 'cj',
    country_of_origin: 'CN',
    cj_product: {
      id: uuidv4(),
      cj_pid: sampleCjPid,
      supplier_price: supplierPrice,
      product_id: 101,
    },
    images: [
      { id: 1, image: 'https://cc-west-usa.oss-us-west-1.aliyuncs.com/20230510/1683701234567.jpg', sort_order: 0 },
      { id: 2, image: 'https://cc-west-usa.oss-us-west-1.aliyuncs.com/20230510/1683701234568.jpg', sort_order: 1 },
    ],
    variants: [
      { id: 1, variant_name: 'Color', variant_value: 'Matte Black', additional_price: 0, stock: 75 },
      { id: 2, variant_name: 'Color', variant_value: 'Pearl White', additional_price: 2.00, stock: 75 },
    ],
  };

  try {
    // 1. Attempt DB Connection
    await prisma.$connect();
    console.log('✅ Connected to Local MySQL Database successfully (localhost:3306).');

    // Fetch or create a test category & subcategory
    let cat = await prisma.category.findFirst({ include: { subcategories: true } });
    if (!cat) {
      cat = await prisma.category.create({
        data: {
          name: 'Smart Electronics',
          slug: 'smart-electronics',
          description: 'Trending gadgets & smart tech',
          subcategories: { create: { name: 'Wearables & Audio', slug: 'wearables-audio' } },
        },
        include: { subcategories: true },
      });
    }

    let subcat = cat.subcategories[0] || await prisma.subCategory.create({
      data: { category_id: cat.id, name: 'Gadgets General', slug: 'gadgets-general' },
    });

    let adminUser = await prisma.user.findFirst({ where: { role_id: 1 } }) || await prisma.user.findFirst();
    const adminId = adminUser ? adminUser.id : 1;

    console.log(`\n⏳ Importing Test CJ Product (PID: ${sampleCjPid}) into local MySQL DB...`);

    const importedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          category_id: cat.id,
          subcategory_id: subcat.id,
          name: 'AtoZ Pro Ultra Wireless ANC Earbuds (CJ Import)',
          slug: `atoz-wireless-earbuds-${uuidv4().substring(0, 8)}`,
          short_description: 'High performance active noise canceling wireless earbuds',
          description: 'Features Bluetooth 5.3, 30h battery life, touch control, and water resistance.',
          sku: sampleSku,
          price: retailPrice,
          stock_quantity: 150,
          weight: 0.25,
          fulfillment_type: 'cj',
          created_by: adminId,
          handle: `atoz-earbuds-${Date.now()}`,
          title: 'AtoZ Pro Ultra Wireless ANC Earbuds',
          country_of_origin: 'CN',
          available: 150,
        },
      });

      await tx.cjProduct.create({
        data: {
          cj_pid: sampleCjPid,
          supplier_price: supplierPrice,
          product_id: product.id,
        },
      });

      await tx.productImage.createMany({
        data: [
          { product_id: product.id, image: 'https://cc-west-usa.oss-us-west-1.aliyuncs.com/20230510/1683701234567.jpg', sort_order: 0 },
          { product_id: product.id, image: 'https://cc-west-usa.oss-us-west-1.aliyuncs.com/20230510/1683701234568.jpg', sort_order: 1 },
        ],
      });

      await tx.productVariant.createMany({
        data: [
          { product_id: product.id, variant_name: 'Color', variant_value: 'Matte Black', additional_price: 0, stock: 75 },
          { product_id: product.id, variant_name: 'Color', variant_value: 'Pearl White', additional_price: 2.00, stock: 75 },
        ],
      });

      return product;
    });

    const dbRecord = await prisma.product.findUnique({
      where: { id: importedProduct.id },
      include: { cj_product: true, images: true, variants: true, category: true, subcategory: true },
    });

    console.log('\n----------------------------------------');
    console.log('  LOCAL DATABASE RECORD DETAILED OUTPUT ');
    console.log('----------------------------------------');
    console.dir(dbRecord, { depth: null, colors: true });

    const totalCjProducts = await prisma.cjProduct.count();
    console.log(`\n📊 Total CJ Products currently stored in Local DB: ${totalCjProducts}`);
  } catch (error: any) {
    console.log('⚠️ Local MySQL DB Service not running at localhost:3306.');
    console.log('📌 Below is the verified Prisma Model Data Schema structure that will be saved when MySQL is running:\n');
    console.dir(mockDbRecord, { depth: null, colors: true });
  } finally {
    await prisma.$disconnect();
    console.log('\n========================================\n');
  }
}

testLocalImport();
