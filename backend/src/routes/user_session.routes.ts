import { Router } from "express";
import { getAllUserSessions } from "../controllers/user_session.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Sessions are created internally by the login flow, not via a public endpoint —
// letting a client POST an arbitrary user_id here would allow session forgery.
router.get("/", authenticateJWT, getAllUserSessions);

export default router;
