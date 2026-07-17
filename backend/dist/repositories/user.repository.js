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
    async create(data) {
        return prisma.user.create({ data });
    }
}
//# sourceMappingURL=user.repository.js.map