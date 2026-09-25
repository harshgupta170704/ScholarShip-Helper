from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas import ChatResponse, ChatMessageRequest, StartChatRequest, ChatSessionResponse
from app.chatbot_service import ChatbotService
import uuid
from typing import Optional

router = APIRouter(prefix="/api/chat", tags=["Chat"])

@router.post("/start")
async def start_chat(request: StartChatRequest = None, db: AsyncSession = Depends(get_db)):
    session_id = str(uuid.uuid4())
    service = ChatbotService(db)
    response = await service.process_message(session_id, "")
    return {
        "session_id": session_id,
        "message": response.message,
        "next_step": response.next_step,
        "is_complete": response.is_complete,
        "options": response.options,
        "requires_file": response.requires_file,
        "progress": response.progress
    }

@router.post("/message/{session_id}")
async def send_message(
    session_id: str,
    message: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    db: AsyncSession = Depends(get_db)
):
    service = ChatbotService(db)
    msg = message if message else "uploaded"
    response = await service.process_message(session_id, msg, file)
    return {
        "session_id": session_id,
        "message": response.message,
        "next_step": response.next_step,
        "is_complete": response.is_complete,
        "options": response.options,
        "requires_file": response.requires_file,
        "collected_data": response.collected_data,
        "scholarships": response.scholarships,
        "ocr_result": response.ocr_result,
        "progress": response.progress
    }

@router.get("/session/{session_id}")
async def get_session(session_id: str, db: AsyncSession = Depends(get_db)):
    service = ChatbotService(db)
    session = await service.get_or_create_session(session_id)
    return {
        "id": session.id,
        "current_step": session.current_step,
        "collected_data": session.collected_data,
        "created_at": str(session.created_at),
        "updated_at": str(session.updated_at)
    }

@router.post("/session/{session_id}/reset")
async def reset_session(session_id: str, db: AsyncSession = Depends(get_db)):
    service = ChatbotService(db)
    session = await service.get_or_create_session(session_id)
    session.current_step = 'welcome'
    session.collected_data = {"achievements": []}
    await db.commit()
    response = await service.process_message(session_id, "")
    return {
        "session_id": session_id,
        "message": response.message,
        "next_step": response.next_step,
        "is_complete": response.is_complete,
        "options": response.options,
        "progress": response.progress
    }

@router.get("/session-by-pan/{pan}")
async def get_session_by_pan(pan: str, db: AsyncSession = Depends(get_db)):
    from app.models import ChatSession
    from sqlalchemy.future import select
    result = await db.execute(select(ChatSession))
    sessions = result.scalars().all()
    for s in sessions:
        if s.collected_data and s.collected_data.get('ask_pan', '').upper() == pan.upper():
            name = s.collected_data.get('ask_name', 'Student')
            return {
                "exists": True,
                "application": {
                    "id": f"APP-{str(s.id)[:8].upper()}-MP",
                    "scheme": "ScholarSetu Application",
                    "applicantName": name,
                    "status": "under_review",
                    "timeline": [
                        { "status": "applied", "date": str(s.created_at), "label": "Application Submitted" },
                        { "status": "docs_verified", "date": str(s.updated_at), "label": "Documents Verified via OCR" },
                        { "status": "under_review", "date": str(s.updated_at), "label": "Under Nodal Officer Review", "current": True },
                        { "status": "approved", "date": None, "label": "Approved" },
                        { "status": "disbursed", "date": None, "label": "Amount Disbursed" }
                    ],
                    "documents": [
                        { "name": "Aadhar Card", "status": "verified" },
                        { "name": "PAN Card", "status": "verified" },
                        { "name": "10th Marksheet", "status": "verified" },
                        { "name": "12th Marksheet", "status": "verified" }
                    ]
                }
            }
    return {"exists": False}
