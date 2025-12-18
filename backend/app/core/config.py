"""Uygulama Konfigürasyonu"""

from typing import List
import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Uygulama ayarları"""

    # Application
    APP_NAME: str = "İlişki Analiz AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True
    ENVIRONMENT: str = "development"

    # Server
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    # Database
    DATABASE_URL: str = "sqlite:///./iliski_analiz.db"

    # Security
    SECRET_KEY: str = "change-this-secret-key-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8000", "http://localhost:3001"]

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

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )



settings = Settings()
