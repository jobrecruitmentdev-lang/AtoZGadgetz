import { prisma } from "../prisma.js";
export class AuditLogRepository {
    async findAll() {
        return prisma.auditLog.findMany();
    }
    async findById(id) {
        return prisma.auditLog.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.auditLog.create({ data });
    }
}
//# sourceMappingURL=audit_log.repository.js.map