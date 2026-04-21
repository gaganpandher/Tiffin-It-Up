from pydantic import BaseModel, EmailStr
from typing import Optional, List
from models import RoleEnum, PlanTypeEnum, OrderStatusEnum, SubscriptionStatusEnum

# ── Auth ──────────────────────────────────────────────────────────────────────
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

class UserUpdate(BaseModel):
    full_name: Optional[str] = None

# ── Chef Profile ──────────────────────────────────────────────────────────────
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

# ── Customer Profile ──────────────────────────────────────────────────────────
class CustomerProfileBase(BaseModel):
    address: Optional[str] = None
    profile_picture_url: Optional[str] = None

class CustomerProfileOut(CustomerProfileBase):
    id: int
    user_id: int
    class Config:
        from_attributes = True

# ── Menu Item ─────────────────────────────────────────────────────────────────
class MenuItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    spice_level: int = 1
    is_veg: bool = True
    is_combo: bool = False
    price: float = 0.0

class MenuItemOut(MenuItemCreate):
    id: int
    chef_id: int
    image_url: Optional[str] = None
    class Config:
        from_attributes = True

# Public-facing: includes chef info for the marketplace
class MenuItemPublicOut(BaseModel):
    id: int
    chef_id: int
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool
    spice_level: int
    is_veg: bool
    is_combo: bool
    price: float
    chef_name: Optional[str] = None
    chef_avatar: Optional[str] = None
    chef_delivery_available: Optional[bool] = None
    chef_service_active: Optional[bool] = None
    class Config:
        from_attributes = True

# ── Pricing Plan ──────────────────────────────────────────────────────────────
class PricingPlanBase(BaseModel):
    plan_type: PlanTypeEnum
    price: float
    description: Optional[str] = None

class PricingPlanOut(PricingPlanBase):
    id: int
    chef_id: int
    class Config:
        from_attributes = True

class PricingPlanPublicOut(PricingPlanOut):
    chef_name: Optional[str] = None
    chef_avatar: Optional[str] = None
    class Config:
        from_attributes = True

# ── Subscriptions ─────────────────────────────────────────────────────────────
class SubscriptionCreate(BaseModel):
    plan_id: int

class SubscriptionOut(BaseModel):
    id: int
    customer_id: int
    plan_id: int
    status: SubscriptionStatusEnum
    plan: Optional[PricingPlanPublicOut] = None
    class Config:
        from_attributes = True

# ── Orders ────────────────────────────────────────────────────────────────────
class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int
    combo_label: Optional[str] = None

class OrderItemOut(BaseModel):
    id: int
    order_id: int
    menu_item_id: int
    quantity: int
    unit_price: float
    combo_label: Optional[str] = None
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    chef_id: int
    items: List[OrderItemBase]
    delivery_type: str
    time_slot: str

class OrderOut(BaseModel):
    id: int
    customer_id: int
    chef_id: int
    status: OrderStatusEnum
    total_price: float
    discount_applied: float
    delivery_type: str
    time_slot: str
    items: List[OrderItemOut] = []
    class Config:
        from_attributes = True
