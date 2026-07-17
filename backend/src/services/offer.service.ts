import { Prisma } from "@prisma/client";
import { OfferRepository } from "../repositories/offer.repository.js";

const repo = new OfferRepository();

export class OfferService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }

  async updateOffer(id: number, data: Prisma.OfferUncheckedUpdateInput) {
    return repo.update(id, data);
  }

  async deleteOffer(id: number) {
    return repo.delete(id);
  }
}
