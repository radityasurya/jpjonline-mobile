/**
 * Bookmark Service
 * 
 * Manages note bookmarks using localStorage.
 * Provides functionality to add, remove, and check bookmark status.
 */

import { logger } from '../utils/logger.js';

// Storage key for bookmarks
const BOOKMARKS_STORAGE_KEY = '@jpj_bookmarks_v1';

/**
 * Bookmark Service Class
 */
class BookmarkService {
  constructor() {
    this.isSupported = this.checkLocalStorageSupport();
  }

  /**
   * Check if localStorage is supported
   */
  checkLocalStorageSupport() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      logger.error('BookmarkService', 'localStorage not supported', error);
      return false;
    }
  }

  /**
   * Safe localStorage operations
   */
  safeGetItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error('BookmarkService', 'Failed to get item from localStorage', { key, error });
      return null;
    }
  }

  safeSetItem(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      logger.error('BookmarkService', 'Failed to set item in localStorage', { key, error });
      return false;
    }
  }

  /**
   * Get all bookmarked note IDs
   * @returns {string[]} Array of bookmarked note IDs
   */
  getBookmarks() {
    if (!this.isSupported) {
      logger.warn('BookmarkService', 'localStorage not supported, returning empty bookmarks');
      return [];
    }

    const bookmarks = this.safeGetItem(BOOKMARKS_STORAGE_KEY);
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

    const bookmarks = this.getBookmarks();
    return bookmarks.includes(noteId);
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
      logger.warn('BookmarkService', 'localStorage not supported, cannot add bookmark');
      return false;
    }

    try {
      const bookmarks = this.getBookmarks();
      
      if (!bookmarks.includes(noteId)) {
        bookmarks.push(noteId);
        const success = this.safeSetItem(BOOKMARKS_STORAGE_KEY, bookmarks);
        
        if (success) {
          logger.info('BookmarkService', 'Bookmark added successfully', { noteId });
          return true;
        }
      } else {
        logger.debug('BookmarkService', 'Note already bookmarked', { noteId });
        return true; // Already bookmarked, consider it success
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to add bookmark', { noteId, error });
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
      logger.warn('BookmarkService', 'localStorage not supported, cannot remove bookmark');
      return false;
    }

    try {
      const bookmarks = this.getBookmarks();
      const filteredBookmarks = bookmarks.filter(id => id !== noteId);
      
      if (filteredBookmarks.length !== bookmarks.length) {
        const success = this.safeSetItem(BOOKMARKS_STORAGE_KEY, filteredBookmarks);
        
        if (success) {
          logger.info('BookmarkService', 'Bookmark removed successfully', { noteId });
          return true;
        }
      } else {
        logger.debug('BookmarkService', 'Note was not bookmarked', { noteId });
        return true; // Not bookmarked, consider removal success
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to remove bookmark', { noteId, error });
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
      logger.warn('BookmarkService', 'Invalid notes array provided to getBookmarkedNotes');
      return [];
    }

    const bookmarkIds = this.getBookmarks();
    return notes.filter(note => bookmarkIds.includes(note.id));
  }

  /**
   * Clear all bookmarks
   * @returns {boolean} Success status
   */
  clearAllBookmarks() {
    if (!this.isSupported) {
      logger.warn('BookmarkService', 'localStorage not supported, cannot clear bookmarks');
      return false;
    }

    try {
      localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
      logger.info('BookmarkService', 'All bookmarks cleared successfully');
      return true;
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
    const bookmarks = this.getBookmarks();
    
    return {
      totalBookmarks: bookmarks.length,
      lastBookmarked: null, // Could be enhanced to track timestamps
      isEmpty: bookmarks.length === 0
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
      count: bookmarks.length
    };
  }

  /**
   * Import bookmarks from backup
   * @param {Object} importData - Import data object
   * @returns {boolean} Success status
   */
  importBookmarks(importData) {
    if (!importData || !Array.isArray(importData.bookmarks)) {
      logger.error('BookmarkService', 'Invalid import data structure');
      return false;
    }

    try {
      const success = this.safeSetItem(BOOKMARKS_STORAGE_KEY, importData.bookmarks);
      
      if (success) {
        logger.info('BookmarkService', 'Bookmarks imported successfully', { 
          count: importData.bookmarks.length 
        });
        return true;
      }
    } catch (error) {
      logger.error('BookmarkService', 'Failed to import bookmarks', error);
    }
    
    return false;
  }
}

// Create singleton instance
const bookmarkService = new BookmarkService();

// Export service methods
export const {
  getBookmarks,
  isBookmarked,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  getBookmarkedNotes,
  clearAllBookmarks,
  getBookmarkStats,
  exportBookmarks,
  importBookmarks
} = bookmarkService;

// Export the service instance
export default bookmarkService;

/**
 * Usage Examples:
 * 
 * // Check if note is bookmarked
 * const bookmarked = bookmarkService.isBookmarked('note-123');
 * 
 * // Toggle bookmark
 * const newStatus = bookmarkService.toggleBookmark('note-123');
 * 
 * // Get all bookmarks
 * const bookmarks = bookmarkService.getBookmarks();
 * 
 * // Get bookmarked notes from a list
 * const bookmarkedNotes = bookmarkService.getBookmarkedNotes(allNotes);
 */