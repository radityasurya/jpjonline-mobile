import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';

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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate email already exists error for demo
    if (userData.email === 'existing@jpjonline.com') {
      throw new Error('Email already exists');
    }

    return {
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
  } catch (error) {
    console.error('Signup error:', error);
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate invalid credentials for demo
    if (credentials.email !== 'premium@jpj.com' && credentials.email !== 'free@jpj.com') {
      throw new Error('Invalid email or password');
    }

    const isPremium = credentials.email === 'premium@jpj.com';
    
    return {
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
  } catch (error) {
    console.error('Login error:', error);
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
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Extract mock user data from token (in real implementation, backend validates token)
    const isPremium = token.includes('premium');
    
    return {
      user: {
        id: isPremium ? "clx1234567890" : "clx0987654321",
        name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
        email: isPremium ? "premium@jpj.com" : "free@jpj.com",
        tier: isPremium ? "PREMIUM" : "FREE",
        role: "USER",
        image: null
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    };
  } catch (error) {
    console.error('Session validation error:', error);
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
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    
    return {
      success: true,
      message: "Password reset email sent"
    };
  } catch (error) {
    console.error('Forgot password error:', error);
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
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate invalid token for demo
    if (data.token === 'invalid-token') {
      throw new Error('Invalid or expired reset token');
    }
    
    return {
      success: true,
      message: "Password has been reset"
    };
  } catch (error) {
    console.error('Reset password error:', error);
    throw error;
  }
};