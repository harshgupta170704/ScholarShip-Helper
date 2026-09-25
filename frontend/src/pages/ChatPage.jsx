import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, RotateCcw, FileText } from 'lucide-react';
import ChatBubble from '../components/ChatBubble';
import QuickReply from '../components/QuickReply';
import ProgressSidebar from '../components/ProgressSidebar';
import DocumentUpload from '../components/DocumentUpload';
import { ScholarshipFormPreview } from '../components/FormPreview';
import api from '../api';

const PERSONAL_FIELDS = [
  'ask_name','ask_father_name','ask_mother_name','ask_dob','ask_gender',
  'ask_category','ask_religion','ask_mobile','ask_email','ask_pan','ask_aadhaar',
  'ask_state','ask_samagra','ask_district','ask_address','ask_pincode'
];
const EDUCATION_FIELDS = [
  'ask_income','ask_bpl','ask_disability',
  'ask_10th_board','ask_10th_percentage','ask_10th_year',
  'ask_12th_board','ask_12th_percentage','ask_12th_year','ask_12th_stream',
  'ask_current_course','ask_current_year','ask_institution','ask_institution_type',
  'ask_rural_urban','ask_bank_account','ask_ifsc'
];
const DOC_FIELDS = [
  'doc_aadhaar','doc_pan','doc_marksheet_10','doc_marksheet_12',
  'doc_income_cert','doc_caste_cert','doc_domicile'
];

function buildProfileData(collected) {
  if (!collected) return { personal: { completed: false, fields: [] }, education: { completed: false, fields: [] }, documents: { completed: false, fields: [] } };
  const pFields = PERSONAL_FIELDS.filter(f => collected[f]);
  const eFields = EDUCATION_FIELDS.filter(f => collected[f]);
  const dFields = DOC_FIELDS.filter(f => collected[f]);
  return {
    personal: { completed: pFields.length >= 10, fields: pFields.map(f => ({ name: f.replace('ask_',''), value: collected[f] })) },
    education: { completed: eFields.length >= 10, fields: eFields.map(f => ({ name: f.replace('ask_',''), value: collected[f] })) },
    documents: { completed: dFields.length >= 3, fields: dFields.map(f => ({ name: f.replace('doc_',''), value: collected[f] })) },
  };
}

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [collectedData, setCollectedData] = useState({});
  const [progress, setProgress] = useState(0);
  const [showFormPreview, setShowFormPreview] = useState(null); // { schemeName, shortName }
  const [scholarshipsData, setScholarshipsData] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, showUpload, showFormPreview]);

  // Initialize chat session
  useEffect(() => {
    const initChat = async () => {
      try {
        setIsTyping(true);
        const res = await api.startChat();
        setSessionId(res.session_id);
        if (res.progress) setProgress(res.progress);
        setMessages([{
          id: Date.now(), type: 'bot',
          content: res.message || "🙏 Namaste! I'm ScholarSetu. Let's find you the best scholarships!",
          options: res.options,
          timestamp: new Date().toISOString()
        }]);
        setIsTyping(false);
      } catch (err) {
        console.error('Init error', err);
        setIsTyping(false);
        setMessages([{
          id: Date.now(), type: 'bot',
          content: "⚠️ Cannot connect to the server. Please make sure the backend is running on port 8000.",
          timestamp: new Date().toISOString()
        }]);
      }
    };
    initChat();
  }, []);

  const handleSendMessage = async (text, file = null) => {
    if (!text?.trim() && !file) return;
    if (!sessionId) return;

    // Add user message to chat
    const newMessages = [...messages];
    if (text?.trim()) {
      newMessages.push({
        id: Date.now(), type: 'user', content: text,
        timestamp: new Date().toISOString()
      });
    }
    if (file) {
      newMessages.push({
        id: Date.now() + 1, type: 'user', content: `📎 Uploaded: ${file.name}`,
        timestamp: new Date().toISOString()
      });
    }
    setMessages(newMessages);
    setInputValue('');
    setIsTyping(true);
    setShowUpload(false);

    try {
      const res = await api.sendMessage(sessionId, text || 'uploaded', file);
      setIsTyping(false);

      // Update collected data & progress
      if (res.collected_data) setCollectedData(res.collected_data);
      if (res.progress != null) setProgress(res.progress);

      // Save scholarships if present
      if (res.scholarships) setScholarshipsData(res.scholarships);

      // Add bot response
      setMessages(prev => [...prev, {
        id: Date.now() + 2, type: 'bot',
        content: res.message,
        options: res.options,
        requiresFile: res.requires_file,
        scholarships: res.scholarships,
        timestamp: new Date().toISOString()
      }]);

      // Show document upload zone if needed
      if (res.requires_file) setShowUpload(true);
    } catch (err) {
      console.error('Send error', err);
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 2, type: 'bot',
        content: "❌ Something went wrong. Please try again.",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleQuickReply = (option) => handleSendMessage(option);

  const handleFileUpload = (file) => handleSendMessage(null, file);

  const handleResetChat = async () => {
    if (!sessionId) return;
    try {
      setIsTyping(true);
      const res = await api.resetSession(sessionId);
      setCollectedData({});
      setProgress(0);
      setScholarshipsData(null);
      setShowFormPreview(null);
      setShowUpload(false);
      setMessages([{
        id: Date.now(), type: 'bot',
        content: res.message,
        options: res.options,
        timestamp: new Date().toISOString()
      }]);
      setIsTyping(false);
    } catch (err) {
      console.error('Reset error', err);
      setIsTyping(false);
    }
  };

  const profileData = buildProfileData(collectedData);
  const lastBotMsg = messages.filter(m => m.type === 'bot').pop();

  return (
    <div className="flex flex-1 h-[calc(100vh-64px)] overflow-hidden bg-gray-100">
      {/* Sidebar */}
      <ProgressSidebar
        profileData={profileData}
        progress={progress}
        name={collectedData.ask_name}
      />

      <div className="flex-1 flex flex-col relative bg-[#E5DDD5]">
        {/* Chat Header */}
        <div className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm z-10">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-indigo-600 font-bold text-xl">S</span>
            </div>
            <div>
              <h2 className="font-semibold text-gray-800">ScholarSetu Assistant</h2>
              <p className="text-xs text-green-500 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                Online {progress > 0 && `• ${Math.round(progress)}% complete`}
              </p>
            </div>
          </div>
          <button onClick={handleResetChat} title="Reset Chat"
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {messages.map((msg, idx) => (
            <React.Fragment key={msg.id}>
              <ChatBubble message={msg} />

              {/* Quick reply buttons for the last bot message */}
              {idx === messages.length - 1 && msg.type === 'bot' && msg.options && (
                <QuickReply options={msg.options} onSelect={handleQuickReply} />
              )}

              {/* Scholarship cards with "View Form" buttons */}
              {msg.scholarships && msg.scholarships.length > 0 && (
                <div className="mb-4 space-y-2 max-w-lg">
                  {msg.scholarships.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm border p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-800 text-sm">{s.name}</h4>
                          <p className="text-xs text-gray-500">{s.department}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${
                          s.match_score >= 80 ? 'bg-green-100 text-green-700' :
                          s.match_score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {s.match_score}% match
                        </span>
                      </div>
                      <p className="text-sm text-indigo-600 font-semibold mt-1">{s.amount}</p>
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setShowFormPreview({ schemeName: s.name, shortName: s.short_name })}
                          className="flex items-center gap-1 text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition font-medium"
                        >
                          <FileText className="w-3.5 h-3.5" /> View Filled Form
                        </button>
                        <a href={s.application_url} target="_blank" rel="noreferrer"
                          className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-100 transition font-medium">
                          Apply on Portal →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex space-x-1 items-center h-10">
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full typing-dot"></div>
              </div>
            </div>
          )}

          {/* Document upload zone */}
          {showUpload && !isTyping && (
            <div className="mb-4 max-w-lg">
              <DocumentUpload onUpload={handleFileUpload} />
            </div>
          )}

          {/* Form Preview Modal */}
          {showFormPreview && (
            <div className="mb-4 max-w-2xl">
              <div className="flex justify-end mb-2">
                <button onClick={() => setShowFormPreview(null)}
                  className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 px-3 py-1 rounded transition">
                  ✕ Close Form Preview
                </button>
              </div>
              <ScholarshipFormPreview
                schemeName={showFormPreview.schemeName}
                shortName={showFormPreview.shortName}
                data={collectedData}
              />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-gray-100 p-4 border-t shadow-lg z-10 w-full">
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(inputValue); }}
            className="flex items-end max-w-4xl mx-auto space-x-2"
          >
            <button type="button"
              className="p-3 text-gray-500 hover:text-indigo-600 transition-colors bg-white rounded-full shadow-sm"
              onClick={() => setShowUpload(!showUpload)}>
              <Paperclip className="w-5 h-5" />
            </button>
            <div className="flex-1 bg-white rounded-2xl shadow-sm overflow-hidden flex">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                className="w-full p-3 resize-none outline-none max-h-32"
                rows={1}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(inputValue);
                  }
                }}
              />
            </div>
            <button type="submit" disabled={!inputValue.trim()}
              className="p-3 bg-indigo-600 text-white rounded-full shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
