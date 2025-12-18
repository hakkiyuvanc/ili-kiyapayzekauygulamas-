from datetime import datetime

class EmailService:
    @staticmethod
    async def send_verification_email(to_email: str, code: str):
        """
        Sends a verification email to the user.
        Currently a MOCK implementation that prints to console using print() for visibility.
        """
        print(f"============================================================")
        print(f"EMAIL SENT TO: {to_email}")
        print(f"SUBJECT: İlişki Analizi AI - Doğrulama Kodu")
        print(f"BODY: Merhaba! Hesabını doğrulamak için kodun: {code}")
        print(f"TIMESTAMP: {datetime.now()}")
        print(f"============================================================")
        return True

email_service = EmailService()
