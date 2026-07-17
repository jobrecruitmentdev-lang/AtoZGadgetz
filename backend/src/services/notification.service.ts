import { NotificationRepository } from "../repositories/notification.repository";

const repo = new NotificationRepository();

export class NotificationService {
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
