import { HomepageSectionRepository } from "../repositories/homepage_section.repository.js";
const repo = new HomepageSectionRepository();
export class HomepageSectionService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
    async updateHomepageSection(id, data) {
        return repo.update(id, data);
    }
    async deleteHomepageSection(id) {
        return repo.delete(id);
    }
}
//# sourceMappingURL=homepage_section.service.js.map