from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_admin_or_super_admin
from app.schemas.brand_schema import BrandCreate, BrandUpdate, BrandResponse
from app.services.catalog_service import catalog_service

router = APIRouter(
    prefix="/api/brands",
    tags=["Brand Management"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_brand(
    brand_in: BrandCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    brand = catalog_service.create_brand(db, brand_in)
    return {
        "success": True,
        "message": "Brand created successfully",
        "data": BrandResponse.model_validate(brand).model_dump()
    }


@router.get("")
def get_brands(
    db: Session = Depends(get_db)
):
    brands = catalog_service.get_brands(db)
    items = [BrandResponse.model_validate(brand).model_dump() for brand in brands]
    return {
        "success": True,
        "message": "Brands retrieved successfully",
        "data": items
    }


@router.get("/{id}")
def get_brand(
    id: int,
    db: Session = Depends(get_db)
):
    brand = catalog_service.get_brand_by_id(db, id)
    return {
        "success": True,
        "message": "Brand retrieved successfully",
        "data": BrandResponse.model_validate(brand).model_dump()
    }


@router.put("/{id}")
def update_brand(
    id: int,
    brand_in: BrandUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    brand = catalog_service.update_brand(db, id, brand_in)
    return {
        "success": True,
        "message": "Brand updated successfully",
        "data": BrandResponse.model_validate(brand).model_dump()
    }


@router.delete("/{id}")
def delete_brand(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    catalog_service.delete_brand(db, id)
    return {
        "success": True,
        "message": "Brand deleted successfully",
        "data": {}
    }
