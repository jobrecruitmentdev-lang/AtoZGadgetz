import { MediaFileRepository } from "../repositories/media_file.repository";

const repo = new MediaFileRepository();

export class MediaFileService {
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
