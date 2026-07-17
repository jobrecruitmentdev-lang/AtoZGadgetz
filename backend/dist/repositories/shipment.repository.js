import { prisma } from "../prisma.js";
export class ShipmentRepository {
    async findAll() {
        return prisma.shipment.findMany();
    }
    async findById(id) {
        return prisma.shipment.findUnique({ where: { id } });
    }
    async create(data) {
        return prisma.shipment.create({ data });
    }
}
//# sourceMappingURL=shipment.repository.js.map