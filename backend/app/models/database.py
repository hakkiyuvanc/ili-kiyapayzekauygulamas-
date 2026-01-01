"""Database Models"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.core.database import Base


class User(Base):
    """Kullanıcı modeli"""
    __tablename__ = "users"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String(6), nullable=True)
    verification_code_expires_at = Column(DateTime(timezone=True), nullable=True)
    is_pro = Column(Boolean, default=False)
    subscription_end_date = Column(DateTime(timezone=True), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True, index=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    
    # Onboarding fields
    onboarding_completed = Column(Boolean, default=False)
    goals = Column(JSON, nullable=True) # List of goal strings
    love_language = Column(String(50), nullable=True)
    conflict_resolution_style = Column(String(50), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    coaching_status = relationship("CoachingStatus", back_populates="user", uselist=False, cascade="all, delete-orphan")


class CoachingStatus(Base):
    """Kullanıcının haftalık koçluk durumu"""
    __tablename__ = "coaching_status"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    current_focus_area = Column(String(100), nullable=True) # e.g. "Empathy"
    week_start_date = Column(DateTime(timezone=True), default=func.now())
    completed_tasks = Column(JSON, default=list) # List of task IDs ["task1", "task3"]
    
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    user = relationship("User", back_populates="coaching_status")


class Analysis(Base):
    """Analiz kayıtları"""
    __tablename__ = "analyses"
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

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
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Feedback
    rating = Column(Integer)  # 1-5 yıldız
    is_accurate = Column(Boolean, nullable=True)  # Analiz doğru muydu?
    comment = Column(Text, nullable=True)
    category = Column(String(50), default="general")  # bug, feature, general, other
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class ChatSession(Base):
    """AI Koç ile sohbet oturumları"""
    __tablename__ = "chat_sessions"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    analysis_id = Column(Integer, ForeignKey("analyses.id"), nullable=True)  # Opsiyonel bağlam
    title = Column(String(255), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # İlişkiler
    messages = relationship("ChatMessage", back_populates="session", cascade="all, delete-orphan")


class ChatMessage(Base):
    """Sohbet mesajları"""
    __tablename__ = "chat_messages"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"), nullable=False)
    role = Column(String(50), nullable=False)  # user, assistant, system
    content = Column(Text, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # İlişkiler
    session = relationship("ChatSession", back_populates="messages")


class DailyPulse(Base):
    """Günlük ilişki nabzı/check-in"""
    __tablename__ = "daily_pulses"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(DateTime, nullable=False) # Store as date object or datetime truncated
    
    mood_score = Column(Integer, nullable=False) # 1-10 or 1-5
    connection_score = Column(Integer, nullable=False) # 1-10
    note = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # User relation could be added if needed, but simple FK is enough for now


class APIKey(Base):
    """API Key yönetimi (gelecek için)"""
    __tablename__ = "api_keys"
    __table_args__ = {'extend_existing': True}

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
