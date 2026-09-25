from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Dict, Any
from datetime import date, datetime
import re

class StudentBase(BaseModel):
    full_name: str
    father_name: str
    mother_name: str
    dob: date
    gender: str
    category: str
    religion: str
    mobile: str = Field(..., min_length=10, max_length=10)
    email: EmailStr
    pan_card: str
    aadhaar_number: str = Field(..., min_length=12, max_length=12)
    samagra_id: Optional[str] = None
    state: str
    district: str
    address: str
    pincode: str = Field(..., min_length=6, max_length=6)
    family_annual_income: float = Field(..., gt=0)
    is_bpl: bool = False
    is_disabled: bool = False
    disability_percentage: Optional[float] = None
    bank_account_number: str
    ifsc_code: str
    is_from_mp: bool = False

    @validator('mobile')
    def validate_mobile(cls, v):
        if not v.isdigit():
            raise ValueError('Mobile must contain only digits')
        return v

    @validator('aadhaar_number')
    def validate_aadhaar(cls, v):
        if not v.isdigit():
            raise ValueError('Aadhaar must contain only digits')
        return v

    @validator('pan_card')
    def validate_pan(cls, v):
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', v):
            raise ValueError('Invalid PAN format')
        return v

    @validator('pincode')
    def validate_pincode(cls, v):
        if not v.isdigit():
            raise ValueError('Pincode must contain only digits')
        return v


class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EducationBase(BaseModel):
    board_10th: str
    percentage_10th: float = Field(..., ge=0, le=100)
    year_10th: int
    board_12th: str
    percentage_12th: float = Field(..., ge=0, le=100)
    year_12th: int
    stream_12th: str
    current_course: str
    current_year: int
    institution_name: str
    institution_type: str
    is_rural_area: bool = False

class EducationCreate(EducationBase):
    pass

class EducationResponse(EducationBase):
    id: str
    student_id: str

    class Config:
        from_attributes = True

class DocumentBase(BaseModel):
    doc_type: str
    file_path: str
    ocr_extracted_data: Optional[Dict[str, Any]] = None
    ocr_confidence: Optional[float] = None
    ocr_status: str
    is_verified: bool = False
    verification_method: Optional[str] = None
    verification_notes: Optional[str] = None

class DocumentResponse(DocumentBase):
    id: str
    student_id: str
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ScholarshipSchemeBase(BaseModel):
    name: str
    short_name: str
    department: str
    level: str
    state: Optional[str] = None
    description: str
    amount_description: str
    max_amount: float
    eligibility_category: str
    eligibility_gender: str
    min_12th_percentage: Optional[float] = None
    max_family_income: Optional[float] = None
    requires_bpl: bool = False
    requires_rural: bool = False
    requires_urban: bool = False
    is_for_mp_only: bool = False
    min_board: Optional[str] = None
    education_level: str
    documents_required: Any  # JSON string or list from DB
    application_url: str
    deadline: Optional[str] = None
    is_active: bool = True

class ScholarshipSchemeResponse(ScholarshipSchemeBase):
    id: str

    class Config:
        from_attributes = True

class ApplicationBase(BaseModel):
    status: str
    rejection_reason: Optional[str] = None
    match_score: float

class ApplicationResponse(ApplicationBase):
    id: str
    student_id: str
    scheme_id: str
    applied_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AchievementBase(BaseModel):
    achievement_type: str
    name: str
    detail: str
    year: int
    certificate_path: Optional[str] = None
    is_verified: bool = False

class AchievementCreate(AchievementBase):
    pass

class AchievementResponse(AchievementBase):
    id: str
    student_id: str

    class Config:
        from_attributes = True

class ChatSessionBase(BaseModel):
    session_data: Dict[str, Any]
    current_step: str
    collected_data: Dict[str, Any]

class ChatSessionResponse(ChatSessionBase):
    id: str
    student_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StartChatRequest(BaseModel):
    student_id: Optional[str] = None

class ChatMessageRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    session_id: Optional[str] = None
    message: str
    next_step: str
    is_complete: bool
    options: Optional[List[str]] = None
    requires_file: bool = False
    collected_data: Optional[Dict[str, Any]] = None
    scholarships: Optional[List[Dict[str, Any]]] = None
    ocr_result: Optional[Dict[str, Any]] = None
    progress: Optional[float] = None
