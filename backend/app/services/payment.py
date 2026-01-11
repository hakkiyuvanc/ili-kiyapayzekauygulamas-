import logging
from typing import Optional

import stripe
from fastapi import HTTPException, status

from app.core.config import settings

stripe.api_key = settings.STRIPE_API_KEY
logger = logging.getLogger(__name__)


class StripeService:
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> stripe.Customer:
        """Create or retrieve a Stripe customer"""
        try:
            # Check if customer already exists
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                logger.info(f"Existing Stripe customer found for email: {email}")
                return customers.data[0]

            # Create new customer
            customer = stripe.Customer.create(
                email=email,
                name=name,
            )
            logger.info(f"Created new Stripe customer: {customer.id} for email: {email}")
            return customer

        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid Stripe request for customer creation: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid customer data: {str(e)}"
            )
        except stripe.error.AuthenticationError as e:
            logger.error(f"Stripe authentication failed: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Payment service configuration error",
            )
        except stripe.error.APIConnectionError as e:
            logger.error(f"Stripe API connection error: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Payment service temporarily unavailable",
            )
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error during customer creation: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Payment processing error occurred",
            )

    @staticmethod
    def create_checkout_session(
        customer_id: str, success_url: str, cancel_url: str, price_id: str
    ) -> stripe.checkout.Session:
        """Create a Stripe checkout session for subscription"""
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=["card"],
                line_items=[
                    {
                        "price": price_id,
                        "quantity": 1,
                    }
                ],
                mode="subscription",
                success_url=success_url,
                cancel_url=cancel_url,
            )
            logger.info(f"Created checkout session: {session.id} for customer: {customer_id}")
            return session

        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid checkout session request: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid checkout parameters: {str(e)}",
            )
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error during checkout session creation: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create checkout session",
            )

    @staticmethod
    def create_portal_session(customer_id: str, return_url: str) -> stripe.billing_portal.Session:
        """Create a Stripe billing portal session"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            logger.info(f"Created portal session for customer: {customer_id}")
            return session

        except stripe.error.InvalidRequestError as e:
            logger.error(f"Invalid portal session request: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid portal parameters: {str(e)}",
            )
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error during portal session creation: {str(e)}", exc_info=True)
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create billing portal session",
            )

    @staticmethod
    def construct_event(payload: bytes, sig_header: str, webhook_secret: str):
        """Verify and construct a Stripe webhook event"""
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            logger.info(f"Successfully verified webhook event: {event.get('type', 'unknown')}")
            return event

        except ValueError as e:
            logger.warning(f"Invalid webhook payload received: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook payload"
            )
        except stripe.error.SignatureVerificationError as e:
            logger.warning(f"Webhook signature verification failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid webhook signature"
            )
