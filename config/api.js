/**
 * API Configuration
 * 
 * This file contains the base configuration for API endpoints.
 * Modify the BASE_URL for different environments:
 * - Development: localhost:3000
 * - Staging: https://staging-api.jpjonline.com
 * - Production: https://api.jpjonline.com
 */

export const API_CONFIG = {
  BASE_URL: 'https://jpjonline.com',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/api/mobile/auth/signup',
      LOGIN: '/api/mobile/auth/login',
      REFRESH: '/api/mobile/auth/refresh',
      SESSION: '/api/auth/session',
      FORGOT_PASSWORD: '/api/auth/forgot-password',
      RESET_PASSWORD: '/api/auth/reset-password',
    },
    USER: {
      PROFILE: '/api/me',
      CHANGE_PASSWORD: '/api/me/change-password',
    },
    EXAMS: {
      USER_EXAMS: '/api/me/exams',
      EXAM_HISTORY: '/api/me/exam-history',
    }
  },
  HEADERS: {
    'Content-Type': 'application/json',
  }
};

/**
 * Get authorization headers with JWT token
 * @param {string} token - JWT token from login
 * @returns {Object} Headers object with authorization
 */
export const getAuthHeaders = (token) => ({
  ...API_CONFIG.HEADERS,
  'Authorization': `Bearer ${token}`,
});

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;