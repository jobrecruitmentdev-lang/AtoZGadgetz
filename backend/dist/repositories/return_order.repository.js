import { prisma } from "../prisma.js";
export class ReturnOrderRepository {
    async findAll() {
        return prisma.returnOrder.findMany();
    }
    async findById(id) {
        return prisma.returnOrder.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.returnOrder.create({ data });
    }
}
//# sourceMappingURL=return_order.repository.js.map