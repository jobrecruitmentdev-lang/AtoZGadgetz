import { Router } from "express";
import {
  getAllNotifications,
  createNotification,
} from "../controllers/notification.controller";
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticateJWT, getAllNotifications);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createNotification);

export default router;
