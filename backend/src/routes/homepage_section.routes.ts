import { Router } from "express";
import {
  getAllHomepageSections,
  createHomepageSection,
  updateHomepageSection,
  deleteHomepageSection,
} from "../controllers/homepage_section.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", getAllHomepageSections);
router.post(
  "/",
  authenticateJWT,
  authorizeRBAC(["banner.manage"]),
  createHomepageSection,
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["banner.manage"]),
  updateHomepageSection,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["banner.manage"]),
  deleteHomepageSection,
);

export default router;
