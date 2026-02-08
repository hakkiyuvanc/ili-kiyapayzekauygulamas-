"""Unit tests for Email Service"""

from unittest.mock import AsyncMock, patch

import pytest

from backend.app.services.email_service import EmailService, email_service


@pytest.fixture
def mock_settings():
    """Mock settings for email service"""
    with patch("backend.app.services.email_service.settings") as mock:
        mock.EMAIL_ENABLED = True
        mock.SMTP_HOST = "smtp.test.com"
        mock.SMTP_PORT = 587
        mock.SMTP_USER = "test@example.com"
        mock.SMTP_PASSWORD = "test-password"
        mock.SMTP_FROM_EMAIL = "noreply@test.com"
        mock.SMTP_FROM_NAME = "Test App"
        mock.SMTP_USE_TLS = True
        mock.APP_NAME = "Test App"
        mock.FRONTEND_URL = "http://localhost:3000"
        yield mock


@pytest.fixture
def email_service_instance(mock_settings):
    """Create email service instance with mocked settings"""
    return EmailService()


class TestEmailService:
    """Test EmailService functionality"""

    @pytest.mark.asyncio
    async def test_send_email_disabled(self, mock_settings):
        """Test that email sending is skipped when disabled"""
        mock_settings.EMAIL_ENABLED = False
        service = EmailService()

        result = await service.send_email(
            to_email="test@example.com", subject="Test", html_content="<p>Test</p>"
        )

        assert result is False

    @pytest.mark.asyncio
    async def test_send_email_success(self, email_service_instance):
        """Test successful email sending"""
        with patch(
            "backend.app.services.email_service.aiosmtplib.send", new_callable=AsyncMock
        ) as mock_send:
            mock_send.return_value = None

            result = await email_service_instance.send_email(
                to_email="recipient@example.com",
                subject="Test Subject",
                html_content="<p>Test HTML</p>",
                text_content="Test Text",
            )

            assert result is True
            mock_send.assert_called_once()

            # Check arguments
            call_args = mock_send.call_args
            assert call_args.kwargs["hostname"] == "smtp.test.com"
            assert call_args.kwargs["port"] == 587
            assert call_args.kwargs["username"] == "test@example.com"

    @pytest.mark.asyncio
    async def test_send_email_failure(self, email_service_instance):
        """Test email sending failure handling"""
        with patch(
            "backend.app.services.email_service.aiosmtplib.send", new_callable=AsyncMock
        ) as mock_send:
            mock_send.side_effect = Exception("SMTP connection failed")

            result = await email_service_instance.send_email(
                to_email="test@example.com", subject="Test", html_content="<p>Test</p>"
            )

            assert result is False

    @pytest.mark.asyncio
    async def test_send_verification_email(self, email_service_instance):
        """Test verification email sending"""
        with patch.object(
            email_service_instance, "send_email", new_callable=AsyncMock
        ) as mock_send:
            mock_send.return_value = True

            result = await email_service_instance.send_verification_email(
                to_email="user@example.com", code="123456"
            )

            assert result is True
            mock_send.assert_called_once()

            # Check call arguments
            call_args = mock_send.call_args
            assert call_args.kwargs["to_email"] == "user@example.com"
            assert "Hesap Doğrulama" in call_args.kwargs["subject"]
            assert "123456" in call_args.kwargs["html_content"]
            assert "123456" in call_args.kwargs["text_content"]

    @pytest.mark.asyncio
    async def test_send_password_reset_email(self, email_service_instance):
        """Test password reset email sending"""
        with patch.object(
            email_service_instance, "send_email", new_callable=AsyncMock
        ) as mock_send:
            mock_send.return_value = True

            result = await email_service_instance.send_password_reset_email(
                to_email="user@example.com", reset_token="abc123xyz"
            )

            assert result is True
            mock_send.assert_called_once()

            # Check call arguments
            call_args = mock_send.call_args
            assert call_args.kwargs["to_email"] == "user@example.com"
            assert "Şifre Sıfırlama" in call_args.kwargs["subject"]
            assert "abc123xyz" in call_args.kwargs["html_content"]

    def test_template_rendering(self, email_service_instance):
        """Test template variable replacement"""
        template = "<p>Hello {{name}}, your code is {{code}}</p>"
        context = {"name": "John", "code": "123456"}

        result = email_service_instance._render_template(template, context)

        assert "Hello John" in result
        assert "your code is 123456" in result
        assert "{{" not in result  # No unrendered variables

    def test_fallback_template_verification(self, email_service_instance):
        """Test fallback template for verification"""
        template = email_service_instance._get_fallback_template("verification")

        assert "{{code}}" in template
        assert "{{app_name}}" in template
        assert "Hesap Doğrulama" in template or "Doğrulama" in template

    def test_fallback_template_password_reset(self, email_service_instance):
        """Test fallback template for password reset"""
        template = email_service_instance._get_fallback_template("password_reset")

        assert "{{reset_link}}" in template
        assert "{{app_name}}" in template
        assert "Şifre" in template


class TestEmailServiceSingleton:
    """Test email service singleton instance"""

    def test_singleton_instance_exists(self):
        """Test that singleton instance is created"""
        assert email_service is not None
        assert isinstance(email_service, EmailService)
