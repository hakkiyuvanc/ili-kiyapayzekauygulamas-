import random
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_user_repository
from app.core.limiter import limiter
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.database import User
from app.repositories import UserRepository
from app.schemas.user import Token, TokenData, UserCreate, UserResponse, UserVerify
from app.services.email_service import email_service

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate, repo: UserRepository = Depends(get_user_repository)):
    # Check if email already exists
    if repo.email_exists(user.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    # Generate 6-digit verification code
    verification_code = "".join([str(random.randint(0, 9)) for _ in range(6)])
    verification_expires = datetime.now(timezone.utc) + timedelta(minutes=15)

    hashed_password = get_password_hash(user.password)

    # Create user entity
    new_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        is_verified=False,
        verification_code=verification_code,
        verification_code_expires_at=verification_expires,
    )

    # Save via repository
    created_user = repo.create(new_user)

    # Send verification email
    await email_service.send_verification_email(created_user.email, verification_code)

    return created_user


@router.post("/verify")
def verify_email(verify_data: UserVerify, repo: UserRepository = Depends(get_user_repository)):
    # Find user by email
    user = repo.get_by_email(verify_data.email)
    if not user:
        raise HTTPException(status_code=404, detail="Kullanıcı bulunamadı")

    if user.is_verified:
        return {"message": "Email zaten doğrulanmış"}

    # Validate verification code
    if not user.verification_code or user.verification_code != verify_data.code:
        raise HTTPException(status_code=400, detail="Geçersiz doğrulama kodu")

    if user.verification_code_expires_at and user.verification_code_expires_at < datetime.now(
        timezone.utc
    ):
        raise HTTPException(status_code=400, detail="Doğrulama kodunun süresi dolmuş")

    # Mark as verified
    user.is_verified = True
    user.verification_code = None
    user.verification_code_expires_at = None
    repo.update(user)

    return {"message": "Email başarıyla doğrulandı"}


@router.post("/login", response_model=Token)
@limiter.limit("5/minute")
def login(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    repo: UserRepository = Depends(get_user_repository),
    db: Session = Depends(get_db),
):
    # OAuth2PasswordRequestForm uses 'username' field, but we treat it as email
    user = repo.get_by_email(form_data.username)
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

    # Create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    # Create refresh token
    from app.core.security import create_refresh_token, hash_token
    from app.models.database import RefreshToken

    refresh_token = create_refresh_token(user.id)
    refresh_token_hash = hash_token(refresh_token)

    # Store refresh token in database
    refresh_token_expires = datetime.now(timezone.utc) + timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    )
    db_refresh_token = RefreshToken(
        user_id=user.id,
        token_hash=refresh_token_hash,
        expires_at=refresh_token_expires,
        user_agent=request.headers.get("user-agent"),
        ip_address=request.client.host if request.client else None,
    )
    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    repo: UserRepository = Depends(get_user_repository),
):
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

    user = repo.get_by_email(token_data.email)
    if user is None:
        raise credentials_exception
    return user


# Correct implementation:
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)


async def get_optional_current_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme_optional)],
    repo: UserRepository = Depends(get_user_repository),
):
    if not token:
        return None
    try:
        return await get_current_user(token, repo)
    except HTTPException:
        return None


@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user: Annotated[User, Depends(get_current_user)]):
    return current_user


@router.post("/refresh", response_model=Token)
def refresh_access_token(
    refresh_token: str,
    db: Session = Depends(get_db),
    repo: UserRepository = Depends(get_user_repository),
):
    """Refresh access token using refresh token"""
    from app.core.security import create_access_token, hash_token
    from app.models.database import RefreshToken

    # Hash the provided token
    token_hash = hash_token(refresh_token)

    # Find the refresh token in database
    db_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.is_revoked == False,  # noqa: E712
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
        )

    # Get user
    user = repo.get_by_id(db_token.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/logout")
def logout(
    refresh_token: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Session = Depends(get_db),
):
    """Logout by revoking refresh token"""
    from app.core.security import hash_token
    from app.models.database import RefreshToken

    # Hash the provided token
    token_hash = hash_token(refresh_token)

    # Find and revoke the refresh token
    db_token = (
        db.query(RefreshToken)
        .filter(
            RefreshToken.token_hash == token_hash,
            RefreshToken.user_id == current_user.id,
            RefreshToken.is_revoked == False,  # noqa: E712
        )
        .first()
    )

    if db_token:
        db_token.is_revoked = True
        db_token.revoked_at = datetime.now(timezone.utc)
        db.commit()

    return {"message": "Successfully logged out"}
