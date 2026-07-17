import { Router } from "express";
import {
  getAllShipments,
  createShipment,
} from "../controllers/shipment.controller";
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllShipments);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createShipment);

export default router;
