import os
import uuid
import aiofiles
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import Document, Student
from app.ocr_service import process_document

router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = "./uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_document(student_id: str = Form(...), doc_type: str = Form(...), file: UploadFile = File(...), db: AsyncSession = Depends(get_db)):
    file_ext = file.filename.split(".")[-1]
    file_path = f"{UPLOAD_DIR}/{uuid.uuid4()}.{file_ext}"
    
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
        
    ocr_result = await process_document(file_path, doc_type)
    
    doc = Document(
        student_id=student_id,
        doc_type=doc_type,
        file_path=file_path,
        ocr_extracted_data=ocr_result["extracted_data"],
        ocr_confidence=ocr_result["confidence"],
        ocr_status=ocr_result["status"],
        is_verified=False
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    
    return {"id": doc.id, "ocr_status": doc.ocr_status, "extracted_data": doc.ocr_extracted_data}

@router.get("/{id}/status")
async def get_document_status(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {"id": doc.id, "ocr_status": doc.ocr_status, "is_verified": doc.is_verified}

@router.post("/{id}/manual-review")
async def request_manual_review(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.ocr_status = "manual_review"
    await db.commit()
    return {"message": "Document flagged for manual review"}

@router.post("/{id}/verify")
async def verify_document(id: str, verification_method: str = "manual_agent", notes: str = "", db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).filter(Document.id == id))
    doc = result.scalars().first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.is_verified = True
    doc.verification_method = verification_method
    doc.verification_notes = notes
    await db.commit()
    return {"message": "Document verified"}
