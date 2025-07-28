import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';

/**
 * User Profile Service
 * 
 * This service handles all user profile-related API calls.
 * Currently using mock responses - uncomment real API calls when CORS is configured.
 */

/**
 * Get User Profile
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async (token) => {
  try {
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE), {
    //   method: 'GET',
    //   headers: getAuthHeaders(token),
    // });
    // 
    // if (!response.ok) {
    //   throw new Error('Failed to fetch user profile');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Extract mock user data from token (in real implementation, backend validates token)
    const isPremium = token.includes('premium');
    
    return {
      id: isPremium ? "clx1234567890" : "clx0987654321",
      name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
      email: isPremium ? "premium@jpj.com" : "free@jpj.com",
      tier: isPremium ? "PREMIUM" : "FREE",
      role: "USER",
      image: null
    };
  } catch (error) {
    console.error('Get user profile error:', error);
    throw error;
  }
};

/**
 * Update User Profile
 * @param {string} token - JWT token
 * @param {Object} profileData - Profile update data
 * @param {string} [profileData.name] - User name
 * @param {string} [profileData.image] - User avatar URL
 * @returns {Promise<Object>} Updated user profile
 */
export const updateUserProfile = async (token, profileData) => {
  try {
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USER.PROFILE), {
    //   method: 'PUT',
    //   headers: getAuthHeaders(token),
    //   body: JSON.stringify(profileData),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to update profile');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Extract mock user data from token and merge with updates
    const isPremium = token.includes('premium');
    const currentUser = {
      id: isPremium ? "clx1234567890" : "clx0987654321",
      name: isPremium ? "Ahmad Faizal" : "Siti Aminah",
      email: isPremium ? "premium@jpj.com" : "free@jpj.com",
      tier: isPremium ? "PREMIUM" : "FREE",
      role: "USER",
      image: null
    };
    
    const updatedUser = {
      ...currentUser,
      ...profileData
    };
    
    return {
      success: true,
      user: updatedUser
    };
  } catch (error) {
    console.error('Update user profile error:', error);
    throw error;
  }
};

/**
 * Change Password
 * @param {string} token - JWT token
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} API response
 */
export const changePassword = async (token, passwordData) => {
  try {
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.USER.CHANGE_PASSWORD), {
    //   method: 'POST',
    //   headers: getAuthHeaders(token),
    //   body: JSON.stringify(passwordData),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to change password');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    // Simulate incorrect current password for demo
    if (passwordData.currentPassword === 'wrongpassword') {
      throw new Error('Current password is incorrect');
    }
    
    return {
      success: true,
      message: "Password changed successfully"
    };
  } catch (error) {
    console.error('Change password error:', error);
    throw error;
  }
};