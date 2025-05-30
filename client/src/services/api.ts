import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create axios instance with environment variable for base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Don't show toast for 404/400 errors on user/patient/appointment endpoints (these are handled by components)
    const isUserEndpoint = error.config?.url?.includes('/users/');
    const isPatientEndpoint = error.config?.url?.includes('/patients/');
    const isAppointmentEndpoint = error.config?.url?.includes('/appointments/');
    const is404or400 = error.response?.status === 404 || error.response?.status === 400;

    if (!((isUserEndpoint || isPatientEndpoint || isAppointmentEndpoint) && is404or400)) {
      // Show error toast for other errors
      toast.error(message);
    }

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
    const response = await api.get('/analytics/dashboard');
    return response;
  },

  getPatientGrowth: async (period: string = 'monthly') => {
    const response = await api.get(`/analytics/patient-growth?period=${period}`);
    return response;
  },

  getRevenue: async (period: string = 'monthly') => {
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

export default api;
