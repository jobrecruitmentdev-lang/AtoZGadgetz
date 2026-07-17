import { prisma } from "../prisma.js";
export class BannerRepository {
    async findAll() {
        return prisma.banner.findMany();
    }
    async findById(id) {
        return prisma.banner.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.banner.create({ data });
    }
    async update(id, data) {
        return prisma.banner.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.banner.delete({ where: { id } });
    }
}
//# sourceMappingURL=banner.repository.js.map