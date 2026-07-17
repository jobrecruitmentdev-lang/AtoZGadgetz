import { Router } from "express";
import { getAllInventorys, createInventory, updateInventory, deleteInventory, } from "../controllers/inventory.controller.js";
import { authenticateJWT, authorizeRBAC } from "../middlewares/auth.middleware.js";
const router = Router();
router.get("/", authenticateJWT, authorizeRBAC(["inventory.manage"]), getAllInventorys);
router.post("/", authenticateJWT, authorizeRBAC(["inventory.manage"]), createInventory);
router.put("/:id", authenticateJWT, authorizeRBAC(["inventory.manage"]), updateInventory);
router.delete("/:id", authenticateJWT, authorizeRBAC(["inventory.manage"]), deleteInventory);
export default router;
//# sourceMappingURL=inventory.routes.js.map