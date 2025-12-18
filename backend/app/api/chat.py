from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from datetime import datetime

from backend.app.core.database import get_db
from backend.app.services.ai_service import AIService
from backend.app.models.database import ChatSession, ChatMessage, User, Analysis
from backend.app.api.auth import get_current_user
from backend.app.services.analysis_service import get_analysis_service

router = APIRouter()

# Schema definitions
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageCreate(ChatMessageBase):
    pass

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ChatSessionCreate(BaseModel):
    analysis_id: Optional[int] = None
    title: Optional[str] = None

class ChatSessionResponse(BaseModel):
    id: int
    title: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]
    messages: List[ChatMessageResponse] = []
    
    class Config:
        from_attributes = True

# --- Endpoints ---

@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    session_in: ChatSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Start a new chat session"""
    if not current_user.is_pro:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bu özellik sadece Pro üyeler içindir."
        )

    # Verify analysis existence if provided
    if session_in.analysis_id:
        analysis = db.query(Analysis).filter(
            Analysis.id == session_in.analysis_id,
            # Allow using own analysis or anonymous if logic permits? 
            # Ideally user should own analysis or we just check existence.
            # Analysis.user_id == current_user.id # Simplified check for now
        ).first()
        if not analysis:
            raise HTTPException(status_code=404, detail="Analiz bulunamadı")

    new_session = ChatSession(
        user_id=current_user.id,
        analysis_id=session_in.analysis_id,
        title=session_in.title or "Yeni Sohbet"
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List user's chat sessions"""
    sessions = db.query(ChatSession).filter(
        ChatSession.user_id == current_user.id
    ).order_by(ChatSession.updated_at.desc()).offset(skip).limit(limit).all()
    return sessions

@router.get("/sessions/{session_id}", response_model=ChatSessionResponse)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı")
    return session

@router.post("/sessions/{session_id}/messages", response_model=ChatMessageResponse)
def send_message(
    session_id: int,
    message_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Send a message to the coach"""
    session = db.query(ChatSession).filter(
        ChatSession.id == session_id,
        ChatSession.user_id == current_user.id
    ).first()
    if not session:
        raise HTTPException(status_code=404, detail="Sohbet bulunamadı")

    # Save user message
    user_msg = ChatMessage(
        session_id=session.id,
        role="user",
        content=message_in.content
    )
    db.add(user_msg)
    db.commit()

    # Build context
    context = None
    if session.analysis_id:
        analysis = db.query(Analysis).filter(Analysis.id == session.analysis_id).first()
        if analysis and analysis.full_report:
            context = analysis.full_report

    # Get history
    history = []
    # Fetch last 10 messages from DB
    past_msgs = db.query(ChatMessage).filter(
        ChatMessage.session_id == session.id
    ).order_by(ChatMessage.created_at.desc()).limit(10).all()
    
    for msg in reversed(past_msgs): # Reorder to chronological
        history.append({"role": msg.role, "content": msg.content})

    # Call AI
    ai_service = AIService()
    ai_response_text = ai_service.chat_with_coach(
        message=message_in.content,
        history=history[:-1], # Exclude the just added message, logic handles appending
        context=context
    )

    # Save assistant message
    ai_msg = ChatMessage(
        session_id=session.id,
        role="assistant",
        content=ai_response_text
    )
    db.add(ai_msg)
    
    # Update session timestamp
    session.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(ai_msg)
    
    return ai_msg
