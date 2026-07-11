from typing import List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class DashboardMetricsResponse(BaseModel):
    total_users: int
    total_products: int
    total_orders: int
    total_revenue: float
    pending_orders: int
    delivered_orders: int
    cancelled_orders: int
    low_stock_products: int
    today_sales: float


class SalesChartResponse(BaseModel):
    daily: List[Dict[str, Any]]
    weekly: List[Dict[str, Any]]
    monthly: List[Dict[str, Any]]
    yearly: List[Dict[str, Any]]


class TopProductItem(BaseModel):
    id: int
    name: str
    sku: str
    sales_quantity: int
    revenue: float


class RecentOrderItem(BaseModel):
    id: int
    order_number: str
    user_email: str
    total_amount: float
    order_status: str
    created_at: datetime
