from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import secrets
from database import get_db
import models, schemas
from core.deps import get_current_active_chef

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
    
    profile.bio = profile_in.bio
    profile.delivery_available = profile_in.delivery_available
    profile.base_delivery_price = profile_in.base_delivery_price
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
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_chef)
):
    image_url = None
    if image:
        ext = image.filename.split('.')[-1]
        filename = f"{secrets.token_hex(8)}.{ext}"
        filepath = os.path.join("uploads", filename)
        with open(filepath, "wb") as buffer:
            buffer.write(await image.read())
        image_url = f"/uploads/{filename}"

    new_item = models.MenuItem(
        chef_id=current_user.id,
        name=name,
        description=description,
        is_active=is_active,
        image_url=image_url
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

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
