import { AddressRepository } from "../repositories/address.repository.js";

const repo = new AddressRepository();

export class AddressService {
  async getByUserId(userId: number) {
    return repo.findByUserId(userId);
  }

  async createAddress(userId: number, data: any) {
    return repo.create(userId, data);
  }
}
