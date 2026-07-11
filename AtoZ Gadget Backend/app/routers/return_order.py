from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user, require_admin_or_super_admin
from app.models.return_order import ReturnOrder
from app.models.order import Order, OrderStatusHistory
from app.models.payment import Payment
from app.schemas.return_schema import ReturnCreateRequest, ReturnStatusUpdateRequest, ReturnResponse
from app.services.inventory_service import inventory_service

router = APIRouter(
    tags=["Return & Refund System"]
)


@router.post("/api/orders/{id}/return", status_code=status.HTTP_201_CREATED)
def request_order_return(
    id: int,
    req: ReturnCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify order ownership
    order = db.query(Order).filter(
        Order.id == id,
        Order.user_id == current_user.id
    ).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Validate that the order is delivered before allowing returns
    if order.order_status != "delivered":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only delivered orders can be requested for returns"
        )

    # Check duplicate return request
    existing = db.query(ReturnOrder).filter(ReturnOrder.order_id == id).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Return request already submitted for this order"
        )

    db_return = ReturnOrder(
        order_id=id,
        user_id=current_user.id,
        reason=req.reason,
        status="requested"
    )
    db.add(db_return)
    db.commit()
    db.refresh(db_return)

    return {
        "success": True,
        "message": "Return request submitted successfully",
        "data": ReturnResponse.model_validate(db_return).model_dump()
    }


@router.get("/api/returns")
def get_customer_returns(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    skip = (page - 1) * size
    query = db.query(ReturnOrder).filter(ReturnOrder.user_id == current_user.id)
    total = query.count()
    returns = query.order_by(ReturnOrder.created_at.desc()).offset(skip).limit(size).all()
    
    serialized = [ReturnResponse.model_validate(r).model_dump() for r in returns]
    return {
        "success": True,
        "message": "Returns list retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.put("/api/admin/returns/{id}/status")
def admin_update_return_status(
    id: int,
    req: ReturnStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    ret = db.query(ReturnOrder).filter(ReturnOrder.id == id).first()
    if not ret:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Return request not found"
        )

    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == ret.order_id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated order not found"
        )

    old_status = ret.status
    ret.status = req.status

    # If completed, process refund & restock inventory
    if req.status == "completed":
        # 1. Update Order status
        old_order_status = order.order_status
        order.order_status = "returned"
        
        # 2. Update Payment status
        payment = db.query(Payment).filter(Payment.order_id == order.id).first()
        if payment:
            payment.payment_status = "refunded"
            order.payment_status = "refunded"

        # 3. Log history
        history = OrderStatusHistory(
            order_id=order.id,
            old_status=old_order_status,
            new_status="returned",
            changed_by=current_user.id
        )
        db.add(history)

        # 4. Restock inventory (add stock back to inventory ledger)
        for item in order.items:
            inventory_service.release_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

    db.commit()
    db.refresh(ret)

    return {
        "success": True,
        "message": f"Return status updated to '{req.status}' successfully",
        "data": ReturnResponse.model_validate(ret).model_dump()
    }
