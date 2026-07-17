import { UserSessionRepository } from "../repositories/user_session.repository.js";
const repo = new UserSessionRepository();
export class UserSessionService {
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
//# sourceMappingURL=user_session.service.js.map