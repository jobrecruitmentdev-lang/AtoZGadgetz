import { Router } from 'express';
import {
  getAllPayments,
  createPayment,
  razorpayCreateOrder,
  razorpayVerify,
} from '../controllers/payment.controller';
import {
  authenticateJWT,
  requireAdminOrSuperAdmin,
} from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticateJWT, requireAdminOrSuperAdmin, getAllPayments);
router.post('/', authenticateJWT, createPayment);

// Razorpay gateway — authenticated customer endpoints
router.post('/razorpay/create-order', authenticateJWT, razorpayCreateOrder);
router.post('/razorpay/verify', authenticateJWT, razorpayVerify);

export default router;
