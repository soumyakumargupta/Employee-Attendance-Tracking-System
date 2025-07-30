// src/services/api.js
import axios from 'axios';
import { API_BASE_URL, LOCAL_STORAGE_KEYS } from '../utils/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config) => {
    console.log('🚀 Making API request to:', config.baseURL + config.url);
    console.log('🔧 API_BASE_URL:', API_BASE_URL);
    console.log('🌀 Full Config:', config);
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
      localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// API Service Functions
export const apiService = {
  // Auth endpoints
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Admin endpoints
  initiateEmployeeRegistration: (employeeData) => api.post('/auth/register/initiate', employeeData),
  verifyEmployeeRegistration: (verificationData) => api.post('/auth/register/verify', verificationData),
  getEmployeeList: () => api.get('/admin/employees'),
  getEmployeeById: (employeeId) => api.get(`/admin/employee/${employeeId}`),
  updateEmployee: (employeeId, data) => api.put(`/admin/employee/${employeeId}`, data),
  toggleEmployeeStatus: (employeeId) => api.put(`/admin/employee/${employeeId}/toggle-status`),
  // Admin endpoint for getting all attendance records
  getAttendanceRecords: (params) => api.get('/admin/employees/attendance/records', { params }),
  // Employee endpoint for getting own attendance records  
  getEmployeeAttendanceRecords: (params) => api.get('/employee/attendance/records', { params }),
  
  // Employee endpoints
  getProfile: () => api.get('/employee/profile'),
  updateProfile: (data) => api.put('/employee/profile', data),
  getMyAttendanceRecords: (params) => api.get('/employee/attendance/records', { params }),
  getTodayAttendance: () => api.get('/employee/attendance/today'),
  
  // Attendance endpoints
  initiateClockIn: (locationData) => api.post('/attendance/clockin/initiate', locationData),
  verifyClockIn: (otpData) => api.post('/attendance/clockin/verify', otpData),
  initiateClockOut: (locationData) => api.post('/attendance/clockout/initiate', locationData),
  verifyClockOut: (otpData) => api.post('/attendance/clockout/verify', otpData),
};

export default api;
