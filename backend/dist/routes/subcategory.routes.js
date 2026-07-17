import { Router } from "express";
import { getSubcategories, createSubcategory, } from "../controllers/subcategory.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getSubcategories);
router.post("/", authenticateJWT, authorizeRBAC(["product.manage"]), createSubcategory);
export default router;
//# sourceMappingURL=subcategory.routes.js.map