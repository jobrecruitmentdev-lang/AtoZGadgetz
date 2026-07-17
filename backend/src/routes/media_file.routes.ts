import { Router } from "express";
import {
  getAllMediaFiles,
  createMediaFile,
} from "../controllers/media_file.controller";
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, requireAdminOrSuperAdmin, getAllMediaFiles);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createMediaFile);

export default router;
