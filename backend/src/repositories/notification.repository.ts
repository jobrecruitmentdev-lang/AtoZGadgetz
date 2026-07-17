import { prisma } from "../prisma";

export class NotificationRepository {
  async findAllForUser(userId: number) {
    return prisma.notification.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }
  async findById(id: number) {
    return prisma.notification.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.notification.create({ data });
  }
}
