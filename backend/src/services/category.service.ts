import { CategoryRepository } from "../repositories/category.repository";
import { Prisma } from "@prisma/client";

const categoryRepo = new CategoryRepository();

export class CategoryService {
  async getAllCategories() {
    return categoryRepo.findAll();
  }

  async createCategory(data: Prisma.CategoryUncheckedCreateInput) {
    return categoryRepo.create(data);
  }

  async updateCategory(id: number, data: Prisma.CategoryUncheckedUpdateInput) {
    return categoryRepo.update(id, data);
  }

  async deleteCategory(id: number) {
    return categoryRepo.delete(id);
  }
}
