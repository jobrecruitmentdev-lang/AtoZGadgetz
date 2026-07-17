import { Router } from "express";
import { getAddresses, createAddress } from "../controllers/address.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.use(authenticateJWT);
router.get("/", getAddresses);
router.post("/", createAddress);

export default router;
