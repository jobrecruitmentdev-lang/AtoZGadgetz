import { AuditLogRepository } from "../repositories/audit_log.repository.js";

const repo = new AuditLogRepository();

export class AuditLogService {
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
