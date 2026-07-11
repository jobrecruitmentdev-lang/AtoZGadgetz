from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.services.report_service import report_service

router = APIRouter(
    prefix="/api/admin/reports",
    tags=["Report & Analytics Management"]
)


@router.get("/sales")
def get_sales_analytics_report(
    start_date: Optional[str] = Query(None, description="ISO format start date YYYY-MM-DDTHH:MM:SS"),
    end_date: Optional[str] = Query(None, description="ISO format end date YYYY-MM-DDTHH:MM:SS"),
    payment_status: Optional[str] = Query(None),
    order_status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _ = Depends(require_permission("report.view"))
):
    parsed_start = None
    parsed_end = None
    if start_date:
        parsed_start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
    if end_date:
        parsed_end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))

    report = report_service.get_sales_report(
        db,
        start_date=parsed_start,
        end_date=parsed_end,
        payment_status=payment_status,
        order_status=order_status
    )
    return {
        "success": True,
        "message": "Sales report generated successfully",
        "data": report
    }


@router.get("/products")
def get_products_analytics_report(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("report.view"))
):
    report = report_service.get_products_report(db)
    return {
        "success": True,
        "message": "Product performance report generated successfully",
        "data": report
    }


@router.get("/customers")
def get_customers_analytics_report(
    db: Session = Depends(get_db),
    _ = Depends(require_permission("report.view"))
):
    report = report_service.get_customers_report(db)
    return {
        "success": True,
        "message": "Customer acquisition report generated successfully",
        "data": report
    }
