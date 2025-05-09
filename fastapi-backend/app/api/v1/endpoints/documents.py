from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from ....database import get_db
from ....schemas.document import DocumentResponse, QuestionRequest, QuestionResponse
from ....services.document_processor import save_uploaded_file, extract_text_from_pdf
from ....services.qa_service import QAService
from ....models.document import Document
from sqlalchemy import select

router = APIRouter()
qa_service = QAService()

@router.post("/upload/", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")
    
    file_path = await save_uploaded_file(file, file.filename)
    
    document = Document(
        filename=file.filename,
        file_path=str(file_path)
    )
    
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    text = await extract_text_from_pdf(file_path)
    await qa_service.process_document(text, document.id)
    
    document.processed = True
    await db.commit()
    
    return document

@router.post("/question/", response_model=QuestionResponse)
async def ask_question(
    question_request: QuestionRequest,
    db: AsyncSession = Depends(get_db)
):
    if question_request.document_id:
        query = select(Document).where(Document.id == question_request.document_id)
        result = await db.execute(query)
        document = result.scalar_one_or_none()
        
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        if not document.processed:
            raise HTTPException(status_code=400, detail="Document is still processing")
    
    return await qa_service.answer_question(
        question_request.question,
        question_request.document_id
    )
