/**
 * API Helper Utilities
 * 
 * Common utilities for API interactions, error handling, and response processing.
 */

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Custom error messages from API
  if (error.message) {
    return error.message;
  }
  
  // Generic fallback
  return 'Something went wrong. Please try again later.';
};

/**
 * Check if response indicates success
 * @param {Object} response - API response object
 * @returns {boolean} Whether the response indicates success
 */
export const isSuccessResponse = (response) => {
  return response && response.success === true;
};

/**
 * Extract user data from API response
 * @param {Object} response - API response object
 * @returns {Object|null} User data or null if not found
 */
export const extractUserData = (response) => {
  if (response && response.user) {
    return response.user;
  }
  return null;
};

/**
 * Format API response for consistent handling
 * @param {Object} response - Raw API response
 * @returns {Object} Formatted response
 */
export const formatApiResponse = (response) => {
  return {
    success: response.success || false,
    data: response.user || response.data || response,
    message: response.message || null,
    error: response.error || null
  };
};

/**
 * Validate required fields in request data
 * @param {Object} data - Request data
 * @param {string[]} requiredFields - Array of required field names
 * @throws {Error} If any required field is missing
 */
export const validateRequiredFields = (data, requiredFields) => {
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
};

/**
 * Create a delay for testing purposes
 * @param {number} ms - Milliseconds to delay
 * @returns {Promise} Promise that resolves after delay
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if user has premium access
 * @param {Object} user - User object
 * @returns {boolean} Whether user has premium access
 */
export const isPremiumUser = (user) => {
  return user && user.tier === 'PREMIUM';
};

/**
 * Get user display name
 * @param {Object} user - User object
 * @returns {string} User display name
 */
export const getUserDisplayName = (user) => {
  if (!user) return 'Guest';
  return user.name || user.email || 'User';
};