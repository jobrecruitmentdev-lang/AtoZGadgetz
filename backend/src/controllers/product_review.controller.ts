import { Request, Response } from "express";
import { ProductReviewService } from "../services/product_review.service";
import { createProductReviewSchema } from "../validators/product_review.schema";

const service = new ProductReviewService();

export const getAllProductReviews = async (req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createProductReview = async (req: Request, res: Response) => {
  try {
    const input = createProductReviewSchema.parse(req.body);
    const data = await service.create({ ...input, user_id: req.user!.id });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res
      .status(400)
      .json({ success: false, message: error.errors || error.message });
  }
};
