"""Unit tests for UserRepository"""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.database import Base
from app.models.database import User
from app.repositories import UserRepository


@pytest.fixture
def test_db():
    """Create test database"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def user_repo(test_db):
    """Create UserRepository instance"""
    return UserRepository(test_db)


class TestUserRepository:
    """Test suite for UserRepository"""
    
    def test_create_user(self, user_repo):
        """Test creating a new user"""
        # Arrange
        user = User(
            email="test@example.com",
            hashed_password="hashed_pw",
            full_name="Test User"
        )
        
        # Act
        created = user_repo.create(user)
        
        # Assert
        assert created.id is not None
        assert created.email == "test@example.com"
        assert created.full_name == "Test User"
    
    def test_get_by_email(self, user_repo):
        """Test getting user by email"""
        # Arrange
        user = User(email="find@example.com", hashed_password="hash", full_name="Find Me")
        user_repo.create(user)
        
        # Act
        found = user_repo.get_by_email("find@example.com")
        
        # Assert
        assert found is not None
        assert found.email == "find@example.com"
    
    def test_get_by_email_not_found(self, user_repo):
        """Test getting non-existent email"""
        # Act
        found = user_repo.get_by_email("nonexistent@example.com")
        
        # Assert
        assert found is None
    
    def test_email_exists(self, user_repo):
        """Test checking if email exists"""
        # Arrange
        user = User(email="exists@example.com", hashed_password="hash", full_name="User")
        user_repo.create(user)
        
        # Act & Assert
        assert user_repo.email_exists("exists@example.com") is True
        assert user_repo.email_exists("nope@example.com") is False
    
    def test_get_by_stripe_customer_id(self, user_repo):
        """Test getting user by Stripe customer ID"""
        # Arrange
        user = User(
            email="stripe@example.com",
            hashed_password="hash",
            full_name="Stripe User",
            stripe_customer_id="cus_123456"
        )
        user_repo.create(user)
        
        # Act
        found = user_repo.get_by_stripe_customer_id("cus_123456")
        
        # Assert
        assert found is not None
        assert found.stripe_customer_id == "cus_123456"
    
    def test_get_pro_users(self, user_repo):
        """Test getting all pro users"""
        # Arrange - create mix of pro and free users
        user_repo.create(User(email="free1@example.com", hashed_password="h", full_name="Free", is_pro=False))
        user_repo.create(User(email="pro1@example.com", hashed_password="h", full_name="Pro 1", is_pro=True))
        user_repo.create(User(email="pro2@example.com", hashed_password="h", full_name="Pro 2", is_pro=True))
        
        # Act
        pro_users = user_repo.get_pro_users()
        
        # Assert
        assert len(pro_users) == 2
        assert all(u.is_pro for u in pro_users)
    
    def test_get_unverified_users(self, user_repo):
        """Test getting all unverified users"""
        # Arrange
        user_repo.create(User(email="verified@example.com", hashed_password="h", full_name="V", is_verified=True))
        user_repo.create(User(email="unverified1@example.com", hashed_password="h", full_name="U1", is_verified=False))
        user_repo.create(User(email="unverified2@example.com", hashed_password="h", full_name="U2", is_verified=False))
        
        # Act
        unverified = user_repo.get_unverified_users()
        
        # Assert
        assert len(unverified) == 2
        assert all(not u.is_verified for u in unverified)
    
    def test_update_user(self, user_repo):
        """Test updating a user"""
        # Arrange
        user = User(email="update@example.com", hashed_password="h", full_name="Original")
        created = user_repo.create(user)
        
        # Act
        created.full_name = "Updated Name"
        created.is_pro = True
        updated = user_repo.update(created)
        
        # Assert
        assert updated.full_name == "Updated Name"
        assert updated.is_pro is True
    
    def test_delete_user(self, user_repo):
        """Test deleting a user"""
        # Arrange
        user = User(email="delete@example.com", hashed_password="h", full_name="Delete Me")
        created = user_repo.create(user)
        
        # Act
        result = user_repo.delete(created.id)
        
        # Assert
        assert result is True
        assert user_repo.get_by_id(created.id) is None
