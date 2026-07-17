import { Router } from "express";
import {
  getSubcategories,
  createSubcategory,
} from "../controllers/subcategory.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getSubcategories);
router.post(
  "/",
  authenticateJWT,
  authorizeRBAC(["product.manage"]),
  createSubcategory,
);

export default router;
