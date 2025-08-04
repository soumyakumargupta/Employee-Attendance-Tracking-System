
// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

// Office Configuration
export const OFFICE_CONFIG = {
  LATITUDE: parseFloat(process.env.REACT_APP_OFFICE_LATITUDE) || 27.4924134,
  LONGITUDE: parseFloat(process.env.REACT_APP_OFFICE_LONGITUDE) || 77.673673,
  ALLOWED_DISTANCE: parseInt(process.env.REACT_APP_ALLOWED_DISTANCE) || 15000,
  START_TIME: process.env.REACT_APP_OFFICE_START_TIME || '09:00',
  END_TIME: process.env.REACT_APP_OFFICE_END_TIME || '17:30'
};

// App Configuration
export const APP_CONFIG = {
  NAME: process.env.REACT_APP_APP_NAME || 'Employee Attendance System',
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  ENVIRONMENT: process.env.REACT_APP_ENVIRONMENT || 'development',
  DEBUG: process.env.REACT_APP_DEBUG === 'true'
};

// Local Storage Keys
export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'ta_systems_token',
  USER: 'ta_systems_user',
  REMEMBER_ME: 'ta_systems_remember'
};
