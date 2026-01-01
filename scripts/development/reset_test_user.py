
import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.database import User
from backend.app.core.security import get_password_hash

def create_pro_user(email="testpro@amor.ai", password="password123", full_name="Pro Test User"):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"Update existing user {email}")
            user.hashed_password = get_password_hash(password)
            user.is_pro = True
            user.is_verified = True
            user.full_name = full_name
        else:
            print(f"Creating new user {email}")
            user = User(
                email=email,
                hashed_password=get_password_hash(password),
                full_name=full_name,
                is_active=True,
                is_verified=True,
                is_pro=True
            )
            db.add(user)
        
        db.commit()
        print(f"User {email} password reset.")
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_pro_user()
