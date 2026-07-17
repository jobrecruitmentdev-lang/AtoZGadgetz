import { prisma } from "../prisma";

export class ReturnOrderRepository {
  async findAll() {
    return prisma.returnOrder.findMany();
  }
  async findById(id: number) {
    return prisma.returnOrder.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.returnOrder.create({ data });
  }
}
