from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from core.deps import get_current_user, get_current_active_customer
import models, schemas

router = APIRouter(prefix="/feedback", tags=["Feedback & Messaging"])

# ── Reviews ───────────────────────────────────────────────────────────────────
@router.post("/reviews", response_model=schemas.ReviewOut)
def create_review(
    review_in: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_customer)
):
    # Check if chef exists
    chef = db.query(models.User).filter(models.User.id == review_in.chef_id).first()
    if not chef or "chef" not in chef.roles.split(","):
        raise HTTPException(status_code=404, detail="Chef not found")
    
    new_review = models.Review(
        customer_id=current_user.id,
        chef_id=review_in.chef_id,
        rating=review_in.rating,
        comment=review_in.comment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Attach customer name for the response
    new_review.customer_name = current_user.full_name
    return new_review

@router.get("/reviews/{chef_id}", response_model=List[schemas.ReviewOut])
def get_chef_reviews(chef_id: int, db: Session = Depends(get_db)):
    reviews = db.query(models.Review).filter(models.Review.chef_id == chef_id).all()
    for r in reviews:
        r.customer_name = r.customer.full_name
    return reviews

# ── Messaging ─────────────────────────────────────────────────────────────────
@router.post("/messages", response_model=schemas.MessageOut)
def send_message(
    msg_in: schemas.MessageCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    new_msg = models.Message(
        sender_id=current_user.id,
        receiver_id=msg_in.receiver_id,
        content=msg_in.content
    )
    db.add(new_msg)
    db.commit()
    db.refresh(new_msg)
    new_msg.sender_name = current_user.full_name
    return new_msg

@router.get("/messages", response_model=List[schemas.MessageOut])
def get_my_messages(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    messages = db.query(models.Message).filter(
        (models.Message.receiver_id == current_user.id) | (models.Message.sender_id == current_user.id)
    ).order_by(models.Message.created_at.desc()).all()
    
    for m in messages:
        m.sender_name = m.sender.full_name
    return messages
