from pydantic import BaseModel, EmailStr
from typing import Optional
from models import RoleEnum, PlanTypeEnum

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: RoleEnum = RoleEnum.customer

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    role: Optional[RoleEnum] = None

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    role: RoleEnum
    is_active: bool

    class Config:
        from_attributes = True

class ChefProfileBase(BaseModel):
    bio: Optional[str] = None
    delivery_available: bool = True
    base_delivery_price: float = 0.0

class ChefProfileOut(ChefProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True

class MenuItemOut(MenuItemCreate):
    id: int
    chef_id: int
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

class PricingPlanBase(BaseModel):
    plan_type: PlanTypeEnum
    price: float
    description: Optional[str] = None

class PricingPlanOut(PricingPlanBase):
    id: int
    chef_id: int
    class Config:
        from_attributes = True
