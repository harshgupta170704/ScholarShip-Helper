import re
import os
import pytesseract
from PIL import Image, ImageStat
from typing import Dict, Any

# Ensure tesseract path from env
TESSERACT_PATH = os.getenv("TESSERACT_PATH")
if TESSERACT_PATH:
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

async def process_document(file_path: str, doc_type: str) -> Dict[str, Any]:
    """Main OCR processing function"""
    try:
        img = Image.open(file_path)
        quality = await check_image_quality(img)
        
        if not quality['is_clear']:
            return {
                "extracted_data": {},
                "confidence": 0.0,
                "status": "failed",
                "issues": quality['issues']
            }

        extracted_data = {}
        if doc_type == "aadhaar":
            extracted_data = await extract_aadhaar_data(img)
        elif doc_type == "pan":
            extracted_data = await extract_pan_data(img)
        elif doc_type == "marksheet_10" or doc_type == "marksheet_12":
            extracted_data = await extract_marksheet_data(img)
        elif doc_type == "income_cert":
            extracted_data = await extract_income_certificate(img)
        else:
            # Fallback for other docs
            text = pytesseract.image_to_string(img)
            extracted_data = {"raw_text": text}
            
        return {
            "extracted_data": extracted_data,
            "confidence": 0.85, # Mock confidence for now
            "status": "success" if extracted_data else "unclear",
            "issues": []
        }
    except Exception as e:
        return {
            "extracted_data": {},
            "confidence": 0.0,
            "status": "failed",
            "issues": [str(e)]
        }

async def check_image_quality(image: Image.Image) -> Dict[str, Any]:
    """Check if image is clear enough for OCR"""
    issues = []
    
    # Check resolution
    if image.width < 500 or image.height < 500:
        issues.append("low_resolution")
        
    # Check brightness (simplified)
    stat = ImageStat.Stat(image.convert("L"))
    if stat.mean[0] < 50:
        issues.append("too_dark")
    elif stat.mean[0] > 240:
        issues.append("too_bright")
        
    return {
        "is_clear": len(issues) == 0,
        "issues": issues
    }

async def extract_aadhaar_data(image: Image.Image) -> Dict[str, Any]:
    """Extract data from Aadhaar card image"""
    text = pytesseract.image_to_string(image)
    data = {}
    
    # Regex for 12 digit Aadhaar
    aadhaar_match = re.search(r'\b\d{4}\s\d{4}\s\d{4}\b', text)
    if aadhaar_match:
        data['aadhaar_number'] = aadhaar_match.group().replace(" ", "")
        
    return data

async def extract_pan_data(image: Image.Image) -> Dict[str, Any]:
    """Extract data from PAN card image"""
    text = pytesseract.image_to_string(image)
    data = {}
    
    pan_match = re.search(r'[A-Z]{5}[0-9]{4}[A-Z]{1}', text)
    if pan_match:
        data['pan_number'] = pan_match.group()
        
    return data

async def extract_marksheet_data(image: Image.Image) -> Dict[str, Any]:
    """Extract data from marksheet image"""
    text = pytesseract.image_to_string(image)
    data = {}
    
    # Mocking extraction of percentage
    percent_match = re.search(r'(\d{2,3}(\.\d{1,2})?)\s*%', text)
    if percent_match:
        data['percentage'] = float(percent_match.group(1))
        
    return data

async def extract_income_certificate(image: Image.Image) -> Dict[str, Any]:
    """Extract data from income certificate"""
    text = pytesseract.image_to_string(image)
    data = {}
    
    income_match = re.search(r'(Rs\.?|Rupees)\s*(\d+(,\d+)*)', text, re.IGNORECASE)
    if income_match:
        data['income_amount'] = float(income_match.group(2).replace(",", ""))
        
    return data

async def validate_document_authenticity(extracted_data: dict, doc_type: str, student_data: dict) -> dict:
    """Cross-validate extracted data against student's submitted data"""
    mismatches = []
    
    if doc_type == "aadhaar":
        if 'aadhaar_number' in extracted_data and extracted_data['aadhaar_number'] != student_data.get('aadhaar_number'):
            mismatches.append("Aadhaar number mismatch")
            
    elif doc_type == "pan":
        if 'pan_number' in extracted_data and extracted_data['pan_number'] != student_data.get('pan_card'):
            mismatches.append("PAN number mismatch")
            
    is_authentic = len(mismatches) == 0
    return {
        "is_authentic": is_authentic,
        "mismatches": mismatches,
        "confidence": 0.9 if is_authentic else 0.4
    }
