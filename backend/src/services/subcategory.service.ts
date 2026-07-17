import { SubcategoryRepository } from "../repositories/subcategory.repository.js";
import { Prisma } from "@prisma/client";

const subcategoryRepo = new SubcategoryRepository();

export class SubcategoryService {
  async getAllSubcategories() {
    return subcategoryRepo.findAll();
  }

  async createSubcategory(data: Prisma.SubCategoryUncheckedCreateInput) {
    return subcategoryRepo.create(data);
  }
}
