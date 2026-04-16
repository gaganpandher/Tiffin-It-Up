from sqlalchemy import Column, Integer, String, Enum, Boolean
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
