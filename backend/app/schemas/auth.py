"""Authentication schemas"""

from typing import Optional

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    """Kullanıcı kayıt şeması"""

    email: EmailStr
    password: str = Field(..., min_length=6, max_length=100)
    full_name: Optional[str] = None
    username: Optional[str] = None


class UserLogin(BaseModel):
    """Kullanıcı giriş şeması"""

    email: EmailStr
    password: str


class Token(BaseModel):
    """Token response"""

    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token data"""

    email: Optional[str] = None
    user_id: Optional[int] = None


class UserResponse(BaseModel):
    """Kullanıcı response"""

    id: int
    email: str
    username: Optional[str] = None
    full_name: Optional[str] = None
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
