"""Analysis Repository - Data access for Analysis model"""

from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from app.repositories.base import IRepository
from app.models.database import Analysis


class AnalysisRepository(IRepository[Analysis]):
    """
    Repository for Analysis entity.
    
    Handles all database operations for Analysis including
    CRUD operations and custom queries.
    """
    
    def get_by_id(self, id: int) -> Optional[Analysis]:
        """Get analysis by ID"""
        return self.db.query(Analysis).filter(Analysis.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[Analysis]:
        """Get all analyses with pagination"""
        return (
            self.db.query(Analysis)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def create(self, entity: Analysis) -> Analysis:
        """Create new analysis"""
        self.db.add(entity)
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def update(self, entity: Analysis) -> Analysis:
        """Update existing analysis"""
        self.db.commit()
        self.db.refresh(entity)
        return entity
    
    def delete(self, id: int) -> bool:
        """Delete analysis by ID"""
        analysis = self.get_by_id(id)
        if analysis:
            self.db.delete(analysis)
            self.db.commit()
            return True
        return False
    
    # Custom queries specific to Analysis
    
    def get_by_user(
        self, 
        user_id: int, 
        skip: int = 0, 
        limit: int = 10
    ) -> List[Analysis]:
        """
        Get analyses for a specific user.
        
        Args:
            user_id: User ID
            skip: Pagination offset
            limit: Maximum results
            
        Returns:
            List of user's analyses, ordered by date
        """
        return (
            self.db.query(Analysis)
            .filter(Analysis.user_id == user_id)
            .order_by(Analysis.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def count_daily_analyses(self, user_id: int, date: datetime) -> int:
        """
        Count analyses for a user on a specific date.
        
        Args:
            user_id: User ID
            date: Date to check
            
        Returns:
            Number of analyses on that date
        """
        return (
            self.db.query(Analysis)
            .filter(
                Analysis.user_id == user_id,
                func.date(Analysis.created_at) == date.date()
            )
            .count()
        )
    
    def get_user_stats(self, user_id: int) -> dict:
        """
        Get statistics for a user's analyses.
        
        Args:
            user_id: User ID
            
        Returns:
            Dictionary with stats (total, avg_score, etc.)
        """
        stats = (
            self.db.query(
                func.count(Analysis.id).label("total_analyses"),
                func.avg(Analysis.overall_score).label("avg_score"),
                func.max(Analysis.overall_score).label("max_score"),
                func.min(Analysis.overall_score).label("min_score")
            )
            .filter(Analysis.user_id == user_id)
            .first()
        )
        
        return {
            "total_analyses": stats.total_analyses or 0,
            "average_score": round(float(stats.avg_score), 2) if stats.avg_score else 0,
            "max_score": float(stats.max_score) if stats.max_score else 0,
            "min_score": float(stats.min_score) if stats.min_score else 0,
        }
    
    def get_recent_by_user(self, user_id: int, days: int = 30) -> List[Analysis]:
        """
        Get user's analyses from the last N days.
        
        Args:
            user_id: User ID
            days: Number of days to look back
            
        Returns:
            List of recent analyses
        """
        from datetime import timedelta, timezone
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        return (
            self.db.query(Analysis)
            .filter(
                Analysis.user_id == user_id,
                Analysis.created_at >= cutoff_date
            )
            .order_by(Analysis.created_at.desc())
            .all()
        )
