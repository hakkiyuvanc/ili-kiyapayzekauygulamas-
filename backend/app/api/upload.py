"""File Upload API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.file import FileUploadResponse
from backend.app.schemas.analysis import AnalysisResponse
from backend.app.core.file_utils import FileValidator, WhatsAppFileParser
from backend.app.services.analysis_service import get_analysis_service
from backend.app.services.crud import AnalysisCRUD
from backend.app.core.database import get_db

from typing import Optional
from backend.app.models.database import User
from backend.app.api.auth import get_optional_current_user

router = APIRouter()


@router.post(
    "/upload",
    response_model=FileUploadResponse,
    summary="Dosya Yükle ve Önizle",
    description="Dosya yükle, içeriğini doğrula ve önizleme oluştur"
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
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Read content
    if file.filename.endswith('.zip'):
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
    from ml.preprocessing.conversation_parser import ConversationParser
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
        status="success"
    )


@router.post(
    "/upload-and-analyze",
    response_model=AnalysisResponse,
    summary="Dosya Yükle ve Analiz Et",
    description="Dosya yükle (Metin veya Ses) ve direkt analiz yap"
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
    AUDIO_EXTENSIONS = {'.mp3', '.ogg', '.wav', '.m4a'}
    filename = file.filename.lower()
    is_audio = any(filename.endswith(ext) for ext in AUDIO_EXTENSIONS)

    if is_audio:
        # Pro Feature Check
        if not current_user or not current_user.is_pro:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Ses dosyası analizi sadece Pro üyeler içindir."
            )
        
        # Audio Transcription
        from backend.app.services.audio_service import get_audio_service
        audio_service = get_audio_service()
        
        # Dosyayı belleğe oku (OpenAI API için)
        file_obj = file.file 
        transcript = audio_service.transcribe_audio(file_obj, file.filename)
        
        if not transcript:
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Ses dosyası metne çevrilemedi. Lütfen dosya formatını kontrol edin."
            )
        
        text = transcript
        format_detected = "audio_transcript"
        
    else:
        # Mevcut Text/Zip İşleme
        is_valid, error_msg = FileValidator.validate_file(file)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        if file.filename.endswith('.zip'):
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
                detail="WhatsApp geçmişi yükleme özelliği sadece Pro üyeler içindir."
            )
        
        # Clean WhatsApp metadata
        if is_whatsapp:
            text = WhatsAppFileParser.clean_whatsapp_metadata(text)

    # 2. Analiz İşlemi (Ortak)
    service = get_analysis_service()
    
    # Validate text
    is_valid, error_msg = service.validate_text(text)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    
    # Perform analysis
    result = service.analyze_text(
        text=text,
        format_type="simple" if format_detected == "audio_transcript" else format_detected, # Ses analizi basit metin gibidir
        privacy_mode=privacy_mode,
    )
    
    # Check for errors
    if result.get("status") == "error":
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.get("message", "Analiz başarısız")
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
                detail=f"Veritabanı kayıt hatası: {str(e)}"
            )
    
    return result


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
        ]
    }
