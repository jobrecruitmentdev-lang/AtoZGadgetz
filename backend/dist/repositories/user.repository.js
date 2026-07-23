import { prisma } from "../prisma.js";
export class UserRepository {
    async findByEmailOrMobile(email, mobile) {
        return prisma.user.findFirst({
            where: { OR: [{ email }, { mobile }] },
        });
    }
    async findByEmail(email) {
        return prisma.user.findUnique({ where: { email } });
    }
    async findByMobile(mobile) {
        return prisma.user.findUnique({ where: { mobile } });
    }
    async create(data) {
        return prisma.user.create({ data });
    }
    async findById(id) {
        return prisma.user.findUnique({ where: { id } });
    }
    async updateById(id, data) {
        return prisma.user.update({ where: { id }, data });
    }
}
//# sourceMappingURL=user.repository.js.map