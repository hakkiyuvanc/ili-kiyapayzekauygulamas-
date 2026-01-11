from datetime import date, datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.database import DailyPulse, User

router = APIRouter()


# Schemas
class DailyPulseCreate(BaseModel):
    mood_score: int
    connection_score: int
    note: Optional[str] = None


class DailyPulseResponse(BaseModel):
    id: int
    date: datetime
    mood_score: int
    connection_score: int
    note: Optional[str]

    class Config:
        from_attributes = True


class DailyStatusResponse(BaseModel):
    completed: bool
    data: Optional[DailyPulseResponse] = None


# Endpoints


@router.get("/status", response_model=DailyStatusResponse)
def get_daily_status(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Check if daily pulse is completed for today"""
    today = date.today()
    # Filter by truncated date or range. Since we store date as DateTime in DB (maybe),
    # lets assume we store truncated date or use range query.
    # To be safe with timezone issues, usually best to store Date type, but we used DateTime in model.
    # Let's query by range of today start/end.

    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    pulse = (
        db.query(DailyPulse)
        .filter(
            DailyPulse.user_id == current_user.id,
            DailyPulse.created_at >= start_of_day,
            DailyPulse.created_at <= end_of_day,
        )
        .first()
    )

    if pulse:
        return {"completed": True, "data": pulse}
    return {"completed": False, "data": None}


@router.post("/checkin", response_model=DailyPulseResponse)
def submit_checkin(
    pulse_in: DailyPulseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Check if already done
    today = date.today()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())

    existing = (
        db.query(DailyPulse)
        .filter(
            DailyPulse.user_id == current_user.id,
            DailyPulse.created_at >= start_of_day,
            DailyPulse.created_at <= end_of_day,
        )
        .first()
    )

    if existing:
        raise HTTPException(status_code=400, detail="Bugünkü kontrol zaten tamamlandı.")

    new_pulse = DailyPulse(
        user_id=current_user.id,
        date=datetime.now(),  # Store exact time
        mood_score=pulse_in.mood_score,
        connection_score=pulse_in.connection_score,
        note=pulse_in.note,
    )
    db.add(new_pulse)
    db.commit()
    db.refresh(new_pulse)
    return new_pulse


@router.get("/history", response_model=list[DailyPulseResponse])
def get_history(
    limit: int = 30, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    pulses = (
        db.query(DailyPulse)
        .filter(DailyPulse.user_id == current_user.id)
        .order_by(DailyPulse.created_at.desc())
        .limit(limit)
        .all()
    )
    return pulses
