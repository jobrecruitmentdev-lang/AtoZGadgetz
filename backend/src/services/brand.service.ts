import { BrandRepository } from "../repositories/brand.repository";
import { Prisma } from "@prisma/client";

const brandRepo = new BrandRepository();

export class BrandService {
  async getAllBrands() {
    return brandRepo.findAll();
  }

  async createBrand(data: Prisma.BrandUncheckedCreateInput) {
    return brandRepo.create(data);
  }

  async updateBrand(id: number, data: Prisma.BrandUncheckedUpdateInput) {
    return brandRepo.update(id, data);
  }

  async deleteBrand(id: number) {
    return brandRepo.delete(id);
  }
}
