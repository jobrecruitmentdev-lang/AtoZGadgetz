import math
from typing import Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc

from app.database.connection import get_db
from app.models.product import Product
from app.models.category import Category
from app.models.subcategory import SubCategory
from app.models.brand import Brand
from app.models.product_attribute import ProductAttribute
from app.schemas.product_schema import ProductResponse

from app.services.cache_service import cached

router = APIRouter(
    tags=["Store Catalog"]
)


@router.get("/api/store/products")
@cached(ttl=60, prefix="store")
def get_store_products(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    subcategory_id: Optional[int] = Query(None),
    brand_id: Optional[int] = Query(None),
    price_min: Optional[Decimal] = Query(None),
    price_max: Optional[Decimal] = Query(None),
    sort_by: str = Query("latest", description="latest, price_low_high, price_high_low, popular"),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size

    # Pre-load relationships using joinedload to prevent N+1 queries
    query = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.subcategory),
        joinedload(Product.brand),
        joinedload(Product.images)
    )

    # Search filter
    if search:
        search_pat = f"%{search}%"
        query = query.filter(
            or_(
                Product.name.like(search_pat),
                Product.short_description.like(search_pat),
                Product.sku.like(search_pat)
            )
        )

    # Category, Subcategory, Brand filters
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    if subcategory_id is not None:
        query = query.filter(Product.subcategory_id == subcategory_id)
    if brand_id is not None:
        query = query.filter(Product.brand_id == brand_id)

    # Price range filters
    if price_min is not None:
        query = query.filter(Product.price >= price_min)
    if price_max is not None:
        query = query.filter(Product.price <= price_max)

    # Status filter (Only active products shown in catalog)
    query = query.filter(Product.is_active == True, Product.status == "active")

    # Sorting options
    if sort_by == "price_low_high":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_high_low":
        query = query.order_by(desc(Product.price))
    elif sort_by == "popular":
        query = query.order_by(desc(Product.is_featured), desc(Product.created_at))
    else:  # "latest" or fallback
        query = query.order_by(desc(Product.created_at))

    total = query.count()
    prods = query.offset(skip).limit(size).all()
    pages = math.ceil(total / size) if total > 0 else 0

    items = []
    for p in prods:
        # Map ratings placeholders
        p_dict = ProductResponse.model_validate(p).model_dump()
        p_dict["rating_placeholder"] = 4.5  # Static rating placeholder for Phase 3 catalog requirements
        p_dict["stock_status"] = "in_stock" if p.stock_quantity > 0 else "out_of_stock"
        items.append(p_dict)

    return {
        "success": True,
        "message": "Products retrieved successfully",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
    }


@router.get("/api/store/products/{slug}")
def get_store_product_detail(
    slug: str,
    db: Session = Depends(get_db)
):
    # Optimize query load
    prod = db.query(Product).options(
        joinedload(Product.category),
        joinedload(Product.subcategory),
        joinedload(Product.brand),
        joinedload(Product.images),
        joinedload(Product.variants),
        joinedload(Product.attributes).joinedload(ProductAttribute.attribute)
    ).filter(Product.slug == slug, Product.is_active == True, Product.status == "active").first()

    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Fetch related products (limit 4, from same category/subcategory, excluding self)
    related = db.query(Product).filter(
        Product.category_id == prod.category_id,
        Product.id != prod.id,
        Product.is_active == True,
        Product.status == "active"
    ).limit(4).all()

    related_items = [ProductResponse.model_validate(r).model_dump() for r in related]
    prod_data = ProductResponse.model_validate(prod).model_dump()

    return {
        "success": True,
        "message": "Product detail retrieved successfully",
        "data": {
            "product": prod_data,
            "related_products": related_items
        }
    }


@router.get("/api/search/products")
def search_products(
    search: str = Query(..., min_length=1),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size

    # Join category and brand tables to allow searching across their fields
    query = db.query(Product).outerjoin(
        Category, Product.category_id == Category.id
    ).outerjoin(
        Brand, Product.brand_id == Brand.id
    ).options(
        joinedload(Product.category),
        joinedload(Product.subcategory),
        joinedload(Product.brand),
        joinedload(Product.images)
    )

    search_pat = f"%{search}%"
    query = query.filter(
        or_(
            Product.name.like(search_pat),
            Product.sku.like(search_pat),
            Category.name.like(search_pat),
            Brand.name.like(search_pat)
        ),
        Product.is_active == True,
        Product.status == "active"
    )

    total = query.count()
    prods = query.offset(skip).limit(size).all()
    pages = math.ceil(total / size) if total > 0 else 0

    items = [ProductResponse.model_validate(p).model_dump() for p in prods]

    return {
        "success": True,
        "message": "Search completed",
        "data": {
            "items": items,
            "total": total,
            "page": page,
            "size": size,
            "pages": pages
        }
    }
