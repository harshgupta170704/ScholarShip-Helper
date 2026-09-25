import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, FileText, CheckCircle, AlertCircle, Lightbulb, Volume2, Languages } from 'lucide-react';
import ScholarshipCard from './ScholarshipCard';

const ChatBubble = ({ message, onTranslate }) => {
  const isBot = message.type === 'bot';
  const isProTip = message.isProTip;

  const handleTTS = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(message.content);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className={`flex w-full mb-4 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center mr-2 flex-shrink-0 mt-1">
          {isProTip ? <Lightbulb className="w-5 h-5 text-yellow-500" /> : <Bot className="w-5 h-5 text-indigo-600" />}
        </div>
      )}
      
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-3 shadow-sm
          ${isBot 
            ? isProTip ? 'bg-yellow-50 text-yellow-900 border border-yellow-200 rounded-tl-sm' : 'bg-white text-gray-800 rounded-tl-sm border border-gray-100' 
            : 'bg-[#DCF8C6] text-gray-800 rounded-tr-sm'
          }`}
      >
        {isProTip && (
          <div className="flex items-center font-bold text-yellow-700 mb-1">
            <Lightbulb className="w-4 h-4 mr-1" /> Pro Tip
          </div>
        )}
        <div className="markdown-body text-sm md:text-base break-words">
          {isBot ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>
        
        {/* Render OCR status or extracted data if available */}
        {message.documentStatus && (
          <div className="mt-3 bg-gray-50 p-3 rounded-lg border text-sm">
            <div className="flex items-center mb-2">
              {message.documentStatus.success ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="font-semibold">
                {message.documentStatus.success ? 'Document Verified' : 'Verification Issue'}
              </span>
            </div>
            {message.documentStatus.extractedData && (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {Object.entries(message.documentStatus.extractedData).map(([key, value]) => (
                  <div key={key} className="flex flex-col">
                    <span className="text-xs text-gray-500 capitalize">{key.replace('_', ' ')}</span>
                    <span className="font-medium text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            )}
            {message.documentStatus.mismatches && (
              <div className="mt-2 text-red-600 text-xs">
                Mismatches found: {message.documentStatus.mismatches.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Render Scholarship Cards if recommended */}
        {message.scholarships && message.scholarships.length > 0 && (
          <div className="mt-4 flex flex-col gap-3">
            {message.scholarships.map(scholarship => (
              <ScholarshipCard key={scholarship.id} scholarship={scholarship} compact={true} />
            ))}
          </div>
        )}

        <div className={`text-[10px] mt-2 flex items-center justify-between ${isBot ? 'text-gray-500' : 'text-green-700/70'}`}>
          {isBot ? (
            <div className="flex items-center space-x-3">
              <button onClick={handleTTS} className="hover:text-indigo-600 flex items-center transition" title="Speak">
                <Volume2 className="w-3.5 h-3.5 mr-1" /> Listen
              </button>
              <button onClick={onTranslate} className="hover:text-indigo-600 flex items-center transition" title="Translate to Hindi">
                <Languages className="w-3.5 h-3.5 mr-1" /> Hindi
              </button>
            </div>
          ) : (
            <div />
          )}
          <span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      
      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center ml-2 flex-shrink-0 mt-1">
          <User className="w-5 h-5 text-green-600" />
        </div>
      )}
    </div>
  );
};

export default ChatBubble;
