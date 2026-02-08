"""Unit tests for AnalysisRepository"""

from datetime import datetime, timedelta, timezone

import pytest

from app.models.database import Analysis, User
from app.repositories import AnalysisRepository


@pytest.fixture
def test_user(test_db):
    """Create test user"""
    user = User(
        email="test@example.com", hashed_password="hashed", full_name="Test User", is_verified=True
    )
    test_db.add(user)
    test_db.commit()
    test_db.refresh(user)
    return user


@pytest.fixture
def analysis_repo(test_db):
    """Create AnalysisRepository instance"""
    return AnalysisRepository(test_db)


class TestAnalysisRepository:
    """Test suite for AnalysisRepository"""

    def test_create_analysis(self, analysis_repo, test_user):
        """Test creating a new analysis"""
        # Arrange
        analysis = Analysis(
            user_id=test_user.id,
            overall_score=85.5,
            sentiment_score=80.0,
            text_length=500,
            format_type="plain",
        )

        # Act
        created = analysis_repo.create(analysis)

        # Assert
        assert created.id is not None
        assert created.overall_score == 85.5
        assert created.user_id == test_user.id

    def test_get_by_id(self, analysis_repo, test_user):
        """Test getting analysis by ID"""
        # Arrange
        analysis = Analysis(user_id=test_user.id, overall_score=75.0, text_length=100)
        created = analysis_repo.create(analysis)

        # Act
        found = analysis_repo.get_by_id(created.id)

        # Assert
        assert found is not None
        assert found.id == created.id
        assert found.overall_score == 75.0

    def test_get_by_id_not_found(self, analysis_repo):
        """Test getting non-existent analysis"""
        # Act
        found = analysis_repo.get_by_id(999)

        # Assert
        assert found is None

    def test_get_all(self, analysis_repo, test_user):
        """Test getting all analyses with pagination"""
        # Arrange - create 5 analyses
        for i in range(5):
            analysis = Analysis(user_id=test_user.id, overall_score=70.0 + i, text_length=100)
            analysis_repo.create(analysis)

        # Act
        all_analyses = analysis_repo.get_all(skip=0, limit=10)

        # Assert
        assert len(all_analyses) == 5

    def test_get_all_pagination(self, analysis_repo, test_user):
        """Test pagination"""
        # Arrange - create 10 analyses
        for i in range(10):
            analysis = Analysis(user_id=test_user.id, overall_score=60.0 + i, text_length=100)
            analysis_repo.create(analysis)

        # Act
        page1 = analysis_repo.get_all(skip=0, limit=5)
        page2 = analysis_repo.get_all(skip=5, limit=5)

        # Assert
        assert len(page1) == 5
        assert len(page2) == 5
        assert page1[0].id != page2[0].id

    def test_update_analysis(self, analysis_repo, test_user):
        """Test updating an analysis"""
        # Arrange
        analysis = Analysis(user_id=test_user.id, overall_score=70.0, text_length=100)
        created = analysis_repo.create(analysis)

        # Act
        created.overall_score = 90.0
        updated = analysis_repo.update(created)

        # Assert
        assert updated.overall_score == 90.0

    def test_delete_analysis(self, analysis_repo, test_user):
        """Test deleting an analysis"""
        # Arrange
        analysis = Analysis(user_id=test_user.id, overall_score=70.0, text_length=100)
        created = analysis_repo.create(analysis)

        # Act
        result = analysis_repo.delete(created.id)

        # Assert
        assert result is True
        assert analysis_repo.get_by_id(created.id) is None

    def test_delete_non_existent(self, analysis_repo):
        """Test deleting non-existent analysis"""
        # Act
        result = analysis_repo.delete(999)

        # Assert
        assert result is False

    def test_get_by_user(self, analysis_repo, test_user, test_db):
        """Test getting analyses for a specific user"""
        # Arrange - create another user
        other_user = User(email="other@example.com", hashed_password="hash", full_name="Other")
        test_db.add(other_user)
        test_db.commit()
        test_db.refresh(other_user)

        # Create analyses for both users
        for i in range(3):
            analysis_repo.create(
                Analysis(user_id=test_user.id, overall_score=70.0, text_length=100)
            )
            analysis_repo.create(
                Analysis(user_id=other_user.id, overall_score=80.0, text_length=100)
            )

        # Act
        user_analyses = analysis_repo.get_by_user(test_user.id)

        # Assert
        assert len(user_analyses) == 3
        assert all(a.user_id == test_user.id for a in user_analyses)

    def test_count_daily_analyses(self, analysis_repo, test_user):
        """Test counting analyses for a specific date"""
        # Arrange - create analyses
        today = datetime.now(timezone.utc)
        for i in range(3):
            analysis = Analysis(
                user_id=test_user.id, overall_score=70.0, text_length=100, created_at=today
            )
            analysis_repo.create(analysis)

        # Act
        count = analysis_repo.count_daily_analyses(test_user.id, today)

        # Assert
        assert count == 3

    def test_get_user_stats(self, analysis_repo, test_user):
        """Test getting user statistics"""
        # Arrange - create analyses with different scores
        scores = [60.0, 70.0, 80.0, 90.0]
        for score in scores:
            analysis_repo.create(
                Analysis(user_id=test_user.id, overall_score=score, text_length=100)
            )

        # Act
        stats = analysis_repo.get_user_stats(test_user.id)

        # Assert
        assert stats["total_analyses"] == 4
        assert stats["average_score"] == 75.0  # (60+70+80+90)/4
        assert stats["max_score"] == 90.0
        assert stats["min_score"] == 60.0

    def test_get_recent_by_user(self, analysis_repo, test_user):
        """Test getting recent analyses"""
        # Arrange - create old and recent analyses
        old_date = datetime.now(timezone.utc) - timedelta(days=40)
        recent_date = datetime.now(timezone.utc) - timedelta(days=10)

        old_analysis = Analysis(
            user_id=test_user.id, overall_score=60.0, text_length=100, created_at=old_date
        )
        analysis_repo.create(old_analysis)

        recent_analysis = Analysis(
            user_id=test_user.id, overall_score=80.0, text_length=100, created_at=recent_date
        )
        analysis_repo.create(recent_analysis)

        # Act
        recent_analyses = analysis_repo.get_recent_by_user(test_user.id, days=30)

        # Assert
        assert len(recent_analyses) == 1
        assert recent_analyses[0].overall_score == 80.0
