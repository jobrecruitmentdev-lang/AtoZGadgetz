import { prisma } from "../prisma.js";

export class UserSessionRepository {
  async findAllForUser(userId: number) {
    return prisma.userSession.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
    });
  }
  async findById(id: number) {
    return prisma.userSession.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.userSession.create({ data });
  }
}
