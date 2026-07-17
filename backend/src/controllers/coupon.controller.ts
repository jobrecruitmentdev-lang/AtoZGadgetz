import { Request, Response } from "express";
import { CouponService } from "../services/coupon.service.js";
import { createCouponSchema } from "../validators/coupon.schema.js";

const service = new CouponService();

export const getAllCoupons = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCoupon = async (req: Request, res: Response) => {
  try {
    const input = createCouponSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const validatedData = createCouponSchema.partial().parse(req.body);
    const coupon = await service.updateCoupon(id, validatedData);
    res.json({ success: true, data: coupon });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const deleteCoupon = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    await service.deleteCoupon(id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
