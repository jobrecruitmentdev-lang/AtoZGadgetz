import { Prisma } from "@prisma/client";
import { InventoryRepository } from "../repositories/inventory.repository";

const repo = new InventoryRepository();

export class InventoryService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }

  async updateInventory(
    id: number,
    data: Prisma.InventoryUncheckedUpdateInput,
  ) {
    return repo.update(id, data);
  }

  async deleteInventory(id: number) {
    return repo.delete(id);
  }
}
