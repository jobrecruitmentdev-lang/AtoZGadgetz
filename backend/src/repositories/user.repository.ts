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

  async create(data: Prisma.UserUncheckedCreateInput) {
    return prisma.user.create({ data });
  }
}
