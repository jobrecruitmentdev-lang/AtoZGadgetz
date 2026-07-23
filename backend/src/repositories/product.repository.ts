import { prisma } from "../prisma.js";
import { Prisma } from "@prisma/client";

export class ProductRepository {
  async findAll(limit?: number) {
    return prisma.product.findMany({
      take: limit,
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  async findBySlug(slug: string) {
    return prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });
  }

  async findById(id: number) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true,
        variants: true,
      },
    });
  }

  async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({ data });
  }

  async update(id: number, data: Prisma.ProductUncheckedUpdateInput) {
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.product.delete({ where: { id } });
  }
}
