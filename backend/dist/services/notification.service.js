import { NotificationRepository } from "../repositories/notification.repository.js";
const repo = new NotificationRepository();
export class NotificationService {
    async getAllForUser(userId) {
        return repo.findAllForUser(userId);
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
}
//# sourceMappingURL=notification.service.js.map