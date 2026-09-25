from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List, Dict, Any
from app.database import get_db
from app.models import ChatSession

router = APIRouter(
    prefix="/api/admin",
    tags=["admin"]
)

@router.get("/applications")
async def get_all_applications(db: AsyncSession = Depends(get_db)):
    """Return a list of all ChatSessions formatted as applications."""
    result = await db.execute(select(ChatSession))
    sessions = result.scalars().all()
    
    applications = []
    for session in sessions:
        app_data = {
            "session_id": session.id,
            "student_id": session.student_id,
            "current_step": session.current_step,
            "created_at": session.created_at.isoformat() if session.created_at else None,
            "updated_at": session.updated_at.isoformat() if session.updated_at else None,
            "collected_data": session.collected_data
        }
        applications.append(app_data)
        
    return {"applications": applications}

@router.post("/verify-document/{session_id}/{doc_name}")
async def verify_document(session_id: str, doc_name: str, db: AsyncSession = Depends(get_db)):
    """Mark a document as verified for a specific session."""
    result = await db.execute(select(ChatSession).filter(ChatSession.id == session_id))
    session = result.scalars().first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    collected = dict(session.collected_data)
    collected[doc_name] = "verified"
    session.collected_data = collected
    await db.commit()
    
    return {"status": "success", "message": f"Document {doc_name} marked as verified for session {session_id}"}
