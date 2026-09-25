import React, { useState } from 'react';
import { Award, Plus, Check } from 'lucide-react';

const AchievementInput = ({ options, onComplete }) => {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [currentForm, setCurrentForm] = useState(null);

  const toggleType = (type) => {
    if (type === 'None') {
      onComplete([]);
      return;
    }
    
    if (selectedTypes.includes(type)) {
      setSelectedTypes(selectedTypes.filter(t => t !== type));
    } else {
      setSelectedTypes([...selectedTypes, type]);
      if (!currentForm) {
        setCurrentForm({ type, detail: '', year: new Date().getFullYear().toString() });
      }
    }
  };

  const handleSaveForm = () => {
    if (currentForm && currentForm.detail) {
      setAchievements([...achievements, currentForm]);
      setCurrentForm(null);
    }
  };

  const submitAll = () => {
    onComplete(achievements);
  };

  return (
    <div className="ml-10 mb-4 max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
        <Award className="w-4 h-4 mr-2 text-yellow-500" /> Select Achievements
      </h3>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {options.map((opt, idx) => (
          <button
            key={idx}
            onClick={() => toggleType(opt)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              selectedTypes.includes(opt) || achievements.some(a => a.type === opt)
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300' 
                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>

      {currentForm && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
          <h4 className="font-medium text-sm mb-2 text-gray-700">Details for {currentForm.type}</h4>
          <input 
            type="text" 
            placeholder="Rank / Score / Medal" 
            value={currentForm.detail}
            onChange={(e) => setCurrentForm({...currentForm, detail: e.target.value})}
            className="w-full text-sm p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <input 
            type="number" 
            placeholder="Year" 
            value={currentForm.year}
            onChange={(e) => setCurrentForm({...currentForm, year: e.target.value})}
            className="w-full text-sm p-2 border border-gray-300 rounded mb-2 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
          <button 
            onClick={handleSaveForm}
            disabled={!currentForm.detail}
            className="w-full bg-yellow-500 text-white py-1.5 rounded text-sm font-medium hover:bg-yellow-600 disabled:opacity-50"
          >
            Save Detail
          </button>
        </div>
      )}

      {achievements.length > 0 && !currentForm && (
        <div className="mb-4 space-y-2">
          {achievements.map((ach, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm bg-green-50 text-green-800 px-3 py-2 rounded">
              <span><b>{ach.type}:</b> {ach.detail} ({ach.year})</span>
              <Check className="w-4 h-4 text-green-600" />
            </div>
          ))}
          {selectedTypes.filter(t => !achievements.some(a => a.type === t)).length > 0 && (
            <button 
              onClick={() => setCurrentForm({ type: selectedTypes.find(t => !achievements.some(a => a.type === t)), detail: '', year: '' })}
              className="text-xs text-indigo-600 flex items-center mt-2 hover:underline"
            >
              <Plus className="w-3 h-3 mr-1" /> Add details for other selected items
            </button>
          )}
        </div>
      )}

      {achievements.length > 0 && !currentForm && (
        <button 
          onClick={submitAll}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
        >
          Confirm Achievements
        </button>
      )}
    </div>
  );
};

export default AchievementInput;
