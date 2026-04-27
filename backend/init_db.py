import os
from database import engine, Base, SessionLocal
import models
from core.security import get_password_hash

def init():
    print("Creating database tables...")
    # NOTE: We removed drop_all() so we don't accidentally wipe production data on every deploy!
    Base.metadata.create_all(bind=engine)
    print("Database tables verified/created successfully!")

    # Auto-provision Admin if credentials are provided in Environment Variables
    admin_email = os.getenv("ADMIN_EMAIL")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_email and admin_password:
        db = SessionLocal()
        try:
            admin_user = db.query(models.User).filter(models.User.email == admin_email).first()
            if not admin_user:
                print(f"Provisioning initial admin user: {admin_email}")
                hashed_password = get_password_hash(admin_password)
                new_admin = models.User(
                    email=admin_email,
                    full_name="System Admin",
                    hashed_password=hashed_password,
                    roles="admin",
                    is_active=True
                )
                db.add(new_admin)
                db.commit()
                print("Admin user created successfully!")
            else:
                print(f"Admin user {admin_email} already exists. Skipping creation.")
        finally:
            db.close()

if __name__ == "__main__":
    init()
