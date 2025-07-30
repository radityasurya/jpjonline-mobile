import { Platform } from 'react-native';
import { logger } from '../utils/logger.js';

// Import AsyncStorage only on mobile platforms
let AsyncStorage = null;
if (Platform.OS !== 'web') {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
}

/**
 * Universal Storage Service
 * Uses AsyncStorage on mobile, localStorage on web
 */
class StorageService {
  constructor() {
    this.isSupported = true; // Support both web and mobile
    this.platform = Platform.OS;
    this.initializeStorage();
  }

  /**
   * Initialize storage
   */
  async initializeStorage() {
    try {
      if (Platform.OS === 'web') {
        // Test localStorage functionality
        localStorage.setItem('test-key', 'test-value');
        localStorage.removeItem('test-key');
        logger.info('Storage', 'localStorage initialized successfully');
      } else {
        // Test AsyncStorage functionality
        await AsyncStorage.setItem('test-key', 'test-value');
        await AsyncStorage.removeItem('test-key');
        logger.info('Storage', 'AsyncStorage initialized successfully');
      }
    } catch (error) {
      logger.error('Storage', 'Failed to initialize storage', error);
      this.isSupported = false;
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable() {
    return this.isSupported;
  }

  /**
   * Get item from storage
   */
  async getItem(key) {
    try {
      if (Platform.OS === 'web') {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      } else {
        const value = await AsyncStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      logger.error('Storage', 'Failed to get item', { key, error });
      return null;
    }
  }

  /**
   * Set item in storage
   */
  async setItem(key, value) {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } else {
        await AsyncStorage.setItem(key, JSON.stringify(value));
        return true;
      }
    } catch (error) {
      logger.error('Storage', 'Failed to set item', { key, error });
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key) {
    try {
      if (Platform.OS === 'web') {
        localStorage.removeItem(key);
        return true;
      } else {
        await AsyncStorage.removeItem(key);
        return true;
      }
    } catch (error) {
      logger.error('Storage', 'Failed to remove item', { key, error });
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clear() {
    try {
      if (Platform.OS === 'web') {
        localStorage.clear();
        return true;
      } else {
        await AsyncStorage.clear();
        return true;
      }
    } catch (error) {
      logger.error('Storage', 'Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys() {
    try {
      if (Platform.OS === 'web') {
        return Object.keys(localStorage);
      } else {
        return await AsyncStorage.getAllKeys();
      }
    } catch (error) {
      logger.error('Storage', 'Failed to get all keys', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  async hasKey(key) {
    try {
      if (Platform.OS === 'web') {
        return localStorage.getItem(key) !== null;
      } else {
        const value = await AsyncStorage.getItem(key);
        return value !== null;
      }
    } catch (error) {
      logger.error('Storage', 'Failed to check key existence', { key, error });
      return false;
    }
  }

  /**
   * Get storage size info
   */
  async getStorageInfo() {
    try {
      const keys = await this.getAllKeys();
      return {
        supported: true,
        platform: this.platform,
        storageType: Platform.OS === 'web' ? 'localStorage' : 'AsyncStorage',
        keyCount: keys.length,
        keys: keys,
      };
    } catch (error) {
      logger.error('Storage', 'Failed to get storage info', error);
      return {
        supported: false,
        platform: this.platform,
        error: error.message,
      };
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;
