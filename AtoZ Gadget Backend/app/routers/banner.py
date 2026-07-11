from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, Form, File, UploadFile, HTTPException, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.dependencies.auth_dependency import require_permission
from app.models.banner import Banner
from app.schemas.banner_schema import BannerResponse
from app.services.upload_service import save_uploaded_file
from app.services.audit_service import audit_service

router = APIRouter(
    tags=["Banner Management"]
)


@router.get("/api/banners")
def get_active_banners(db: Session = Depends(get_db)):
    now = datetime.now()
    banners = db.query(Banner).filter(
        Banner.status == "active",
        Banner.start_date <= now,
        Banner.end_date >= now
    ).order_by(Banner.sort_order.asc()).all()

    return {
        "success": True,
        "message": "Banners retrieved successfully",
        "data": [BannerResponse.model_validate(b).model_dump() for b in banners]
    }


@router.post("/api/admin/banners", status_code=status.HTTP_201_CREATED)
def admin_create_banner(
    title: str = Form(...),
    position: str = Form(...),  # "Homepage Slider", "Category Banner", "Product Banner"
    redirect_url: Optional[str] = Form(None),
    sort_order: int = Form(0),
    status_val: str = Form("active", alias="status"),
    start_date: str = Form(...),
    end_date: str = Form(...),
    image_file: UploadFile = File(...),
    mobile_image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    # Parse dates
    try:
        parsed_start = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        parsed_end = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Use ISO 8601 format (YYYY-MM-DDTHH:MM:SS)"
        )

    # Validate position
    if position not in ["Homepage Slider", "Category Banner", "Product Banner"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Position must be 'Homepage Slider', 'Category Banner', or 'Product Banner'"
        )

    # Save files
    img_path = save_uploaded_file(image_file, "banners")
    mobile_img_path = save_uploaded_file(mobile_image_file, "banners") if mobile_image_file else None

    db_banner = Banner(
        title=title,
        image=img_path,
        mobile_image=mobile_img_path,
        redirect_url=redirect_url,
        position=position,
        sort_order=sort_order,
        status=status_val,
        start_date=parsed_start,
        end_date=parsed_end
    )
    db.add(db_banner)
    db.commit()
    db.refresh(db_banner)

    # Log audit activity
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Banner",
        action="Create",
        description=f"Banner '{title}' created",
        new_data=BannerResponse.model_validate(db_banner).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "Banner created successfully",
        "data": BannerResponse.model_validate(db_banner).model_dump()
    }


@router.put("/api/admin/banners/{id}")
def admin_update_banner(
    id: int,
    title: Optional[str] = Form(None),
    position: Optional[str] = Form(None),
    redirect_url: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(None),
    status_val: Optional[str] = Form(None, alias="status"),
    start_date: Optional[str] = Form(None),
    end_date: Optional[str] = Form(None),
    image_file: Optional[UploadFile] = File(None),
    mobile_image_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    db_banner = db.query(Banner).filter(Banner.id == id).first()
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )

    old_data = BannerResponse.model_validate(db_banner).model_dump(mode="json")

    # Update simple fields
    if title is not None:
        db_banner.title = title
    if position is not None:
        if position not in ["Homepage Slider", "Category Banner", "Product Banner"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Position must be 'Homepage Slider', 'Category Banner', or 'Product Banner'"
            )
        db_banner.position = position
    if redirect_url is not None:
        db_banner.redirect_url = redirect_url
    if sort_order is not None:
        db_banner.sort_order = sort_order
    if status_val is not None:
        db_banner.status = status_val

    # Parse and update dates if present
    if start_date is not None:
        try:
            db_banner.start_date = datetime.fromisoformat(start_date.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid start_date format."
            )
    if end_date is not None:
        try:
            db_banner.end_date = datetime.fromisoformat(end_date.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid end_date format."
            )

    # Save replacement files
    if image_file is not None:
        db_banner.image = save_uploaded_file(image_file, "banners")
    if mobile_image_file is not None:
        db_banner.mobile_image = save_uploaded_file(mobile_image_file, "banners")

    db.commit()
    db.refresh(db_banner)

    # Log audit activity
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Banner",
        action="Update",
        description=f"Banner '{db_banner.title}' updated",
        old_data=old_data,
        new_data=BannerResponse.model_validate(db_banner).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "Banner updated successfully",
        "data": BannerResponse.model_validate(db_banner).model_dump()
    }


@router.delete("/api/admin/banners/{id}")
def admin_delete_banner(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(require_permission("banner.manage"))
):
    db_banner = db.query(Banner).filter(Banner.id == id).first()
    if not db_banner:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Banner not found"
        )

    old_data = BannerResponse.model_validate(db_banner).model_dump(mode="json")
    
    db.delete(db_banner)
    db.commit()

    # Log audit activity
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Banner",
        action="Delete",
        description=f"Banner '{db_banner.title}' deleted",
        old_data=old_data
    )

    return {
        "success": True,
        "message": "Banner deleted successfully",
        "data": {}
    }
