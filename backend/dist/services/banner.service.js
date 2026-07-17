import { BannerRepository } from "../repositories/banner.repository.js";
const repo = new BannerRepository();
export class BannerService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
    async updateBanner(id, data) {
        return repo.update(id, data);
    }
    async deleteBanner(id) {
        return repo.delete(id);
    }
}
//# sourceMappingURL=banner.service.js.map