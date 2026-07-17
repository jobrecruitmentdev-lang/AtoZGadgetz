import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export class CategoryRepository {
  async findAll() {
    return prisma.category.findMany({ include: { subcategories: true } });
  }

  async create(data: Prisma.CategoryUncheckedCreateInput) {
    return prisma.category.create({ data });
  }

  async update(id: number, data: Prisma.CategoryUncheckedUpdateInput) {
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.category.delete({ where: { id } });
  }
}
