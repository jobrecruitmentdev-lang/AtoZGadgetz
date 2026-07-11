from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.shipment import Shipment
from app.models.order import Order, OrderStatusHistory
from app.models.payment import Payment
from app.services.inventory_service import inventory_service


class ShipmentService:
    def create_shipment(self, db: Session, order_id: int, courier_name: str, tracking_number: str) -> Shipment:
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Order not found"
            )

        # Check existing shipment
        existing = db.query(Shipment).filter(Shipment.order_id == order_id).first()
        if existing:
            return existing

        db_shipment = Shipment(
            order_id=order_id,
            courier_name=courier_name,
            tracking_number=tracking_number,
            shipping_status="ready"
        )
        
        # Update order status to processing
        old_status = order.order_status
        order.order_status = "processing"
        
        history = OrderStatusHistory(
            order_id=order.id,
            old_status=old_status,
            new_status="processing",
            changed_by=order.user_id
        )
        
        db.add(db_shipment)
        db.add(history)
        db.commit()
        db.refresh(db_shipment)
        return db_shipment

    def update_shipping_status(self, db: Session, shipment_id: int, shipping_status: str, admin_user_id: int) -> Shipment:
        shipment = db.query(Shipment).filter(Shipment.id == shipment_id).first()
        if not shipment:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Shipment record not found"
            )

        order = db.query(Order).filter(Order.id == shipment.order_id).first()
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Associated order not found"
            )

        old_ship_status = shipment.shipping_status
        shipment.shipping_status = shipping_status

        # Status transitions
        if shipping_status == "shipped":
            shipment.shipped_at = datetime.now()
            
            old_order_status = order.order_status
            order.order_status = "shipped"
            
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_order_status,
                new_status="shipped",
                changed_by=admin_user_id
            )
            db.add(history)

        elif shipping_status == "delivered":
            shipment.delivered_at = datetime.now()
            
            old_order_status = order.order_status
            order.order_status = "delivered"
            
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=old_order_status,
                new_status="delivered",
                changed_by=admin_user_id
            )
            db.add(history)

            # Cash on Delivery (COD) flow finalizing stock and payment
            payment = db.query(Payment).filter(Payment.order_id == order.id).first()
            if payment and payment.payment_method == "COD" and payment.payment_status != "paid":
                payment.payment_status = "paid"
                order.payment_status = "paid"
                
                # Finalize stock ledger
                for item in order.items:
                    inventory_service.finalize_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

        db.commit()
        db.refresh(shipment)
        return shipment


shipment_service = ShipmentService()
