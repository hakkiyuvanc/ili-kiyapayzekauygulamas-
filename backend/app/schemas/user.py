from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserVerify(BaseModel):
    email: EmailStr
    code: str

class UserLogin(BaseModel):
    username: str # OAuth2PasswordRequestForm uses username
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_pro: bool = False
    is_verified: bool = False
    subscription_end_date: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
