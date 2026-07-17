import { Request, Response } from "express";
import { WishlistService } from "../services/wishlist.service.js";
import { addToWishlistSchema } from "../validators/wishlist.schema.js";

const service = new WishlistService();

export const getWishlist = async (req: Request, res: Response) => {
  try {
    const data = await service.getOrCreateWishlist(req.user!.id);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addToWishlist = async (req: Request, res: Response) => {
  try {
    const { product_id } = addToWishlistSchema.parse(req.body);
    const data = await service.addItem(req.user!.id, product_id);
    res
      .status(200)
      .json({ success: true, message: "Item added to wishlist", data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};

export const removeFromWishlist = async (req: Request, res: Response) => {
  try {
    const productId = Number(req.params.productId);
    const data = await service.removeItem(req.user!.id, productId);
    res.json({ success: true, message: "Item removed from wishlist", data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
