import { Router } from "express";
import {
  getAllNotifications,
  createNotification,
} from "../controllers/notification.controller.js";
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", authenticateJWT, getAllNotifications);
router.post("/", authenticateJWT, requireAdminOrSuperAdmin, createNotification);

export default router;
