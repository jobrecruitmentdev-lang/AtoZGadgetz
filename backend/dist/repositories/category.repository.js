import { prisma } from "../prisma.js";
export class CategoryRepository {
    async findAll() {
        return prisma.category.findMany({ include: { subcategories: true } });
    }
    async create(data) {
        return prisma.category.create({ data });
    }
    async update(id, data) {
        return prisma.category.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.category.delete({ where: { id } });
    }
}
//# sourceMappingURL=category.repository.js.map