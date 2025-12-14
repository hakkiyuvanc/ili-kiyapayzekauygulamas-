"""Authentication API endpoints"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.app.schemas.auth import UserRegister, UserLogin, Token, UserResponse
from backend.app.services.crud import UserCRUD
from backend.app.core.database import get_db
from backend.app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)

router = APIRouter()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Mevcut kullanıcıyı token'dan al"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Kimlik doğrulanamadı",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
    
    user = UserCRUD.get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    
    return user


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Kullanıcı Kaydı",
)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Yeni kullanıcı kaydı"""
    
    # Email kontrolü
    existing_user = UserCRUD.get_user_by_email(db, email=user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bu email zaten kayıtlı",
        )
    
    # Şifreyi hashle
    hashed_password = get_password_hash(user_data.password)
    
    # Kullanıcı oluştur
    user = UserCRUD.create_user(
        db=db,
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        username=user_data.username,
    )
    
    return user


@router.post(
    "/login",
    response_model=Token,
    summary="Kullanıcı Girişi",
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """Kullanıcı giriş - token al"""
    
    # Kullanıcı kontrolü
    user = UserCRUD.get_user_by_email(db, email=form_data.username)  # OAuth2 username field kullanır
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Şifre kontrolü
    if not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Token oluştur
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    
    return {"access_token": access_token, "token_type": "bearer"}


@router.post(
    "/login-json",
    response_model=Token,
    summary="JSON ile Kullanıcı Girişi",
)
async def login_json(user_data: UserLogin, db: Session = Depends(get_db)):
    """JSON body ile kullanıcı girişi"""
    
    user = UserCRUD.get_user_by_email(db, email=user_data.email)
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email veya şifre hatalı",
        )
    
    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {"access_token": access_token, "token_type": "bearer"}


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Profil Bilgileri",
)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Mevcut kullanıcının profil bilgilerini getir"""
    return current_user
