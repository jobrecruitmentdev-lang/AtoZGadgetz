import { prisma } from "../prisma";

export class AuditLogRepository {
  async findAll() {
    return prisma.auditLog.findMany();
  }
  async findById(id: number) {
    return prisma.auditLog.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.auditLog.create({ data });
  }
}
