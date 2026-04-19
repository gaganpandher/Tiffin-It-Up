from database import engine, Base
import models

def init():
    print("Dropping existing tables to migrate new schema arrays...")
    Base.metadata.drop_all(bind=engine)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

if __name__ == "__main__":
    init()
