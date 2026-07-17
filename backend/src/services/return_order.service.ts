import { ReturnOrderRepository } from "../repositories/return_order.repository.js";

const repo = new ReturnOrderRepository();

export class ReturnOrderService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }
}
