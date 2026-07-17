import { ProductReviewRepository } from "../repositories/product_review.repository.js";
const repo = new ProductReviewRepository();
export class ProductReviewService {
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
//# sourceMappingURL=product_review.service.js.map