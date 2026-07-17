import { AddressRepository } from "../repositories/address.repository.js";
const repo = new AddressRepository();
export class AddressService {
    async getByUserId(userId) {
        return repo.findByUserId(userId);
    }
    async createAddress(userId, data) {
        return repo.create(userId, data);
    }
}
//# sourceMappingURL=address.service.js.map