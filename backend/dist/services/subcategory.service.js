import { SubcategoryRepository } from "../repositories/subcategory.repository.js";
const subcategoryRepo = new SubcategoryRepository();
export class SubcategoryService {
    async getAllSubcategories() {
        return subcategoryRepo.findAll();
    }
    async createSubcategory(data) {
        return subcategoryRepo.create(data);
    }
}
//# sourceMappingURL=subcategory.service.js.map