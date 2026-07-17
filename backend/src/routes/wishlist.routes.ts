import { Router } from "express";
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export default router;
