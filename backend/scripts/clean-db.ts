import { PrismaClient } from '@prisma/client';
import readline from 'readline';

const prisma = new PrismaClient();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function cleanDatabase() {
  console.log("=========================================");
  console.log("   PRODUCTION DATABASE CLEANUP UTILITY   ");
  console.log("=========================================");
  console.log("This will permanently delete:");
  console.log(" - All Products (including CJ products)");
  console.log(" - All Orders and Order Items");
  console.log(" - All Cart Items & Wishlists");
  console.log(" - All Payments & Shipments");
  console.log("");
  console.log("It will KEEP:");
  console.log(" - Admin Users & Customer Accounts");
  console.log(" - Categories & Brands");
  console.log(" - Banners, Coupons, & Offers");
  console.log("=========================================\n");

  rl.question('Are you sure you want to proceed? This cannot be undone. (yes/no): ', async (answer) => {
    if (answer.toLowerCase() !== 'yes') {
      console.log('Aborted.');
      process.exit(0);
    }

    try {
      console.log('Cleaning up data...');
      
      // Delete in correct order to respect foreign keys
      await prisma.payment.deleteMany();
      await prisma.shipment.deleteMany();
      await prisma.returnOrder.deleteMany();
      
      await prisma.orderItem.deleteMany();
      await prisma.order.deleteMany();
      
      await prisma.cartItem.deleteMany();
      await prisma.cart.deleteMany();
      
      await prisma.wishlistItem.deleteMany();
      await prisma.wishlist.deleteMany();
      
      await prisma.productReview.deleteMany();
      await prisma.inventoryTransaction.deleteMany();
      await prisma.inventory.deleteMany();
      
      await prisma.productVariant.deleteMany();
      await prisma.productImage.deleteMany();
      await prisma.product.deleteMany();
      
      console.log('✅ Database cleaned successfully! Ready for production.');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    } finally {
      await prisma.$disconnect();
      process.exit(0);
    }
  });
}

cleanDatabase();
