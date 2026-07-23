import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: true
    },
    where: {
      id: { in: [1, 2, 3, 12] }
    }
  });

  // Get the first user to assign as creator
  const adminUser = await prisma.user.findFirst();
  if (!adminUser) {
     console.log('No user found to assign products to.');
     return;
  }

  console.log('Starting seed...');
  let totalCreated = 0;

  for (const cat of categories) {
    const subcatId = cat.subcategories.length > 0 ? cat.subcategories[0].id : 1;
    
    console.log(`Adding 100 products to category: ${cat.name}`);
    
    const productsData = [];
    for (let i = 1; i <= 100; i++) {
      const sku = `DUMMY-${cat.id}-${subcatId}-${uuidv4().substring(0, 8)}`;
      productsData.push({
        category_id: cat.id,
        subcategory_id: subcatId,
        name: `${cat.name} Product ${i}`,
        slug: `${cat.slug}-product-${i}-${uuidv4().substring(0, 8)}`,
        short_description: `This is a great ${cat.name} product for public e2e test.`,
        description: `This is a highly rated ${cat.name} product, complete with features and amazing quality.`,
        sku: sku,
        price: 10 + Math.floor(Math.random() * 90),
        stock_quantity: 100,
        status: 'active',
        created_by: adminUser.id,
        thumbnail_image: 'https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=600&q=80',
        fulfillment_type: 'cj',
      });
    }

    const batchResult = await prisma.product.createMany({
      data: productsData,
      skipDuplicates: true,
    });
    console.log(`Added ${batchResult.count} products to ${cat.name}`);
    totalCreated += batchResult.count;
  }

  console.log(`Finished seeding! Total products added: ${totalCreated}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
