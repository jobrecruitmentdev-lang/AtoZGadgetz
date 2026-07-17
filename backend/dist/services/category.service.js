import { CategoryRepository } from "../repositories/category.repository.js";
const categoryRepo = new CategoryRepository();
export class CategoryService {
    async getAllCategories() {
        return categoryRepo.findAll();
    }
    async createCategory(data) {
        return categoryRepo.create(data);
    }
    async updateCategory(id, data) {
        return categoryRepo.update(id, data);
    }
    async deleteCategory(id) {
        return categoryRepo.delete(id);
    }
}
//# sourceMappingURL=category.service.js.map