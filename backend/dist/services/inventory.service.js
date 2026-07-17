import { InventoryRepository } from "../repositories/inventory.repository.js";
const repo = new InventoryRepository();
export class InventoryService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
    async updateInventory(id, data) {
        return repo.update(id, data);
    }
    async deleteInventory(id) {
        return repo.delete(id);
    }
}
//# sourceMappingURL=inventory.service.js.map