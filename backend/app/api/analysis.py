"""Analiz API Endpoints"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.api.auth import get_optional_current_user
from app.core.database import get_db
from app.core.features import FREE_TIER_DAILY_ANALYSIS_LIMIT, PRO_ONLY_FEATURES
from app.core.limiter import limiter
from app.models.database import Analysis, User
from app.schemas.analysis import (
    AnalysisRequest,
    AnalysisResponse,
    QuickScoreRequest,
    QuickScoreResponse,
    RewriteRequest,
    RewriteResponse,
)
from app.services.analysis_service import get_analysis_service
from app.services.crud import AnalysisCRUD

logger = logging.getLogger(__name__)
router = APIRouter()


# OPTIONS handler for CORS preflight
@router.options("/analyze")
async def analyze_options():
    """Handle CORS preflight for /analyze endpoint"""
    return {}


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
    current_user: Optional[User] = Depends(get_optional_current_user),
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

    from app.services.cache_service import cache_service

    if current_user and not current_user.is_pro:
        today = datetime.now(timezone.utc).date()

        # Cache key for daily count (per user, per day)
        cache_key = f"daily_analysis_count:{current_user.id}:{today.isoformat()}"

        # Try to get from cache first
        daily_count = cache_service.get(cache_key)

        if daily_count is None:
            # Cache miss - query database
            daily_count = (
                db.query(Analysis)
                .filter(
                    Analysis.user_id == current_user.id, func.date(Analysis.created_at) == today
                )
                .count()
            )

            # Cache for 5 minutes (300 seconds)
            cache_service.set(cache_key, daily_count, ttl_seconds=300)
            logger.debug(f"Cached daily count for user {current_user.id}: {daily_count}")
        else:
            logger.debug(
                f"Retrieved daily count from cache for user {current_user.id}: {daily_count}"
            )

        if daily_count >= FREE_TIER_DAILY_ANALYSIS_LIMIT:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Ücretsiz planda günlük analiz limiti {FREE_TIER_DAILY_ANALYSIS_LIMIT} adettir. Sınırsız analiz için Pro'ya yükseltin.",
            )

    # Validasyon
    is_valid, error_msg = service.validate_text(analysis_request.text)
    if not is_valid:
        logger.warning(
            f"Validation failed for analysis request: {error_msg}",
            extra={
                "user_id": current_user.id if current_user else None,
                "text_length": len(analysis_request.text),
            },
        )
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
    # Use centralized feature list from features.py

    def filter_pro_features(result: dict, is_pro: bool) -> dict:
        """Remove Pro-only features from result if user is not Pro"""
        if not is_pro:
            for feature in PRO_ONLY_FEATURES:
                result.pop(feature, None)

            # Limit recommendations for free users (first 2 only)
            if isinstance(result.get("recommendations"), list):
                if len(result["recommendations"]) > 2:
                    result["recommendations"] = result["recommendations"][:2]
                    logger.debug("Limited recommendations to 2 for free user")
        return result

    # Apply feature gating
    if not current_user or not current_user.is_pro:
        result = filter_pro_features(result, is_pro=False)
        logger.debug(f"Applied feature gating for {'guest' if not current_user else 'free'} user")

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
            logger.error(
                f"Failed to save analysis to database: {str(e)}",
                exc_info=True,
                extra={
                    "user_id": current_user.id if current_user else None,
                    "analysis_summary": result.get("summary", "")[:100],
                },
            )
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
        ],
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
            detail="PDF rapor indirme özelliği sadece Pro üyeler içindir.",
        )

    # 2. Analizi Getir
    analysis = AnalysisCRUD.get_analysis_by_id(db, analysis_id)
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analiz bulunamadı",
        )

    # 3. PDF Oluştur
    import io

    from fastapi.responses import StreamingResponse

    from app.services.report_service import get_report_service

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
        "recommendations": (
            analysis.full_report.get("recommendations", []) if analysis.full_report else []
        ),
    }

    pdf_bytes = report_service.generate_pdf_report(analysis_data, user_name=current_user.full_name)

    # 4. Dosyayı Döndür
    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=AMOR_Report_{analysis_id}.pdf"},
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


@router.post(
    "/rewrite",
    response_model=RewriteResponse,
    status_code=status.HTTP_200_OK,
    summary="Mesajı Yeniden Yaz",
    description="Verilen mesajı belirtilen tonda yeniden yazar (Mock/Rule-based for MVP)",
)
async def rewrite_message(
    request: RewriteRequest, current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Mesaj tonu değiştirme endpoint'i.
    Şimdilik basit kural tabanlı veya mock yanıt döner.
    İleride LLM entegrasyonu yapılabilir.
    """

    # Simple Mock Logic for MVP
    text = request.text
    tone = request.target_tone
    rewritten = text

    if tone == "polite":
        rewritten = f"Rica etsem, {text.lower()} olabilir mi?"
        if "yap" in text.lower():
            rewritten = text.replace("yap", "yapabilir misin lütfen")
        elif "gel" in text.lower():
            rewritten = text.replace("gel", "gelirsen çok sevinirim")

    elif tone == "professional":
        rewritten = f"Sayın ilgili, {text} hususunda geri dönüşünüzü rica ederim."

    elif tone == "romantic":
        rewritten = f"Canım, {text.lower()} ❤️"

    elif tone == "assertive":
        rewritten = f"Şunu netleştirelim: {text}."

    # Fallback if text is long/complex, just append prefix for demo
    if rewritten == text:
        prefixes = {
            "polite": "Çok nazikçe ifade etmek gerekirse: ",
            "professional": "Profesyonel bir dille: ",
            "romantic": "Aşkım, ",
            "assertive": "Net bir şekilde: ",
        }
        rewritten = prefixes.get(tone, "") + text

    return RewriteResponse(original_text=text, rewritten_text=rewritten, tone=tone)


@router.post(
    "/analyze-screenshot",
    status_code=status.HTTP_200_OK,
    summary="Screenshot Analizi (Vision API)",
    description="Ekran görüntüsünden metin çıkarır ve duygusal analiz yapar (GPT-4o Vision)",
)
@limiter.limit("3/minute")
async def analyze_screenshot(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Screenshot analizi endpoint'i (V2.0)
    
    - Kullanıcı base64 encoded image gönderir
    - GPT-4o Vision ile OCR + duygusal analiz yapılır
    - Çıkarılan metin otomatik olarak analiz edilir
    """
    from fastapi import File, UploadFile
    import base64
    
    from app.services.vision_service import get_vision_service
    
    # Pro feature check
    if not current_user or not current_user.is_pro:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Screenshot analizi özelliği sadece Pro üyeler içindir.",
        )
    
    # Get image from request
    try:
        body = await request.json()
        image_data_base64 = body.get("image")
        image_format = body.get("format", "png")  # png, jpg, jpeg
        
        if not image_data_base64:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image data is required (base64 encoded)",
            )
        
        # Decode base64
        # Remove data URL prefix if present (data:image/png;base64,...)
        if "base64," in image_data_base64:
            image_data_base64 = image_data_base64.split("base64,")[1]
        
        image_bytes = base64.b64decode(image_data_base64)
        
    except Exception as e:
        logger.error(f"Failed to parse image data: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image data: {str(e)}",
        )
    
    # Analyze with Vision API
    vision_service = get_vision_service()
    
    try:
        vision_result = vision_service.analyze_screenshot(image_bytes, image_format)
        
        # Extract text from vision result
        extracted_text = vision_result.get("cikarilan_metin", "")
        
        if not extracted_text or len(extracted_text) < 20:
            return {
                "status": "warning",
                "message": "Ekran görüntüsünden yeterli metin çıkarılamadı",
                "vision_analysis": vision_result,
                "extracted_text": extracted_text,
            }
        
        # Run full analysis on extracted text
        service = get_analysis_service()
        analysis_result = service.analyze_text(
            text=extracted_text,
            format_type="auto",
            privacy_mode=True,
        )
        
        # Combine vision + analysis results
        combined_result = {
            "status": "success",
            "vision_analysis": vision_result,
            "extracted_text": extracted_text,
            "message_count": vision_result.get("mesaj_sayisi", 0),
            "analysis": analysis_result,
        }
        
        # Save to database
        try:
            db_analysis = AnalysisCRUD.create_analysis(
                db=db,
                report=combined_result,
                user_id=current_user.id,
                format_type="screenshot",
                privacy_mode=True,
            )
            combined_result["analysis_id"] = db_analysis.id
        except Exception as e:
            logger.error(f"Failed to save screenshot analysis: {e}")
            combined_result["db_save_error"] = str(e)
        
        logger.info(
            "Screenshot analysis completed",
            extra={
                "user_id": current_user.id,
                "extracted_length": len(extracted_text),
                "message_count": vision_result.get("mesaj_sayisi", 0),
            },
        )
        
        return combined_result
        
    except Exception as e:
        logger.error(
            "Screenshot analysis failed",
            extra={"error": str(e), "user_id": current_user.id},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Screenshot analizi başarısız: {str(e)}",
        )


@router.post(
    "/analyze-v2",
    status_code=status.HTTP_200_OK,
    summary="Gelişmiş İlişki Analizi (V2.0 - Gottman)",
    description="Gottman metriklerini içeren kapsamlı ilişki raporu oluşturur",
)
@limiter.limit("5/minute")
async def analyze_v2(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    V2.0 Analiz endpoint'i - Gottman-based structured report
    
    Request body:
    {
        "text": "conversation text",
        "model_preference": "fast" | "deep",
        "format_type": "auto" | "whatsapp" | "telegram" | "instagram"
    }
    """
    from app.services.ai_service import get_ai_service
    
    try:
        body = await request.json()
        text = body.get("text")
        model_preference = body.get("model_preference", "fast")
        format_type = body.get("format_type", "auto")
        
        if not text:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Text is required",
            )
        
        # Validate text
        service = get_analysis_service()
        is_valid, error_msg = service.validate_text(text)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg,
            )
        
        # Run basic analysis first
        basic_result = service.analyze_text(
            text=text,
            format_type=format_type,
            privacy_mode=True,
        )
        
        # Get AI service for Gottman report
        ai_service = get_ai_service()
        
        # Generate comprehensive Gottman report
        gottman_report = ai_service.generate_relationship_report(
            conversation_text=text,
            metrics=basic_result.get("metrics", {}),
            model_preference=model_preference,
        )
        
        # Combine results
        v2_result = {
            "status": "success",
            "version": "2.0",
            "basic_metrics": basic_result.get("metrics", {}),
            "gottman_report": gottman_report,
            "summary": basic_result.get("summary", ""),
        }
        
        # Save to database
        if current_user:
            try:
                db_analysis = AnalysisCRUD.create_analysis(
                    db=db,
                    report=v2_result,
                    user_id=current_user.id,
                    format_type=format_type,
                    privacy_mode=True,
                )
                v2_result["analysis_id"] = db_analysis.id
            except Exception as e:
                logger.error(f"Failed to save V2 analysis: {e}")
                v2_result["db_save_error"] = str(e)
        
        logger.info(
            "V2 analysis completed",
            extra={
                "user_id": current_user.id if current_user else None,
                "model_preference": model_preference,
                "gottman_health": gottman_report.get("genel_karne", {}).get("iliskki_sagligi", 0),
            },
        )
        
        return v2_result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(
            "V2 analysis failed",
            extra={"error": str(e)},
            exc_info=True,
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analiz başarısız: {str(e)}",
        )


# ============================================================================
# MAGIC FEATURES (V2.0 - Stage 3)
# ============================================================================

@router.post(
    "/heatmap",
    status_code=status.HTTP_200_OK,
    summary="Tansiyon Haritası (Heatmap)",
    description="Konuşmanın hangi saatlerde ve konularda gerildiğini analiz eder",
)
async def generate_heatmap(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Conversation heatmap endpoint"""
    from app.services.heatmap_service import get_heatmap_service
    
    try:
        body = await request.json()
        messages = body.get("messages", [])
        
        if not messages:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Messages are required",
            )
        
        heatmap_service = get_heatmap_service()
        heatmap_data = heatmap_service.analyze_heatmap(messages)
        
        return {"status": "success", "heatmap": heatmap_data}
    except Exception as e:
        logger.error(f"Heatmap failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/tone-shift", status_code=status.HTTP_200_OK)
@limiter.limit("10/minute")
async def shift_message_tone(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Tone shifter endpoint (Pro only)"""
    from app.services.tone_shifter import get_tone_shifter
    
    if not current_user or not current_user.is_pro:
        raise HTTPException(status_code=403, detail="Pro only")
    
    body = await request.json()
    tone_shifter = get_tone_shifter()
    result = tone_shifter.shift_tone(
        body.get("message"),
        body.get("target_tone", "yaratici"),
        body.get("context", "")
    )
    return {"status": "success", **result}


@router.post("/future-projection", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def project_future(
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """Future projection endpoint (Pro only)"""
    from app.services.ai_projection import get_ai_projection
    
    if not current_user or not current_user.is_pro:
        raise HTTPException(status_code=403, detail="Pro only")
    
    body = await request.json()
    projection_service = get_ai_projection()
    projection = projection_service.project_future(
        body.get("metrics", {}),
        body.get("gottman_report"),
        body.get("timeframe_months", 6)
    )
    return {"status": "success", "projection": projection}
