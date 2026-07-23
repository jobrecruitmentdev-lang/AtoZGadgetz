import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function check() {
  const user = await prisma.user.findFirst({ where: { role: { role_name: 'SuperAdmin' } } });
  console.log('Admin User in DB:', user?.email);
  const count = await prisma.user.count();
  console.log('Total users:', count);
}
check().finally(() => prisma.$disconnect());
