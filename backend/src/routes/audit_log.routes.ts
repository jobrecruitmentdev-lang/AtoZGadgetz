import { Router } from "express";
import {
  getAllAuditLogs,
  createAuditLog,
} from "../controllers/audit_log.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

// Audit logs are read by admins for reporting; writes should really come from
// internal service calls only, so both are locked down here.
router.get(
  "/",
  authenticateJWT,
  authorizeRBAC(["report.view"]),
  getAllAuditLogs,
);
router.post(
  "/",
  authenticateJWT,
  authorizeRBAC(["report.view"]),
  createAuditLog,
);

export default router;
