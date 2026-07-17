import { ProductReviewRepository } from "../repositories/product_review.repository.js";

const repo = new ProductReviewRepository();

export class ProductReviewService {
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
