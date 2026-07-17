import { Prisma } from "@prisma/client";
import { HomepageSectionRepository } from "../repositories/homepage_section.repository.js";

const repo = new HomepageSectionRepository();

export class HomepageSectionService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }

  async updateHomepageSection(
    id: number,
    data: Prisma.HomepageSectionUncheckedUpdateInput,
  ) {
    return repo.update(id, data);
  }

  async deleteHomepageSection(id: number) {
    return repo.delete(id);
  }
}
