from fastapi import APIRouter, Depends, Query, status, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc, asc
from typing import Optional

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission, require_admin_or_super_admin
from app.models.inventory import Inventory
from app.models.product import Product
from app.models.order_item import OrderItem
from app.schemas.inventory_schema import InventoryUpdateRequest, InventoryResponse
from app.services.inventory_service import inventory_service

router = APIRouter(
    tags=["Inventory Management"]
)


@router.get("/api/admin/inventory/dashboard")
def get_inventory_dashboard(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("inventory.manage"))
):
    # 1. Total active stock quantity
    total_stock = db.query(func.sum(Product.stock_quantity)).scalar() or 0
    
    # 2. Low stock (1 to 10 units)
    low_stock = db.query(Product).filter(Product.stock_quantity > 0, Product.stock_quantity <= 10).count()
    
    # 3. Out of stock (0 units)
    out_of_stock = db.query(Product).filter(Product.stock_quantity == 0).count()

    # 4. Fast moving products (top 5 by units sold)
    fast_moving_query = db.query(
        Product.id,
        Product.name,
        Product.sku,
        func.sum(OrderItem.quantity).label("units_sold")
    ).join(
        OrderItem, Product.id == OrderItem.product_id
    ).group_by(
        Product.id
    ).order_by(
        desc("units_sold")
    ).limit(5).all()

    fast_moving = [
        {"id": f.id, "name": f.name, "sku": f.sku, "units_sold": int(f.units_sold)}
        for f in fast_moving_query
    ]

    # 5. Slow moving products (bottom 5 by units sold, including 0 sales)
    slow_moving_query = db.query(
        Product.id,
        Product.name,
        Product.sku,
        func.coalesce(func.sum(OrderItem.quantity), 0).label("units_sold")
    ).outerjoin(
        OrderItem, Product.id == OrderItem.product_id
    ).group_by(
        Product.id
    ).order_by(
        asc("units_sold"),
        Product.stock_quantity.desc()
    ).limit(5).all()

    slow_moving = [
        {"id": s.id, "name": s.name, "sku": s.sku, "units_sold": int(s.units_sold)}
        for s in slow_moving_query
    ]

    return {
        "success": True,
        "message": "Inventory dashboard metrics retrieved",
        "data": {
            "total_stock": int(total_stock),
            "low_stock": low_stock,
            "out_of_stock": out_of_stock,
            "fast_moving_products": fast_moving,
            "slow_moving_products": slow_moving
        }
    }


@router.get("/api/admin/inventory")
def admin_get_inventory(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    skip = (page - 1) * size
    query = db.query(Inventory).options(
        joinedload(Inventory.product),
        joinedload(Inventory.variant)
    )
    
    total = query.count()
    items = query.offset(skip).limit(size).all()
    
    serialized = [InventoryResponse.model_validate(i).model_dump() for i in items]
    return {
        "success": True,
        "message": "Inventory details retrieved",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.put("/api/admin/inventory/{product_id}")
def admin_update_stock(
    product_id: int,
    req: InventoryUpdateRequest,
    variant_id: Optional[int] = Query(None, description="Optional variation ID to update variant specific stock"),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    inv = inventory_service.update_stock(db, product_id, variant_id, req.stock_quantity)
    
    # Audit log entry for inventory stock adjustment
    audit_service_log = f"Stock updated to {req.stock_quantity} for product ID {product_id}"
    if variant_id:
        audit_service_log += f" (Variant ID: {variant_id})"
        
    from app.services.audit_service import audit_service
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Inventory",
        action="Inventory Update",
        description=audit_service_log,
        new_data={"stock_quantity": req.stock_quantity, "product_id": product_id, "variant_id": variant_id}
    )

    return {
        "success": True,
        "message": "Inventory stock updated successfully",
        "data": InventoryResponse.model_validate(inv).model_dump()
    }
