"""
Razorpay Payment Gateway Router
================================
Endpoints:
  POST /api/payment/razorpay/create-order  - Create Razorpay order
  POST /api/payment/razorpay/verify        - Verify payment signature
  POST /api/payment/razorpay/webhook       - Razorpay webhook (public, signature verified)
  POST /api/payment/razorpay/refund        - Process refund (Admin)
"""
from fastapi import APIRouter, Depends, Request, Header, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.services.razorpay_service import razorpay_service

router = APIRouter(prefix="/api/payment/razorpay", tags=["Razorpay Payment Gateway"])


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class CreateOrderRequest(BaseModel):
    order_id: int


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    internal_order_id: int


class RefundRequest(BaseModel):
    order_id: int
    amount: Optional[float] = None    # None = full refund
    reason: str = "customer_request"


# ─────────────────────────────────────────────
# CREATE RAZORPAY ORDER
# ─────────────────────────────────────────────
@router.post("/create-order", summary="Create Razorpay payment order")
def create_razorpay_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Create a Razorpay order for a pending internal order.
    Returns razorpay_order_id and key_id for frontend checkout.
    
    **Frontend Flow:**
    1. Call this endpoint to get razorpay_order_id
    2. Use Razorpay JS SDK to open payment modal
    3. On success, call /verify with the response
    """
    result = razorpay_service.create_order(
        db=db,
        order_id=payload.order_id,
        user_id=current_user.id,
    )
    return {
        "success": True,
        "message": "Razorpay order created",
        "data": result,
    }


# ─────────────────────────────────────────────
# VERIFY PAYMENT
# ─────────────────────────────────────────────
@router.post("/verify", summary="Verify Razorpay payment signature")
def verify_payment(
    payload: VerifyPaymentRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Verify HMAC-SHA256 signature from Razorpay payment callback.
    On success, marks order as paid and reduces inventory stock.
    
    **Call this after successful payment modal dismissal.**
    """
    result = razorpay_service.verify_payment(
        db=db,
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature,
        internal_order_id=payload.internal_order_id,
        user_id=current_user.id,
    )
    return {"success": True, "message": "Payment verified", "data": result}


# ─────────────────────────────────────────────
# WEBHOOK (Public — signature verified internally)
# ─────────────────────────────────────────────
@router.post("/webhook", summary="Razorpay webhook endpoint (public)")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None, alias="X-Razorpay-Signature"),
    db: Session = Depends(get_db),
):
    """
    Razorpay sends POST requests here on payment events.
    Configure this URL in your Razorpay Dashboard → Webhooks.
    
    Handled events:
    - payment.captured
    - payment.failed
    - refund.processed
    
    **This endpoint is public** — Razorpay calls it directly.
    Signature is verified using RAZORPAY_WEBHOOK_SECRET.
    """
    if not x_razorpay_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing X-Razorpay-Signature header"
        )

    payload = await request.body()
    result = razorpay_service.handle_webhook(
        payload=payload,
        signature=x_razorpay_signature,
        db=db,
    )
    return result


# ─────────────────────────────────────────────
# REFUND
# ─────────────────────────────────────────────
@router.post("/refund", summary="Process Razorpay refund (Admin)")
def process_refund(
    payload: RefundRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Initiate a refund for a paid order.
    - Admin / Super Admin only.
    - `amount=None` triggers full refund.
    - Partial refunds supported by specifying amount.
    """
    if current_user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required to process refunds"
        )

    result = razorpay_service.process_refund(
        db=db,
        order_id=payload.order_id,
        user_id=current_user.id,
        amount=payload.amount,
        reason=payload.reason,
    )
    return {"success": True, "message": "Refund initiated", "data": result}
