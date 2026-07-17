import { Router } from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../controllers/cart.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item/:id", updateCartItem);
router.delete("/item/:id", removeCartItem);

export default router;
