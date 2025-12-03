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
  }

  /**
   * Get all bookmarked note IDs
   * @returns {string[]} Array of bookmarked note IDs
   */
  getBookmarks() {
    if (!this.isSupported) {
      logger.warn(
        'BookmarkService',
        `Bookmarks not supported on ${this.platform} platform`,
      );
      return [];
    }

    const bookmarks = storageService.getItem(BOOKMARKS_STORAGE_KEY);
    return Array.isArray(bookmarks) ? bookmarks : [];
  }

  /**
   * Check if a note is bookmarked
   * @param {string} noteId - Note ID to check
   * @returns {boolean} Whether the note is bookmarked
   */
  isBookmarked(noteId) {
    if (!noteId) {
      logger.warn('BookmarkService', 'No noteId provided to isBookmarked');
      return false;
    }

    if (!this.isSupported) {
      return false;
    }

    const bookmarks = this.getBookmarks();
    return bookmarks.includes(noteId);
  }

  /**
   * Update bookmark statistics in progress service
   */
  updateBookmarkStats() {
    if (!this.isSupported) {
      return;
    }

    try {
      // Lazy load progress service to avoid circular dependency
      const progressService = require('./progressService.js').default;
      if (progressService && progressService.updateBookmarkCount) {
        const bookmarkCount = this.getBookmarks().length;
        progressService.updateBookmarkCount(bookmarkCount);
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
   * @returns {boolean} Success status
   */
  addBookmark(noteId) {
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
      const bookmarks = this.getBookmarks();

      if (!bookmarks.includes(noteId)) {
        bookmarks.push(noteId);
        const success = storageService.setItem(
          BOOKMARKS_STORAGE_KEY,
          bookmarks,
        );

        if (success) {
          // Update bookmark statistics
          this.updateBookmarkStats();

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
   * @returns {boolean} Success status
   */
  removeBookmark(noteId) {
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
      const bookmarks = this.getBookmarks();
      const filteredBookmarks = bookmarks.filter((id) => id !== noteId);

      if (filteredBookmarks.length !== bookmarks.length) {
        const success = storageService.setItem(
          BOOKMARKS_STORAGE_KEY,
          filteredBookmarks,
        );

        if (success) {
          // Update bookmark statistics
          this.updateBookmarkStats();

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
   * @returns {boolean} New bookmark status (true if now bookmarked, false if removed)
   */
  toggleBookmark(noteId) {
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

    const isCurrentlyBookmarked = this.isBookmarked(noteId);

    if (isCurrentlyBookmarked) {
      const success = this.removeBookmark(noteId);
      return success ? false : isCurrentlyBookmarked; // Return false if successfully removed
    } else {
      const success = this.addBookmark(noteId);
      return success ? true : isCurrentlyBookmarked; // Return true if successfully added
    }
  }

  /**
   * Get bookmarked notes from a list of notes
   * @param {Array} notes - Array of note objects
   * @returns {Array} Array of bookmarked notes
   */
  getBookmarkedNotes(notes) {
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

    const bookmarkIds = this.getBookmarks();
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
        this.updateBookmarkStats();
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
   * @returns {boolean} Success status
   */
  importBookmarks(importData) {
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
        this.updateBookmarkStats();
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

// Export the service instance
export default bookmarkService;
