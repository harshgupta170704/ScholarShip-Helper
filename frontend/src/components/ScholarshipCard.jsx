import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, Award } from 'lucide-react';

const ScholarshipCard = ({ scholarship, compact = false }) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${scholarship.unlockedBy ? 'border-yellow-400' : 'border-gray-200'} overflow-hidden transition-all hover:shadow-md flex flex-col`}>
      {scholarship.unlockedBy && (
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs font-bold px-3 py-1.5 flex items-center">
          <Award className="w-3.5 h-3.5 mr-1" /> Unlocked by {scholarship.unlockedBy}
        </div>
      )}
      
      <div className={`p-5 ${compact ? 'pb-4' : ''} flex-1`}>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
            (scholarship.type || scholarship.level) === 'State' || (scholarship.type || scholarship.level) === 'state' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
          }`}>
            {(scholarship.type || scholarship.level)} Scheme
          </span>
          {(scholarship.matchScore || scholarship.match_score) && (
            <div className="flex items-center">
              <span className="text-xs font-medium text-gray-500 mr-2">Match</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getScoreColor(scholarship.matchScore || scholarship.match_score)}`} 
                  style={{ width: `${scholarship.matchScore || scholarship.match_score}%` }}
                ></div>
              </div>
              <span className="text-xs font-bold ml-2">{scholarship.matchScore || scholarship.match_score}%</span>
            </div>
          )}
        </div>
        
        <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-bold text-gray-900 mb-1`}>{scholarship.name}</h3>
        <p className="text-sm text-gray-500 mb-4">By {scholarship.provider || scholarship.department}</p>
        
        <div className="flex items-end justify-between mb-4">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Amount</p>
            <p className="text-xl font-bold text-green-600">{scholarship.amount || scholarship.amount_description}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Deadline</p>
            <p className="text-sm font-medium text-gray-800">{scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {(() => {
            const tags = scholarship.eligibility || [];
            if (!scholarship.eligibility) {
              if (scholarship.eligibility_category && scholarship.eligibility_category !== 'All') tags.push(scholarship.eligibility_category);
              if (scholarship.eligibility_gender && scholarship.eligibility_gender !== 'All') tags.push(scholarship.eligibility_gender);
              if (scholarship.min_12th_percentage) tags.push(`${scholarship.min_12th_percentage}% in 12th`);
              if (scholarship.max_family_income) tags.push(`Income < ${(scholarship.max_family_income/100000).toFixed(1)}L`);
              if (scholarship.is_for_mp_only) tags.push('MP Domicile');
            }
            return (
              <>
                {tags.slice(0, 3).map((tag, idx) => (
                  <span key={idx} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
                {tags.length > 3 && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">+{tags.length - 3}</span>
                )}
              </>
            );
          })()}
        </div>

        {(!compact || expanded) && (
          <div className={`text-sm text-gray-600 border-t pt-3 mt-2 ${expanded ? 'block' : 'hidden'}`}>
            <p>{scholarship.description}</p>
          </div>
        )}
      </div>

      <div className="bg-gray-50 px-5 py-3 border-t flex justify-between items-center">
        {compact ? (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className="text-sm font-medium text-indigo-600 flex items-center hover:text-indigo-800"
          >
            {expanded ? (
              <>Less details <ChevronUp className="w-4 h-4 ml-1" /></>
            ) : (
              <>More details <ChevronDown className="w-4 h-4 ml-1" /></>
            )}
          </button>
        ) : (
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-transparent">
            View Details
          </button>
        )}
        <button className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors flex items-center">
          Apply Now <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
        </button>
      </div>
    </div>
  );
};

export default ScholarshipCard;
