import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from unittest.mock import AsyncMock, MagicMock

# Add project root to python path to allow importing modules from backend and ml
# This resolves "ModuleNotFoundError" when running pytest
root_dir = Path(__file__).parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from backend.app.core.database import Base, get_db
from backend.app.main import app
from backend.app.models.database import User


@pytest.fixture(scope="session")
def project_root():
    return root_dir


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh test database for each test"""
    # Use in-memory SQLite for tests
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def test_client(test_db):
    """Create a test client with test database"""
    
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as client:
        yield client
    
    app.dependency_overrides.clear()


@pytest.fixture
def test_user(test_db):
    """Create a test user in the database"""
    from backend.app.core.security import get_password_hash
    
    user = User(
        email="test@example.com",
        hashed_password=get_password_hash("testpassword123"),
        full_name="Test User",
        is_active=True,
        is_verified=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    
    return user


@pytest.fixture
def auth_headers(test_client, test_user):
    """Get authentication headers for a test user"""
    from backend.app.core.security import create_access_token
    
    access_token = create_access_token(data={"sub": test_user.email})
    
    return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture
def mock_email_service():
    """Mock email service for testing"""
    mock_service = MagicMock()
    mock_service.send_verification_email = AsyncMock(return_value=True)
    mock_service.send_password_reset_email = AsyncMock(return_value=True)
    mock_service.send_email = AsyncMock(return_value=True)
    
    return mock_service


@pytest.fixture
def mock_ai_service():
    """Mock AI service for testing"""
    mock_service = MagicMock()
    mock_service.generate_insights = AsyncMock(return_value=[
        {"type": "positive", "text": "Test insight"}
    ])
    mock_service.generate_recommendations = AsyncMock(return_value=[
        {"category": "communication", "text": "Test recommendation"}
    ])
    mock_service._is_available = MagicMock(return_value=True)
    
    return mock_service
