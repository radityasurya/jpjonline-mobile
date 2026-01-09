import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';
import storageService from './storage.js';
import { makeAuthenticatedRequest } from './authService.js';

// Storage keys for exam data
const EXAM_RESULTS_STORAGE_KEY = '@jpj_exam_results_v1';
const EXAM_HISTORY_STORAGE_KEY = '@jpj_exam_history_v1';
const MAX_RESULTS = 100; // Keep last 100 results for performance

/**
 * Exams Service
 *
 * This service handles all exam-related API calls.
 * Currently using mock responses - uncomment real API calls when CORS is configured.
 */

/**
 * Get All Exams for Current User (Mobile-Optimized)
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Exams grouped by category with mobile-friendly format
 *
 * Response format:
 * {
 *   "categories": [
 *     {
 *       "id": "cat_123",
 *       "name": "Category Name",
 *       "accessible": true,
 *       "exams": [
 *         {
 *           "id": "exam_123",
 *           "slug": "exam-slug",
 *           "title": "Exam Title",
 *           "description": "...",
 *           "questionCount": 50,
 *           "crown": false,
 *           "passRate": 70,
 *           "category": "Category Name",
 *           "totalTimeDuration": 1800,
 *           "timerType": "TOTAL_TIME_LIMIT",
 *           "mode": "OPEN"
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
export const getUserExams = async (token) => {
  try {
    // Get token from storage if not provided
    const authToken = token || (await storageService.getItem('accessToken'));

    logger.info('ExamsService', 'Fetching user exams (mobile-optimized)');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS);

    const response = await fetch(
      buildApiUrl(API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS),
      {
        method: 'GET',
        headers: getAuthHeaders(authToken),
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch exams');
    }

    const data = await response.json();

    // Validate mobile-optimized response format
    if (!data.categories || !Array.isArray(data.categories)) {
      logger.warn('ExamsService', 'Invalid response format from /api/me/exams');
      return { categories: [] };
    }

    logger.info('ExamsService', 'User exams fetched successfully', {
      categoriesCount: data.categories.length,
      totalExams: data.categories.reduce(
        (sum, cat) => sum + (cat.exams?.length || 0),
        0,
      ),
      accessibleCategories: data.categories.filter((cat) => cat.accessible)
        .length,
    });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS, 200, {
      success: true,
      categoriesCount: data.categories.length,
    });

    return data;
  } catch (error) {
    logger.error('ExamsService', 'Failed to fetch user exams', error);
    throw error;
  }
};

/**
 * Get Exam Details and Questions by Slug
 * @param {string} slug - Exam slug
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Complete exam data with questions
 */
export const getExamBySlug = async (slug, token) => {
  try {
    // Get token from storage if not provided
    const authToken = token || (await storageService.getItem('accessToken'));

    logger.info('ExamsService', 'Fetching exam by slug', { slug });
    logger.apiRequest('GET', `/api/exams/${slug}/full`);

    const response = await makeAuthenticatedRequest(
      buildApiUrl(`${API_CONFIG.ENDPOINTS.EXAMS.BY_SLUG}/${slug}/full`),
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Exam not found');
    }

    const data = await response.json();

    logger.info('ExamsService', 'Exam fetched successfully', {
      examId: data.id,
      slug: data.slug,
      questionsCount: data.questions?.length || 0,
    });
    logger.apiResponse(
      'GET',
      `${API_CONFIG.ENDPOINTS.EXAMS.BY_SLUG}/${slug}/full`,
      200,
      { success: true },
    );

    return data;
  } catch (error) {
    logger.error('ExamsService', 'Failed to fetch exam by slug', error);
    throw error;
  }
};

/**
 * Submit Exam Results
 * @param {string} examSlug - Exam slug
 * @param {Object} results - Exam results data
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Submission response
 */
export const submitExamResults = async (examSlug, results, token) => {
  try {
    logger.info('ExamsService', 'Processing exam results locally', {
      examSlug,
      questionsAnswered: results.answers?.length || 0,
    });

    // Get exam data to calculate results
    const examData = await getExamBySlug(examSlug, token);
    if (!examData || !examData.questions) {
      throw new Error('Exam data not found for result calculation');
    }

    // Calculate score based on answers
    const totalQuestions = examData.questions.length;
    let correctAnswers = 0;
    const questionResults = [];

    examData.questions.forEach((question, index) => {
      const userAnswer = results.answers[index] ?? -1;
      
      // Handle both answerIndex (new API) and correctAnswer (legacy) fields
      const correctAnswerIndex = question.answerIndex ?? question.correctAnswer;
      const isCorrect = userAnswer === correctAnswerIndex;
      if (isCorrect) correctAnswers++;

      // Normalize options and optionImages for consistent handling
      let normalizedOptions = [];
      let normalizedOptionImages = [];

      // Handle legacy format with options.choices
      if (question.options?.choices && Array.isArray(question.options.choices)) {
        normalizedOptions = question.options.choices.map((choice) => 
          typeof choice === 'string' ? choice : (choice.text || '')
        );
        normalizedOptionImages = question.options.choices.map((choice) => 
          typeof choice === 'object' ? (choice.image || null) : null
        );
      }
      // Handle new API format with options as array and separate optionImages
      else if (Array.isArray(question.options)) {
        normalizedOptions = question.options;
        // Ensure optionImages is properly handled - if null/undefined, use empty array
        normalizedOptionImages = question.optionImages && Array.isArray(question.optionImages) 
          ? question.optionImages 
          : [];
      }
      // Handle simple array format
      else if (Array.isArray(question.options)) {
        normalizedOptions = question.options;
        normalizedOptionImages = [];
      }

      questionResults.push({
        questionId: question.id,
        question: question.text || question.question,
        userAnswer: userAnswer,
        correctAnswer: correctAnswerIndex,
        isCorrect: isCorrect,
        explanation: question.explanation || '',
        questionImage: question.imageUrl || question.image,
        options: normalizedOptions,
        optionImages: normalizedOptionImages,
      });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 80; // Default passing score

    // Generate unique result ID using timestamp + random string to prevent duplicates
    const uniqueId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const examResult = {
      id: `result_${uniqueId}`,
      examId: examData.id,
      examSlug: examSlug,
      examTitle: examData.title,
      score: score,
      correctAnswers: correctAnswers,
      totalQuestions: totalQuestions,
      timeSpent: results.timeSpent || 0,
      passed: passed,
      passingScore: 80,
      results: questionResults,
      completedAt: new Date().toISOString(),
      timestamp: new Date().toISOString(),
    };

    // Save to local storage
    await saveExamResult(examResult);

    logger.info('ExamsService', 'Exam results processed and saved locally', {
      examSlug,
      score: examResult.score,
      passed: examResult.passed,
    });

    return {
      success: true,
      result: examResult,
    };
  } catch (error) {
    logger.error('ExamsService', 'Failed to submit exam results', error);
    throw error;
  }
};

/**
 * Get User's Exam History
 * @param {string} token - JWT token
 * @returns {Promise<Object>} User's exam history
 */
export const getUserExamHistory = async (token) => {
  try {
    logger.info(
      'ExamsService',
      'Fetching user exam history from local storage',
    );

    const results = await getExamResults();

    const response = {
      results: results,
      total: results.length,
    };

    logger.info(
      'ExamsService',
      'Exam history fetched successfully from local storage',
      {
        resultsCount: response.results.length,
      },
    );

    return response;
  } catch (error) {
    logger.error('ExamsService', 'Failed to fetch exam history', error);
    throw error;
  }
};

/**
 * Save Exam Result to Local Storage
 * @param {Object} examResult - Exam result object
 * @returns {Promise<Object>} Saved result or null if failed
 */
export const saveExamResult = async (examResult) => {
  if (!storageService.isAvailable()) {
    logger.warn(
      'ExamsService',
      'Storage not available, cannot save exam result',
    );
    return null;
  }

  try {
    const existingResults = await getExamResults();
    
    // Check if result with same ID already exists
    const existingIndex = existingResults.findIndex(r => r.id === examResult.id);
    if (existingIndex !== -1) {
      logger.debug('ExamsService', 'Result already exists, skipping save', {
        resultId: examResult.id,
        examSlug: examResult.examSlug,
      });
      return existingResults[existingIndex];
    }
    
    // Check for duplicate submission of same exam within last 10 seconds
    const now = Date.now();
    const recentDuplicate = existingResults.find(r =>
      r.examSlug === examResult.examSlug &&
      r.examId === examResult.examId &&
      r.totalQuestions === examResult.totalQuestions &&
      Math.abs(now - new Date(r.completedAt).getTime()) < 10000
    );
    
    if (recentDuplicate) {
      logger.warn('ExamsService', 'Duplicate submission detected (same exam within 10s), skipping save', {
        examSlug: examResult.examSlug,
        existingResultId: recentDuplicate.id,
        newResultId: examResult.id,
        timeDiff: now - new Date(recentDuplicate.completedAt).getTime(),
      });
      return recentDuplicate;
    }
    
    const newResults = [examResult, ...existingResults].slice(0, MAX_RESULTS);

    const success = await storageService.setItem(
      EXAM_RESULTS_STORAGE_KEY,
      newResults,
    );

    if (success) {
      logger.debug('ExamsService', 'Exam result saved successfully', {
        examSlug: examResult.examSlug,
        score: examResult.score,
      });
      return examResult;
    }
  } catch (error) {
    logger.error('ExamsService', 'Failed to save exam result', error);
  }

  return null;
};

/**
 * Get All Exam Results from Local Storage
 * @returns {Promise<Array>} Array of exam results
 */
const getExamResults = async () => {
  if (!storageService.isAvailable()) {
    logger.warn(
      'ExamsService',
      'Storage not available, returning empty results',
    );
    return [];
  }

  try {
    const results = await storageService.getItem(EXAM_RESULTS_STORAGE_KEY);
    return Array.isArray(results) ? results : [];
  } catch (error) {
    logger.error('ExamsService', 'Failed to get exam results', error);
    return [];
  }
};

/**
 * Get Exam Results for Specific Exam
 * @param {string} examSlug - Exam slug
 * @returns {Promise<Array>} Array of results for the exam
 */
export const getExamResultsForExam = async (examSlug) => {
  try {
    const allResults = await getExamResults();
    return allResults.filter((result) => result.examSlug === examSlug);
  } catch (error) {
    logger.error('ExamsService', 'Failed to get exam results for exam', error);
    return [];
  }
};

/**
 * Delete Exam Result
 * @param {string} resultId - Result ID to delete
 * @returns {Promise<boolean>} Success status
 */
export const deleteExamResult = async (resultId) => {
  if (!storageService.isAvailable()) {
    logger.warn('ExamsService', 'Storage not available, cannot delete result');
    return false;
  }

  try {
    const allResults = await getExamResults();
    const filteredResults = allResults.filter((result) => result.id !== resultId);
    
    const success = await storageService.setItem(
      EXAM_RESULTS_STORAGE_KEY,
      filteredResults,
    );

    if (success) {
      logger.info('ExamsService', 'Exam result deleted successfully', {
        resultId,
      });
      return true;
    }
  } catch (error) {
    logger.error('ExamsService', 'Failed to delete exam result', error);
  }

  return false;
};

/**
 * Clear All Exam Results
 * @returns {Promise<boolean>} Success status
 */
export const clearExamResults = async () => {
  if (!storageService.isAvailable()) {
    logger.warn('ExamsService', 'Storage not available, cannot clear results');
    return false;
  }

  try {
    const success = await storageService.removeItem(EXAM_RESULTS_STORAGE_KEY);
    if (success) {
      logger.info('ExamsService', 'All exam results cleared successfully');
    }
    return success;
  } catch (error) {
    logger.error('ExamsService', 'Failed to clear exam results', error);
    return false;
  }
};

/**
 * Export Exam Results for Backup
 * @returns {Promise<Object>} Export data
 */
export const exportExamResults = async () => {
  const results = await getExamResults();

  return {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    results: results,
    count: results.length,
    platform: storageService.platform || 'unknown',
  };
};

/**
 * Import Exam Results from Backup
 * @param {Object} importData - Import data object
 * @returns {Promise<boolean>} Success status
 */
export const importExamResults = async (importData) => {
  if (!storageService.isAvailable()) {
    logger.warn('ExamsService', 'Storage not available, cannot import results');
    return false;
  }

  if (!importData || !Array.isArray(importData.results)) {
    logger.error('ExamsService', 'Invalid import data structure');
    return false;
  }

  try {
    const success = await storageService.setItem(
      EXAM_RESULTS_STORAGE_KEY,
      importData.results,
    );

    if (success) {
      logger.info('ExamsService', 'Exam results imported successfully', {
        count: importData.results.length,
      });
      return true;
    }
  } catch (error) {
    logger.error('ExamsService', 'Failed to import exam results', error);
  }

  return false;
};
