import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger.js';

/**
 * Universal Storage Service
 * Uses AsyncStorage on mobile, disabled on web
 */
class StorageService {
  constructor() {
    this.isSupported = Platform.OS !== 'web';
    this.platform = Platform.OS;
    this.initializeStorage();
  }

  /**
   * Initialize storage
   */
  async initializeStorage() {
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return;
    }

    try {
      // Test AsyncStorage functionality
      await AsyncStorage.setItem('test-key', 'test-value');
      await AsyncStorage.removeItem('test-key');
      logger.info('Storage', 'AsyncStorage initialized successfully');
    } catch (error) {
      logger.error('Storage', 'Failed to initialize AsyncStorage', error);
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
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return null;
    }

    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Storage', 'Failed to get item', { key, error });
      return null;
    }
  }

  /**
   * Set item in storage
   */
  async setItem(key, value) {
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return false;
    }

    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('Storage', 'Failed to set item', { key, error });
      return false;
    }
  }

  /**
   * Remove item from storage
   */
  async removeItem(key) {
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return false;
    }

    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      logger.error('Storage', 'Failed to remove item', { key, error });
      return false;
    }
  }

  /**
   * Clear all storage
   */
  async clear() {
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return false;
    }

    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      logger.error('Storage', 'Failed to clear storage', error);
      return false;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys() {
    if (!this.isSupported) {
      logger.warn('Storage', 'Storage not available on web platform');
      return [];
    }

    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      logger.error('Storage', 'Failed to get all keys', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  async hasKey(key) {
    if (!this.isSupported) {
      return false;
    }

    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      logger.error('Storage', 'Failed to check key existence', { key, error });
      return false;
    }
  }

  /**
   * Get storage size info
   */
  async getStorageInfo() {
    if (!this.isSupported) {
      return { supported: false, platform: this.platform };
    }

    try {
      const keys = await AsyncStorage.getAllKeys();
      return {
        supported: true,
        platform: this.platform,
        keyCount: keys.length,
        keys: keys
      };
    } catch (error) {
      logger.error('Storage', 'Failed to get storage info', error);
      return { supported: false, platform: this.platform, error: error.message };
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;