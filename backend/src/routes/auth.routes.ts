import { Router } from "express";
import {
  register,
  login,
  me,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller";
import { authenticateJWT } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticateJWT, me);
router.post("/logout", authenticateJWT, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

export default router;
