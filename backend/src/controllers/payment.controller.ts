import { Request, Response } from 'express';
import { PaymentService } from '../services/payment.service.js';
import { RazorpayService } from '../services/payment/razorpay.service.js';
import { PayPalService } from '../services/payment/paypal.service.js';
import { CjOrderService } from '../services/cj/cj-order.service.js';
import { prisma } from '../prisma.js';
import { createPaymentSchema } from '../validators/payment.schema.js';

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
      console.error(`CJ order placement failed for order ${order.id}:`, cjErr.message);
    }

    res.json({ success: true, message: 'Payment verified and order confirmed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/paypal/create-order
export const paypalCreateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId is required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payment: true },
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.payment_status === 'paid' || order.order_status === 'Confirmed') {
      return res.status(409).json({ success: false, message: 'Order is already paid' });
    }

    const currency = 'USD';
    const frontendBase = (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/+$/, '');
    const returnUrl = `${frontendBase}/checkout?paypal=1&orderId=${order.id}`;
    const cancelUrl = `${frontendBase}/checkout?paypal=0&orderId=${order.id}`;
    const amount = Number(order.total_amount);

    const paypalOrder = await PayPalService.createOrder(
      amount,
      currency,
      String(order.id),
      returnUrl,
      cancelUrl,
      `pp-create-${order.id}-${Date.now()}`,
    );
    const approveUrl = paypalOrder?.links?.find((link: any) => link?.rel === 'approve')?.href;
    if (!approveUrl) {
      return res.status(500).json({ success: false, message: 'PayPal approval URL missing in create-order response' });
    }

    await prisma.payment.upsert({
      where: { order_id: order.id },
      update: {
        payment_method: 'paypal',
        payment_status: 'pending',
        amount: order.total_amount,
        transaction_id: String(paypalOrder.id),
        gateway_response: JSON.stringify({
          stage: 'create-order',
          paypal_order_id: paypalOrder.id,
          currency,
          amount: amount.toFixed(2),
        }),
      },
      create: {
        order_id: order.id,
        payment_method: 'paypal',
        payment_status: 'pending',
        amount: order.total_amount,
        transaction_id: String(paypalOrder.id),
        gateway_response: JSON.stringify({
          stage: 'create-order',
          paypal_order_id: paypalOrder.id,
          currency,
          amount: amount.toFixed(2),
        }),
      },
    });

    res.json({
      success: true,
      data: {
        paypal_order_id: paypalOrder.id,
        status: paypalOrder.status,
        approve_url: approveUrl,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/payment/paypal/capture-order
export const paypalCaptureOrder = async (req: Request, res: Response) => {
  try {
    const { paypalOrderId, orderId } = req.body;
    if (!paypalOrderId || !orderId) {
      return res.status(400).json({ success: false, message: 'paypalOrderId and orderId are required' });
    }

    const order = await prisma.order.findUnique({
      where: { id: Number(orderId) },
      include: { payment: true, cj_order: true },
    });
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.payment_status === 'paid' || order.order_status === 'Confirmed') {
      return res.json({ success: true, message: 'Order already paid and confirmed' });
    }
    if (order.payment?.transaction_id && order.payment.transaction_id !== String(paypalOrderId)) {
      return res.status(400).json({ success: false, message: 'PayPal order ID mismatch for this order' });
    }

    const captureResult = await PayPalService.captureOrder(
      String(paypalOrderId),
      `pp-capture-${order.id}-${paypalOrderId}`,
    );
    if (captureResult.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: `PayPal payment failed with status: ${captureResult.status}` });
    }

    const purchaseUnits = Array.isArray(captureResult.purchase_units) ? captureResult.purchase_units : [];
    const matchedUnit = purchaseUnits.find((unit: any) => String(unit?.reference_id || '') === String(order.id));
    if (!matchedUnit) {
      return res.status(400).json({ success: false, message: 'PayPal reference mismatch for this order' });
    }

    const capture = matchedUnit?.payments?.captures?.[0];
    const captureId = capture?.id || paypalOrderId;
    const capturedStatus = capture?.status;
    const capturedCurrency = String(capture?.amount?.currency_code || '').toUpperCase();
    const capturedValue = Number.parseFloat(String(capture?.amount?.value || 'NaN'));
    const expectedValue = Number(order.total_amount);

    if (capturedStatus !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'PayPal capture is not completed' });
    }
    if (capturedCurrency !== 'USD') {
      return res.status(400).json({ success: false, message: `Invalid PayPal currency: ${capturedCurrency || 'unknown'}` });
    }
    if (!Number.isFinite(capturedValue) || capturedValue.toFixed(2) !== expectedValue.toFixed(2)) {
      return res.status(400).json({ success: false, message: 'PayPal captured amount does not match order total' });
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
          transaction_id: captureId,
          gateway_response: JSON.stringify(captureResult),
        },
        create: {
          order_id: order.id,
          payment_method: 'paypal',
          transaction_id: captureId,
          amount: order.total_amount,
          payment_status: 'paid',
          gateway_response: JSON.stringify(captureResult),
        },
      }),
    ]);

    // Auto-place CJ order after PayPal payment confirmed
    if (!order.cj_order) {
      try {
        await CjOrderService.placeOrder(order.id);
      } catch (cjErr: any) {
        console.error(`CJ order placement failed for order ${order.id}:`, cjErr.message);
      }
    }

    res.json({ success: true, message: 'PayPal payment verified and order confirmed' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
