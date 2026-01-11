from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.database import get_db
from app.models.database import User
from app.services.crud import AnalysisCRUD

router = APIRouter()


@router.get("/user-stats", summary="Kullanıcı İstatistikleri")
async def get_user_stats(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    Kullanıcının haftalık skoru, serisi ve toplam analiz sayısını getirir.
    """
    stats = AnalysisCRUD.get_user_stats(db, current_user.id)
    return stats
