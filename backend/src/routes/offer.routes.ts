import { Router } from "express";
import {
  getAllOffers,
  createOffer,
  updateOffer,
  deleteOffer,
} from "../controllers/offer.controller";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", getAllOffers);
router.post("/", authenticateJWT, authorizeRBAC(["offer.manage"]), createOffer);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["offer.manage"]),
  updateOffer,
);
router.delete(
  "/:id",
  authenticateJWT,
  authorizeRBAC(["offer.manage"]),
  deleteOffer,
);

export default router;
