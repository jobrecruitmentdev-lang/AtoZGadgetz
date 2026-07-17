import { Request, Response } from "express";
import { ReturnOrderService } from "../services/return_order.service.js";
import { createReturnOrderSchema } from "../validators/return_order.schema.js";

const service = new ReturnOrderService();

export const getAllReturnOrders = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createReturnOrder = async (req: Request, res: Response) => {
  try {
    const input = createReturnOrderSchema.parse(req.body);
    const data = await service.create({ ...input, user_id: req.user!.id });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
