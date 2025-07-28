/**
 * Logger Utility
 * 
 * Centralized logging system with different levels and structured output.
 * Can be easily configured for different environments.
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

// Set log level based on environment
const CURRENT_LOG_LEVEL = __DEV__ ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

/**
 * Format log message with timestamp and context
 * @param {string} level - Log level
 * @param {string} context - Context (service name, screen name, etc.)
 * @param {string} message - Log message
 * @param {any} data - Additional data to log
 */
const formatLog = (level, context, message, data) => {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}] [${context}]`;
  
  if (data) {
    console.log(`${prefix} ${message}`, data);
  } else {
    console.log(`${prefix} ${message}`);
  }
};

export const logger = {
  /**
   * Log error messages
   * @param {string} context - Context identifier
   * @param {string} message - Error message
   * @param {any} error - Error object or additional data
   */
  error: (context, message, error = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      formatLog('ERROR', context, message, error);
    }
  },

  /**
   * Log warning messages
   * @param {string} context - Context identifier
   * @param {string} message - Warning message
   * @param {any} data - Additional data
   */
  warn: (context, message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      formatLog('WARN', context, message, data);
    }
  },

  /**
   * Log info messages
   * @param {string} context - Context identifier
   * @param {string} message - Info message
   * @param {any} data - Additional data
   */
  info: (context, message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      formatLog('INFO', context, message, data);
    }
  },

  /**
   * Log debug messages (only in development)
   * @param {string} context - Context identifier
   * @param {string} message - Debug message
   * @param {any} data - Additional data
   */
  debug: (context, message, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      formatLog('DEBUG', context, message, data);
    }
  },

  /**
   * Log API requests
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {any} data - Request data
   */
  apiRequest: (method, url, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      formatLog('API-REQ', 'HTTP', `${method} ${url}`, data);
    }
  },

  /**
   * Log API responses
   * @param {string} method - HTTP method
   * @param {string} url - Request URL
   * @param {number} status - Response status
   * @param {any} data - Response data
   */
  apiResponse: (method, url, status, data = null) => {
    const level = status >= 400 ? 'ERROR' : 'DEBUG';
    if (CURRENT_LOG_LEVEL >= (status >= 400 ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG)) {
      formatLog('API-RES', 'HTTP', `${method} ${url} - ${status}`, data);
    }
  },

  /**
   * Log screen navigation
   * @param {string} screenName - Screen name
   * @param {any} params - Navigation parameters
   */
  navigation: (screenName, params = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      formatLog('NAV', 'Screen', `Navigated to ${screenName}`, params);
    }
  },

  /**
   * Log user actions
   * @param {string} action - Action name
   * @param {any} data - Action data
   */
  userAction: (action, data = null) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      formatLog('USER', 'Action', action, data);
    }
  }
};