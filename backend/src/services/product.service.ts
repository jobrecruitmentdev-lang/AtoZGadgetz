import { ProductRepository } from "../repositories/product.repository";
import { Prisma } from "@prisma/client";

const productRepo = new ProductRepository();

export class ProductService {
  async getAllProducts() {
    return productRepo.findAll();
  }

  async getProductBySlug(slug: string) {
    const numericId = parseInt(slug, 10);
    if (!isNaN(numericId) && numericId.toString() === slug) {
      return productRepo.findById(numericId);
    }
    return productRepo.findBySlug(slug);
  }

  async createProduct(data: Prisma.ProductUncheckedCreateInput) {
    return productRepo.create(data);
  }

  async updateProduct(id: number, data: Prisma.ProductUncheckedUpdateInput) {
    return productRepo.update(id, data);
  }

  async deleteProduct(id: number) {
    return productRepo.delete(id);
  }
}
