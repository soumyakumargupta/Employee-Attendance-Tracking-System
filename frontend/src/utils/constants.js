
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee'
};

export const OFFICE_CONFIG = {
  LATITUDE: parseFloat(process.env.REACT_APP_OFFICE_LATITUDE),
  LONGITUDE: parseFloat(process.env.REACT_APP_OFFICE_LONGITUDE), 
  ALLOWED_DISTANCE: parseInt(process.env.REACT_APP_ALLOWED_DISTANCE),
  START_TIME: process.env.REACT_APP_OFFICE_START_TIME,
  END_TIME: process.env.REACT_APP_OFFICE_END_TIME
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'ta_systems_token',
  USER: 'ta_systems_user',
  REMEMBER_ME: 'ta_systems_remember'
};
