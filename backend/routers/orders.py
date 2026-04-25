from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session, joinedload
from typing import List
from database import get_db
from core.deps import get_current_user
import models, schemas
from routers.notifications import manager

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/checkout", response_model=schemas.OrderOut)
def checkout(
    payload: schemas.OrderCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if "customer" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Only customers can place orders")

    print(f"DEBUG: Received checkout payload: {payload.model_dump()}")

    # Validate all items belong to the stated chef
    subtotal = 0.0
    order_items_data = []
    for item_in in payload.items:
        menu_item = db.query(models.MenuItem).filter(
            models.MenuItem.id == item_in.menu_item_id,
            models.MenuItem.chef_id == payload.chef_id,
            models.MenuItem.is_active == True
        ).first()
        if not menu_item:
            raise HTTPException(status_code=404, detail=f"Menu item {item_in.menu_item_id} not found or unavailable")
        line_total = menu_item.price * item_in.quantity
        subtotal += line_total
        order_items_data.append((menu_item, item_in.quantity, menu_item.price, item_in.combo_label))

    # Calculate total without automatic discounts
    discount = 0.0
    total = round(subtotal, 2)

    order = models.Order(
        customer_id=current_user.id,
        chef_id=payload.chef_id,
        total_price=total,
        discount_applied=discount,
        delivery_type=payload.delivery_type,
        time_slot=payload.time_slot,
        delivery_address=payload.delivery_address,
    )
    db.add(order)
    db.flush()

    for menu_item, qty, unit_price, combo_label in order_items_data:
        db.add(models.OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            quantity=qty,
            unit_price=unit_price,
            combo_label=combo_label,
        ))

    db.commit()
    
    # Reload order with items and chef info to ensure safe serialization
    order = db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.chef).joinedload(models.User.chef_profile)
    ).filter(models.Order.id == order.id).first()

    # Trigger notification to chef in the background
    background_tasks.add_task(
        manager.send_personal_message,
        {"type": "NEW_ORDER", "order_id": order.id, "customer_name": current_user.full_name, "delivery_type": order.delivery_type, "delivery_address": order.delivery_address},
        payload.chef_id
    )

    return order

@router.get("/me", response_model=List[schemas.OrderOut])
def my_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Order).options(
        joinedload(models.Order.items),
        joinedload(models.Order.chef).joinedload(models.User.chef_profile)
    ).filter(models.Order.customer_id == current_user.id).order_by(models.Order.id.desc()).all()

@router.get("/chef", response_model=List[schemas.OrderOut])
def get_chef_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "chef" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Order).options(
        joinedload(models.Order.items)
    ).filter(models.Order.chef_id == current_user.id).order_by(models.Order.id.desc()).all()

@router.put("/{order_id}/status", response_model=schemas.OrderOut)
def update_order_status(
    order_id: int,
    status_update: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if "chef" not in current_user.roles.split(","):
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
        raise HTTPException(status_code=400, detail="Invalid status")
