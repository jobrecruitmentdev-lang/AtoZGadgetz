import { OrderRepository } from "../repositories/order.repository.js";
const repo = new OrderRepository();
export class OrderService {
    async getAll() {
        return repo.findAll();
    }
    async getMyOrders(userId) {
        return repo.findMyOrders(userId);
    }
    async getById(id) {
        return repo.findById(id);
    }
    async placeOrder(userId, addressId, couponId) {
        return repo.placeOrder(userId, addressId, couponId);
    }
    async updateStatus(id, status, changedBy) {
        return repo.updateStatus(id, status, changedBy);
    }
}
//# sourceMappingURL=order.service.js.map