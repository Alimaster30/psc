import axios from 'axios';
import { toast } from 'react-hot-toast';

// Simple cache for API responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url: string, params?: any) => {
  return `${url}${params ? JSON.stringify(params) : ''}`;
};

const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};

const clearCache = (pattern?: string) => {
  if (pattern) {
    // Clear cache entries that match the pattern
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
      }
    }
  } else {
    // Clear all cache
    cache.clear();
  }
};

// Create axios instance with environment variable for base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://prime-skin-clinic-api.onrender.com/api',
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token and check cache
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Check cache for GET requests
    if (config.method === 'get') {
      const cacheKey = getCacheKey(config.url || '', config.params);
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        // Return cached data as a resolved promise
        return Promise.reject({
          config,
          response: { data: cachedData },
          cached: true
        });
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses
    if (response.config.method === 'get') {
      const cacheKey = getCacheKey(response.config.url || '', response.config.params);
      setCachedData(cacheKey, response.data);
    }

    // Clear relevant cache on data modifications
    if (['post', 'put', 'patch', 'delete'].includes(response.config.method || '')) {
      const url = response.config.url || '';
      if (url.includes('/users')) {
        clearCache('/users');
      } else if (url.includes('/patients')) {
        clearCache('/patients');
        clearCache('/patient-images'); // Clear patient images cache when patients are modified
      } else if (url.includes('/patient-images')) {
        clearCache('/patient-images');
        clearCache('/patients'); // Clear patients cache when images are modified
      } else if (url.includes('/appointments')) {
        clearCache('/appointments');
      } else if (url.includes('/services')) {
        clearCache('/services');
      } else if (url.includes('/billing')) {
        clearCache('/billing');
      }
    }

    return response;
  },
  (error) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve(error.response);
    }

    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Something went wrong';

    // Don't show toast for specific endpoints and status codes that are handled by components
    const isUserEndpoint = error.config?.url?.includes('/users');
    const isPatientEndpoint = error.config?.url?.includes('/patients');
    const isPatientImageEndpoint = error.config?.url?.includes('/patient-images');
    const isAppointmentEndpoint = error.config?.url?.includes('/appointments');
    const isServiceEndpoint = error.config?.url?.includes('/services');
    const isBillingEndpoint = error.config?.url?.includes('/billing');
    const isDashboardEndpoint = error.config?.url?.includes('/dashboard');
    const is404or400 = error.response?.status === 404 || error.response?.status === 400;

    // Only show toast for critical errors, not for expected 400/404 errors
    const shouldShowToast = !(
      (isUserEndpoint || isPatientEndpoint || isPatientImageEndpoint || isAppointmentEndpoint ||
       isServiceEndpoint || isBillingEndpoint || isDashboardEndpoint) &&
      is404or400
    );

    if (shouldShowToast && error.response?.status !== 401) {
      toast.error(message);
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Use window.location.replace to avoid protocol issues
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response;
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData);
    return response;
  },

  getProfile: async () => {
    const response = await api.get('/auth/me');
    return response;
  },

  updateProfile: async (userData: any) => {
    const response = await api.put('/auth/me', userData);
    return response;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    const response = await api.post('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response;
  },
};

// User API
export const userAPI = {
  getUsers: async (params?: any) => {
    const response = await api.get('/users', { params });
    return response;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/users/${id}`);
    return response;
  },

  createUser: async (userData: any) => {
    const response = await api.post('/users', userData);
    return response;
  },

  updateUser: async (id: string, userData: any) => {
    const response = await api.put(`/users/${id}`, userData);
    return response;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/users/${id}`);
    return response;
  },

  updateUserStatus: async (id: string, isActive: boolean) => {
    const response = await api.patch(`/users/${id}/status`, { isActive });
    return response;
  },

  getUserDashboard: async () => {
    const response = await api.get('/users/me/dashboard');
    return response;
  },
};

// Patient API
export const patientAPI = {
  getPatients: async (params?: any) => {
    const response = await api.get('/patients', { params });
    return response;
  },

  getPatient: async (id: string) => {
    const response = await api.get(`/patients/${id}`);
    return response;
  },

  createPatient: async (patientData: any) => {
    const response = await api.post('/patients', patientData);
    return response;
  },

  updatePatient: async (id: string, patientData: any) => {
    const response = await api.put(`/patients/${id}`, patientData);
    return response;
  },

  deletePatient: async (id: string) => {
    const response = await api.delete(`/patients/${id}`);
    return response;
  },
};



// Appointment API
export const appointmentAPI = {
  getAppointments: async (params?: any) => {
    const response = await api.get('/appointments', { params });
    return response;
  },

  getAppointment: async (id: string) => {
    const response = await api.get(`/appointments/${id}`);
    return response;
  },

  createAppointment: async (appointmentData: any) => {
    const response = await api.post('/appointments', appointmentData);
    return response;
  },

  updateAppointment: async (id: string, appointmentData: any) => {
    const response = await api.put(`/appointments/${id}`, appointmentData);
    return response;
  },

  deleteAppointment: async (id: string) => {
    const response = await api.delete(`/appointments/${id}`);
    return response;
  },

  updateAppointmentStatus: async (id: string, status: string) => {
    const response = await api.patch(`/appointments/${id}/status`, { status });
    return response;
  },
};

// Prescription API
export const prescriptionAPI = {
  getPrescriptions: async (params?: any) => {
    const response = await api.get('/prescriptions', { params });
    return response;
  },

  getPrescription: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}`);
    return response;
  },

  createPrescription: async (prescriptionData: any) => {
    const response = await api.post('/prescriptions', prescriptionData);
    return response;
  },

  updatePrescription: async (id: string, prescriptionData: any) => {
    const response = await api.put(`/prescriptions/${id}`, prescriptionData);
    return response;
  },

  deletePrescription: async (id: string) => {
    const response = await api.delete(`/prescriptions/${id}`);
    return response;
  },

  generatePDF: async (id: string) => {
    const response = await api.get(`/prescriptions/${id}/pdf`, {
      responseType: 'blob'
    });
    return response;
  },
};

// Billing API
export const billingAPI = {
  getBillings: async (params?: any) => {
    const response = await api.get('/billing', { params });
    return response;
  },

  getBilling: async (id: string) => {
    const response = await api.get(`/billing/${id}`);
    return response;
  },

  createBilling: async (billingData: any) => {
    const response = await api.post('/billing', billingData);
    return response;
  },

  updateBilling: async (id: string, billingData: any) => {
    const response = await api.put(`/billing/${id}`, billingData);
    return response;
  },

  deleteBilling: async (id: string) => {
    const response = await api.delete(`/billing/${id}`);
    return response;
  },

  generateInvoicePDF: async (id: string) => {
    const response = await api.get(`/billing/${id}/invoice`, {
      responseType: 'blob'
    });
    return response;
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardSummary: async () => {
    const response = await api.get('/analytics/dashboard-summary');
    return response;
  },

  getPatientGrowth: async (period: string = 'month') => {
    const response = await api.get(`/analytics/patient-growth?period=${period}`);
    return response;
  },

  getRevenue: async (period: string = 'month') => {
    const response = await api.get(`/analytics/revenue?period=${period}`);
    return response;
  },

  getAppointmentAnalytics: async () => {
    const response = await api.get('/analytics/appointments');
    return response;
  },

  getTopMedications: async (limit: number = 10) => {
    const response = await api.get(`/analytics/medications/top?limit=${limit}`);
    return response;
  },
};

// Audit Log API
export const auditLogAPI = {
  getAuditLogs: async (params?: any) => {
    const response = await api.get('/audit-logs', { params });
    return response;
  },

  getAuditLogStats: async (period?: string) => {
    const response = await api.get('/audit-logs/stats', { params: { period } });
    return response;
  },

  getAuditLog: async (id: string) => {
    const response = await api.get(`/audit-logs/${id}`);
    return response;
  },

  exportAuditLogs: async (startDate?: string, endDate?: string) => {
    const response = await api.get('/audit-logs/export', {
      params: { startDate, endDate },
      responseType: 'blob',
    });
    return response;
  },
};

// Permission API
export const permissionAPI = {
  getPermissions: async () => {
    const response = await api.get('/permissions');
    return response;
  },

  getRolePermissions: async () => {
    const response = await api.get('/permissions/roles');
    return response;
  },

  updateRolePermissions: async (rolePermissions: any[]) => {
    const response = await api.put('/permissions/roles', { rolePermissions });
    return response;
  },

  getRolePermission: async (role: string) => {
    const response = await api.get(`/permissions/roles/${role}`);
    return response;
  },

  checkPermission: async (permission: string) => {
    const response = await api.get(`/permissions/check/${permission}`);
    return response;
  },

  initializePermissions: async () => {
    const response = await api.post('/permissions/initialize');
    return response;
  },
};

export default api;
export { clearCache };
