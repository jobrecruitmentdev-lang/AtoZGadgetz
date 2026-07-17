import { Router } from "express";
import { getAllShipments, createShipment, } from "../controllers/shipment.controller.js";
import { authenticateJWT, requireAdminOrSuperAdmin, } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllShipments);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createShipment);
export default router;
//# sourceMappingURL=shipment.routes.js.map