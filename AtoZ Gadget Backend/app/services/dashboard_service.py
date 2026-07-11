from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.user import User
from app.models.product import Product
from app.models.order import Order
from app.models.order_item import OrderItem


class DashboardService:
    def get_metrics(self, db: Session) -> dict:
        total_users = db.query(User).count()
        total_products = db.query(Product).count()
        total_orders = db.query(Order).count()
        
        total_revenue = db.query(func.sum(Order.total_amount)).filter(
            Order.payment_status == "paid"
        ).scalar() or Decimal("0.00")

        pending_orders = db.query(Order).filter(Order.order_status == "pending").count()
        delivered_orders = db.query(Order).filter(Order.order_status == "delivered").count()
        cancelled_orders = db.query(Order).filter(Order.order_status == "cancelled").count()
        
        # Products with low stock (<= 10 units)
        low_stock_products = db.query(Product).filter(Product.stock_quantity <= 10).count()

        # Today's Sales
        today = datetime.now().date()
        today_sales = db.query(func.sum(Order.total_amount)).filter(
            Order.payment_status == "paid",
            func.date(Order.created_at) == today
        ).scalar() or Decimal("0.00")

        return {
            "total_users": total_users,
            "total_products": total_products,
            "total_orders": total_orders,
            "total_revenue": float(total_revenue),
            "pending_orders": pending_orders,
            "delivered_orders": delivered_orders,
            "cancelled_orders": cancelled_orders,
            "low_stock_products": low_stock_products,
            "today_sales": float(today_sales)
        }

    def get_sales_chart(self, db: Session) -> dict:
        # 1. Daily Sales (Last 7 days)
        seven_days_ago = datetime.now().date() - timedelta(days=7)
        daily_query = db.query(
            func.date(Order.created_at).label("label"),
            func.sum(Order.total_amount).label("value")
        ).filter(
            Order.payment_status == "paid",
            func.date(Order.created_at) >= seven_days_ago
        ).group_by(func.date(Order.created_at)).all()
        
        daily = [{"label": str(d.label), "value": float(d.value)} for d in daily_query]

        # 2. Weekly Sales (Last 4 weeks)
        four_weeks_ago = datetime.now().date() - timedelta(weeks=4)
        weekly_query = db.query(
            func.yearweek(Order.created_at).label("label"),
            func.sum(Order.total_amount).label("value")
        ).filter(
            Order.payment_status == "paid",
            func.date(Order.created_at) >= four_weeks_ago
        ).group_by(func.yearweek(Order.created_at)).all()
        
        weekly = [{"label": f"Week {str(w.label)[-2:]}", "value": float(w.value)} for w in weekly_query]

        # 3. Monthly Sales (Last 6 months)
        six_months_ago = datetime.now().date() - timedelta(days=180)
        monthly_query = db.query(
            func.date_format(Order.created_at, "%Y-%m").label("label"),
            func.sum(Order.total_amount).label("value")
        ).filter(
            Order.payment_status == "paid",
            func.date(Order.created_at) >= six_months_ago
        ).group_by(func.date_format(Order.created_at, "%Y-%m")).all()
        
        monthly = [{"label": m.label, "value": float(m.value)} for m in monthly_query]

        # 4. Yearly Sales (Last 3 years)
        three_years_ago = datetime.now().date() - timedelta(days=1095)
        yearly_query = db.query(
            func.date_format(Order.created_at, "%Y").label("label"),
            func.sum(Order.total_amount).label("value")
        ).filter(
            Order.payment_status == "paid",
            func.date(Order.created_at) >= three_years_ago
        ).group_by(func.date_format(Order.created_at, "%Y")).all()
        
        yearly = [{"label": y.label, "value": float(y.value)} for y in yearly_query]

        return {
            "daily": daily,
            "weekly": weekly,
            "monthly": monthly,
            "yearly": yearly
        }

    def get_top_products(self, db: Session, limit: int = 5) -> list:
        top_query = db.query(
            Product.id,
            Product.name,
            Product.sku,
            func.sum(OrderItem.quantity).label("sales_qty"),
            func.sum(OrderItem.subtotal).label("revenue")
        ).join(
            OrderItem, Product.id == OrderItem.product_id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).filter(
            Order.payment_status == "paid"
        ).group_by(
            Product.id
        ).order_by(
            desc("sales_qty")
        ).limit(limit).all()

        return [
            {
                "id": p.id,
                "name": p.name,
                "sku": p.sku,
                "sales_quantity": int(p.sales_qty),
                "revenue": float(p.revenue)
            }
            for p in top_query
        ]

    def get_recent_orders(self, db: Session, limit: int = 5) -> list:
        orders = db.query(Order).options(
            joinedload(Order.user)
        ).order_by(
            desc(Order.created_at)
        ).limit(limit).all()

        return [
            {
                "id": o.id,
                "order_number": o.order_number,
                "user_email": o.user.email if o.user else "Deleted User",
                "total_amount": float(o.total_amount),
                "order_status": o.order_status,
                "created_at": o.created_at
            }
            for o in orders
        ]


dashboard_service = DashboardService()
