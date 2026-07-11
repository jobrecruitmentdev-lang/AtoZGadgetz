"""
Recommendation Router
=====================
Exposes AI-powered recommendation endpoints.

Endpoints:
  POST /api/behaviour/track             - Track user behaviour event
  GET  /api/recommendations/similar/{product_id}     - Similar products
  GET  /api/recommendations/for-you                  - Personalized (auth)
  GET  /api/recommendations/frequently-bought/{id}   - Frequently bought together
  GET  /api/recommendations/recently-viewed          - Recently viewed (auth)
  GET  /api/recommendations/popular                  - Popular products (no auth)
"""
from fastapi import APIRouter, Depends, Query, Body
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.services.recommendation_service import recommendation_service
from app.schemas.product_schema import ProductResponse

router = APIRouter(tags=["Recommendations & Behaviour"])


# ─────────────────────────────────────────────
# SCHEMAS
# ─────────────────────────────────────────────
class BehaviourTrackRequest(BaseModel):
    product_id: int
    action: str          # view | click | wishlist | cart | purchase
    session_id: Optional[str] = None
    source: Optional[str] = None   # homepage | search | recommendation | category


# ─────────────────────────────────────────────
# BEHAVIOUR TRACKING
# ─────────────────────────────────────────────
@router.post("/api/behaviour/track", summary="Track user behaviour event")
def track_behaviour(
    payload: BehaviourTrackRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Record a user interaction event (view, click, add to cart, etc.)"""
    event = recommendation_service.track_behaviour(
        db=db,
        user_id=current_user.id,
        product_id=payload.product_id,
        action=payload.action,
        session_id=payload.session_id,
        source=payload.source,
    )
    return {
        "success": True,
        "message": "Behaviour tracked",
        "data": {
            "id": event.id,
            "action": event.action,
            "product_id": event.product_id,
        }
    }


@router.get("/api/behaviour/summary", summary="Get user behaviour summary")
def get_behaviour_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return aggregated action counts for the current user."""
    summary = recommendation_service.get_user_behaviour_summary(db, current_user.id)
    return {
        "success": True,
        "message": "Behaviour summary",
        "data": summary,
    }


# ─────────────────────────────────────────────
# SIMILAR PRODUCTS
# ─────────────────────────────────────────────
@router.get(
    "/api/recommendations/similar/{product_id}",
    summary="Get similar products (content-based)"
)
def similar_products(
    product_id: int,
    limit: int = Query(10, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """
    Returns products similar to the given product based on:
    - Same category
    - Same brand
    - Similar price range (±30%)
    No authentication required.
    """
    products = recommendation_service.get_similar_products(db, product_id, limit)
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return {
        "success": True,
        "message": "Similar products",
        "data": {
            "product_id": product_id,
            "count": len(serialized),
            "products": serialized,
        }
    }


# ─────────────────────────────────────────────
# PERSONALIZED FOR YOU
# ─────────────────────────────────────────────
@router.get(
    "/api/recommendations/for-you",
    summary="Personalized recommendations (collaborative filtering)"
)
def personalized_recommendations(
    limit: int = Query(12, ge=1, le=30),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Returns personalized product recommendations based on the user's
    interaction history using collaborative filtering.
    Falls back to popular products for new users.
    """
    products = recommendation_service.get_personalized_recommendations(db, current_user.id, limit)
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return {
        "success": True,
        "message": "Personalized recommendations",
        "data": {
            "user_id": current_user.id,
            "count": len(serialized),
            "products": serialized,
        }
    }


# ─────────────────────────────────────────────
# FREQUENTLY BOUGHT TOGETHER
# ─────────────────────────────────────────────
@router.get(
    "/api/recommendations/frequently-bought/{product_id}",
    summary="Frequently bought together (association mining)"
)
def frequently_bought_together(
    product_id: int,
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
):
    """
    Returns products frequently purchased together with the given product
    using order co-occurrence analysis.
    No authentication required.
    """
    products = recommendation_service.get_frequently_bought_together(db, product_id, limit)
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return {
        "success": True,
        "message": "Frequently bought together",
        "data": {
            "product_id": product_id,
            "count": len(serialized),
            "products": serialized,
        }
    }


# ─────────────────────────────────────────────
# RECENTLY VIEWED
# ─────────────────────────────────────────────
@router.get(
    "/api/recommendations/recently-viewed",
    summary="Recently viewed products"
)
def recently_viewed(
    limit: int = Query(10, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Returns the most recently viewed products for the authenticated user."""
    products = recommendation_service.get_recently_viewed(db, current_user.id, limit)
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return {
        "success": True,
        "message": "Recently viewed products",
        "data": {
            "count": len(serialized),
            "products": serialized,
        }
    }


# ─────────────────────────────────────────────
# POPULAR PRODUCTS (public)
# ─────────────────────────────────────────────
@router.get(
    "/api/recommendations/popular",
    summary="Popular products (no auth required)"
)
def popular_products(
    limit: int = Query(12, ge=1, le=30),
    db: Session = Depends(get_db),
):
    """Returns top-rated, in-stock products. No authentication required."""
    products = recommendation_service._get_popular_products(db, limit)
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return {
        "success": True,
        "message": "Popular products",
        "data": {
            "count": len(serialized),
            "products": serialized,
        }
    }
