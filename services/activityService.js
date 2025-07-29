/**
 * Activity Tracking Service
 * 
 * Manages user activity tracking using MMKV storage on mobile.
 * Disabled on web platform.
 */

import { Platform } from 'react-native';
import storageService from './storage.js';
import { logger } from '../utils/logger.js';

// Storage key for activities
const ACTIVITY_STORAGE_KEY = '@jpj_activities_v1';
const MAX_ACTIVITIES = 50; // Keep last 50 activities for performance

/**
 * Activity Types
 */
export const ACTIVITY_TYPES = {
  NOTE_VIEWED: 'note_viewed',
  NOTE_BOOKMARKED: 'note_bookmarked',
  NOTE_UNBOOKMARKED: 'note_unbookmarked',
  EXAM_STARTED: 'exam_started',
  EXAM_COMPLETED: 'exam_completed',
  EXAM_PASSED: 'exam_passed',
  EXAM_FAILED: 'exam_failed',
  SESSION_STARTED: 'session_started',
  SESSION_ENDED: 'session_ended',
  QUICK_ACTION: 'quick_action'
};

/**
 * Activity Service Class
 */
class ActivityService {
  constructor() {
    this.isSupported = storageService.isAvailable();
    this.platform = Platform.OS;
  }

  /**
   * Get all activities
   * @returns {Array} Array of activity objects
   */
  async getActivities() {
    if (!this.isSupported) {
      logger.warn('ActivityService', `Activity tracking not supported on ${this.platform} platform`);
      return [];
    }

    const activities = await storageService.getItem(ACTIVITY_STORAGE_KEY);
    return Array.isArray(activities) ? activities : [];
  }

  /**
   * Add new activity
   * @param {string} type - Activity type from ACTIVITY_TYPES
   * @param {Object} data - Activity data
   * @returns {Object|null} Created activity or null if failed
   */
  async addActivity(type, data = {}) {
    if (!type) {
      logger.warn('ActivityService', 'No activity type provided');
      return null;
    }

    if (!this.isSupported) {
      logger.warn('ActivityService', `Activity tracking not supported on ${this.platform} platform`);
      return null;
    }

    try {
      const activities = await this.getActivities();
      
      const newActivity = {
        id: Date.now().toString(),
        type: type,
        timestamp: new Date().toISOString(),
        data: data,
        userId: data.userId || 'anonymous'
      };

      // Add to beginning of array (most recent first)
      activities.unshift(newActivity);

      // Keep only the last MAX_ACTIVITIES items
      const trimmedActivities = activities.slice(0, MAX_ACTIVITIES);

      const success = await storageService.setItem(ACTIVITY_STORAGE_KEY, trimmedActivities);
      
      if (success) {
        logger.debug('ActivityService', 'Activity added successfully', { type, activityId: newActivity.id });
        return newActivity;
      }
    } catch (error) {
      logger.error('ActivityService', 'Failed to add activity', { type, error });
    }
    
    return null;
  }

  /**
   * Get recent activities
   * @param {number} limit - Number of activities to return
   * @returns {Array} Array of recent activities
   */
  async getRecentActivities(limit = 10) {
    const activities = await this.getActivities();
    return activities.slice(0, limit);
  }

  /**
   * Get activities by type
   * @param {string} type - Activity type to filter by
   * @param {number} limit - Number of activities to return
   * @returns {Array} Array of filtered activities
   */
  async getActivitiesByType(type, limit = 10) {
    const activities = await this.getActivities();
    return activities.filter(activity => activity.type === type).slice(0, limit);
  }

  /**
   * Get activities for a specific date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Array} Array of activities in date range
   */
  getActivitiesInRange(startDate, endDate) {
    const activities = this.getActivities();
    return activities.filter(activity => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  /**
   * Get today's activities
   * @returns {Array} Array of today's activities
   */
  getTodaysActivities() {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getActivitiesInRange(startOfDay, endOfDay);
  }

  /**
   * Calculate activity streak (consecutive days with activity)
   * @returns {number} Number of consecutive days with activity
   */
  calculateActivityStreak() {
    if (!this.isSupported) {
      return 0;
    }

    const activities = this.getActivities();
    if (activities.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Check each day going backwards
    for (let i = 0; i < 365; i++) { // Max 365 days to prevent infinite loop
      const dayStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
      const dayEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59);
      
      const dayActivities = activities.filter(activity => {
        const activityDate = new Date(activity.timestamp);
        return activityDate >= dayStart && activityDate <= dayEnd;
      });

      if (dayActivities.length > 0) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Get activity statistics
   * @returns {Object} Activity statistics
   */
  async getActivityStats() {
    if (!this.isSupported) {
      return {
        totalActivities: 0,
        todaysActivities: 0,
        streak: 0,
        lastActivity: null,
        typeBreakdown: {},
        supported: false,
        platform: this.platform
      };
    }

    const activities = await this.getActivities();
    const todaysActivities = this.getTodaysActivities();
    
    const stats = {
      totalActivities: activities.length,
      todaysActivities: todaysActivities.length,
      streak: this.calculateActivityStreak(),
      lastActivity: activities.length > 0 ? activities[0].timestamp : null,
      typeBreakdown: {},
      supported: true,
      platform: this.platform
    };

    // Calculate type breakdown
    activities.forEach(activity => {
      stats.typeBreakdown[activity.type] = (stats.typeBreakdown[activity.type] || 0) + 1;
    });

    return stats;
  }

  /**
   * Clear all activities
   * @returns {boolean} Success status
   */
  async clearAllActivities() {
    if (!this.isSupported) {
      logger.warn('ActivityService', `Activity tracking not supported on ${this.platform} platform`);
      return false;
    }

    try {
      const success = await storageService.removeItem(ACTIVITY_STORAGE_KEY);
      if (success) {
        logger.info('ActivityService', 'All activities cleared successfully');
      }
      return success;
    } catch (error) {
      logger.error('ActivityService', 'Failed to clear activities', error);
      return false;
    }
  }

  /**
   * Format activity for display
   * @param {Object} activity - Activity object
   * @returns {Object} Formatted activity with display properties
   */
  formatActivityForDisplay(activity) {
    const timeAgo = this.getTimeAgo(activity.timestamp);
    
    let title = 'Unknown Activity';
    let description = '';
    let icon = '📝';

    switch (activity.type) {
      case ACTIVITY_TYPES.NOTE_VIEWED:
        title = activity.data.noteTitle || 'Viewed a note';
        description = `Read: ${title}`;
        icon = '📖';
        break;
      
      case ACTIVITY_TYPES.NOTE_BOOKMARKED:
        title = activity.data.noteTitle || 'Bookmarked a note';
        description = `Bookmarked: ${title}`;
        icon = '🔖';
        break;
      
      case ACTIVITY_TYPES.NOTE_UNBOOKMARKED:
        title = activity.data.noteTitle || 'Removed bookmark';
        description = `Removed bookmark: ${title}`;
        icon = '📑';
        break;
      
      case ACTIVITY_TYPES.EXAM_STARTED:
        title = activity.data.examTitle || 'Started an exam';
        description = `Started: ${title}`;
        icon = '🎯';
        break;
      
      case ACTIVITY_TYPES.EXAM_COMPLETED:
        title = activity.data.examTitle || 'Completed an exam';
        description = `Completed: ${title}`;
        if (activity.data.score) {
          description += ` (${activity.data.score}%)`;
        }
        icon = activity.data.passed ? '✅' : '❌';
        break;
      
      case ACTIVITY_TYPES.SESSION_STARTED:
        title = 'Started learning session';
        description = 'Logged in to JPJOnline';
        icon = '🚀';
        break;
      
      case ACTIVITY_TYPES.QUICK_ACTION:
        title = activity.data.action || 'Quick action';
        description = `Used: ${title}`;
        icon = '⚡';
        break;
      
      default:
        title = activity.type.replace(/_/g, ' ').toLowerCase();
        description = title.charAt(0).toUpperCase() + title.slice(1);
    }

    return {
      ...activity,
      displayTitle: title,
      displayDescription: description,
      displayIcon: icon,
      timeAgo: timeAgo,
      isClickable: this.isActivityClickable(activity)
    };
  }

  /**
   * Check if activity is clickable (can navigate somewhere)
   * @param {Object} activity - Activity object
   * @returns {boolean} Whether activity is clickable
   */
  isActivityClickable(activity) {
    if (!this.isSupported) {
      return false;
    }

    return [
      ACTIVITY_TYPES.NOTE_VIEWED,
      ACTIVITY_TYPES.NOTE_BOOKMARKED,
      ACTIVITY_TYPES.EXAM_COMPLETED
    ].includes(activity.type) && (activity.data.noteId || activity.data.examId);
  }

  /**
   * Get human-readable time ago string
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Human-readable time ago
   */
  getTimeAgo(timestamp) {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffMs = now - activityTime;
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return activityTime.toLocaleDateString();
    }
  }

  /**
   * Export activities for backup
   * @returns {Object} Export data
   */
  exportActivities() {
    const activities = this.getActivities();
    
    return {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      activities: activities,
      count: activities.length,
      stats: this.getActivityStats(),
      platform: this.platform,
      supported: this.isSupported
    };
  }

  /**
   * Import activities from backup
   * @param {Object} importData - Import data object
   * @returns {boolean} Success status
   */
  importActivities(importData) {
    if (!this.isSupported) {
      logger.warn('ActivityService', `Activity tracking not supported on ${this.platform} platform`);
      return false;
    }

    if (!importData || !Array.isArray(importData.activities)) {
      logger.error('ActivityService', 'Invalid import data structure');
      return false;
    }

    try {
      const success = storageService.setItem(ACTIVITY_STORAGE_KEY, importData.activities);
      
      if (success) {
        logger.info('ActivityService', 'Activities imported successfully', { 
          count: importData.activities.length 
        });
        return true;
      }
    } catch (error) {
      logger.error('ActivityService', 'Failed to import activities', error);
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
        activityTracking: this.isSupported,
        persistence: this.isSupported,
        encryption: this.isSupported
      }
    };
  }
}

// Create singleton instance
const activityService = new ActivityService();

// Export service methods
export const {
  getActivities,
  addActivity,
  getRecentActivities,
  getActivitiesByType,
  getActivitiesInRange,
  getTodaysActivities,
  calculateActivityStreak,
  getActivityStats,
  clearAllActivities,
  formatActivityForDisplay,
  isActivityClickable,
  getTimeAgo,
  exportActivities,
  importActivities,
  getPlatformInfo
} = activityService;

// Export the service instance
export default activityService;