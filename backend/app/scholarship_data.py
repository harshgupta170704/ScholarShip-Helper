from sqlalchemy.future import select
from app.models import ScholarshipScheme
import json

SCHEMES_DATA = [
    # ──────────────────────────────────────────────────────────────────
    # 1. MMVY — medhavikalyan.mp.gov.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Mukhyamantri Medhavi Vidyarthi Yojana",
        "short_name": "MMVY",
        "department": "Technical Education & Skill Development Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Provides tuition fee reimbursement for meritorious students of MP. "
            "MP Board: 70%+ in 12th. CBSE/ICSE: 85%+ in 12th. "
            "Engineering: JEE Main rank within 1,50,000. Medical: NEET-based admission. "
            "Law: CLAT / DU admission. Covers actual tuition + admission fee "
            "(excluding mess, caution money, hostel). Engineering private cap: ₹1,50,000."
        ),
        "amount_description": "Full tuition + admission fee (Engineering pvt. cap ₹1,50,000)",
        "max_amount": 150000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": 70.0,          # MP Board; CBSE/ICSE = 85
        "min_12th_percentage_cbse": 85.0,     # stored in description, handled in code
        "max_family_income": 600000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": "MP Board: 70%, CBSE/ICSE: 85%",
        "education_level": "ug",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "marksheet_10", "marksheet_12",
            "income_cert", "domicile", "admission_letter", "fee_receipt",
            "bank_passbook", "passport_photo", "college_code",
            "entrance_scorecard"
        ]),
        "application_url": "https://medhavikalyan.mp.gov.in/MMVY.aspx",
        "deadline": "August (check portal)",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 2. MPTAAS — tribal.mp.gov.in/MPTAAS
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Post-Matric Scholarship for SC/ST (MPTAAS)",
        "short_name": "MPTAAS",
        "department": "Tribal Affairs & SC Welfare Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Financial assistance for SC/ST students in post-matric education "
            "(Class 11, 12, UG, PG, Diploma, ITI, Professional courses). "
            "Requires Samagra ID, Aadhaar e-KYC, and NPCI-mapped bank account. "
            "Covers maintenance allowance + fees. Hosteller/Day-Scholar status affects amount. "
            "Income limit: ₹6,00,000. Helpline: 1800 2333 951."
        ),
        "amount_description": "Maintenance allowance + fees (varies by course & hosteller status)",
        "max_amount": 50000.0,
        "eligibility_category": "SC,ST",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": 600000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "post_matric",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "aadhaar_ekcy", "caste_cert",
            "domicile", "income_cert", "marksheet_previous",
            "admission_letter", "fee_receipt", "bonafide_cert",
            "bank_passbook", "passport_photo", "tc"
        ]),
        "application_url": "https://www.tribal.mp.gov.in/MPTAAS",
        "deadline": "Check portal",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 3. Gaon Ki Beti — scholarshipportal.mp.nic.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Gaon Ki Beti Yojana",
        "short_name": "Gaon Ki Beti",
        "department": "Higher Education Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Financial assistance for rural girls pursuing higher education. "
            "Must be female, from a rural area, with 60%+ in Class 12. "
            "Requires 'Gaon Ki Beti' certificate from village. "
            "₹500/month × 10 months = ₹5,000/year for general courses. "
            "₹750/month × 10 months = ₹7,500/year for technical/medical courses."
        ),
        "amount_description": "₹5,000/year (general) | ₹7,500/year (technical/medical)",
        "max_amount": 7500.0,
        "eligibility_category": "All",
        "eligibility_gender": "Female",
        "min_12th_percentage": 60.0,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": True,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "marksheet_10", "marksheet_12",
            "domicile", "gaon_ki_beti_cert", "income_cert",
            "caste_cert", "admission_letter", "college_code",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 4. Pratibha Kiran — scholarshipportal.mp.nic.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Pratibha Kiran Scholarship",
        "short_name": "Pratibha Kiran",
        "department": "Higher Education Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Financial assistance for urban BPL girls pursuing higher education. "
            "Must be female, from an urban area, BPL family, with 60%+ in Class 12. "
            "₹500/month × 10 months = ₹5,000/year for general courses. "
            "₹750/month × 10 months = ₹7,500/year for technical/medical courses."
        ),
        "amount_description": "₹5,000/year (general) | ₹7,500/year (technical/medical)",
        "max_amount": 7500.0,
        "eligibility_category": "All",
        "eligibility_gender": "Female",
        "min_12th_percentage": 60.0,
        "max_family_income": None,
        "requires_bpl": True,
        "requires_rural": False,
        "requires_urban": True,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "marksheet_10", "marksheet_12",
            "domicile", "bpl_cert", "income_cert", "caste_cert",
            "admission_letter", "college_code",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 5. Vikramaditya — scholarshipportal.mp.nic.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Vikramaditya Yojana",
        "short_name": "Vikramaditya",
        "department": "Higher Education Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Free education scheme for General category economically weaker students. "
            "Must have 60%+ in Class 12. Income limit: ₹54,000 (graduation) / "
            "₹1,20,000 (higher education). Must be enrolled in govt/govt-aided college. "
            "Provides reimbursement of college fees."
        ),
        "amount_description": "College fee reimbursement (up to ₹2,500/year)",
        "max_amount": 2500.0,
        "eligibility_category": "General",
        "eligibility_gender": "All",
        "min_12th_percentage": 60.0,
        "max_family_income": 120000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "marksheet_10", "marksheet_12",
            "income_cert", "domicile", "college_code",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 6. MMJKY — scholarshipportal.mp.nic.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Mukhyamantri Jan Kalyan Yojana (Sambal)",
        "short_name": "MMJKY",
        "department": "Labour Department",
        "level": "state",
        "state": "MP",
        "description": (
            "For children of registered unorganized workers (Sambal card holders). "
            "Covers UG, PG, Diploma, and ITI courses. Parent must be registered "
            "on the Sambal portal. No income limit — card-based eligibility."
        ),
        "amount_description": "Full tuition + admission fee (similar to MMVY)",
        "max_amount": 150000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "all",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "sambal_card", "marksheet_10",
            "marksheet_12", "domicile", "admission_letter",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    },
    # ──────────────────────────────────────────────────────────────────
    # 7. OBC Post-Matric — scholarshipportal.mp.nic.in
    # ──────────────────────────────────────────────────────────────────
    {
        "name": "Post-Matric Scholarship for OBC",
        "short_name": "OBC Post-Matric",
        "department": "Backward Classes & Minorities Welfare Department",
        "level": "state",
        "state": "MP",
        "description": (
            "Post-matric scholarship for OBC students of MP. "
            "Income limit: ₹3,00,000/year. Covers maintenance + tuition fee."
        ),
        "amount_description": "Maintenance allowance + tuition fee",
        "max_amount": 20000.0,
        "eligibility_category": "OBC",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": 300000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "post_matric",
        "documents_required": json.dumps([
            "samagra_id", "aadhaar", "marksheet_10", "marksheet_12",
            "caste_cert", "income_cert", "domicile",
            "admission_letter", "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    },
    # ══════════════════════════════════════════════════════════════════
    #  CENTRAL SCHEMES (for non-MP and all-India students)
    # ══════════════════════════════════════════════════════════════════
    {
        "name": "Post-Matric Scholarship for SC (Central)",
        "short_name": "NSP SC Post-Matric",
        "department": "Ministry of Social Justice & Empowerment",
        "level": "central",
        "state": None,
        "description": (
            "Central government post-matric scholarship for SC students. "
            "Income limit: ₹2,50,000/year. Apply via National Scholarship Portal."
        ),
        "amount_description": "Maintenance + tuition (varies by course)",
        "max_amount": 50000.0,
        "eligibility_category": "SC",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": 250000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "post_matric",
        "documents_required": json.dumps([
            "aadhaar", "marksheet_10", "marksheet_12", "caste_cert",
            "income_cert", "domicile", "admission_letter",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarships.gov.in/",
        "deadline": "November (check NSP)",
        "is_active": True
    },
    {
        "name": "Central Sector Scheme of Scholarship",
        "short_name": "CSSS",
        "department": "Department of Higher Education, MoE",
        "level": "central",
        "state": None,
        "description": (
            "For students above 80th percentile in Class 12 board exam. "
            "Income limit: ₹8,00,000. ₹20,000/year for UG, ₹20,000/year for PG. "
            "Not available at diploma/certificate level."
        ),
        "amount_description": "₹20,000/year (UG & PG)",
        "max_amount": 20000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": 80.0,
        "max_family_income": 800000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "aadhaar", "marksheet_12", "income_cert",
            "admission_letter", "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://scholarships.gov.in/",
        "deadline": "October (check NSP)",
        "is_active": True
    },
    {
        "name": "PM Scholarship Scheme (PMSS)",
        "short_name": "PMSS",
        "department": "Kendriya Sainik Board, MoD",
        "level": "central",
        "state": None,
        "description": (
            "For wards/widows of ex-servicemen, para-military, and police. "
            "Boys: ₹30,000/year. Girls: ₹36,000/year. Min 60% in 12th. "
            "Must be pursuing first professional degree."
        ),
        "amount_description": "Boys: ₹30,000/year | Girls: ₹36,000/year",
        "max_amount": 36000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": 60.0,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "aadhaar", "marksheet_12", "ex_serviceman_cert",
            "admission_letter", "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://ksb.gov.in/",
        "deadline": "October (check KSB)",
        "is_active": True
    },
    # ──────── Achievement-based Central Schemes ────────
    {
        "name": "NTSE Scholarship",
        "short_name": "NTSE",
        "department": "NCERT",
        "level": "central",
        "state": None,
        "description": (
            "For NTSE-selected candidates. ₹1,250/month for Class 11-12. "
            "₹2,000/month for UG/PG. ₹28,000/month for PhD (UGC norms). "
            "Selection through Stage-I (state) and Stage-II (national) exam."
        ),
        "amount_description": "₹1,250/month (11-12) | ₹2,000/month (UG/PG) | ₹28,000/month (PhD)",
        "max_amount": 336000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "all",
        "documents_required": json.dumps([
            "aadhaar", "ntse_certificate", "marksheet_10", "marksheet_12",
            "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://ncert.nic.in/",
        "deadline": "Ongoing",
        "is_active": True
    },
    {
        "name": "INSPIRE-SHE Scholarship",
        "short_name": "INSPIRE",
        "department": "Department of Science & Technology",
        "level": "central",
        "state": None,
        "description": (
            "Innovation in Science Pursuit for Inspired Research. "
            "₹80,000/year for BSc/BS/Int.MSc in natural & basic sciences. "
            "Eligible: Top 1% in Class 12 board, OR KVPY/NTSE/Olympiad winner. "
            "Summer attachment of ₹20,000 for research exposure."
        ),
        "amount_description": "₹80,000/year + ₹20,000 summer attachment",
        "max_amount": 100000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": 90.0,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "aadhaar", "marksheet_12", "kvpy_ntse_olympiad_cert",
            "admission_letter", "bank_passbook", "passport_photo"
        ]),
        "application_url": "https://online-inspire.gov.in/",
        "deadline": "October (check DST)",
        "is_active": True
    },
    {
        "name": "IIT Fee Waiver",
        "short_name": "IIT Waiver",
        "department": "IITs (Individual Institutes)",
        "level": "central",
        "state": None,
        "description": (
            "Full tuition fee waiver for JEE Advanced qualifiers admitted to IITs. "
            "Family income < ₹1L: full fee waiver. "
            "Income ₹1L-₹5L: 2/3 fee waiver. "
            "Income ₹5L-₹9L: 1/3 fee waiver."
        ),
        "amount_description": "Full/partial tuition waiver (up to ₹2,00,000+)",
        "max_amount": 200000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": 75.0,
        "max_family_income": 900000.0,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": False,
        "min_board": None,
        "education_level": "ug",
        "documents_required": json.dumps([
            "aadhaar", "jee_advanced_scorecard", "marksheet_12",
            "income_cert", "admission_letter", "bank_passbook"
        ]),
        "application_url": "https://jeeadv.ac.in/",
        "deadline": "At admission",
        "is_active": True
    },
    {
        "name": "State Sports Scholarship (MP)",
        "short_name": "Sports MP",
        "department": "Sports & Youth Welfare Department, MP",
        "level": "state",
        "state": "MP",
        "description": (
            "For students with state/national level sports achievements. "
            "Must have participated in recognized state/national tournaments."
        ),
        "amount_description": "Variable (based on sport & level)",
        "max_amount": 25000.0,
        "eligibility_category": "All",
        "eligibility_gender": "All",
        "min_12th_percentage": None,
        "max_family_income": None,
        "requires_bpl": False,
        "requires_rural": False,
        "requires_urban": False,
        "is_for_mp_only": True,
        "min_board": None,
        "education_level": "all",
        "documents_required": json.dumps([
            "aadhaar", "sports_certificate", "marksheet_10", "marksheet_12",
            "domicile", "admission_letter", "bank_passbook", "passport_photo"
        ]),
        "application_url": "http://scholarshipportal.mp.nic.in/",
        "deadline": "Check portal",
        "is_active": True
    }
]

# Strip extra keys not in the model before inserting
MODEL_FIELDS = {
    "name", "short_name", "department", "level", "state", "description",
    "amount_description", "max_amount", "eligibility_category", "eligibility_gender",
    "min_12th_percentage", "max_family_income", "requires_bpl", "requires_rural",
    "requires_urban", "is_for_mp_only", "min_board", "education_level",
    "documents_required", "application_url", "deadline", "is_active"
}

async def seed_scholarships(db):
    result = await db.execute(select(ScholarshipScheme))
    existing = result.scalars().all()
    if not existing:
        for data in SCHEMES_DATA:
            clean_data = {k: v for k, v in data.items() if k in MODEL_FIELDS}
            scheme = ScholarshipScheme(**clean_data)
            db.add(scheme)
        await db.commit()
