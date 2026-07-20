import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.productImage.count({
    where: {
      product: {
        slug: 'atoz-pro-wireless-earbuds'
      }
    }
  });
  console.log(`Images for atoz-pro-wireless-earbuds: ${count}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
