"""License Manager Service - Ticari Lisanslama

Kullanıcının Pro özelliklerine erişimini kontrol eden,
lisans anahtarlarını doğrulayan servis.
"""

import hashlib
import logging
from typing import Any

from sqlalchemy.orm import Session

from app.models.database import User

logger = logging.getLogger(__name__)


class LicenseManager:
    """License validation and management"""

    def __init__(self):
        # Secret seed for license generation (should be in env vars)
        self.license_secret = "AMOR_AI_V2_SECRET_KEY_2025"

    def validate_license(self, license_key: str) -> dict[str, Any]:
        """
        Lisans anahtarını doğrula

        Format: AMOR-XXXX-YYYY-ZZZZ (X: Type, Y: Date, Z: Checksum)
        """
        if not license_key or len(license_key) < 20:
            return {"valid": False, "message": "Geçersiz lisans formatı"}

        try:
            parts = license_key.split("-")
            if len(parts) != 4 or parts[0] != "AMOR":
                return {"valid": False, "message": "Geçersiz lisans öneki"}

            license_type_code = parts[1]
            date_code = parts[2]
            checksum = parts[3]

            # Recalculate checksum
            expected_checksum = self._generate_checksum(license_type_code + date_code)

            if checksum != expected_checksum:
                return {"valid": False, "message": "Lisans anahtarı geçersiz (checksum)"}

            # Decode type
            license_type = "pro" if license_type_code.startswith("PRO") else "basic"

            # Decode expiry (simplified for demo)
            # In production, use encrypted payload

            return {
                "valid": True,
                "type": license_type,
                "message": "Lisans başarıyla doğrulandı",
                "features": (
                    ["heatmap", "tone_shift", "projection"] if license_type == "pro" else []
                ),
            }

        except Exception as e:
            logger.error(f"License validation failed: {e}")
            return {"valid": False, "message": "Lisans doğrulama hatası"}

    def activate_license(self, db: Session, user_id: int, license_key: str) -> bool:
        """Kullanıcı için lisansı aktif et"""
        validation = self.validate_license(license_key)

        if not validation["valid"]:
            return False

        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                return False

            user.is_pro = True
            # Store license key/expiry in user meta or separate table
            # user.license_key = license_key

            db.commit()
            return True

        except Exception as e:
            logger.error(f"License activation failed: {e}")
            db.rollback()
            return False

    def check_pro_status(self, user: User) -> bool:
        """Kullanıcının Pro durumunu kontrol et"""
        if not user:
            return False
        return user.is_pro

    def _generate_checksum(self, data: str) -> str:
        """Generate short checksum from data + secret"""
        payload = f"{data}{self.license_secret}"
        return hashlib.md5(payload.encode()).hexdigest()[:4].upper()


# Singleton
_license_manager_instance = None


def get_license_manager() -> LicenseManager:
    """License manager singleton"""
    global _license_manager_instance
    if _license_manager_instance is None:
        _license_manager_instance = LicenseManager()
    return _license_manager_instance
