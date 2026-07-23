import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      },
      subcategories: {
        include: {
          _count: {
            select: { products: true }
          }
        }
      }
    }
  });

  console.log('--- Product Count by Category ---');
  for (const cat of categories) {
    console.log(`- ${cat.name} (ID: ${cat.id}): ${cat._count.products} products directly attached`);
    for (const subcat of cat.subcategories) {
      console.log(`  -- ${subcat.name} (ID: ${subcat.id}): ${subcat._count.products} products`);
    }
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
