"""
Razorpay Payment Gateway Service
==================================
Handles:
  - Payment order creation
  - Signature verification (HMAC-SHA256)
  - Webhook processing
  - Refund processing

Requires:
  RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env
"""
import os
import hmac
import hashlib
import logging
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment import Payment
from app.models.order import Order, OrderStatusHistory
from app.services.inventory_service import inventory_service

logger = logging.getLogger(__name__)

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")
RAZORPAY_CURRENCY = os.getenv("RAZORPAY_CURRENCY", "INR")


def _get_razorpay_client():
    """Lazy Razorpay client initialization."""
    try:
        import razorpay
        if not RAZORPAY_KEY_ID or RAZORPAY_KEY_ID.startswith("rzp_test_REPLACE"):
            raise ValueError("Razorpay keys not configured in .env")
        return razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except ImportError:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Razorpay SDK not installed. Run: pip install razorpay"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(e)
        )


class RazorpayService:

    # ─────────────────────────────────────────────
    # CREATE PAYMENT ORDER
    # ─────────────────────────────────────────────
    def create_order(self, db: Session, order_id: int, user_id: int) -> Dict[str, Any]:
        """
        Create a Razorpay order for the given internal order.
        Returns Razorpay order details to pass to frontend.
        """
        order = db.query(Order).filter(
            Order.id == order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        if order.payment_status == "paid":
            raise HTTPException(status_code=400, detail="Order already paid")

        # Amount in paise (Razorpay expects smallest currency unit)
        amount_paise = int(float(order.total_amount) * 100)

        client = _get_razorpay_client()
        razorpay_order = client.order.create({
            "amount": amount_paise,
            "currency": RAZORPAY_CURRENCY,
            "receipt": order.order_number,
            "notes": {
                "order_id": str(order.id),
                "user_id": str(user_id),
            }
        })

        # Update payment record with razorpay_order_id
        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if payment:
            payment.gateway_response = f"razorpay_order_id:{razorpay_order['id']}"
            db.commit()

        logger.info("Razorpay order created: %s for internal order %s", razorpay_order["id"], order.id)

        return {
            "razorpay_order_id": razorpay_order["id"],
            "razorpay_key_id":   RAZORPAY_KEY_ID,
            "amount":            amount_paise,
            "currency":          RAZORPAY_CURRENCY,
            "order_number":      order.order_number,
            "internal_order_id": order.id,
        }

    # ─────────────────────────────────────────────
    # VERIFY PAYMENT SIGNATURE
    # ─────────────────────────────────────────────
    def verify_payment(
        self,
        db: Session,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str,
        internal_order_id: int,
        user_id: int,
    ) -> Dict[str, Any]:
        """
        Verify the HMAC-SHA256 signature from Razorpay callback.
        If valid, mark payment and order as paid.
        """
        # Signature verification
        expected = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, razorpay_signature):
            logger.warning(
                "Razorpay signature mismatch: order=%s payment=%s",
                razorpay_order_id, razorpay_payment_id
            )
            raise HTTPException(status_code=400, detail="Payment signature verification failed")

        # Update DB records
        order = db.query(Order).filter(
            Order.id == internal_order_id,
            Order.user_id == user_id
        ).first()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment = db.query(Payment).filter(Payment.order_id == order.id).first()

        if payment and payment.payment_status != "paid":
            old_status = order.order_status

            payment.payment_status = "paid"
            payment.transaction_id = razorpay_payment_id
            payment.gateway_response = f"razorpay_order_id:{razorpay_order_id}"

            order.payment_status = "paid"
            order.order_status = "confirmed"

            # Deduct stock
            for item in order.items:
                inventory_service.finalize_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

            # Log status change
            db.add(OrderStatusHistory(
                order_id=order.id,
                old_status=old_status,
                new_status="confirmed",
                changed_by=user_id,
            ))

            db.commit()
            db.refresh(payment)

        logger.info("Payment verified: Razorpay=%s InternalOrder=%s", razorpay_payment_id, order.id)

        return {
            "success": True,
            "message": "Payment verified and order confirmed",
            "order_number": order.order_number,
            "payment_id": razorpay_payment_id,
        }

    # ─────────────────────────────────────────────
    # WEBHOOK HANDLER
    # ─────────────────────────────────────────────
    def handle_webhook(self, payload: bytes, signature: str, db: Session) -> Dict[str, Any]:
        """
        Process Razorpay webhook events.
        Signature verified using RAZORPAY_WEBHOOK_SECRET.
        """
        # Verify webhook signature
        expected = hmac.new(
            RAZORPAY_WEBHOOK_SECRET.encode("utf-8"),
            payload,
            hashlib.sha256,
        ).hexdigest()

        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

        import json
        event_data = json.loads(payload)
        event = event_data.get("event", "")
        logger.info("Razorpay webhook received: %s", event)

        if event == "payment.captured":
            payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
            razorpay_payment_id = payment_entity.get("id")
            notes = payment_entity.get("notes", {})
            order_id = notes.get("order_id")

            if order_id:
                order = db.query(Order).filter(Order.id == int(order_id)).first()
                if order and order.payment_status != "paid":
                    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
                    if payment:
                        payment.payment_status = "paid"
                        payment.transaction_id = razorpay_payment_id
                        order.payment_status = "paid"
                        order.order_status = "confirmed"
                        db.commit()

        elif event == "payment.failed":
            payment_entity = event_data.get("payload", {}).get("payment", {}).get("entity", {})
            notes = payment_entity.get("notes", {})
            order_id = notes.get("order_id")

            if order_id:
                order = db.query(Order).filter(Order.id == int(order_id)).first()
                if order and order.payment_status == "pending":
                    payment = db.query(Payment).filter(Payment.order_id == order.id).first()
                    if payment:
                        payment.payment_status = "failed"
                        order.payment_status = "failed"
                        order.order_status = "cancelled"
                        db.commit()

        elif event == "refund.processed":
            refund_entity = event_data.get("payload", {}).get("refund", {}).get("entity", {})
            payment_id = refund_entity.get("payment_id")
            if payment_id:
                payment = db.query(Payment).filter(Payment.transaction_id == payment_id).first()
                if payment:
                    payment.payment_status = "refunded"
                    db.commit()

        return {"received": True, "event": event}

    # ─────────────────────────────────────────────
    # REFUND
    # ─────────────────────────────────────────────
    def process_refund(
        self,
        db: Session,
        order_id: int,
        user_id: int,
        amount: Optional[float] = None,
        reason: str = "customer_request",
    ) -> Dict[str, Any]:
        """
        Initiate a refund for a paid order.
        amount=None triggers a full refund.
        """
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if not payment or payment.payment_status != "paid":
            raise HTTPException(status_code=400, detail="No paid payment found for this order")

        if not payment.transaction_id:
            raise HTTPException(status_code=400, detail="No Razorpay transaction ID found")

        refund_amount_paise = int((amount or float(payment.amount)) * 100)

        client = _get_razorpay_client()
        refund = client.payment.refund(payment.transaction_id, {
            "amount": refund_amount_paise,
            "notes": {
                "reason": reason,
                "order_id": str(order_id),
            }
        })

        # Update payment status
        payment.payment_status = "refunded" if not amount else "partial_refund"
        order.order_status = "refunded"
        db.commit()

        logger.info("Refund processed: %s for payment %s", refund["id"], payment.transaction_id)

        return {
            "success": True,
            "refund_id": refund["id"],
            "amount_refunded": refund_amount_paise / 100,
            "currency": RAZORPAY_CURRENCY,
        }


razorpay_service = RazorpayService()
