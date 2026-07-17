import { AnalyticsEventRepository } from "../repositories/analytics_event.repository.js";
const repo = new AnalyticsEventRepository();
export class AnalyticsEventService {
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
//# sourceMappingURL=analytics_event.service.js.map