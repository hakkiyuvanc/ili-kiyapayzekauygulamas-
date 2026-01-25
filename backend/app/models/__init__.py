"""Models module"""

# Import all models here to ensure they're registered with SQLAlchemy
# This prevents "Multiple classes found" errors
from app.models.database import (
    Analysis,
    AnalysisHistory,
    APIKey,
    ChatMessage,
    ChatSession,
    CoachingStatus,
    DailyPulse,
    Feedback,
    RefreshToken,
    Subscription,
    UsageTracking,
    User,
)

__all__ = [
    "User",
    "Analysis",
    "AnalysisHistory",
    "CoachingStatus",
    "Feedback",
    "ChatSession",
    "ChatMessage",
    "DailyPulse",
    "APIKey",
    "Subscription",
    "UsageTracking",
    "RefreshToken",
]
