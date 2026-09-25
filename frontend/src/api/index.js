import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
});

export default {
  async startChat() {
    const res = await api.post('/chat/start', {});
    return res.data;
  },

  async sendMessage(sessionId, message, file = null) {
    const formData = new FormData();
    if (message) formData.append('message', message);
    if (file) formData.append('file', file);

    const res = await api.post(`/chat/message/${sessionId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getSession(sessionId) {
    const res = await api.get(`/chat/session/${sessionId}`);
    return res.data;
  },

  async resetSession(sessionId) {
    const res = await api.post(`/chat/session/${sessionId}/reset`);
    return res.data;
  },

  async getScholarships(filters = {}) {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.category) params.append('category', filters.category);
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.level) params.append('level', filters.level);
    const res = await api.get(`/scholarships?${params.toString()}`);
    return res.data;
  },

  async getScholarship(id) {
    const res = await api.get(`/scholarships/${id}`);
    return res.data;
  },

  async checkPan(pan) {
    const res = await api.get(`/chat/session-by-pan/${pan}`);
    return res.data;
  },

  async uploadDocument(sessionId, docType, file) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);
    formData.append('session_id', sessionId);
    const res = await api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async getAdminApplications() {
    // Mock API call for admin applications
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'APP001',
            studentName: 'Harsh Gupta',
            email: 'harsh@example.com',
            scholarshipName: 'Post Matric Scholarship',
            dateApplied: '2023-10-15',
            status: 'Pending',
            documents: [
              { id: 'doc_1', name: 'Aadhaar Card', status: 'Pending' },
              { id: 'doc_2', name: 'Income Certificate', status: 'Verified' }
            ]
          },
          {
            id: 'APP002',
            studentName: 'Riya Singh',
            email: 'riya@example.com',
            scholarshipName: 'Medhavi Chhatra Yojana',
            dateApplied: '2023-10-16',
            status: 'Approved',
            documents: [
              { id: 'doc_3', name: '10th Marksheet', status: 'Verified' },
              { id: 'doc_4', name: '12th Marksheet', status: 'Verified' }
            ]
          }
        ]);
      }, 1000);
    });
  },

  async verifyDocument(docId) {
    // Mock API call for document verification
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Document ${docId} verified successfully` });
      }, 500);
    });
  }
};
