from datetime import datetime
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user, require_admin_or_super_admin
from app.models.coupon import Coupon
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.coupon_schema import CouponCreate, CouponResponse, CouponApplyRequest

router = APIRouter(
    tags=["Coupon System"]
)


@router.post("/api/admin/coupons", status_code=status.HTTP_201_CREATED)
def create_coupon(
    coupon_in: CouponCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    # Verify uniqueness of coupon code
    existing = db.query(Coupon).filter(Coupon.code == coupon_in.code).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code already exists"
        )

    db_coupon = Coupon(
        code=coupon_in.code,
        discount_type=coupon_in.discount_type,
        discount_value=coupon_in.discount_value,
        minimum_order_amount=coupon_in.minimum_order_amount,
        maximum_discount=coupon_in.maximum_discount,
        start_date=coupon_in.start_date,
        end_date=coupon_in.end_date,
        usage_limit=coupon_in.usage_limit,
        status=coupon_in.status
    )
    db.add(db_coupon)
    db.commit()
    db.refresh(db_coupon)

    return {
        "success": True,
        "message": "Coupon created successfully",
        "data": CouponResponse.model_validate(db_coupon).model_dump()
    }


@router.get("/api/coupons")
def get_coupons(
    db: Session = Depends(get_db)
):
    # Retrieve all active coupons
    now = datetime.now()
    coupons = db.query(Coupon).filter(
        Coupon.status == "active",
        Coupon.start_date <= now,
        Coupon.end_date >= now
    ).all()
    items = [CouponResponse.model_validate(c).model_dump() for c in coupons]
    return {
        "success": True,
        "message": "Coupons retrieved successfully",
        "data": items
    }


@router.post("/api/coupon/apply")
def apply_coupon(
    req: CouponApplyRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Find the coupon
    coupon = db.query(Coupon).filter(
        Coupon.code == req.code,
        Coupon.status == "active"
    ).first()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or inactive coupon code"
        )

    # Check date range
    now = datetime.now()
    if now < coupon.start_date or now > coupon.end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Coupon code has expired or is not active yet"
        )

    # Get user's cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart or not cart.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Shopping cart is empty. Cannot apply coupon."
        )

    # Calculate cart subtotal
    subtotal = Decimal("0.00")
    for item in cart.items:
        prod = item.product
        price_per_unit = prod.discount_price if prod.discount_price is not None else prod.price
        subtotal += price_per_unit * item.quantity

    # Check minimum order limit
    if subtotal < coupon.minimum_order_amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum order value for coupon application is {coupon.minimum_order_amount}"
        )

    # Calculate discount amount
    discount_amount = Decimal("0.00")
    if coupon.discount_type == "flat":
        discount_amount = coupon.discount_value
    elif coupon.discount_type == "percentage":
        discount_amount = subtotal * (coupon.discount_value / Decimal("100.00"))
        if coupon.maximum_discount is not None:
            discount_amount = min(discount_amount, coupon.maximum_discount)

    # Cap discount at cart subtotal
    discount_amount = min(discount_amount, subtotal)

    return {
        "success": True,
        "message": "Coupon applied successfully",
        "data": {
            "code": coupon.code,
            "discount_type": coupon.discount_type,
            "discount_value": float(coupon.discount_value),
            "discount_amount": float(discount_amount),
            "minimum_order_amount": float(coupon.minimum_order_amount),
            "maximum_discount": float(coupon.maximum_discount) if coupon.maximum_discount is not None else None
        }
    }
