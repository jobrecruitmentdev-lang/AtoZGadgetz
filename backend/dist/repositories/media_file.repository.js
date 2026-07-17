import { prisma } from "../prisma.js";
export class MediaFileRepository {
    async findAll() {
        return prisma.mediaFile.findMany();
    }
    async findById(id) {
        return prisma.mediaFile.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.mediaFile.create({ data });
    }
}
//# sourceMappingURL=media_file.repository.js.map