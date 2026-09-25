# ScholarSetu - AI-Powered Scholarship Assistant 🎓

**Project Name:** ScholarSetu  
**Event:** MP Online Tech Hackathon - "AI Innovation for Public Services & Citizen-Centric Governance"  

---

## 🌟 Project Overview
**ScholarSetu** is an intelligent, conversational AI assistant designed to democratize access to government scholarships. It specifically focuses on bridging the gap for schemes from Madhya Pradesh (MMVY, MPTAAS, Gaon Ki Beti, etc.) alongside Central Government schemes. 

The traditional scholarship application process is plagued by confusing eligibility criteria, repetitive form-filling, manual document verification, and language barriers. ScholarSetu solves this by interacting with students via a friendly, WhatsApp-like chat interface. It asks for their details step-by-step in natural language, performs real-time OCR on uploaded documents, checks for duplicate applications, and ultimately recommends the best-matching scholarships. Once matched, it auto-fills the exact official government forms for the user.

---

## 🛑 Problem Statement: The Application Bottleneck
Current e-governance portals (like NSP or MPTAAS) suffer from severe UX bottlenecks:
1. **Opaque Eligibility Matrices:** Students do not know which out of the hundreds of scholarships they qualify for. They often apply to the wrong ones and face rejection.
2. **Redundant Data Entry:** Students must manually fill out identical data (Name, DOB, Income) repeatedly across multiple isolated state and central portals.
3. **Verification Delays:** Human nodal officers must manually verify thousands of uploaded JPEGs (Aadhaar, PAN, Marksheets), creating massive backlogs.
4. **Digital Literacy & Language Barriers:** Complex English forms alienate rural students who primarily speak Hindi and may struggle with standard web forms.

## 🧠 Detailed Approach (Agentic System Architecture)
ScholarSetu is built as a deterministic, state-machine-driven agentic system. Here is a technical breakdown of its core components for engineers and AI agents reviewing the codebase:

### 1. The Conversational State Machine (`chatbot_service.py`)
Instead of a static form, data collection is modeled as a Directed Acyclic Graph (DAG) state machine.
- **State Tracking:** The `ChatSession` model stores a UUID and a JSON blob (`collected_data`). The `current_step` pointer dictates the active node in the graph (e.g., `ask_name` -> `ask_dob` -> `ask_category`).
- **Conditional Branching:** The state machine evaluates edge transitions dynamically. If `collected_data['ask_state'] != 'MP'`, the machine prunes the `ask_samagra` and `doc_domicile` nodes from the execution path.
- **Verification Loop:** Before committing a state transition, the engine halts at a `pending_confirmation_step` node, echoing the parsed value to the user ("You entered: X. Is this correct?").

### 2. Multi-Modal Ingestion & Pydantic Validation
- **Speech & Translation:** The frontend utilizes the native browser `WebSpeechAPI` for STT/TTS. A translation hook intercepts `[HINDI]` payloads, triggering the backend to return a localized string for the active state node.
- **Strict Typing:** Every user payload is passed through Pydantic validators. For instance, the `ask_pan` node strictly enforces a regex match for `[A-Z]{5}[0-9]{4}[A-Z]{1}` before allowing a state transition.

### 3. OCR Pipeline & Entity Cross-Referencing (`ocr_service.py`)
- When a document step (e.g., `doc_aadhaar`) is reached, the uploaded binary is routed to `Pillow` and `pytesseract`.
- **Confidence Scoring:** The OCR engine returns a JSON payload of extracted entities along with a `confidence` float. 
- **Cross-Referencing:** The backend cross-references the OCR output (e.g., extracted DOB from Aadhaar) against the deterministic data stored in `ChatSession.collected_data`. If the delta exceeds a threshold, the document is flagged for the `/admin` portal manual review queue.

### 4. The Deterministic Matching Engine
Once the state machine reaches the `complete` node, the Evaluation Engine fires:
- It iterates through all active `ScholarshipScheme` records in the database.
- It calculates a `match_score` float by evaluating boolean flags (`is_for_mp_only`, `requires_bpl`) and numerical thresholds (`min_12th_percentage`, `max_family_income`) against the user's `collected_data`.
- **Achievement Multipliers:** Bonus arrays (like `NTSE` or `JEE`) dynamically boost the match score, unlocking specialized schemes.

### 5. Hydration & Output Generation
The matched schemes are returned to the React frontend. If the user clicks "View Form", the frontend Maps the JSON `collected_data` keys directly into a pixel-perfect React Component (`FormPreview.jsx`) that visually mimics the actual government portal, achieving zero-friction form completion.

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
