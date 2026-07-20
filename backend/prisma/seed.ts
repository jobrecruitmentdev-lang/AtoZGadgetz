import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Roles
  const rolesData = [
    { role_name: 'SuperAdmin', description: 'System Administrator' },
    { role_name: 'Admin', description: 'Store Administrator' },
    { role_name: 'Customer', description: 'Regular Customer' },
  ];

  const createdRoles: Record<string, number> = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { role_name: r.role_name },
      update: {},
      create: r,
    });
    createdRoles[role.role_name] = role.id;
  }
  console.log('Roles seeded.');

  const adminRoleId = createdRoles['SuperAdmin'] || 1;

  // 2. Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@atozgadgets.com' },
    update: {},
    create: {
      first_name: 'Admin',
      last_name: 'User',
      email: 'admin@atozgadgets.com',
      mobile: '1234567890',
      password_hash: adminPassword,
      role_id: adminRoleId,
    },
  });
  console.log('Admin user seeded.');

  // 3. Brand
  const brand = await prisma.brand.upsert({
    where: { slug: 'atoz-audio' },
    update: {},
    create: {
      name: 'AtoZ Audio',
      slug: 'atoz-audio',
      status: 'active',
    },
  });

  // 4. Category & Subcategory
  const audioCategory = await prisma.category.upsert({
    where: { slug: 'audio' },
    update: {},
    create: {
      name: 'Audio & Sound',
      slug: 'audio',
      description: 'Premium headphones and speakers',
    },
  });

  const earbudsSubcat = await prisma.subCategory.upsert({
    where: { slug: 'earbuds' },
    update: {},
    create: {
      name: 'Wireless Earbuds',
      slug: 'earbuds',
      category_id: audioCategory.id,
    },
  });

  const gamingCategory = await prisma.category.upsert({
    where: { slug: 'gaming' },
    update: {},
    create: {
      name: 'Gaming',
      slug: 'gaming',
      description: 'High performance gaming gear',
    },
  });

  const peripheralsSubcat = await prisma.subCategory.upsert({
    where: { slug: 'peripherals' },
    update: {},
    create: {
      name: 'Peripherals',
      slug: 'peripherals',
      category_id: gamingCategory.id,
    },
  });

  const smartHomeCategory = await prisma.category.upsert({
    where: { slug: 'smart-home' },
    update: {},
    create: {
      name: 'Smart Home',
      slug: 'smart-home',
      description: 'Connected devices for your home',
    },
  });

  const lightingSubcat = await prisma.subCategory.upsert({
    where: { slug: 'lighting' },
    update: {},
    create: {
      name: 'Lighting',
      slug: 'lighting',
      category_id: smartHomeCategory.id,
    },
  });

  const mobileCategory = await prisma.category.upsert({
    where: { slug: 'mobile-accessories' },
    update: {},
    create: {
      name: 'Mobile Accessories',
      slug: 'mobile-accessories',
      description: 'Accessories for your mobile devices',
    },
  });

  const powerbankSubcat = await prisma.subCategory.upsert({
    where: { slug: 'power-banks' },
    update: {},
    create: {
      name: 'Power Banks',
      slug: 'power-banks',
      category_id: mobileCategory.id,
    },
  });

  // 5. Products
  const product1 = await prisma.product.upsert({
    where: { slug: 'atoz-pro-wireless-earbuds' },
    update: {},
    create: {
      name: 'AtoZ Pro Wireless Earbuds',
      slug: 'atoz-pro-wireless-earbuds',
      sku: 'ATOZ-EAR-PRO-01',
      price: 149.99,
      discount_price: 129.99,
      stock_quantity: 50,
      description: 'Experience premium sound with Active Noise Cancellation.',
      short_description: 'Premium ANC Earbuds',
      category_id: audioCategory.id,
      subcategory_id: earbudsSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: true,
      thumbnail_image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'atoz-smart-watch-series-x' },
    update: {},
    create: {
      name: 'AtoZ Smart Watch Series X',
      slug: 'atoz-smart-watch-series-x',
      sku: 'ATOZ-WATCH-X-01',
      price: 299.99,
      discount_price: 249.99,
      stock_quantity: 100,
      description: 'Track your health and stay connected with the ultimate smart watch.',
      short_description: 'Next-Gen Smartwatch',
      category_id: audioCategory.id, // Using existing category for simplicity
      subcategory_id: earbudsSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: true,
      thumbnail_image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  const product3 = await prisma.product.upsert({
    where: { slug: 'atoz-pro-gaming-mouse' },
    update: {},
    create: {
      name: 'AtoZ Pro Gaming Mouse',
      slug: 'atoz-pro-gaming-mouse',
      sku: 'ATOZ-GMOUSE-01',
      price: 79.99,
      discount_price: 59.99,
      stock_quantity: 150,
      description: 'Ultra-lightweight wireless gaming mouse with 20K DPI optical sensor.',
      short_description: 'Wireless Gaming Mouse',
      category_id: gamingCategory.id,
      subcategory_id: peripheralsSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: true,
      thumbnail_image: 'https://images.unsplash.com/photo-1527814050087-379381547969?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1527814050087-379381547969?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  const product4 = await prisma.product.upsert({
    where: { slug: 'atoz-mechanical-keyboard' },
    update: {},
    create: {
      name: 'AtoZ Mechanical Keyboard',
      slug: 'atoz-mechanical-keyboard',
      sku: 'ATOZ-KEYBOARD-01',
      price: 129.99,
      discount_price: 109.99,
      stock_quantity: 80,
      description: 'Tactile mechanical switches with customizable RGB backlighting.',
      short_description: 'RGB Mechanical Keyboard',
      category_id: gamingCategory.id,
      subcategory_id: peripheralsSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: false,
      thumbnail_image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  const product5 = await prisma.product.upsert({
    where: { slug: 'atoz-smart-rgb-bulb' },
    update: {},
    create: {
      name: 'AtoZ Smart RGB Bulb',
      slug: 'atoz-smart-rgb-bulb',
      sku: 'ATOZ-SMARTBULB-01',
      price: 29.99,
      discount_price: 24.99,
      stock_quantity: 300,
      description: 'WiFi-enabled LED smart bulb with 16 million colors and voice control.',
      short_description: 'WiFi Smart LED Bulb',
      category_id: smartHomeCategory.id,
      subcategory_id: lightingSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: true,
      thumbnail_image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  const product6 = await prisma.product.upsert({
    where: { slug: 'atoz-fast-charger-65w' },
    update: {},
    create: {
      name: 'AtoZ Fast Charger 65W',
      slug: 'atoz-fast-charger-65w',
      sku: 'ATOZ-CHARGER-65W',
      price: 39.99,
      discount_price: 29.99,
      stock_quantity: 200,
      description: 'Ultra-compact 65W GaN fast charger with 2 USB-C and 1 USB-A ports.',
      short_description: '65W GaN Fast Charger',
      category_id: mobileCategory.id,
      subcategory_id: powerbankSubcat.id,
      brand_id: brand.id,
      created_by: admin.id,
      is_featured: true,
      thumbnail_image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
      images: {
        create: [
          {
            image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?q=80&w=600&auto=format&fit=crop',
            sort_order: 1,
          }
        ]
      }
    },
  });

  console.log('Seed completed successfully.');
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
