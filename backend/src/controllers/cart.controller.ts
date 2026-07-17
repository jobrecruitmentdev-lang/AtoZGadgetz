import { Request, Response } from "express";
import { CartService } from "../services/cart.service.js";
import { addToCartSchema } from "../validators/cart.schema.js";

const cartService = new CartService();

export const getCart = async (req: Request, res: Response) => {
  try {
    const cart = await cartService.getOrCreateCart(req.user!.id);
    res.json({ success: true, data: cart });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity } = addToCartSchema.parse(req.body);
    const item = await cartService.addItem(req.user!.id, product_id, quantity);
    res
      .status(200)
      .json({ success: true, message: "Item added to cart", data: item });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;
    const updated = await cartService.updateItem(Number(id), quantity);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const removeCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await cartService.removeItem(Number(id));
    res.json({ success: true, message: "Item removed" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
