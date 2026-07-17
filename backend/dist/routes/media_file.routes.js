import { Router } from "express";
import { getAllMediaFiles, createMediaFile, } from "../controllers/media_file.controller.js";
import { authenticateJWT, requireAdminOrSuperAdmin, } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllMediaFiles);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createMediaFile);
export default router;
//# sourceMappingURL=media_file.routes.js.map