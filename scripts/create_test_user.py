import sys
import os

# Add parent directory to path to import backend modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from backend.app.core.database import SessionLocal
from backend.app.models.database import User
from backend.app.core.security import get_password_hash

def create_test_user():
    db = SessionLocal()
    try:
        email = "test@pro.com"
        password = "test1234"
        
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        if user:
            print(f"User {email} already exists.")
            # Update to be Pro just in case
            user.is_pro = True
            user.is_verified = True
            user.hashed_password = get_password_hash(password) # Reset password to ensure we know it
            db.commit()
            print("User updated to Pro status and password reset.")
            return

        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name="Test Pro User",
            is_active=True,
            is_verified=True,
            is_pro=True
        )
        db.add(new_user)
        db.commit()
        print(f"Created new Pro user: {email}")
        
    except Exception as e:
        print(f"Error creating user: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
