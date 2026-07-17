import { prisma } from "../prisma.js";
export class ProductReviewRepository {
    async findAll() {
        return prisma.productReview.findMany();
    }
    async findById(id) {
        return prisma.productReview.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.productReview.create({ data });
    }
}
//# sourceMappingURL=product_review.repository.js.map