"""Unit tests for Configuration Validation"""

import pytest
from pydantic import ValidationError

from backend.app.core.config import Settings


class TestConfigValidation:
    """Test configuration validation rules"""

    def test_development_allows_default_secret_key(self, monkeypatch):
        """Development mode should allow default SECRET_KEY"""
        monkeypatch.setenv("ENVIRONMENT", "development")
        monkeypatch.setenv("SECRET_KEY", "change-this-secret-key-in-production")

        # Should not raise error in development
        settings = Settings()
        assert settings.ENVIRONMENT == "development"
        assert "change-this" in settings.SECRET_KEY.lower()

    def test_production_rejects_default_secret_key(self, monkeypatch):
        """Production mode should reject default SECRET_KEY"""
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("SECRET_KEY", "change-this-secret-key-in-production")

        # Should raise ValueError in production
        with pytest.raises(ValidationError) as exc_info:
            Settings()

        assert "SECRET_KEY must be changed in production" in str(exc_info.value)

    def test_production_rejects_short_secret_key(self, monkeypatch):
        """Production mode should reject SECRET_KEY shorter than 32 chars"""
        monkeypatch.setenv("ENVIRONMENT", "production")
        monkeypatch.setenv("SECRET_KEY", "short-key-12345")  # Less than 32 chars

        with pytest.raises(ValidationError) as exc_info:
            Settings()

        assert "at least 32 characters" in str(exc_info.value)

    def test_production_accepts_secure_secret_key(self, monkeypatch):
        """Production mode should accept valid SECRET_KEY"""
        monkeypatch.setenv("ENVIRONMENT", "production")
        secure_key = "a" * 32  # 32 character key
        monkeypatch.setenv("SECRET_KEY", secure_key)

        # Should not raise error
        settings = Settings()
        assert settings.ENVIRONMENT == "production"
        assert len(settings.SECRET_KEY) >= 32

    def test_email_enabled_requires_smtp_settings(self, monkeypatch):
        """EMAIL_ENABLED=true should require SMTP settings"""
        monkeypatch.setenv("EMAIL_ENABLED", "true")
        monkeypatch.setenv("SMTP_HOST", "")
        monkeypatch.setenv("SMTP_USER", "")
        monkeypatch.setenv("SMTP_PASSWORD", "")

        with pytest.raises(ValidationError) as exc_info:
            Settings()

        assert "SMTP settings are incomplete" in str(exc_info.value)

    def test_email_disabled_allows_empty_smtp(self, monkeypatch):
        """EMAIL_ENABLED=false should allow empty SMTP settings"""
        monkeypatch.setenv("EMAIL_ENABLED", "false")
        monkeypatch.setenv("SMTP_HOST", "")
        monkeypatch.setenv("SMTP_USER", "")
        monkeypatch.setenv("SMTP_PASSWORD", "")

        # Should not raise error
        settings = Settings()
        assert settings.EMAIL_ENABLED is False

    def test_email_enabled_with_complete_smtp(self, monkeypatch):
        """EMAIL_ENABLED=true with complete SMTP settings should work"""
        monkeypatch.setenv("EMAIL_ENABLED", "true")
        monkeypatch.setenv("SMTP_HOST", "smtp.gmail.com")
        monkeypatch.setenv("SMTP_USER", "test@example.com")
        monkeypatch.setenv("SMTP_PASSWORD", "test-password")

        # Should not raise error
        settings = Settings()
        assert settings.EMAIL_ENABLED is True
        assert settings.SMTP_HOST == "smtp.gmail.com"


class TestConfigDefaults:
    """Test configuration default values"""

    def test_default_values(self):
        """Test default configuration values"""
        settings = Settings()

        assert settings.APP_NAME == "AMOR"
        assert settings.PORT == 8000
        assert settings.ALGORITHM == "HS256"
        assert settings.SMTP_PORT == 587
        assert settings.SMTP_USE_TLS is True

    def test_smtp_default_from_email(self):
        """Test default SMTP from email"""
        settings = Settings()
        assert settings.SMTP_FROM_EMAIL == "noreply@iliskianaliz.ai"
        assert settings.SMTP_FROM_NAME == "İlişki Analiz AI"
