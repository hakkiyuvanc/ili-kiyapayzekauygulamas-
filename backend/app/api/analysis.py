"""Analiz API Endpoints"""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import Request
from backend.app.core.limiter import limiter

from backend.app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    QuickScoreRequest,
    QuickScoreResponse,
    ErrorResponse,
)
from backend.app.services.analysis_service import get_analysis_service
from backend.app.services.crud import AnalysisCRUD
from backend.app.core.database import get_db
from backend.app.api.auth import get_optional_current_user
from backend.app.models.database import User

router = APIRouter()


@router.post(
    "/analyze",
    response_model=AnalysisResponse,
    status_code=status.HTTP_200_OK,
    summary="İlişki Analizi Yap",
    description="Metin veya konuşma verisi üzerinde ilişki analizi yapar ve veritabanına kaydeder",
)
@limiter.limit("5/minute")
async def analyze_text(
    request: Request,
    analysis_request: AnalysisRequest,
    db: Session = Depends(get_db),
    save_to_db: bool = True,
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    İlişki analizi endpoint'i
    
    - **text**: Analiz edilecek metin (konuşma veya düz metin)
    - **format_type**: Metin formatı (auto, whatsapp, simple, plain)
    - **privacy_mode**: Kişisel bilgileri maskele (varsayılan: True)
    - **save_to_db**: Veritabanına kaydet (varsayılan: True)
    """
    service = get_analysis_service()
    
    # Feature Gating: Daily Limit for Free Users
    from datetime import datetime
    from sqlalchemy import func
    from backend.app.models.database import Analysis

    if current_user and not current_user.is_pro:
        today = datetime.utcnow().date()
        daily_count = db.query(Analysis).filter(
            Analysis.user_id == current_user.id,
            func.date(Analysis.created_at) == today
        ).count()
        
        if daily_count >= 1:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ücretsiz planda günlük analiz limiti 1 adettir. Sınırsız analiz için Pro'ya yükseltin."
            )

    # Validasyon
    is_valid, error_msg = service.validate_text(analysis_request.text)
    if not is_valid:
        print(f"VALIDATION ERROR: {error_msg}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    
    # Analiz yap
    result = service.analyze_text(
        text=analysis_request.text,
        format_type=analysis_request.format_type,
        privacy_mode=analysis_request.privacy_mode,
    )
    
    # Hata kontrolü
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Analiz başarısız"),
        )

    # FEATURE GATING: PRO ONLY FEATURES
    if not current_user or not current_user.is_pro:
        # Remove Pro-only features from response
        if "reply_suggestions" in result:
            del result["reply_suggestions"]
            
        # Optional: Limit explicit recommendations to 2 items
        if isinstance(result.get("recommendations"), list) and len(result["recommendations"]) > 2:
            result["recommendations"] = result["recommendations"][:2]
    
    # Veritabanına kaydet
    if save_to_db:
        try:
            db_analysis = AnalysisCRUD.create_analysis(
                db=db,
                report=result,
                user_id=current_user.id if current_user else None,
                format_type=analysis_request.format_type,
                privacy_mode=analysis_request.privacy_mode,
            )
            result["analysis_id"] = db_analysis.id
        except Exception as e:
            # Kaydetme hatası analizi etkilemesin
            print(f"DB Save Error: {e}")
            result["db_save_error"] = str(e)
    
    return result


@router.post(
    "/quick-score",
    response_model=QuickScoreResponse,
    status_code=status.HTTP_200_OK,
    summary="Hızlı Skor Hesapla",
    description="Sadece genel skoru hızlıca hesaplar",
)
async def quick_score(request: QuickScoreRequest):
    """
    Hızlı skor endpoint'i - sadece genel skor döner
    """
    service = get_analysis_service()
    
    # Validasyon
    is_valid, error_msg = service.validate_text(request.text, min_length=10, max_length=10000)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg,
        )
    
    score = service.quick_score(request.text)
    
    return QuickScoreResponse(score=score, status="success")


@router.get(
    "/formats",
    summary="Desteklenen Formatlar",
    description="Desteklenen metin formatlarını listeler",
)
async def get_supported_formats():
    """Desteklenen metin formatları"""
    return {
        "formats": [
            {
                "id": "auto",
                "name": "Otomatik Tespit",
                "description": "Format otomatik olarak tespit edilir",
            },
            {
                "id": "whatsapp",
                "name": "WhatsApp Export",
                "description": "WhatsApp sohbet dışa aktarma formatı",
            },
            {
                "id": "simple",
                "name": "Basit Format",
                "description": "Kişi: Mesaj formatı",
            },
            {
                "id": "plain",
                "name": "Düz Metin",
                "description": "Konuşma olmayan tek bir metin",
            },
        ]
    }


@router.get(
    "/history",
    summary="Analiz Geçmişi",
    description="Kaydedilmiş analizleri listeler",
)
async def get_analysis_history(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
):
    """Son analizleri getir"""
    analyses = AnalysisCRUD.get_recent_analyses(db, skip=skip, limit=limit)
    
    return {
        "total": len(analyses),
        "analyses": [
            {
                "id": a.id,
                "overall_score": a.overall_score,
                "summary": a.summary[:100] + "..." if len(a.summary) > 100 else a.summary,
                "format_type": a.format_type,
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in analyses
        ]
    }


@router.get(
    "/history/{analysis_id}",
    summary="Analiz Detayı",
    description="Belirli bir analizin tam raporunu getirir",
)
async def get_analysis_detail(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    """Analiz detayını getir"""
    analysis = AnalysisCRUD.get_analysis_by_id(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analiz bulunamadı",
        )
    
    return {
        "id": analysis.id,
        "overall_score": analysis.overall_score,
        "metrics": {
            "sentiment": {"score": analysis.sentiment_score},
            "empathy": {"score": analysis.empathy_score},
            "conflict": {"score": analysis.conflict_score},
            "we_language": {"score": analysis.we_language_score},
            "communication_balance": {"score": analysis.balance_score},
        },
        "full_report": analysis.full_report,
        "created_at": analysis.created_at.isoformat() if analysis.created_at else None,
    }


@router.get(
    "/history/{analysis_id}/pdf",
    summary="PDF Rapor İndir",
    description="Analiz sonucunu PDF olarak indir (Sadece Pro)",
)
async def export_pdf(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_current_user),
):
    """Analizi PDF olarak indir"""
    
    # 1. Yetki Kontrolü
    if not current_user or not current_user.is_pro:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="PDF rapor indirme özelliği sadece Pro üyeler içindir."
        )

    # 2. Analizi Getir
    analysis = AnalysisCRUD.get_analysis_by_id(db, analysis_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analiz bulunamadı",
        )
    
    # 3. PDF Oluştur
    from backend.app.services.report_service import get_report_service
    from fastapi.responses import StreamingResponse
    import io

    report_service = get_report_service()
    
    # Veriyi hazırla
    analysis_data = {
        "score": analysis.overall_score,
        "metrics": {
            "sentiment": {"score": analysis.sentiment_score},
            "empathy": {"score": analysis.empathy_score},
            "we_language": {"score": analysis.we_language_score},
        },
        "insights": analysis.full_report.get("insights", []) if analysis.full_report else [],
        "recommendations": analysis.full_report.get("recommendations", []) if analysis.full_report else [],
    }
    
    pdf_bytes = report_service.generate_pdf_report(analysis_data, user_name=current_user.full_name)
    
    # 4. Dosyayı Döndür
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=AMOR_Report_{analysis_id}.pdf"}
    )


@router.delete(
    "/history/{analysis_id}",
    summary="Analiz Sil",
    description="Belirli bir analizi siler",
)
async def delete_analysis(
    analysis_id: int,
    db: Session = Depends(get_db),
):
    """Analizi sil"""
    success = AnalysisCRUD.delete_analysis(db, analysis_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analiz bulunamadı",
        )
    
    return {"message": "Analiz başarıyla silindi", "id": analysis_id}
