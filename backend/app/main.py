from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.database import engine, Base
from app.routes import chat, scholarships, documents, students
from app.scholarship_data import seed_scholarships

app = FastAPI(title="ScholarSetu API", description="AI-powered scholarship chatbot backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    # Create tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed data
    from app.database import AsyncSessionLocal
    async with AsyncSessionLocal() as session:
        await seed_scholarships(session)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

app.include_router(chat.router)
app.include_router(scholarships.router)
app.include_router(documents.router)
app.include_router(students.router)
