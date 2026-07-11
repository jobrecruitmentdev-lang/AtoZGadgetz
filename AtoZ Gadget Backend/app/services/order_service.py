import uuid
from datetime import datetime
from decimal import Decimal
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.cart import Cart, CartItem
from app.models.address import UserAddress
from app.models.order import Order, OrderStatusHistory
from app.models.order_item import OrderItem
from app.models.coupon import Coupon
from app.models.product import Product
from app.services.inventory_service import inventory_service
from app.schemas.order_schema import OrderCreateRequest
from app.services.offer_service import offer_service


class OrderService:
    def create_order(self, db: Session, user_id: int, req: OrderCreateRequest) -> Order:
        # 1. Fetch user's cart
        cart = db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Your shopping cart is empty"
            )

        # 2. Validate user address
        address = db.query(UserAddress).filter(
            UserAddress.id == req.address_id,
            UserAddress.user_id == user_id
        ).first()
        
        if not address:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or missing shipping address"
            )

        # 3. Validate product stock in database
        for item in cart.items:
            prod = item.product
            if not prod.is_active or prod.status != "active":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Product '{prod.name}' is no longer active"
                )
            if prod.stock_quantity < item.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock for '{prod.name}' (Available: {prod.stock_quantity})"
                )

        # 4. Calculate amounts
        subtotal = Decimal("0.00")
        tax = Decimal("0.00")
        
        for item in cart.items:
            price_per_unit = item.product.discount_price if item.product.discount_price is not None else item.product.price
            item_subtotal = price_per_unit * item.quantity
            subtotal += item_subtotal
            tax += item_subtotal * (item.product.tax_percentage / Decimal("100.00"))

        # Coupon check
        discount = Decimal("0.00")
        coupon_id = None
        
        if req.coupon_code:
            coupon = db.query(Coupon).filter(
                Coupon.code == req.coupon_code,
                Coupon.status == "active"
            ).first()

            if not coupon:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or inactive coupon code"
                )

            now = datetime.now()
            if now < coupon.start_date or now > coupon.end_date:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Coupon code has expired"
                )

            if subtotal < coupon.minimum_order_amount:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Minimum order amount for coupon application is {coupon.minimum_order_amount}"
                )

            if coupon.discount_type == "flat":
                discount = coupon.discount_value
            elif coupon.discount_type == "percentage":
                discount = subtotal * (coupon.discount_value / Decimal("100.00"))
                if coupon.maximum_discount is not None:
                    discount = min(discount, coupon.maximum_discount)

            discount = min(discount, subtotal)
            coupon_id = coupon.id

        # Calculate shipping charges (e.g., flat 50.00 if order is under 1000.00)
        shipping_charge = Decimal("50.00") if subtotal < Decimal("1000.00") else Decimal("0.00")
        
        # Calculate active campaign offers
        offer_calc = offer_service.calculate_discounts(db, cart.items, subtotal)
        offer_discount = offer_calc["total_offer_discount"]

        total_discount = min(discount + offer_discount, subtotal)
        total_amount = subtotal - total_discount + tax + shipping_charge

        # Begin database transaction for Order creation
        db.begin_nested()  # Nested transaction block
        try:
            # Generate unique order number
            date_str = datetime.now().strftime("%Y%m%d")
            rand_str = uuid.uuid4().hex[:6].upper()
            order_num = f"ORD-{date_str}-{rand_str}"

            # Create Order
            order = Order(
                order_number=order_num,
                user_id=user_id,
                address_id=req.address_id,
                subtotal=subtotal,
                discount_amount=discount,
                offer_discount=offer_discount,
                tax_amount=tax,
                shipping_charge=shipping_charge,
                total_amount=total_amount,
                coupon_id=coupon_id,
                payment_status="pending",
                order_status="pending"
            )
            db.add(order)
            db.flush()  # Populates order.id

            # Create Order Items and Reserve Stock
            for item in cart.items:
                prod = item.product
                price_per_unit = prod.discount_price if prod.discount_price is not None else prod.price
                item_subtotal = price_per_unit * item.quantity
                
                # Fetch product thumbnail
                thumbnail = prod.thumbnail_image

                # Snapshot order item
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=prod.id,
                    variant_id=item.variant_id if hasattr(item, "variant_id") else None,
                    product_name=prod.name,
                    product_image=thumbnail,
                    quantity=item.quantity,
                    price=price_per_unit,
                    subtotal=item_subtotal
                )
                db.add(order_item)

                # Reserve stock ledger
                inventory_service.reserve_stock(db, prod.id, order_item.variant_id, item.quantity, order.id)

            # Log status history
            history = OrderStatusHistory(
                order_id=order.id,
                old_status=None,
                new_status="pending",
                changed_by=user_id
            )
            db.add(history)

            # Clear Cart Items
            for item in cart.items:
                db.delete(item)

            db.commit()
            return order

        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Order creation failed: {str(e)}"
            )


order_service = OrderService()
