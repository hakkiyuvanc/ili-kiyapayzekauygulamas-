from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.config import settings
from app.core.database import get_db
from app.models.database import User
from app.services.payment import StripeService

router = APIRouter()

# Pro Price ID (Should be in env or config, but hardcoded for MVP if needed)
# For now, we assume it's passed or configured. Let's use a dummy or config.
PRO_PRICE_ID = "price_H5ggYJDqNyV7kU"  # Example, replace with real one later or env var


@router.post("/create-checkout-session")
def create_checkout_session(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    try:
        # Create user in Stripe if not exists
        if not current_user.stripe_customer_id:
            customer = StripeService.create_customer(
                email=current_user.email, name=current_user.full_name
            )
            current_user.stripe_customer_id = customer.id
            db.commit()

        checkout_session = StripeService.create_checkout_session(
            customer_id=current_user.stripe_customer_id,
            success_url=f"{settings.FRONTEND_URL}/dashboard?checkout_success=true",
            cancel_url=f"{settings.FRONTEND_URL}/subscription?checkout_canceled=true",
            price_id=PRO_PRICE_ID,
        )
        return {"url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/portal")
def customer_portal(
    current_user: User = Depends(get_current_user),
):
    if not current_user.stripe_customer_id:
        raise HTTPException(status_code=404, detail="No billing account found")

    try:
        session = StripeService.create_portal_session(
            customer_id=current_user.stripe_customer_id,
            return_url=f"{settings.FRONTEND_URL}/dashboard",
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/webhook")
async def webhook(
    request: Request, stripe_signature: str = Header(None), db: Session = Depends(get_db)
):
    payload = await request.body()
    try:
        event = StripeService.construct_event(
            payload=payload,
            sig_header=stripe_signature,
            webhook_secret=settings.STRIPE_WEBHOOK_SECRET,
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Handle the event
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        # Fulfill the purchase...
        handle_checkout_completed(session, db)
    elif event["type"] == "customer.subscription.updated":
        subscription = event["data"]["object"]
        handle_subscription_updated(subscription, db)
    elif event["type"] == "customer.subscription.deleted":
        subscription = event["data"]["object"]
        handle_subscription_deleted(subscription, db)

    return {"status": "success"}


def handle_checkout_completed(session, db: Session):
    customer_id = session.get("customer")
    subscription_id = session.get("subscription")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if user:
        user.is_pro = True
        user.stripe_subscription_id = subscription_id
        db.commit()


def handle_subscription_updated(subscription, db: Session):
    customer_id = subscription.get("customer")
    status = subscription.get("status")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if user:
        if status in ["active", "trialing"]:
            user.is_pro = True
        else:
            user.is_pro = False
        db.commit()


def handle_subscription_deleted(subscription, db: Session):
    customer_id = subscription.get("customer")

    user = db.query(User).filter(User.stripe_customer_id == customer_id).first()
    if user:
        user.is_pro = False
        user.stripe_subscription_id = None
        db.commit()
