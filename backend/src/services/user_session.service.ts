import { UserSessionRepository } from "../repositories/user_session.repository.js";

const repo = new UserSessionRepository();

export class UserSessionService {
  async getAllForUser(userId: number) {
    return repo.findAllForUser(userId);
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }
}
