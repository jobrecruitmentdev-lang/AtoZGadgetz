import { prisma } from "../prisma.js";
export class SubcategoryRepository {
    async findAll() {
        return prisma.subCategory.findMany({ include: { category: true } });
    }
    async create(data) {
        return prisma.subCategory.create({ data });
    }
}
//# sourceMappingURL=subcategory.repository.js.map