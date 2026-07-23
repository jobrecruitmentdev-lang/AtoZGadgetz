import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetProducts() {
  console.log('==============================================');
  console.log('  PURGING OLD TEST PRODUCTS FROM DATABASE     ');
  console.log('==============================================\n');

  try {
    await prisma.$connect();

    // 1. Delete dependent tables
    await prisma.cjOrder.deleteMany({});
    await prisma.cjShipment.deleteMany({});
    await prisma.cjProduct.deleteMany({});
    await prisma.cartItem.deleteMany({});
    await prisma.wishlistItem.deleteMany({});
    await prisma.orderItem.deleteMany({});
    await prisma.productVariant.deleteMany({});
    await prisma.productImage.deleteMany({});

    // 2. Delete CJ imported products
    const deletedCj = await prisma.product.deleteMany({
      where: {
        fulfillment_type: 'cj',
      },
    });

    console.log(`✅ Successfully deleted ${deletedCj.count} old raw/test CJ products from local database.`);
    console.log('\nNow your "Staged Products in DB" catalog is 100% clean and ready for fresh imports!\n');
  } catch (error: any) {
    console.error('❌ Error during product purge:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetProducts();
