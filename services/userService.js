import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';

/**
 * User Profile Service
 *
 * This service handles all user profile-related API calls.
 * Currently using mock responses - uncomment real API calls when CORS is configured.
 */

/**
 * Get User Profile
 * @param {string|null} token - JWT token (optional, will use stored token if null)
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (token = null) => {
  try {
    const authToken = token || (await import('./storage.js').then(m => m.default.getItem('accessToken')));
    
    logger.debug('UserService', 'Fetching user profile');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.USER.PROFILE);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
      {
        method: 'GET',
        headers: getAuthHeaders(authToken),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();

    // Mock response - commented out for actual API usage
    // logger.debug('UserService', 'Using mock profile response');
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    //
    // // Extract mock user data from token (in real implementation, backend validates token)
    // const isPremium = token.includes('premium');
    //
    // const mockResponse = {
    //   id: isPremium ? "clx1234567890" : "clx0987654321",
    //   name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
    //   email: isPremium ? "premium@jpj.com" : "user@jpj.com",
    //   tier: isPremium ? "PREMIUM" : "FREE",
    //   role: "USER",
    //   image: null
    // };
    //
    // logger.debug('UserService', 'Profile fetched successfully', { userId: mockResponse.id });
    // logger.apiResponse('GET', API_CONFIG.ENDPOINTS.USER.PROFILE, 200);
    // return mockResponse;
  } catch (error) {
    logger.error('UserService', 'Failed to fetch user profile', error);
    throw error;
  }
};

/**
 * Update User Profile
 * @param {string|null} token - JWT token (optional, will use stored token if null)
 * @param {Object} profileData - Profile update data
 * @param {string} [profileData.name] - User name
 * @param {string} [profileData.email] - User email
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (token = null, profileData) => {
  try {
    const authToken = token || (await import('./storage.js').then(m => m.default.getItem('accessToken')));
    
    logger.info('UserService', 'Updating user profile', profileData);
    logger.apiRequest('PUT', API_CONFIG.ENDPOINTS.USER.PROFILE, profileData);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
      {
        method: 'PUT',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(profileData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update profile');
    }

    const data = await response.json();
    
    logger.info('UserService', 'Profile updated successfully', {
      userId: data.data?.id,
      message: data.message,
    });
    logger.apiResponse('PUT', API_CONFIG.ENDPOINTS.USER.PROFILE, 200, {
      success: true,
    });

    return data;

    // Mock response - commented out for actual API usage
    // logger.debug('UserService', 'Using mock profile update response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Extract mock user data from token and merge with updates
    // const isPremium = token.includes('premium');
    // const currentUser = {
    //   id: isPremium ? "clx1234567890" : "clx0987654321",
    //   name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
    //   email: isPremium ? "premium@jpj.com" : "user@jpj.com",
    //   tier: isPremium ? "PREMIUM" : "FREE",
    //   role: "USER",
    //   image: null
    // };
    //
    // const updatedUser = {
    //   ...currentUser,
    //   ...profileData
    // };
    //
    // const mockResponse = {
    //   success: true,
    //   user: updatedUser
    // };
    //
    // logger.info('UserService', 'Profile updated successfully', { userId: updatedUser.id });
    // logger.apiResponse('PUT', API_CONFIG.ENDPOINTS.USER.PROFILE, 200);
    // return mockResponse;
  } catch (error) {
    logger.error('UserService', 'Failed to update user profile', error);
    throw error;
  }
};

/**
 * Change Password
 * @param {string|null} token - JWT token (optional, will use stored token if null)
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} API response
 */
export const changePassword = async (token = null, passwordData) => {
  try {
    const authToken = token || (await import('./storage.js').then(m => m.default.getItem('accessToken')));
    
    logger.info('UserService', 'Changing user password');
    logger.apiRequest('POST', API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD),
      {
        method: 'POST',
        headers: getAuthHeaders(authToken),
        body: JSON.stringify(passwordData),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to change password');
    }

    return await response.json();

    // Mock response - commented out for actual API usage
    // logger.debug('UserService', 'Using mock password change response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    //
    // // Simulate incorrect current password for demo
    // if (passwordData.currentPassword === 'wrongpassword') {
    //   logger.warn('UserService', 'Password change failed - incorrect current password');
    //   throw new Error('Current password is incorrect');
    // }
    //
    // const mockResponse = {
    //   success: true,
    //   message: "Password changed successfully"
    // };
    //
    // logger.info('UserService', 'Password changed successfully');
    // logger.apiResponse('POST', API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD, 200);
    // return mockResponse;
  } catch (error) {
    logger.error('UserService', 'Failed to change password', error);
    throw error;
  }
};

/**
 * Delete User Account
 * @param {string|null} token - JWT token (optional, will use stored token if null)
 * @returns {Promise<Object>} API response
 */
export const deleteUserAccount = async (token = null) => {
  try {
    const authToken = token || (await import('./storage.js').then(m => m.default.getItem('accessToken')));
    
    logger.info('UserService', 'Deleting user account');
    logger.apiRequest('DELETE', API_CONFIG.ENDPOINTS.USER.PROFILE);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE),
      {
        method: 'DELETE',
        headers: getAuthHeaders(authToken),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete account');
    }

    return await response.json();

    // Mock response - commented out for actual API usage
    // logger.debug('UserService', 'Using mock delete account response');
    // await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
    //
    // const mockResponse = {
    //   success: true,
    //   message: "Account deleted successfully"
    // };
    //
    // logger.info('UserService', 'Account deleted successfully');
    // logger.apiResponse('DELETE', API_CONFIG.ENDPOINTS.USER.PROFILE, 200);
    // return mockResponse;
  } catch (error) {
    logger.error('UserService', 'Failed to delete user account', error);
    throw error;
  }
};
