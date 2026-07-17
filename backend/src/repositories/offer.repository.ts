import { Prisma } from "@prisma/client";
import { prisma } from "../prisma";

export class OfferRepository {
  async findAll() {
    return prisma.offer.findMany();
  }
  async findById(id: number) {
    return prisma.offer.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.offer.create({ data });
  }

  async update(id: number, data: Prisma.OfferUncheckedUpdateInput) {
    return prisma.offer.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.offer.delete({ where: { id } });
  }
}
