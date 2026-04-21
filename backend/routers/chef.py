from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import secrets
from database import get_db
import models, schemas
from core.deps import get_current_active_chef
from core.cloudinary_upload import upload_image_to_cloudinary

router = APIRouter(prefix="/chef", tags=["Chef"])

@router.get("/profile", response_model=schemas.ChefProfileOut)
def get_chef_profile(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.ChefProfile(user_id=current_user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile

@router.put("/profile", response_model=schemas.ChefProfileOut)
def update_chef_profile(profile_in: schemas.ChefProfileBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.ChefProfile(user_id=current_user.id)
        db.add(profile)
    
    # Safely transpose values
    for key, value in profile_in.model_dump().items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

@router.post("/profile/images", response_model=schemas.ChefProfileOut)
async def upload_profile_images(
    profile_picture: Optional[UploadFile] = File(None),
    cover_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_chef)
):
    profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == current_user.id).first()
    if not profile:
        profile = models.ChefProfile(user_id=current_user.id)
        db.add(profile)

    if profile_picture:
        url = await upload_image_to_cloudinary(profile_picture, folder_name="tiffin_profiles")
        if url: profile.profile_picture_url = url
        
    if cover_image:
        url = await upload_image_to_cloudinary(cover_image, folder_name="tiffin_covers")
        if url: profile.cover_image_url = url

    db.commit()
    db.refresh(profile)
    return profile

@router.delete("/profile/images", response_model=schemas.ChefProfileOut)
def delete_profile_images(
    target: str,  # "avatar", "cover", or "both"
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_chef)
):
    profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    if target in ("avatar", "both"):
        profile.profile_picture_url = None
    if target in ("cover", "both"):
        profile.cover_image_url = None

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/menus", response_model=List[schemas.MenuItemOut])
def get_menus(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    menus = db.query(models.MenuItem).filter(models.MenuItem.chef_id == current_user.id).all()
    return menus

@router.post("/menus", response_model=schemas.MenuItemOut)
async def create_menu(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    is_active: bool = Form(True),
    spice_level: int = Form(1),
    is_veg: bool = Form(True),
    is_combo: bool = Form(False),
    price: float = Form(0.0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_chef)
):
    image_url = None
    if image:
        image_url = await upload_image_to_cloudinary(image, folder_name="tiffin_meals")

    new_item = models.MenuItem(
        chef_id=current_user.id,
        name=name,
        description=description,
        is_active=is_active,
        spice_level=spice_level,
        is_veg=is_veg,
        is_combo=is_combo,
        price=price,
        image_url=image_url
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.delete("/menus/{menu_id}")
def delete_menu(menu_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_id, models.MenuItem.chef_id == current_user.id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Meal not found")
    
    db.delete(menu_item)
    db.commit()
    return {"message": "Success"}

@router.patch("/menus/{menu_id}/toggle", response_model=schemas.MenuItemOut)
def toggle_menu_active(menu_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_id, models.MenuItem.chef_id == current_user.id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Meal not found")
    menu_item.is_active = not menu_item.is_active
    db.commit()
    db.refresh(menu_item)
    return menu_item

@router.patch("/menus/{menu_id}/toggle", response_model=schemas.MenuItemOut)
def toggle_menu_active(menu_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    menu_item = db.query(models.MenuItem).filter(models.MenuItem.id == menu_id, models.MenuItem.chef_id == current_user.id).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Meal not found")
    menu_item.is_active = not menu_item.is_active
    db.commit()
    db.refresh(menu_item)
    return menu_item

@router.get("/plans", response_model=List[schemas.PricingPlanOut])
def get_plans(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    plans = db.query(models.PricingPlan).filter(models.PricingPlan.chef_id == current_user.id).all()
    return plans

@router.post("/plans", response_model=schemas.PricingPlanOut)
def create_plan(plan_in: schemas.PricingPlanBase, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_active_chef)):
    new_plan = models.PricingPlan(
        chef_id=current_user.id,
        plan_type=plan_in.plan_type,
        price=plan_in.price,
        description=plan_in.description
    )
    db.add(new_plan)
    db.commit()
    db.refresh(new_plan)
    return new_plan
