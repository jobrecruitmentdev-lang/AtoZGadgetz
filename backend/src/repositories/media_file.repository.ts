import { prisma } from "../prisma";

export class MediaFileRepository {
  async findAll() {
    return prisma.mediaFile.findMany();
  }
  async findById(id: number) {
    return prisma.mediaFile.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.mediaFile.create({ data });
  }
}
