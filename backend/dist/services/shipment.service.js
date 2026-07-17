import { ShipmentRepository } from "../repositories/shipment.repository.js";
const repo = new ShipmentRepository();
export class ShipmentService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
}
//# sourceMappingURL=shipment.service.js.map