import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add token to request headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = error.config?.url || '';
    const isLoginOrRegister = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
    
    // Normalize timeout and network connection errors into user-friendly message
    if (
      error.code === 'ECONNABORTED' ||
      error.message?.includes('timeout') ||
      error.message?.includes('Network Error') ||
      !error.response
    ) {
      const friendlyMessage = 'Unable to connect to the server. Please try again in a moment.';
      if (!error.response) {
        error.response = {
          data: {
            success: false,
            message: friendlyMessage,
          },
        };
      } else if (error.response.data) {
        if (typeof error.response.data === 'string') {
          error.response.data = {
            success: false,
            message: friendlyMessage,
          };
        } else {
          error.response.data.message = friendlyMessage;
        }
      }
      error.message = friendlyMessage;
    }

    // Normalize 429 rate-limiting responses into user-friendly message
    if (error.response?.status === 429) {
      if (!error.response.data || typeof error.response.data === 'string') {
        error.response.data = {
          success: false,
          message: 'Too many login attempts. Please wait a moment and try again.',
        };
      } else if (!error.response.data.message) {
        error.response.data.message = 'Too many login attempts. Please wait a moment and try again.';
      }
    }

    // Only redirect if 401 occurred on a protected route and not during login/register
    if (error.response?.status === 401 && !isLoginOrRegister) {
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me'),
};

// Complaint API
export const complaintAPI = {
  create: (data) => api.post('/complaints', data),
  getAll: (params) => api.get('/complaints', { params }),
  getMy: (params) => api.get('/complaints/my', { params }),
  getById: (id) => api.get(`/complaints/${id}`),
  markAsViewed: (id) => api.put(`/complaints/${id}/view`),
  updateStatus: (id, data) => api.put(`/complaints/${id}/status`, data),
  addRemark: (id, data) => api.post(`/complaints/${id}/remark`, data),
  assignDepartment: (id, data) => api.put(`/complaints/${id}/assign`, data),
  updatePriority: (id, data) => api.put(`/complaints/${id}/priority`, data),
  resolve: (id, data) => api.put(`/complaints/${id}/resolve`, data),
  trackPublic: (trackingId) => api.get(`/complaints/track/${encodeURIComponent(trackingId)}`),
};

// Department API
export const departmentAPI = {
  getAll: () => api.get('/departments'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

// Notification API
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  getAll: (params) => api.get('/users', { params }),
  updateStatus: (id, data) => api.put(`/users/${id}/status`, data),
  deleteAccount: (data) => api.delete('/users/account', { data }),
  // Student Management (Admin)
  getStudents: (params) => api.get('/users/students', { params }),
  getStudentDetails: (id) => api.get(`/users/students/${id}`),
  updateStudentStatus: (id, status) => api.put(`/users/students/${id}/status`, { status }),
  deleteStudent: (id) => api.delete(`/users/students/${id}`),
};

// Student Management API (Admin only dedicated export)
export const studentAPI = {
  getAll: (params) => api.get('/users/students', { params }),
  getById: (id) => api.get(`/users/students/${id}`),
  updateStatus: (id, status) => api.put(`/users/students/${id}/status`, { status }),
  delete: (id) => api.delete(`/users/students/${id}`),
};

// Dashboard API
export const dashboardAPI = {
  getStudentDashboard: () => api.get('/dashboard/student'),
  getAdminDashboard: () => api.get('/dashboard/admin'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
};

// AI API
export const aiAPI = {
  analyze: (data) => api.post('/ai/analyze', data),
  chat: (data) => api.post('/ai/chat', data),
};

export default api;
