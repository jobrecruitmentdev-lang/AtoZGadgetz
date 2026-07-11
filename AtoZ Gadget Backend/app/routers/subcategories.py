from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_admin_or_super_admin
from app.schemas.subcategory_schema import SubCategoryCreate, SubCategoryUpdate, SubCategoryResponse
from app.services.catalog_service import catalog_service

router = APIRouter(
    prefix="/api/subcategories",
    tags=["SubCategory Management"]
)


@router.post("", status_code=status.HTTP_201_CREATED)
def create_subcategory(
    sub_in: SubCategoryCreate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    sub = catalog_service.create_subcategory(db, sub_in)
    return {
        "success": True,
        "message": "SubCategory created successfully",
        "data": SubCategoryResponse.model_validate(sub).model_dump()
    }


@router.get("")
def get_subcategories(
    db: Session = Depends(get_db)
):
    subs = catalog_service.get_subcategories(db)
    items = [SubCategoryResponse.model_validate(sub).model_dump() for sub in subs]
    return {
        "success": True,
        "message": "SubCategories retrieved successfully",
        "data": items
    }


@router.get("/{id}")
def get_subcategory(
    id: int,
    db: Session = Depends(get_db)
):
    sub = catalog_service.get_subcategory_by_id(db, id)
    return {
        "success": True,
        "message": "SubCategory retrieved successfully",
        "data": SubCategoryResponse.model_validate(sub).model_dump()
    }


@router.put("/{id}")
def update_subcategory(
    id: int,
    sub_in: SubCategoryUpdate,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    sub = catalog_service.update_subcategory(db, id, sub_in)
    return {
        "success": True,
        "message": "SubCategory updated successfully",
        "data": SubCategoryResponse.model_validate(sub).model_dump()
    }


@router.delete("/{id}")
def delete_subcategory(
    id: int,
    db: Session = Depends(get_db),
    _ = Depends(require_admin_or_super_admin)
):
    catalog_service.delete_subcategory(db, id)
    return {
        "success": True,
        "message": "SubCategory deleted successfully",
        "data": {}
    }
