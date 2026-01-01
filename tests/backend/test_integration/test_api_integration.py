"""Integration tests for API endpoints using repositories"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.core.database import Base, get_db
from app.models.database import User
from app.core.security import get_password_hash


# Test database setup
@pytest.fixture(scope="function")
def test_db():
    """Create test database for integration tests"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    
    yield db
    
    db.close()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(test_db):
    """Create test client with database override"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    """Create verified test user"""
    user = User(
        email="test@integration.com",
        hashed_password=get_password_hash("password123"),
        full_name="Integration Test User",
        is_verified=True,
        is_pro=False
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def auth_headers(client, test_user):
    """Get authentication headers for test user"""
    response = client.post(
        "/api/auth/login",
        data={
            "username": test_user.email,  # OAuth2 uses 'username'
            "password": "password123"
        }
    )
    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


class TestAuthEndpointsIntegration:
    """Integration tests for auth endpoints using UserRepository"""
    
    def test_register_user(self, client):
        """Test user registration flow"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": "newuser@test.com",
                "password": "securepass123",
                "full_name": "New User"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "newuser@test.com"
        assert data["is_verified"] is False
    
    def test_register_duplicate_email(self, client, test_user):
        """Test registering with existing email"""
        response = client.post(
            "/api/auth/register",
            json={
                "email": test_user.email,
                "password": "pass123",
                "full_name": "Duplicate"
            }
        )
        
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()
    
    def test_login_success(self, client, test_user):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.email,
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    def test_login_wrong_password(self, client, test_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/auth/login",
            data={
                "username": test_user.email,
                "password": "wrongpassword"
            }
        )
        
        assert response.status_code == 401
    
    def test_get_current_user(self, client, auth_headers):
        """Test getting current user profile"""
        response = client.get(
            "/api/auth/me",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@integration.com"


class TestFeedbackEndpointsIntegration:
    """Integration tests for feedback endpoints using FeedbackRepository"""
    
    def test_create_feedback(self, client, auth_headers):
        """Test creating feedback"""
        response = client.post(
            "/api/feedback/",
            headers=auth_headers,
            json={
                "rating": 5,
                "comment": "Great app!",
                "category": "general"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["rating"] == 5
        assert data["comment"] == "Great app!"
        assert data["category"] == "general"
    
    def test_create_feedback_invalid_rating(self, client, auth_headers):
        """Test creating feedback with invalid rating"""
        response = client.post(
            "/api/feedback/",
            headers=auth_headers,
            json={
                "rating": 6,  # Invalid (max is 5)
                "comment": "Test"
            }
        )
        
        assert response.status_code == 422  # Validation error
    
    def test_get_my_feedback(self, client, auth_headers):
        """Test getting user's feedback"""
        # Create some feedback first
        client.post(
            "/api/feedback/",
            headers=auth_headers,
            json={"rating": 5, "comment": "Test 1"}
        )
        client.post(
            "/api/feedback/",
            headers=auth_headers,
            json={"rating": 4, "comment": "Test 2"}
        )
        
        # Get feedback
        response = client.get(
            "/api/feedback/my-feedback",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
    
    def test_get_feedback_stats(self, client, auth_headers):
        """Test getting feedback statistics"""
        # Create feedback with different ratings
        for rating in [3, 4, 5]:
            client.post(
                "/api/feedback/",
                headers=auth_headers,
                json={"rating": rating}
            )
        
        # Get stats
        response = client.get(
            "/api/feedback/stats",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total_feedback"] == 3
        assert data["average_rating"] == 4.0  # (3+4+5)/3


class TestSystemStatusIntegration:
    """Integration test for system status endpoint"""
    
    def test_system_status(self, client):
        """Test system status endpoint"""
        response = client.get("/api/system/status")
        
        assert response.status_code == 200
        data = response.json()
        assert "ai_enabled" in data
        assert "database" in data
        assert data["database"] == "connected"


class TestRepositoryPatternIntegration:
    """Test that repository pattern is working correctly in API"""
    
    def test_feedback_crud_flow(self, client, auth_headers):
        """Test complete CRUD flow using repository"""
        # CREATE
        create_response = client.post(
            "/api/feedback/",
            headers=auth_headers,
            json={
                "rating": 5,
                "comment": "Integration test feedback",
                "category": "feature"
            }
        )
        assert create_response.status_code == 201
        feedback_id = create_response.json()["id"]
        
        # READ (via my-feedback)
        read_response = client.get(
            "/api/feedback/my-feedback",
            headers=auth_headers
        )
        assert read_response.status_code == 200
        feedbacks = read_response.json()
        assert any(f["id"] == feedback_id for f in feedbacks)
        
        # Stats check
        stats_response = client.get(
            "/api/feedback/stats",
            headers=auth_headers
        )
        assert stats_response.status_code == 200
        stats = stats_response.json()
        assert stats["total_feedback"] >= 1
