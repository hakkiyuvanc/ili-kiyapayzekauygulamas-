
import os
from typing import Optional, BinaryIO
from openai import OpenAI
from app.core.config import settings

class AudioService:
    """Service for handling audio operations, primarily transcription."""

    def __init__(self):
        self.client = None
        if settings.OPENAI_API_KEY:
            self.client = OpenAI(api_key=settings.OPENAI_API_KEY)

    def transcribe_audio(self, file_obj: BinaryIO, filename: str) -> Optional[str]:
        """
        Transcribe audio file using OpenAI Whisper API.
        
        Args:
            file_obj: The audio file object (file-like).
            filename: Original filename to determine extension/format hint.
            
        Returns:
            Transcribed text or None if failed.
        """
        if not self.client:
            print("AudioService: OpenAI client not initialized.")
            return None

        try:
            # Create a tuple (filename, file_obj, content_type) if needed, 
            # but openai client usually takes (filename, file_obj)
            # We need to make sure the file pointer is at start if it was read before, 
            # but here we assume it's fresh or reset.
            
            transcript = self.client.audio.transcriptions.create(
                model="whisper-1",
                file=(filename, file_obj),
                response_format="text",
                language="tr" # Hinting Turkish improves accuracy for this app context
            )
            return transcript
        except Exception as e:
            print(f"AudioService Error: {e}")
            return None

# Singleton
_audio_service_instance = None

def get_audio_service() -> AudioService:
    global _audio_service_instance
    if _audio_service_instance is None:
        _audio_service_instance = AudioService()
    return _audio_service_instance
