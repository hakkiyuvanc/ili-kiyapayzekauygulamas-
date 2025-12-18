from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from backend.app.core.database import get_db
from backend.app.services.crud import UserCRUD
from backend.app.api.auth import get_current_user
from backend.app.models.database import User

router = APIRouter(prefix="/subscription", tags=["Subscription"])

class UpgradeRequest(BaseModel):
    """Mock upgrade request"""
    plan_type: str = "monthly"  # monthly, yearly
    payment_method_id: str = "mock_pm_123"

class SubscriptionStatusResponse(BaseModel):
    is_pro: bool
    end_date: Optional[datetime]
    plan: Optional[str]

@router.post("/upgrade", response_model=SubscriptionStatusResponse)
async def upgrade_subscription(
    request: UpgradeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mock subscription upgrade.
    In a real app, verify payment with Stripe/Iyzico here.
    """
    
    # Simulate payment processing
    if not request.payment_method_id:
         raise HTTPException(status_code=400, detail="Invalid payment method")

    # Set duration based on plan
    duration = 30 if request.plan_type == "monthly" else 365
    end_date = datetime.now() + timedelta(days=duration)
    
    # Upgrade user
    updated_user = UserCRUD.update_user_pro_status(
        db, 
        current_user.id, 
        is_pro=True, 
        end_date=end_date
    )
    
    return {
        "is_pro": updated_user.is_pro,
        "end_date": updated_user.subscription_end_date,
        "plan": request.plan_type
    }

@router.get("/status", response_model=SubscriptionStatusResponse)
async def get_subscription_status(
    current_user: User = Depends(get_current_user)
):
    """Check subscription status"""
    return {
        "is_pro": current_user.is_pro,
        "end_date": current_user.subscription_end_date,
        "plan": "premium" if current_user.is_pro else "free"
    }
