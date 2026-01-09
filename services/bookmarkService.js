/**
 * Bookmark Service
 *
 * Manages note bookmarks using MMKV storage on mobile.
 * Disabled on web platform.
 */

import { Platform } from 'react-native';
import storageService from './storage.js';
import { logger } from '../utils/logger.js';

// Storage key for bookmarks
const BOOKMARKS_STORAGE_KEY = '@jpj_bookmarks_v1';

/**
 * Bookmark Service Class
 */
class BookmarkService {
  constructor() {
    this.isSupported = storageService.isAvailable();
    this.platform = Platform.OS;
    this.listeners = [];
  }

  /**
   * Subscribe to bookmark changes
   * @param {Function} callback - Callback function to call when bookmarks change
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  /**
   * Notify all listeners of bookmark changes
   */
  notifyListeners() {
    this.listeners.forEach(callback => {
      try {
        callback();
      } catch (error) {
        logger.error('BookmarkService', 'Error in listener callback', error);
      }
    });
  }

  /**
   * Get all bookmarked note IDs
   * @returns {Promise<string[]>} Array of bookmarked note IDs
   */
  async getBookmarks() {
    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return [];
    }

    const bookmarks = await storageService.getItem(BOOKMARKS_STORAGE_KEY);
    return Array.isArray(bookmarks) ? bookmarks : [];
  }

  /**
   * Check if a note is bookmarked
   * @param {string} noteId - Note ID to check
   * @returns {Promise<boolean>} Whether the note is bookmarked
   */
  async isBookmarked(noteId) {
    if (!noteId) {
      logger.warn('BookmarkService', 'No noteId provided to isBookmarked');
      return false;
    }

    if (!this.isSupported) {
      return false;
    }

    const bookmarks = await this.getBookmarks();
    return bookmarks.includes(noteId);
  }

  /**
   * Update bookmark statistics in progress service
   */
  async updateBookmarkStats() {
    if (!this.isSupported) {
      return;
    }

    try {
      // Lazy load progress service to avoid circular dependency
      const progressService = require('./progressService.js').default;
      if (progressService && progressService.updateBookmarkCount) {
        const bookmarks = await this.getBookmarks();
        const bookmarkCount = bookmarks.length;
        await progressService.updateBookmarkCount(bookmarkCount);
        logger.debug('BookmarkService', 'Updated bookmark stats', {
          count: bookmarkCount,
        });
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to update bookmark stats', error);
    }
  }

  /**
   * Add a note to bookmarks
   * @param {string} noteId - Note ID to bookmark
   * @returns {Promise<boolean>} Success status
   */
  async addBookmark(noteId) {
    if (!noteId) {
      logger.warn('BookmarkService', 'No noteId provided to addBookmark');
      return false;
    }

    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return false;
    }

    try {
      const bookmarks = await this.getBookmarks();

      if (!bookmarks.includes(noteId)) {
        bookmarks.push(noteId);
        
        logger.debug('BookmarkService', 'Saving bookmark to storage', {
          noteId,
          bookmarkCount: bookmarks.length,
        });
        
        const success = await storageService.setItem(
          BOOKMARKS_STORAGE_KEY,
          bookmarks,
        );

        if (success) {
          logger.debug('BookmarkService', 'Bookmark saved to storage successfully', { noteId });
          
          // Update bookmark statistics AFTER saving to storage
          await this.updateBookmarkStats();

          // Notify listeners of bookmark change
          this.notifyListeners();

          // Track activity
          try {
            const activityService = require('./activityService.js').default;
            if (activityService) {
              activityService.addActivity('note_bookmarked', {
                noteId: noteId,
                noteTitle: 'Note', // Could be enhanced to include actual title
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            logger.error(
              'BookmarkService',
              'Failed to track bookmark activity',
              error,
            );
          }

          logger.info('BookmarkService', 'Bookmark added successfully', {
            noteId,
          });
          return true;
        } else {
          logger.error('BookmarkService', 'Failed to save bookmark to storage', { noteId });
        }
      } else {
        logger.debug('BookmarkService', 'Note already bookmarked', { noteId });
        return true; // Already bookmarked, consider it success
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to add bookmark', {
        noteId,
        error,
      });
    }

    return false;
  }

  /**
   * Remove a note from bookmarks
   * @param {string} noteId - Note ID to remove from bookmarks
   * @returns {Promise<boolean>} Success status
   */
  async removeBookmark(noteId) {
    if (!noteId) {
      logger.warn('BookmarkService', 'No noteId provided to removeBookmark');
      return false;
    }

    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return false;
    }

    try {
      const bookmarks = await this.getBookmarks();
      const filteredBookmarks = bookmarks.filter((id) => id !== noteId);

      if (filteredBookmarks.length !== bookmarks.length) {
        logger.debug('BookmarkService', 'Removing bookmark from storage', {
          noteId,
          bookmarkCount: filteredBookmarks.length,
        });
        
        const success = await storageService.setItem(
          BOOKMARKS_STORAGE_KEY,
          filteredBookmarks,
        );

        if (success) {
          logger.debug('BookmarkService', 'Bookmark removed from storage successfully', { noteId });
          
          // Update bookmark statistics AFTER saving to storage
          await this.updateBookmarkStats();

          // Notify listeners of bookmark change
          this.notifyListeners();

          // Track activity
          try {
            const activityService = require('./activityService.js').default;
            if (activityService) {
              activityService.addActivity('note_unbookmarked', {
                noteId: noteId,
                noteTitle: 'Note', // Could be enhanced to include actual title
                timestamp: new Date().toISOString(),
              });
            }
          } catch (error) {
            logger.error(
              'BookmarkService',
              'Failed to track unbookmark activity',
              error,
            );
          }

          logger.info('BookmarkService', 'Bookmark removed successfully', {
            noteId,
          });
          return true;
        } else {
          logger.error('BookmarkService', 'Failed to remove bookmark from storage', { noteId });
        }
      } else {
        logger.debug('BookmarkService', 'Note was not bookmarked', { noteId });
        return true; // Not bookmarked, consider removal success
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to remove bookmark', {
        noteId,
        error,
      });
    }

    return false;
  }

  /**
   * Toggle bookmark status for a note
   * @param {string} noteId - Note ID to toggle
   * @returns {Promise<boolean>} New bookmark status (true if now bookmarked, false if removed)
   */
  async toggleBookmark(noteId) {
    if (!noteId) {
      logger.warn('BookmarkService', 'No noteId provided to toggleBookmark');
      return false;
    }

    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return false;
    }

    const isCurrentlyBookmarked = await this.isBookmarked(noteId);
    logger.debug('BookmarkService', 'toggleBookmark called', {
      noteId,
      isCurrentlyBookmarked,
    });

    if (isCurrentlyBookmarked) {
      const success = await this.removeBookmark(noteId);
      logger.debug('BookmarkService', 'removeBookmark result', { success, noteId });
      return success ? false : isCurrentlyBookmarked; // Return false if successfully removed
    } else {
      const success = await this.addBookmark(noteId);
      logger.debug('BookmarkService', 'addBookmark result', { success, noteId });
      return success ? true : isCurrentlyBookmarked; // Return true if successfully added
    }
  }

  /**
   * Get bookmarked notes from a list of notes
   * @param {Array} notes - Array of note objects
   * @returns {Promise<Array>} Array of bookmarked notes
   */
  async getBookmarkedNotes(notes) {
    if (!Array.isArray(notes)) {
      logger.warn(
        'BookmarkService',
        'Invalid notes array provided to getBookmarkedNotes',
      );
      return [];
    }

    if (!this.isSupported) {
      return [];
    }

    const bookmarkIds = await this.getBookmarks();
    return notes.filter((note) => bookmarkIds.includes(note.id));
  }

  /**
   * Clear all bookmarks
   * @returns {boolean} Success status
   */
  async clearAllBookmarks() {
    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return false;
    }

    try {
      const success = storageService.removeItem(BOOKMARKS_STORAGE_KEY);
      if (success) {
        await this.updateBookmarkStats();
        this.notifyListeners();
        logger.info('BookmarkService', 'All bookmarks cleared successfully');
      }
      return success;
    } catch (error) {
      logger.error('BookmarkService', 'Failed to clear bookmarks', error);
      return false;
    }
  }

  /**
   * Get bookmark statistics
   * @returns {Object} Bookmark statistics
   */
  getBookmarkStats() {
    if (!this.isSupported) {
      return {
        totalBookmarks: 0,
        lastBookmarked: null,
        isEmpty: true,
        supported: false,
        platform: this.platform,
      };
    }

    const bookmarks = this.getBookmarks();

    return {
      totalBookmarks: bookmarks.length,
      lastBookmarked: null, // Could be enhanced to track timestamps
      isEmpty: bookmarks.length === 0,
      supported: true,
      platform: this.platform,
    };
  }

  /**
   * Export bookmarks for backup
   * @returns {Object} Export data
   */
  exportBookmarks() {
    const bookmarks = this.getBookmarks();

    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      bookmarks: bookmarks,
      count: bookmarks.length,
      platform: this.platform,
      supported: this.isSupported,
    };
  }

  /**
   * Import bookmarks from backup
   * @param {Object} importData - Import data object
   * @returns {Promise<boolean>} Success status
   */
  async importBookmarks(importData) {
    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return false;
    }

    if (!importData || !Array.isArray(importData.bookmarks)) {
      logger.error('BookmarkService', 'Invalid import data structure');
      return false;
    }

    try {
      const success = storageService.setItem(
        BOOKMARKS_STORAGE_KEY,
        importData.bookmarks,
      );

      if (success) {
        await this.updateBookmarkStats();
        this.notifyListeners();
        logger.info('BookmarkService', 'Bookmarks imported successfully', {
          count: importData.bookmarks.length,
        });
        return true;
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to import bookmarks', error);
    }

    return false;
  }

  /**
   * Get platform support info
   * @returns {Object} Platform support information
   */
  getPlatformInfo() {
    return {
      platform: this.platform,
      supported: this.isSupported,
      storageType: this.isSupported ? 'MMKV' : 'None',
      features: {
        bookmarks: this.isSupported,
        persistence: this.isSupported,
        encryption: this.isSupported,
      },
    };
  }
}

// Create singleton instance
const bookmarkService = new BookmarkService();

// Export service methods with proper binding
export const getBookmarks = bookmarkService.getBookmarks.bind(bookmarkService);
export const isBookmarked = bookmarkService.isBookmarked.bind(bookmarkService);
export const addBookmark = bookmarkService.addBookmark.bind(bookmarkService);
export const removeBookmark =
  bookmarkService.removeBookmark.bind(bookmarkService);
export const toggleBookmark =
  bookmarkService.toggleBookmark.bind(bookmarkService);
export const getBookmarkedNotes =
  bookmarkService.getBookmarkedNotes.bind(bookmarkService);
export const clearAllBookmarks =
  bookmarkService.clearAllBookmarks.bind(bookmarkService);
export const getBookmarkStats =
  bookmarkService.getBookmarkStats.bind(bookmarkService);
export const exportBookmarks =
  bookmarkService.exportBookmarks.bind(bookmarkService);
export const importBookmarks =
  bookmarkService.importBookmarks.bind(bookmarkService);
export const getPlatformInfo =
  bookmarkService.getPlatformInfo.bind(bookmarkService);
export const subscribe = bookmarkService.subscribe.bind(bookmarkService);

// Export the service instance
export default bookmarkService;
