"""Feedback Repository - Data access for Feedback model"""

from typing import Optional

from sqlalchemy import func

from app.models.database import Feedback
from app.repositories.base import IRepository


class FeedbackRepository(IRepository[Feedback]):
    """
    Repository for Feedback entity.

    Handles all database operations for Feedback including
    CRUD operations and custom queries.
    """

    def get_by_id(self, id: int) -> Optional[Feedback]:
        """Get feedback by ID"""
        return self.db.query(Feedback).filter(Feedback.id == id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> list[Feedback]:
        """Get all feedback with pagination"""
        return (
            self.db.query(Feedback)
            .order_by(Feedback.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def create(self, entity: Feedback) -> Feedback:
        """Create new feedback"""
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def update(self, entity: Feedback) -> Feedback:
        """Update existing feedback"""
        self.db.commit()
        self.db.refresh(entity)
        return entity

    def delete(self, id: int) -> bool:
        """Delete feedback by ID"""
        feedback = self.get_by_id(id)
        if feedback:
            self.db.delete(feedback)
            self.db.commit()
            return True
        return False

    # Custom queries specific to Feedback

    def get_by_user(self, user_id: int, skip: int = 0, limit: int = 20) -> list[Feedback]:
        """
        Get feedback from a specific user.

        Args:
            user_id: User ID
            skip: Pagination offset
            limit: Maximum results

        Returns:
            List of user's feedback
        """
        return (
            self.db.query(Feedback)
            .filter(Feedback.user_id == user_id)
            .order_by(Feedback.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_analysis(self, analysis_id: int) -> list[Feedback]:
        """
        Get feedback for a specific analysis.

        Args:
            analysis_id: Analysis ID

        Returns:
            List of feedback for that analysis
        """
        return (
            self.db.query(Feedback)
            .filter(Feedback.analysis_id == analysis_id)
            .order_by(Feedback.created_at.desc())
            .all()
        )

    def get_user_stats(self, user_id: int) -> dict:
        """
        Get feedback statistics for a user.

        Args:
            user_id: User ID

        Returns:
            Dictionary with stats (total, avg_rating)
        """
        stats = (
            self.db.query(
                func.count(Feedback.id).label("total_feedback"),
                func.avg(Feedback.rating).label("avg_rating"),
            )
            .filter(Feedback.user_id == user_id)
            .first()
        )

        return {
            "total_feedback": stats.total_feedback or 0,
            "average_rating": round(float(stats.avg_rating), 2) if stats.avg_rating else 0,
        }

    def get_by_category(self, category: str) -> list[Feedback]:
        """
        Get feedback by category.

        Args:
            category: Feedback category (bug, feature, general)

        Returns:
            List of feedback in that category
        """
        return (
            self.db.query(Feedback)
            .filter(Feedback.category == category)
            .order_by(Feedback.created_at.desc())
            .all()
        )
