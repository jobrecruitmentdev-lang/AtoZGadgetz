import { Router } from 'express';
import { getAllPayments, createPayment, razorpayCreateOrder, razorpayVerify, } from '../controllers/payment.controller.js';
import { authenticateJWT, optionalAuthenticateJWT, requireAdminOrSuperAdmin, } from '../middlewares/auth.middleware.js';
const router = Router();
router.get('/', authenticateJWT, requireAdminOrSuperAdmin, getAllPayments);
router.post('/', authenticateJWT, createPayment);
// Razorpay gateway — authenticated customer endpoints
router.post('/razorpay/create-order', optionalAuthenticateJWT, razorpayCreateOrder);
router.post('/razorpay/verify', optionalAuthenticateJWT, razorpayVerify);
export default router;
//# sourceMappingURL=payment.routes.js.map