from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from typing import Optional, List
from decimal import Decimal

from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.models.user import User


class ReportService:
    def get_sales_report(
        self,
        db: Session,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        payment_status: Optional[str] = None,
        order_status: Optional[str] = None
    ) -> List[dict]:
        query = db.query(Order).options(joinedload(Order.user))

        if start_date:
            query = query.filter(Order.created_at >= start_date)
        if end_date:
            query = query.filter(Order.created_at <= end_date)
        if payment_status:
            query = query.filter(Order.payment_status == payment_status)
        if order_status:
            query = query.filter(Order.order_status == order_status)

        orders = query.order_by(Order.created_at.desc()).all()
        
        return [
            {
                "id": o.id,
                "order_number": o.order_number,
                "customer_email": o.user.email if o.user else "Deleted User",
                "subtotal": float(o.subtotal),
                "coupon_discount": float(o.coupon_discount),
                "offer_discount": float(getattr(o, "offer_discount", Decimal("0.00"))),
                "total_amount": float(o.total_amount),
                "order_status": o.order_status,
                "payment_status": o.payment_status,
                "created_at": o.created_at
            }
            for o in orders
        ]

    def get_products_report(self, db: Session) -> List[dict]:
        report = db.query(
            Product.id,
            Product.name,
            Product.sku,
            Product.stock_quantity,
            func.coalesce(func.sum(OrderItem.quantity), 0).label("qty_sold"),
            func.coalesce(func.sum(OrderItem.subtotal), 0).label("revenue")
        ).outerjoin(
            OrderItem, Product.id == OrderItem.product_id
        ).group_by(
            Product.id
        ).order_by(desc("revenue")).all()

        return [
            {
                "id": r.id,
                "name": r.name,
                "sku": r.sku,
                "stock": r.stock_quantity,
                "sales_quantity": int(r.qty_sold),
                "revenue": float(r.revenue)
            }
            for r in report
        ]

    def get_customers_report(self, db: Session) -> dict:
        # 1. New customers in the last 30 days (role_id = 3)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        new_customers = db.query(User).filter(
            User.role_id == 3,
            User.created_at >= thirty_days_ago
        ).count()

        # 2. Active customers (placed at least 1 order)
        active_customers = db.query(User).filter(
            User.role_id == 3
        ).join(
            Order, User.id == Order.user_id
        ).distinct().count()

        # 3. Top customers by spending
        top_spending = db.query(
            User.id,
            User.first_name,
            User.last_name,
            User.email,
            func.sum(Order.total_amount).label("total_spent")
        ).join(
            Order, User.id == Order.user_id
        ).filter(
            Order.payment_status == "paid"
        ).group_by(
            User.id
        ).order_by(desc("total_spent")).limit(10).all()

        top_customers = [
            {
                "id": u.id,
                "name": f"{u.first_name} {u.last_name or ''}".strip(),
                "email": u.email,
                "total_spending": float(u.total_spent)
            }
            for u in top_spending
        ]

        return {
            "new_customers_30d": new_customers,
            "active_customers": active_customers,
            "top_customers": top_customers
        }


report_service = ReportService()
