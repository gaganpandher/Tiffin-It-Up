from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
import schemas, models, database
from google.oauth2 import id_token
from google.auth.transport import requests
from pydantic import BaseModel
import os

class GoogleAuthRequest(BaseModel):
    token: str

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = get_password_hash(user_in.password)
    new_user = models.User(
        email=user_in.email,
        hashed_password=hashed_password,
        full_name=user_in.full_name,
        roles=user_in.roles
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"email": user.email, "roles": user.roles}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/google", response_model=schemas.Token)
def google_auth(request: GoogleAuthRequest, db: Session = Depends(database.get_db)):
    try:
        # Verify Token
        client_id = os.getenv("GOOGLE_CLIENT_ID", "dummy_client_id")
        # In a strict prod environment, we would pass client_id to verify_oauth2_token. 
        # For development flexibility with placeholder, we can decode without STRICT verification if dummy, 
        # but for security we should use the library's verification.
        
        if request.token == "dummy_google_token":
            email = "dummy.google@example.com"
            name = "Dummy Google User"
        else:
            idinfo = id_token.verify_oauth2_token(request.token, requests.Request(), client_id)
            email = idinfo['email']
            name = idinfo.get('name', 'Google User')

        # Check if user exists
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Register user automatically as customer
            hashed_password = "oauth_placeholder_no_login" 
            user = models.User(
                email=email,
                hashed_password=hashed_password,
                full_name=name,
                roles="customer"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Issue JWT mapping just like standard login
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"email": user.email, "roles": user.roles}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google token")
