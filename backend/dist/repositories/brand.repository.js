import { prisma } from "../prisma.js";
export class BrandRepository {
    async findAll() {
        return prisma.brand.findMany();
    }
    async create(data) {
        return prisma.brand.create({ data });
    }
    async update(id, data) {
        return prisma.brand.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.brand.delete({ where: { id } });
    }
}
//# sourceMappingURL=brand.repository.js.map