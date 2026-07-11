"""
Analytics Router
================
Endpoints for event tracking and business intelligence reports.

Public / Customer endpoints:
  POST /api/analytics/track           - Track any event

Admin endpoints:
  GET  /api/analytics/events          - List all events (paginated)
  GET  /api/analytics/reports/daily   - Daily report
  GET  /api/analytics/reports/weekly  - Weekly report
  GET  /api/analytics/reports/monthly - Monthly report
  GET  /api/analytics/funnel          - Conversion funnel
"""
from fastapi import APIRouter, Depends, Query, Request
from sqlalchemy.orm import Session
from typing import Optional
from datetime import datetime
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.services.analytics_service import analytics_service

router = APIRouter(prefix="/api/analytics", tags=["Analytics Engine"])


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class TrackEventRequest(BaseModel):
    event_name: str
    event_data: Optional[dict] = None
    page_url: Optional[str] = None
    referrer: Optional[str] = None
    session_id: Optional[str] = None


# ─────────────────────────────────────────────
# EVENT TRACKING
# ─────────────────────────────────────────────
@router.post("/track", summary="Track an analytics event")
def track_event(
    request: Request,
    payload: TrackEventRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Track any analytics event.
    Called by frontend on user actions (page_view, product_view, checkout_started, etc.)
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    event = analytics_service.track_event(
        db=db,
        event_name=payload.event_name,
        user_id=current_user.id,
        event_data=payload.event_data,
        ip_address=client_ip,
        user_agent=user_agent,
        page_url=payload.page_url,
        referrer=payload.referrer,
        session_id=payload.session_id,
    )

    return {
        "success": True,
        "message": "Event tracked",
        "data": {"id": event.id, "event": event.event_name},
    }


# ─────────────────────────────────────────────
# EVENT LISTING (Admin)
# ─────────────────────────────────────────────
@router.get("/events", summary="List analytics events (Admin)")
def list_events(
    event_name: Optional[str] = Query(None),
    user_id: Optional[int] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """List analytics events with filters. Admin / Super Admin only."""
    if current_user.role_id not in [1, 2]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    result = analytics_service.get_events(
        db=db,
        event_name=event_name,
        user_id=user_id,
        start_date=start_date,
        end_date=end_date,
        page=page,
        size=size,
    )

    serialized_events = []
    for e in result["events"]:
        serialized_events.append({
            "id": e.id,
            "user_id": e.user_id,
            "event_name": e.event_name,
            "event_data": e.event_data,
            "ip_address": e.ip_address,
            "page_url": e.page_url,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        })

    return {
        "success": True,
        "message": "Analytics events",
        "data": {
            "total": result["total"],
            "page": result["page"],
            "size": result["size"],
            "events": serialized_events,
        }
    }


# ─────────────────────────────────────────────
# REPORTS (Admin)
# ─────────────────────────────────────────────
@router.get("/reports/daily", summary="Daily business report (Admin)")
def daily_report(
    date: Optional[str] = Query(None, description="Date YYYY-MM-DD. Defaults to today."),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate a daily revenue and activity report. Admin only."""
    if current_user.role_id not in [1, 2]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    target_date = None
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    report = analytics_service.daily_report(db, target_date)
    return {"success": True, "message": "Daily report", "data": report}


@router.get("/reports/weekly", summary="Weekly business report (Admin)")
def weekly_report(
    date: Optional[str] = Query(None, description="Any date within the target week YYYY-MM-DD"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate a weekly revenue and activity report. Admin only."""
    if current_user.role_id not in [1, 2]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    target_date = None
    if date:
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            from fastapi import HTTPException
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    report = analytics_service.weekly_report(db, target_date)
    return {"success": True, "message": "Weekly report", "data": report}


@router.get("/reports/monthly", summary="Monthly business report (Admin)")
def monthly_report(
    year: Optional[int] = Query(None, description="Year e.g. 2026"),
    month: Optional[int] = Query(None, ge=1, le=12, description="Month 1-12"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Generate a monthly revenue and activity report. Admin only."""
    if current_user.role_id not in [1, 2]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    report = analytics_service.monthly_report(db, year, month)
    return {"success": True, "message": "Monthly report", "data": report}


# ─────────────────────────────────────────────
# CONVERSION FUNNEL (Admin)
# ─────────────────────────────────────────────
@router.get("/funnel", summary="Conversion funnel analysis (Admin)")
def conversion_funnel(
    days: int = Query(30, ge=1, le=365, description="Analysis window in days"),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns conversion funnel:
    product_view → add_to_cart → checkout_started → order_placed → payment_success
    """
    if current_user.role_id not in [1, 2]:
        from fastapi import HTTPException
        raise HTTPException(status_code=403, detail="Admin access required")

    funnel = analytics_service.get_conversion_funnel(db, days)
    return {"success": True, "message": "Conversion funnel", "data": funnel}
