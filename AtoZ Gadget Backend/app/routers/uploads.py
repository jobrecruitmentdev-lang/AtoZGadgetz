from fastapi import APIRouter, Depends, UploadFile, File, Query, HTTPException, status

from app.dependencies.auth_dependency import require_admin_or_super_admin
from app.services.upload_service import save_uploaded_file

router = APIRouter(
    prefix="/api/uploads",
    tags=["Image Upload System"]
)


@router.post("")
def upload_file(
    file: UploadFile = File(...),
    type: str = Query(..., description="Upload type: 'products', 'categories', or 'brands'"),
    _ = Depends(require_admin_or_super_admin)
):
    if type not in ["products", "categories", "brands"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Type must be one of: 'products', 'categories', 'brands'"
        )

    file_path = save_uploaded_file(file, type)

    return {
        "success": True,
        "message": "File uploaded successfully",
        "data": {
            "file_path": file_path
        }
    }
