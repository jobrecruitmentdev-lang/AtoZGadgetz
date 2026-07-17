import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service';
import { RazorpayService } from '../services/payment/razorpay.service';
import { CjOrderService } from '../services/cj/cj-order.service';
import { prisma } from '../prisma';
import { createPaymentSchema } from '../validators/payment.schema';

const service = new PaymentService();

export const getAllPayments = async (_req: Request, res: Response) => {
  try {
    const data = await service.getAll();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPayment = async (req: Request, res: Response) => {
  try {
    const input = createPaymentSchema.parse(req.body);
    const data = await service.create(input);
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.errors || error.message });
  }
};

// POST /api/payment/razorpay/create-order
export const razorpayCreateOrder = async (req: Request, res: Response) => {
  try {
    const { amount, currency = 'USD', orderId } = req.body;
    if (!amount || !orderId) {
      return res.status(400).json({ success: false, message: 'amount and orderId are required' });
    }

    const razorpayOrder = await RazorpayService.createOrder(
      Number(amount),
      currency as 'INR' | 'USD',
      String(orderId),
    );

    res.json({
      success: true,
      data: {
        razorpay_order_id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key_id: RazorpayService.getKeyId(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/razorpay/verify
export const razorpayVerify = async (req: Request, res: Response) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification fields' });
    }

    const isValid = RazorpayService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature' });
    }

    // Mark order and payment as paid
    const order = await prisma.order.findUnique({ where: { id: Number(orderId) } });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: { payment_status: 'paid', order_status: 'Confirmed' },
      }),
      prisma.payment.upsert({
        where: { order_id: order.id },
        update: {
          payment_status: 'paid',
          transaction_id: razorpay_payment_id,
          gateway_response: JSON.stringify({ razorpay_order_id, razorpay_payment_id }),
        },
        create: {
          order_id: order.id,
          payment_method: 'razorpay',
          transaction_id: razorpay_payment_id,
          amount: order.total_amount,
          payment_status: 'paid',
          gateway_response: JSON.stringify({ razorpay_order_id, razorpay_payment_id }),
        },
      }),
    ]);

    // Auto-place CJ order after payment confirmed
    try {
      await CjOrderService.placeOrder(order.id);
    } catch (cjErr: any) {
      // CJ failure doesn't roll back the payment — log and alert manually
      console.error(`CJ order placement failed for order ${order.id}:`, cjErr.message);
    }

    res.json({ success: true, message: 'Payment verified and order confirmed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
