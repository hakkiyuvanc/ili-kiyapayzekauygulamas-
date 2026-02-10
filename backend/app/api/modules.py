"""Stage 3 Module Endpoints: Tone Shifter, Love Language, Conflict Solver"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.database import User
from app.services.ai_service import get_ai_service
from app.services.love_language_service import get_love_language_service

router = APIRouter(prefix="/modules", tags=["modules"])


# ==================== Pydantic Schemas ====================

class ToneShiftRequest(BaseModel):
    message: str
    target_tone: str = "polite"  # polite, empathetic, assertive, calm


class ToneShiftResponse(BaseModel):
    original: str
    rewritten: str
    tone: str
    explanation: str


class ConflictActionRequest(BaseModel):
    conversation_text: str


class ConflictActionResponse(BaseModel):
    action: str
    reason: str
    how: str
    priority: str


class LoveLanguageAnswers(BaseModel):
    answers: dict[int, str]  # {question_id: selected_language_key}


class LoveLanguageResult(BaseModel):
    primary_language: str
    primary_key: str
    secondary_language: str | None
    secondary_key: str | None
    scores: dict[str, float]
    description: str
    recommendations: list[str]


# ==================== Endpoints ====================

@router.post("/tone-shift", response_model=ToneShiftResponse)
async def shift_tone(
    request: ToneShiftRequest,
    current_user: User = Depends(get_current_user)
):
    """Rewrite message in a different tone (Tone Shifter)
    
    **Tones:**
    - `polite`: Kibarca ve saygılı
    - `empathetic`: Empatik ve anlayışlı
    - `assertive`: Net ve kendinden emin
    - `calm`: Sakin ve yapıcı
    """
    ai_service = get_ai_service()
    
    result = ai_service.tone_shift(
        message=request.message,
        target_tone=request.target_tone
    )
    
    return ToneShiftResponse(**result)


@router.post("/conflict-action", response_model=ConflictActionResponse)
async def suggest_conflict_action(
    request: ConflictActionRequest,
    current_user: User = Depends(get_current_user)
):
    """Get immediate action suggestion for conflict resolution"""
    ai_service = get_ai_service()
    
    result = ai_service.suggest_conflict_action(
        conversation_text=request.conversation_text
    )
    
    return ConflictActionResponse(**result)


@router.get("/love-language/questions")
async def get_love_language_questions():
    """Get love language test questions"""
    service = get_love_language_service()
    return {"questions": service.get_questions()}


@router.post("/love-language/calculate", response_model=LoveLanguageResult)
async def calculate_love_language(
    request: LoveLanguageAnswers,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Calculate love language from test answers and save to database"""
    service = get_love_language_service()
    
    # Calculate results
    result = service.calculate_results(request.answers)
    
    # Save to database
    from app.models.database import LoveLanguageTest
    
    test_record = LoveLanguageTest(
        user_id=current_user.id,
        primary_language=result["primary_key"],
        secondary_language=result.get("secondary_key"),
        scores=result["scores"],
        answers=request.answers
    )
    
    db.add(test_record)
    db.commit()
    
    return LoveLanguageResult(**result)


@router.get("/love-language/history")
async def get_love_language_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get user's love language test history"""
    from app.models.database import LoveLanguageTest
    
    tests = (
        db.query(LoveLanguageTest)
        .filter(LoveLanguageTest.user_id == current_user.id)
        .order_by(LoveLanguageTest.created_at.desc())
        .limit(10)
        .all()
    )
    
    return {
        "tests": [
            {
                "id": t.id,
                "primary_language": t.primary_language,
                "secondary_language": t.secondary_language,
                "scores": t.scores,
                "created_at": t.created_at.isoformat() if t.created_at else None
            }
            for t in tests
        ]
    }
