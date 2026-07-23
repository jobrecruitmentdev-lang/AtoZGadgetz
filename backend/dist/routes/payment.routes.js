import { Router } from 'express';
import { getAllPayments, createPayment, razorpayCreateOrder, razorpayVerify, paypalCreateOrder, paypalCaptureOrder, } from '../controllers/payment.controller.js';
import { authenticateJWT, optionalAuthenticateJWT, requireAdminOrSuperAdmin, } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', authenticateJWT, requireAdminOrSuperAdmin, getAllPayments);
router.post('/', authenticateJWT, createPayment);
// Razorpay gateway — customer endpoints
router.post('/razorpay/create-order', optionalAuthenticateJWT, razorpayCreateOrder);
router.post('/razorpay/verify', optionalAuthenticateJWT, razorpayVerify);
// PayPal REST Gateway — Priority #1 customer endpoints
router.post('/paypal/create-order', optionalAuthenticateJWT, paypalCreateOrder);
router.post('/paypal/capture-order', optionalAuthenticateJWT, paypalCaptureOrder);
export default router;
//# sourceMappingURL=payment.routes.js.map