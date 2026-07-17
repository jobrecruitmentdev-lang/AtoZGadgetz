import { prisma } from "../prisma";

export class AnalyticsEventRepository {
  async findAll() {
    return prisma.analyticsEvent.findMany();
  }
  async findById(id: number) {
    return prisma.analyticsEvent.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.analyticsEvent.create({ data });
  }
}
