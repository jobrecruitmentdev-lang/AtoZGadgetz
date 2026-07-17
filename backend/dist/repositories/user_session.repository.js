import { prisma } from "../prisma.js";
export class UserSessionRepository {
    async findAllForUser(userId) {
        return prisma.userSession.findMany({
            where: { user_id: userId },
            orderBy: { created_at: "desc" },
        });
    }
    async findById(id) {
        return prisma.userSession.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.userSession.create({ data });
    }
}
//# sourceMappingURL=user_session.repository.js.map