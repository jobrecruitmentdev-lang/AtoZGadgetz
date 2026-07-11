"""
Search Router (Phase 7 — Elasticsearch Enhanced)
=================================================
Endpoints:
  GET /api/search                      - Full search (ES + MySQL fallback)
  GET /api/search/autocomplete         - Autocomplete suggestions
  GET /api/search/suggestions          - Popular search suggestions
  POST /api/search/admin/reindex       - Rebuild ES index (Admin)

Backward compatible with the original /api/search endpoint.
"""
from fastapi import APIRouter, Depends, Query, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.product import Product
from app.models.category import Category
from app.models.brand import Brand
from app.models.user import User
from app.models.order import Order
from app.schemas.product_schema import ProductResponse
from app.schemas.category_schema import CategoryResponse
from app.schemas.brand_schema import BrandResponse
from app.schemas.user_schema import UserResponse
from app.schemas.order_schema import OrderResponse
from app.services.search_service import search_service

router = APIRouter(prefix="/api/search", tags=["Search System"])


# ─────────────────────────────────────────────
# GLOBAL SEARCH (backward-compatible)
# ─────────────────────────────────────────────
@router.get("", response_model=None, summary="Advanced product & global search")
def global_search(
    q: str = Query(..., min_length=1, description="Search keyword"),
    category_id: Optional[int] = Query(None),
    brand_id: Optional[int] = Query(None),
    min_price: Optional[float] = Query(None, ge=0),
    max_price: Optional[float] = Query(None, ge=0),
    min_rating: Optional[float] = Query(None, ge=0, le=5),
    sort_by: str = Query("relevance", description="relevance | price_asc | price_desc | rating | newest"),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Enhanced global search powered by Elasticsearch with automatic MySQL fallback.
    
    Features:
    - Full-text search with fuzzy matching (typo tolerance)
    - Multi-field search: name, description, category, brand, SKU, tags
    - Category, brand, price, and rating filters
    - Multiple sort options
    - Returns products + categories + brands + users (admin) + orders
    - `engine` field indicates whether ES or MySQL was used
    """
    # Product search via Elasticsearch (+ MySQL fallback)
    product_result = search_service.search_products(
        db=db, q=q,
        category_id=category_id,
        brand_id=brand_id,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by,
        page=page,
        size=size,
    )

    serialized_products = [
        ProductResponse.model_validate(p).model_dump()
        for p in product_result["products"]
    ]

    # Category & brand search (MySQL, lightweight)
    search_pat = f"%{q}%"
    categories = db.query(Category).filter(Category.name.like(search_pat)).limit(10).all()
    brands = db.query(Brand).filter(Brand.name.like(search_pat)).limit(10).all()

    # Admin: user search
    users = []
    if current_user.role_id in [1, 2]:
        users = db.query(User).filter(
            (User.first_name.like(search_pat)) |
            (User.last_name.like(search_pat)) |
            (User.email.like(search_pat))
        ).limit(size).all()

    # Order search
    order_query = db.query(Order)
    if current_user.role_id not in [1, 2]:
        order_query = order_query.filter(Order.user_id == current_user.id)
    orders = order_query.filter(Order.order_number.like(search_pat)).limit(size).all()

    return {
        "success": True,
        "message": "Search results",
        "data": {
            "query": q,
            "page": page,
            "size": size,
            "engine": product_result["engine"],
            "results": {
                "products": {
                    "total": product_result["total"],
                    "items": serialized_products,
                },
                "categories": [CategoryResponse.model_validate(c).model_dump() for c in categories],
                "brands":     [BrandResponse.model_validate(b).model_dump() for b in brands],
                "users":      [UserResponse.model_validate(u).model_dump() for u in users],
                "orders":     [OrderResponse.model_validate(o).model_dump() for o in orders],
            }
        }
    }


# ─────────────────────────────────────────────
# AUTOCOMPLETE
# ─────────────────────────────────────────────
@router.get("/autocomplete", summary="Autocomplete product name suggestions")
def autocomplete(
    q: str = Query(..., min_length=1, description="Partial search query"),
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Returns up to `limit` product name suggestions for the given partial query.
    Uses Elasticsearch edge n-gram matching with MySQL fallback.
    No authentication required.
    """
    suggestions = search_service.autocomplete(db, q, limit)
    return {
        "success": True,
        "message": "Autocomplete suggestions",
        "data": {
            "query": q,
            "suggestions": suggestions,
        }
    }


# ─────────────────────────────────────────────
# POPULAR SUGGESTIONS
# ─────────────────────────────────────────────
@router.get("/suggestions", summary="Popular search suggestions")
def get_suggestions(
    limit: int = Query(10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """
    Returns popular product name suggestions.
    Used for search bar placeholder hints.
    No authentication required.
    """
    suggestions = search_service.get_suggestions(db, limit)
    return {
        "success": True,
        "message": "Search suggestions",
        "data": {"suggestions": suggestions},
    }


# ─────────────────────────────────────────────
# ADMIN: REINDEX PRODUCTS
# ─────────────────────────────────────────────
@router.post("/admin/reindex", summary="Rebuild Elasticsearch product index (Admin)")
def reindex_products(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Trigger a full rebuild of the Elasticsearch product index.
    Runs as a background task to avoid blocking.
    Admin / Super Admin only.
    """
    if current_user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    def _do_reindex():
        result = search_service.bulk_index_products(db)
        import logging
        logging.getLogger(__name__).info("Reindex completed: %s", result)

    background_tasks.add_task(_do_reindex)

    return {
        "success": True,
        "message": "Elasticsearch reindex started in background",
        "data": {}
    }
