import { prisma } from "../prisma.js";
export class CategoryRepository {
    async findAll(onlyWithProducts) {
        const whereClause = onlyWithProducts
            ? {
                products: {
                    some: { is_active: true },
                },
            }
            : {};
        return prisma.category.findMany({
            where: whereClause,
            include: {
                subcategories: true,
                _count: {
                    select: { products: true },
                },
            },
        });
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