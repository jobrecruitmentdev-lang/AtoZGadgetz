import { Router } from "express";
import { getBrands, createBrand, updateBrand, deleteBrand, } from "../controllers/brand.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getBrands);
router.post("/", authenticateJWT, authorizeRBAC(["product.manage"]), createBrand);
router.put("/:id", authenticateJWT, authorizeRBAC(["product.manage"]), updateBrand);
router.delete("/:id", authenticateJWT, authorizeRBAC(["product.manage"]), deleteBrand);
export default router;
//# sourceMappingURL=brand.routes.js.map