import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export class BannerRepository {
  async findAll() {
    return prisma.banner.findMany();
  }
  async findById(id: number) {
    return prisma.banner.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.banner.create({ data });
  }

  async update(id: number, data: Prisma.BannerUncheckedUpdateInput) {
    return prisma.banner.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.banner.delete({ where: { id } });
  }
}
