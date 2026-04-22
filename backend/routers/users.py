from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.deps import get_current_user, get_current_active_admin, get_current_active_chef, get_current_active_customer
from core.security import verify_password, get_password_hash
from database import get_db
from pydantic import BaseModel
import models
import schemas

router = APIRouter(prefix="/users", tags=["Users"])

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user

@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    if len(payload.new_password) < 8:
        raise HTTPException(status_code=400, detail="New password must be at least 8 characters")
    current_user.hashed_password = get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.put("/me", response_model=schemas.UserOut)
def update_user(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if user_in.full_name:
        current_user.full_name = user_in.full_name
    if user_in.phone_number:
        current_user.phone_number = user_in.phone_number
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/admin/dashboard")
def admin_dashboard(current_user: models.User = Depends(get_current_active_admin)):
    return {"message": "Welcome to the admin dashboard", "user": current_user.email}

@router.get("/chef/dashboard")
def chef_dashboard(current_user: models.User = Depends(get_current_active_chef)):
    return {"message": "Welcome to the chef dashboard", "user": current_user.email}

@router.get("/customer/dashboard")
def customer_dashboard(current_user: models.User = Depends(get_current_active_customer)):
    return {"message": "Welcome to the customer dashboard", "user": current_user.email}
