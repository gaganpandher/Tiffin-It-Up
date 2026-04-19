from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str = "sqlite:///./tiffin_db.sqlite"
    secret_key: str = "supersecretkey12345"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Cloudinary Integration
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
