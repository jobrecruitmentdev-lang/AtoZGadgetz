import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export class SubcategoryRepository {
  async findAll() {
    return prisma.subCategory.findMany({ include: { category: true } });
  }

  async create(data: Prisma.SubCategoryUncheckedCreateInput) {
    return prisma.subCategory.create({ data });
  }
}
