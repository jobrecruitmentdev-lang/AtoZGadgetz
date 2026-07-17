import { prisma } from "../prisma.js";
export class ProductRepository {
    async findAll() {
        return prisma.product.findMany({
            include: {
                category: true,
                brand: true,
                images: true,
                variants: true,
            },
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