import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();
async function run() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@atozgadgetz.com' },
    update: { password_hash: adminPassword },
    create: {
      first_name: 'Admin',
      last_name: 'User (Z)',
      email: 'admin@atozgadgetz.com',
      mobile: '0987654321',
      password_hash: adminPassword,
      role_id: 1,
      is_active: true
    }
  });
  console.log('Added admin@atozgadgetz.com');
  await prisma.user.upsert({
    where: { email: 'admin@atozgadgets.com' },
    update: { password_hash: adminPassword },
    create: {
      first_name: 'Admin',
      last_name: 'User (S)',
      email: 'admin@atozgadgets.com',
      mobile: '1234567890',
      password_hash: adminPassword,
      role_id: 1,
      is_active: true
    }
  });
  console.log('Added admin@atozgadgets.com');
}
run().finally(() => prisma.$disconnect());
