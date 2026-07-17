import { Router } from "express";
import { getAllOrders, getMyOrders, getOrderById, placeOrder, updateOrderStatus, } from "../controllers/order.controller.js";
import { syncShipment } from "../controllers/cj.controller.js";
import { authenticateJWT, requireAdminOrSuperAdmin, } from "../middlewares/auth.middleware.js";
const router = Router();
// order.view isn't a seeded permission — mirrors FastAPI's require_admin_or_super_admin instead.
router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllOrders);
router.get("/mine", authenticateJWT, getMyOrders);
router.get("/:id", authenticateJWT, getOrderById);
router.post("/place", authenticateJWT, placeOrder);
router.patch("/:id/status", authenticateJWT, requireAdminOrSuperAdmin, updateOrderStatus);
// Tracking info for a customer order (syncs from CJ then returns shipment)
router.get("/:id/tracking", authenticateJWT, syncShipment);
export default router;
//# sourceMappingURL=order.routes.js.map