import { prisma } from "../prisma";

export class ProductReviewRepository {
  async findAll() {
    return prisma.productReview.findMany();
  }
  async findById(id: number) {
    return prisma.productReview.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.productReview.create({ data });
  }
}
