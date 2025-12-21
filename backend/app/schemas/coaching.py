from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

class CoachingStatusBase(BaseModel):
    current_focus_area: Optional[str] = None
    completed_tasks: List[str] = []

class CoachingStatusUpdate(CoachingStatusBase):
    pass

class CoachingStatusResponse(CoachingStatusBase):
    id: int
    user_id: int
    week_start_date: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
