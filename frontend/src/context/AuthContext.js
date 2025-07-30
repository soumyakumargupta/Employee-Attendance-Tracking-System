// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { USER_ROLES } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSession, setOtpSession] = useState(null); // For OTP flow

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedData = authService.getStoredAuthData();
        
        if (storedData && storedData.token && !authService.isTokenExpired(storedData.token)) {
          setToken(storedData.token);
          setUser(storedData.user);
        } else {
          // Clear expired/invalid data
          authService.clearAuthData();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        authService.clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = async (credentials, rememberMe = false) => {
    try {
      setLoading(true);
      const response = await authService.login(credentials);
      
      // Check if OTP verification is required
      if (response.requiresOTP) {
        setOtpSession({
          email: credentials.email,
          sessionId: response.sessionId,
          message: response.message
        });
        return { requiresOTP: true, message: response.message };
      }
      
      // Direct login success (if OTP not required)
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        authService.storeAuthData(response.token, response.user, rememberMe);
        return { success: true, user: response.user };
      }
      
      throw new Error('Invalid response from server');
      
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function
  const verifyOTP = async (otp) => {
    if (!otpSession) {
      throw new Error('No OTP session found. Please login again.');
    }
    
    try {
      setLoading(true);
      const response = await authService.verifyOTP({
        email: otpSession.email,
        otp: otp,
        sessionId: otpSession.sessionId
      });
      
      if (response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        setOtpSession(null); // Clear OTP session
        authService.storeAuthData(response.token, response.user);
        return { success: true, user: response.user };
      }
      
      throw new Error('Invalid OTP verification response');
      
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);
      
      // Usually returns requiresOTP for email verification
      if (response.requiresOTP) {
        setOtpSession({
          email: userData.email,
          sessionId: response.sessionId,
          message: response.message
        });
        return { requiresOTP: true, message: response.message };
      }
      
      return response;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setOtpSession(null);
    authService.clearAuthData();
  };

  // Clear OTP session
  const clearOtpSession = () => {
    setOtpSession(null);
  };

  // Helper functions
  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === USER_ROLES.ADMIN;
  const isEmployee = user?.role === USER_ROLES.EMPLOYEE;

  const value = {
    // State
    user,
    token,
    loading,
    otpSession,
    isAuthenticated,
    isAdmin,
    isEmployee,
    
    // Functions
    login,
    register,
    verifyOTP,
    logout,
    clearOtpSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
