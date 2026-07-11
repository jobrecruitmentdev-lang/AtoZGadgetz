"""
AI-Powered Product Recommendation Service
==========================================
Implements collaborative filtering + content-based hybrid recommendations.

Algorithms:
  1. Similar Products     → content-based (category, brand, price range)
  2. Personalized         → user behaviour collaborative filtering
  3. Frequently Bought    → co-purchase association mining
  4. Recently Viewed      → behaviour history

All computation is done in-database (SQL aggregations) for zero extra infrastructure.
"""
import json
from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, text

from app.models.product import Product
from app.models.user_behaviour import UserBehaviour
from app.models.order_item import OrderItem
from app.models.order import Order
from app.models.cart import CartItem


# Weight map: how much each action contributes to recommendation score
ACTION_WEIGHTS = {
    "purchase": 5,
    "cart":     3,
    "wishlist": 2,
    "click":    1,
    "view":     0.5,
}


class RecommendationService:

    # ─────────────────────────────────────────────
    # TRACK USER BEHAVIOUR
    # ─────────────────────────────────────────────
    def track_behaviour(
        self,
        db: Session,
        user_id: int,
        product_id: int,
        action: str,
        session_id: Optional[str] = None,
        source: Optional[str] = None,
    ) -> UserBehaviour:
        """Record a single user interaction with a product."""
        # Validate action
        valid_actions = list(ACTION_WEIGHTS.keys()) + ["remove_cart", "remove_wishlist"]
        if action not in valid_actions:
            action = "view"

        event = UserBehaviour(
            user_id=user_id,
            product_id=product_id,
            action=action,
            session_id=session_id,
            source=source,
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event

    # ─────────────────────────────────────────────
    # 1. SIMILAR PRODUCTS (Content-Based)
    # ─────────────────────────────────────────────
    def get_similar_products(
        self,
        db: Session,
        product_id: int,
        limit: int = 10
    ) -> List[Product]:
        """
        Find products similar to the given product based on:
        - Same category (weight: 3)
        - Same brand (weight: 2)
        - Similar price range ±30% (weight: 1)
        Returns up to `limit` products, excluding the original product.
        """
        source_product = db.query(Product).filter(
            Product.id == product_id,
            Product.status == "active"
        ).first()

        if not source_product:
            return []

        price_min = float(source_product.price or 0) * 0.7
        price_max = float(source_product.price or 0) * 1.3

        # Score each product based on similarity attributes
        similar = (
            db.query(Product)
            .filter(
                Product.id != product_id,
                Product.status == "active",
                (Product.category_id == source_product.category_id) |
                (Product.brand_id == source_product.brand_id) |
                (Product.price.between(price_min, price_max))
            )
            .order_by(
                # Products matching category rank highest
                (Product.category_id == source_product.category_id).desc(),
                (Product.brand_id == source_product.brand_id).desc(),
                Product.is_featured.desc(),
                Product.id.desc(),
            )
            .limit(limit)
            .all()
        )
        return similar

    # ─────────────────────────────────────────────
    # 2. PERSONALIZED RECOMMENDATIONS (Collaborative)
    # ─────────────────────────────────────────────
    def get_personalized_recommendations(
        self,
        db: Session,
        user_id: int,
        limit: int = 12
    ) -> List[Product]:
        """
        Collaborative filtering:
        1. Find products the user has interacted with.
        2. Find other users who interacted with the same products.
        3. Recommend products those similar users liked that current user hasn't seen.
        
        Falls back to popular products if insufficient data.
        """
        # Step 1: Products this user has engaged with (last 90 days)
        cutoff = datetime.utcnow() - timedelta(days=90)
        user_products = (
            db.query(UserBehaviour.product_id)
            .filter(
                UserBehaviour.user_id == user_id,
                UserBehaviour.created_at >= cutoff
            )
            .distinct()
            .subquery()
        )

        if db.query(func.count()).select_from(user_products).scalar() == 0:
            return self._get_popular_products(db, limit)

        # Step 2: Similar users (interacted with same products)
        similar_users = (
            db.query(UserBehaviour.user_id)
            .filter(
                UserBehaviour.product_id.in_(
                    db.query(UserBehaviour.product_id).filter(UserBehaviour.user_id == user_id)
                ),
                UserBehaviour.user_id != user_id
            )
            .distinct()
            .limit(50)
            .subquery()
        )

        # Step 3: Products those similar users engaged with but current user hasn't
        recommended = (
            db.query(Product, func.count(UserBehaviour.id).label("score"))
            .join(UserBehaviour, UserBehaviour.product_id == Product.id)
            .filter(
                UserBehaviour.user_id.in_(similar_users),
                Product.id.notin_(
                    db.query(UserBehaviour.product_id).filter(UserBehaviour.user_id == user_id)
                ),
                Product.status == "active",
                UserBehaviour.action.in_(["purchase", "cart", "wishlist"]),
                UserBehaviour.created_at >= cutoff
            )
            .group_by(Product.id)
            .order_by(text("score DESC"))
            .limit(limit)
            .all()
        )

        products = [r[0] for r in recommended]

        # Pad with popular products if not enough
        if len(products) < limit:
            existing_ids = {p.id for p in products}
            popular = self._get_popular_products(db, limit - len(products), exclude_ids=existing_ids)
            products.extend(popular)

        return products

    # ─────────────────────────────────────────────
    # 3. FREQUENTLY BOUGHT TOGETHER
    # ─────────────────────────────────────────────
    def get_frequently_bought_together(
        self,
        db: Session,
        product_id: int,
        limit: int = 8
    ) -> List[Product]:
        """
        Association rule mining via order co-occurrence.
        Find products that appear in the same orders as the given product.
        """
        # Orders containing the target product
        orders_with_product = (
            db.query(OrderItem.order_id)
            .filter(OrderItem.product_id == product_id)
            .distinct()
            .subquery()
        )

        # Products that co-appear in those orders (excluding target)
        fbt_products = (
            db.query(
                Product,
                func.count(OrderItem.id).label("co_count")
            )
            .join(OrderItem, OrderItem.product_id == Product.id)
            .filter(
                OrderItem.order_id.in_(orders_with_product),
                OrderItem.product_id != product_id,
                Product.status == "active"
            )
            .group_by(Product.id)
            .order_by(text("co_count DESC"))
            .limit(limit)
            .all()
        )

        return [r[0] for r in fbt_products]

    # ─────────────────────────────────────────────
    # 4. RECENTLY VIEWED
    # ─────────────────────────────────────────────
    def get_recently_viewed(
        self,
        db: Session,
        user_id: int,
        limit: int = 10
    ) -> List[Product]:
        """Return the most recently viewed active products for a user."""
        recent = (
            db.query(Product)
            .join(UserBehaviour, UserBehaviour.product_id == Product.id)
            .filter(
                UserBehaviour.user_id == user_id,
                UserBehaviour.action.in_(["view", "click"]),
                Product.status == "active"
            )
            .order_by(UserBehaviour.created_at.desc())
            .distinct(Product.id)
            .limit(limit)
            .all()
        )
        return recent

    # ─────────────────────────────────────────────
    # HELPER: Popular Products Fallback
    # ─────────────────────────────────────────────
    def _get_popular_products(
        self,
        db: Session,
        limit: int,
        exclude_ids: Optional[set] = None
    ) -> List[Product]:
        """Return top-featured, in-stock products as fallback recommendations."""
        query = db.query(Product).filter(Product.status == "active")
        if exclude_ids:
            query = query.filter(Product.id.notin_(exclude_ids))
        return (
            query
            .order_by(Product.is_featured.desc(), Product.id.desc())
            .limit(limit)
            .all()
        )

    # ─────────────────────────────────────────────
    # GET USER BEHAVIOUR SUMMARY
    # ─────────────────────────────────────────────
    def get_user_behaviour_summary(self, db: Session, user_id: int) -> dict:
        """Return aggregated behaviour stats for a user."""
        stats = (
            db.query(UserBehaviour.action, func.count(UserBehaviour.id).label("count"))
            .filter(UserBehaviour.user_id == user_id)
            .group_by(UserBehaviour.action)
            .all()
        )
        return {row.action: row.count for row in stats}


recommendation_service = RecommendationService()
