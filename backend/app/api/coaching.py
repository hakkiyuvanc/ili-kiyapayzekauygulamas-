from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.database import CoachingStatus, User
from app.schemas.coaching import CoachingStatusResponse, CoachingStatusUpdate

router = APIRouter()


@router.get("/status", response_model=CoachingStatusResponse)
async def get_coaching_status(
    current_user: Annotated[User, Depends(get_current_user)], db: Session = Depends(get_db)
):
    status = db.query(CoachingStatus).filter(CoachingStatus.user_id == current_user.id).first()

    if not status:
        # Create default if not exists
        status = CoachingStatus(
            user_id=current_user.id, current_focus_area="Genel", completed_tasks=[]
        )
        db.add(status)
        db.commit()
        db.refresh(status)

    return status


@router.patch("/status", response_model=CoachingStatusResponse)
async def update_coaching_status(
    update_data: CoachingStatusUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    status = db.query(CoachingStatus).filter(CoachingStatus.user_id == current_user.id).first()

    if not status:
        status = CoachingStatus(user_id=current_user.id)
        db.add(status)

    if update_data.current_focus_area is not None:
        status.current_focus_area = update_data.current_focus_area

    if update_data.completed_tasks is not None:
        status.completed_tasks = update_data.completed_tasks

    db.commit()
    db.refresh(status)
    return status
