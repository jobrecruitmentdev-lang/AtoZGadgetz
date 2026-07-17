import { Router } from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getCategories);
router.post(
  "/",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  createCategory,
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  updateCategory,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  deleteCategory,
);

export default router;
