import { prisma } from "../prisma.js";
export class AnalyticsEventRepository {
    async findAll() {
        return prisma.analyticsEvent.findMany();
    }
    async findById(id) {
        return prisma.analyticsEvent.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.analyticsEvent.create({ data });
    }
}
//# sourceMappingURL=analytics_event.repository.js.map