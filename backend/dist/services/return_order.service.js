import { ReturnOrderRepository } from "../repositories/return_order.repository.js";
const repo = new ReturnOrderRepository();
export class ReturnOrderService {
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
//# sourceMappingURL=return_order.service.js.map