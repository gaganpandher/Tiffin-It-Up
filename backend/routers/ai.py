from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
from database import get_db
from core.deps import get_current_user
import models, schemas
from services.ai_service import get_meal_recommendations

router = APIRouter(prefix="/ai", tags=["AI"])

@router.get("/recommendations", response_model=List[schemas.MenuItemPublicOut])
def get_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if "customer" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Only customers can get recommendations")

    # 1. Fetch User Profile Data
    profile = {
        "full_name": current_user.full_name,
        "is_veg": False, # Defaults
        "spice_preference": "medium",
        "allergies": []
    }
    
    # Check if they have an active subscription for hints
    active_sub = db.query(models.Subscription).filter(
        models.Subscription.customer_id == current_user.id,
        models.Subscription.status == models.SubscriptionStatusEnum.active
    ).first()
    
    if active_sub:
        if active_sub.allergies:
            profile["allergies"].append(active_sub.allergies)
        if active_sub.plan:
            profile["is_veg"] = active_sub.plan.is_veg

    # 2. Fetch Recent Order History
    recent_orders = db.query(models.Order).filter(
        models.Order.customer_id == current_user.id
    ).order_by(desc(models.Order.id)).limit(5).all()
    
    order_history = []
    for order in recent_orders:
        for item in order.items:
            order_history.append({
                "meal_name": item.menu_item.name if item.menu_item else "Unknown",
                "is_veg": item.menu_item.is_veg if item.menu_item else False,
                "category": item.menu_item.category.value if item.menu_item and item.menu_item.category else "meal"
            })

    # 3. Fetch Available Catalog (Active meals from active chefs)
    available_items = db.query(models.MenuItem).join(models.User).join(models.ChefProfile).filter(
        models.MenuItem.is_active == True,
        models.User.is_active == True,
        models.ChefProfile.service_active == True
    ).limit(30).all() # Limit to 30 to save context window tokens
    
    catalog = []
    for item in available_items:
        catalog.append({
            "id": item.id,
            "name": item.name,
            "description": item.description,
            "spice_level": item.spice_level,
            "is_veg": item.is_veg,
            "category": item.category.value if item.category else "meal"
        })

    # If catalog is empty, return empty
    if not catalog:
        return []

    # 4. Call AI Service
    recommended_items_data = get_meal_recommendations(profile, order_history, catalog)
    
    # 5. Map back to full DB objects for the response
    recommended_ids = [item['id'] for item in recommended_items_data]
    final_recommendations = [item for item in available_items if item.id in recommended_ids]
    
    return final_recommendations

from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from services.ai_service import generate_chef_insights

def refresh_chef_insights_task(chef_id: int, db: Session):
    # 1. Aggregate Data
    recent_orders = db.query(models.Order).filter(
        models.Order.chef_id == chef_id,
        models.Order.status == models.OrderStatusEnum.completed
    ).order_by(desc(models.Order.id)).limit(50).all()
    
    historical_orders_agg = {}
    for order in recent_orders:
        for item in order.items:
            name = item.menu_item.name if item.menu_item else "Unknown"
            historical_orders_agg[name] = historical_orders_agg.get(name, 0) + item.quantity
            
    active_subs = db.query(models.Subscription).join(models.PricingPlan).filter(
        models.PricingPlan.chef_id == chef_id,
        models.Subscription.status == models.SubscriptionStatusEnum.active
    ).all()
    
    sub_trends = {}
    for sub in active_subs:
        plan_name = sub.plan.plan_type.value if sub.plan else "Unknown"
        sub_trends[plan_name] = sub_trends.get(plan_name, 0) + 1

    # 2. Call AI
    insight_text = generate_chef_insights(historical_orders_agg, sub_trends)

    # 3. Save to DB
    insight_record = db.query(models.ChefInsight).filter(models.ChefInsight.chef_id == chef_id).first()
    if insight_record:
        insight_record.content = insight_text
        insight_record.generated_at = func.now()
    else:
        insight_record = models.ChefInsight(chef_id=chef_id, content=insight_text)
        db.add(insight_record)
    
    db.commit()

@router.get("/chef-insights", response_model=schemas.ChefInsightOut)
def get_chef_insights(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    if "chef" not in current_user.roles.split(","):
        raise HTTPException(status_code=403, detail="Only chefs can view insights")

    insight_record = db.query(models.ChefInsight).filter(models.ChefInsight.chef_id == current_user.id).first()
    
    # If no record exists or it's older than 12 hours, trigger background task
    needs_refresh = False
    if not insight_record:
        needs_refresh = True
        # Return a temporary placeholder while it generates
        insight_record = models.ChefInsight(
            id=0, chef_id=current_user.id, content="Generating your personalized culinary insights. Please check back in a moment...", generated_at=datetime.utcnow()
        )
    elif datetime.utcnow() - insight_record.generated_at > timedelta(hours=12):
        needs_refresh = True
        # It will return the stale record this time, but refresh in the background
        
    if needs_refresh:
        background_tasks.add_task(refresh_chef_insights_task, current_user.id, db)
        
    return insight_record
