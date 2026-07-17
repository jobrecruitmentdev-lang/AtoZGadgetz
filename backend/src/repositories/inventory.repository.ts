import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export class InventoryRepository {
  async findAll() {
    return prisma.inventory.findMany();
  }
  async findById(id: number) {
    return prisma.inventory.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.inventory.create({ data });
  }

  async update(id: number, data: Prisma.InventoryUncheckedUpdateInput) {
    return prisma.inventory.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.inventory.delete({ where: { id } });
  }
}
