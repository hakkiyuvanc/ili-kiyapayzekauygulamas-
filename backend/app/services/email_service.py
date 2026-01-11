"""Real Email Service Implementation with SMTP"""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Optional

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """SMTP-based email service for sending transactional emails"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS
        self.enabled = settings.EMAIL_ENABLED

        # Templates directory
        self.templates_dir = Path(__file__).parent / "email_templates"

    async def send_email(
        self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email via SMTP

        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML body content
            text_content: Plain text fallback (optional)

        Returns:
            bool: True if sent successfully, False otherwise
        """
        if not self.enabled:
            logger.warning(f"Email service is disabled. Would send to {to_email}: {subject}")
            return False

        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Add text and HTML parts
            if text_content:
                part1 = MIMEText(text_content, "plain", "utf-8")
                message.attach(part1)

            part2 = MIMEText(html_content, "html", "utf-8")
            message.attach(part2)

            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                use_tls=self.use_tls,
                timeout=10,
            )

            logger.info(f"✅ Email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send email to {to_email}: {str(e)}")
            return False

    def _load_template(self, template_name: str) -> str:
        """Load email template from file"""
        template_path = self.templates_dir / f"{template_name}.html"

        if not template_path.exists():
            logger.warning(f"Template {template_name} not found, using fallback")
            return self._get_fallback_template(template_name)

        try:
            with open(template_path, encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            logger.error(f"Error loading template {template_name}: {e}")
            return self._get_fallback_template(template_name)

    def _render_template(self, template_html: str, context: dict) -> str:
        """Simple template rendering by replacing {{variables}}"""
        rendered = template_html
        for key, value in context.items():
            rendered = rendered.replace(f"{{{{{key}}}}}", str(value))
        return rendered

    async def send_verification_email(self, to_email: str, code: str) -> bool:
        """
        Send verification code email

        Args:
            to_email: User's email address
            code: Verification code

        Returns:
            bool: True if sent successfully
        """
        template = self._load_template("verification")

        html_content = self._render_template(
            template,
            {
                "code": code,
                "app_name": settings.APP_NAME,
                "frontend_url": settings.FRONTEND_URL,
            },
        )

        text_content = (
            f"Merhaba!\n\n"
            f"Hesabını doğrulamak için kodun: {code}\n\n"
            f"Bu kod 10 dakika geçerlidir.\n\n"
            f"{settings.APP_NAME}"
        )

        return await self.send_email(
            to_email=to_email,
            subject=f"{settings.APP_NAME} - Hesap Doğrulama",
            html_content=html_content,
            text_content=text_content,
        )

    async def send_password_reset_email(self, to_email: str, reset_token: str) -> bool:
        """
        Send password reset email

        Args:
            to_email: User's email address
            reset_token: Password reset token

        Returns:
            bool: True if sent successfully
        """
        reset_link = f"{settings.FRONTEND_URL}/auth/reset-password?token={reset_token}"

        template = self._load_template("password_reset")

        html_content = self._render_template(
            template,
            {
                "reset_link": reset_link,
                "app_name": settings.APP_NAME,
                "frontend_url": settings.FRONTEND_URL,
            },
        )

        text_content = (
            f"Merhaba!\n\n"
            f"Şifre sıfırlama talebinde bulundunuz.\n\n"
            f"Şifrenizi sıfırlamak için şu linke tıklayın:\n"
            f"{reset_link}\n\n"
            f"Bu link 1 saat geçerlidir.\n\n"
            f"Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.\n\n"
            f"{settings.APP_NAME}"
        )

        return await self.send_email(
            to_email=to_email,
            subject=f"{settings.APP_NAME} - Şifre Sıfırlama",
            html_content=html_content,
            text_content=text_content,
        )

    def _get_fallback_template(self, template_name: str) -> str:
        """Fallback template if file not found"""
        if template_name == "verification":
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
                    .header {{ text-align: center; color: #4f46e5; }}
                    .code {{ font-size: 32px; font-weight: bold; color: #4f46e5; text-align: center; padding: 20px; background-color: #f0f0f0; border-radius: 8px; margin: 20px 0; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="header">{{app_name}}</h1>
                    <h2>Hesap Doğrulama</h2>
                    <p>Merhaba!</p>
                    <p>Hesabınızı doğrulamak için aşağıdaki kodu kullanın:</p>
                    <div class="code">{{code}}</div>
                    <p>Bu kod 10 dakika geçerlidir.</p>
                    <div class="footer">
                        <p>© 2024 {{app_name}}. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        elif template_name == "password_reset":
            return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
                    .container {{ max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; }}
                    .header {{ text-align: center; color: #4f46e5; }}
                    .button {{ display: inline-block; padding: 12px 30px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
                    .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1 class="header">{{app_name}}</h1>
                    <h2>Şifre Sıfırlama</h2>
                    <p>Merhaba!</p>
                    <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                    <div style="text-align: center;">
                        <a href="{{reset_link}}" class="button">Şifremi Sıfırla</a>
                    </div>
                    <p>Bu link 1 saat geçerlidir.</p>
                    <p>Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.</p>
                    <div class="footer">
                        <p>© 2024 {{app_name}}. Tüm hakları saklıdır.</p>
                    </div>
                </div>
            </body>
            </html>
            """
        return "<html><body><p>{{app_name}}</p></body></html>"


# Singleton instance
email_service = EmailService()
