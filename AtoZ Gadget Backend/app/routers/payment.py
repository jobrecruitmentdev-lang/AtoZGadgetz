from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.payment import Payment
from app.models.order import Order
from app.schemas.payment_schema import PaymentCreateRequest, PaymentCallbackRequest, PaymentResponse
from app.services.payment_service import payment_service

router = APIRouter(
    tags=["Payment System"]
)


@router.post("/api/payment/create", status_code=status.HTTP_201_CREATED)
def create_payment(
    req: PaymentCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify order ownership
    order = db.query(Order).filter(
        Order.id == req.order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Online gateway or COD entry creation
    payment = payment_service.create_payment_request(db, order, req.payment_method)
    
    return {
        "success": True,
        "message": "Payment request initiated successfully",
        "data": PaymentResponse.model_validate(payment).model_dump()
    }


@router.post("/api/payment/callback")
def payment_callback(
    req: PaymentCallbackRequest,
    db: Session = Depends(get_db)
):
    # Handle payment gateway simulation callback
    payment = payment_service.process_callback(
        db,
        transaction_id=req.transaction_id,
        payment_status=req.payment_status,
        gateway_response=req.gateway_response
    )

    return {
        "success": True,
        "message": f"Payment status callback processed as '{req.payment_status}'",
        "data": PaymentResponse.model_validate(payment).model_dump()
    }


@router.get("/api/payment/{order_id}")
def get_payment_details(
    order_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify order ownership
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    payment = db.query(Payment).filter(Payment.order_id == order_id).first()
    if not payment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No payment details found for this order"
        )

    return {
        "success": True,
        "message": "Payment details retrieved successfully",
        "data": PaymentResponse.model_validate(payment).model_dump()
    }
