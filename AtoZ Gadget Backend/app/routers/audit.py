from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.models.audit_log import AuditLog
from app.models.user import User
from app.schemas.audit_schema import AuditLogResponse

router = APIRouter(
    tags=["Audit & Security Logs"]
)


@router.get("/api/admin/logs")
def get_audit_activities_legacy(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    module: Optional[str] = Query(None, description="Filter by module: 'Product', 'Order', etc."),
    action: Optional[str] = Query(None, description="Filter by action: 'Create', 'Update', etc."),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("report.view"))
):
    skip = (page - 1) * size
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    if module:
        query = query.filter(AuditLog.module == module)
    if action:
        query = query.filter(AuditLog.action == action)

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(size).all()
    
    serialized = [AuditLogResponse.model_validate(log).model_dump() for log in logs]

    return {
        "success": True,
        "message": "Audit logs retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.get("/api/admin/audit-logs")
def get_audit_activities(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    user: Optional[str] = Query(None, description="Filter by user ID or user email"),
    module: Optional[str] = Query(None, description="Filter by module"),
    action: Optional[str] = Query(None, description="Filter by action"),
    start_date: Optional[str] = Query(None, description="ISO format start date YYYY-MM-DDTHH:MM:SS"),
    end_date: Optional[str] = Query(None, description="ISO format end date YYYY-MM-DDTHH:MM:SS"),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("report.view"))
):
    skip = (page - 1) * size
    query = db.query(AuditLog).options(joinedload(AuditLog.user))

    # User Filter (IDs or Email)
    if user:
        if "@" in user:
            query = query.join(User, AuditLog.user_id == User.id).filter(User.email.like(f"%{user}%"))
        else:
            try:
                user_id = int(user)
                query = query.filter(AuditLog.user_id == user_id)
            except ValueError:
                # Text fallback matching name
                query = query.join(User, AuditLog.user_id == User.id).filter(
                    (User.first_name.like(f"%{user}%")) | (User.last_name.like(f"%{user}%"))
                )

    if module:
        query = query.filter(AuditLog.module == module)
    if action:
        query = query.filter(AuditLog.action == action)

    # Date Range Filter
    if start_date:
        try:
            parsed_start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.created_at >= parsed_start)
        except ValueError:
            pass
    if end_date:
        try:
            parsed_end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
            query = query.filter(AuditLog.created_at <= parsed_end)
        except ValueError:
            pass

    total = query.count()
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(size).all()
    
    serialized = [AuditLogResponse.model_validate(log).model_dump() for log in logs]

    return {
        "success": True,
        "message": "Audit logs retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }
