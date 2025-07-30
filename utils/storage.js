import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  ACTIVITY_HISTORY: '@jpj_activity_history',
  EXAM_RESULTS: '@jpj_exam_results',
  BOOKMARKS: '@jpj_bookmarks',
  USER_PREFERENCES: '@jpj_user_preferences',
};

// Activity History Management
export const activityStorage = {
  // Add new activity to history
  addActivity: async (activity) => {
    try {
      const existingHistory = await activityStorage.getHistory();
      const newActivity = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...activity,
      };

      const updatedHistory = [newActivity, ...existingHistory].slice(0, 50); // Keep last 50 activities
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVITY_HISTORY,
        JSON.stringify(updatedHistory),
      );
      return newActivity;
    } catch (error) {
      console.error('Error adding activity:', error);
      return null;
    }
  },

  // Get activity history
  getHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITY_HISTORY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting activity history:', error);
      return [];
    }
  },

  // Clear activity history
  clearHistory: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVITY_HISTORY);
      return true;
    } catch (error) {
      console.error('Error clearing activity history:', error);
      return false;
    }
  },
};

// Exam Results Management
export const examStorage = {
  // Save exam result
  saveResult: async (result) => {
    try {
      const existingResults = await examStorage.getResults();
      const newResult = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        ...result,
      };

      const updatedResults = [newResult, ...existingResults];
      await AsyncStorage.setItem(
        STORAGE_KEYS.EXAM_RESULTS,
        JSON.stringify(updatedResults),
      );

      // Also add to activity history
      await activityStorage.addActivity({
        type: 'exam_completed',
        examId: result.examId,
        examTitle: result.examTitle,
        score: result.score,
        passed: result.passed,
      });

      return newResult;
    } catch (error) {
      console.error('Error saving exam result:', error);
      return null;
    }
  },

  // Get all exam results
  getResults: async () => {
    try {
      const results = await AsyncStorage.getItem(STORAGE_KEYS.EXAM_RESULTS);
      return results ? JSON.parse(results) : [];
    } catch (error) {
      console.error('Error getting exam results:', error);
      return [];
    }
  },

  // Get results for specific exam
  getResultsForExam: async (examId) => {
    try {
      const allResults = await examStorage.getResults();
      return allResults.filter((result) => result.examId === examId);
    } catch (error) {
      console.error('Error getting exam results:', error);
      return [];
    }
  },
};

// Bookmarks Management
export const bookmarkStorage = {
  // Add bookmark
  addBookmark: async (noteId) => {
    try {
      const bookmarks = await bookmarkStorage.getBookmarks();
      if (!bookmarks.includes(noteId)) {
        const updatedBookmarks = [...bookmarks, noteId];
        await AsyncStorage.setItem(
          STORAGE_KEYS.BOOKMARKS,
          JSON.stringify(updatedBookmarks),
        );

        // Add to activity history
        await activityStorage.addActivity({
          type: 'note_bookmarked',
          noteId: noteId,
        });
      }
      return true;
    } catch (error) {
      console.error('Error adding bookmark:', error);
      return false;
    }
  },

  // Remove bookmark
  removeBookmark: async (noteId) => {
    try {
      const bookmarks = await bookmarkStorage.getBookmarks();
      const updatedBookmarks = bookmarks.filter((id) => id !== noteId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.BOOKMARKS,
        JSON.stringify(updatedBookmarks),
      );
      return true;
    } catch (error) {
      console.error('Error removing bookmark:', error);
      return false;
    }
  },

  // Get all bookmarks
  getBookmarks: async () => {
    try {
      const bookmarks = await AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return bookmarks ? JSON.parse(bookmarks) : [];
    } catch (error) {
      console.error('Error getting bookmarks:', error);
      return [];
    }
  },

  // Check if note is bookmarked
  isBookmarked: async (noteId) => {
    try {
      const bookmarks = await bookmarkStorage.getBookmarks();
      return bookmarks.includes(noteId);
    } catch (error) {
      console.error('Error checking bookmark:', error);
      return false;
    }
  },
};

// User Preferences Management
export const preferencesStorage = {
  // Save preferences
  savePreferences: async (preferences) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.USER_PREFERENCES,
        JSON.stringify(preferences),
      );
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  },

  // Get preferences
  getPreferences: async () => {
    try {
      const preferences = await AsyncStorage.getItem(
        STORAGE_KEYS.USER_PREFERENCES,
      );
      return preferences
        ? JSON.parse(preferences)
        : {
            theme: 'light',
            notifications: true,
            autoSave: true,
            examSettings: {
              showTimer: true,
              showProgress: true,
              immediateValidation: false,
            },
          };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return {};
    }
  },
};

// Statistics calculation
export const statsCalculator = {
  // Calculate user statistics
  calculateStats: async () => {
    try {
      const examResults = await examStorage.getResults();
      const activities = await activityStorage.getHistory();
      const bookmarks = await bookmarkStorage.getBookmarks();

      const stats = {
        totalExams: examResults.length,
        averageScore:
          examResults.length > 0
            ? Math.round(
                examResults.reduce((sum, result) => sum + result.score, 0) /
                  examResults.length,
              )
            : 0,
        passedExams: examResults.filter((result) => result.passed).length,
        totalStudyTime: examResults.reduce(
          (sum, result) => sum + (result.timeSpent || 0),
          0,
        ),
        bookmarkedNotes: bookmarks.length,
        recentActivity: activities.slice(0, 5),
        streak: calculateStreak(activities),
        lastActivity: activities.length > 0 ? activities[0].timestamp : null,
      };

      return stats;
    } catch (error) {
      console.error('Error calculating stats:', error);
      return {
        totalExams: 0,
        averageScore: 0,
        passedExams: 0,
        totalStudyTime: 0,
        bookmarkedNotes: 0,
        recentActivity: [],
        streak: 0,
        lastActivity: null,
      };
    }
  },
};

// Helper function to calculate study streak
const calculateStreak = (activities) => {
  if (activities.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  const activityDates = activities.map((activity) => {
    const date = new Date(activity.timestamp);
    return date.toDateString();
  });

  const uniqueDates = [...new Set(activityDates)].sort(
    (a, b) => new Date(b) - new Date(a),
  );

  for (let i = 0; i < uniqueDates.length; i++) {
    const activityDate = new Date(uniqueDates[i]);
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - i);

    if (activityDate.toDateString() === expectedDate.toDateString()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
