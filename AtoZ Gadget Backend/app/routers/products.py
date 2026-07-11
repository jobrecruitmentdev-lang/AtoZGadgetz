import math
from typing import Optional
from fastapi import APIRouter, Depends, status, Query, HTTPException
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user, require_admin_or_super_admin
from app.schemas.product_schema import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductImageCreate,
    ProductImageResponse,
    ProductVariantCreate,
    ProductVariantResponse,
    ProductAttributeCreate,
    ProductAttributeResponse
)
from app.services.product_service import product_service
from app.services.audit_service import audit_service
from app.services.cache_service import invalidate_cache

router = APIRouter(
    tags=["Product Management"]
)


# --- MAIN PRODUCT CRUD ---

@router.post("/api/products", status_code=status.HTTP_201_CREATED)
def create_product(
    prod_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    prod = product_service.create_product(db, prod_in, current_user.id)
    invalidate_cache("store")
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Product",
        action="Create",
        description=f"Product '{prod.name}' (SKU: {prod.sku}) created",
        new_data=ProductResponse.model_validate(prod).model_dump(mode="json")
    )
    return {
        "success": True,
        "message": "Product created successfully",
        "data": ProductResponse.model_validate(prod).model_dump()
    }


@router.get("/api/products")
def get_products(
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=100),
    search: Optional[str] = Query(None),
    category_id: Optional[int] = Query(None),
    brand_id: Optional[int] = Query(None),
    status_filter: Optional[str] = Query(None),
    sort_price: Optional[str] = Query(None),  # "asc" or "desc"
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    prods, total = product_service.get_products_paginated(
        db,
        skip=skip,
        limit=size,
        search=search,
        category_id=category_id,
        brand_id=brand_id,
        status_filter=status_filter,
        sort_price=sort_price
    )
    pages = math.ceil(total / size) if total > 0 else 0
    items = [ProductResponse.model_validate(prod).model_dump() for prod in prods]
    
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


@router.get("/api/products/{id}")
def get_product(
    id: int,
    db: Session = Depends(get_db)
):
    prod = product_service.get_product_by_id(db, id)
    return {
        "success": True,
        "message": "Product retrieved successfully",
        "data": ProductResponse.model_validate(prod).model_dump()
    }


@router.put("/api/products/{id}")
def update_product(
    id: int,
    prod_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    old_prod = product_service.get_product_by_id(db, id)
    old_data = ProductResponse.model_validate(old_prod).model_dump(mode="json")
    
    prod = product_service.update_product(db, id, prod_in)
    invalidate_cache("store")
    new_data = ProductResponse.model_validate(prod).model_dump(mode="json")
    
    # Check if price changed
    action = "Update"
    if old_prod.price != prod.price or old_prod.discount_price != prod.discount_price:
        action = "Price Change"
        
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Product",
        action=action,
        description=f"Product '{prod.name}' updated",
        old_data=old_data,
        new_data=new_data
    )
    return {
        "success": True,
        "message": "Product updated successfully",
        "data": ProductResponse.model_validate(prod).model_dump()
    }


@router.delete("/api/products/{id}")
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_admin_or_super_admin)
):
    old_prod = product_service.get_product_by_id(db, id)
    old_data = ProductResponse.model_validate(old_prod).model_dump(mode="json")
    
    product_service.delete_product(db, id)
    invalidate_cache("store")
    
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Product",
        action="Delete",
        description=f"Product '{old_prod.name}' deleted",
        old_data=old_data
    )
    return {
        "success": True,
        "message": "Product deleted successfully",
        "data": {}
    }


# --- PRODUCT IMAGE SYSTEM ---

@router.post("/api/products/{id}/images", status_code=status.HTTP_201_CREATED)
def upload_product_image(
    id: int,
    img_in: ProductImageCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    img = product_service.add_product_image(db, id, img_in)
    return {
        "success": True,
        "message": "Product image uploaded successfully",
        "data": ProductImageResponse.model_validate(img).model_dump()
    }


@router.get("/api/products/{id}/images")
def get_product_images(
    id: int,
    db: Session = Depends(get_db)
):
    images = product_service.get_product_images(db, id)
    items = [ProductImageResponse.model_validate(img).model_dump() for img in images]
    return {
        "success": True,
        "message": "Product images retrieved successfully",
        "data": items
    }


@router.delete("/api/product-images/{id}")
def delete_product_image(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    product_service.delete_product_image(db, id)
    return {
        "success": True,
        "message": "Product image deleted successfully",
        "data": {}
    }


# --- PRODUCT VARIANT SYSTEM ---

@router.post("/api/products/{id}/variants", status_code=status.HTTP_201_CREATED)
def create_product_variant(
    id: int,
    var_in: ProductVariantCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    var = product_service.add_product_variant(db, id, var_in)
    return {
        "success": True,
        "message": "Product variant created successfully",
        "data": ProductVariantResponse.model_validate(var).model_dump()
    }


@router.get("/api/products/{id}/variants")
def get_product_variants(
    id: int,
    db: Session = Depends(get_db)
):
    variants = product_service.get_product_variants(db, id)
    items = [ProductVariantResponse.model_validate(var).model_dump() for var in variants]
    return {
        "success": True,
        "message": "Product variants retrieved successfully",
        "data": items
    }


@router.delete("/api/product-variants/{id}")
def delete_product_variant(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    product_service.delete_product_variant(db, id)
    return {
        "success": True,
        "message": "Product variant deleted successfully",
        "data": {}
    }


# --- PRODUCT ATTRIBUTE SYSTEM ---

@router.post("/api/products/{id}/attributes", status_code=status.HTTP_201_CREATED)
def add_product_attribute(
    id: int,
    attr_in: ProductAttributeCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    attr = product_service.add_product_attribute(db, id, attr_in)
    return {
        "success": True,
        "message": "Product attribute added successfully",
        "data": ProductAttributeResponse.model_validate(attr).model_dump()
    }


@router.get("/api/products/{id}/attributes")
def get_product_attributes(
    id: int,
    db: Session = Depends(get_db)
):
    attrs = product_service.get_product_attributes(db, id)
    items = [ProductAttributeResponse.model_validate(attr).model_dump() for attr in attrs]
    return {
        "success": True,
        "message": "Product attributes retrieved successfully",
        "data": items
    }


@router.delete("/api/product-attributes/{id}")
def delete_product_attribute(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    product_service.delete_product_attribute(db, id)
    return {
        "success": True,
        "message": "Product attribute deleted successfully",
        "data": {}
    }
