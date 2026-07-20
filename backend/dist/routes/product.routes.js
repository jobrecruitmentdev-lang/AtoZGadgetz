import { Router } from "express";
import { getProducts, createProduct, updateProduct, deleteProduct, getProductBySlug, liveSearch, getRecommendations, } from "../controllers/product.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getProducts);
router.get("/search/live", liveSearch);
router.get("/:slug", getProductBySlug);
router.get("/:slug/recommendations", getRecommendations);
router.post("/", authenticateJWT, authorizeRBAC(["product.manage"]), createProduct);
router.put("/:id", authenticateJWT, authorizeRBAC(["product.manage"]), updateProduct);
router.delete("/:id", authenticateJWT, authorizeRBAC(["product.manage"]), deleteProduct);
export default router;
//# sourceMappingURL=product.routes.js.map