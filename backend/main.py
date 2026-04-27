from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users, chef, orders, customer, marketplace, feedback, notifications, admin, ai
from database import engine, Base
import os

app = FastAPI(title="Tiffin System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1):517\d", # Matches 5170-5179
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(chef.router)
app.include_router(orders.router)
app.include_router(customer.router)
app.include_router(marketplace.router)
app.include_router(feedback.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(ai.router)

os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    return {"message": "Welcome to Tiffin It Up API. Go to /docs for Swagger API."}
