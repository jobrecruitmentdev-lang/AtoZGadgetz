from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_admin_or_super_admin
from app.schemas.category_schema import CategoryCreate, CategoryUpdate, CategoryResponse
from app.services.catalog_service import catalog_service
from app.services.cache_service import cached, invalidate_cache

router = APIRouter(
    prefix="/api/categories",
    tags=["Category Management"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_category(
    cat_in: CategoryCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    cat = catalog_service.create_category(db, cat_in)
    invalidate_cache("categories")
    return {
        "success": True,
        "message": "Category created successfully",
        "data": CategoryResponse.model_validate(cat).model_dump()
    }


@router.get("")
@cached(ttl=300, prefix="categories")
def get_categories(
    db: Session = Depends(get_db)
):
    cats = catalog_service.get_categories(db)
    items = [CategoryResponse.model_validate(cat).model_dump() for cat in cats]
    return {
        "success": True,
        "message": "Categories retrieved successfully",
        "data": items
    }


@router.get("/{id}")
def get_category(
    id: int,
    db: Session = Depends(get_db)
):
    cat = catalog_service.get_category_by_id(db, id)
    return {
        "success": True,
        "message": "Category retrieved successfully",
        "data": CategoryResponse.model_validate(cat).model_dump()
    }


@router.put("/{id}")
def update_category(
    id: int,
    cat_in: CategoryUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    cat = catalog_service.update_category(db, id, cat_in)
    invalidate_cache("categories")
    return {
        "success": True,
        "message": "Category updated successfully",
        "data": CategoryResponse.model_validate(cat).model_dump()
    }


@router.delete("/{id}")
def delete_category(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    catalog_service.delete_category(db, id)
    invalidate_cache("categories")
    return {
        "success": True,
        "message": "Category deleted successfully",
        "data": {}
    }
