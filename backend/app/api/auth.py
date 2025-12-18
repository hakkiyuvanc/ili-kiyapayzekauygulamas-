from datetime import datetime, timedelta
from typing import Annotated, Optional
import random

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.core.security import create_access_token, get_password_hash, verify_password
from backend.app.services.crud import UserCRUD
from backend.app.schemas.user import UserCreate, UserResponse, Token, TokenData, UserVerify
from backend.app.models.database import User
from backend.app.core.config import settings
from backend.app.services.email_service import email_service
from backend.app.core.limiter import limiter

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = UserCRUD.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Generate 6-digit code
    verification_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    verification_expires = datetime.utcnow() + timedelta(minutes=15)

    hashed_password = get_password_hash(user.password)
    
    # Create user with UNVERIFIED status
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_verified=False,
        verification_code=verification_code,
        verification_code_expires_at=verification_expires
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send verification email
    await email_service.send_verification_email(new_user.email, verification_code)

    return new_user

@router.post("/verify")
def verify_email(verify_data: UserVerify, db: Session = Depends(get_db)):
    user = UserCRUD.get_user_by_email(db, email=verify_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")
    
    if user.is_verified:
        return {"message": "Email zaten doğrulanmış"}

    if not user.verification_code or user.verification_code != verify_data.code:
        raise HTTPException(status_code=400, detail="Geçersiz doğrulama kodu")
    
    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Doğrulama kodunun süresi dolmuş")
    
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    db.commit()
    
    return {"message": "Email başarıyla doğrulandı"}

@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(request: Request, form_data: Annotated[OAuth2PasswordRequestForm, Depends()], db: Session = Depends(get_db)):
    # OAuth2PasswordRequestForm uses 'username' field, but we treat it as email
    user = UserCRUD.get_user_by_email(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_verified:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email adresinizi doğrulamanız gerekiyor",
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], db: Session = Depends(get_db)):
    from jose import JWTError, jwt
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    user = UserCRUD.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    return user

# Correct implementation: 
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

async def get_optional_current_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme_optional)], 
    db: Session = Depends(get_db)
):
    if not token:
        return None
    try:
        return await get_current_user(token, db)
    except HTTPException:
        return None
@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user
