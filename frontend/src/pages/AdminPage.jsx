import React, { useState, useEffect } from 'react';
import { FileText, CheckCircle, Clock, Search, XCircle } from 'lucide-react';
import api from '../api';

const AdminPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminApplications();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (appId, docId) => {
    try {
      await api.verifyDocument(docId);
      // Update local state to reflect verification
      setApplications(prev => prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            documents: app.documents.map(doc => 
              doc.id === docId ? { ...doc, status: 'Verified' } : doc
            )
          };
        }
        return app;
      }));
    } catch (error) {
      console.error('Error verifying document:', error);
    }
  };

  const filteredApps = applications.filter(app => 
    app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.scholarshipName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-gray-500 mt-1">Manage scholarship applications and verify documents.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search applications..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64 bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Applicant</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Scholarship</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Status</th>
                    <th className="px-6 py-4 font-semibold text-gray-600 text-sm">Documents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredApps.length > 0 ? (
                    filteredApps.map(app => (
                      <tr key={app.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{app.studentName}</div>
                          <div className="text-sm text-gray-500">{app.email}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-indigo-700">{app.scholarshipName}</div>
                          <div className="text-xs text-gray-500 mt-1">Applied: {new Date(app.dateApplied).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            app.status === 'Approved' ? 'bg-green-100 text-green-800' :
                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {app.status === 'Approved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {app.status === 'Pending' && <Clock className="w-3 h-3 mr-1" />}
                            {app.status === 'Rejected' && <XCircle className="w-3 h-3 mr-1" />}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-3">
                            {app.documents.map(doc => (
                              <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded border">
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 text-gray-400 mr-2" />
                                  <span className="text-sm text-gray-700">{doc.name}</span>
                                </div>
                                {doc.status === 'Verified' ? (
                                  <span className="text-xs text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded">
                                    <CheckCircle className="w-3 h-3 mr-1" /> Verified
                                  </span>
                                ) : (
                                  <button 
                                    onClick={() => handleVerify(app.id, doc.id)}
                                    className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-100 transition font-medium"
                                  >
                                    Verify Document
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                        No applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
