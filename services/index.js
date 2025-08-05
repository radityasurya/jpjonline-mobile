/**
 * Services Index
 *
 * Central export point for all API services.
 * Import services from here to maintain consistency across the application.
 */

// Authentication services
export {
  signup,
  login,
  getSession,
  forgotPassword,
  resetPassword,
} from './authService.js';

// User profile services
export {
  getUserProfile,
  updateUserProfile,
  changePassword,
  deleteUserAccount,
} from './userService.js';

// Notes services
export {
  getNotesGroupedByCategory,
  getNoteById,
  searchNotes,
} from './notesService.js';

// Exams services
export {
  getUserExams,
  getExamBySlug,
  submitExamResults,
  getUserExamHistory,
} from './examsService.js';

// Pages services
export { getPageBySlug } from './pagesService.js';

// Contact services
export {
  submitContactForm,
  fetchAboutData,
  submitContactFormLegacy,
  fetchAboutDataLegacy,
  fetchPageBySlugLegacy,
} from './contactService.js';

// Progress and Statistics services
export {
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
} from './progressService.js';

// Export progress service instance
export { default as progressService } from './progressService.js';

// Bookmark services
export {
  getBookmarks,
  isBookmarked,
  addBookmark,
  removeBookmark,
  toggleBookmark,
  getBookmarkedNotes,
  clearAllBookmarks,
  getBookmarkStats,
  exportBookmarks,
  importBookmarks,
} from './bookmarkService.js';

// Export bookmark service instance
export { default as bookmarkService } from './bookmarkService.js';

// Activity services
export {
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
  ACTIVITY_TYPES,
} from './activityService.js';

// Export activity service instance
export { default as activityService } from './activityService.js';

// API configuration
export { API_CONFIG, getAuthHeaders, buildApiUrl } from '../config/api.js';

/**
 * Legacy API Compatibility Layer
 *
 * These exports provide backward compatibility for code that imports from services/api.ts
 * They map the old API structure to the new domain-specific services.
 */

// Import all domain services for legacy API structure
import * as authService from './authService.js';
import * as userService from './userService.js';
import * as notesService from './notesService.js';
import * as examsService from './examsService.js';
import * as contactService from './contactService.js';
import bookmarkService from './bookmarkService.js';
import activityService from './activityService.js';

// Legacy API structure for backward compatibility
export const api = {
  // Notes API (legacy format)
  notes: {
    fetchCategories: async () => {
      // Mock implementation for backward compatibility
      return { success: true, data: ['Car Manual', 'Car Automatic', 'Motorcycle'] };
    },
    fetchNotes: async (category, search) => {
      try {
        const response = await notesService.getNotesGroupedByCategory();
        let allNotes = [];
        Object.values(response.notesByCategory).forEach((categoryGroup) => {
          allNotes = [...allNotes, ...categoryGroup.notes];
        });

        // Apply filters similar to legacy API
        let filteredNotes = [...allNotes];
        if (category && category !== 'All') {
          filteredNotes = filteredNotes.filter(note =>
            note.topic?.category?.title === category
          );
        }
        if (search) {
          const query = search.toLowerCase();
          filteredNotes = filteredNotes.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
          );
        }

        return { success: true, data: filteredNotes };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    fetchNoteById: async (id) => {
      try {
        const note = await notesService.getNoteById(id);
        return { success: true, data: note };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    toggleBookmark: async (noteId) => {
      try {
        const newStatus = bookmarkService.toggleBookmark(noteId);
        return { success: true, data: newStatus };
      } catch (error) {
        return { success: false, error: 'Failed to toggle bookmark' };
      }
    },
    getBookmarkedNotes: async () => {
      try {
        const bookmarkIds = bookmarkService.getBookmarks();
        // This would need to fetch actual notes, simplified for compatibility
        return { success: true, data: [] };
      } catch (error) {
        return { success: false, error: 'Failed to fetch bookmarked notes' };
      }
    },
  },

  // Exams API (legacy format)
  exams: {
    fetchCategories: async () => {
      // Mock implementation for backward compatibility
      return { success: true, data: ['Car', 'Motorcycle', 'Commercial'] };
    },
    fetchExams: async (userSubscription = 'free') => {
      try {
        const response = await examsService.getUserExams();
        let allExams = [];
        response.categories.forEach((category) => {
          const examsWithAccess = category.exams.map(exam => ({
            ...exam,
            isAccessible: userSubscription === 'premium' || !exam.premium,
          }));
          allExams = [...allExams, ...examsWithAccess];
        });
        return { success: true, data: allExams };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    fetchExamById: async (examId) => {
      try {
        // This would need to be implemented based on exam slug/id mapping
        return { success: false, error: 'Not implemented in new API structure' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    fetchExamQuestions: async (examId) => {
      try {
        // This would need to be implemented based on exam slug/id mapping
        return { success: false, error: 'Not implemented in new API structure' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    submitExamResult: async (examId, answers, timeSpent) => {
      try {
        // This would need to be implemented based on exam slug/id mapping
        return { success: false, error: 'Not implemented in new API structure' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    getExamResults: async () => {
      try {
        const response = await examsService.getUserExamHistory();
        return { success: true, data: response.results };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  // Auth API (legacy format)
  auth: {
    login: async (credentials) => {
      try {
        const response = await authService.login(credentials);
        return { success: true, data: response.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    register: async (userData) => {
      try {
        const response = await authService.signup(userData);
        return { success: true, data: response.user };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    forgotPassword: async (email) => {
      try {
        const response = await authService.forgotPassword({ email });
        return { success: true, data: response.message };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
  },

  // User API (legacy format)
  user: {
    fetchUserStats: async (userId) => {
      try {
        // Mock implementation for backward compatibility
        return {
          success: true,
          data: {
            totalExams: 0,
            passedExams: 0,
            totalNotes: 0,
            bookmarkedNotes: bookmarkService.getBookmarks().length,
            averageScore: 0,
            streak: activityService.calculateActivityStreak(),
          }
        };
      } catch (error) {
        return { success: false, error: 'Failed to fetch user statistics' };
      }
    },
    getRecentActivity: async () => {
      try {
        const activities = await activityService.getRecentActivities(5);
        return { success: true, data: activities };
      } catch (error) {
        return { success: false, error: 'Failed to fetch recent activity' };
      }
    },
    updateProfile: async (userId, profileData) => {
      try {
        const response = await userService.updateUserProfile(null, profileData);
        return { success: true, data: response.user, message: 'Profile updated successfully' };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    saveActivity: async (activity) => {
      try {
        const savedActivity = await activityService.addActivity(activity.type, activity);
        return { success: true, data: savedActivity };
      } catch (error) {
        return { success: false, error: 'Failed to save activity' };
      }
    },
  },

  // Contact API (legacy format)
  contact: {
    submitContactForm: contactService.submitContactFormLegacy,
    fetchAboutData: contactService.fetchAboutDataLegacy,
    fetchPageBySlug: contactService.fetchPageBySlugLegacy,
  },

  // Storage API (legacy format)
  storage: {
    toggleBookmark: async (noteId) => {
      try {
        const newStatus = bookmarkService.toggleBookmark(noteId);
        return { success: true, data: newStatus };
      } catch (error) {
        return { success: false, error: 'Failed to toggle bookmark' };
      }
    },
    getBookmarks: async () => {
      try {
        const bookmarks = bookmarkService.getBookmarks();
        return { success: true, data: bookmarks };
      } catch (error) {
        return { success: false, error: 'Failed to fetch bookmarks' };
      }
    },
    saveActivity: async (activity) => {
      try {
        const savedActivity = await activityService.addActivity(activity.type, activity);
        return { success: true, data: savedActivity };
      } catch (error) {
        return { success: false, error: 'Failed to save activity' };
      }
    },
  },
};

// Export legacy API structure with individual domain APIs
export const notesAPI = api.notes;
export const examsAPI = api.exams;
export const authAPI = api.auth;
export const userAPI = api.user;
export const contactAPI = api.contact;
export const storageAPI = api.storage;

// Default export for backward compatibility
export default api;

/**
 * Usage Examples:
 *
 * // New recommended approach - Import specific services
 * import { login, getUserProfile } from './services';
 *
 * // Legacy approach - Still supported
 * import api, { notesAPI, examsAPI } from './services';
 *
 * // Use in components
 * const handleLogin = async (credentials) => {
 *   try {
 *     const response = await login(credentials);
 *     // Handle successful login
 *   } catch (error) {
 *     // Handle login error
 *   }
 * };
 */
