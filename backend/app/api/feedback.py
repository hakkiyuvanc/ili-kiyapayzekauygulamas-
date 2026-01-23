"""Feedback API endpoints"""

from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from .auth import get_current_user
from ..core.dependencies import get_feedback_repository
from ..models.database import Feedback, User
from ..repositories import FeedbackRepository

router = APIRouter()


# Schemas
class FeedbackCreate(BaseModel):
    """Feedback creation schema"""

    analysis_id: Optional[int] = None
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5")
    comment: Optional[str] = Field(None, max_length=1000)
    category: Optional[str] = Field(None, description="Feedback category: bug, feature, general")


class FeedbackResponse(BaseModel):
    """Feedback response schema"""

    id: int
    analysis_id: Optional[int]
    user_id: int
    rating: int
    comment: Optional[str]
    category: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback_data: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    repo: FeedbackRepository = Depends(get_feedback_repository),
):
    """
    Create new feedback

    - **analysis_id**: Optional analysis ID this feedback relates to
    - **rating**: Rating from 1 to 5
    - **comment**: Optional comment text
    - **category**: Optional category (bug, feature, general)
    """
    # Validate category
    valid_categories = ["bug", "feature", "general", "other"]
    if feedback_data.category and feedback_data.category not in valid_categories:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {', '.join(valid_categories)}",
        )

    # Create feedback entity
    feedback = Feedback(
        user_id=current_user.id,
        analysis_id=feedback_data.analysis_id,
        rating=feedback_data.rating,
        comment=feedback_data.comment,
        category=feedback_data.category or "general",
        created_at=datetime.now(timezone.utc),
    )

    # Save via repository
    return repo.create(feedback)


@router.get("/my-feedback", response_model=list[FeedbackResponse])
async def get_my_feedback(
    skip: int = 0,
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    repo: FeedbackRepository = Depends(get_feedback_repository),
):
    """
    Get current user's feedback history

    - **skip**: Number of records to skip (pagination)
    - **limit**: Maximum number of records to return
    """
    # Get user's feedback via repository
    return repo.get_by_user(user_id=current_user.id, skip=skip, limit=limit)


@router.get("/stats", response_model=dict)
async def get_feedback_stats(
    current_user: User = Depends(get_current_user),
    repo: FeedbackRepository = Depends(get_feedback_repository),
):
    """
    Get feedback statistics for current user

    Returns count and average rating
    """
    # Get stats via repository
    return repo.get_user_stats(user_id=current_user.id)
