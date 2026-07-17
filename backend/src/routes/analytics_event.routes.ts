import { Router } from "express";
import {
  getAllAnalyticsEvents,
  createAnalyticsEvent,
} from "../controllers/analytics_event.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateJWT,
  authorizeRBAC(["report.view"]),
  getAllAnalyticsEvents,
);
router.post("/", createAnalyticsEvent);

export default router;
