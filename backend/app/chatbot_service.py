import json
import re
from typing import Dict, Any, List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models import Student, ChatSession, ScholarshipScheme, Achievement
from app.schemas import ChatResponse
from app.ocr_service import process_document, validate_document_authenticity
from datetime import datetime
import os
import uuid

STEPS = [
    'welcome',
    'ask_name',
    'ask_father_name',
    'ask_mother_name',
    'ask_dob',
    'ask_gender',
    'ask_category',
    'ask_religion',
    'ask_mobile',
    'ask_email',
    'ask_pan',
    'ask_aadhaar',
    'ask_state',
    'ask_samagra',
    'ask_district',
    'ask_address',
    'ask_pincode',
    'ask_income',
    'ask_bpl',
    'ask_disability',
    'ask_10th_board',
    'ask_10th_percentage',
    'ask_10th_year',
    'ask_12th_board',
    'ask_12th_percentage',
    'ask_12th_year',
    'ask_12th_stream',
    'ask_current_course',
    'ask_current_year',
    'ask_institution',
    'ask_institution_type',
    'ask_rural_urban',
    'ask_bank_account',
    'ask_ifsc',
    'ask_achievements',
    'ask_achievement_details',
    'ask_achievement_year',
    'ask_more_achievements',
    'doc_aadhaar',
    'doc_pan',
    'doc_marksheet_10',
    'doc_marksheet_12',
    'doc_income_cert',
    'doc_caste_cert',
    'doc_domicile',
    'review_data',
    'recommend_scholarships',
    'complete'
]

ACHIEVEMENT_OPTIONS = [
    "NTSE", "KVPY", "INSPIRE", "JEE Main", "JEE Advanced",
    "NEET", "Olympiad", "State/National Sports", "NCC Certificate", "NSS", "Other"
]

DOC_STEPS = ['doc_aadhaar', 'doc_pan', 'doc_marksheet_10', 'doc_marksheet_12', 'doc_income_cert', 'doc_caste_cert', 'doc_domicile']

def calculate_progress(step: str) -> float:
    """Calculate completion percentage based on current step"""
    if step not in STEPS:
        return 0.0
    idx = STEPS.index(step)
    return round((idx / (len(STEPS) - 1)) * 100, 1)


class ChatbotService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create_session(self, session_id: str) -> ChatSession:
        result = await self.db.execute(select(ChatSession).filter(ChatSession.id == session_id))
        session = result.scalars().first()
        if not session:
            session = ChatSession(
                id=session_id,
                session_data={},
                current_step='welcome',
                collected_data={"achievements": []}
            )
            self.db.add(session)
            await self.db.commit()
            await self.db.refresh(session)

        if not isinstance(session.collected_data.get("achievements"), list):
            collected = dict(session.collected_data)
            collected["achievements"] = []
            session.collected_data = collected
            await self.db.commit()

        return session

    def _make_response(self, session_id: str, message: str, next_step: str,
                       is_complete: bool = False, options: list = None,
                       requires_file: bool = False, collected_data: dict = None,
                       scholarships: list = None, ocr_result: dict = None) -> ChatResponse:
        return ChatResponse(
            session_id=session_id,
            message=message,
            next_step=next_step,
            is_complete=is_complete,
            options=options,
            requires_file=requires_file,
            collected_data=collected_data,
            scholarships=scholarships,
            ocr_result=ocr_result,
            progress=calculate_progress(next_step)
        )

    def _get_next_step(self, current_step: str, collected: dict) -> str:
        """Determine next step with smart skip logic"""
        idx = STEPS.index(current_step) + 1
        if idx >= len(STEPS):
            return 'complete'
        next_step = STEPS[idx]

        state_val = collected.get('ask_state', '').lower()
        is_mp = state_val in ['mp', 'madhya pradesh', 'madhyapradesh']
        category_val = collected.get('ask_category', '').lower()

        # Skip Samagra ID if not from MP
        if next_step == 'ask_samagra' and not is_mp:
            idx += 1
            next_step = STEPS[idx]

        # Skip caste certificate if General category
        if next_step == 'doc_caste_cert' and category_val == 'general':
            idx += 1
            next_step = STEPS[idx]

        # Skip domicile if not from MP
        if next_step == 'doc_domicile' and not is_mp:
            idx += 1
            next_step = STEPS[idx]

        return next_step

    async def process_message(self, session_id: str, message: str, file=None) -> ChatResponse:
        session = await self.get_or_create_session(session_id)
        current_step = session.current_step
        collected = dict(session.collected_data)

        # ─── WELCOME ────────────────────────────────────────────────
        if current_step == 'welcome':
            session.current_step = 'ask_name'
            await self.db.commit()
            return self._make_response(
                session_id,
                "🙏 **Namaste! Welcome to ScholarSetu** — your AI-powered scholarship assistant.\n\n"
                "I'll help you find the best scholarships based on your profile. "
                "I'll ask you a few details, verify your documents using OCR, and then recommend the most suitable scholarships for you.\n\n"
                "📝 Let's start! **What is your full name?**\n\n"
                "_Example: Rahul Kumar Sharma_",
                'ask_name'
            )

        # ─── ACHIEVEMENT FLOW ───────────────────────────────────────
        if current_step == 'ask_achievements':
            if message.strip().lower() in ['yes', 'y', 'haan', 'ha']:
                session.current_step = 'ask_achievement_details'
                await self.db.commit()
                return self._make_response(
                    session_id,
                    "🏆 **Great! Which competitive exam or achievement do you have?**\n\n"
                    "Select from the options below or type your own:",
                    'ask_achievement_details',
                    options=ACHIEVEMENT_OPTIONS
                )
            else:
                next_step = 'doc_aadhaar'
                session.current_step = next_step
                await self.db.commit()
                msg = await self.generate_step_message(next_step, collected)
                return self._make_response(session_id, msg, next_step, requires_file=True)

        if current_step == 'ask_achievement_details':
            collected["current_achievement_name"] = message.strip()
            session.collected_data = collected
            session.current_step = 'ask_achievement_year'
            await self.db.commit()

            # Contextual pro-tips
            tip = ""
            name = message.strip()
            if name.upper() == "NTSE":
                tip = "\n\n💡 **Pro Tip:** NTSE scholars get ₹1,250/month (Class 11-12) and ₹2,000/month (UG/PG) automatically!"
            elif name.upper() in ["KVPY", "OLYMPIAD"]:
                tip = "\n\n💡 **Pro Tip:** KVPY/Olympiad winners are automatically eligible for **INSPIRE-SHE scholarship worth ₹80,000/year!**"
            elif "JEE" in name.upper() and "ADVANCED" in name.upper():
                tip = "\n\n💡 **Pro Tip:** JEE Advanced qualifiers with family income < ₹5L get **full IIT fee waiver!**"
            elif name.upper() == "NEET":
                tip = "\n\n💡 **Pro Tip:** NEET qualifiers may be eligible for state medical scholarships!"

            return self._make_response(
                session_id,
                f"📋 Please provide details for **{name}**:\n"
                f"- Your rank/score/medal\n"
                f"- Year of achievement\n\n"
                f"_Example: Rank 1500, 2024_{tip}\n\n"
                f"**What year did you achieve this?** (e.g., 2023)",
                'ask_achievement_year'
            )

        if current_step == 'ask_achievement_year':
            ach_name = collected.get("current_achievement_name", "Achievement")
            achievements = collected.get("achievements", [])
            achievements.append({
                "name": ach_name,
                "year": message.strip(),
                "detail": f"{ach_name} ({message.strip()})"
            })
            collected["achievements"] = achievements
            if "current_achievement_name" in collected:
                del collected["current_achievement_name"]
            session.collected_data = collected
            session.current_step = 'ask_more_achievements'
            await self.db.commit()
            return self._make_response(
                session_id,
                f"✅ **{ach_name} ({message.strip()})** recorded!\n\n"
                f"Do you have any more achievements or awards?",
                'ask_more_achievements',
                options=["Yes", "No"]
            )

        if current_step == 'ask_more_achievements':
            if message.strip().lower() in ['yes', 'y', 'haan', 'ha']:
                session.current_step = 'ask_achievement_details'
                await self.db.commit()
                return self._make_response(
                    session_id,
                    "🏆 Which other achievement do you have?",
                    'ask_achievement_details',
                    options=ACHIEVEMENT_OPTIONS
                )
            else:
                next_step = 'doc_aadhaar'
                session.current_step = next_step
                await self.db.commit()
                msg = await self.generate_step_message(next_step, collected)
                return self._make_response(session_id, msg, next_step, requires_file=True)

        # ─── DOCUMENT UPLOAD FLOW ───────────────────────────────────
        if current_step in DOC_STEPS:
            # Handle document upload
            ocr_result = None
            if file:
                # Save uploaded file
                upload_dir = os.path.join("uploads", session_id)
                os.makedirs(upload_dir, exist_ok=True)
                file_path = os.path.join(upload_dir, f"{current_step}_{file.filename}")
                content = await file.read()
                with open(file_path, "wb") as f:
                    f.write(content)

                # Process OCR
                doc_type_map = {
                    'doc_aadhaar': 'aadhaar',
                    'doc_pan': 'pan',
                    'doc_marksheet_10': 'marksheet_10',
                    'doc_marksheet_12': 'marksheet_12',
                    'doc_income_cert': 'income_cert',
                    'doc_caste_cert': 'caste_cert',
                    'doc_domicile': 'domicile'
                }
                doc_type = doc_type_map.get(current_step, 'other')

                try:
                    ocr_result = await process_document(file_path, doc_type)

                    if ocr_result['status'] == 'failed':
                        # OCR failed — offer manual review
                        return self._make_response(
                            session_id,
                            "⚠️ **OCR could not process this document.**\n\n"
                            "The image may be unclear or in an unsupported format.\n\n"
                            "**Options:**\n"
                            "1. 📷 **Re-upload** a clearer image\n"
                            "2. 👤 **Send for manual review** by our verification team\n\n"
                            "_Type 'retry' to re-upload or 'manual' to send for agent verification_",
                            current_step,
                            options=["Retry Upload", "Send for Manual Review"],
                            ocr_result=ocr_result
                        )

                    if ocr_result.get('confidence', 0) < 0.7:
                        # Low confidence — ask user to confirm
                        return self._make_response(
                            session_id,
                            f"🔍 **OCR processed but with low confidence ({int(ocr_result.get('confidence', 0) * 100)}%)**\n\n"
                            f"**Extracted data:** {json.dumps(ocr_result.get('extracted_data', {}), indent=2)}\n\n"
                            f"Is this information correct?\n\n"
                            f"_If the data doesn't look right, you can re-upload or send for manual review._",
                            current_step,
                            options=["Yes, it's correct", "Re-upload", "Send for Manual Review"],
                            ocr_result=ocr_result
                        )

                    # Validate against student data
                    auth_result = await validate_document_authenticity(
                        ocr_result.get('extracted_data', {}), doc_type, collected
                    )
                    if not auth_result['is_authentic']:
                        return self._make_response(
                            session_id,
                            f"🚨 **Document mismatch detected!**\n\n"
                            f"**Issues found:** {', '.join(auth_result['mismatches'])}\n\n"
                            f"The details on the document don't match what you provided earlier. "
                            f"Please ensure you're uploading the correct document.\n\n"
                            f"**Options:**\n"
                            f"1. 📷 **Re-upload** the correct document\n"
                            f"2. ✅ **Insist it's correct** (will be sent for manual verification)\n",
                            current_step,
                            options=["Re-upload", "This is correct, send for manual review"],
                            ocr_result=ocr_result
                        )

                except Exception:
                    ocr_result = {"status": "failed", "issues": ["OCR processing error"]}

            # Handle text responses for document steps (retry/manual/confirm)
            msg_lower = message.strip().lower()
            if 'retry' in msg_lower or 're-upload' in msg_lower or 'reupload' in msg_lower:
                msg = await self.generate_step_message(current_step, collected)
                return self._make_response(session_id, msg, current_step, requires_file=True)

            if 'manual' in msg_lower or 'insist' in msg_lower or 'correct' in msg_lower:
                collected[current_step] = "manual_review"
                session.collected_data = collected
                next_step = self._get_next_step(current_step, collected)
                session.current_step = next_step
                await self.db.commit()

                proceed_msg = (
                    "📋 **Sent for manual review.** Our verification team will review your document.\n"
                    "We'll proceed with the rest of the application in the meantime.\n\n"
                )
                if next_step in DOC_STEPS:
                    step_msg = await self.generate_step_message(next_step, collected)
                    return self._make_response(session_id, proceed_msg + step_msg, next_step, requires_file=True)
                elif next_step == 'review_data':
                    return self._make_response(
                        session_id,
                        proceed_msg + "📝 **Let's review all your details!** Type 'review' to see your complete profile.",
                        next_step,
                        collected_data=collected
                    )
                else:
                    step_msg = await self.generate_step_message(next_step, collected)
                    return self._make_response(session_id, proceed_msg + step_msg, next_step)

            # Document accepted (either via OCR success or user confirmation)
            collected[current_step] = "verified" if (ocr_result and ocr_result.get('status') == 'success') else "uploaded"
            session.collected_data = collected
            next_step = self._get_next_step(current_step, collected)
            session.current_step = next_step
            await self.db.commit()

            success_msg = "✅ **Document verified successfully!**\n\n" if ocr_result and ocr_result.get('status') == 'success' else "📄 **Document received!**\n\n"

            if next_step in DOC_STEPS:
                step_msg = await self.generate_step_message(next_step, collected)
                return self._make_response(session_id, success_msg + step_msg, next_step, requires_file=True, ocr_result=ocr_result)
            elif next_step == 'review_data':
                return self._make_response(
                    session_id,
                    success_msg + "🎉 **All documents collected!** Let's review your complete profile.\n\nType 'review' to see your details.",
                    next_step,
                    collected_data=collected,
                    ocr_result=ocr_result
                )
            else:
                step_msg = await self.generate_step_message(next_step, collected)
                return self._make_response(session_id, success_msg + step_msg, next_step, ocr_result=ocr_result)

        # ─── REVIEW DATA ────────────────────────────────────────────
        if current_step == 'review_data':
            review = "📝 **Your Profile Summary:**\n\n"
            review += f"👤 **Name:** {collected.get('ask_name', 'N/A')}\n"
            review += f"👨 **Father:** {collected.get('ask_father_name', 'N/A')}\n"
            review += f"👩 **Mother:** {collected.get('ask_mother_name', 'N/A')}\n"
            review += f"📅 **DOB:** {collected.get('ask_dob', 'N/A')}\n"
            review += f"⚧ **Gender:** {collected.get('ask_gender', 'N/A')}\n"
            review += f"🏷 **Category:** {collected.get('ask_category', 'N/A')}\n"
            review += f"📱 **Mobile:** {collected.get('ask_mobile', 'N/A')}\n"
            review += f"📧 **Email:** {collected.get('ask_email', 'N/A')}\n"
            review += f"🪪 **PAN:** {collected.get('ask_pan', 'N/A')}\n"
            review += f"🆔 **Aadhaar:** {'XXXX XXXX ' + str(collected.get('ask_aadhaar', ''))[-4:] if collected.get('ask_aadhaar') else 'N/A'}\n"
            review += f"📍 **State:** {collected.get('ask_state', 'N/A')}\n"
            review += f"🏘 **District:** {collected.get('ask_district', 'N/A')}\n"
            review += f"💰 **Family Income:** ₹{collected.get('ask_income', 'N/A')}\n"
            review += f"\n📚 **Education:**\n"
            review += f"   10th: {collected.get('ask_10th_percentage', 'N/A')}% ({collected.get('ask_10th_board', 'N/A')}, {collected.get('ask_10th_year', 'N/A')})\n"
            review += f"   12th: {collected.get('ask_12th_percentage', 'N/A')}% ({collected.get('ask_12th_board', 'N/A')}, {collected.get('ask_12th_year', 'N/A')})\n"
            review += f"   Course: {collected.get('ask_current_course', 'N/A')} (Year {collected.get('ask_current_year', 'N/A')})\n"
            review += f"   Institution: {collected.get('ask_institution', 'N/A')} ({collected.get('ask_institution_type', 'N/A')})\n"

            achievements = collected.get('achievements', [])
            if achievements:
                review += "\n🏆 **Achievements:**\n"
                for a in achievements:
                    review += f"   • {a['name']} ({a['year']})\n"

            review += "\n✅ **Is everything correct?** Type 'confirm' to proceed to scholarship recommendations, or tell me what needs to be changed."

            session.current_step = 'recommend_scholarships'
            await self.db.commit()
            return self._make_response(
                session_id, review, 'recommend_scholarships',
                collected_data=collected,
                options=["Confirm - Show Scholarships"]
            )

        # ─── SCHOLARSHIP RECOMMENDATIONS ────────────────────────────
        if current_step == 'recommend_scholarships':
            matches = await self.get_matching_scholarships(collected)
            session.current_step = 'complete'
            await self.db.commit()

            if not matches:
                return self._make_response(
                    session_id,
                    "😔 **No matching scholarships found** based on your current profile.\n\n"
                    "This could be due to income limits, marks criteria, or category requirements. "
                    "Please check back as new schemes are added regularly!",
                    'complete',
                    is_complete=True,
                    collected_data=collected
                )

            resp = "🎓 **Your Scholarship Recommendations:**\n\n"
            scholarship_list = []
            for i, m in enumerate(matches, 1):
                s = m['scheme']
                score = m['match_score']
                unlocked_by = m.get('unlocked_by', None)
                emoji = "🟢" if score >= 80 else "🟡" if score >= 50 else "🔴"

                resp += f"**{i}. {s.name}** ({s.short_name})\n"
                resp += f"   {emoji} Match: {score}%\n"
                resp += f"   💰 Amount: {s.amount_description}\n"
                resp += f"   🏛 {s.level.title()} | {s.department}\n"
                if unlocked_by:
                    resp += f"   🏆 _Unlocked by: {unlocked_by}_\n"
                resp += f"   🔗 Apply: {s.application_url}\n\n"

                scholarship_list.append({
                    "name": s.name,
                    "short_name": s.short_name,
                    "amount": s.amount_description,
                    "max_amount": s.max_amount,
                    "match_score": score,
                    "level": s.level,
                    "department": s.department,
                    "description": s.description,
                    "application_url": s.application_url,
                    "unlocked_by": unlocked_by
                })

            resp += f"\n📊 **Total: {len(matches)} scholarships matched!**\n"
            resp += "Thank you for using ScholarSetu! 🙏"

            return self._make_response(
                session_id, resp, 'complete',
                is_complete=True,
                collected_data=collected,
                scholarships=scholarship_list
            )

        # ─── COMPLETE ───────────────────────────────────────────────
        if current_step == 'complete':
            return self._make_response(
                session_id,
                "✅ Your application is complete! You can start a new session anytime.",
                'complete',
                is_complete=True
            )

        # ─── REGULAR INPUT STEPS ────────────────────────────────────
        is_valid, error_msg, formatted_value = await self.validate_input(current_step, message)
        if not is_valid:
            return self._make_response(
                session_id,
                f"❌ {error_msg}\n\nPlease try again.",
                current_step
            )

        # Store validated data
        collected[current_step] = formatted_value

        # Title-case names
        if current_step in ['ask_name', 'ask_father_name', 'ask_mother_name']:
            formatted_value = formatted_value.title()
            collected[current_step] = formatted_value

        # PAN duplicate check
        if current_step == 'ask_pan':
            is_duplicate = await self.check_duplicate_pan(formatted_value)
            if is_duplicate:
                return self._make_response(
                    session_id,
                    "🚫 **Duplicate PAN detected!**\n\n"
                    "This PAN card is already registered in our system. "
                    "Each person can apply for scholarships only once to prevent fraud.\n\n"
                    "If you believe this is an error, please contact our helpline.",
                    current_step
                )

        # Auto-detect MP state
        if current_step == 'ask_state':
            state_val = formatted_value.lower()
            if state_val in ['mp', 'madhya pradesh', 'madhyapradesh']:
                collected['is_from_mp'] = True

        session.collected_data = collected
        next_step = self._get_next_step(current_step, collected)
        session.current_step = next_step
        await self.db.commit()

        # Build acknowledgement prefix (only for current step to avoid eager eval errors)
        def _ack(step, val):
            if step == 'ask_name':
                return f"✅ Great! Your name is **{collected.get('ask_name', '')}**."
            elif step == 'ask_father_name':
                return f"✅ Father's name: **{collected.get('ask_father_name', '')}**."
            elif step == 'ask_mother_name':
                return f"✅ Mother's name: **{collected.get('ask_mother_name', '')}**."
            elif step == 'ask_dob':
                return f"✅ Date of Birth: **{val}**."
            elif step == 'ask_gender':
                return f"✅ Gender: **{val}**."
            elif step == 'ask_category':
                return f"✅ Category: **{val}**."
            elif step == 'ask_mobile':
                return f"✅ Mobile: **{val}**."
            elif step == 'ask_email':
                return f"✅ Email: **{val}**."
            elif step == 'ask_pan':
                return f"✅ PAN: **{val}** — verified, no duplicates found!"
            elif step == 'ask_aadhaar':
                return f"✅ Aadhaar: **XXXX XXXX {val[-4:]}** — recorded securely."
            elif step == 'ask_state':
                extra = " 🎉 You're eligible for MP-specific schemes!" if collected.get('is_from_mp') else ""
                return f"✅ State: **{val}**.{extra}"
            elif step == 'ask_income':
                try:
                    return f"✅ Family income: **₹{float(val):,.0f}**."
                except (ValueError, TypeError):
                    return f"✅ Income: **{val}**."
            elif step == 'ask_10th_percentage':
                return f"✅ 10th Percentage: **{val}%**."
            elif step == 'ask_12th_percentage':
                return f"✅ 12th Percentage: **{val}%**."
            elif step == 'ask_12th_stream':
                return f"✅ Stream: **{val}**."
            elif step == 'ask_institution':
                return f"✅ Institution: **{val}**."
            elif step in ('ask_bank_account', 'ask_address'):
                return "✅ Recorded."
            else:
                return f"✅ Got it: **{val}**."
        ack_prefix = _ack(current_step, formatted_value)

        msg = await self.generate_step_message(next_step, collected)
        msg = ack_prefix + "\n\n" + msg

        requires_file = next_step in DOC_STEPS
        options = self._get_step_options(next_step)

        return self._make_response(
            session_id, msg, next_step,
            requires_file=requires_file,
            options=options,
            collected_data=collected
        )

    def _get_step_options(self, step: str) -> Optional[list]:
        """Return quick-reply options for steps that need them"""
        options_map = {
            'ask_gender': ['Male', 'Female', 'Other'],
            'ask_category': ['General', 'SC', 'ST', 'OBC'],
            'ask_bpl': ['Yes', 'No'],
            'ask_disability': ['Yes', 'No'],
            'ask_12th_stream': ['Science', 'Commerce', 'Arts'],
            'ask_institution_type': ['Government', 'Private'],
            'ask_rural_urban': ['Rural', 'Urban'],
            'ask_achievements': ['Yes', 'No'],
            'ask_10th_board': ['MP Board', 'CBSE', 'ICSE', 'Other State Board'],
            'ask_12th_board': ['MP Board', 'CBSE', 'ICSE', 'Other State Board'],
        }
        return options_map.get(step)

    async def validate_input(self, step: str, value: str) -> Tuple[bool, str, Any]:
        v = value.strip()
        if not v:
            return False, "This field cannot be empty. Please provide a value.", v

        if step == 'ask_name':
            if len(v) < 2:
                return False, "Name must be at least 2 characters long.", v
            if any(ch.isdigit() for ch in v):
                return False, "Name should not contain numbers.", v

        elif step in ['ask_father_name', 'ask_mother_name']:
            if len(v) < 2:
                return False, "Name must be at least 2 characters long.", v

        elif step == 'ask_dob':
            # Accept multiple formats
            for fmt in ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d']:
                try:
                    datetime.strptime(v, fmt)
                    return True, "", v
                except ValueError:
                    continue
            return False, "Invalid date format. Please use YYYY-MM-DD (e.g., 2003-05-15).", v

        elif step == 'ask_gender':
            if v.lower() not in ['male', 'female', 'other']:
                return False, "Please select: Male, Female, or Other.", v
            v = v.capitalize()

        elif step == 'ask_category':
            valid_cats = {'general', 'sc', 'st', 'obc'}
            if v.lower() not in valid_cats:
                return False, "Please select: General, SC, ST, or OBC.", v
            v = v.upper() if v.lower() != 'general' else 'General'

        elif step == 'ask_mobile':
            v = v.replace(' ', '').replace('-', '').replace('+91', '')
            if not v.isdigit() or len(v) != 10:
                return False, "📱 Mobile number must be exactly **10 digits**. (Don't include +91)\n_Example: 9876543210_", v
            if v[0] not in '6789':
                return False, "Invalid mobile number. Indian numbers start with 6, 7, 8, or 9.", v

        elif step == 'ask_email':
            if not re.match(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$', v):
                return False, "📧 Please enter a valid email address.\n_Example: rahul@gmail.com_", v

        elif step == 'ask_pan':
            v = v.upper().replace(' ', '')
            if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', v):
                return False, "🪪 Invalid PAN format. PAN must be like **ABCDE1234F**\n(5 letters + 4 digits + 1 letter)", v

        elif step == 'ask_aadhaar':
            v = v.replace(' ', '').replace('-', '')
            if not v.isdigit() or len(v) != 12:
                return False, "🆔 Aadhaar must be exactly **12 digits**.\n_Example: 123456789012_", v

        elif step == 'ask_pincode':
            v = v.replace(' ', '')
            if not v.isdigit() or len(v) != 6:
                return False, "📮 Pincode must be exactly **6 digits**.\n_Example: 462001_", v

        elif step == 'ask_income':
            v = v.replace(',', '').replace('₹', '').replace('rs', '').replace('Rs', '').replace('RS', '').strip()
            try:
                income = float(v)
                if income <= 0:
                    return False, "Income must be a positive number.", v
                v = str(income)
            except ValueError:
                return False, "💰 Please enter a valid number for annual income.\n_Example: 300000 or 3,00,000_", v

        elif step in ['ask_10th_percentage', 'ask_12th_percentage']:
            try:
                pct = float(v.replace('%', ''))
                if pct < 0 or pct > 100:
                    return False, "Percentage must be between 0 and 100.", v
                v = str(pct)
            except ValueError:
                return False, "📊 Please enter a valid percentage (0-100).\n_Example: 85.5_", v

        elif step in ['ask_10th_year', 'ask_12th_year']:
            try:
                year = int(v)
                current_year = datetime.now().year
                if year < 2000 or year > current_year:
                    return False, f"Year must be between 2000 and {current_year}.", v
            except ValueError:
                return False, "Please enter a valid year.\n_Example: 2022_", v

        elif step == 'ask_current_year':
            try:
                yr = int(v)
                if yr < 1 or yr > 6:
                    return False, "Study year must be between 1 and 6.", v
            except ValueError:
                return False, "Please enter a number (1-6).", v

        elif step == 'ask_ifsc':
            v = v.upper().replace(' ', '')
            if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', v):
                return False, "🏦 Invalid IFSC code. It should be **11 characters** (e.g., SBIN0001234).", v

        elif step == 'ask_bank_account':
            v = v.replace(' ', '').replace('-', '')
            if not v.isdigit() or len(v) < 9 or len(v) > 18:
                return False, "🏦 Bank account number should be **9-18 digits**.", v

        return True, "", v

    async def check_duplicate_pan(self, pan: str) -> bool:
        result = await self.db.execute(select(Student).filter(Student.pan_card == pan))
        existing = result.scalars().first()
        return existing is not None

    async def get_matching_scholarships(self, student_data: dict) -> list:
        result = await self.db.execute(select(ScholarshipScheme).filter(ScholarshipScheme.is_active == True))
        all_schemes = result.scalars().all()

        matches = []
        state_val = student_data.get('ask_state', '').lower()
        is_mp = state_val in ['mp', 'madhya pradesh', 'madhyapradesh']
        income_str = student_data.get('ask_income', '0')
        try:
            income = float(str(income_str).replace(',', ''))
        except (ValueError, TypeError):
            income = 0
        cat = student_data.get('ask_category', 'General')
        gender = student_data.get('ask_gender', 'Male')
        try:
            perc_12 = float(str(student_data.get('ask_12th_percentage', 0)))
        except (ValueError, TypeError):
            perc_12 = 0
        board_12 = student_data.get('ask_12th_board', '').lower()
        is_rural = student_data.get('ask_rural_urban', '').lower() == 'rural'
        is_bpl = student_data.get('ask_bpl', '').lower() in ['yes', 'y']
        achievements = student_data.get("achievements", [])
        ach_names = [a["name"].upper() for a in achievements]

        for s in all_schemes:
            score = 0
            eligible = True
            unlocked_by = None

            # MP check
            if s.is_for_mp_only and not is_mp:
                continue

            # Income check
            if s.max_family_income and income > s.max_family_income:
                if s.short_name == "IIT Waiver" and "JEE ADVANCED" in ach_names and income <= 500000:
                    pass
                else:
                    continue

            # Category check
            if s.eligibility_category != 'All':
                eligible_cats = [c.strip().upper() for c in s.eligibility_category.split(',')]
                if cat.upper() not in eligible_cats:
                    continue

            # Gender check
            if s.eligibility_gender != 'All' and s.eligibility_gender.lower() != gender.lower():
                continue

            # Marks check
            if s.min_12th_percentage:
                required_pct = s.min_12th_percentage
                # MMVY has different cutoffs for different boards
                if s.short_name == 'MMVY':
                    if 'cbse' in board_12 or 'icse' in board_12:
                        required_pct = 85.0
                    else:
                        required_pct = 70.0

                if perc_12 < required_pct:
                    # INSPIRE exception for KVPY/NTSE/Olympiad holders
                    if s.short_name == "INSPIRE" and any(a in ach_names for a in ["KVPY", "NTSE", "OLYMPIAD"]):
                        unlocked_by = next(a for a in ach_names if a in ["KVPY", "NTSE", "OLYMPIAD"])
                    else:
                        continue

            # BPL check
            if s.requires_bpl and not is_bpl:
                continue

            # Rural/Urban check
            if s.requires_rural and not is_rural:
                continue
            if s.requires_urban and is_rural:
                continue

            # Calculate match score (0-100)
            score = 70  # Base score for meeting all criteria

            # Income proximity bonus (closer to limit = more likely to qualify)
            if s.max_family_income:
                income_ratio = income / s.max_family_income
                if income_ratio <= 0.5:
                    score += 15
                elif income_ratio <= 0.8:
                    score += 10
                else:
                    score += 5

            # Marks bonus
            if s.min_12th_percentage and perc_12 > 0:
                marks_excess = perc_12 - s.min_12th_percentage
                if marks_excess > 15:
                    score += 15
                elif marks_excess > 5:
                    score += 10
                else:
                    score += 5

            # Achievement bonuses
            if s.short_name == "NTSE" and "NTSE" in ach_names:
                score += 30
                unlocked_by = "NTSE"
            if s.short_name == "INSPIRE" and any(a in ach_names for a in ["KVPY", "NTSE", "OLYMPIAD"]):
                score += 30
                unlocked_by = next(a for a in ach_names if a in ["KVPY", "NTSE", "OLYMPIAD"])
            if s.short_name == "IIT Waiver" and "JEE ADVANCED" in ach_names:
                score += 30
                unlocked_by = "JEE Advanced"
            if "SPORTS" in s.name.upper() and "STATE/NATIONAL SPORTS" in ach_names:
                score += 30
                unlocked_by = "Sports Achievement"

            score = min(score, 100)

            # Skip achievement-only scholarships if student doesn't have the achievement
            if s.short_name == "NTSE" and "NTSE" not in ach_names:
                continue
            if s.short_name == "IIT Waiver" and "JEE ADVANCED" not in ach_names:
                continue

            matches.append({
                "scheme": s,
                "match_score": score,
                "unlocked_by": unlocked_by
            })

        matches.sort(key=lambda x: x['match_score'], reverse=True)
        return matches

    async def generate_step_message(self, step: str, collected: dict = None) -> str:
        """Generate friendly, detailed bot messages for each step"""
        collected = collected or {}
        name = collected.get('ask_name', '')

        messages = {
            'ask_name': "📝 **What is your full name?**\n_As it appears on your official documents_\n_Example: Rahul Kumar Sharma_",

            'ask_father_name': f"👨 **What is your father's full name?**\n_As it appears on official documents_",

            'ask_mother_name': f"👩 **What is your mother's full name?**",

            'ask_dob': "📅 **What is your Date of Birth?**\n_Format: YYYY-MM-DD_\n_Example: 2003-05-15_",

            'ask_gender': "⚧ **What is your gender?**\n_This helps us match gender-specific scholarships like Gaon Ki Beti, Pratibha Kiran_",

            'ask_category': "🏷 **What is your caste category?**\n\n_This determines eligibility for schemes like MPTAAS (SC/ST), OBC Post-Matric, Vikramaditya (General)_",

            'ask_religion': "🕉 **What is your religion?**\n_Example: Hindu, Muslim, Christian, Sikh, Buddhist, Jain, Other_",

            'ask_mobile': "📱 **What is your 10-digit mobile number?**\n_We'll use this for OTP verification and alerts_\n_Example: 9876543210 (don't include +91)_",

            'ask_email': "📧 **What is your email address?**\n_Scholarship updates will be sent here_\n_Example: rahul@gmail.com_",

            'ask_pan': "🪪 **What is your PAN Card number?**\n\n_⚠️ Important: We use PAN to ensure each person applies only once_\n_Format: ABCDE1234F (5 letters + 4 digits + 1 letter)_",

            'ask_aadhaar': "🆔 **What is your 12-digit Aadhaar number?**\n_This is required for identity verification and DBT_\n_Example: 1234 5678 9012_",

            'ask_state': "📍 **Which state are you from?**\n\n_💡 If you're from **Madhya Pradesh**, you'll be eligible for special MP schemes like MMVY, MPTAAS, Gaon Ki Beti, and more!_",

            'ask_samagra': "📋 **What is your Samagra ID?**\n\n_Samagra ID is mandatory for all MP scholarship applications._\n_You can find it at samagra.gov.in_",

            'ask_district': "🏘 **Which district do you belong to?**\n_Example: Bhopal, Indore, Jabalpur_",

            'ask_address': "🏠 **What is your full address?**\n_Include: House/Street, Locality, City_",

            'ask_pincode': "📮 **What is your area pincode?**\n_Must be 6 digits_\n_Example: 462001_",

            'ask_income': "💰 **What is your family's total annual income (in ₹)?**\n\n_This is crucial for scholarship eligibility:_\n"
                          "• _MPTAAS (SC/ST): ≤ ₹2,50,000_\n"
                          "• _Vikramaditya: ≤ ₹1,20,000_\n"
                          "• _MMVY: ≤ ₹6,00,000_\n"
                          "• _Central schemes: ≤ ₹8,00,000_\n\n"
                          "_Example: 300000 or 3,00,000_",

            'ask_bpl': "📋 **Do you have a BPL (Below Poverty Line) card?**\n_Required for Pratibha Kiran scholarship_",

            'ask_disability': "♿ **Do you have any disability?**\n_Persons with disabilities get additional scholarship benefits_",

            'ask_10th_board': "📚 **Which board did you complete 10th from?**",

            'ask_10th_percentage': "📊 **What was your 10th percentage/CGPA?**\n_Enter as percentage (0-100)_\n_Example: 85.5_",

            'ask_10th_year': "📆 **In which year did you pass 10th?**\n_Example: 2020_",

            'ask_12th_board': "📚 **Which board did you complete 12th from?**\n\n_💡 For MMVY: MP Board needs 70%+, CBSE/ICSE needs 85%+_",

            'ask_12th_percentage': "📊 **What was your 12th percentage?**\n\n"
                                   "_Key thresholds:_\n"
                                   "• _60%+ → Gaon Ki Beti, Pratibha Kiran, Vikramaditya_\n"
                                   "• _70%+ (MP Board) → MMVY_\n"
                                   "• _85%+ (CBSE/ICSE) → MMVY_\n"
                                   "• _80%+ → Central Sector Scheme_",

            'ask_12th_year': "📆 **In which year did you pass 12th?**\n_Example: 2022_",

            'ask_12th_stream': "🔬 **What was your stream in 12th?**",

            'ask_current_course': "🎓 **What course are you currently pursuing?**\n_Example: B.Tech, MBBS, B.Sc, BA, B.Com, MBA, etc._",

            'ask_current_year': "📅 **Which year of study are you in?**\n_Example: 1, 2, 3, 4_",

            'ask_institution': "🏫 **What is the name of your institution?**\n_Full name of your college/university_",

            'ask_institution_type': "🏛 **Is your institution Government or Private?**\n_Some scholarships are only for govt. institution students_",

            'ask_rural_urban': "🌾 **Do you live in a Rural or Urban area?**\n\n_💡 Rural girls are eligible for **Gaon Ki Beti** (₹5,000-₹7,500/year)_\n_💡 Urban BPL girls are eligible for **Pratibha Kiran** (₹5,000/year)_",

            'ask_bank_account': "🏦 **What is your bank account number?**\n_Scholarship amount will be transferred via DBT to this account_\n_Must be Aadhaar-linked_",

            'ask_ifsc': "🏦 **What is your bank's IFSC code?**\n_11 characters, found on cheque book or bank passbook_\n_Example: SBIN0001234_",

            'ask_achievements': "🏆 **Do you have any achievements in competitive exams, olympiads, or sports?**\n\n"
                                "_These can unlock special scholarships:_\n"
                                "• _NTSE → ₹1,250-₹2,000/month_\n"
                                "• _KVPY/Olympiad → INSPIRE ₹80,000/year_\n"
                                "• _JEE Advanced → IIT Fee Waiver_\n"
                                "• _Sports → State Sports Scholarship_",

            'doc_aadhaar': "📄 **Please upload a clear photo of your Aadhaar Card.**\n\n_Tips for best OCR results:_\n• Good lighting, no glare\n• All text clearly visible\n• Both front side needed\n\n📷 _Upload an image file (JPG, PNG)_",

            'doc_pan': "📄 **Please upload a clear photo of your PAN Card.**\n\n_We'll verify the PAN number matches what you provided._\n📷 _Upload an image file_",

            'doc_marksheet_10': "📄 **Please upload your 10th Class Marksheet.**\n\n_We'll extract and verify your marks and board details._\n📷 _Upload an image or PDF_",

            'doc_marksheet_12': "📄 **Please upload your 12th Class Marksheet.**\n\n_This is the most important document for scholarship matching!_\n📷 _Upload an image or PDF_",

            'doc_income_cert': "📄 **Please upload your Income Certificate.**\n\n_Issued by Tehsildar/SDM. Should clearly state the annual family income._\n📷 _Upload an image_",

            'doc_caste_cert': "📄 **Please upload your Caste Certificate.**\n\n_Required for SC/ST/OBC scholarship verification._\n📷 _Upload an image_",

            'doc_domicile': "📄 **Please upload your MP Domicile Certificate.**\n\n_Required for all MP state scholarships._\n📷 _Upload an image_",
        }
        return messages.get(step, "Please provide the requested information.")
