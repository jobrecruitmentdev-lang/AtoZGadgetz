import { Router } from "express";
import { getWishlist, addToWishlist, removeFromWishlist, } from "../controllers/wishlist.controller.js";
import { authenticateJWT } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(authenticateJWT);
router.get("/", getWishlist);
router.post("/add", addToWishlist);
router.delete("/:productId", removeFromWishlist);
export default router;
//# sourceMappingURL=wishlist.routes.js.map