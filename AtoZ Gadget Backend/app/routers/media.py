import os
from fastapi import APIRouter, Depends, File, UploadFile, Query, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.connection import get_db
from app.dependencies.auth_dependency import get_current_user
from app.models.media import MediaFile
from app.schemas.media_schema import MediaFileResponse
from app.services.upload_service import save_uploaded_file
from app.services.audit_service import audit_service

router = APIRouter(
    prefix="/api/media",
    tags=["Media File Management"]
)

# Configuration limits
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_FOLDERS = ["products", "profiles", "blogs", "documents"]
ALLOWED_EXTENSIONS = {
    "products": [".jpg", ".jpeg", ".png", ".webp"],
    "profiles": [".jpg", ".jpeg", ".png", ".webp"],
    "blogs": [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    "documents": [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".txt"]
}


@router.post("/upload", response_model=None, status_code=status.HTTP_201_CREATED)
def upload_media_file(
    folder: str = Query(..., description="Target directory category"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Folder Validation
    if folder not in ALLOWED_FOLDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid folder. Allowed options: {', '.join(ALLOWED_FOLDERS)}"
        )

    # 2. File Size Validation
    # We read file size using seek/tell
    file.file.seek(0, os.SEEK_END)
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum size of {MAX_FILE_SIZE / (1024 * 1024):.0f}MB"
        )

    # 3. File Extension Validation
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = ALLOWED_EXTENSIONS[folder]
    if file_ext not in allowed_exts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type for folder '{folder}'. Allowed: {', '.join(allowed_exts)}"
        )

    # 4. Save File using the generic upload helper
    saved_path = save_uploaded_file(file, folder)

    # 5. Insert Database record
    db_media = MediaFile(
        user_id=current_user.id,
        file_name=file.filename,
        file_path=saved_path,
        file_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        folder=folder
    )
    db.add(db_media)
    db.commit()
    db.refresh(db_media)

    # Log audit logs
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Media",
        action="Upload",
        description=f"Uploaded file '{file.filename}' to folder '{folder}'",
        new_data=MediaFileResponse.model_validate(db_media).model_dump(mode="json")
    )

    return {
        "success": True,
        "message": "File uploaded and registered successfully",
        "data": MediaFileResponse.model_validate(db_media).model_dump()
    }


@router.get("", response_model=None)
def get_my_media_files(
    page: int = Query(1, ge=1),
    size: int = Query(15, ge=1, le=100),
    folder: Optional[str] = Query(None, description="Filter by folder type"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    skip = (page - 1) * size
    query = db.query(MediaFile)
    
    # Non-admins can only see their own uploads. Admins can see all.
    if current_user.role_id not in [1, 2]:
        query = query.filter(MediaFile.user_id == current_user.id)

    if folder:
        query = query.filter(MediaFile.folder == folder)

    total = query.count()
    items = query.order_by(MediaFile.created_at.desc()).offset(skip).limit(size).all()

    serialized = [MediaFileResponse.model_validate(i).model_dump() for i in items]
    return {
        "success": True,
        "message": "Media files list retrieved successfully",
        "data": {
            "items": serialized,
            "total": total,
            "page": page,
            "size": size
        }
    }


@router.delete("/{id}", response_model=None)
def delete_media_file(
    id: int,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    db_media = db.query(MediaFile).filter(MediaFile.id == id).first()
    if not db_media:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Media file record not found"
        )

    # Access control: only owner or administrator can delete
    if db_media.user_id != current_user.id and current_user.role_id not in [1, 2]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied to delete this file"
        )

    # 1. Unlink file from physical filesystem if it exists
    # Relativize target path. saved_path is 'uploads/folder/filename'.
    # In upload_service, UPLOAD_DIR is os.path.join('app', 'uploads')
    # So physical file path is os.path.join('app', db_media.file_path)
    file_path = os.path.join("app", db_media.file_path)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            # Continue deleting database record anyway
            pass

    old_data = MediaFileResponse.model_validate(db_media).model_dump(mode="json")

    # 2. Delete database record
    db.delete(db_media)
    db.commit()

    # Log audit logs
    audit_service.log_activity(
        db,
        user_id=current_user.id,
        module="Media",
        action="Delete",
        description=f"Deleted file '{db_media.file_name}' from folder '{db_media.folder}'",
        old_data=old_data
    )

    return {
        "success": True,
        "message": "Media file unlinked and deleted successfully",
        "data": {}
    }
