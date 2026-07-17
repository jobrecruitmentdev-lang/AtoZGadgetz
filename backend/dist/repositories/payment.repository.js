import { prisma } from "../prisma.js";
export class PaymentRepository {
    async findAll() {
        return prisma.payment.findMany();
    }
    async findById(id) {
        return prisma.payment.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.payment.create({ data });
    }
}
//# sourceMappingURL=payment.repository.js.map