import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export class UserRepository {
  async findByEmailOrMobile(email: string, mobile: string) {
    return prisma.user.findFirst({
      where: { OR: [{ email }, { mobile }] },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findByMobile(mobile: string) {
    return prisma.user.findUnique({ where: { mobile } });
  }

  async create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data });
  }

  async findById(id: number) {
    return prisma.user.findUnique({ where: { id } });
  }

  async updateById(id: number, data: Prisma.UserUncheckedUpdateInput) {
    return prisma.user.update({ where: { id }, data });
  }
}
