import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data: any) => api.put('/auth/profile', data),
  uploadAvatar: (formData: FormData) => api.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
};

// Listings API
export const listingsAPI = {
  getAll: (filters: any) => api.get('/listings', { params: filters }),
  getById: (id: string) => api.get(`/listings/${id}`),
  createListing: (data: any) => api.post('/listings', data),
  create: (data: any) => api.post('/listings', data),
  update: (id: string, data: any) => api.put(`/listings/${id}`, data),
  delete: (id: string) => api.delete(`/listings/${id}`),
  save: (id: string) => api.post(`/listings/${id}/save`),
  unsave: (id: string) => api.post(`/listings/${id}/unsave`),
  getSaved: () => api.get('/users/saved'),
  getByUserId: (userId: string) => api.get(`/users/${userId}/listings`),
};

// Verification API
export const verificationAPI = {
  requestVerification: (data: any) => api.post('/verification/request', data),
  getStatus: () => api.get('/verification/status'),
  getPending: () => api.get('/verification/pending'),
  approve: (userId: string, notes?: string) => api.post(`/verification/approve/${userId}`, { notes }),
  reject: (userId: string, reason?: string) => api.post(`/verification/reject/${userId}`, { reason }),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id: string) => api.delete(`/notifications/${id}`),
};

// Favorites API
export const favoritesAPI = {
  addSeller: (sellerId: string) => api.post(`/favorites/sellers/${sellerId}`),
  removeSeller: (sellerId: string) => api.delete(`/favorites/sellers/${sellerId}`),
  getSellers: () => api.get('/favorites/sellers'),
};

// Chat API
export const chatAPI = {
  getOrCreateConversation: (listingId: string, sellerId: string) => 
    api.post('/conversations', { listingId, sellerId }),
  getConversations: () => api.get('/conversations'),
  getMessages: (conversationId: string) => 
    api.get(`/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, text: string) => 
    api.post('/conversations/messages', { conversationId, text }),
  deleteConversation: (conversationId: string) => 
    api.delete(`/conversations/${conversationId}`),
};

// Transactions API (безопасные сделки)
export const transactionsAPI = {
  create: (listingId: string, amount: number) => 
    api.post('/transactions', { listingId, amount }),
  getAll: (role?: 'buyer' | 'seller') => 
    api.get('/transactions', { params: { role } }),
  getById: (transactionId: string) => 
    api.get(`/transactions/${transactionId}`),
  updateStatus: (transactionId: string, status: string, data?: any) => 
    api.put(`/transactions/${transactionId}/status`, { status, ...data }),
  createDispute: (transactionId: string, reason: string, details: string) => 
    api.post(`/transactions/${transactionId}/dispute`, { reason, details }),
};

export default api;
 