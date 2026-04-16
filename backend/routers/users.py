from fastapi import APIRouter, Depends
from core.deps import get_current_user, get_current_active_admin, get_current_active_chef, get_current_active_customer
import models
import schemas

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=schemas.UserOut)
def get_me(current_user: models.User = Depends(get_current_user)):
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
