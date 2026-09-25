import React, { useRef } from 'react';
import { Printer, ExternalLink, Shield } from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════════
   MMVY — Mukhyamantri Medhavi Vidyarthi Yojana
   Exact replica of medhavikalyan.mp.gov.in application form
   ═══════════════════════════════════════════════════════════════════ */
export const MMVYFormPreview = ({ data }) => {
  const printRef = useRef();
  const d = data || {};
  const handlePrint = () => printForm(printRef, 'MMVY Application', '#1a237e', '#e8f0fe');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <FormTopBar title="MMVY — medhavikalyan.mp.gov.in" color="indigo" onPrint={handlePrint}
        url="https://medhavikalyan.mp.gov.in/MMVY.aspx" />
      <div ref={printRef} className="p-6 text-sm">
        {/* Header */}
        <FormHeader
          hindiTitle="मुख्यमंत्री मेधावी विद्यार्थी योजना (MMVY)"
          englishTitle="Mukhyamantri Medhavi Vidyarthi Yojana"
          dept="तकनीकी शिक्षा एवं कौशल विकास विभाग / Technical Education & Skill Development Dept."
          portal="medhavikalyan.mp.gov.in"
          color="indigo"
        />
        <PhotoBox />

        {/* Section 1: Applicant Identification — exactly per medhavikalyan */}
        <Section title="खंड 1 — आवेदक पहचान / Applicant Identification" color="indigo" />
        <Table color="indigo" rows={[
          ['समग्र आईडी / Samagra ID (9-digit)', d.ask_samagra || '—', true],
          ['आवेदक का पूरा नाम / Applicant Full Name', d.ask_name || '—'],
          ['पिता/अभिभावक का नाम / Father/Guardian Name', d.ask_father_name || '—'],
          ['माता का नाम / Mother\'s Name', d.ask_mother_name || '—'],
          ['जन्म तिथि / Date of Birth', d.ask_dob || '—'],
          ['लिंग / Gender', d.ask_gender || '—'],
          ['वर्ग / Category', d.ask_category || '—'],
          ['धर्म / Religion', d.ask_religion || '—'],
          ['आधार संख्या / Aadhaar Number', maskAadhaar(d.ask_aadhaar)],
          ['पैन कार्ड / PAN Card', d.ask_pan || '—'],
          ['मोबाइल नंबर / Mobile Number', d.ask_mobile || '—'],
          ['ई-मेल / Email ID', d.ask_email || '—'],
        ]} />

        {/* Section 2: Address */}
        <Section title="खंड 2 — स्थायी पता / Permanent Address" color="indigo" />
        <Table color="indigo" rows={[
          ['राज्य / State', d.ask_state || 'Madhya Pradesh'],
          ['जिला / District', d.ask_district || '—'],
          ['पूरा पता / Complete Address', d.ask_address || '—'],
          ['पिन कोड / Pin Code', d.ask_pincode || '—'],
          ['ग्रामीण/शहरी / Rural/Urban', d.ask_rural_urban || '—'],
        ]} />

        {/* Section 3: Class 12 Academic Details — key MMVY section */}
        <Section title="खंड 3 — कक्षा 12 शैक्षणिक विवरण / Class 12 Academic Details" color="indigo" />
        <Table color="indigo" rows={[
          ['बोर्ड का नाम / Board Name', d.ask_12th_board || '—'],
          ['रोल नंबर / Roll Number', d.roll_number_12 || '(To be filled on portal)'],
          ['उत्तीर्ण वर्ष / Passing Year', d.ask_12th_year || '—'],
          ['प्राप्त प्रतिशत / Percentage Obtained', getMMVYMarksDisplay(d)],
          ['संकाय / Stream', d.ask_12th_stream || '—'],
          ['कक्षा 10 बोर्ड / Class 10 Board', d.ask_10th_board || '—'],
          ['कक्षा 10 प्रतिशत / Class 10 Percentage', pct(d.ask_10th_percentage)],
          ['कक्षा 10 वर्ष / Class 10 Year', d.ask_10th_year || '—'],
        ]} />

        {/* Section 4: Entrance Exam — per MMVY requirements */}
        <Section title="खंड 4 — प्रवेश परीक्षा विवरण / Entrance Exam Details" color="indigo" />
        <Table color="indigo" rows={[
          ['प्रवेश परीक्षा / Entrance Exam', getEntranceExam(d)],
          ['परीक्षा रोल / Exam Roll No.', '(To be filled on portal)'],
          ['रैंक / Rank', getEntranceRank(d)],
          ['उपलब्धियाँ / Achievements', getAchievementsText(d)],
        ]} />

        {/* Section 5: Course & Institution */}
        <Section title="खंड 5 — पाठ्यक्रम एवं संस्थान / Course & Institution Details" color="indigo" />
        <Table color="indigo" rows={[
          ['जिला (संस्थान) / District (Institute)', d.ask_district || '—'],
          ['संस्थान का नाम / Institute Name', d.ask_institution || '—'],
          ['संस्थान प्रकार / Institute Type', d.ask_institution_type || '—'],
          ['कॉलेज कोड / College Code', d.college_code || '(To be filled on portal)'],
          ['पाठ्यक्रम / Course Name', d.ask_current_course || '—'],
          ['शाखा / Branch Code', d.branch_code || '(To be filled on portal)'],
          ['प्रवेश तिथि / Date of Admission', d.admission_date || '(To be filled on portal)'],
          ['वर्तमान वर्ष/सेमेस्टर / Current Year/Semester', d.ask_current_year || '—'],
          ['पाठ्यक्रम अवधि / Course Duration', d.course_duration || '(To be filled on portal)'],
        ]} />

        {/* Section 6: Financial & Bank */}
        <Section title="खंड 6 — वित्तीय एवं बैंक विवरण / Financial & Bank Details" color="indigo" />
        <Table color="indigo" rows={[
          ['परिवार की वार्षिक आय / Annual Family Income', income(d.ask_income), true],
          ['आय प्रमाण पत्र विवरण / Income Certificate Details', 'Issued by competent authority'],
          ['बैंक का नाम / Bank Name', d.bank_name || '(To be filled on portal)'],
          ['शाखा / Branch', d.bank_branch || '(To be filled on portal)'],
          ['खाता संख्या / Account Number', d.ask_bank_account || '—'],
          ['IFSC कोड / IFSC Code', d.ask_ifsc || '—'],
          ['आधार से लिंक / Aadhaar Linked', '✅ हाँ / Yes (required for DBT)'],
        ]} />

        {/* Section 7: Documents — exact MMVY list */}
        <Section title="खंड 7 — अपलोड दस्तावेज़ / Uploaded Documents" color="indigo" />
        <DocsTable color="indigo" docs={[
          ['समग्र आईडी / Samagra ID', d.ask_samagra ? 'verified' : 'pending'],
          ['आधार कार्ड / Aadhaar Card', d.doc_aadhaar],
          ['पैन कार्ड / PAN Card', d.doc_pan],
          ['कक्षा 10 अंकसूची / Class 10 Marksheet', d.doc_marksheet_10],
          ['कक्षा 12 अंकसूची / Class 12 Marksheet', d.doc_marksheet_12],
          ['आय प्रमाण पत्र / Income Certificate', d.doc_income_cert],
          ['अधिवास प्रमाण पत्र / Domicile Certificate', d.doc_domicile],
          ['प्रवेश पत्र / Admission Letter', 'required'],
          ['शुल्क रसीद / Fee Receipt', 'required'],
          ['प्रवेश परीक्षा स्कोरकार्ड / Entrance Scorecard (JEE/NEET/CLAT)', hasEntrance(d) ? 'required' : 'n/a'],
          ['बैंक पासबुक / Bank Passbook', 'required'],
          ['पासपोर्ट फोटो / Passport Photo', 'required'],
        ]} />

        {/* Declaration — exact MMVY declaration */}
        <Declaration text={
          "मैं प्रमाणित करता/करती हूँ कि उपरोक्त सभी जानकारी सत्य और सही है। " +
          "मैं इस शैक्षणिक वर्ष में किसी अन्य शुल्क-प्रतिपूर्ति योजना का लाभ नहीं ले रहा/रही हूँ। " +
          "मैं समझता/समझती हूँ कि गलत जानकारी देने पर मेरा आवेदन निरस्त किया जा सकता है।\n\n" +
          "I certify that all information provided above is true and correct. I am not availing " +
          "any other fee-reimbursement scheme for this academic year. I understand that providing " +
          "false information may result in cancellation of my application and recovery of funds."
        } />
        <Footer portal="medhavikalyan.mp.gov.in" helpline="0755-2660063" />
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   MPTAAS — Post-Matric Scholarship for SC/ST
   Exact replica of tribal.mp.gov.in/MPTAAS form
   ═══════════════════════════════════════════════════════════════════ */
export const MPTAASFormPreview = ({ data }) => {
  const printRef = useRef();
  const d = data || {};
  const handlePrint = () => printForm(printRef, 'MPTAAS Application', '#166534', '#f0fdf4');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <FormTopBar title="MPTAAS — tribal.mp.gov.in" color="green" onPrint={handlePrint}
        url="https://www.tribal.mp.gov.in/MPTAAS" />
      <div ref={printRef} className="p-6 text-sm">
        <FormHeader
          hindiTitle="पोस्ट-मैट्रिक छात्रवृत्ति — अनुसूचित जनजाति / अनुसूचित जाति"
          englishTitle="Post-Matric Scholarship for SC/ST — MPTAAS"
          dept="आदिम जाति कल्याण विभाग / Tribal Affairs & SC Welfare Dept."
          portal="tribal.mp.gov.in/MPTAAS"
          color="green"
        />
        <PhotoBox />

        {/* Profile & e-KYC — unique to MPTAAS */}
        <Section title="प्रोफ़ाइल एवं e-KYC सत्यापन / Profile & e-KYC Verification" color="green" />
        <Table color="green" rows={[
          ['समग्र आईडी / Samagra ID', d.ask_samagra || '—', true],
          ['आधार e-KYC स्थिति / Aadhaar e-KYC Status', '✅ Verified'],
          ['NPCI मैपिंग स्थिति / NPCI Mapping Status', '✅ Bank account linked'],
          ['OTR नंबर / OTR Number', d.otr_number || '(Generated on portal)'],
          ['ABC ID', d.abc_id || '(Optional)'],
        ]} />

        {/* Personal/Family Details */}
        <Section title="व्यक्तिगत एवं पारिवारिक विवरण / Personal & Family Details" color="green" />
        <Table color="green" rows={[
          ['आवेदक का नाम / Applicant Name', d.ask_name || '—'],
          ['पिता का नाम / Father\'s Name', d.ask_father_name || '—'],
          ['माता का नाम / Mother\'s Name', d.ask_mother_name || '—'],
          ['जन्म तिथि / Date of Birth', d.ask_dob || '—'],
          ['लिंग / Gender', d.ask_gender || '—'],
          ['जाति श्रेणी / Caste Category', catBadge(d.ask_category, 'green')],
          ['धर्म / Religion', d.ask_religion || '—'],
          ['विकलांगता / Disability', d.ask_disability || 'No'],
          ['मोबाइल / Mobile', d.ask_mobile || '—'],
          ['ई-मेल / Email', d.ask_email || '—'],
        ]} />

        {/* Address */}
        <Section title="पता विवरण / Address Details" color="green" />
        <Table color="green" rows={[
          ['राज्य / State', 'Madhya Pradesh'],
          ['जिला / District', d.ask_district || '—'],
          ['पूरा पता / Full Address', d.ask_address || '—'],
          ['पिन कोड / Pincode', d.ask_pincode || '—'],
        ]} />

        {/* Academic Details — MPTAAS specific */}
        <Section title="शैक्षणिक विवरण / Academic Details" color="green" />
        <Table color="green" rows={[
          ['संस्थान का नाम / Institution Name', d.ask_institution || '—'],
          ['संस्थान प्रकार / Institute Type', d.ask_institution_type || '—'],
          ['कॉलेज कोड / College Code', d.college_code || '(Search on portal)'],
          ['पाठ्यक्रम / Course', d.ask_current_course || '—'],
          ['शाखा/संकाय / Branch/Stream', d.ask_12th_stream || '—'],
          ['वर्ष/सेमेस्टर / Year/Semester', d.ask_current_year || '—'],
          ['छात्रावासी/दैनिक / Hosteller/Day Scholar', d.hosteller_status || '(Select on portal)', true],
          ['पिछली परीक्षा अंक / Previous Exam Marks', pct(d.ask_12th_percentage)],
        ]} />

        {/* Income & Bank — with NPCI requirement */}
        <Section title="आय एवं बैंक विवरण / Income & Banking Details" color="green" />
        <Table color="green" rows={[
          ['वार्षिक पारिवारिक आय / Annual Family Income', income(d.ask_income), true],
          ['आय सीमा / Income Limit', '₹6,00,000 (अधिकतम / Maximum)'],
          ['बैंक खाता संख्या / Bank Account No.', d.ask_bank_account || '—'],
          ['IFSC कोड / IFSC Code', d.ask_ifsc || '—'],
          ['आधार लिंक / Aadhaar-linked', '✅ हाँ / Yes'],
          ['NPCI मैपिंग / NPCI Mapped', '✅ Required for DBT'],
        ]} />

        {/* Documents — exact MPTAAS list */}
        <Section title="दस्तावेज़ अपलोड / Document Upload" color="green" />
        <DocsTable color="green" docs={[
          ['आधार कार्ड + e-KYC / Aadhaar + e-KYC', d.doc_aadhaar],
          ['जाति प्रमाण पत्र / Caste Certificate (SC/ST)', d.doc_caste_cert],
          ['अधिवास प्रमाण पत्र / Domicile Certificate', d.doc_domicile],
          ['आय प्रमाण पत्र / Income Certificate', d.doc_income_cert],
          ['पिछली अंकसूची / Previous Marksheet', d.doc_marksheet_12 || d.doc_marksheet_10],
          ['प्रवेश पत्र / Admission Letter', 'required'],
          ['शुल्क रसीद / Fee Receipt', 'required'],
          ['बोनाफाइड प्रमाण पत्र / Bonafide Certificate', 'required'],
          ['स्थानांतरण प्रमाणपत्र / Transfer Certificate (TC)', 'optional'],
          ['विकलांगता प्रमाणपत्र / Disability Certificate', d.ask_disability === 'Yes' ? 'required' : 'n/a'],
          ['बैंक पासबुक / Bank Passbook (Aadhaar-linked)', 'required'],
          ['पासपोर्ट फोटो / Passport Photo', 'required'],
        ]} />

        <Declaration text={
          "मैं घोषणा करता/करती हूँ कि मैं अनुसूचित जनजाति / अनुसूचित जाति वर्ग से संबंधित हूँ " +
          "और ऊपर दिए गए सभी विवरण सत्य हैं। मैं किसी अन्य छात्रवृत्ति योजना का लाभ नहीं ले रहा/रही हूँ।\n\n" +
          "I declare that I belong to the SC/ST category and all details provided above are true and correct. " +
          "I am not availing benefits from any other scholarship scheme simultaneously."
        } />
        <Footer portal="tribal.mp.gov.in/MPTAAS" helpline="1800 2333 951 | helpdesk.tribal@mp.gov.in" />
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   MP Scholarship Portal 2.0 — Gaon Ki Beti / Pratibha Kiran / Vikramaditya / OBC
   Exact replica of scholarshipportal.mp.nic.in
   ═══════════════════════════════════════════════════════════════════ */
export const MPScholarshipPortalForm = ({ data, schemeName }) => {
  const printRef = useRef();
  const d = data || {};
  const sn = schemeName || 'MP Scholarship';
  const isGKB = sn.toLowerCase().includes('gaon');
  const isPK = sn.toLowerCase().includes('pratibha');
  const isVik = sn.toLowerCase().includes('vikramaditya');
  const isOBC = sn.toLowerCase().includes('obc');

  const hindiName = isGKB ? 'गाँव की बेटी योजना' : isPK ? 'प्रतिभा किरण छात्रवृत्ति' :
    isVik ? 'विक्रमादित्य योजना' : isOBC ? 'OBC पोस्ट-मैट्रिक छात्रवृत्ति' : sn;

  const handlePrint = () => printForm(printRef, `${sn} Application`, '#92400e', '#fef3c7');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <FormTopBar title={`${sn} — scholarshipportal.mp.nic.in`} color="amber" onPrint={handlePrint}
        url="https://scholarshipportal.mp.nic.in/" />
      <div ref={printRef} className="p-6 text-sm">
        <FormHeader
          hindiTitle={hindiName}
          englishTitle={sn}
          dept="उच्च शिक्षा विभाग / Higher Education Department"
          portal="MP Scholarship Portal 2.0 — scholarshipportal.mp.nic.in"
          color="amber"
        />
        <PhotoBox />

        {/* Personal Details */}
        <Section title="व्यक्तिगत विवरण / Personal Details" color="amber" />
        <Table color="amber" rows={[
          ['समग्र आईडी / Samagra ID', d.ask_samagra || '—', true],
          ['आवेदक का नाम / Applicant Name', d.ask_name || '—'],
          ['पिता का नाम / Father\'s Name', d.ask_father_name || '—'],
          ['माता का नाम / Mother\'s Name', d.ask_mother_name || '—'],
          ['जन्म तिथि / Date of Birth', d.ask_dob || '—'],
          ['लिंग / Gender', d.ask_gender || '—'],
          ['वर्ग / Category', d.ask_category || '—'],
          ['मोबाइल / Mobile', d.ask_mobile || '—'],
          ['ई-मेल / Email', d.ask_email || '—'],
        ]} />

        {/* Residential Details — critical for GKB vs PK */}
        <Section title="निवास विवरण / Residential Details" color="amber" />
        <Table color="amber" rows={[
          ['राज्य / State', 'Madhya Pradesh'],
          ['जिला / District', d.ask_district || '—'],
          ['क्षेत्र प्रकार / Area Type', areaDisplay(d, isGKB, isPK)],
          ['पूरा पता / Full Address', d.ask_address || '—'],
          ['पिन कोड / Pincode', d.ask_pincode || '—'],
        ]} />

        {/* Academic Details */}
        <Section title="शैक्षणिक विवरण / Academic Details" color="amber" />
        <Table color="amber" rows={[
          ['12वीं बोर्ड / 12th Board', d.ask_12th_board || '—'],
          ['12वीं रोल नं / 12th Roll No.', d.roll_number_12 || '(To be filled)'],
          ['12वीं प्रतिशत / 12th Percentage', marksDisplay60(d.ask_12th_percentage)],
          ['12वीं वर्ष / 12th Year', d.ask_12th_year || '—'],
          ['10वीं प्रतिशत / 10th Percentage', pct(d.ask_10th_percentage)],
          ['कॉलेज का नाम / College Name', d.ask_institution || '—'],
          ['कॉलेज कोड / College Code', d.college_code || '(Verify with college)', true],
          ['पाठ्यक्रम / Course', d.ask_current_course || '—'],
          ['शाखा कोड / Branch Code', d.branch_code || '(Verify with college)', true],
          ['वर्तमान वर्ष / Current Year', d.ask_current_year || '—'],
        ]} />

        {/* Income & Category */}
        <Section title="आय एवं श्रेणी विवरण / Income & Category Details" color="amber" />
        <Table color="amber" rows={[
          ['वार्षिक पारिवारिक आय / Annual Income', income(d.ask_income)],
          ...(isVik ? [['आय सीमा / Income Limit', '₹54,000 (graduation) / ₹1,20,000 (higher ed.)', true]] : []),
          ...(isPK ? [['BPL प्रमाणपत्र / BPL Certificate', bplDisplay(d.ask_bpl), true]] : []),
          ...(isGKB ? [['गाँव की बेटी प्रमाणपत्र', 'Required from village panchayat', true]] : []),
          ['जाति प्रमाण पत्र / Caste Certificate', d.ask_category !== 'General' ? 'Required' : 'N/A (General)'],
        ]} />

        {/* Bank */}
        <Section title="बैंक विवरण / Bank Details (for DBT)" color="amber" />
        <Table color="amber" rows={[
          ['बैंक खाता / Bank Account', d.ask_bank_account || '—'],
          ['IFSC कोड / IFSC Code', d.ask_ifsc || '—'],
          ['आधार लिंक / Aadhaar Linked', '✅ Required for Direct Benefit Transfer'],
        ]} />

        {/* Documents — exact per scheme */}
        <Section title="दस्तावेज़ अपलोड / Document Upload" color="amber" />
        <DocsTable color="amber" docs={[
          ['आधार कार्ड / Aadhaar Card', d.doc_aadhaar],
          ['कक्षा 10 अंकसूची / Class 10 Marksheet', d.doc_marksheet_10],
          ['कक्षा 12 अंकसूची / Class 12 Marksheet', d.doc_marksheet_12],
          ['आय प्रमाण पत्र / Income Certificate', d.doc_income_cert],
          ['अधिवास प्रमाण पत्र / Domicile Certificate', d.doc_domicile],
          ...(isGKB ? [['गाँव की बेटी प्रमाणपत्र / Gaon Ki Beti Certificate', 'required']] : []),
          ...(isPK ? [['BPL प्रमाणपत्र / BPL Certificate', d.ask_bpl === 'Yes' ? 'verified' : 'required']] : []),
          ...(d.ask_category !== 'General' ? [['जाति प्रमाण पत्र / Caste Certificate', d.doc_caste_cert]] : []),
          ['प्रवेश पत्र/शुल्क रसीद / Admission Letter/Fee Receipt', 'required'],
          ['बैंक पासबुक / Bank Passbook', 'required'],
          ['पासपोर्ट फोटो / Passport Photo', 'required'],
        ]} />

        <Declaration text={
          `मैं प्रमाणित करता/करती हूँ कि ऊपर दी गई सभी जानकारी सत्य है। ` +
          `मैं समझता/समझती हूँ कि गलत जानकारी पर मेरा आवेदन निरस्त हो सकता है।\n\n` +
          `I certify all details are true. Incorrect information will lead to cancellation. ` +
          `Note: Get your application verified by your college nodal officer after submission.`
        } />
        <Footer portal="scholarshipportal.mp.nic.in" helpline="Check portal for helpline" />
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   Central Scheme — NSP / CSSS / INSPIRE / NTSE / PMSS / IIT
   ═══════════════════════════════════════════════════════════════════ */
export const CentralSchemeForm = ({ data, schemeName }) => {
  const printRef = useRef();
  const d = data || {};
  const handlePrint = () => printForm(printRef, `${schemeName}`, '#1e3a5f', '#e0f2fe');

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <FormTopBar title={`${schemeName} — Central Scheme`} color="blue" onPrint={handlePrint}
        url="https://scholarships.gov.in/" />
      <div ref={printRef} className="p-6 text-sm">
        <FormHeader hindiTitle="" englishTitle={schemeName}
          dept="Government of India" portal="scholarships.gov.in" color="blue" />
        <PhotoBox />

        <Section title="Personal Details" color="blue" />
        <Table color="blue" rows={[
          ['Full Name', d.ask_name || '—'],
          ['Father\'s Name', d.ask_father_name || '—'],
          ['Date of Birth', d.ask_dob || '—'],
          ['Gender', d.ask_gender || '—'],
          ['Category', d.ask_category || '—'],
          ['Aadhaar Number', maskAadhaar(d.ask_aadhaar)],
          ['Mobile', d.ask_mobile || '—'],
          ['Email', d.ask_email || '—'],
          ['State', d.ask_state || '—'],
          ['District', d.ask_district || '—'],
          ['Address', d.ask_address || '—'],
          ['Pincode', d.ask_pincode || '—'],
        ]} />

        <Section title="Academic Details" color="blue" />
        <Table color="blue" rows={[
          ['12th Board', d.ask_12th_board || '—'],
          ['12th Percentage', pct(d.ask_12th_percentage)],
          ['12th Year', d.ask_12th_year || '—'],
          ['10th Percentage', pct(d.ask_10th_percentage)],
          ['Institution', d.ask_institution || '—'],
          ['Course', d.ask_current_course || '—'],
          ['Year of Study', d.ask_current_year || '—'],
        ]} />

        <Section title="Financial Details" color="blue" />
        <Table color="blue" rows={[
          ['Annual Family Income', income(d.ask_income)],
          ['Bank Account', d.ask_bank_account || '—'],
          ['IFSC Code', d.ask_ifsc || '—'],
        ]} />

        {d.achievements && d.achievements.length > 0 && (<>
          <Section title="Competitive Exam Achievements" color="blue" />
          <Table color="blue" rows={d.achievements.map((a, i) => [`Achievement ${i+1}`, `${a.name} (${a.year})`])} />
        </>)}

        <Footer portal="scholarships.gov.in" helpline="NSP Helpline: 0120-6619540" />
      </div>
    </div>
  );
};


/* ═══════════════════════════════════════════════════════════════════
   FORM SELECTOR — picks the right form template
   ═══════════════════════════════════════════════════════════════════ */
export const ScholarshipFormPreview = ({ schemeName, shortName, data }) => {
  const sn = (shortName || '').toUpperCase();
  const name = (schemeName || '').toLowerCase();

  if (sn === 'MMVY') return <MMVYFormPreview data={data} />;
  if (sn === 'MPTAAS' || sn.includes('MPTAAS')) return <MPTAASFormPreview data={data} />;
  if (name.includes('gaon ki beti')) return <MPScholarshipPortalForm data={data} schemeName="Gaon Ki Beti Yojana" />;
  if (name.includes('pratibha kiran')) return <MPScholarshipPortalForm data={data} schemeName="Pratibha Kiran Scholarship" />;
  if (name.includes('vikramaditya')) return <MPScholarshipPortalForm data={data} schemeName="Vikramaditya Yojana" />;
  if (sn === 'MMJKY') return <MPScholarshipPortalForm data={data} schemeName="Mukhyamantri Jan Kalyan Yojana (Sambal)" />;
  if (sn === 'OBC POST-MATRIC') return <MPScholarshipPortalForm data={data} schemeName="Post-Matric Scholarship for OBC" />;
  return <CentralSchemeForm data={data} schemeName={schemeName || 'Scholarship'} />;
};

export default ScholarshipFormPreview;


/* ═══════════════════════════════════════════════════════════════════
   SHARED HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

const colorMap = {
  indigo: { bg: 'bg-indigo-900', light: 'bg-indigo-50', grad: 'from-indigo-900 to-indigo-700' },
  green:  { bg: 'bg-green-900',  light: 'bg-green-50',  grad: 'from-green-900 to-green-700'  },
  amber:  { bg: 'bg-amber-800',  light: 'bg-amber-50',  grad: 'from-amber-800 to-amber-600'  },
  blue:   { bg: 'bg-blue-900',   light: 'bg-blue-50',   grad: 'from-blue-900 to-blue-700'    },
};

function FormTopBar({ title, color, onPrint, url }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <div className={`bg-gradient-to-r ${c.grad} px-6 py-3 flex items-center justify-between`}>
      <div className="flex items-center gap-2 text-white">
        <Shield className="w-5 h-5" /><span className="font-semibold text-sm">{title}</span>
      </div>
      <div className="flex gap-2">
        <button onClick={onPrint} className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded transition">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
        {url && <a href={url} target="_blank" rel="noreferrer" className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1.5 rounded transition">
          <ExternalLink className="w-3.5 h-3.5" /> Official Portal
        </a>}
      </div>
    </div>
  );
}

function FormHeader({ hindiTitle, englishTitle, dept, portal, color }) {
  const borderColor = { indigo: 'border-indigo-900', green: 'border-green-800', amber: 'border-amber-800', blue: 'border-blue-900' };
  const textColor = { indigo: 'text-indigo-900', green: 'text-green-900', amber: 'text-amber-900', blue: 'text-blue-900' };
  const subColor = { indigo: 'text-indigo-800', green: 'text-green-800', amber: 'text-amber-800', blue: 'text-blue-800' };
  return (
    <div className={`text-center border-b-4 ${borderColor[color]} pb-4 mb-6`}>
      <p className="text-xs text-gray-500 tracking-wider">मध्यप्रदेश शासन / Government of Madhya Pradesh</p>
      {hindiTitle && <h2 className={`text-lg font-bold ${textColor[color]} mt-1`}>{hindiTitle}</h2>}
      <h3 className={`text-base font-semibold ${subColor[color]}`}>{englishTitle}</h3>
      <p className="text-xs text-gray-500 mt-1">{dept}</p>
      <p className="text-xs text-gray-400 mt-1">{portal}</p>
    </div>
  );
}

function PhotoBox() {
  return <div className="float-right border-2 border-dashed border-gray-400 w-24 h-28 flex items-center justify-center text-xs text-gray-400 ml-4 mb-4 text-center">Passport<br/>Photo</div>;
}

function Section({ title, color }) {
  const c = colorMap[color] || colorMap.indigo;
  return <div className={`mb-2 ${c.bg} text-white px-3 py-1.5 text-xs font-semibold rounded-t clear-both`}>{title}</div>;
}

function Table({ color, rows }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
      <tbody>
        {rows.map((row, i) => (
          <tr key={i}>
            <th className={`border border-gray-300 ${c.light} px-3 py-2 text-left font-semibold w-[38%]`}>{row[0]}</th>
            <td className={`border border-gray-300 px-3 py-2 ${row[2] ? 'font-medium' : ''}`}>{row[1]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DocsTable({ color, docs }) {
  const c = colorMap[color] || colorMap.indigo;
  return (
    <table className="w-full border-collapse border border-gray-300 text-xs mb-4">
      <thead><tr><th className={`border border-gray-300 ${c.light} px-3 py-2 text-left w-[50%]`}>Document</th><th className={`border border-gray-300 ${c.light} px-3 py-2 text-left`}>Status</th></tr></thead>
      <tbody>
        {docs.map(([label, status], i) => {
          const s = status || 'pending';
          return (
            <tr key={i}>
              <td className={`border border-gray-300 ${c.light} px-3 py-2 font-medium`}>{label}</td>
              <td className="border border-gray-300 px-3 py-2">
                {(s === 'verified' || s === 'uploaded' || s === 'Uploaded') && <span className="text-green-600">✅ Uploaded & Verified</span>}
                {s === 'manual_review' && <span className="text-yellow-600">⏳ Manual Review Pending</span>}
                {s === 'required' && <span className="text-orange-500">📋 Required — upload on official portal</span>}
                {s === 'optional' && <span className="text-gray-400">ℹ️ Optional</span>}
                {s === 'n/a' && <span className="text-gray-300">— Not applicable</span>}
                {!['verified','uploaded','Uploaded','manual_review','required','optional','n/a'].includes(s) && <span className="text-gray-400">⬜ Pending</span>}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function Declaration({ text }) {
  return (
    <div className="border border-gray-300 p-4 rounded mt-4 bg-yellow-50">
      <h4 className="font-semibold text-xs mb-2">घोषणा / Declaration</h4>
      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{text}</p>
      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <div>दिनांक / Date: {new Date().toLocaleDateString('en-IN')}</div>
        <div className="border-t border-gray-400 w-40 text-center pt-1">आवेदक के हस्ताक्षर / Signature</div>
      </div>
    </div>
  );
}

function Footer({ portal, helpline }) {
  return (
    <div className="text-center mt-4 text-xs text-gray-400 border-t pt-3">
      <p>Generated by <strong>ScholarSetu</strong> — AI-powered Scholarship Assistant</p>
      <p>Official Portal: {portal} | {helpline}</p>
    </div>
  );
}


/* ═══════════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════════ */
function maskAadhaar(val) {
  if (!val) return '—';
  const s = String(val).replace(/\s/g, '');
  return s.length >= 12 ? `XXXX XXXX ${s.slice(-4)}` : val;
}

function pct(val) {
  if (!val) return '—';
  return `${val}%`;
}

function income(val) {
  if (!val) return '—';
  try { return `₹ ${Number(val).toLocaleString('en-IN')}`; } catch { return `₹ ${val}`; }
}

function catBadge(cat, color) {
  if (!cat) return '—';
  const cls = cat === 'ST' ? 'bg-green-100 text-green-800' : cat === 'SC' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  return <span className={`inline-block ${cls} rounded px-2 py-0.5 font-bold text-xs`}>{cat}</span>;
}

function bplDisplay(val) {
  if (!val) return '—';
  return val.toLowerCase() === 'yes'
    ? <span className="text-green-700 font-bold">✅ Yes — BPL Card Holder</span>
    : <span className="text-red-600 font-bold">❌ No — Required for Pratibha Kiran</span>;
}

function areaDisplay(d, isGKB, isPK) {
  const v = d.ask_rural_urban || '—';
  if (isGKB) return <span className={v.toLowerCase() === 'rural' ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
    {v} {v.toLowerCase() === 'rural' ? '✅ (Required: Rural)' : '❌ (Must be Rural for Gaon Ki Beti)'}
  </span>;
  if (isPK) return <span className={v.toLowerCase() === 'urban' ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
    {v} {v.toLowerCase() === 'urban' ? '✅ (Required: Urban)' : '❌ (Must be Urban for Pratibha Kiran)'}
  </span>;
  return v;
}

function marksDisplay60(val) {
  if (!val) return '—';
  const n = Number(val);
  return <span className={n >= 60 ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
    {val}% {n >= 60 ? '✅ Eligible (≥60%)' : '❌ Min 60% required'}
  </span>;
}

function getMMVYMarksDisplay(d) {
  if (!d.ask_12th_percentage) return '—';
  const pct = Number(d.ask_12th_percentage);
  const board = (d.ask_12th_board || '').toLowerCase();
  const isCBSE = board.includes('cbse') || board.includes('icse');
  const required = isCBSE ? 85 : 70;
  const eligible = pct >= required;
  return <span className={eligible ? 'text-green-700 font-bold' : 'text-red-600 font-bold'}>
    {d.ask_12th_percentage}% {eligible ? `✅ Eligible (${isCBSE ? 'CBSE/ICSE' : 'MP Board'} ≥${required}%)` : `❌ Need ${required}%+ for ${isCBSE ? 'CBSE/ICSE' : 'MP Board'}`}
  </span>;
}

function getEntranceExam(d) {
  if (!d.achievements || d.achievements.length === 0) return '—';
  const exams = ['JEE Main', 'JEE Advanced', 'NEET', 'CLAT'];
  const found = d.achievements.filter(a => exams.some(e => a.name.toUpperCase().includes(e.toUpperCase())));
  return found.length > 0 ? found.map(a => a.name).join(', ') : '—';
}

function getEntranceRank(d) {
  if (!d.achievements) return '—';
  const found = d.achievements.find(a => ['JEE', 'NEET', 'CLAT'].some(e => a.name.toUpperCase().includes(e)));
  return found ? found.detail || found.year : '(To be filled)';
}

function hasEntrance(d) {
  if (!d.achievements) return false;
  return d.achievements.some(a => ['JEE', 'NEET', 'CLAT'].some(e => a.name.toUpperCase().includes(e)));
}

function getAchievementsText(d) {
  if (!d.achievements || d.achievements.length === 0) return 'None';
  return d.achievements.map(a => `${a.name} (${a.year})`).join(', ');
}

function printForm(ref, title, headerColor, thBg) {
  const content = ref.current;
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>${title}</title>
    <style>
      body { font-family: 'Noto Sans', Arial, sans-serif; padding: 20px; color: #222; font-size: 13px; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
      td, th { border: 1px solid #555; padding: 7px 10px; text-align: left; font-size: 12px; }
      th { background: ${thBg}; font-weight: 600; width: 38%; }
      h2, h3 { margin: 8px 0; }
      .font-bold { font-weight: 700; }
      .text-green-700, .text-green-600 { color: #15803d; }
      .text-red-600 { color: #dc2626; }
      .text-yellow-600 { color: #ca8a04; }
      .text-orange-500 { color: #f97316; }
      .text-gray-400, .text-gray-300 { color: #9ca3af; }
      @media print { body { padding: 0; } }
    </style></head><body>${content.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}
