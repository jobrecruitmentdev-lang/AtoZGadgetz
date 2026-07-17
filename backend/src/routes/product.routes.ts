import { Router } from "express";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySlug,
} from "../controllers/product.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post(
  "/",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  createProduct,
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  updateProduct,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  deleteProduct,
);

export default router;
