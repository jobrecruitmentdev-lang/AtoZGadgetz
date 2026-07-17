import { prisma } from "../prisma.js";
export class HomepageSectionRepository {
    async findAll() {
        return prisma.homepageSection.findMany();
    }
    async findById(id) {
        return prisma.homepageSection.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.homepageSection.create({ data });
    }
    async update(id, data) {
        return prisma.homepageSection.update({ where: { id }, data });
    }
    async delete(id) {
        return prisma.homepageSection.delete({ where: { id } });
    }
}
//# sourceMappingURL=homepage_section.repository.js.map