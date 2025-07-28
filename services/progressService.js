/**
 * Progress Tracking and Statistics Service
 * 
 * Manages user progress and statistics using localStorage.
 * Provides comprehensive tracking for learning activities, exam results, and user engagement.
 */

import { logger } from '../utils/logger.js';

// Storage keys with versioning
const STORAGE_KEYS = {
  USER_PROGRESS: '@jpj_user_progress_v2',
  USER_STATS: '@jpj_user_stats_v2',
  ACTIVITY_LOG: '@jpj_activity_log_v2',
  ACHIEVEMENTS: '@jpj_achievements_v2',
  PREFERENCES: '@jpj_preferences_v2'
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
    completionPercentage: 0
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
    categoryPerformance: {} // { categoryId: { attempts, passed, avgScore } }
  },
  achievements: {
    firstExam: false,
    firstPass: false,
    perfectScore: false,
    weekStreak: false,
    monthStreak: false,
    speedster: false, // Complete exam in under 10 minutes
    scholar: false, // Read 50+ notes
    dedicated: false // 30+ days of activity
  },
  milestones: {
    examsCompleted: [1, 5, 10, 25, 50, 100],
    notesRead: [1, 10, 25, 50, 100],
    studyHours: [1, 5, 10, 25, 50, 100],
    perfectScores: [1, 3, 5, 10]
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
      sunday: 0
    }
  }
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
    mostActiveHour: null
  },
  performance: {
    overallAccuracy: 0,
    improvementRate: 0,
    consistencyScore: 0,
    learningVelocity: 0
  },
  engagement: {
    loginStreak: 0,
    featuresUsed: [],
    feedbackGiven: 0,
    helpRequested: 0
  },
  timeAnalytics: {
    hourlyActivity: new Array(24).fill(0),
    dailyActivity: {},
    weeklyTrends: [],
    monthlyTrends: []
  }
});

/**
 * Progress Service Class
 */
class ProgressService {
  constructor() {
    this.isSupported = this.checkLocalStorageSupport();
    this.currentUserId = null;
  }

  /**
   * Check if localStorage is supported and available
   */
  checkLocalStorageSupport() {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      logger.error('ProgressService', 'localStorage not supported', error);
      return false;
    }
  }

  /**
   * Validate data before storage
   */
  validateData(data, schema = 'progress') {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data: must be an object');
    }

    if (schema === 'progress') {
      if (!data.userId || !data.version) {
        throw new Error('Invalid progress data: missing required fields');
      }
    }

    return true;
  }

  /**
   * Handle localStorage quota exceeded
   */
  handleQuotaExceeded() {
    logger.warn('ProgressService', 'localStorage quota exceeded, attempting cleanup');
    
    try {
      // Remove old activity logs (keep last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // This is a simplified cleanup - in real implementation, 
      // you'd clean up old activity entries
      logger.info('ProgressService', 'Cleanup completed');
      return true;
    } catch (error) {
      logger.error('ProgressService', 'Cleanup failed', error);
      return false;
    }
  }

  /**
   * Safe localStorage operations with error handling
   */
  safeSetItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        if (this.handleQuotaExceeded()) {
          // Retry after cleanup
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
          } catch (retryError) {
            logger.error('ProgressService', 'Storage failed after cleanup', retryError);
            return false;
          }
        }
      }
      logger.error('ProgressService', 'Storage operation failed', error);
      return false;
    }
  }

  safeGetItem(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      logger.error('ProgressService', 'Retrieval operation failed', { key, error });
      return null;
    }
  }

  /**
   * Initialize user progress data
   */
  initializeUser(userId) {
    this.currentUserId = userId;
    
    let progress = this.safeGetItem(STORAGE_KEYS.USER_PROGRESS);
    let stats = this.safeGetItem(STORAGE_KEYS.USER_STATS);

    if (!progress || progress.userId !== userId) {
      progress = createProgressModel(userId);
      this.safeSetItem(STORAGE_KEYS.USER_PROGRESS, progress);
      logger.info('ProgressService', 'Initialized new user progress', { userId });
    }

    if (!stats || stats.userId !== userId) {
      stats = createStatsModel(userId);
      this.safeSetItem(STORAGE_KEYS.USER_STATS, stats);
      logger.info('ProgressService', 'Initialized new user stats', { userId });
    }

    return { progress, stats };
  }

  /**
   * Save progress data
   */
  saveProgress(data) {
    try {
      this.validateData(data, 'progress');
      
      const existingData = this.safeGetItem(STORAGE_KEYS.USER_PROGRESS) || {};
      const updatedData = {
        ...existingData,
        ...data,
        lastUpdated: new Date().toISOString()
      };

      const success = this.safeSetItem(STORAGE_KEYS.USER_PROGRESS, updatedData);
      
      if (success) {
        logger.debug('ProgressService', 'Progress saved successfully', { userId: data.userId });
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
  getProgress(userId = null) {
    try {
      const targetUserId = userId || this.currentUserId;
      const data = this.safeGetItem(STORAGE_KEYS.USER_PROGRESS);
      
      if (!data) {
        logger.debug('ProgressService', 'No progress data found, initializing', { userId: targetUserId });
        return this.initializeUser(targetUserId).progress;
      }

      if (data.userId !== targetUserId) {
        logger.debug('ProgressService', 'User mismatch, initializing new user', { 
          stored: data.userId, 
          requested: targetUserId 
        });
        return this.initializeUser(targetUserId).progress;
      }

      logger.debug('ProgressService', 'Progress data retrieved', { userId: targetUserId });
      return data;
    } catch (error) {
      logger.error('ProgressService', 'Failed to get progress', error);
      return createProgressModel(userId || this.currentUserId);
    }
  }

  /**
   * Update bookmark count (called by bookmark service)
   */
  updateBookmarkCount(count) {
    try {
      const currentProgress = this.getProgress();
      currentProgress.learning.notesBookmarked = count;
      currentProgress.lastUpdated = new Date().toISOString();
      
      const success = this.safeSetItem(STORAGE_KEYS.USER_PROGRESS, currentProgress);
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
  updateStats(statType, value, metadata = {}) {
    try {
      const currentStats = this.safeGetItem(STORAGE_KEYS.USER_STATS) || createStatsModel(this.currentUserId);
      const currentProgress = this.getProgress();
      
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
            ((currentProgress.exams.averageScore * (totalExams - 1)) + value.score) / totalExams
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
          
          if (value.category && !currentProgress.learning.categoriesExplored.includes(value.category)) {
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
            currentStats.summary.totalTimeSpent / currentStats.summary.totalSessions
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

      const progressSaved = this.safeSetItem(STORAGE_KEYS.USER_PROGRESS, currentProgress);
      const statsSaved = this.safeSetItem(STORAGE_KEYS.USER_STATS, currentStats);

      if (progressSaved && statsSaved) {
        logger.debug('ProgressService', 'Stats updated successfully', { statType, value });
        return { success: true, progress: currentProgress, stats: currentStats };
      } else {
        throw new Error('Failed to save updated stats');
      }

    } catch (error) {
      logger.error('ProgressService', 'Failed to update stats', { statType, error });
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
      const daysDiff = Math.floor((currentDate - new Date(lastActivity)) / (1000 * 60 * 60 * 24));

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
   * Get statistics with optional time filtering
   */
  getStats(timeRange = 'all') {
    try {
      const stats = this.safeGetItem(STORAGE_KEYS.USER_STATS) || createStatsModel(this.currentUserId);
      const progress = this.getProgress();

      // Calculate derived statistics
      const derivedStats = {
        ...stats,
        derived: {
          totalActiveDays: Object.keys(stats.timeAnalytics.dailyActivity).length,
          averageDailyTime: this.calculateAverageDailyTime(stats),
          mostProductiveHour: this.findMostProductiveHour(stats),
          learningEfficiency: this.calculateLearningEfficiency(progress),
          progressTrend: this.calculateProgressTrend(progress)
        }
      };

      // Apply time filtering if specified
      if (timeRange !== 'all') {
        return this.filterStatsByTimeRange(derivedStats, timeRange);
      }

      logger.debug('ProgressService', 'Stats retrieved', { timeRange });
      return derivedStats;
    } catch (error) {
      logger.error('ProgressService', 'Failed to get stats', error);
      return createStatsModel(this.currentUserId);
    }
  }

  /**
   * Calculate average daily time
   */
  calculateAverageDailyTime(stats) {
    const dailyActivities = Object.values(stats.timeAnalytics.dailyActivity);
    if (dailyActivities.length === 0) return 0;
    
    const totalTime = dailyActivities.reduce((sum, time) => sum + time, 0);
    return Math.round(totalTime / dailyActivities.length);
  }

  /**
   * Find most productive hour
   */
  findMostProductiveHour(stats) {
    const hourlyActivity = stats.timeAnalytics.hourlyActivity;
    const maxActivity = Math.max(...hourlyActivity);
    const mostActiveHour = hourlyActivity.indexOf(maxActivity);
    
    return maxActivity > 0 ? mostActiveHour : null;
  }

  /**
   * Calculate learning efficiency
   */
  calculateLearningEfficiency(progress) {
    const { totalAttempts, totalPassed, averageScore } = progress.exams;
    if (totalAttempts === 0) return 0;
    
    const passRate = (totalPassed / totalAttempts) * 100;
    const efficiency = (passRate + averageScore) / 2;
    
    return Math.round(efficiency);
  }

  /**
   * Calculate progress trend
   */
  calculateProgressTrend(progress) {
    // Simple trend calculation based on recent activity
    const recentActivity = progress.activity.currentStreak;
    const totalExams = progress.exams.totalAttempts;
    const averageScore = progress.exams.averageScore;
    
    if (recentActivity >= 7 && averageScore >= 80) return 'excellent';
    if (recentActivity >= 3 && averageScore >= 70) return 'good';
    if (totalExams > 0) return 'improving';
    return 'getting_started';
  }

  /**
   * Filter statistics by time range
   */
  filterStatsByTimeRange(stats, timeRange) {
    const now = new Date();
    let startDate;

    switch (timeRange) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        return stats;
    }

    // Filter daily activity
    const filteredDailyActivity = {};
    Object.entries(stats.timeAnalytics.dailyActivity).forEach(([date, activity]) => {
      if (new Date(date) >= startDate) {
        filteredDailyActivity[date] = activity;
      }
    });

    return {
      ...stats,
      timeAnalytics: {
        ...stats.timeAnalytics,
        dailyActivity: filteredDailyActivity
      }
    };
  }

  /**
   * Clear all progress data
   */
  clearProgress(userId = null) {
    try {
      const targetUserId = userId || this.currentUserId;
      
      // Remove all related data
      localStorage.removeItem(STORAGE_KEYS.USER_PROGRESS);
      localStorage.removeItem(STORAGE_KEYS.USER_STATS);
      localStorage.removeItem(STORAGE_KEYS.ACTIVITY_LOG);
      localStorage.removeItem(STORAGE_KEYS.ACHIEVEMENTS);
      
      logger.info('ProgressService', 'Progress data cleared', { userId: targetUserId });
      return { success: true, message: 'Progress data cleared successfully' };
    } catch (error) {
      logger.error('ProgressService', 'Failed to clear progress', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export all user data for backup
   */
  exportData(userId = null) {
    try {
      const targetUserId = userId || this.currentUserId;
      const progress = this.getProgress(targetUserId);
      const stats = this.getStats();
      
      const exportData = {
        version: DATA_VERSION,
        exportDate: new Date().toISOString(),
        userId: targetUserId,
        progress: progress,
        stats: stats
      };

      logger.info('ProgressService', 'Data exported', { userId: targetUserId });
      return { success: true, data: exportData };
    } catch (error) {
      logger.error('ProgressService', 'Failed to export data', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import data from backup
   */
  importData(importData) {
    try {
      if (!importData || !importData.progress || !importData.stats) {
        throw new Error('Invalid import data structure');
      }

      const success = this.safeSetItem(STORAGE_KEYS.USER_PROGRESS, importData.progress) &&
                     this.safeSetItem(STORAGE_KEYS.USER_STATS, importData.stats);

      if (success) {
        this.currentUserId = importData.userId;
        logger.info('ProgressService', 'Data imported successfully', { userId: importData.userId });
        return { success: true, message: 'Data imported successfully' };
      } else {
        throw new Error('Failed to save imported data');
      }
    } catch (error) {
      logger.error('ProgressService', 'Failed to import data', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user achievements
   */
  getAchievements(userId = null) {
    try {
      const progress = this.getProgress(userId);
      const achievements = progress.achievements || {};
      
      // Calculate achievement progress
      const achievementProgress = {
        firstExam: { unlocked: achievements.firstExam, progress: progress.exams.totalAttempts >= 1 ? 100 : 0 },
        firstPass: { unlocked: achievements.firstPass, progress: progress.exams.totalPassed >= 1 ? 100 : 0 },
        perfectScore: { unlocked: achievements.perfectScore, progress: progress.exams.bestScore === 100 ? 100 : progress.exams.bestScore },
        weekStreak: { unlocked: achievements.weekStreak, progress: Math.min((progress.activity.currentStreak / 7) * 100, 100) },
        monthStreak: { unlocked: achievements.monthStreak, progress: Math.min((progress.activity.currentStreak / 30) * 100, 100) },
        scholar: { unlocked: achievements.scholar, progress: Math.min((progress.learning.notesRead / 50) * 100, 100) },
        dedicated: { unlocked: achievements.dedicated, progress: Math.min((progress.activity.longestStreak / 30) * 100, 100) }
      };

      return { success: true, achievements: achievementProgress };
    } catch (error) {
      logger.error('ProgressService', 'Failed to get achievements', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Calculate completion percentage for learning materials
   */
  calculateLearningCompletion(totalNotes = 100) {
    try {
      const progress = this.getProgress();
      const completion = Math.min((progress.learning.notesRead / totalNotes) * 100, 100);
      
      return Math.round(completion);
    } catch (error) {
      logger.error('ProgressService', 'Failed to calculate learning completion', error);
      return 0;
    }
  }

  /**
   * Get dashboard summary data
   */
  getDashboardSummary() {
    try {
      const progress = this.getProgress(this.currentUserId);
      const stats = this.getStats();
      
      // Get actual bookmark count from bookmark service
      let actualBookmarkCount = progress.learning.notesBookmarked;
      try {
        // Lazy load bookmark service to avoid circular dependency
        const bookmarkService = require('./bookmarkService.js').default;
        if (bookmarkService) {
          actualBookmarkCount = bookmarkService.getBookmarks().length;
          // Update progress if counts don't match
          if (actualBookmarkCount !== progress.learning.notesBookmarked) {
            this.updateBookmarkCount(actualBookmarkCount);
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
          const activities = activityService.getRecentActivities(5);
          recentActivities = activities.map(activity => 
            activityService.formatActivityForDisplay(activity)
          );
        }
      } catch (error) {
        logger.warn('ProgressService', 'Could not load recent activities', error);
      }
      
      const summary = {
        totalExams: progress.exams.totalAttempts,
        averageScore: progress.exams.averageScore,
        passedExams: progress.exams.totalPassed,
        totalStudyTime: progress.learning.totalReadingTime + progress.exams.totalTimeSpent,
        bookmarkedNotes: actualBookmarkCount,
        currentStreak: progress.activity.currentStreak,
        recentActivity: recentActivities,
        lastActivity: progress.activity.lastActivityDate
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
          lastActivity: null
        }
      };
    }
  }

  /**
   * Get recent activity (mock implementation)
   */
  getRecentActivity() {
    // This would typically come from a separate activity log
    // For now, return empty array - can be enhanced later
    return [];
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
  getStats,
  clearProgress,
  exportData,
  importData,
  getAchievements,
  calculateLearningCompletion,
  getDashboardSummary,
  updateBookmarkCount
} = progressService;

// Export the service instance for direct access
export default progressService;

/**
 * Usage Examples:
 * 
 * // Initialize user
 * progressService.initializeUser('user123');
 * 
 * // Track exam completion
 * progressService.updateStats('exam_completed', {
 *   score: 85,
 *   passed: true,
 *   timeSpent: 25
 * });
 * 
 * // Track note reading
 * progressService.updateStats('note_read', {
 *   readTime: 5,
 *   category: 'traffic-laws'
 * });
 * 
 * // Get dashboard data
 * const { summary } = progressService.getDashboardSummary();
 * 
 * // Export data for backup
 * const { data } = progressService.exportData();
 */