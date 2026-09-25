import React from 'react';

const QuickReply = ({ options, onSelect }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 ml-10">
      {options.map((option, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(option)}
          className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white border border-indigo-200 rounded-full text-sm font-medium transition-colors shadow-sm"
        >
          {option}
        </button>
      ))}
    </div>
  );
};

export default QuickReply;
