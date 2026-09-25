# ScholarSetu - AI-Powered Scholarship Assistant

**Project Name:** ScholarSetu
**Event:** MP Online Tech Hackathon - "AI Innovation for Public Services & Citizen-Centric Governance"

## 📌 Project Overview
ScholarSetu is an intelligent, conversational AI assistant designed to democratize access to government scholarships, specifically focusing on schemes from Madhya Pradesh (MMVY, MPTAAS, Gaon Ki Beti, etc.) alongside Central Government schemes. 

The traditional scholarship application process is plagued by confusing eligibility criteria, repetitive form-filling, and manual document verification. ScholarSetu solves this by interacting with students via a friendly WhatsApp-like chat interface. It asks for their details step-by-step in natural language, performs real-time OCR on uploaded documents to verify authenticity, checks for duplicate applications to prevent fraud, and ultimately recommends the best-matching scholarships. Once matched, it auto-fills the exact official government forms for the user.

## ✨ Key Features & Capabilities

1. **Conversational Data Collection (Smart Flow)**
   - The bot dynamically asks questions based on previous answers (e.g., skips asking for Samagra ID and MP Domicile if the user is from outside Madhya Pradesh, or skips caste certificates for General category).
   - Validates all inputs in real-time (10-digit mobile numbers, valid emails, 12-digit Aadhaar, strictly formatted PAN, valid dates).
   - Acknowledges inputs and applies standard formatting (e.g., auto-Title-Casing names).

2. **Real-Time OCR & Document Verification**
   - Students can upload documents directly in the chat (Aadhaar, PAN, Marksheets, Income/Caste Certificates).
   - Built-in OCR engine extracts data and cross-references it with the user-provided chat inputs.
   - Fallback Mechanism: If the document is blurry or the OCR yields a low-confidence score, the user is given the option to either re-upload or pass it to a human agent for manual verification.

3. **Fraud Prevention & Duplicate Detection**
   - Real-time checking of PAN cards against the database ensures a single student cannot apply multiple times under different aliases.

4. **Intelligent Scholarship Matching Engine**
   - Matches students to 14+ seeded scholarships based on strict criteria: Family Income, 12th Board Percentages (differentiating between MP Board and CBSE/ICSE), Category, Gender, and Locale (Rural vs. Urban).
   - **Achievement Unlocks:** Students can input competitive achievements (NTSE, KVPY, JEE Advanced, Olympiads) which drastically boost match scores and unlock special scholarships (like the INSPIRE scholarship or full IIT Fee Waivers).

5. **Government-Fidelity Form Auto-filling**
   - Once scholarships are recommended, the user can click "View Filled Form".
   - The platform generates a pixel-perfect, bilingual (Hindi/English) preview of the exact official government form (e.g., the Medhavi Chhatra Yojana portal or MPTAAS portal) pre-filled with the data collected during the chat.

## 🛠 Tech Stack

**Frontend:**
- **React.js (Vite)** for a lightning-fast single-page application.
- **Tailwind CSS (v3)** for responsive, modern UI styling.
- **Lucide React** for beautiful iconography.
- **Axios** for API communication.

**Backend:**
- **FastAPI** for high-performance, asynchronous REST APIs.
- **SQLite + SQLAlchemy (Async)** for robust local database management.
- **Pydantic** for strict data validation and serialization.
- **Tesseract OCR (pytesseract) + Pillow** for image processing and text extraction.
- **Uvicorn** as the ASGI server.

## 🗄️ Database Schema & Models
- `Student`: Stores core demographics, academic, and financial details.
- `Document`: Tracks uploaded files, OCR confidence scores, and verification status.
- `ScholarshipScheme`: Stores criteria for State and Central schemes.
- `ChatSession`: Maintains the state machine of the chat so users can drop off and resume without losing progress.

## 🚀 How it Works (User Journey)
1. User lands on the ScholarSetu chat interface.
2. The bot asks for basic info (Name, DOB, Category).
3. The bot asks for academic info and financial data.
4. The bot asks for achievements (NTSE, KVPY, etc.).
5. The user uploads required documents based on their profile.
6. The bot verifies the data and generates a "Profile Summary".
7. The bot presents top matching scholarships ranked by a "Match Score (%)".
8. The user clicks to view their auto-filled official government application form, ready for submission.
