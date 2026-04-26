from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from database import get_db
from core.deps import get_current_user
import models, schemas

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats", response_model=schemas.AdminStatsOut)
def get_admin_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "admin" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Admin access required")

    # Total users by role
    total_customers = db.query(models.User).filter(models.User.roles.like("%customer%")).count()
    total_chefs = db.query(models.User).filter(models.User.roles.like("%chef%")).count()

    # Total orders
    total_orders = db.query(models.Order).count()

    # Total Revenue (completed orders)
    # Plus revenue from subscriptions (this could be complex, so let's simplify for now)
    # Actually, we can sum the prices of all completed orders.
    order_revenue = db.query(func.sum(models.Order.total_price)).filter(
        models.Order.status.in_([models.OrderStatusEnum.completed, models.OrderStatusEnum.accepted])
    ).scalar() or 0.0

    # Subscription revenue
    # Assuming the price in Subscription is the recurring amount, let's just sum active plans price
    sub_revenue = db.query(func.sum(models.PricingPlan.price)).join(models.Subscription).filter(
        models.Subscription.status == models.SubscriptionStatusEnum.active
    ).scalar() or 0.0

    total_revenue = order_revenue + sub_revenue

    # Total active subscriptions
    total_subscriptions = db.query(models.Subscription).filter(
        models.Subscription.status == models.SubscriptionStatusEnum.active
    ).count()

    return schemas.AdminStatsOut(
        total_customers=total_customers,
        total_chefs=total_chefs,
        total_orders=total_orders,
        total_revenue=total_revenue,
        total_subscriptions=total_subscriptions
    )

@router.get("/recent-orders", response_model=List[schemas.OrderOut])
def get_recent_orders(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "admin" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Admin access required")

    return db.query(models.Order).order_by(models.Order.id.desc()).limit(10).all()

@router.get("/customers", response_model=List[schemas.UserOut])
def get_customers(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "admin" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(models.User).filter(models.User.roles.like("%customer%")).all()

@router.get("/chefs", response_model=List[schemas.UserOut])
def get_chefs(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "admin" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Admin access required")
    return db.query(models.User).filter(models.User.roles.like("%chef%")).all()

@router.get("/subscriptions", response_model=List[schemas.SubscriptionOut])
def get_subscriptions(
    active_only: bool = False,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if "admin" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Admin access required")
    
    query = db.query(models.Subscription)
    if active_only:
        query = query.filter(models.Subscription.status == models.SubscriptionStatusEnum.active)
    
    return query.all()
