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
  resetPassword
} from './authService.js';

// User profile services
export {
  getUserProfile,
  updateUserProfile,
  changePassword
} from './userService.js';

// Notes services
export {
  getNotesGroupedByCategory,
  getNoteBySlug,
  searchNotes
} from './notesService.js';

// Exams services
export {
  getUserExams,
  getExamBySlug,
  submitExamResults,
  getUserExamHistory
} from './examsService.js';

// API configuration
export { API_CONFIG, getAuthHeaders, buildApiUrl } from '../config/api.js';

/**
 * Usage Examples:
 * 
 * // Import specific services
 * import { login, getUserProfile } from './services';
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