/**
 * Progress Tracking and Statistics Service
 *
 * Manages user progress and statistics using MMKV storage on mobile.
 * Disabled on web platform.
 */

import { Platform } from 'react-native';
import storageService from './storage.js';
import { logger } from '../utils/logger.js';

// Storage keys with versioning
const STORAGE_KEYS = {
  USER_PROGRESS: '@jpj_user_progress_v2',
  USER_STATS: '@jpj_user_stats_v2',
  ACTIVITY_LOG: '@jpj_activity_log_v2',
  ACHIEVEMENTS: '@jpj_achievements_v2',
  PREFERENCES: '@jpj_preferences_v2',
};

// Data structure version for migration support
const DATA_VERSION = '2.0.0';

/**
 * Progress Data Model
 */
const createProgressModel = (userId) => ({
  version: DATA_VERSION,
  userId: userId,
  lastUpdated: new Date().toISOString(),
  learning: {
    notesRead: 0,
    notesBookmarked: 0,
    totalReadingTime: 0, // in minutes
    categoriesExplored: [],
    completionPercentage: 0,
  },
  exams: {
    totalAttempts: 0,
    totalPassed: 0,
    totalFailed: 0,
    averageScore: 0,
    bestScore: 0,
    totalTimeSpent: 0, // in minutes
    streakDays: 0,
    lastExamDate: null,
    categoryPerformance: {}, // { categoryId: { attempts, passed, avgScore } }
  },
  achievements: {
    firstExam: false,
    firstPass: false,
    perfectScore: false,
    weekStreak: false,
    monthStreak: false,
    speedster: false, // Complete exam in under 10 minutes
    scholar: false, // Read 50+ notes
    dedicated: false, // 30+ days of activity
  },
  milestones: {
    examsCompleted: [1, 5, 10, 25, 50, 100],
    notesRead: [1, 10, 25, 50, 100],
    studyHours: [1, 5, 10, 25, 50, 100],
    perfectScores: [1, 3, 5, 10],
  },
  activity: {
    dailyGoal: 30, // minutes per day
    weeklyGoal: 3, // exams per week
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    weeklyProgress: {
      monday: 0,
      tuesday: 0,
      wednesday: 0,
      thursday: 0,
      friday: 0,
      saturday: 0,
      sunday: 0,
    },
  },
});

/**
 * Statistics Data Model
 */
const createStatsModel = (userId) => ({
  version: DATA_VERSION,
  userId: userId,
  createdAt: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
  summary: {
    totalSessions: 0,
    totalTimeSpent: 0,
    averageSessionTime: 0,
    mostActiveDay: null,
    mostActiveHour: null,
  },
  performance: {
    overallAccuracy: 0,
    improvementRate: 0,
    consistencyScore: 0,
    learningVelocity: 0,
  },
  engagement: {
    loginStreak: 0,
    featuresUsed: [],
    feedbackGiven: 0,
    helpRequested: 0,
  },
  timeAnalytics: {
    hourlyActivity: new Array(24).fill(0),
    dailyActivity: {},
    weeklyTrends: [],
    monthlyTrends: [],
  },
});

/**
 * Progress Service Class
 */
class ProgressService {
  constructor() {
    this.isSupported = storageService.isAvailable();
    this.platform = Platform.OS;
    this.currentUserId = null;
  }

  /**
   * Initialize user progress data
   */
  initializeUser(userId) {
    this.currentUserId = userId;

    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return {
        progress: createProgressModel(userId),
        stats: createStatsModel(userId),
      };
    }

    let progress = storageService.getItem(STORAGE_KEYS.USER_PROGRESS);
    let stats = storageService.getItem(STORAGE_KEYS.USER_STATS);

    if (!progress || progress.userId !== userId) {
      progress = createProgressModel(userId);
      storageService.setItem(STORAGE_KEYS.USER_PROGRESS, progress);
      logger.info('ProgressService', 'Initialized new user progress', {
        userId,
      });
    }

    if (!stats || stats.userId !== userId) {
      stats = createStatsModel(userId);
      storageService.setItem(STORAGE_KEYS.USER_STATS, stats);
      logger.info('ProgressService', 'Initialized new user stats', { userId });
    }

    return { progress, stats };
  }

  /**
   * Save progress data
   */
  async saveProgress(data) {
    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return { success: false, error: 'Not supported on web platform' };
    }

    try {
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data: must be an object');
      }

      const existingData =
        (await storageService.getItem(STORAGE_KEYS.USER_PROGRESS)) || {};
      const updatedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString(),
      };

      const success = await storageService.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        updatedData,
      );

      if (success) {
        logger.debug('ProgressService', 'Progress saved successfully', {
          userId: data.userId,
        });
        return { success: true, data: updatedData };
      } else {
        throw new Error('Failed to save progress data');
      }
    } catch (error) {
      logger.error('ProgressService', 'Failed to save progress', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get progress data
   */
  async getProgress(userId = null) {
    const targetUserId = userId || this.currentUserId;

    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return createProgressModel(targetUserId);
    }

    try {
      const data = await storageService.getItem(STORAGE_KEYS.USER_PROGRESS);

      if (!data) {
        logger.debug(
          'ProgressService',
          'No progress data found, initializing',
          { userId: targetUserId },
        );
        return this.initializeUser(targetUserId).progress;
      }

      if (data.userId !== targetUserId) {
        logger.debug(
          'ProgressService',
          'User mismatch, initializing new user',
          {
            stored: data.userId,
            requested: targetUserId,
          },
        );
        return this.initializeUser(targetUserId).progress;
      }

      logger.debug('ProgressService', 'Progress data retrieved', {
        userId: targetUserId,
      });
      return data;
    } catch (error) {
      logger.error('ProgressService', 'Failed to get progress', error);
      return createProgressModel(targetUserId);
    }
  }

  /**
   * Update bookmark count (called by bookmark service)
   */
  async updateBookmarkCount(count) {
    if (!this.isSupported) {
      return;
    }

    try {
      const currentProgress = await this.getProgress();
      currentProgress.learning.notesBookmarked = count;
      currentProgress.lastUpdated = new Date().toISOString();

      const success = await storageService.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        currentProgress,
      );
      if (success) {
        logger.debug('ProgressService', 'Bookmark count updated', { count });
      }
    } catch (error) {
      logger.error('ProgressService', 'Failed to update bookmark count', error);
    }
  }

  /**
   * Update specific statistics
   */
  async updateStats(statType, value, metadata = {}) {
    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return { success: false, error: 'Not supported on web platform' };
    }

    try {
      const currentStats =
        (await storageService.getItem(STORAGE_KEYS.USER_STATS)) ||
        createStatsModel(this.currentUserId);
      const currentProgress = await this.getProgress();

      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const hour = now.getHours();

      // Update based on stat type
      switch (statType) {
        case 'exam_completed':
          currentProgress.exams.totalAttempts++;
          if (value.passed) {
            currentProgress.exams.totalPassed++;
          } else {
            currentProgress.exams.totalFailed++;
          }
          currentProgress.exams.totalTimeSpent += value.timeSpent || 0;
          currentProgress.exams.lastExamDate = now.toISOString();

          // Update average score
          const totalExams = currentProgress.exams.totalAttempts;
          currentProgress.exams.averageScore = Math.round(
            (currentProgress.exams.averageScore * (totalExams - 1) +
              value.score) /
              totalExams,
          );

          // Update best score
          if (value.score > currentProgress.exams.bestScore) {
            currentProgress.exams.bestScore = value.score;
          }

          // Check achievements
          if (currentProgress.exams.totalAttempts === 1) {
            currentProgress.achievements.firstExam = true;
          }
          if (value.passed && !currentProgress.achievements.firstPass) {
            currentProgress.achievements.firstPass = true;
          }
          if (value.score === 100) {
            currentProgress.achievements.perfectScore = true;
          }

          break;

        case 'note_read':
          currentProgress.learning.notesRead++;
          currentProgress.learning.totalReadingTime += value.readTime || 0;

          if (
            value.category &&
            !currentProgress.learning.categoriesExplored.includes(
              value.category,
            )
          ) {
            currentProgress.learning.categoriesExplored.push(value.category);
          }

          // Scholar achievement
          if (currentProgress.learning.notesRead >= 50) {
            currentProgress.achievements.scholar = true;
          }

          break;

        case 'note_bookmarked':
          currentProgress.learning.notesBookmarked++;
          break;

        case 'session_start':
          currentStats.summary.totalSessions++;
          currentStats.timeAnalytics.hourlyActivity[hour]++;

          if (!currentStats.timeAnalytics.dailyActivity[today]) {
            currentStats.timeAnalytics.dailyActivity[today] = 0;
          }
          currentStats.timeAnalytics.dailyActivity[today]++;

          break;

        case 'session_end':
          const sessionTime = value.duration || 0;
          currentStats.summary.totalTimeSpent += sessionTime;
          currentStats.summary.averageSessionTime = Math.round(
            currentStats.summary.totalTimeSpent /
              currentStats.summary.totalSessions,
          );
          break;

        default:
          logger.warn('ProgressService', 'Unknown stat type', { statType });
          return { success: false, error: 'Unknown stat type' };
      }

      // Update activity tracking
      this.updateActivityTracking(currentProgress, now);

      // Save updated data
      currentProgress.lastUpdated = now.toISOString();
      currentStats.lastUpdated = now.toISOString();

      const progressSaved = await storageService.setItem(
        STORAGE_KEYS.USER_PROGRESS,
        currentProgress,
      );
      const statsSaved = await storageService.setItem(
        STORAGE_KEYS.USER_STATS,
        currentStats,
      );

      if (progressSaved && statsSaved) {
        logger.debug('ProgressService', 'Stats updated successfully', {
          statType,
          value,
        });
        return {
          success: true,
          progress: currentProgress,
          stats: currentStats,
        };
      } else {
        throw new Error('Failed to save updated stats');
      }
    } catch (error) {
      logger.error('ProgressService', 'Failed to update stats', {
        statType,
        error,
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Update activity tracking and streaks
   */
  updateActivityTracking(progress, currentDate) {
    const today = currentDate.toISOString().split('T')[0];
    const lastActivity = progress.activity.lastActivityDate;

    if (lastActivity) {
      const lastDate = new Date(lastActivity).toISOString().split('T')[0];
      const daysDiff = Math.floor(
        (currentDate - new Date(lastActivity)) / (1000 * 60 * 60 * 24),
      );

      if (daysDiff === 1) {
        // Consecutive day
        progress.activity.currentStreak++;
      } else if (daysDiff > 1) {
        // Streak broken
        progress.activity.currentStreak = 1;
      }
      // Same day = no change to streak
    } else {
      // First activity
      progress.activity.currentStreak = 1;
    }

    // Update longest streak
    if (progress.activity.currentStreak > progress.activity.longestStreak) {
      progress.activity.longestStreak = progress.activity.currentStreak;
    }

    // Check streak achievements
    if (progress.activity.currentStreak >= 7) {
      progress.achievements.weekStreak = true;
    }
    if (progress.activity.currentStreak >= 30) {
      progress.achievements.monthStreak = true;
      progress.achievements.dedicated = true;
    }

    progress.activity.lastActivityDate = currentDate.toISOString();
  }

  /**
   * Get dashboard summary data
   */
  async getDashboardSummary() {
    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return {
        success: true,
        summary: {
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          currentStreak: 0,
          recentActivity: [],
          lastActivity: null,
          supported: false,
          platform: this.platform,
        },
      };
    }

    try {
      const progress = await this.getProgress(this.currentUserId);

      // Get actual bookmark count from bookmark service
      let actualBookmarkCount = progress.learning.notesBookmarked;
      try {
        // Lazy load bookmark service to avoid circular dependency
        const bookmarkService = require('./bookmarkService.js').default;
        if (bookmarkService) {
          actualBookmarkCount = bookmarkService.getBookmarks().length;
          // Update progress if counts don't match
          if (actualBookmarkCount !== progress.learning.notesBookmarked) {
            await this.updateBookmarkCount(actualBookmarkCount);
          }
        }
      } catch (error) {
        logger.warn('ProgressService', 'Could not sync bookmark count', error);
      }

      // Get recent activities
      let recentActivities = [];
      try {
        const activityService = require('./activityService.js').default;
        if (activityService) {
          const activities = await activityService.getRecentActivities(5);
          recentActivities = activities.map((activity) =>
            activityService.formatActivityForDisplay(activity),
          );
        }
      } catch (error) {
        logger.warn(
          'ProgressService',
          'Could not load recent activities',
          error,
        );
      }

      const summary = {
        totalExams: progress.exams.totalAttempts,
        averageScore: progress.exams.averageScore,
        passedExams: progress.exams.totalPassed,
        totalStudyTime:
          progress.learning.totalReadingTime + progress.exams.totalTimeSpent,
        bookmarkedNotes: actualBookmarkCount,
        currentStreak: progress.activity.currentStreak,
        recentActivity: recentActivities,
        lastActivity: progress.activity.lastActivityDate,
        supported: true,
        platform: this.platform,
      };

      return { success: true, summary };
    } catch (error) {
      logger.error('ProgressService', 'Failed to get dashboard summary', error);
      // Return default summary on error
      return {
        success: true,
        summary: {
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          currentStreak: 0,
          recentActivity: [],
          lastActivity: null,
          supported: false,
          platform: this.platform,
        },
      };
    }
  }

  /**
   * Clear all progress data
   */
  async clearProgress(userId = null) {
    if (!this.isSupported) {
      logger.warn(
        'ProgressService',
        `Progress tracking not supported on ${this.platform} platform`,
      );
      return { success: false, error: 'Not supported on web platform' };
    }

    try {
      const targetUserId = userId || this.currentUserId;

      // Remove all related data
      await storageService.removeItem(STORAGE_KEYS.USER_PROGRESS);
      await storageService.removeItem(STORAGE_KEYS.USER_STATS);
      await storageService.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
      await storageService.removeItem(STORAGE_KEYS.ACHIEVEMENTS);

      logger.info('ProgressService', 'Progress data cleared', {
        userId: targetUserId,
      });
      return { success: true, message: 'Progress data cleared successfully' };
    } catch (error) {
      logger.error('ProgressService', 'Failed to clear progress', error);
      return { success: false, error: error.message };
    }
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
        progressTracking: this.isSupported,
        statistics: this.isSupported,
        persistence: this.isSupported,
        encryption: this.isSupported,
      },
    };
  }
}

// Create singleton instance
const progressService = new ProgressService();

// Export service methods
export const {
  initializeUser,
  saveProgress,
  getProgress,
  updateStats,
  clearProgress,
  getDashboardSummary,
  updateBookmarkCount,
  getPlatformInfo,
} = progressService;

// Export the service instance for direct access
export default progressService;
