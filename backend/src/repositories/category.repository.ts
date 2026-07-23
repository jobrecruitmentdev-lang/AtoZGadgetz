import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export class CategoryRepository {
  async findAll(onlyWithProducts?: boolean) {
    const whereClause = onlyWithProducts
      ? {
          products: {
            some: { is_active: true },
          },
        }
      : {};

    return prisma.category.findMany({
      where: whereClause,
      include: {
        subcategories: true,
        _count: {
          select: { products: true },
        },
      },
    });
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
