import { Router } from "express";
import { getAllCoupons, createCoupon, updateCoupon, deleteCoupon, } from "../controllers/coupon.controller.js";
import { authenticateJWT, requireAdminOrSuperAdmin, } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getAllCoupons);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createCoupon);
router.put("/:id", authenticateJWT, updateCoupon);
router.delete("/:id", authenticateJWT, deleteCoupon);
export default router;
//# sourceMappingURL=coupon.routes.js.map