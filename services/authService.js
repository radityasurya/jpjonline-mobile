import storageService from './storage.js';
import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';

/**
 * Make API request with automatic token refresh
 * @param {string} url - API URL
 * @param {Object} options - Fetch options
 * @param {boolean} isRetry - Internal flag to prevent infinite loops
 * @returns {Promise<Response>} API response
 */
export const makeAuthenticatedRequest = async (
  url,
  options = {},
  isRetry = false,
) => {
  try {
    // Get current token
    const token = await storageService.getItem('accessToken');

    // Make initial request
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders(token),
      },
    });

    // If unauthorized and this is not already a retry, try to refresh token
    if (response.status === 401 && !isRetry) {
      logger.info('AuthService', 'Token expired, attempting refresh');

      const refreshToken = await storageService.getItem('refreshToken');
      if (!refreshToken) {
        logger.warn('AuthService', 'No refresh token available');
        // Clear any remaining tokens
        await storageService.removeItem('accessToken');
        await storageService.removeItem('user');
        throw new Error('Authentication required');
      }

      try {
        // Refresh the token
        const refreshResponse = await refreshAccessToken(refreshToken);

        if (refreshResponse.success) {
          // Store new tokens
          await storageService.setItem(
            'accessToken',
            refreshResponse.accessToken,
          );
          if (refreshResponse.refreshToken) {
            await storageService.setItem(
              'refreshToken',
              refreshResponse.refreshToken,
            );
          }

          logger.info('AuthService', 'Token refreshed successfully');

          // Retry original request with new token (mark as retry to prevent loops)
          return await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              ...getAuthHeaders(refreshResponse.accessToken),
            },
          });
        }
      } catch (refreshError) {
        logger.error('AuthService', 'Token refresh failed', refreshError);
        // Clear invalid tokens
        await storageService.removeItem('accessToken');
        await storageService.removeItem('refreshToken');
        await storageService.removeItem('user');
        throw new Error('Session expired. Please login again.');
      }
    } else if (response.status === 401 && isRetry) {
      // If we get 401 on retry, refresh token is also invalid
      logger.error(
        'AuthService',
        'Refresh token also invalid, clearing session',
      );
      await storageService.removeItem('accessToken');
      await storageService.removeItem('refreshToken');
      await storageService.removeItem('user');
      throw new Error('Session expired. Please login again.');
    }

    return response;
  } catch (error) {
    logger.error('AuthService', 'Authenticated request failed', error);
    throw error;
  }
};

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
    logger.info('AuthService', 'Starting user signup', {
      email: userData.email,
    });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, {
      email: userData.email,
      name: userData.name,
    });

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SIGNUP), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword,
        acceptTerms: userData.acceptTerms,
      }),
    });

    const data = await response.json();

    console.log('API Response:', { status: response.status, data });

    if (response.ok && data.success) {
      // Handle the response structure from auth.md documentation
      const userData = data.data || data.user || data;
      
      // Check if userData exists and has required fields
      if (!userData || !userData.id) {
        logger.error('AuthService', 'Invalid response structure', { data });
        throw new Error('Invalid response from server');
      }
      
      logger.info('AuthService', 'Signup successful', { userId: userData.id });
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, 201, { success: true });
      return {
        success: true,
        user: {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          tier: userData.tier || 'FREE', // Default tier for new users
          role: userData.role || 'USER',
          premiumUntil: userData.premiumUntil,
          isActive: userData.isActive !== undefined ? userData.isActive : true,
        },
      };
    } else {
      logger.warn('AuthService', 'Signup failed', { error: data.error, errors: data.errors });
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, response.status, { error: data.error });
      
      // Create a structured error object for better handling
      const error = new Error(data.error || 'Signup failed');
      error.validationErrors = data.errors || [];
      error.statusCode = response.status;
      throw error;
    }

    // Mock response - kept for debugging
    // logger.debug('AuthService', 'Using mock signup response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Simulate email already exists error for demo
    // if (userData.email === 'existing@jpjonline.com') {
    //   logger.warn('AuthService', 'Signup failed - email already exists', { email: userData.email });
    //   throw new Error('Email already exists');
    // }
    //
    // const mockResponse = {
    //   success: true,
    //   user: {
    //     id: `clx${Date.now()}`,
    //     name: userData.name,
    //     email: userData.email,
    //     tier: "FREE",
    //     role: "USER",
    //     image: null
    //   }
    // };
    //
    // logger.info('AuthService', 'Signup successful', { userId: mockResponse.user.id });
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, 200, { success: true });
    // return mockResponse;
  } catch (error) {
    logger.error('AuthService', 'Signup failed', error);
    // Mock response - kept for debugging
    // logger.debug('AuthService', 'Using mock signup response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Simulate email already exists error for demo
    // if (userData.email === 'existing@jpjonline.com') {
    //   logger.warn('AuthService', 'Signup failed - email already exists', { email: userData.email });
    //   throw new Error('Email already exists');
    // }
    //
    // const mockResponse = {
    //   success: true,
    //   user: {
    //     id: `clx${Date.now()}`,
    //     name: userData.name,
    //     email: userData.email,
    //     tier: "FREE",
    //     role: "USER",
    //     image: null
    //   }
    // };
    //
    // logger.info('AuthService', 'Signup successful', { userId: mockResponse.user.id });
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.SIGNUP, 200, { success: true });
    // return mockResponse;

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
    logger.info('AuthService', 'Starting user login', {
      email: credentials.email,
    });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
    });

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();

    if (data.success) {
      // Store tokens
      if (data.accessToken) {
        // Store access token for API calls
        // Note: In production, consider using secure storage
      }
      if (data.refreshToken) {
        // Store refresh token for token renewal
        // Note: In production, consider using secure storage
      }

      return {
        success: true,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          tier: data.user.tier,
          role: data.user.role,
          premiumUntil: data.user.premiumUntil,
          isActive: data.user.isActive,
        },
      };
    } else {
      throw new Error(data.error || 'Login failed');
    }
  } catch (error) {
    logger.error('AuthService', 'Login failed', error);

    // Mock response - kept for debugging
    // logger.debug('AuthService', 'API failed, using mock login response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Simulate invalid credentials for demo
    // if (credentials.email !== 'premium@jpjonline.com' && credentials.email !== 'free@jpjonline.com') {
    //   logger.warn('AuthService', 'Login failed - invalid credentials', { email: credentials.email });
    //   throw new Error('Invalid email or password');
    // }
    //
    // const isPremium = credentials.email === 'premium@jpjonline.com';
    //
    // const mockResponse = {
    //   success: true,
    //   token: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token.${Date.now()}`,
    //   refreshToken: `refresh.mock.token.${Date.now()}`,
    //   user: {
    //     id: isPremium ? "clx1234567890" : "clx0987654321",
    //     name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
    //     email: credentials.email,
    //     tier: isPremium ? "PREMIUM" : "FREE",
    //     role: "USER",
    //     premiumUntil: isPremium ? "2026-07-25T13:41:01.520Z" : undefined,
    //     isActive: true
    //   }
    // };
    //
    // logger.info('AuthService', 'Mock login successful', {
    //   userId: mockResponse.user.id,
    //   tier: mockResponse.user.tier
    // });
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.LOGIN, 200, { success: true });
    // return mockResponse;

    throw error;
  }
};

/**
 * Refresh Access Token
 * @param {string} refreshToken - Refresh token
 * @returns {Promise<Object>} New tokens and user data
 */
export const refreshAccessToken = async (refreshToken) => {
  try {
    logger.info('AuthService', 'Refreshing access token');
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.REFRESH);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH),
      {
        method: 'POST',
        headers: API_CONFIG.HEADERS,
        body: JSON.stringify({ refreshToken }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('AuthService', 'Refresh token API error', {
        status: response.status,
        error: errorData.error,
      });
      throw new Error(errorData.error || 'Token refresh failed');
    }

    const data = await response.json();

    if (data.success) {
      logger.info('AuthService', 'Token refresh successful');
      return {
        success: true,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          tier: data.user.tier,
          role: data.user.role,
          premiumUntil: data.user.premiumUntil,
          isActive: data.user.isActive,
        },
      };
    } else {
      logger.error('AuthService', 'Refresh token response unsuccessful', data);
      throw new Error(data.error || 'Token refresh failed');
    }
  } catch (error) {
    logger.error('AuthService', 'Token refresh failed', error);
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
    // Get token from storage if not provided
    const authToken = token || (await storageService.getItem('accessToken'));

    logger.debug('AuthService', 'Validating user session');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.AUTH.SESSION);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.SESSION),
      {
        method: 'GET',
        headers: getAuthHeaders(authToken),
      },
    );

    if (!response.ok) {
      throw new Error('Session validation failed');
    }

    return await response.json();
  } catch (error) {
    logger.error('AuthService', 'Session validation failed', error);

    // Mock response - kept for debugging
    // logger.debug('AuthService', 'API failed, using mock session response');
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    //
    // // Extract mock user data from token (in real implementation, backend validates token)
    // const isPremium = token.includes('premium');
    //
    // const mockResponse = {
    //   user: {
    //     id: isPremium ? "clx1234567890" : "clx0987654321",
    //     name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
    //     email: isPremium ? "premium@jpjonline.com" : "free@jpjonline.com",
    //     tier: isPremium ? "PREMIUM" : "FREE",
    //     role: "USER",
    //     premiumUntil: isPremium ? "2026-07-25T13:41:01.520Z" : undefined,
    //     isActive: true
    //   },
    //   expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
    // };
    //
    // logger.debug('AuthService', 'Mock session validation successful', { userId: mockResponse.user.id });
    // logger.apiResponse('GET', API_CONFIG.ENDPOINTS.AUTH.SESSION, 200);
    // return mockResponse;

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
    logger.info('AuthService', 'Password reset requested', {
      email: data.email,
    });
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, {
      email: data.email,
    });

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        email: data.email,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      logger.info('AuthService', 'Password reset email sent', { email: data.email });
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, 200, { success: true });
      return {
        success: true,
        message: result.message,
      };
    } else {
      logger.warn('AuthService', 'Password reset failed', { error: result.error });
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, response.status, { error: result.error });
      if (response.status === 429) {
        throw new Error(result.error || 'Too many requests. Please try again later.');
      }
      throw new Error(result.error || 'Failed to send reset email');
    }
  } catch (error) {
    logger.error('AuthService', 'Forgot password failed', error);

    // Mock response - kept for debugging
    // logger.debug('AuthService', 'API failed, using mock forgot password response');
    // await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    //
    // const mockResponse = {
    //   success: true,
    //   message: "Password reset email sent"
    // };
    //
    // logger.info('AuthService', 'Mock password reset email sent', { email: data.email });
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, 200);
    // return mockResponse;

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
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, {
      token: data.token,
    });

    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD), {
      method: 'POST',
      headers: API_CONFIG.HEADERS,
      body: JSON.stringify({
        token: data.token,
        password: data.password,
        confirmPassword: data.confirmPassword,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      logger.info('AuthService', 'Password reset successful');
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, 200, { success: true });
      return {
        success: true,
        message: result.message,
      };
    } else {
      logger.warn('AuthService', 'Password reset failed', { error: result.error });
      logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, response.status, { error: result.error });
      throw new Error(result.error || 'Password reset failed');
    }
  } catch (error) {
    logger.error('AuthService', 'Reset password failed', error);

    // Mock response - kept for debugging
    // logger.debug('AuthService', 'API failed, using mock reset password response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Simulate invalid token for demo
    // if (data.token === 'invalid-token') {
    //   logger.warn('AuthService', 'Password reset failed - invalid token');
    //   throw new Error('Invalid or expired reset token');
    // }
    //
    // const mockResponse = {
    //   success: true,
    //   message: "Password has been reset"
    // };
    //
    // logger.info('AuthService', 'Mock password reset successful');
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD, 200);
    // return mockResponse;

    throw error;
  }
};
