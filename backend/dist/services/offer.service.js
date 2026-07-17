import { OfferRepository } from "../repositories/offer.repository.js";
const repo = new OfferRepository();
export class OfferService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
    async updateOffer(id, data) {
        return repo.update(id, data);
    }
    async deleteOffer(id) {
        return repo.delete(id);
    }
}
//# sourceMappingURL=offer.service.js.map