import { Router } from "express";
import {
  getAllProductReviews,
  createProductReview,
} from "../controllers/product_review.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllProductReviews);
router.post("/", authenticateJWT, createProductReview);

export default router;
