"""Uygulama Konfigürasyonu"""

from typing import List
import os
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Uygulama ayarları"""

    # Application
    APP_NAME: str = "AMOR"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "iliski_analiz"
    # Default to SQLite for local development if not overridden by env var (e.g. Docker)
    DATABASE_URL: str = "sqlite:///./iliski_analiz.db"

    @property
    def SQLALCHEMY_DATABASE_URI(self) -> str:
        # If DATABASE_URL is explicitly set (by env var or default), use it
        if self.DATABASE_URL:
            return self.DATABASE_URL
        # Fallback to constructing Postgres URL (unused if default is set above)
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}/{self.POSTGRES_DB}"

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:8000", 
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000"
    ]

    # ML Settings
    SPACY_MODEL: str = "tr_core_news_lg"
    MAX_TEXT_LENGTH: int = 50000
    MIN_MESSAGE_COUNT: int = 10

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 10

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: List[str] = [".txt", ".json", ".zip"]

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "logs/app.log"

    # AI Settings
    AI_PROVIDER: str = "openai"  # openai, anthropic, none
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-pro"
    AI_ENABLED: bool = True  # AI özelliklerini aç/kapat
    AI_MAX_TOKENS_INSIGHTS: int = 1000
    AI_MAX_TOKENS_RECOMMENDATIONS: int = 800

    # Email Settings
    EMAIL_ENABLED: bool = False  # Email servisi aktif mi?
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "noreply@iliskianaliz.ai"
    SMTP_FROM_NAME: str = "İlişki Analiz AI"
    SMTP_USE_TLS: bool = True

    # Stripe Settings
    STRIPE_API_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Redis Cache (Optional - falls back to in-memory if not configured)
    REDIS_URL: str = ""  # e.g., "redis://localhost:6379/0"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @model_validator(mode='after')
    def validate_critical_settings(self):
        """Validate critical production settings"""
        # Production'da SECRET_KEY zorunlu ve güvenli olmalı
        if self.ENVIRONMENT == 'production':
            if 'change-this' in self.SECRET_KEY.lower():
                raise ValueError(
                    "❌ CRITICAL: SECRET_KEY must be changed in production! "
                    "Set a secure SECRET_KEY in your .env file (minimum 32 characters)."
                )
            if len(self.SECRET_KEY) < 32:
                raise ValueError(
                    "❌ CRITICAL: SECRET_KEY must be at least 32 characters long! "
                    f"Current length: {len(self.SECRET_KEY)}"
                )
        
        # Email servisi aktifse SMTP ayarları kontrolü
        if self.EMAIL_ENABLED:
            if not all([self.SMTP_HOST, self.SMTP_USER, self.SMTP_PASSWORD]):
                raise ValueError(
                    "❌ Email is enabled but SMTP settings are incomplete! "
                    "Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in your .env file."
                )
        
        return self



settings = Settings()
