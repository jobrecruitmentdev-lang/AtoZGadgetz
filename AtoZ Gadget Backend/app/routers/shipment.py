from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user, require_admin_or_super_admin
from app.models.shipment import Shipment
from app.models.order import Order
from app.schemas.shipment_schema import ShipmentCreateRequest, ShipmentStatusUpdateRequest, ShipmentResponse
from app.services.shipment_service import shipment_service

router = APIRouter(
    tags=["Shipping System"]
)


@router.post("/api/admin/shipment/create", status_code=status.HTTP_201_CREATED)
def admin_create_shipment(
    req: ShipmentCreateRequest,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    shipment = shipment_service.create_shipment(
        db,
        order_id=req.order_id,
        courier_name=req.courier_name,
        tracking_number=req.tracking_number
    )
    return {
        "success": True,
        "message": "Shipment entry created successfully",
        "data": ShipmentResponse.model_validate(shipment).model_dump()
    }


@router.put("/api/admin/shipment/update-status/{id}")
def admin_update_shipment_status(
    id: int,
    req: ShipmentStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    shipment = shipment_service.update_shipping_status(
        db,
        shipment_id=id,
        shipping_status=req.shipping_status,
        admin_user_id=current_user.id
    )
    return {
        "success": True,
        "message": f"Shipment status updated to '{req.shipping_status}'",
        "data": ShipmentResponse.model_validate(shipment).model_dump()
    }


@router.get("/api/orders/{id}/shipment")
def get_order_shipment(
    id: int,
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

    shipment = db.query(Shipment).filter(Shipment.order_id == id).first()
    if not shipment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping track details not found for this order"
        )

    return {
        "success": True,
        "message": "Shipment tracking details retrieved",
        "data": ShipmentResponse.model_validate(shipment).model_dump()
    }
