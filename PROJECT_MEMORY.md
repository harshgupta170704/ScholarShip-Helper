# Project Memory Dump: ScholarSetu 🧠

This document serves as a complete memory log of everything requested, built, debugged, and learned during the creation of **ScholarSetu** for the MP Online Tech Hackathon.

---

## 1. What You Asked For (The Requirements)

### The Core Idea
You requested a platform designed for the "AI Innovation for Public Services & Citizen-Centric Governance" domain. The goal was to build a bot that students could chat with (like WhatsApp) to discover and apply for scholarships, specifically tailored for Madhya Pradesh (MP) schemes alongside Central schemes.

### Specific Feature Requests (Iterative)
1. **The Conversational Interface:** *"I want a bot that I can text with, it will ask me my documents, check it, and recommend me the best scholarship based on my income, marks, and I want only from MP."*
2. **Duplicate Detection:** *"Tracks that a single person gets a single scholarship based on their PAN card."*
3. **Real-time OCR & Verification:** *"Do OCR in real time to check whether the document is clear and the documents are correct. If the OCR fails, then it gives the user the option to pass for the agent to verify."*
4. **Data Confirmation:** *"It should give me the return ans LIKE OK YOUR NAME IS HARSH GUPTA WITH CORRECT CASING. If I make a spelling mistake, it should ask me 'Should I continue or change?'"*
5. **Multi-Modal (Voice & Hindi):** *"If I didn't understand anything, explain me by reading it aloud, explain me in Hindi. I also can record my voice and send."*
6. **Authentication & Admin:** *"There should be two options when logging in: user and admin. If old user, directly see dashboard. If new user, redirect to register. Only the admin has power to verify documents. Users should only see their own application."*
7. **Google Auth:** *"I want to be able to continue with Gmail using OAuth 2."*

---

## 2. What I Worked On (The Implementation)

To fulfill your vision, I architected and built a full-stack application from scratch, utilizing subagents to parallelize the workload.

### Backend (FastAPI + SQLite + SQLAlchemy)
- **The State Machine (`chatbot_service.py`):** I built a Directed Acyclic Graph (DAG) state machine. It tracks the user's progress through `ChatSession`, dynamically skipping irrelevant questions (like skipping Samagra ID if the user isn't from MP), and implements a `pending_confirmation_step` to ask "Is this correct? (Yes/No)".
- **OCR Engine (`ocr_service.py`):** Integrated `pytesseract` and `Pillow` to extract entities from uploaded JPEGs (Aadhaar, PAN, Marksheets) and cross-reference them with the user's chat answers.
- **Matching Engine:** Built a deterministic evaluator that scores students against 14+ seeded scholarships based on strict constraints (Income thresholds, MP Board vs CBSE percentages, BPL status).
- **Admin & Auth Endpoints:** Created secure routes for Admins to view all applications and manually verify documents that failed OCR.

### Frontend (React.js + Tailwind CSS)
- **Chat UI (`ChatPage.jsx`):** Built a highly polished, responsive chat interface with message bubbles, typing indicators, quick-reply chips, and drag-and-drop document upload zones.
- **Voice & Translation Hooks:** Integrated the native browser `WebSpeechAPI` for Microphone (STT) and Speaker (TTS) functionality. Added a translation hook that passes `[HINDI]` to the backend.
- **3-Step Auth Wizard (`LoginPage.jsx`):** Completely overhauled the login flow to handle Role Selection -> Action Selection (New/Old User) -> Credential Verification. Added real authentication logic that verifies PAN cards against the database before allowing entry.
- **Google OAuth2:** Integrated `@react-oauth/google` and `jwt-decode` to provide secure, popup-based Gmail authentication.
- **Dashboard (`TrackPage.jsx`):** Built a timeline UI for existing users to track their application status (Under Review -> Approved).

### DevOps & Documentation
- Initialized Git, created feature branches (`feature/advanced-auth-voice-hindi`), handled merging, and pushed all code to your GitHub repository.
- Wrote a highly technical, agent-friendly `README.md` and `PROJECT_SUMMARY.md` detailing the problem statement and system architecture for the hackathon judges.

---

## 3. Key Technical Learnings & Debugging

During our session, we overcame several complex technical hurdles that are worth remembering:

1. **Eager Evaluation Bugs in Python:**
   - *The Bug:* The chatbot crashed with a `ValueError: could not convert string to float` when processing basic string inputs.
   - *The Lesson:* Python evaluates dictionary values eagerly. We cannot safely put type-casting logic (like `float(val)`) inside a static dictionary mapping if the current `val` isn't meant for that step.
   - *The Fix:* Refactored the dictionary into a lazily-evaluated `_ack()` function.

2. **React Rendering Crashes on Undefined Data:**
   - *The Bug:* The `/scholarships` page rendered a blank white screen because it was trying to map over mock data keys (`s.eligibility`) that didn't exist in the actual backend Pydantic schema.
   - *The Lesson:* Always ensure frontend prop mapping exactly matches the backend JSON schema.
   - *The Fix:* Updated the React components to use `s.is_for_mp_only` and `s.amount_description`.

3. **Vite Proxy Localhost Resolution (Node >= 17):**
   - *The Bug:* Vite's proxy was failing to connect to FastAPI because Node resolves `localhost` to `::1` (IPv6), while FastAPI listens on `127.0.0.1` (IPv4).
   - *The Lesson:* Explicitly set Vite proxy targets to `http://127.0.0.1:8000` rather than `http://localhost:8000`.

4. **Git Repository Scoping:**
   - *The Bug:* Attempted to commit files but realized we were tracking the entire `C:/Users/harsh` directory.
   - *The Lesson:* Always ensure `git init` is run precisely in the project root to prevent tracking the entire OS user profile.

5. **Client-Side Auth Validation vs Mock Auth:**
   - *The Bug:* The user pointed out that typing any arbitrary PAN card allowed them to log in.
   - *The Lesson:* For hackathons, it's tempting to use blind `navigate()` client-side redirects for speed, but judges will test it.
   - *The Fix:* Enforced real DB `fetch()` checks for PAN cards on the frontend before allowing access to the tracking dashboard.
