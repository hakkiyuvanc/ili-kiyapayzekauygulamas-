"""User Repository - Data access for User model"""

from typing import Optional

from app.models.database import User
from app.repositories.base import IRepository


class UserRepository(IRepository[User]):
    """
    Repository for User entity.

    Handles all database operations for User including
    CRUD operations and custom queries.
    """

    def get_by_id(self, id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[User]:
        """Get all users with pagination"""
        return self.db.query(User).order_by(User.created_at.desc()).offset(skip).limit(limit).all()

    def create(self, entity: User) -> User:
        """Create new user"""
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def update(self, entity: User) -> User:
        """Update existing user"""
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, id: int) -> bool:
        """Delete user by ID"""
        user = self.get_by_id(id)
        if user:
            self.db.delete(user)
            self.db.commit()
            return True
        return False

    # Custom queries specific to User

    def get_by_email(self, email: str) -> Optional[User]:
        """
        Get user by email address.

        Args:
            email: User email

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_by_username(self, username: str) -> Optional[User]:
        """
        Get user by username.

        Args:
            username: Username

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.username == username).first()

    def get_by_stripe_customer_id(self, stripe_customer_id: str) -> Optional[User]:
        """
        Get user by Stripe customer ID.

        Args:
            stripe_customer_id: Stripe customer ID

        Returns:
            User if found, None otherwise
        """
        return self.db.query(User).filter(User.stripe_customer_id == stripe_customer_id).first()

    def get_pro_users(self) -> list[User]:
        """
        Get all pro (paid) users.

        Returns:
            List of pro users
        """
        return self.db.query(User).filter(User.is_pro == True).all()

    def get_unverified_users(self) -> list[User]:
        """
        Get all unverified users.

        Returns:
            List of unverified users
        """
        return self.db.query(User).filter(User.is_verified == False).all()

    def email_exists(self, email: str) -> bool:
        """
        Check if email already exists.

        Args:
            email: Email to check

        Returns:
            True if exists, False otherwise
        """
        return self.db.query(User).filter(User.email == email).first() is not None
