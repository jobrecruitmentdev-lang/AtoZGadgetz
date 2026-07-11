from datetime import datetime
from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.cart import Cart, CartItem
from app.models.address import UserAddress
from app.models.product import Product
from app.models.coupon import Coupon
from app.schemas.product_schema import ProductResponse
from app.services.offer_service import offer_service

router = APIRouter(
    prefix="/api/checkout",
    tags=["Checkout System"]
)


class CheckoutPreviewRequest(BaseModel):
    coupon_code: Optional[str] = None


@router.post("/preview")
def checkout_preview(
    req: CheckoutPreviewRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Check if user address exists
    address = db.query(UserAddress).filter(UserAddress.user_id == current_user.id).first()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No shipping address found. Please add an address before checkout."
        )

    # 2. Get user cart and load products
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product)
    ).filter(Cart.user_id == current_user.id).first()

    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your shopping cart is empty"
        )

    # 3. Check stock availability and compute totals
    subtotal = Decimal("0.00")
    tax = Decimal("0.00")
    total_quantity = 0
    products_preview = []

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
                detail=f"Insufficient stock for '{prod.name}'. Available: {prod.stock_quantity}"
            )

        price_per_unit = prod.discount_price if prod.discount_price is not None else prod.price
        item_subtotal = price_per_unit * item.quantity
        subtotal += item_subtotal

        # Tax calculation (based on tax percentage on each product)
        item_tax = item_subtotal * (prod.tax_percentage / Decimal("100.00"))
        tax += item_tax

        total_quantity += item.quantity
        
        products_preview.append({
            "product_id": prod.id,
            "name": prod.name,
            "sku": prod.sku,
            "quantity": item.quantity,
            "price": float(price_per_unit),
            "subtotal": float(item_subtotal)
        })

    # 4. Coupon validation
    discount = Decimal("0.00")
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
                detail="Coupon code has expired or is not active yet"
            )

        if subtotal < coupon.minimum_order_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Minimum order value for coupon is {coupon.minimum_order_amount}"
            )

        if coupon.discount_type == "flat":
            discount = coupon.discount_value
        elif coupon.discount_type == "percentage":
            discount = subtotal * (coupon.discount_value / Decimal("100.00"))
            if coupon.maximum_discount is not None:
                discount = min(discount, coupon.maximum_discount)

        # Cap discount at subtotal
        discount = min(discount, subtotal)

    # Calculate active campaign offers
    offer_calc = offer_service.calculate_discounts(db, cart.items, subtotal)
    offer_discount = offer_calc["total_offer_discount"]
    applied_offers = offer_calc["applied_offers"]

    total_discount = min(discount + offer_discount, subtotal)
    final_amount = subtotal - total_discount + tax

    return {
        "success": True,
        "message": "Checkout preview generated successfully",
        "data": {
            "products": products_preview,
            "quantity": total_quantity,
            "subtotal": float(subtotal),
            "coupon_discount": float(discount),
            "offer_discount": float(offer_discount),
            "discount": float(total_discount),
            "applied_offers": applied_offers,
            "tax": float(tax),
            "final_amount": float(final_amount),
            "shipping_address": {
                "id": address.id,
                "full_name": address.full_name,
                "mobile": address.mobile,
                "address_line1": address.address_line1,
                "city": address.city,
                "state": address.state,
                "pincode": address.pincode
            }
        }
    }
