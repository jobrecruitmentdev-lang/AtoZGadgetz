import { Router } from 'express';
import { authenticateJWT, requireAdminOrSuperAdmin, } from '../middlewares/auth.middleware.js';
import { searchCjProducts, getCjProductDetail, importCjProduct, autoImportCjProduct, placeCjOrder, cancelCjOrder, syncShipment, syncAllShipments, handleCjWebhook, } from '../controllers/cj.controller.js';
const router = Router();
// CJ webhook — no auth (CJ posts to this)
router.post('/webhook', handleCjWebhook);
// Public storefront browse — no auth required
router.get('/browse', searchCjProducts);
// Auto-import a CJ product on customer add-to-cart — only needs to be logged in
router.post('/products/auto-import', authenticateJWT, autoImportCjProduct);
// All remaining routes require admin
router.use(authenticateJWT, requireAdminOrSuperAdmin);
// Product catalog
router.get('/products/search', searchCjProducts);
router.get('/products/:pid', getCjProductDetail);
router.post('/products/import', importCjProduct);
// Order management
router.post('/orders/:orderId/place', placeCjOrder);
router.post('/orders/:cjOrderId/cancel', cancelCjOrder);
// Shipment sync
router.post('/shipments/sync/:orderId', syncShipment);
router.post('/shipments/sync-all', syncAllShipments);
export default router;
//# sourceMappingURL=cj.routes.js.map