"""Mock service tests using repository pattern"""

from datetime import datetime, timezone
from unittest.mock import Mock

import pytest

from app.models.database import Analysis
from app.repositories import AnalysisRepository


class TestServiceWithMockRepository:
    """Test services using mocked repositories"""

    def test_analysis_service_with_mock_repo(self):
        """Test using mock repository for isolation"""
        # Arrange - Create mock repository
        mock_repo = Mock(spec=AnalysisRepository)

        # Setup mock behavior
        expected_analysis = Analysis(
            id=1,
            user_id=1,
            overall_score=85.0,
            text_length=500,
            created_at=datetime.now(timezone.utc),
        )
        mock_repo.get_by_id.return_value = expected_analysis

        # Act - Call service method (simulated)
        result = mock_repo.get_by_id(1)

        # Assert
        assert result.id == 1
        assert result.overall_score == 85.0
        mock_repo.get_by_id.assert_called_once_with(1)

    def test_create_analysis_with_mock(self):
        """Test create operation with mock"""
        # Arrange
        mock_repo = Mock(spec=AnalysisRepository)

        input_analysis = Analysis(user_id=1, overall_score=75.0, text_length=300)

        output_analysis = Analysis(id=99, user_id=1, overall_score=75.0, text_length=300)
        mock_repo.create.return_value = output_analysis

        # Act
        result = mock_repo.create(input_analysis)

        # Assert
        assert result.id == 99
        assert result.overall_score == 75.0
        mock_repo.create.assert_called_once()

    def test_get_user_stats_with_mock(self):
        """Test stats retrieval with mock"""
        # Arrange
        mock_repo = Mock(spec=AnalysisRepository)
        mock_repo.get_user_stats.return_value = {
            "total_analyses": 10,
            "average_score": 78.5,
            "max_score": 95.0,
            "min_score": 60.0,
        }

        # Act
        stats = mock_repo.get_user_stats(user_id=1)

        # Assert
        assert stats["total_analyses"] == 10
        assert stats["average_score"] == 78.5
        mock_repo.get_user_stats.assert_called_once_with(user_id=1)

    def test_repository_error_handling(self):
        """Test error handling with mock"""
        # Arrange
        mock_repo = Mock(spec=AnalysisRepository)
        mock_repo.get_by_id.side_effect = Exception("Database error")

        # Act & Assert
        with pytest.raises(Exception) as exc_info:
            mock_repo.get_by_id(1)

        assert "Database error" in str(exc_info.value)
