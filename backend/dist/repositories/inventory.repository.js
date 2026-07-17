import { prisma } from "../prisma.js";
export class InventoryRepository {
    async findAll() {
        return prisma.inventory.findMany();
    }
    async findById(id) {
        return prisma.inventory.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.inventory.create({ data });
    }
    async update(id, data) {
        return prisma.inventory.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.inventory.delete({ where: { id } });
    }
}
//# sourceMappingURL=inventory.repository.js.map