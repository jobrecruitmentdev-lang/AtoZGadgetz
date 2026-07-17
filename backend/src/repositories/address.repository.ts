import { prisma } from "../prisma.js";

export class AddressRepository {
  async findByUserId(userId: number) {
    return prisma.userAddress.findMany({ where: { user_id: userId } });
  }

  async create(userId: number, data: any) {
    if (data.is_default) {
      // Unset previous defaults
      await prisma.userAddress.updateMany({
        where: { user_id: userId, is_default: true },
        data: { is_default: false },
      });
    }
    return prisma.userAddress.create({
      data: {
        ...data,
        user_id: userId,
      },
    });
  }
}
