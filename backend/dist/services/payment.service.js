import { PaymentRepository } from "../repositories/payment.repository.js";
const repo = new PaymentRepository();
export class PaymentService {
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
//# sourceMappingURL=payment.service.js.map