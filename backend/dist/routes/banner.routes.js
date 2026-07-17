import { Router } from "express";
import { getAllBanners, createBanner, updateBanner, deleteBanner, } from "../controllers/banner.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", getAllBanners);
router.post("/", authenticateJWT, authorizeRBAC(["banner.manage"]), createBanner);
router.put("/:id", authenticateJWT, authorizeRBAC(["banner.manage"]), updateBanner);
router.delete("/:id", authenticateJWT, authorizeRBAC(["banner.manage"]), deleteBanner);
export default router;
//# sourceMappingURL=banner.routes.js.map