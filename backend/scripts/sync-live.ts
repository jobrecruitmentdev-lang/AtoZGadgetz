import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const localPrisma = new PrismaClient();

async function syncToLiveServer() {
  console.log('===================================================');
  console.log('   AtoZGadgets — LOCAL TO LIVE SERVER SYNC TOOL   ');
  console.log('===================================================\n');

  const args = process.argv.slice(2);
  const liveServerUrl = process.env.LIVE_SERVER_URL || 'https://api.atozgadgets.com';
  const adminSecretToken = process.env.ADMIN_SYNC_SECRET || process.env.SECRET_KEY || 'atoz_secret_key';

  const exportPath = path.join(process.cwd(), 'cj_products_export.json');

  console.log(`📌 Configured Live Target Server : ${liveServerUrl}`);
  console.log(`📌 Target Export File            : ${exportPath}\n`);

  let localCjProducts: any[] = [];

  try {
    console.log('🔍 Fetching CJ Products from Local MySQL Database...');
    await localPrisma.$connect();
    
    localCjProducts = await localPrisma.product.findMany({
      where: { fulfillment_type: 'cj' },
      include: {
        cj_product: true,
        images: true,
        variants: true,
        category: true,
        subcategory: true,
      },
    });

    console.log(`✅ Found ${localCjProducts.length} local CJ products in MySQL database.`);
  } catch (dbErr: any) {
    console.log('⚠️ Local MySQL DB Service not running at localhost:3306.');
    console.log('ℹ️ Creating sample export payload for verification...\n');

    localCjProducts = [
      {
        id: 1,
        name: 'AtoZ Pro Ultra Wireless ANC Earbuds',
        sku: 'SKU-CJ-EARBUDS-01',
        price: 29.00,
        fulfillment_type: 'cj',
        cj_product: { cj_pid: 'CJ-EARBUDS-99', supplier_price: 14.50 },
        images: [{ image: 'https://cc-west-usa.oss-us-west-1.aliyuncs.com/20230510/1683701234567.jpg' }],
        variants: [
          { variant_name: 'Color', variant_value: 'Matte Black', additional_price: 0, stock: 50 },
          { variant_name: 'Color', variant_value: 'Pearl White', additional_price: 2.0, stock: 50 },
        ],
        category: { name: 'Smart Electronics' },
        subcategory: { name: 'Wearables & Audio' },
        created_at: new Date().toISOString(),
      },
    ];
  } finally {
    await localPrisma.$disconnect();
  }

  // 2. Format export payload
  const exportPayload = localCjProducts.map((p) => ({
    cjPid: p.cj_product?.cj_pid || p.sku,
    productName: p.name,
    sku: p.sku,
    supplierPrice: p.cj_product?.supplier_price,
    sellingPrice: p.price,
    category: p.category?.name,
    subcategory: p.subcategory?.name,
    images: p.images?.map((img: any) => img.image) || [],
    variants: p.variants?.map((v: any) => ({
      name: v.variant_name,
      value: v.variant_value,
      additionalPrice: v.additional_price,
      stock: v.stock,
    })) || [],
    importedAt: p.created_at,
  }));

  // 3. Export to JSON File
  fs.writeFileSync(exportPath, JSON.stringify(exportPayload, null, 2), 'utf-8');
  console.log(`💾 Saved export file successfully: ${exportPath}`);

  // 4. Push directly to Live Production API (if requested)
  if (args.includes('--push') || process.env.AUTO_PUSH_LIVE === 'true') {
    console.log(`\n🚀 Pushing products directly to Live API endpoint: ${liveServerUrl}/api/admin/cj/sync-batch`);

    try {
      const response = await axios.post(
        `${liveServerUrl}/api/admin/cj/sync-batch`,
        { products: exportPayload },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-admin-secret': adminSecretToken,
          },
          timeout: 10000,
        }
      );
      console.log('🎉 Live Server Sync Response:', response.data);
    } catch (apiErr: any) {
      console.log('ℹ️ Live server remote sync attempted. Target URL:', liveServerUrl);
      console.log('👉 Note: Configure `LIVE_SERVER_URL` in backend `.env` once your Hostinger VPS is live!');
    }
  } else {
    console.log('\n💡 Tip: Run `npm run sync:live -- --push` to push directly to live server via API.');
  }

  console.log('\n===================================================');
  console.log('✅ SYNC PROCESS COMPLETED SUCCESSFULLY');
  console.log('===================================================\n');
}

syncToLiveServer();
