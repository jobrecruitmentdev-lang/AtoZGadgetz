from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Query, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission, require_admin_or_super_admin
from app.models.user import User
from app.models.address import UserAddress
from app.models.order import Order
from app.schemas.user_schema import UserResponse
from app.services.dashboard_service import dashboard_service
from app.services.upload_service import save_uploaded_file
from app.services.audit_service import audit_service
from app.utils.security import hash_password

from app.services.cache_service import cached

router = APIRouter(
    tags=["Admin & Business Management System"]
)


# --- 1. ADMIN DASHBOARD SYSTEM ---

@router.get("/api/admin/dashboard")
@cached(ttl=60, prefix="dashboard")
def get_dashboard_kpis(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("dashboard.view"))
):
    metrics = dashboard_service.get_metrics(db)
    return {
        "success": True,
        "message": "Dashboard KPIs retrieved successfully",
        "data": metrics
    }


@router.get("/api/admin/dashboard/sales-chart")
@cached(ttl=60, prefix="dashboard")
def get_sales_chart_data(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("dashboard.view"))
):
    charts = dashboard_service.get_sales_chart(db)
    return {
        "success": True,
        "message": "Sales charts data retrieved successfully",
        "data": charts
    }


@router.get("/api/admin/dashboard/top-products")
@cached(ttl=60, prefix="dashboard")
def get_top_selling_products(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("dashboard.view"))
):
    top = dashboard_service.get_top_products(db, limit=5)
    return {
        "success": True,
        "message": "Top selling products retrieved successfully",
        "data": top
    }


@router.get("/api/admin/dashboard/recent-orders")
def get_recent_checkouts(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("dashboard.view"))
):
    recent = dashboard_service.get_recent_orders(db, limit=5)
    return {
        "success": True,
        "message": "Recent orders retrieved successfully",
        "data": recent
    }


# --- 2. CUSTOMER MANAGEMENT SYSTEM ---

@router.get("/api/admin/customers")
def admin_get_customers(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("customer.manage"))
):
    skip = (page - 1) * size
    query = db.query(User).filter(User.role_id == 3)  # Customers only

    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            (User.first_name.like(search_pat)) |
            (User.last_name.like(search_pat)) |
            (User.email.like(search_pat)) |
            (User.mobile.like(search_pat))
        )
    if is_active is not None:
        query = query.filter(User.is_active == is_active)

    total = query.count()
    customers = query.order_by(User.created_at.desc()).offset(skip).limit(size).all()

    serialized = [UserResponse.model_validate(c).model_dump() for c in customers]
    return {
        "success": True,
        "message": "Customers retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.get("/api/admin/customers/{id}")
def admin_get_customer_details(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_permission("customer.manage"))
):
    customer = db.query(User).filter(User.id == id, User.role_id == 3).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    # Fetch addresses
    addresses = db.query(UserAddress).filter(UserAddress.user_id == id).all()
    serialized_addresses = [
        {
            "id": a.id,
            "full_name": a.full_name,
            "mobile": a.mobile,
            "address_line1": a.address_line1,
            "address_line2": a.address_line2,
            "city": a.city,
            "state": a.state,
            "country": a.country,
            "pincode": a.pincode,
            "address_type": a.address_type,
            "is_default": a.is_default
        }
        for a in addresses
    ]

    # Fetch orders
    orders = db.query(Order).filter(Order.user_id == id).order_by(Order.created_at.desc()).all()
    serialized_orders = [
        {
            "id": o.id,
            "order_number": o.order_number,
            "total_amount": float(o.total_amount),
            "order_status": o.order_status,
            "payment_status": o.payment_status,
            "created_at": o.created_at
        }
        for o in orders
    ]

    # Calculate total spending
    total_spending = db.query(func.sum(Order.total_amount)).filter(
        Order.user_id == id,
        Order.payment_status == "paid"
    ).scalar() or 0.00

    return {
        "success": True,
        "message": "Customer details retrieved successfully",
        "data": {
            "profile": UserResponse.model_validate(customer).model_dump(),
            "addresses": serialized_addresses,
            "orders": serialized_orders,
            "total_spending": float(total_spending)
        }
    }


@router.put("/api/admin/customers/{id}/status")
def admin_update_customer_status(
    id: int,
    is_active: bool = Query(..., description="Activate or deactivate the customer"),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("customer.manage"))
):
    customer = db.query(User).filter(User.id == id, User.role_id == 3).first()
    if not customer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found"
        )

    old_status = "active" if customer.is_active else "inactive"
    new_status = "active" if is_active else "inactive"

    customer.is_active = is_active
    db.commit()

    # Log audit log
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Customer Management",
        action="Status Change",
        description=f"Customer ID {id} status updated from '{old_status}' to '{new_status}'",
        new_data={"is_active": is_active}
    )

    return {
        "success": True,
        "message": f"Customer successfully {new_status}d",
        "data": UserResponse.model_validate(customer).model_dump()
    }


# --- 10. ADMIN PROFILE MANAGEMENT ---

@router.get("/api/admin/profile")
def admin_get_own_profile(
    current_user = Depends(require_admin_or_super_admin)
):
    return {
        "success": True,
        "message": "Admin profile retrieved successfully",
        "data": UserResponse.model_validate(current_user).model_dump()
    }


@router.put("/api/admin/profile")
def admin_update_own_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    email: Optional[str] = Form(None),
    mobile: Optional[str] = Form(None),
    password: Optional[str] = Form(None),
    profile_image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    old_data = UserResponse.model_validate(current_user).model_dump(mode="json")

    if first_name is not None:
        current_user.first_name = first_name
    if last_name is not None:
        current_user.last_name = last_name
    
    if email is not None and email != current_user.email:
        # Check duplicate email
        exists = db.query(User).filter(User.email == email).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email address already registered"
            )
        current_user.email = email

    if mobile is not None and mobile != current_user.mobile:
        # Check duplicate mobile
        exists = db.query(User).filter(User.mobile == mobile).first()
        if exists:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mobile number already registered"
            )
        current_user.mobile = mobile

    if password is not None and len(password) > 0:
        current_user.password_hash = hash_password(password)

    if profile_image_file is not None:
        img_path = save_uploaded_file(profile_image_file, "profiles")
        current_user.profile_image = img_path

    db.commit()
    db.refresh(current_user)

    new_data = UserResponse.model_validate(current_user).model_dump(mode="json")
    
    # Log audit log
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Admin Profile",
        action="Update",
        description="Admin updated their profile details",
        old_data=old_data,
        new_data=new_data
    )

    return {
        "success": True,
        "message": "Admin profile updated successfully",
        "data": UserResponse.model_validate(current_user).model_dump()
    }
