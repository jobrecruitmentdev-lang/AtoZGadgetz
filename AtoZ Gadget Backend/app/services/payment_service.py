import uuid
import json
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.payment import Payment
from app.models.order import Order, OrderStatusHistory
from app.services.inventory_service import inventory_service


class PaymentService:
    def create_payment_request(self, db: Session, order: Order, payment_method: str) -> Payment:
        # Prevent double creation
        existing = db.query(Payment).filter(Payment.order_id == order.id).first()
        if existing:
            return existing

        txn_id = f"txn_{payment_method.lower()}_{uuid.uuid4().hex[:12]}"
        
        db_payment = Payment(
            order_id=order.id,
            payment_method=payment_method,
            transaction_id=txn_id,
            amount=order.total_amount,
            payment_status="pending"
        )
        db.add(db_payment)
        db.commit()
        db.refresh(db_payment)
        return db_payment

    def process_callback(self, db: Session, transaction_id: str, payment_status: str, gateway_response: Optional[str] = None) -> Payment:
        payment = db.query(Payment).filter(Payment.transaction_id == transaction_id).first()
        if not payment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Transaction reference not found"
            )

        order = db.query(Order).filter(Order.id == payment.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated order not found"
            )

        if payment.payment_status != "pending":
            # Already processed
            return payment

        payment.payment_status = payment_status
        payment.gateway_response = gateway_response
        
        # Sync order payment status
        order.payment_status = payment_status

        # If payment succeeded, finalize stock reduction & confirm order
        if payment_status == "paid":
            old_order_status = order.order_status
            order.order_status = "confirmed"
            
            # Reduce stock ledger
            for item in order.items:
                inventory_service.finalize_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

            # Log status history
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_order_status,
                new_status="confirmed",
                changed_by=order.user_id
            )
            db.add(history)
            
        elif payment_status == "failed":
            # If payment failed, release reserved stock back
            old_order_status = order.order_status
            order.order_status = "cancelled"
            
            for item in order.items:
                inventory_service.release_stock(db, item.product_id, item.variant_id, item.quantity, order.id)
                
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_order_status,
                new_status="cancelled",
                changed_by=order.user_id
            )
            db.add(history)

        db.commit()
        db.refresh(payment)
        return payment


payment_service = PaymentService()
