"""File handling utilities"""

import os
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status


class FileValidator:
    """File validation utilities"""
    
    ALLOWED_EXTENSIONS = {'.txt', '.json', '.log', '.zip'}
    MAX_SIZE_MB = 10
    MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024
    
    @staticmethod
    def validate_file(file: UploadFile) -> Tuple[bool, Optional[str]]:
        """
        Validate uploaded file
        
        Returns:
            (is_valid, error_message)
        """
        # Check filename
        if not file.filename:
            return False, "Dosya adı bulunamadı"
        
        # Check extension
        _, ext = os.path.splitext(file.filename.lower())
        if ext not in FileValidator.ALLOWED_EXTENSIONS:
            return False, f"Desteklenmeyen dosya formatı: {ext}. İzin verilenler: {', '.join(FileValidator.ALLOWED_EXTENSIONS)}"
        
        return True, None
    
    @staticmethod
    async def read_file_content(file: UploadFile, max_size: int = MAX_SIZE_BYTES) -> str:
        """
        Read and validate file content
        
        Args:
            file: Uploaded file
            max_size: Maximum file size in bytes
            
        Returns:
            File content as string
            
        Raises:
            HTTPException: If file is too large or cannot be read
        """
        try:
            # Read file content
            content = await file.read()
            
            # Check size
            if len(content) > max_size:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"Dosya çok büyük. Maksimum: {FileValidator.MAX_SIZE_MB}MB"
                )
            
            # Decode to text
            try:
                text = content.decode('utf-8')
            except UnicodeDecodeError:
                # Try other encodings
                try:
                    text = content.decode('latin-1')
                except UnicodeDecodeError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Dosya encoding hatası. Lütfen UTF-8 formatında yükleyin."
                    )
            
            return text
            
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Dosya okuma hatası: {str(e)}"
            )
    
    @staticmethod
    def extract_from_zip(content: bytes) -> str:
        """
        Extract text from zip file
        
        Args:
            content: Zip file content
            
        Returns:
            Extracted text content
        """
        import zipfile
        import io
        
        try:
            with zipfile.ZipFile(io.BytesIO(content)) as zf:
                # Find first text file
                text_files = [f for f in zf.namelist() if f.endswith(('.txt', '.log'))]
                
                if not text_files:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="ZIP dosyasında metin dosyası bulunamadı"
                    )
                
                # Read first text file
                with zf.open(text_files[0]) as f:
                    content = f.read()
                    try:
                        return content.decode('utf-8')
                    except UnicodeDecodeError:
                        return content.decode('latin-1')
                        
        except zipfile.BadZipFile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geçersiz ZIP dosyası"
            )
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"ZIP dosyası okuma hatası: {str(e)}"
            )


class WhatsAppFileParser:
    """WhatsApp export file parser"""
    
    @staticmethod
    def detect_whatsapp_format(text: str) -> bool:
        """Check if text is WhatsApp export format"""
        import re
        
        # Check for common WhatsApp patterns
        patterns = [
            r'\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}\s*-\s*[^:]+:',  # Android
            r'\[\d{1,2}/\d{1,2}/\d{2,4},?\s+\d{1,2}:\d{2}(?::\d{2})?\]\s*[^:]+:',  # iOS
        ]
        
        for pattern in patterns:
            if re.search(pattern, text[:500]):  # Check first 500 chars
                return True
        
        return False
    
    @staticmethod
    def clean_whatsapp_metadata(text: str) -> str:
        """Remove WhatsApp metadata (media omitted, etc.)"""
        import re
        
        # Remove common system messages
        patterns = [
            r'<Media omitted>',
            r'<attached: .+?>',
            r'Mesajlar uçtan uca şifrelidir',
            r'Messages and calls are end-to-end encrypted',
            r'.+ güvenlik kodu değişti',
            r'.+ security code changed',
        ]
        
        for pattern in patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        
        return text
