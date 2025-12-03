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
  // BASE_URL: 'http://localhost:3000',
  ENDPOINTS: {
    AUTH: {
      SIGNUP: '/api/mobile/auth/register',
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
    NOTES: {
      GROUPED_BY_CATEGORY: '/api/notes',
      BY_ID: '/api/notes',
      SEARCH: '/api/notes/search',
      CATEGORIES: '/api/notes/categories',
      CATEGORY_BY_SLUG: '/api/notes/categories',
    },
    EXAMS: {
      USER_EXAMS: '/api/me/exams',
      BY_SLUG: '/api/exams',
      BY_SLUG_FULL: '/api/exams',
    },
  },
  HEADERS: {
    'Content-Type': 'application/json',
  },
};

/**
 * Get authorization headers with JWT token
 * @param {string} token - JWT token from login
 * @returns {Object} Headers object with authorization
 */
export const getAuthHeaders = (token) => ({
  ...API_CONFIG.HEADERS,
  ...(token && { Authorization: `Bearer ${token}` }),
});

/**
 * Build full API URL
 * @param {string} endpoint - API endpoint path
 * @returns {string} Complete API URL
 */
export const buildApiUrl = (endpoint) => `${API_CONFIG.BASE_URL}${endpoint}`;
