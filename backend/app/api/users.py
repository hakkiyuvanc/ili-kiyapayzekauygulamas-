from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Annotated

from backend.app.core.database import get_db
from backend.app.models.database import User
from backend.app.schemas.user import UserResponse, UserOnboardingUpdate
from backend.app.api.auth import get_current_user
from backend.app.services.crud import UserCRUD

router = APIRouter()

@router.patch("/me/onboarding", response_model=UserResponse)
async def update_onboarding_status(
    update_data: UserOnboardingUpdate,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db)
):
    """
    Update user onboarding status and goals.
    """
    # Simply update the fields on the current user instance
    # Since UserCRUD doesn't have a specific update method for this yet, 
    # and it's a simple update, we can do it here or add to CRUD.
    # Doing it here for simplicity as the object is attached to session.
    
    if update_data.onboarding_completed is not None:
        current_user.onboarding_completed = update_data.onboarding_completed
    
    if update_data.goals is not None:
        current_user.goals = update_data.goals

    if update_data.love_language is not None:
        current_user.love_language = update_data.love_language
        
    if update_data.conflict_resolution_style is not None:
        current_user.conflict_resolution_style = update_data.conflict_resolution_style
    
    if update_data.full_name:
        current_user.full_name = update_data.full_name
        
    db.commit()
    db.refresh(current_user)
    
    return current_user
