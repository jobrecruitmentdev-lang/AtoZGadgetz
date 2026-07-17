import { Router } from "express";
import { getAllProductReviews, createProductReview, } from "../controllers/product_review.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getAllProductReviews);
router.post("/", authenticateJWT, createProductReview);
export default router;
//# sourceMappingURL=product_review.routes.js.map