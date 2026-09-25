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
};
