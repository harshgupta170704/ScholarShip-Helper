import React, { useState } from 'react';
import { CheckCircle, Circle, ChevronDown, ChevronRight, User, Award } from 'lucide-react';

const ProgressSidebar = ({ profileData, progress = 0, name = '' }) => {
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    education: false,
    documents: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const sections = [
    { id: 'personal', title: 'Personal Info', data: profileData?.personal },
    { id: 'education', title: 'Education & Finance', data: profileData?.education },
    { id: 'documents', title: 'Documents', data: profileData?.documents },
  ];

  const displayProgress = Math.round(progress || 0);

  return (
    <div className="w-64 lg:w-72 bg-white border-r border-gray-200 h-full overflow-y-auto flex-shrink-0 hidden md:flex flex-col">
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-100 flex flex-col items-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-3 text-indigo-500 relative">
          <User className="w-8 h-8" />
          {displayProgress >= 100 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
        <h3 className="font-bold text-gray-800 text-base text-center">
          {name || 'Guest Student'}
        </h3>

        {/* Progress Bar */}
        <div className="w-full mt-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="font-medium text-gray-500">Progress</span>
            <span className="font-bold text-indigo-600">{displayProgress}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                displayProgress >= 80 ? 'bg-green-500' :
                displayProgress >= 40 ? 'bg-indigo-600' : 'bg-amber-500'
              }`}
              style={{ width: `${displayProgress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="p-4 flex-1">
        {sections.map(section => {
          const fieldCount = section.data?.fields?.length || 0;
          return (
            <div key={section.id} className="mb-3">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center">
                  {section.data?.completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
                  ) : fieldCount > 0 ? (
                    <div className="w-5 h-5 mr-2 flex-shrink-0 rounded-full border-2 border-indigo-400 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-indigo-500">{fieldCount}</span>
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300 mr-2 flex-shrink-0" />
                  )}
                  <span className={`text-sm font-medium ${section.data?.completed ? 'text-gray-900' : fieldCount > 0 ? 'text-gray-700' : 'text-gray-400'}`}>
                    {section.title}
                  </span>
                </div>
                {expandedSections[section.id] ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandedSections[section.id] && fieldCount > 0 && (
                <div className="ml-9 mt-1 space-y-1.5 border-l-2 border-gray-100 pl-3 py-1">
                  {section.data.fields.map((field, idx) => (
                    <div key={idx} className="flex flex-col text-xs">
                      <span className="text-gray-400 capitalize">{field.name.replace(/_/g, ' ')}</span>
                      <span className="text-gray-800 font-medium truncate max-w-[180px]">
                        {field.name === 'aadhaar' ? `XXXX XXXX ${String(field.value).slice(-4)}` : field.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              {expandedSections[section.id] && fieldCount === 0 && (
                <div className="ml-9 mt-1 border-l-2 border-gray-100 pl-3 py-1">
                  <span className="text-xs text-gray-400 italic">Pending...</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressSidebar;
