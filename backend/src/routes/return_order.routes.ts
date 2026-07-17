import { Router } from "express";
import {
  getAllReturnOrders,
  createReturnOrder,
} from "../controllers/return_order.controller";
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllReturnOrders);
router.post("/", authenticateJWT, createReturnOrder);

export default router;
