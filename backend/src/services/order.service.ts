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

  async getInvoiceById(id: number) {
    return repo.findInvoiceById(id);
  }

  async placeOrder(userId: number | undefined, payload: any) {
    return repo.placeOrder(userId, payload);
  }
  async updateStatus(id: number, status: string, changedBy: number) {
    return repo.updateStatus(id, status, changedBy);
  }
}
