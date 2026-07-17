import { prisma } from "../prisma.js";

export class ShipmentRepository {
  async findAll() {
    return prisma.shipment.findMany();
  }
  async findById(id: number) {
    return prisma.shipment.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.shipment.create({ data });
  }
}
