# ScholarSetu - AI-Powered Scholarship Assistant 🎓

**Project Name:** ScholarSetu  
**Event:** MP Online Tech Hackathon - "AI Innovation for Public Services & Citizen-Centric Governance"  

---

## 🌟 Project Overview
**ScholarSetu** is an intelligent, conversational AI assistant designed to democratize access to government scholarships. It specifically focuses on bridging the gap for schemes from Madhya Pradesh (MMVY, MPTAAS, Gaon Ki Beti, etc.) alongside Central Government schemes. 

The traditional scholarship application process is plagued by confusing eligibility criteria, repetitive form-filling, manual document verification, and language barriers. ScholarSetu solves this by interacting with students via a friendly, WhatsApp-like chat interface. It asks for their details step-by-step in natural language, performs real-time OCR on uploaded documents, checks for duplicate applications, and ultimately recommends the best-matching scholarships. Once matched, it auto-fills the exact official government forms for the user.

---

## 🚀 Key Features & Capabilities

### 1. Conversational Data Collection (Smart Flow)
- **Dynamic Questioning:** The bot dynamically asks questions based on previous answers. For example, it skips asking for Samagra ID and MP Domicile if the user is from outside Madhya Pradesh, and skips caste certificates for General category students.
- **Strict Validation:** Validates all inputs in real-time (10-digit mobile numbers, valid emails, 12-digit Aadhaar, strictly formatted PAN, valid dates).
- **Confirmation Loop:** Implements an "Is this correct? (Yes/No)" confirmation loop before locking in data to prevent typos.

### 2. Multi-Modal Accessibility (Voice & Local Language)
- **Speech-to-Text (Microphone):** Users can click the microphone icon to speak their answers instead of typing, making the platform accessible to less tech-savvy users.
- **Text-to-Speech (Speaker):** The bot can read questions aloud to the user.
- **Hindi Translation:** A built-in "Translate" button instantly converts and explains the bot's current question in simple Hindi to overcome language barriers.

### 3. Advanced Authentication & Admin Portal
- **3-Step Auth Wizard:** A beautiful, intuitive login flow separating New Users, Existing Users, and Admins.
- **Google OAuth2 Integration:** Users can securely sign in using their Gmail accounts via `@react-oauth/google`.
- **Admin Dashboard:** A dedicated, protected `/admin` portal where administrators can view submitted applications and manually verify user documents.
- **Application Tracking:** Existing users can log in with their PAN card and instantly see a real-time timeline of their application status (Applied -> Under Review -> Approved).

### 4. Real-Time OCR & Document Verification
- Students can upload documents directly in the chat (Aadhaar, PAN, Marksheets, Income/Caste Certificates).
- Built-in OCR engine extracts data and cross-references it with the user-provided chat inputs.
- **Fallback Mechanism:** If the document is blurry or the OCR yields a low-confidence score, the user is given the option to either re-upload or pass it to a human agent for manual verification.

### 5. Intelligent Scholarship Matching Engine
- Matches students to 14+ seeded scholarships based on strict criteria: Family Income, 12th Board Percentages (differentiating between MP Board and CBSE/ICSE), Category, Gender, and Locale (Rural vs. Urban).
- **Achievement Unlocks:** Students can input competitive achievements (NTSE, KVPY, JEE Advanced, Olympiads) which drastically boost match scores and unlock special scholarships.

### 6. Government-Fidelity Form Auto-filling
- Once scholarships are recommended, the user can click "View Filled Form".
- The platform generates a pixel-perfect, bilingual (Hindi/English) preview of the exact official government form (e.g., the Medhavi Chhatra Yojana portal) pre-filled with the data collected during the chat.

---

## 🛠️ Tech Stack

**Frontend:**
- **React.js (Vite)** for a lightning-fast single-page application.
- **Tailwind CSS (v3)** for responsive, modern UI styling.
- **Lucide React** for beautiful iconography.
- **Web Speech API** for native browser voice recognition and text-to-speech.
- **React Google OAuth** for secure authentication.

**Backend:**
- **FastAPI** for high-performance, asynchronous REST APIs.
- **SQLite + SQLAlchemy (Async)** for robust local database management.
- **Pydantic** for strict data validation and serialization.
- **Tesseract OCR (pytesseract) + Pillow** for image processing and text extraction.

---

## 📂 Database Schema & Models
- `Student`: Stores core demographics, academic, and financial details.
- `Document`: Tracks uploaded files, OCR confidence scores, and verification status.
- `ScholarshipScheme`: Stores criteria for State and Central schemes.
- `ChatSession`: Maintains the state machine of the chat so users can drop off and resume without losing progress.

---

## 🏃‍♂️ How to Run Locally

### 1. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# Start the FastAPI server
python -m uvicorn app.main:app --reload --port 8000
```
*Note: Make sure Tesseract OCR is installed on your Windows machine and the path is set in your environment variables.*

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start the Vite React development server
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the `frontend` folder and add your Google Client ID for OAuth to work properly:
```env
VITE_GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
```

---

*Built with ❤️ for the MP Online Tech Hackathon.*
