import { BrandRepository } from "../repositories/brand.repository.js";
const brandRepo = new BrandRepository();
export class BrandService {
    async getAllBrands() {
        return brandRepo.findAll();
    }
    async createBrand(data) {
        return brandRepo.create(data);
    }
    async updateBrand(id, data) {
        return brandRepo.update(id, data);
    }
    async deleteBrand(id) {
        return brandRepo.delete(id);
    }
}
//# sourceMappingURL=brand.service.js.map