from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from database import get_db
from core.deps import get_current_user
import models, schemas

router = APIRouter(prefix="/marketplace", tags=["Marketplace"])

@router.get("/meals", response_model=List[schemas.MenuItemPublicOut])
def browse_meals(
    db: Session = Depends(get_db),
    search: Optional[str] = Query(None),
    is_veg: Optional[bool] = Query(None),
    delivery_available: Optional[bool] = Query(None),
    max_price: Optional[float] = Query(None),
    spice_level: Optional[int] = Query(None),
):
    query = db.query(models.MenuItem).join(
        models.User, models.MenuItem.chef_id == models.User.id
    ).join(
        models.ChefProfile, models.ChefProfile.user_id == models.User.id, isouter=True
    ).filter(
        models.MenuItem.is_active == True
    )

    if search:
        query = query.filter(models.MenuItem.name.ilike(f"%{search}%"))
    if is_veg is not None:
        query = query.filter(models.MenuItem.is_veg == is_veg)
    if max_price is not None:
        query = query.filter(models.MenuItem.price <= max_price)
    if spice_level is not None:
        query = query.filter(models.MenuItem.spice_level <= spice_level)

    items = query.all()

    result = []
    for item in items:
        chef_profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == item.chef_id).first()

        if delivery_available is not None and chef_profile:
            if chef_profile.delivery_available != delivery_available:
                continue

        # Skip meals from chefs whose service is off
        if chef_profile and not chef_profile.service_active:
            continue

        result.append(schemas.MenuItemPublicOut(
            id=item.id,
            chef_id=item.chef_id,
            name=item.name,
            description=item.description,
            image_url=item.image_url,
            is_active=item.is_active,
            spice_level=item.spice_level,
            is_veg=item.is_veg,
            is_combo=item.is_combo,
            price=item.price,
            chef_name=item.chef.full_name if item.chef else None,
            chef_avatar=chef_profile.profile_picture_url if chef_profile else None,
            chef_delivery_available=chef_profile.delivery_available if chef_profile else None,
            chef_service_active=chef_profile.service_active if chef_profile else True,
        ))

    return result

@router.get("/plans", response_model=List[schemas.PricingPlanPublicOut])
def browse_plans(db: Session = Depends(get_db)):
    plans = db.query(models.PricingPlan).all()
    result = []
    for plan in plans:
        chef_profile = db.query(models.ChefProfile).filter(models.ChefProfile.user_id == plan.chef_id).first()
        result.append(schemas.PricingPlanPublicOut(
            id=plan.id,
            chef_id=plan.chef_id,
            plan_type=plan.plan_type,
            price=plan.price,
            description=plan.description,
            is_veg=plan.is_veg,
            chef_name=plan.chef.full_name if plan.chef else None,
            chef_avatar=chef_profile.profile_picture_url if chef_profile else None,
        ))
    return result

@router.post("/subscribe", response_model=schemas.SubscriptionOut)
def subscribe_to_plan(
    payload: schemas.SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    plan = db.query(models.PricingPlan).filter(models.PricingPlan.id == payload.plan_id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    existing = db.query(models.Subscription).filter(
        models.Subscription.customer_id == current_user.id,
        models.Subscription.plan_id == payload.plan_id,
        models.Subscription.status == models.SubscriptionStatusEnum.active
    ).first()
    # Check for plan type constraints: Weekly or Monthly but not both per chef
    if plan.plan_type in [models.PlanTypeEnum.weekly, models.PlanTypeEnum.monthly]:
        other_type = models.PlanTypeEnum.monthly if plan.plan_type == models.PlanTypeEnum.weekly else models.PlanTypeEnum.weekly
        existing_conflict = db.query(models.Subscription).join(models.PricingPlan).filter(
            models.Subscription.customer_id == current_user.id,
            models.PricingPlan.chef_id == plan.chef_id,
            models.PricingPlan.plan_type == other_type,
            models.Subscription.status == models.SubscriptionStatusEnum.active
        ).first()
        if existing_conflict:
            raise HTTPException(status_code=400, detail=f"You already have an active {other_type.value} plan with this kitchen. Please cancel it first.")

    sub = models.Subscription(customer_id=current_user.id, plan_id=payload.plan_id)
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub

@router.get("/subscriptions/me", response_model=List[schemas.SubscriptionOut])
def my_subscriptions(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Subscription).filter(models.Subscription.customer_id == current_user.id).all()

@router.delete("/subscriptions/{sub_id}")
def cancel_subscription(sub_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sub = db.query(models.Subscription).filter(models.Subscription.id == sub_id, models.Subscription.customer_id == current_user.id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.status = models.SubscriptionStatusEnum.cancelled
    db.commit()
    return {"message": "Subscription cancelled"}
