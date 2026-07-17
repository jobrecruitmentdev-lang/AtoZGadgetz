import { prisma } from "../prisma.js";

export class PaymentRepository {
  async findAll() {
    return prisma.payment.findMany();
  }
  async findById(id: number) {
    return prisma.payment.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.payment.create({ data });
  }
}
