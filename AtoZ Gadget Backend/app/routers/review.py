from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.review import ProductReview
from app.models.product import Product
from app.schemas.review_schema import ReviewCreate, ReviewResponse

router = APIRouter(
    tags=["Product Reviews"]
)


def check_user_purchased_product(db: Session, user_id: int, product_id: int) -> bool:
    """
    Validation structure to verify if a user has purchased a product before leaving a review.
    In later stages, this maps to the orders & checkout tables:
    e.g., db.query(Order).join(OrderItem).filter(Order.user_id == user_id, OrderItem.product_id == product_id).first()
    For Phase 3 (which only implements Checkout Preview), we mock this verification structure 
    to always return True but log the placeholder logic.
    """
    return True


@router.post("/api/products/{id}/review", status_code=status.HTTP_201_CREATED)
def leave_product_review(
    id: int,
    review_in: ReviewCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Perform purchase validation check
    if not check_user_purchased_product(db, current_user.id, id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review products you have purchased"
        )

    # Check if user already reviewed this product to prevent duplicate reviews
    existing = db.query(ProductReview).filter(
        ProductReview.user_id == current_user.id,
        ProductReview.product_id == id
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a review for this product"
        )

    db_review = ProductReview(
        user_id=current_user.id,
        product_id=id,
        rating=review_in.rating,
        review=review_in.review,
        status="approved"  # Auto-approve for demo/testing purposes
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    # Preload user details to return the full response
    full_review = db.query(ProductReview).options(
        joinedload(ProductReview.user)
    ).filter(ProductReview.id == db_review.id).first()

    return {
        "success": True,
        "message": "Review submitted successfully",
        "data": ReviewResponse.model_validate(full_review).model_dump()
    }


@router.get("/api/products/{id}/reviews")
def get_product_reviews(
    id: int,
    db: Session = Depends(get_db)
):
    # Verify product exists
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    reviews = db.query(ProductReview).options(
        joinedload(ProductReview.user)
    ).filter(
        ProductReview.product_id == id,
        ProductReview.status == "approved"
    ).order_by(ProductReview.created_at.desc()).all()

    items = [ReviewResponse.model_validate(r).model_dump() for r in reviews]

    return {
        "success": True,
        "message": "Reviews retrieved successfully",
        "data": items
    }
