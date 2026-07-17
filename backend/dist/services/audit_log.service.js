import { AuditLogRepository } from "../repositories/audit_log.repository.js";
const repo = new AuditLogRepository();
export class AuditLogService {
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
//# sourceMappingURL=audit_log.service.js.map