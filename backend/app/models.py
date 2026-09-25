import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Boolean, Integer, Text, Date, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

# Note: Using String format for UUID to maintain cross-database compatibility easily 
# but defining a helper to generate UUID strings.
def generate_uuid():
    return str(uuid.uuid4())

class Student(Base):
    __tablename__ = "students"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    full_name = Column(String, nullable=False)
    father_name = Column(String, nullable=False)
    mother_name = Column(String, nullable=False)
    dob = Column(Date, nullable=False)
    gender = Column(String, nullable=False)
    category = Column(String, nullable=False)
    religion = Column(String, nullable=False)
    mobile = Column(String, nullable=False)
    email = Column(String, nullable=False)
    pan_card = Column(String, unique=True, nullable=False)
    aadhaar_number = Column(String, unique=True, nullable=False)
    samagra_id = Column(String, nullable=True)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String, nullable=False)
    family_annual_income = Column(Float, nullable=False)
    is_bpl = Column(Boolean, default=False)
    is_disabled = Column(Boolean, default=False)
    disability_percentage = Column(Float, nullable=True)
    bank_account_number = Column(String, nullable=False)
    ifsc_code = Column(String, nullable=False)
    is_from_mp = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    education = relationship("Education", back_populates="student", uselist=False)
    documents = relationship("Document", back_populates="student")
    applications = relationship("Application", back_populates="student")
    achievements = relationship("Achievement", back_populates="student")


class Education(Base):
    __tablename__ = "education"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    board_10th = Column(String, nullable=False)
    percentage_10th = Column(Float, nullable=False)
    year_10th = Column(Integer, nullable=False)
    board_12th = Column(String, nullable=False)
    percentage_12th = Column(Float, nullable=False)
    year_12th = Column(Integer, nullable=False)
    stream_12th = Column(String, nullable=False)
    current_course = Column(String, nullable=False)
    current_year = Column(Integer, nullable=False)
    institution_name = Column(String, nullable=False)
    institution_type = Column(String, nullable=False)
    is_rural_area = Column(Boolean, default=False)

    student = relationship("Student", back_populates="education")


class Document(Base):
    __tablename__ = "documents"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    doc_type = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    ocr_extracted_data = Column(JSON, nullable=True)
    ocr_confidence = Column(Float, nullable=True)
    ocr_status = Column(String, nullable=False)
    is_verified = Column(Boolean, default=False)
    verification_method = Column(String, nullable=True)
    verification_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("Student", back_populates="documents")


class ScholarshipScheme(Base):
    __tablename__ = "scholarship_schemes"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, nullable=False)
    short_name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    level = Column(String, nullable=False)
    state = Column(String, nullable=True)
    description = Column(Text, nullable=False)
    amount_description = Column(String, nullable=False)
    max_amount = Column(Float, nullable=False)
    eligibility_category = Column(String, nullable=False)
    eligibility_gender = Column(String, nullable=False)
    min_12th_percentage = Column(Float, nullable=True)
    max_family_income = Column(Float, nullable=True)
    requires_bpl = Column(Boolean, default=False)
    requires_rural = Column(Boolean, default=False)
    requires_urban = Column(Boolean, default=False)
    is_for_mp_only = Column(Boolean, default=False)
    min_board = Column(String, nullable=True)
    education_level = Column(String, nullable=False)
    documents_required = Column(JSON, nullable=False)
    application_url = Column(String, nullable=False)
    deadline = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    applications = relationship("Application", back_populates="scheme")


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    scheme_id = Column(String, ForeignKey("scholarship_schemes.id"), nullable=False)
    status = Column(String, nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    rejection_reason = Column(Text, nullable=True)
    match_score = Column(Float, nullable=False)

    student = relationship("Student", back_populates="applications")
    scheme = relationship("ScholarshipScheme", back_populates="applications")

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=False)
    achievement_type = Column(String, nullable=False)
    name = Column(String, nullable=False)
    detail = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    certificate_path = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    student = relationship("Student", back_populates="achievements")

class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    student_id = Column(String, ForeignKey("students.id"), nullable=True)
    session_data = Column(JSON, nullable=False)
    current_step = Column(String, nullable=False)
    collected_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
