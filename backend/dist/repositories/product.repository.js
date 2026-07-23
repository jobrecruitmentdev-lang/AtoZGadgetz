import { prisma } from "../prisma.js";
export class ProductRepository {
    async findAll(limit) {
        return prisma.product.findMany({
            take: limit,
            include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
            },
            orderBy: { created_at: 'desc' },
        });
    }
    async findBySlug(slug) {
        return prisma.product.findUnique({
            where: { slug },
            include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
            },
        });
    }
    async findById(id) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
            },
        });
    }
    async create(data) {
        return prisma.product.create({ data });
    }
    async update(id, data) {
        return prisma.product.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.product.delete({ where: { id } });
    }
}
//# sourceMappingURL=product.repository.js.map