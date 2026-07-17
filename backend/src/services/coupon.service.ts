import { Prisma } from "@prisma/client";
import { CouponRepository } from "../repositories/coupon.repository.js";

const repo = new CouponRepository();

export class CouponService {
  async getAll() {
    return repo.findAll();
  }
  async getById(id: number) {
    return repo.findById(id);
  }
  async create(data: any) {
    return repo.create(data);
  }

  async updateCoupon(id: number, data: Prisma.CouponUncheckedUpdateInput) {
    return repo.update(id, data);
  }

  async deleteCoupon(id: number) {
    return repo.delete(id);
  }
}
