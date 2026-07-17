import { Router } from "express";
import {
  getAllAnalyticsEvents,
  createAnalyticsEvent,
} from "../controllers/analytics_event.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  authorizeRBAC(["report.view"]),
  getAllAnalyticsEvents,
);
router.post("/", createAnalyticsEvent);

export default router;
