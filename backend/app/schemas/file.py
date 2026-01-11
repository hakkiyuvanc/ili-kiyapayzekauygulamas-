"""File Upload Schemas"""

from typing import Optional

from pydantic import BaseModel, Field


class FileUploadResponse(BaseModel):
    """File upload response"""

    filename: str
    size: int
    format_detected: str
    message_count: Optional[int] = None
    text_preview: str
    status: str = "success"


class FileAnalysisRequest(BaseModel):
    """File analysis request"""

    format_type: str = Field(default="auto", description="Format override")
    privacy_mode: bool = Field(default=True, description="PII masking")
