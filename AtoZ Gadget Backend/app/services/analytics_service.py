"""
Analytics Service
=================
Tracks events and generates daily / weekly / monthly business reports.
All data stored in analytics_events table with JSON payload.
"""
import json
from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, text

from app.models.analytics_event import AnalyticsEvent
from app.models.order import Order
from app.models.payment import Payment
from app.models.user import User
from app.models.product import Product
from app.models.order_item import OrderItem


class AnalyticsService:

    # ─────────────────────────────────────────────
    # EVENT TRACKING
    # ─────────────────────────────────────────────
    def track_event(
        self,
        db: Session,
        event_name: str,
        user_id: Optional[int] = None,
        event_data: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        page_url: Optional[str] = None,
        referrer: Optional[str] = None,
        session_id: Optional[str] = None,
    ) -> AnalyticsEvent:
        """Record an analytics event."""
        event = AnalyticsEvent(
            user_id=user_id,
            session_id=session_id,
            event_name=event_name,
            event_data=json.dumps(event_data) if event_data else None,
            ip_address=ip_address,
            user_agent=user_agent,
            page_url=page_url,
            referrer=referrer,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    def get_events(
        self,
        db: Session,
        event_name: Optional[str] = None,
        user_id: Optional[int] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        page: int = 1,
        size: int = 50,
    ) -> Dict[str, Any]:
        query = db.query(AnalyticsEvent)
        if event_name:
            query = query.filter(AnalyticsEvent.event_name == event_name)
        if user_id:
            query = query.filter(AnalyticsEvent.user_id == user_id)
        if start_date:
            query = query.filter(AnalyticsEvent.created_at >= start_date)
        if end_date:
            query = query.filter(AnalyticsEvent.created_at <= end_date)

        total = query.count()
        events = query.order_by(AnalyticsEvent.created_at.desc()).offset((page - 1) * size).limit(size).all()
        return {"total": total, "page": page, "size": size, "events": events}

    # ─────────────────────────────────────────────
    # REPORT GENERATORS
    # ─────────────────────────────────────────────
    def _build_report(self, db: Session, start: datetime, end: datetime, label: str) -> Dict:
        """Core report builder used by daily / weekly / monthly methods."""

        # Revenue
        revenue_row = db.query(
            func.coalesce(func.sum(Order.total_amount), 0).label("revenue"),
            func.count(Order.id).label("order_count"),
        ).filter(
            Order.created_at.between(start, end),
            Order.order_status.notin_(["cancelled"])
        ).first()

        # New users registered
        new_users = db.query(func.count(User.id)).filter(
            User.created_at.between(start, end)
        ).scalar() or 0

        # Payment breakdown
        payments = db.query(
            Payment.payment_status,
            func.count(Payment.id).label("count"),
            func.coalesce(func.sum(Payment.amount), 0).label("amount"),
        ).filter(Payment.created_at.between(start, end)).group_by(Payment.payment_status).all()

        payment_breakdown = {
            row.payment_status: {"count": row.count, "amount": float(row.amount)}
            for row in payments
        }

        # Top 5 products by sales volume
        top_products = (
            db.query(
                Product.name,
                Product.id,
                func.sum(OrderItem.quantity).label("units_sold"),
                func.sum(OrderItem.total_price).label("revenue"),
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .join(Order, Order.id == OrderItem.order_id)
            .filter(Order.created_at.between(start, end))
            .group_by(Product.id, Product.name)
            .order_by(text("units_sold DESC"))
            .limit(5)
            .all()
        )

        # Analytics event counts
        event_counts = (
            db.query(AnalyticsEvent.event_name, func.count(AnalyticsEvent.id).label("count"))
            .filter(AnalyticsEvent.created_at.between(start, end))
            .group_by(AnalyticsEvent.event_name)
            .all()
        )

        return {
            "report_type": label,
            "period": {
                "start": start.isoformat(),
                "end": end.isoformat(),
            },
            "summary": {
                "total_revenue": float(revenue_row.revenue),
                "total_orders": revenue_row.order_count,
                "new_users": new_users,
                "avg_order_value": (
                    float(revenue_row.revenue) / revenue_row.order_count
                    if revenue_row.order_count > 0 else 0
                ),
            },
            "payment_breakdown": payment_breakdown,
            "top_products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "units_sold": p.units_sold,
                    "revenue": float(p.revenue),
                }
                for p in top_products
            ],
            "events": {row.event_name: row.count for row in event_counts},
        }

    def daily_report(self, db: Session, date: Optional[datetime] = None) -> Dict:
        target = date or datetime.utcnow()
        start = target.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1) - timedelta(seconds=1)
        return self._build_report(db, start, end, "daily")

    def weekly_report(self, db: Session, date: Optional[datetime] = None) -> Dict:
        target = date or datetime.utcnow()
        # Week starts on Monday
        start = (target - timedelta(days=target.weekday())).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7) - timedelta(seconds=1)
        return self._build_report(db, start, end, "weekly")

    def monthly_report(self, db: Session, year: Optional[int] = None, month: Optional[int] = None) -> Dict:
        now = datetime.utcnow()
        y = year or now.year
        m = month or now.month
        start = datetime(y, m, 1)
        if m == 12:
            end = datetime(y + 1, 1, 1) - timedelta(seconds=1)
        else:
            end = datetime(y, m + 1, 1) - timedelta(seconds=1)
        return self._build_report(db, start, end, "monthly")

    # ─────────────────────────────────────────────
    # EVENT FUNNEL ANALYSIS
    # ─────────────────────────────────────────────
    def get_conversion_funnel(self, db: Session, days: int = 30) -> Dict:
        """Compute conversion funnel: views → cart → checkout → purchase."""
        since = datetime.utcnow() - timedelta(days=days)
        
        funnel_events = ["product_view", "add_to_cart", "checkout_started", "order_placed", "payment_success"]
        result = {}
        for event in funnel_events:
            count = db.query(func.count(AnalyticsEvent.id)).filter(
                AnalyticsEvent.event_name == event,
                AnalyticsEvent.created_at >= since
            ).scalar() or 0
            result[event] = count

        return {
            "period_days": days,
            "funnel": result,
            "conversion_rate": (
                round(result.get("payment_success", 0) / result.get("product_view", 1) * 100, 2)
            ),
        }


analytics_service = AnalyticsService()
