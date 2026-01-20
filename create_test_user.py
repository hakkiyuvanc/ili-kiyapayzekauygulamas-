#!/usr/bin/env python3
"""Create a test user for development"""
import sys
from datetime import datetime, timezone

# Add project root to path
sys.path.insert(0, "/Users/hakkiyuvanc/GİTHUB/relationship-ai/ili-kiyapayzekauygulamas-")

from backend.app.core.database import SessionLocal
from backend.app.core.security import get_password_hash
from backend.app.models.database import User


def create_test_user(email: str, password: str, full_name: str = "Test User"):
    """Create a verified test user"""
    db = SessionLocal()

    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"❌ User {email} already exists!")
            print(f"   Verified: {existing_user.is_verified}")
            print(f"   Full name: {existing_user.full_name}")

            # Update to verified if not already
            if not existing_user.is_verified:
                existing_user.is_verified = True
                existing_user.verification_code = None
                existing_user.verification_code_expires_at = None
                db.commit()
                print(f"✅ User {email} is now verified!")
            return existing_user

        # Create new user
        hashed_password = get_password_hash(password)
        new_user = User(
            email=email,
            hashed_password=hashed_password,
            full_name=full_name,
            is_verified=True,  # Auto-verify for test user
            is_active=True,
            created_at=datetime.now(timezone.utc),
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        print("✅ Test user created successfully!")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   Full name: {full_name}")
        print(f"   Verified: {new_user.is_verified}")

        return new_user

    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    # Create a test user
    email = "test@example.com"
    password = "test123"
    full_name = "Test User"

    print("Creating test user...")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print()

    create_test_user(email, password, full_name)

    print()
    print("You can now login with:")
    print(f"  Email: {email}")
    print(f"  Password: {password}")
