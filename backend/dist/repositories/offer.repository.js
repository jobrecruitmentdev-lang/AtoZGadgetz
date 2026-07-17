import { prisma } from "../prisma.js";
export class OfferRepository {
    async findAll() {
        return prisma.offer.findMany();
    }
    async findById(id) {
        return prisma.offer.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.offer.create({ data });
    }
    async update(id, data) {
        return prisma.offer.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.offer.delete({ where: { id } });
    }
}
//# sourceMappingURL=offer.repository.js.map