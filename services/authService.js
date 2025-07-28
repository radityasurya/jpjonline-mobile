import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';

/**
 * Authentication Service
 * 
 * This service handles all authentication-related API calls.
 * Currently using mock responses - uncomment real API calls when CORS is configured.
 */

/**
 * User Signup
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User email
 * @param {string} userData.password - User password
 * @param {string} userData.name - User full name
 * @returns {Promise<Object>} API response
 */
export const signup = async (userData) => {
  try {
    logger.info('AuthService', 'Starting user signup', { email: userData.email });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, { email: userData.email, name: userData.name });
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), {
    //   method: 'POST',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(userData),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Signup failed');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('AuthService', 'Using mock signup response');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate email already exists error for demo
    if (userData.email === 'existing@jpjonline.com') {
      logger.warn('AuthService', 'Signup failed - email already exists', { email: userData.email });
      throw new Error('Email already exists');
    }

    const mockResponse = {
      success: true,
      user: {
        id: `clx${Date.now()}`,
        name: userData.name,
        email: userData.email,
        tier: "FREE",
        role: "USER",
        image: null
      }
    };
    
    logger.info('AuthService', 'Signup successful', { userId: mockResponse.user.id });
    logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, 200, { success: true });
    return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Signup failed', error);
    throw error;
  }
};

/**
 * User Login
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.email - User email
 * @param {string} credentials.password - User password
 * @returns {Promise<Object>} API response with token and user data
 */
export const login = async (credentials) => {
  try {
    logger.info('AuthService', 'Starting user login', { email: credentials.email });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, { email: credentials.email });
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
    //   method: 'POST',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(credentials),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Login failed');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('AuthService', 'Using mock login response');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate invalid credentials for demo
    if (credentials.email !== 'premium@jpjonline.com' && credentials.email !== 'free@jpjonline.com') {
      logger.warn('AuthService', 'Login failed - invalid credentials', { email: credentials.email });
      throw new Error('Invalid email or password');
    }

    const isPremium = credentials.email === 'premium@jpjonline.com';
    
    const mockResponse = {
      success: true,
      token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token.${Date.now()}`,
      user: {
        id: isPremium ? "clx1234567890" : "clx0987654321",
        name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
        email: credentials.email,
        tier: isPremium ? "PREMIUM" : "FREE",
        role: "USER",
        image: null
      }
    };
    
    logger.info('AuthService', 'Login successful', { 
      userId: mockResponse.user.id, 
      tier: mockResponse.user.tier 
    });
    logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, 200, { success: true });
    return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Login failed', error);
    throw error;
  }
};

/**
 * Get Current Session
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Current session data
 */
export const getSession = async (token) => {
  try {
    logger.debug('AuthService', 'Validating user session');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.AUTH.SESSION);
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SESSION), {
    //   method: 'GET',
    //   headers: getAuthHeaders(token),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Session validation failed');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('AuthService', 'Using mock session response');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Extract mock user data from token (in real implementation, backend validates token)
    const isPremium = token.includes('premium');
    
    const mockResponse = {
      user: {
        id: isPremium ? "clx1234567890" : "clx0987654321",
        name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
        email: isPremium ? "premium@jpjonline.com" : "free@jpjonline.com",
        tier: isPremium ? "PREMIUM" : "FREE",
        role: "USER",
        image: null
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
    
    logger.debug('AuthService', 'Session validation successful', { userId: mockResponse.user.id });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.AUTH.SESSION, 200);
    return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Session validation failed', error);
    throw error;
  }
};

/**
 * Forgot Password
 * @param {Object} data - Email data
 * @param {string} data.email - User email
 * @returns {Promise<Object>} API response
 */
export const forgotPassword = async (data) => {
  try {
    logger.info('AuthService', 'Password reset requested', { email: data.email });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, { email: data.email });
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD), {
    //   method: 'POST',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(data),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to send reset email');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('AuthService', 'Using mock forgot password response');
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    const mockResponse = {
      success: true,
      message: "Password reset email sent"
    };
    
    logger.info('AuthService', 'Password reset email sent', { email: data.email });
    logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, 200);
    return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Forgot password failed', error);
    throw error;
  }
};

/**
 * Reset Password
 * @param {Object} data - Reset password data
 * @param {string} data.token - Reset token from email
 * @param {string} data.password - New password
 * @returns {Promise<Object>} API response
 */
export const resetPassword = async (data) => {
  try {
    logger.info('AuthService', 'Password reset attempted');
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, { token: data.token });
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD), {
    //   method: 'POST',
    //   headers: API_CONFIG.HEADERS,
    //   body: JSON.stringify(data),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Password reset failed');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('AuthService', 'Using mock reset password response');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate invalid token for demo
    if (data.token === 'invalid-token') {
      logger.warn('AuthService', 'Password reset failed - invalid token');
      throw new Error('Invalid or expired reset token');
    }
    
    const mockResponse = {
      success: true,
      message: "Password has been reset"
    };
    
    logger.info('AuthService', 'Password reset successful');
    logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, 200);
    return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Reset password failed', error);
    throw error;
  }
};