/**
 * App Configuration
 * 
 * Central configuration for app behavior across different environments
 */

// Environment detection
const isDevelopment = __DEV__;
const isProduction = !__DEV__;

// Demo account configuration
const DEMO_CONFIG = {
  // Set to false to hide demo accounts in production
  // Change this to true only for development/testing builds
  showDemoAccounts: false, // PRODUCTION: Set to false for App Store/Play Store releases
  
  // Demo account credentials (only used when showDemoAccounts is true)
  accounts: {
    premium: {
      email: 'premium@jpjonline.com',
      password: 'premium123'
    },
    free: {
      email: 'user@jpjonline.com',
      password: 'user123'
    }
  }
};

// API Configuration
const API_CONFIG = {
  baseUrl: isProduction 
    ? 'https://api.jpjonline.com' 
    : 'http://localhost:3000',
  timeout: 10000,
  retryAttempts: 3
};

// Feature flags
const FEATURES = {
  enableAnalytics: isProduction,
  enableCrashReporting: isProduction,
  enableDebugLogs: isDevelopment,
  enableOfflineMode: true,
  enablePushNotifications: isProduction
};

// App metadata
const APP_INFO = {
  name: 'JPJOnline',
  version: '1.0.0',
  buildNumber: '1',
  environment: isDevelopment ? 'development' : 'production'
};

export {
  DEMO_CONFIG,
  API_CONFIG,
  FEATURES,
  APP_INFO,
  isDevelopment,
  isProduction
};

export default {
  demo: DEMO_CONFIG,
  api: API_CONFIG,
  features: FEATURES,
  app: APP_INFO,
  isDevelopment,
  isProduction
};