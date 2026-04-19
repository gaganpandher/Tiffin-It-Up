from pydantic import BaseModel, EmailStr
from typing import Optional
from models import RoleEnum, PlanTypeEnum, OrderStatusEnum

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
    profile_picture_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    pickup_address: Optional[str] = None
    service_active: bool = True
    time_slots_delivery: Optional[str] = None
    time_slots_pickup: Optional[str] = None

class ChefProfileOut(ChefProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    spice_level: int = 1
    is_veg: bool = True
    is_combo: bool = False

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

class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int

class OrderItemOut(OrderItemBase):
    id: int
    order_id: int
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    chef_id: int
    items: list[OrderItemBase]
    delivery_type: str
    time_slot: str

class OrderOut(BaseModel):
    id: int
    customer_id: int
    chef_id: int
    status: OrderStatusEnum
    total_price: float
    delivery_type: str
    time_slot: str
    items: list[OrderItemOut] = []

    class Config:
        from_attributes = True
