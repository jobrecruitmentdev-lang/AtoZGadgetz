import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

export class HomepageSectionRepository {
  async findAll() {
    return prisma.homepageSection.findMany();
  }
  async findById(id: number) {
    return prisma.homepageSection.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.homepageSection.create({ data });
  }

  async update(id: number, data: Prisma.HomepageSectionUncheckedUpdateInput) {
    return prisma.homepageSection.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.homepageSection.delete({ where: { id } });
  }
}
