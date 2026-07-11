from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.models.homepage import HomepageSection, FeaturedProduct
from app.schemas.homepage_schema import (
    HomepageSectionCreate,
    HomepageSectionResponse,
    FeaturedProductCreate,
    FeaturedProductResponse
)
from app.services.audit_service import audit_service

router = APIRouter(
    tags=["Homepage CMS System"]
)


@router.post("/api/admin/homepage-sections", status_code=status.HTTP_201_CREATED)
def admin_create_homepage_section(
    req: HomepageSectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    section = HomepageSection(
        title=req.title,
        section_type=req.section_type,
        sort_order=req.sort_order,
        status=req.status or "active"
    )
    db.add(section)
    db.commit()
    db.refresh(section)

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Homepage CMS",
        action="Create",
        description=f"Homepage section '{req.title}' created",
        new_data=HomepageSectionResponse.model_validate(section).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "Homepage section created successfully",
        "data": HomepageSectionResponse.model_validate(section).model_dump()
    }


@router.get("/api/homepage-sections")
def get_homepage_sections(db: Session = Depends(get_db)):
    sections = db.query(HomepageSection).options(
        joinedload(HomepageSection.featured_products).joinedload(FeaturedProduct.product)
    ).filter(
        HomepageSection.status == "active"
    ).order_by(HomepageSection.sort_order.asc()).all()

    return {
        "success": True,
        "message": "Homepage sections retrieved successfully",
        "data": [HomepageSectionResponse.model_validate(s).model_dump() for s in sections]
    }


@router.put("/api/admin/homepage-sections/{id}")
def admin_update_homepage_section(
    id: int,
    req: HomepageSectionCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    section = db.query(HomepageSection).filter(HomepageSection.id == id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Homepage section not found"
        )

    old_data = HomepageSectionResponse.model_validate(section).model_dump(mode="json")

    section.title = req.title
    section.section_type = req.section_type
    section.sort_order = req.sort_order
    if req.status is not None:
        section.status = req.status

    db.commit()
    db.refresh(section)

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Homepage CMS",
        action="Update",
        description=f"Homepage section '{section.title}' updated",
        old_data=old_data,
        new_data=HomepageSectionResponse.model_validate(section).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "Homepage section updated successfully",
        "data": HomepageSectionResponse.model_validate(section).model_dump()
    }


@router.delete("/api/admin/homepage-sections/{id}")
def admin_delete_homepage_section(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    section = db.query(HomepageSection).filter(HomepageSection.id == id).first()
    if not section:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Homepage section not found"
        )

    old_data = HomepageSectionResponse.model_validate(section).model_dump(mode="json")

    db.delete(section)
    db.commit()

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Homepage CMS",
        action="Delete",
        description=f"Homepage section '{section.title}' deleted",
        old_data=old_data
    )

    return {
        "success": True,
        "message": "Homepage section deleted successfully",
        "data": {}
    }


# --- FEATURED PRODUCT CMS ---

@router.post("/api/admin/featured-products", status_code=status.HTTP_201_CREATED)
def admin_add_featured_product(
    req: FeaturedProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    # Verify section
    sec = db.query(HomepageSection).filter(HomepageSection.id == req.section_id).first()
    if not sec:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target homepage section does not exist"
        )

    # Check duplicate
    dup = db.query(FeaturedProduct).filter(
        FeaturedProduct.section_id == req.section_id,
        FeaturedProduct.product_id == req.product_id
    ).first()
    if dup:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product already featured in this section"
        )

    fp = FeaturedProduct(
        product_id=req.product_id,
        section_id=req.section_id,
        sort_order=req.sort_order
    )
    db.add(fp)
    db.commit()
    db.refresh(fp)

    # Fetch loaded record
    loaded_fp = db.query(FeaturedProduct).options(
        joinedload(FeaturedProduct.product)
    ).filter(FeaturedProduct.id == fp.id).first()

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Homepage CMS",
        action="Featured Product Link",
        description=f"Product ID {req.product_id} added to section '{sec.title}'",
        new_data=FeaturedProductResponse.model_validate(loaded_fp).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "Product featured in homepage section successfully",
        "data": FeaturedProductResponse.model_validate(loaded_fp).model_dump()
    }


@router.get("/api/featured-products")
def get_all_featured_products(db: Session = Depends(get_db)):
    fps = db.query(FeaturedProduct).options(joinedload(FeaturedProduct.product)).all()
    return {
        "success": True,
        "message": "Featured products retrieved successfully",
        "data": [FeaturedProductResponse.model_validate(f).model_dump() for f in fps]
    }


@router.delete("/api/admin/featured-products/{id}")
def admin_remove_featured_product(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    fp = db.query(FeaturedProduct).options(joinedload(FeaturedProduct.product)).filter(FeaturedProduct.id == id).first()
    if not fp:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Featured product association not found"
        )

    old_data = FeaturedProductResponse.model_validate(fp).model_dump(mode="json")
    db.delete(fp)
    db.commit()

    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Homepage CMS",
        action="Featured Product Unlink",
        description=f"Featured association ID {id} removed",
        old_data=old_data
    )

    return {
        "success": True,
        "message": "Product removed from homepage section",
        "data": {}
    }
