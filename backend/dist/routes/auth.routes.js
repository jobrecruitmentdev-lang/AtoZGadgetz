import { Router } from "express";
import { register, login, me, logout, forgotPassword, resetPassword, sendMobileOtp, verifyMobileOtp, requestMagicLink, verifyMagicLink, completeRegistration, completeProfile, } from "../controllers/auth.controller.js";
import { authenticateJWT, optionalAuthenticateJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/register", register);
router.post("/login", login);
router.get("/me", optionalAuthenticateJWT, me);
router.post("/logout", authenticateJWT, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.post("/mobile-otp/send", sendMobileOtp);
router.post("/mobile-otp/verify", verifyMobileOtp);
router.post("/magic-link/request", requestMagicLink);
router.post("/magic-link/verify", verifyMagicLink);
router.post("/register/complete", completeRegistration);
router.post("/profile/complete", authenticateJWT, completeProfile);
export default router;
//# sourceMappingURL=auth.routes.js.map