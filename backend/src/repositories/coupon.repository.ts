import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

export class CouponRepository {
  async findAll() {
    return prisma.coupon.findMany();
  }
  async findById(id: number) {
    return prisma.coupon.findUnique({ where: { id } });
  }
  async create(data: any) {
    return prisma.coupon.create({ data });
  }

  async update(id: number, data: Prisma.CouponUncheckedUpdateInput) {
    return prisma.coupon.update({ where: { id }, data });
  }

  async delete(id: number) {
    return prisma.coupon.delete({ where: { id } });
  }
}
