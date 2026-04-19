import cloudinary
import cloudinary.uploader
from core.config import settings
from fastapi import UploadFile
import logging

def init_cloudinary():
    cloudinary.config(
        cloud_name = settings.cloudinary_cloud_name,
        api_key = settings.cloudinary_api_key,
        api_secret = settings.cloudinary_api_secret,
        secure=True
    )

async def upload_image_to_cloudinary(file: UploadFile, folder_name: str = "tiffin_meals") -> str:
    """Safely uploads an image blob string to Cloudinary CDN and returns the secure URL format."""
    if not settings.cloudinary_cloud_name or not settings.cloudinary_api_key:
        logging.warning("Cloudinary keys missing. Skipping remote upload.")
        return ""
    
    init_cloudinary()
    try:
        result = cloudinary.uploader.upload(file.file, folder=folder_name)
        return result.get("secure_url")
    except Exception as e:
        logging.error(f"Cloudinary strict upload failed: {e}")
        return ""
