from sqlalchemy import Column, Integer, String, Enum, Boolean, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
import enum
from database import Base

class RoleEnum(str, enum.Enum):
    admin = "admin"
    chef = "chef"
    customer = "customer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(Enum(RoleEnum), default=RoleEnum.customer, nullable=False)
    is_active = Column(Boolean, default=True)

class ChefProfile(Base):
    __tablename__ = "chef_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    bio = Column(Text, nullable=True)
    delivery_available = Column(Boolean, default=True)
    base_delivery_price = Column(Float, default=0.0)
    profile_picture_url = Column(String(500), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    pickup_address = Column(Text, nullable=True)
    service_active = Column(Boolean, default=True)
    time_slots_delivery = Column(String(500), nullable=True)
    time_slots_pickup = Column(String(500), nullable=True)

    user = relationship("User")

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    chef_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    spice_level = Column(Integer, default=1) # 1 (mild) to 5 (extreme)
    is_veg = Column(Boolean, default=True)
    is_combo = Column(Boolean, default=False)

    chef = relationship("User")

class PlanTypeEnum(str, enum.Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"

class PricingPlan(Base):
    __tablename__ = "pricing_plans"
    id = Column(Integer, primary_key=True, index=True)
    chef_id = Column(Integer, ForeignKey("users.id"))
    plan_type = Column(Enum(PlanTypeEnum), nullable=False)
    price = Column(Float, nullable=False)
    description = Column(Text, nullable=True)

    chef = relationship("User")

class OrderStatusEnum(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"
    completed = "completed"

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    chef_id = Column(Integer, ForeignKey("users.id"))
    status = Column(Enum(OrderStatusEnum), default=OrderStatusEnum.pending)
    total_price = Column(Float, default=0.0)
    delivery_type = Column(String(50)) # 'delivery' or 'pickup'
    time_slot = Column(String(255))
    
    customer = relationship("User", foreign_keys=[customer_id])
    chef = relationship("User", foreign_keys=[chef_id])

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)
    
    order = relationship("Order")
    menu_item = relationship("MenuItem")
