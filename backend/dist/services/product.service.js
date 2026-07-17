import { ProductRepository } from "../repositories/product.repository.js";
const productRepo = new ProductRepository();
export class ProductService {
    async getAllProducts() {
        return productRepo.findAll();
    }
    async getProductBySlug(slug) {
        const numericId = parseInt(slug, 10);
        if (!isNaN(numericId) && numericId.toString() === slug) {
            return productRepo.findById(numericId);
        }
        return productRepo.findBySlug(slug);
    }
    async createProduct(data) {
        return productRepo.create(data);
    }
    async updateProduct(id, data) {
        return productRepo.update(id, data);
    }
    async deleteProduct(id) {
        return productRepo.delete(id);
    }
}
//# sourceMappingURL=product.service.js.map