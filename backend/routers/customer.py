from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from core.deps import get_current_user
from core.cloudinary_upload import upload_image_to_cloudinary
import models, schemas

router = APIRouter(prefix="/customer", tags=["Customer"])

def _get_or_create_profile(db: Session, user_id: int) -> models.CustomerProfile:
    profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == user_id).first()
    if not profile:
        profile = models.CustomerProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.get("/profile", response_model=schemas.CustomerProfileOut)
def get_customer_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return _get_or_create_profile(db, current_user.id)

@router.put("/profile", response_model=schemas.CustomerProfileOut)
def update_customer_profile(profile_in: schemas.CustomerProfileBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = _get_or_create_profile(db, current_user.id)
    profile.address = profile_in.address
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/profile/avatar", response_model=schemas.CustomerProfileOut)
async def upload_customer_avatar(
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    profile = _get_or_create_profile(db, current_user.id)
    url = await upload_image_to_cloudinary(avatar, folder_name="tiffin_customers")
    if url:
        profile.profile_picture_url = url
    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/profile/avatar", response_model=schemas.CustomerProfileOut)
def delete_customer_avatar(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    profile = _get_or_create_profile(db, current_user.id)
    profile.profile_picture_url = None
    db.commit()
    db.refresh(profile)
    return profile
