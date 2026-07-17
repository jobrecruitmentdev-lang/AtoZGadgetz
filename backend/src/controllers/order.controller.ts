import { Request, Response } from "express";
import { OrderService } from "../services/order.service";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/order.schema";

const service = new OrderService();

export const getAllOrders = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyOrders = async (req: Request, res: Response) => {
  try {
    const data = await service.getMyOrders(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const data = await service.getById(id);
    if (!data)
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });

    // Check if the order belongs to the user or if the user is an admin.
    // req.user!.role is the Role relation object, so compare against role_name.
    if (
      data.user_id !== req.user!.id &&
      !["Admin", "Super Admin"].includes(req.user!.role?.role_name)
    ) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }

    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const placeOrder = async (req: Request, res: Response) => {
  try {
    const { address_id, coupon_id } = createOrderSchema.parse(req.body);
    const order = await service.placeOrder(
      req.user!.id,
      address_id,
      coupon_id || null,
    );
    res
      .status(201)
      .json({
        success: true,
        message: "Order placed successfully",
        data: order,
      });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status } = updateOrderStatusSchema.parse(req.body);
    const order = await service.updateStatus(id, status, req.user!.id);
    res.json({ success: true, message: "Order status updated", data: order });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
