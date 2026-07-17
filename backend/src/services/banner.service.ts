import { Prisma } from "@prisma/client";
import { BannerRepository } from "../repositories/banner.repository.js";

const repo = new BannerRepository();

export class BannerService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }

  async updateBanner(id: number, data: Prisma.BannerUncheckedUpdateInput) {
    return repo.update(id, data);
  }

  async deleteBanner(id: number) {
    return repo.delete(id);
  }
}
