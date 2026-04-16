from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, users

app = FastAPI(title="Tiffin System API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "Welcome to Tiffin-It-Up API. Go to /docs for Swagger API."}
