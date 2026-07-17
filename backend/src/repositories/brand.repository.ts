import { prisma } from "../prisma";
import { Prisma } from "@prisma/client";

export class BrandRepository {
  async findAll() {
    return prisma.brand.findMany();
  }

  async create(data: Prisma.BrandUncheckedCreateInput) {
    return prisma.brand.create({ data });
  }

  async update(id: number, data: Prisma.BrandUncheckedUpdateInput) {
    return prisma.brand.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.brand.delete({ where: { id } });
  }
}
