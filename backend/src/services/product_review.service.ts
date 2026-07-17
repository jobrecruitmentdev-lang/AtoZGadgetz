import { ProductReviewRepository } from "../repositories/product_review.repository";

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
