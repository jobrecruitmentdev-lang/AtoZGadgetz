import { MediaFileRepository } from "../repositories/media_file.repository.js";
const repo = new MediaFileRepository();
export class MediaFileService {
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
//# sourceMappingURL=media_file.service.js.map