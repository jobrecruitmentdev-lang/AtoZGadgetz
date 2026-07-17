import { OrderRepository } from "../repositories/order.repository.js";

const repo = new OrderRepository();

export class OrderService {
  async getAll() {
    return repo.findAll();
  }

  async getMyOrders(userId: number) {
    return repo.findMyOrders(userId);
  }

  async getById(id: number) {
    return repo.findById(id);
  }

  async placeOrder(userId: number, addressId: number, couponId: number | null) {
    return repo.placeOrder(userId, addressId, couponId);
  }
  async updateStatus(id: number, status: string, changedBy: number) {
    return repo.updateStatus(id, status, changedBy);
  }
}
