"""Sentry error tracking configuration for production"""

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
import os

def init_sentry():
    """Initialize Sentry error tracking and performance monitoring"""
    
    sentry_dsn = os.getenv("SENTRY_DSN", "")
    environment = os.getenv("ENVIRONMENT", "production")
    
    if not sentry_dsn:
        print("⚠️ SENTRY_DSN not configured, error tracking disabled")
        return
    
    try:
        sentry_sdk.init(
            dsn=sentry_dsn,
            environment=environment,
            
            # Performance monitoring (10% of transactions)
            traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
            
            # Profiling (10% of transactions)
            profiles_sample_rate=0.1,
            
            # Integrations
            integrations=[
                FastApiIntegration(
                    transaction_style="endpoint",
                    failed_request_status_codes=[500, 501, 502, 503, 504]
                ),
                SqlalchemyIntegration(),
            ],
            
            # Release tracking
            release=os.getenv("APP_VERSION", "1.0.0"),
            
            # Filter events before sending
            before_send=before_send_hook,
            
            # Additional options
            attach_stacktrace=True,
            send_default_pii=False,  # Don't send PII
        )
        
        print(f"✅ Sentry initialized (env: {environment}, DSN: {sentry_dsn[:30]}...)")
        
    except Exception as e:
        print(f"❌ Failed to initialize Sentry: {e}")

def before_send_hook(event, hint):
    """
    Filter and modify events before sending to Sentry
    """
    
    # Don't send 404 errors
    if event.get("logger") == "uvicorn.error":
        if "404" in str(event.get("message", "")):
            return None
    
    # Don't send health check errors
    if "/health" in str(event.get("request", {}).get("url", "")):
        return None
    
    # Add custom tags
    event.setdefault("tags", {})
    event["tags"]["app"] = "iliski-analiz"
    event["tags"]["component"] = "backend"
    
    # Add user context (if available, without PII)
    # Note: Don't add email or name, just user ID
    if "user" in event:
        user_data = event["user"]
        if "email" in user_data:
            del user_data["email"]  # Remove PII
        if "username" in user_data:
            del user_data["username"]  # Remove PII
    
    return event

def capture_exception(exception: Exception, context: dict = None):
    """
    Manually capture an exception with additional context
    
    Usage:
        try:
            risky_operation()
        except Exception as e:
            capture_exception(e, {"user_id": user_id, "operation": "analysis"})
    """
    if context:
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_context(key, value)
            sentry_sdk.capture_exception(exception)
    else:
        sentry_sdk.capture_exception(exception)

def capture_message(message: str, level: str = "info", context: dict = None):
    """
    Capture a message (not an error) with context
    
    Usage:
        capture_message(
            "User completed onboarding",
            level="info",
            context={"user_id": user_id}
        )
    """
    if context:
        with sentry_sdk.push_scope() as scope:
            for key, value in context.items():
                scope.set_tag(key, str(value))
            sentry_sdk.capture_message(message, level=level)
    else:
        sentry_sdk.capture_message(message, level=level)
