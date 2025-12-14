"""Database Models"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from backend.app.core.database import Base


class User(Base):
    """Kullanıcı modeli"""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")


class Analysis(Base):
    """Analiz kayıtları"""
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Anonim kullanım için nullable
    
    # Analiz metadata
    format_type = Column(String(50), default="auto")  # auto, whatsapp, simple, plain
    privacy_mode = Column(Boolean, default=True)
    text_length = Column(Integer)
    
    # Skorlar
    overall_score = Column(Float, nullable=False)
    sentiment_score = Column(Float)
    empathy_score = Column(Float)
    conflict_score = Column(Float)
    we_language_score = Column(Float)
    balance_score = Column(Float)
    
    # Rapor (JSON)
    full_report = Column(JSON)
    summary = Column(Text)
    
    # Conversation stats
    message_count = Column(Integer)
    participant_count = Column(Integer)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # İlişkiler
    user = relationship("User", back_populates="analyses")


class AnalysisHistory(Base):
    """Kullanıcı analiz geçmişi - trend tracking için"""
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=False)
    
    # Snapshot of key metrics for trending
    overall_score = Column(Float)
    sentiment_score = Column(Float)
    conflict_score = Column(Float)
    
    analyzed_at = Column(DateTime(timezone=True), server_default=func.now())


class Feedback(Base):
    """Kullanıcı geri bildirimleri"""
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Feedback
    rating = Column(Integer)  # 1-5 yıldız
    is_accurate = Column(Boolean, nullable=True)  # Analiz doğru muydu?
    comment = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class APIKey(Base):
    """API Key yönetimi (gelecek için)"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    key = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(100))  # Key için açıklayıcı isim
    is_active = Column(Boolean, default=True)
    
    # Rate limiting
    requests_per_day = Column(Integer, default=100)
    requests_count = Column(Integer, default=0)
    last_used_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    expires_at = Column(DateTime(timezone=True), nullable=True)
