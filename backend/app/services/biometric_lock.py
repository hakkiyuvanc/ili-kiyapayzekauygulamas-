"""Biometric Lock Service - Face ID / Touch ID

Electron uygulaması için biyometrik kilitleme.
Hassas ilişki verilerini korumak için.
"""

import logging
from typing import Any

logger = logging.getLogger(__name__)


class BiometricLock:
    """Biometric authentication service for Electron"""

    def __init__(self):
        self.is_locked = True
        self.lock_timeout_minutes = 5  # Auto-lock after 5 minutes

    def authenticate(self, method: str = "auto") -> dict[str, Any]:
        """
        Biyometrik doğrulama yap

        Args:
            method: "face_id", "touch_id", "fingerprint", "auto"

        Returns:
            Authentication result
        """
        # Bu servis Electron tarafında çalışacak
        # Python backend'de sadece placeholder

        logger.info(f"Biometric authentication requested: {method}")

        return {
            "authenticated": False,
            "method": method,
            "message": "Biometric authentication must be implemented in Electron app",
            "electron_ipc_required": True,
        }

    def lock_app(self) -> dict[str, Any]:
        """Uygulamayı kilitle"""
        self.is_locked = True
        logger.info("App locked")

        return {
            "locked": True,
            "message": "Uygulama kilitlendi. Devam etmek için biyometrik doğrulama gerekli.",
        }

    def unlock_app(self, auth_token: str) -> dict[str, Any]:
        """Uygulamanın kilidini aç"""
        # Token doğrulama (Electron'dan gelecek)
        if self._validate_auth_token(auth_token):
            self.is_locked = False
            logger.info("App unlocked successfully")
            return {
                "unlocked": True,
                "message": "Uygulama kilidi açıldı",
            }

        return {
            "unlocked": False,
            "message": "Doğrulama başarısız",
        }

    def _validate_auth_token(self, token: str) -> bool:
        """Auth token doğrula"""
        # Placeholder - Electron IPC ile entegre edilecek
        return len(token) > 10


# Singleton
_biometric_lock_instance = None


def get_biometric_lock() -> BiometricLock:
    """Biometric lock singleton"""
    global _biometric_lock_instance
    if _biometric_lock_instance is None:
        _biometric_lock_instance = BiometricLock()
    return _biometric_lock_instance
