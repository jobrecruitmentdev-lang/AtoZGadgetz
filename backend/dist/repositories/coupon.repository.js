import { prisma } from "../prisma.js";
export class CouponRepository {
    async findAll() {
        return prisma.coupon.findMany();
    }
    async findById(id) {
        return prisma.coupon.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.coupon.create({ data });
    }
    async update(id, data) {
        return prisma.coupon.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.coupon.delete({ where: { id } });
    }
}
//# sourceMappingURL=coupon.repository.js.map