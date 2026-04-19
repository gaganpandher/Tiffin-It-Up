from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from core.deps import get_current_user

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.get("/chef", response_model=List[schemas.OrderOut])
def get_chef_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.chef:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    orders = db.query(models.Order).filter(models.Order.chef_id == current_user.id).order_by(models.Order.id.desc()).all()
    return orders

@router.put("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(order_id: int, status_update: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role != models.RoleEnum.chef:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    order = db.query(models.Order).filter(models.Order.id == order_id, models.Order.chef_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    try:
        order.status = models.OrderStatusEnum(status_update.lower())
        db.commit()
        db.refresh(order)
        return order
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid order status provided")
