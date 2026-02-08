"""File Upload API Endpoints"""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.api.auth import get_optional_current_user
from app.core.database import get_db
from app.core.file_utils import FileValidator, WhatsAppFileParser
from app.models.database import User
from app.schemas.analysis import AnalysisResponse, V2AnalysisResult
from app.schemas.file import FileUploadResponse
from app.services.ai_service import get_ai_service
from app.services.analysis_service import get_analysis_service
from app.services.crud import AnalysisCRUD

router = APIRouter()


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    summary="Dosya Yükle ve Önizle",
    description="Dosya yükle, içeriğini doğrula ve önizleme oluştur",
)
async def upload_file(
    file: UploadFile = File(..., description="Analiz edilecek dosya (txt, json, zip)")
):
    """
    Dosya yükle ve önizleme

    - **file**: WhatsApp export veya konuşma dosyası
    """
    # Validate file
    is_valid, error_msg = FileValidator.validate_file(file)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # Read content
    if file.filename.endswith(".zip"):
        content_bytes = await file.read()
        text = FileValidator.extract_from_zip(content_bytes)
    else:
        text = await FileValidator.read_file_content(file)

    # Detect format
    is_whatsapp = WhatsAppFileParser.detect_whatsapp_format(text)
    format_detected = "whatsapp" if is_whatsapp else "simple"

    # Clean WhatsApp metadata if needed
    if is_whatsapp:
        text = WhatsAppFileParser.clean_whatsapp_metadata(text)

    # Parse to get message count
    from backend.ml.preprocessing.conversation_parser import ConversationParser

    parser = ConversationParser()
    parsed = parser.parse(text, format_type=format_detected)
    message_count = parsed.get("stats", {}).get("total_messages", 0)

    # Create preview (first 200 chars)
    preview = text[:200] + "..." if len(text) > 200 else text

    return FileUploadResponse(
        filename=file.filename,
        size=len(text),
        format_detected=format_detected,
        message_count=message_count,
        text_preview=preview,
        status="success",
    )


@router.post(
    "/upload-and-analyze",
    response_model=AnalysisResponse,
    summary="Dosya Yükle ve Analiz Et",
    description="Dosya yükle (Metin veya Ses) ve direkt analiz yap",
)
async def upload_and_analyze(
    file: UploadFile = File(..., description="Analiz edilecek dosya (txt, pdf, mp3, ogg, wap)"),
    privacy_mode: bool = True,
    save_to_db: bool = True,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Dosya yükle ve direkt analiz et.
    Ses dosyalarını otomatik olarak metne çevirir (Sadece Pro).
    """

    # 1. Ses Dosyası Kontrolü
    AUDIO_EXTENSIONS = {".mp3", ".ogg", ".wav", ".m4a"}
    filename = file.filename.lower()
    is_audio = any(filename.endswith(ext) for ext in AUDIO_EXTENSIONS)

    if is_audio:
        # Pro Feature Check
        if not current_user or not current_user.is_pro:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ses dosyası analizi sadece Pro üyeler içindir.",
            )

        # Audio Transcription
        from app.services.audio_service import get_audio_service

        audio_service = get_audio_service()

        # Dosyayı belleğe oku (OpenAI API için)
        file_obj = file.file
        transcript = audio_service.transcribe_audio(file_obj, file.filename)

        if not transcript:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ses dosyası metne çevrilemedi. Lütfen dosya formatını kontrol edin.",
            )

        text = transcript
        format_detected = "audio_transcript"

    else:
        # Mevcut Text/Zip İşleme
        is_valid, error_msg = FileValidator.validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

        if file.filename.endswith(".zip"):
            content_bytes = await file.read()
            text = FileValidator.extract_from_zip(content_bytes)
        else:
            text = await FileValidator.read_file_content(file)

        # Detect format
        is_whatsapp = WhatsAppFileParser.detect_whatsapp_format(text)
        format_detected = "whatsapp" if is_whatsapp else "auto"

        # Pro Feature Check (WhatsApp History)
        if is_whatsapp and current_user and not current_user.is_pro:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="WhatsApp geçmişi yükleme özelliği sadece Pro üyeler içindir.",
            )

        # Clean WhatsApp metadata
        if is_whatsapp:
            text = WhatsAppFileParser.clean_whatsapp_metadata(text)

    # 2. Analiz İşlemi (Ortak)
    service = get_analysis_service()

    # Validate text
    is_valid, error_msg = service.validate_text(text)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)

    # Perform analysis
    result = service.analyze_text(
        text=text,
        format_type=(
            "simple" if format_detected == "audio_transcript" else format_detected
        ),  # Ses analizi basit metin gibidir
        privacy_mode=privacy_mode,
    )

    # Check for errors
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Analiz başarısız"),
        )

    # Save to database
    if save_to_db:
        try:
            user_id = current_user.id if current_user else None
            db_analysis = AnalysisCRUD.create_analysis(
                db=db,
                report=result,
                user_id=user_id,
                format_type=format_detected,
                privacy_mode=privacy_mode,
            )
            result["analysis_id"] = db_analysis.id
            result["filename"] = file.filename
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Veritabanı kayıt hatası: {str(e)}",
            )

    return result


@router.post(
    "/upload-and-analyze-v2",
    response_model=V2AnalysisResult,
    summary="Dosya Yükle ve V2 Analiz Yap (Gottman + Heatmap)",
    description="Dosya yükle ve derinlemesine analiz et (V2.0)",
)
async def upload_and_analyze_v2(
    file: UploadFile = File(..., description="Analiz edilecek dosya (txt, zip, mp3, ogg, wav)"),
    model_preference: str = "fast",
    save_to_db: bool = True,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    """
    Dosya yükle ve V2 analizi yap.
    Gottman metodolojisi, Heatmap ve detaylı içgörüler içerir.
    """
    logger = logging.getLogger(__name__)

    # 1. Dosya İşleme ve Metin Çıkarma (V1 ile aynı mantık)
    AUDIO_EXTENSIONS = {".mp3", ".ogg", ".wav", ".m4a"}
    filename = file.filename.lower()
    is_audio = any(filename.endswith(ext) for ext in AUDIO_EXTENSIONS)

    text = ""
    format_detected = "auto"

    if is_audio:
        if not current_user or not current_user.is_pro:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ses dosyası analizi sadece Pro üyeler içindir.",
            )
        from app.services.audio_service import get_audio_service

        audio_service = get_audio_service()
        file_obj = file.file
        transcript = audio_service.transcribe_audio(file_obj, file.filename)
        if not transcript:
            raise HTTPException(status_code=500, detail="Ses dosyası metne çevrilemedi.")
        text = transcript
        format_detected = "audio_transcript"
    else:
        is_valid, error_msg = FileValidator.validate_file(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=error_msg)

        if file.filename.endswith(".zip"):
            content_bytes = await file.read()
            text = FileValidator.extract_from_zip(content_bytes)
        else:
            text = await FileValidator.read_file_content(file)

        is_whatsapp = WhatsAppFileParser.detect_whatsapp_format(text)
        format_detected = "whatsapp" if is_whatsapp else "auto"

        if is_whatsapp:
            text = WhatsAppFileParser.clean_whatsapp_metadata(text)

    # 2. V2 Analiz İşlemleri

    # a. Heatmap & Parsing
    from app.services.heatmap_service import get_heatmap_service
    from backend.ml.preprocessing.conversation_parser import ConversationParser

    heatmap_data = None
    try:
        parser = ConversationParser()
        parsed = parser.parse(text, format_type=format_detected)
        messages = parsed.get("messages", [])

        if messages:
            heatmap_service = get_heatmap_service()
            heatmap_data = heatmap_service.analyze_heatmap(messages)
    except Exception as e:
        logger.warning(f"Heatmap generation failed during upload: {e}")

    # b. Basic Metrics (V1)
    service = get_analysis_service()
    is_valid, error_msg = service.validate_text(text)
    if not is_valid:
        raise HTTPException(status_code=400, detail=error_msg)

    basic_result = service.analyze_text(
        text=text,
        format_type=format_detected,
        privacy_mode=True,
    )

    if basic_result.get("status") == "error":
        raise HTTPException(status_code=500, detail=basic_result.get("message", "Analiz başarısız"))

    # c. Gottman Report (AI)
    ai_service = get_ai_service()
    try:
        gottman_report = ai_service.generate_relationship_report(
            conversation_text=text,
            metrics=basic_result.get("metrics", {}),
            model_preference=model_preference,
        )
    except Exception as e:
        logger.error(f"Gottman report failed: {e}")
        raise HTTPException(status_code=500, detail=f"AI Raporu oluşturulamadı: {str(e)}")

    # 3. Sonuç Birleştirme
    v2_result = {
        "status": "success",
        "version": "2.0",
        "basic_metrics": basic_result.get("metrics", {}),
        "gottman_report": gottman_report,
        "summary": basic_result.get("summary", ""),
        "heatmap": heatmap_data,
    }

    # 4. Veritabanına Kaydet
    if save_to_db:
        try:
            user_id = current_user.id if current_user else None
            db_analysis = AnalysisCRUD.create_analysis(
                db=db,
                report=v2_result,
                user_id=user_id,
                format_type=format_detected,
                privacy_mode=True,
            )
            v2_result["analysis_id"] = db_analysis.id
        except Exception as e:
            logger.error(f"Failed to save V2 analysis: {e}")

    return v2_result


@router.get(
    "/supported-formats",
    summary="Desteklenen Dosya Formatları",
)
async def get_supported_file_formats():
    """Desteklenen dosya formatlarını listele"""
    return {
        "formats": [
            {
                "extension": ".txt",
                "name": "Text File",
                "description": "WhatsApp export veya düz metin",
                "max_size_mb": FileValidator.MAX_SIZE_MB,
            },
            {
                "extension": ".mp3, .ogg, .wav, .m4a",
                "name": "Ses Dosyası (Pro)",
                "description": "WhatsApp sesli mesaj veya kayıt",
                "max_size_mb": 25,
            },
            {
                "extension": ".zip",
                "name": "ZIP Archive",
                "description": "WhatsApp export ZIP dosyası",
                "max_size_mb": FileValidator.MAX_SIZE_MB,
            },
        ],
        "max_size_mb": FileValidator.MAX_SIZE_MB,
        "notes": [
            "Dosyalar UTF-8 encoding ile yüklenmelidir",
            "Ses analizi sadece Pro üyeler içindir",
        ],
    }
