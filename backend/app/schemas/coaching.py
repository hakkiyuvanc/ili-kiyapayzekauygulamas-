from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CoachingStatusBase(BaseModel):
    current_focus_area: Optional[str] = None
    completed_tasks: list[str] = []


class CoachingStatusUpdate(CoachingStatusBase):
    pass


class CoachingStatusResponse(CoachingStatusBase):
    id: int
    user_id: int
    week_start_date: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
