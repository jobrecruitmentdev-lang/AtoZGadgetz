from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from pydantic import BaseModel

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.wishlist import Wishlist, WishlistItem
from app.models.product import Product
from app.schemas.wishlist_schema import WishlistResponse

router = APIRouter(
    prefix="/api/wishlist",
    tags=["Wishlist System"]
)


class WishlistAddRequest(BaseModel):
    product_id: int


@router.post("/add")
def add_to_wishlist(
    req: WishlistAddRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Verify product existence
    product = db.query(Product).filter(Product.id == req.product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Get or create wishlist
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        wishlist = Wishlist(user_id=current_user.id)
        db.add(wishlist)
        db.commit()
        db.refresh(wishlist)

    # Check duplicate
    item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == req.product_id
    ).first()

    if not item:
        item = WishlistItem(wishlist_id=wishlist.id, product_id=req.product_id)
        db.add(item)
        db.commit()

    return {
        "success": True,
        "message": "Product added to wishlist successfully",
        "data": {}
    }


@router.get("")
def get_wishlist(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # Preload using joinedload to prevent N+1 queries
    wishlist = db.query(Wishlist).options(
        joinedload(Wishlist.items).joinedload(WishlistItem.product).joinedload(Product.images),
        joinedload(Wishlist.items).joinedload(WishlistItem.product).joinedload(Product.category),
        joinedload(Wishlist.items).joinedload(WishlistItem.product).joinedload(Product.subcategory),
        joinedload(Wishlist.items).joinedload(WishlistItem.product).joinedload(Product.brand)
    ).filter(Wishlist.user_id == current_user.id).first()

    if not wishlist:
        # Return empty wishlist structure
        return {
            "success": True,
            "message": "Wishlist is empty",
            "data": {
                "id": 0,
                "user_id": current_user.id,
                "items": []
            }
        }

    return {
        "success": True,
        "message": "Wishlist retrieved successfully",
        "data": WishlistResponse.model_validate(wishlist).model_dump()
    }


@router.delete("/remove/{product_id}")
def remove_from_wishlist(
    product_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == current_user.id).first()
    if not wishlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wishlist not found"
        )

    item = db.query(WishlistItem).filter(
        WishlistItem.wishlist_id == wishlist.id,
        WishlistItem.product_id == product_id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found in wishlist"
        )

    db.delete(item)
    db.commit()

    return {
        "success": True,
        "message": "Product removed from wishlist successfully",
        "data": {}
    }
