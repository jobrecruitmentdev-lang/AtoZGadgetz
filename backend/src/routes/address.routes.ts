import { Router } from "express";
import { getAddresses, createAddress } from "../controllers/address.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateJWT);
router.get("/", getAddresses);
router.post("/", createAddress);

export default router;
