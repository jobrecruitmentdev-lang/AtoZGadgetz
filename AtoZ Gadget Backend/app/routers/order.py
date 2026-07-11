from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user, require_admin_or_super_admin
from app.models.order import Order, OrderStatusHistory
from app.models.order_item import OrderItem
from app.schemas.order_schema import OrderCreateRequest, OrderResponse
from app.services.order_service import order_service
from app.services.inventory_service import inventory_service

router = APIRouter(
    tags=["Order Management"]
)


# --- CUSTOMER ORDER APIS ---

@router.post("/api/orders/create", status_code=status.HTTP_201_CREATED)
def create_customer_order(
    req: OrderCreateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    order = order_service.create_order(db, current_user.id, req)
    
    # Reload order with preloaded items for response schema
    full_order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.status_history)
    ).filter(Order.id == order.id).first()

    return {
        "success": True,
        "message": "Order created successfully",
        "data": OrderResponse.model_validate(full_order).model_dump()
    }


@router.get("/api/orders")
def get_customer_orders(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    skip = (page - 1) * size
    query = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.user_id == current_user.id)

    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(size).all()

    items = [OrderResponse.model_validate(o).model_dump() for o in orders]
    return {
        "success": True,
        "message": "Orders retrieved successfully",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.get("/api/orders/{id}")
def get_customer_order_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.status_history)
    ).filter(Order.id == id, Order.user_id == current_user.id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return {
        "success": True,
        "message": "Order details retrieved",
        "data": OrderResponse.model_validate(order).model_dump()
    }


@router.post("/api/orders/{id}/cancel")
def cancel_customer_order(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    order = db.query(Order).options(
        joinedload(Order.items)
    ).filter(Order.id == id, Order.user_id == current_user.id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    if order.order_status not in ["pending", "confirmed"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel order with status '{order.order_status}'"
        )

    old_status = order.order_status
    order.order_status = "cancelled"

    # Release reserved stock holds back to ledger
    for item in order.items:
        inventory_service.release_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

    # Log status history
    history = OrderStatusHistory(
        order_id=order.id,
        old_status=old_status,
        new_status="cancelled",
        changed_by=current_user.id
    )
    db.add(history)
    db.commit()

    return {
        "success": True,
        "message": "Order cancelled successfully",
        "data": {}
    }


# --- ADMIN ORDER APIS ---

@router.get("/api/admin/orders")
def admin_get_all_orders(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    skip = (page - 1) * size
    query = db.query(Order).options(joinedload(Order.items))
    total = query.count()
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(size).all()

    items = [OrderResponse.model_validate(o).model_dump() for o in orders]
    return {
        "success": True,
        "message": "All orders retrieved",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.get("/api/admin/orders/{id}")
def admin_get_order_detail(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    order = db.query(Order).options(
        joinedload(Order.items),
        joinedload(Order.status_history)
    ).filter(Order.id == id).first()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    return {
        "success": True,
        "message": "Order details retrieved",
        "data": OrderResponse.model_validate(order).model_dump()
    }


class StatusUpdateRequest(BaseModel):
    order_status: str


from pydantic import BaseModel


@router.put("/api/admin/orders/{id}/status")
def admin_update_order_status(
    id: int,
    req: StatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    order = db.query(Order).options(joinedload(Order.items)).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"]
    if req.order_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Status must be one of: {', '.join(allowed)}"
        )

    old_status = order.order_status
    if old_status == req.order_status:
        return {
            "success": True,
            "message": "Status remains unchanged",
            "data": OrderResponse.model_validate(order).model_dump()
        }

    order.order_status = req.order_status

    # If cancelled by admin, release reserved stock holds
    if req.order_status == "cancelled":
        for item in order.items:
            inventory_service.release_stock(db, item.product_id, item.variant_id, item.quantity, order.id)

    # Log history
    history = OrderStatusHistory(
        order_id=order.id,
        old_status=old_status,
        new_status=req.order_status,
        changed_by=current_user.id
    )
    db.add(history)
    db.commit()
    db.refresh(order)

    return {
        "success": True,
        "message": "Order status updated successfully",
        "data": OrderResponse.model_validate(order).model_dump()
    }
