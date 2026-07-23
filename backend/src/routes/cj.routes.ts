import { Router } from 'express';
import {
  authenticateJWT,
  optionalAuthenticateJWT,
  requireAdminOrSuperAdmin,
} from '../middlewares/auth.middleware.js';
import {
  searchCjProducts,
  huntCjProducts,
  getCjProductDetail,
  importCjProduct,
  autoImportCjProduct,
  placeCjOrder,
  cancelCjOrder,
  syncShipment,
  syncAllShipments,
  handleCjWebhook,
  getCjCategories,
  syncCjCategories,
  syncCjInventory,
  syncAllCjInventory,
  getCjHealth,
} from '../controllers/cj.controller.js';

const router = Router();

// CJ webhook — no auth (CJ posts to this)
router.post('/webhook', handleCjWebhook);

// Public storefront browse — no auth required
router.get('/health', getCjHealth);
router.get('/browse', searchCjProducts);
router.get('/browse/hunt', huntCjProducts);
router.get('/products/public/:pid', getCjProductDetail);

// Product catalog search & hunt
router.get('/products/search', authenticateJWT, requireAdminOrSuperAdmin, searchCjProducts);
router.get('/products/hunt', authenticateJWT, requireAdminOrSuperAdmin, huntCjProducts);
router.get('/products/:pid', authenticateJWT, requireAdminOrSuperAdmin, getCjProductDetail);

// Product import into local DB
router.post('/products/import', authenticateJWT, requireAdminOrSuperAdmin, importCjProduct);

// Auto-import a CJ product on customer add-to-cart — only needs to be logged in
router.post('/products/auto-import', authenticateJWT, autoImportCjProduct);

// All remaining admin routes require admin authentication
router.use(authenticateJWT, requireAdminOrSuperAdmin);

// Order management
router.post('/orders/:orderId/place', placeCjOrder);
router.post('/orders/:cjOrderId/cancel', cancelCjOrder);

// Shipment sync
router.post('/shipments/sync/:orderId', syncShipment);
router.post('/shipments/sync-all', syncAllShipments);

// Category sync
router.get('/categories', getCjCategories);
router.post('/categories/sync', syncCjCategories);

// Inventory sync
router.post('/inventory/sync/:productId', syncCjInventory);
router.post('/inventory/sync-all', syncAllCjInventory);

export default router;
