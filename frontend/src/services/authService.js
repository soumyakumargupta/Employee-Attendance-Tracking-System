// src/services/authService.js
import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// Temporary direct API instance to bypass any caching issues
const directApi = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

class AuthService {
  // Login with email and password
  async login(credentials) {
    try {
      console.log('🚀 AuthService: Making login request to http://localhost:5000/api/auth/login');
      const response = await directApi.post('/auth/login', credentials);
      console.log('✅ AuthService: Login successful');
      return response.data;
    } catch (error) {
      console.error('❌ AuthService: Login failed', error.response?.status, error.response?.data);
      throw this.handleError(error);
    }
  }

  // Register new user
  async register(userData) {
    try {
      const response = await directApi.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Verify OTP (6-digit code)
  async verifyOTP(otpData) {
    try {
      const response = await directApi.post('/auth/verify-otp', otpData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await directApi.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reset password
  async resetPassword(resetData) {
    try {
      const response = await directApi.post('/auth/reset-password', resetData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Store auth data in localStorage
  storeAuthData(token, user, rememberMe = false) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(LOCAL_STORAGE_KEYS.USER, JSON.stringify(user));
    
    if (rememberMe) {
      localStorage.setItem(LOCAL_STORAGE_KEYS.REMEMBER_ME, 'true');
    }
  }

  // Get stored auth data
  getStoredAuthData() {
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    const userStr = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    const rememberMe = localStorage.getItem(LOCAL_STORAGE_KEYS.REMEMBER_ME) === 'true';
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        return { token, user, rememberMe };
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        this.clearAuthData();
        return null;
      }
    }
    
    return null;
  }

  // Clear auth data
  clearAuthData() {
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.USER);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REMEMBER_ME);
  }

  // Check if token is expired (basic check)
  isTokenExpired(token) {
    if (!token) return true;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  // Error handler
  handleError(error) {
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('An unexpected error occurred');
    }
  }
}

export const authService = new AuthService();
