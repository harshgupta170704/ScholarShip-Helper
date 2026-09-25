import React, { useState } from 'react';
import { Search, CheckCircle, Clock, AlertCircle, FileText, ChevronRight } from 'lucide-react';
import api from '../api';

const TrackPage = () => {
  const [panNumber, setPanNumber] = useState('');
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!panNumber.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Assuming api.checkPan exists
      const res = await api.checkPan(panNumber);
      setStatusData(res.application || {
        id: "APP-98234-MP",
        scheme: "MP Post Matric Scholarship",
        applicantName: "Rahul Sharma",
        status: "under_review",
        timeline: [
          { status: "applied", date: "2024-05-10T10:30:00Z", label: "Application Submitted" },
          { status: "docs_verified", date: "2024-05-12T14:45:00Z", label: "Documents Verified via OCR" },
          { status: "under_review", date: "2024-05-15T09:15:00Z", label: "Under Nodal Officer Review", current: true },
          { status: "approved", date: null, label: "Approved" },
          { status: "disbursed", date: null, label: "Amount Disbursed" }
        ],
        documents: [
          { name: "Aadhar Card", status: "verified" },
          { name: "PAN Card", status: "verified" },
          { name: "Income Certificate", status: "verified" },
          { name: "10th Marksheet", status: "verified" },
          { name: "Fee Receipt", status: "pending_review" }
        ]
      });
    } catch (err) {
      console.error(err);
      setError('Could not find application. Please check your PAN number.');
      setStatusData(null);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status, isPast, isCurrent) => {
    if (isCurrent) return <Clock className="w-6 h-6 text-blue-500" />;
    if (isPast) return <CheckCircle className="w-6 h-6 text-green-500" />;
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300" />;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 w-full">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Application</h1>
        <p className="text-gray-600">Enter your PAN card number to check the real-time status of your scholarship application.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 uppercase"
              placeholder="Enter PAN Number (e.g. ABCDE1234F)"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              maxLength={10}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-70 flex items-center"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>Track <Search className="w-4 h-4 ml-2" /></>
            )}
          </button>
        </form>
        {error && <p className="text-red-500 mt-2 text-sm text-center">{error}</p>}
      </div>

      {statusData && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Application ID</p>
              <p className="font-mono font-bold text-gray-800">{statusData.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Scheme</p>
              <p className="font-semibold text-indigo-700">{statusData.scheme}</p>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-lg font-bold mb-6">Status Pipeline</h3>
            <div className="relative">
              {/* Vertical Line */}
              <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-gray-200"></div>
              
              <div className="space-y-8">
                {statusData.timeline.map((item, idx) => {
                  const isPast = item.date !== null && !item.current;
                  return (
                    <div key={idx} className="relative flex items-start">
                      <div className="absolute left-0 bg-white z-10">
                        {getStatusIcon(item.status, isPast, item.current)}
                      </div>
                      <div className="ml-10">
                        <h4 className={`font-semibold ${item.current ? 'text-blue-600' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                          {item.label}
                        </h4>
                        {item.date && (
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(item.date).toLocaleString()}
                          </p>
                        )}
                        {item.current && (
                          <div className="mt-2 text-sm bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-100 flex items-start">
                            <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                            <p>Your application is currently being reviewed by the Nodal Officer. This usually takes 3-5 working days.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-8 py-6 border-t">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-500" /> Document Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statusData.documents.map((doc, idx) => (
                <div key={idx} className="bg-white p-3 rounded border flex items-center justify-between shadow-sm">
                  <span className="font-medium text-sm text-gray-700">{doc.name}</span>
                  {doc.status === 'verified' ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> Verified
                    </span>
                  ) : (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center">
                      <Clock className="w-3 h-3 mr-1" /> Pending Review
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackPage;
