"""
Image Processing Service
========================
Handles image resizing, compression, WebP conversion,
and thumbnail generation using Pillow.

Thumbnail sizes generated automatically on upload:
  - thumb:  150×150  (product grid cards)
  - medium: 400×400  (product detail)
  - large:  800×800  (zoom / full view)
"""
import os
import io
import uuid
import logging
from typing import Optional, Tuple, Dict
from pathlib import Path

logger = logging.getLogger(__name__)

# Output quality (JPEG/WebP)
JPEG_QUALITY = 85
WEBP_QUALITY = 82

THUMBNAIL_SIZES = {
    "thumb":  (150, 150),
    "medium": (400, 400),
    "large":  (800, 800),
}

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp"}


def _get_pil():
    """Lazy import Pillow."""
    try:
        from PIL import Image, ImageOps
        return Image, ImageOps
    except ImportError:
        raise RuntimeError(
            "Pillow not installed. Run: pip install Pillow"
        )


class ImageService:

    # ─────────────────────────────────────────────
    # PROCESS UPLOADED IMAGE
    # ─────────────────────────────────────────────
    def process_upload(
        self,
        file_bytes: bytes,
        original_filename: str,
        upload_dir: str,
        convert_to_webp: bool = True,
        generate_thumbnails: bool = True,
    ) -> Dict[str, str]:
        """
        Process an uploaded image:
          1. Validate it is a real image
          2. Auto-orient (fix EXIF rotation)
          3. Convert to WebP (optional)
          4. Save original (compressed)
          5. Generate thumbnails
        
        Returns dict of {size_name: relative_path}
        """
        Image, ImageOps = _get_pil()

        ext = Path(original_filename).suffix.lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise ValueError(f"Unsupported image format: {ext}")

        try:
            img = Image.open(io.BytesIO(file_bytes))
        except Exception:
            raise ValueError("Invalid or corrupted image file")

        # Auto-orient based on EXIF data
        img = ImageOps.exif_transpose(img)

        # Convert RGBA / P modes to RGB for JPEG/WebP compatibility
        if img.mode in ("RGBA", "P", "LA"):
            background = Image.new("RGB", img.size, (255, 255, 255))
            if img.mode == "P":
                img = img.convert("RGBA")
            background.paste(img, mask=img.split()[-1] if img.mode in ("RGBA", "LA") else None)
            img = background
        elif img.mode != "RGB":
            img = img.convert("RGB")

        # Generate unique base name
        unique_name = uuid.uuid4().hex
        output_ext = ".webp" if convert_to_webp else ".jpg"
        save_format = "WEBP" if convert_to_webp else "JPEG"
        save_params = {"quality": WEBP_QUALITY if convert_to_webp else JPEG_QUALITY, "optimize": True}

        os.makedirs(upload_dir, exist_ok=True)
        saved_paths: Dict[str, str] = {}

        # Save original (full size, compressed)
        orig_filename = f"{unique_name}_original{output_ext}"
        orig_path = os.path.join(upload_dir, orig_filename)
        img.save(orig_path, save_format, **save_params)
        saved_paths["original"] = orig_path

        # Generate thumbnails
        if generate_thumbnails:
            for size_name, (w, h) in THUMBNAIL_SIZES.items():
                thumb_img = img.copy()
                thumb_img.thumbnail((w, h), Image.LANCZOS)

                # Pad to exact dimensions for uniform grid layouts
                canvas = Image.new("RGB", (w, h), (255, 255, 255))
                offset = ((w - thumb_img.width) // 2, (h - thumb_img.height) // 2)
                canvas.paste(thumb_img, offset)

                thumb_filename = f"{unique_name}_{size_name}{output_ext}"
                thumb_path = os.path.join(upload_dir, thumb_filename)
                canvas.save(thumb_path, save_format, **save_params)
                saved_paths[size_name] = thumb_path

        return saved_paths

    # ─────────────────────────────────────────────
    # COMPRESS EXISTING FILE
    # ─────────────────────────────────────────────
    def compress_image(self, input_path: str, output_path: Optional[str] = None, quality: int = 85) -> str:
        """Compress an existing image file in place or to output_path."""
        Image, ImageOps = _get_pil()

        img = Image.open(input_path)
        img = ImageOps.exif_transpose(img)

        if img.mode != "RGB":
            img = img.convert("RGB")

        target = output_path or input_path
        ext = Path(target).suffix.lower()
        fmt = "WEBP" if ext == ".webp" else "JPEG"
        img.save(target, fmt, quality=quality, optimize=True)
        return target

    # ─────────────────────────────────────────────
    # CONVERT TO WEBP
    # ─────────────────────────────────────────────
    def convert_to_webp(self, input_path: str) -> str:
        """Convert any image to WebP format. Returns new path."""
        Image, _ = _get_pil()
        output_path = str(Path(input_path).with_suffix(".webp"))
        img = Image.open(input_path).convert("RGB")
        img.save(output_path, "WEBP", quality=WEBP_QUALITY, optimize=True)
        return output_path

    # ─────────────────────────────────────────────
    # GET IMAGE INFO
    # ─────────────────────────────────────────────
    def get_image_info(self, file_path: str) -> Dict:
        """Return image metadata: dimensions, format, file size."""
        Image, _ = _get_pil()
        img = Image.open(file_path)
        file_size = os.path.getsize(file_path)
        return {
            "width": img.width,
            "height": img.height,
            "format": img.format,
            "mode": img.mode,
            "file_size_bytes": file_size,
            "file_size_kb": round(file_size / 1024, 2),
        }


image_service = ImageService()
