import { prisma } from "../prisma.js";
export class NotificationRepository {
    async findAllForUser(userId) {
        return prisma.notification.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
        });
    }
    async findById(id) {
        return prisma.notification.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.notification.create({ data });
    }
}
//# sourceMappingURL=notification.repository.js.map