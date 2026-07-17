import { CouponRepository } from "../repositories/coupon.repository.js";
const repo = new CouponRepository();
export class CouponService {
    async getAll() {
        return repo.findAll();
    }
    async getById(id) {
        return repo.findById(id);
    }
    async create(data) {
        return repo.create(data);
    }
    async updateCoupon(id, data) {
        return repo.update(id, data);
    }
    async deleteCoupon(id) {
        return repo.delete(id);
    }
}
//# sourceMappingURL=coupon.service.js.map