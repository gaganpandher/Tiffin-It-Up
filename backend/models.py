from sqlalchemy import Column, Integer, String, Enum, Boolean, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
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
    roles = Column(String(255), default="customer", nullable=False) # Comma-separated roles
    phone_number = Column(String(50), nullable=True)
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

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    profile_picture_url = Column(String(500), nullable=True)
    address = Column(Text, nullable=True)
    user = relationship("User")

class CategoryEnum(str, enum.Enum):
    meal = "meal"
    sweet = "sweet"
    drink = "drink"

class MenuItem(Base):
    __tablename__ = "menu_items"
    id = Column(Integer, primary_key=True, index=True)
    chef_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    spice_level = Column(Integer, default=1)
    is_veg = Column(Boolean, default=True)
    is_combo = Column(Boolean, default=False)
    price = Column(Float, default=0.0)
    category = Column(Enum(CategoryEnum), default=CategoryEnum.meal, nullable=False)
    
    chef = relationship("User")
    
    # Relationship for combos (self-referential many-to-many)
    sub_items = relationship(
        "MenuItem",
        secondary="menu_item_combos",
        primaryjoin="MenuItem.id == MenuItemCombo.combo_id",
        secondaryjoin="MenuItem.id == MenuItemCombo.sub_item_id",
    )

class MenuItemCombo(Base):
    __tablename__ = "menu_item_combos"
    combo_id = Column(Integer, ForeignKey("menu_items.id"), primary_key=True)
    sub_item_id = Column(Integer, ForeignKey("menu_items.id"), primary_key=True)

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
    is_veg = Column(Boolean, default=True) # Point 2
    chef = relationship("User")

class SubscriptionStatusEnum(str, enum.Enum):
    active = "active"
    cancelled = "cancelled"

class Subscription(Base):
    __tablename__ = "subscriptions"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    plan_id = Column(Integer, ForeignKey("pricing_plans.id"))
    status = Column(Enum(SubscriptionStatusEnum), default=SubscriptionStatusEnum.active)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    customer = relationship("User", foreign_keys=[customer_id])
    plan = relationship("PricingPlan")

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
    delivery_type = Column(String(50))
    time_slot = Column(String(255))
    discount_applied = Column(Float, default=0.0)
    customer = relationship("User", foreign_keys=[customer_id])
    chef = relationship("User", foreign_keys=[chef_id])
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"))
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"))
    quantity = Column(Integer, default=1)
    unit_price = Column(Float, default=0.0)
    combo_label = Column(String(255), nullable=True)
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")

class Review(Base):
    __tablename__ = "reviews"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"))
    chef_id = Column(Integer, ForeignKey("users.id"))
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    customer = relationship("User", foreign_keys=[customer_id])
    chef = relationship("User", foreign_keys=[chef_id])

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    sender = relationship("User", foreign_keys=[sender_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

