import { AnalyticsEventRepository } from "../repositories/analytics_event.repository";

const repo = new AnalyticsEventRepository();

export class AnalyticsEventService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }
}
