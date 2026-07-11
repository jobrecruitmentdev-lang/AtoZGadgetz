from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from decimal import Decimal

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart_schema import CartAddRequest, CartUpdateRequest, CartResponse, CartItemResponse

router = APIRouter(
    prefix="/api/cart",
    tags=["Shopping Cart System"]
)


def get_user_cart_details(db: Session, user_id: int) -> dict:
    """
    Helper function to load the user's cart, prefetch relationships, 
    and calculate subtotal and total fields.
    """
    cart = db.query(Cart).options(
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.images),
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.category),
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.subcategory),
        joinedload(Cart.items).joinedload(CartItem.product).joinedload(Product.brand)
    ).filter(Cart.user_id == user_id).first()

    if not cart:
        return {
            "id": 0,
            "user_id": user_id,
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
            "items": [],
            "subtotal": Decimal("0.00"),
            "total": Decimal("0.00")
        }

    subtotal = Decimal("0.00")
    items_list = []
    
    for item in cart.items:
        # Dynamically verify if product price has changed
        current_price = item.product.discount_price if item.product.discount_price is not None else item.product.price
        # Update price to current
        if item.price != current_price:
            item.price = current_price
            db.add(item)
        
        item_sub = item.price * item.quantity
        subtotal += item_sub
        items_list.append(CartItemResponse.model_validate(item))
        
    db.commit()  # Save any price updates

    total = subtotal  # Checkout preview handles tax and discount codes

    # Convert to serialized response schema
    serialized_cart = CartResponse.model_validate(cart)
    serialized_cart.subtotal = subtotal
    serialized_cart.total = total
    
    return serialized_cart.model_dump()


from datetime import datetime


@router.post("/add")
def add_to_cart(
    req: CartAddRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(
        Product.id == req.product_id,
        Product.is_active == True,
        Product.status == "active"
    ).first()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if product.stock_quantity < req.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {product.stock_quantity} units available in stock"
        )

    # Get or create cart
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        cart = Cart(user_id=current_user.id)
        db.add(cart)
        db.commit()
        db.refresh(cart)

    # Check if item already exists
    item = db.query(CartItem).filter(
        CartItem.cart_id == cart.id,
        CartItem.product_id == req.product_id
    ).first()

    current_price = product.discount_price if product.discount_price is not None else product.price

    if item:
        new_qty = item.quantity + req.quantity
        if product.stock_quantity < new_qty:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot add {req.quantity} more units. Total stock limit exceeded."
            )
        item.quantity = new_qty
        item.price = current_price
    else:
        item = CartItem(
            cart_id=cart.id,
            product_id=req.product_id,
            quantity=req.quantity,
            price=current_price
        )
        db.add(item)

    db.commit()

    cart_details = get_user_cart_details(db, current_user.id)
    return {
        "success": True,
        "message": "Product added to cart successfully",
        "data": cart_details
    }


@router.get("")
def get_cart(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cart_details = get_user_cart_details(db, current_user.id)
    return {
        "success": True,
        "message": "Cart retrieved successfully",
        "data": cart_details
    }


@router.put("/update/{item_id}")
def update_cart_quantity(
    item_id: int,
    req: CartUpdateRequest,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    item = db.query(CartItem).options(joinedload(CartItem.product)).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    # Validate stock quantity
    if item.product.stock_quantity < req.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Only {item.product.stock_quantity} units available in stock"
        )

    item.quantity = req.quantity
    db.commit()

    cart_details = get_user_cart_details(db, current_user.id)
    return {
        "success": True,
        "message": "Cart quantity updated successfully",
        "data": cart_details
    }


@router.delete("/remove/{item_id}")
def remove_from_cart(
    item_id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    cart = db.query(Cart).filter(Cart.user_id == current_user.id).first()
    if not cart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart not found"
        )

    item = db.query(CartItem).filter(
        CartItem.id == item_id,
        CartItem.cart_id == cart.id
    ).first()

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )

    db.delete(item)
    db.commit()

    cart_details = get_user_cart_details(db, current_user.id)
    return {
        "success": True,
        "message": "Cart item removed successfully",
        "data": cart_details
    }
