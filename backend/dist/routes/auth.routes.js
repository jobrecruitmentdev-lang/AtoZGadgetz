import { Router } from "express";
import { register, login, me, logout, forgotPassword, resetPassword, } from "../controllers/auth.controller.js";
import { authenticateJWT, optionalAuthenticateJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", optionalAuthenticateJWT, me);
router.post("/logout", authenticateJWT, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
export default router;
//# sourceMappingURL=auth.routes.js.map