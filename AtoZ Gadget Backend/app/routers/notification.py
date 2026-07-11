from fastapi import APIRouter, Depends, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.notification import Notification
from app.schemas.notification_schema import NotificationResponse

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notification System"]
)


@router.get("", response_model=None)
def get_user_notifications(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    skip = (page - 1) * size
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    total = query.count()
    items = query.order_by(Notification.created_at.desc()).offset(skip).limit(size).all()

    serialized = [NotificationResponse.model_validate(n).model_dump() for n in items]
    return {
        "success": True,
        "message": "Notifications list retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.put("/{id}/read", response_model=None)
def mark_notification_as_read(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()

    if not db_notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db_notif.is_read = True
    db.commit()

    return {
        "success": True,
        "message": "Notification marked as read",
        "data": {}
    }


@router.delete("/{id}", response_model=None)
def delete_notification(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_notif = db.query(Notification).filter(
        Notification.id == id,
        Notification.user_id == current_user.id
    ).first()

    if not db_notif:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    db.delete(db_notif)
    db.commit()

    return {
        "success": True,
        "message": "Notification deleted successfully",
        "data": {}
    }
