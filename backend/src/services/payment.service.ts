import { PaymentRepository } from "../repositories/payment.repository.js";

const repo = new PaymentRepository();

export class PaymentService {
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
