
import stripe
from typing import Optional
from backend.app.core.config import settings

stripe.api_key = settings.STRIPE_API_KEY

class StripeService:
    @staticmethod
    def create_customer(email: str, name: Optional[str] = None) -> stripe.Customer:
        try:
            # Check if customer already exists
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                return customers.data[0]
            
            # Create new customer
            return stripe.Customer.create(
                email=email,
                name=name,
            )
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe Error: {str(e)}")

    @staticmethod
    def create_checkout_session(customer_id: str, success_url: str, cancel_url: str, price_id: str) -> stripe.checkout.Session:
        try:
            session = stripe.checkout.Session.create(
                customer=customer_id,
                payment_method_types=['card'],
                line_items=[{
                    'price': price_id,
                    'quantity': 1,
                }],
                mode='subscription',
                success_url=success_url,
                cancel_url=cancel_url,
            )
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe Checkout Error: {str(e)}")

    @staticmethod
    def create_portal_session(customer_id: str, return_url: str) -> stripe.billing_portal.Session:
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url,
            )
            return session
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe Portal Error: {str(e)}")
            
    @staticmethod
    def construct_event(payload: bytes, sig_header: str, webhook_secret: str):
        try:
            return stripe.Webhook.construct_event(
                payload, sig_header, webhook_secret
            )
        except ValueError as e:
            raise Exception("Invalid payload")
        except stripe.error.SignatureVerificationError as e:
            raise Exception("Invalid signature")
