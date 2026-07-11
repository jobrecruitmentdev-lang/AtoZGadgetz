import os
import uuid
from fastapi import UploadFile, HTTPException, status

UPLOAD_DIR = os.path.join("app", "uploads")


def save_uploaded_file(file: UploadFile, subfolder: str) -> str:
    """
    Saves an UploadFile into the app/uploads/<subfolder> directory.
    Validates image formats and returns a relative file path suitable for DB storage.
    """
    # Validate extension
    file_ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file extension. Allowed: {', '.join(allowed_extensions)}"
        )

    # Ensure target directory exists
    target_path = os.path.join(UPLOAD_DIR, subfolder)
    if not os.path.exists(target_path):
        os.makedirs(target_path)

    # Generate a unique name
    unique_name = f"{uuid.uuid4().hex}{file_ext}"
    full_path = os.path.join(target_path, unique_name)

    try:
        # Read content and save it
        content = file.file.read()
        with open(full_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to write file to disk: {str(e)}"
        )

    # Return standard forward-slash path for URLs
    return f"uploads/{subfolder}/{unique_name}"
