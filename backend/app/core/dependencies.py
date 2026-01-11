"""Repository dependency injection helpers"""

from fastapi import Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.repositories import AnalysisRepository, FeedbackRepository, UserRepository


def get_analysis_repository(db: Session = Depends(get_db)) -> AnalysisRepository:
    """
    Dependency injection for AnalysisRepository.

    Args:
        db: Database session from FastAPI dependency

    Returns:
        AnalysisRepository instance

    Example:
        @router.get("/analyses")
        async def get_analyses(
            repo: AnalysisRepository = Depends(get_analysis_repository)
        ):
            return repo.get_all()
    """
    return AnalysisRepository(db)


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    """
    Dependency injection for UserRepository.

    Args:
        db: Database session from FastAPI dependency

    Returns:
        UserRepository instance
    """
    return UserRepository(db)


def get_feedback_repository(db: Session = Depends(get_db)) -> FeedbackRepository:
    """
    Dependency injection for FeedbackRepository.

    Args:
        db: Database session from FastAPI dependency

    Returns:
        FeedbackRepository instance
    """
    return FeedbackRepository(db)
