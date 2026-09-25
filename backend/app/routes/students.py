from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Student, Application
from app.schemas import StudentResponse, ApplicationResponse
from typing import List

router = APIRouter(prefix="/api/students", tags=["Students"])

@router.get("/{id}", response_model=StudentResponse)
async def get_student(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).filter(Student.id == id))
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@router.get("/check-pan/{pan}")
async def check_pan(pan: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Student).filter(Student.pan_card == pan))
    student = result.scalars().first()
    return {"exists": student is not None}

@router.get("/{id}/applications", response_model=List[ApplicationResponse])
async def get_student_applications(id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Application).filter(Application.student_id == id))
    applications = result.scalars().all()
    return applications
