"""File Upload API Endpoints"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from sqlalchemy.orm import Session

from backend.app.schemas.file import FileUploadResponse
from backend.app.schemas.analysis import AnalysisResponse
from backend.app.core.file_utils import FileValidator, WhatsAppFileParser
from backend.app.services.analysis_service import get_analysis_service
from backend.app.services.crud import AnalysisCRUD
from backend.app.core.database import get_db

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
    description="Dosya yükle ve direkt analiz yap"
)
async def upload_and_analyze(
    file: UploadFile = File(..., description="Analiz edilecek dosya"),
    privacy_mode: bool = True,
    save_to_db: bool = True,
    db: Session = Depends(get_db),
):
    """
    Dosya yükle ve direkt analiz et
    
    - **file**: WhatsApp export veya konuşma dosyası
    - **privacy_mode**: Kişisel bilgileri maskele
    - **save_to_db**: Veritabanına kaydet
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
    format_detected = "whatsapp" if is_whatsapp else "auto"
    
    # Clean WhatsApp metadata
    if is_whatsapp:
        text = WhatsAppFileParser.clean_whatsapp_metadata(text)
    
    # Analyze
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
        format_type=format_detected,
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
            db_analysis = AnalysisCRUD.create_analysis(
                db=db,
                report=result,
                user_id=None,  # TODO: Add user_id when authenticated
                format_type=format_detected,
                privacy_mode=privacy_mode,
            )
            result["analysis_id"] = db_analysis.id
            result["filename"] = file.filename
        except Exception as e:
            # Clean up analysis if it was created but DB failed? No, transaction rollback handles it usually
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
                "extension": ".json",
                "name": "JSON File",
                "description": "JSON formatında konuşma verisi",
                "max_size_mb": FileValidator.MAX_SIZE_MB,
            },
            {
                "extension": ".log",
                "name": "Log File",
                "description": "Konuşma log dosyası",
                "max_size_mb": FileValidator.MAX_SIZE_MB,
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
            "ZIP dosyaları içinde .txt veya .log dosyası bulunmalıdır",
            "WhatsApp export formatı otomatik olarak tanınır",
        ]
    }
