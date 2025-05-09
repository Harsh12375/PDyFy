from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional

class DocumentBase(BaseModel):
    filename: str = Field(..., description="Name of the uploaded file")

class DocumentCreate(DocumentBase):
    description: Optional[str] = Field(None, description="Optional description of the document")
    tags: Optional[list[str]] = Field(default_factory=list, description="Optional tags for the document")
    
    @field_validator('filename')
    def validate_filename(cls, v):
        if not v.endswith('.pdf'):
            raise ValueError('Only PDF files are allowed')
        return v

class DocumentResponse(DocumentBase):
    id: int
    file_path: str  
    upload_date: datetime
    processed: bool

    class Config:
        from_attributes = True

class QuestionRequest(BaseModel):
    question: str
    document_id: Optional[int] = None

class QuestionResponse(BaseModel):
    answer: str
    confidence: float
    source_document: str