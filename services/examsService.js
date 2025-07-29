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
 * Get All Exams for Current User
 * @param {string} token - JWT token
 * @returns {Promise<Object>} Exams grouped by category with access information
 */
export const getUserExams = async (token) => {
  try {
    // Get token from storage if not provided
    const authToken = token || await storageService.getItem('accessToken');
    
    logger.info('ExamsService', 'Fetching user exams');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS);
    
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS), {
      method: 'GET',
      headers: getAuthHeaders(authToken),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch exams');
    }
    
    const data = await response.json();
    
    logger.info('ExamsService', 'User exams fetched successfully', { 
      categoriesCount: data.categories?.length || 0,
      totalExams: data.categories?.reduce((sum, cat) => sum + (cat.exams?.length || 0), 0) || 0
    });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS, 200, { 
      success: true, 
      categoriesCount: data.categories?.length || 0
    });
    
    return data;

    // Mock response - kept for debugging
    // logger.debug('ExamsService', 'Using mock user exams response');
    // await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    // 
    // const mockResponse = {
    //   categories: [
    //     {
    //       id: "cmdi3567r000qs0bbww6kauqz",
    //       name: "Car",
    //       accessible: true,
    //       exams: [
    //         {
    //           id: "cmdi3568s001rs0bb7hy7abm1",
    //           slug: "bahagian-c-car-simulasi",
    //           title: "Bahagian C Car (Simulasi)",
    //           description: "Advanced car simulation test covering complex traffic scenarios",
    //           questionCount: 15,
    //           examMode: "CLOSED",
    //           totalTimeDuration: 2700,
    //           passRate: 90,
    //           premium: true,
    //           accessible: true
    //         },
    //         {
    //           id: "cmdi3568o001ls0bbln16ud5z",
    //           slug: "bahagian-c-car-latihan",
    //           title: "Bahagian C Car (Latihan)",
    //           description: "Practice test for car driving skills assessment",
    //           questionCount: 12,
    //           examMode: "OPEN",
    //           totalTimeDuration: 1800,
    //           passRate: 75,
    //           premium: false,
    //           accessible: true
    //         }
    //       ]
    //     }
    //   ]
    // };
    // 
    // logger.info('ExamsService', 'User exams fetched successfully', { 
    //   categoriesCount: mockResponse.categories.length,
    //   totalExams: mockResponse.categories.reduce((sum, cat) => sum + cat.exams.length, 0)
    // });
    // logger.apiResponse('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS, 200, { 
    //   success: true, 
    //   categoriesCount: mockResponse.categories.length 
    // });
    // 
    // return mockResponse;
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
    const authToken = token || await storageService.getItem('accessToken');
    
    logger.info('ExamsService', 'Fetching exam by slug', { slug });
    logger.apiRequest('GET', `/api/exams/${slug}/full`);
    
    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.EXAMS.BY_SLUG}/${slug}/full`), {
      method: 'GET',
      headers: getAuthHeaders(authToken),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Exam not found');
    }
    
    const data = await response.json();
    
    logger.info('ExamsService', 'Exam fetched successfully', { 
      examId: data.id, 
      slug: data.slug,
      questionsCount: data.questions?.length || 0
    });
    logger.apiResponse('GET', `${API_CONFIG.ENDPOINTS.EXAMS.BY_SLUG}/${slug}/full`, 200, { success: true });
    
    return data;

    // Mock response - kept for debugging
    // logger.debug('ExamsService', 'Using mock exam detail response');
    // await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    // 
    // // Mock exam data based on slug
    // const mockExams = {
    //   "bahagian-c-car-simulasi": {
    //     id: "cmdi3568s001rs0bb7hy7abm1",
    //     slug: "bahagian-c-car-simulasi",
    //     title: "Bahagian C Car (Simulasi)",
    //     description: "Advanced car simulation test covering complex traffic scenarios",
    //     examMode: "CLOSED",
    //     totalTimeDuration: 2700,
    //     passRate: 90,
    //     category: {
    //       id: "cmdi3567r000qs0bbww6kauqz",
    //       name: "Car"
    //     },
    //     questions: [
    //       {
    //         id: "cmdi3568t001ts0bbq31af5ob",
    //         text: "Apakah tindakan jika melihat pejalan kaki melintas di zebra crossing?",
    //         options: [
    //           "Teruskan",
    //           "Beri laluan",
    //           "Bunyikan hon"
    //         ],
    //         answerIndex: 1,
    //         explanation: "Pejalan kaki mempunyai hak laluan di zebra crossing. Pemandu mesti berhenti dan memberi laluan.",
    //         imageUrl: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&w=400",
    //         order: 0
    //       }
    //     ]
    //   }
    // };
    // 
    // const examData = mockExams[slug];
    // 
    // if (!examData) {
    //   logger.warn('ExamsService', 'Exam not found', { slug });
    //   throw new Error('Exam not found');
    // }
    // 
    // logger.info('ExamsService', 'Exam fetched successfully', { 
    //   examId: examData.id, 
    //   slug: examData.slug,
    //   questionsCount: examData.questions.length
    // });
    // logger.apiResponse('GET', `/api/exams/${slug}/full`, 200, { success: true });
    // 
    // return examData;
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
      questionsAnswered: results.answers?.length || 0 
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
      const isCorrect = userAnswer === question.answerIndex;
      if (isCorrect) correctAnswers++;

      questionResults.push({
        questionId: question.id,
        question: question.text,
        userAnswer: userAnswer,
        correctAnswer: question.answerIndex,
        isCorrect: isCorrect,
        explanation: question.explanation || '',
        questionImage: question.imageUrl,
        options: question.options
      });
    });

    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 80; // Default passing score

    const examResult = {
      id: `result_${Date.now()}`,
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
      timestamp: new Date().toISOString()
    };

    // Save to local storage
    await saveExamResult(examResult);

    logger.info('ExamsService', 'Exam results processed and saved locally', { 
      examSlug, 
      score: examResult.score,
      passed: examResult.passed
    });

    return {
      success: true,
      result: examResult
    };

    // Mock response - kept for debugging
    // logger.debug('ExamsService', 'Using mock exam submission response');
    // await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    // 
    // // Calculate mock score based on answers
    // const totalQuestions = results.answers?.length || 0;
    // const correctAnswers = Math.floor(totalQuestions * (0.6 + Math.random() * 0.4)); // 60-100% range
    // const score = Math.round((correctAnswers / totalQuestions) * 100);
    // const passed = score >= 80;
    // 
    // const mockResponse = {
    //   success: true,
    //   result: {
    //     id: `result_${Date.now()}`,
    //     examSlug: examSlug,
    //     score: score,
    //     correctAnswers: correctAnswers,
    //     totalQuestions: totalQuestions,
    //     passed: passed,
    //     completedAt: new Date().toISOString(),
    //     timeSpent: results.timeSpent || 0
    //   }
    // };
    // 
    // logger.info('ExamsService', 'Exam results submitted successfully', { 
    //   examSlug, 
    //   score: mockResponse.result.score,
    //   passed: mockResponse.result.passed
    // });
    // logger.apiResponse('POST', `/api/exams/${examSlug}/submit`, 200, { 
    //   success: true, 
    //   score: mockResponse.result.score 
    // });
    // 
    // return mockResponse;
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
    logger.info('ExamsService', 'Fetching user exam history from local storage');
    
    const results = await getExamResults();
    
    const response = {
      results: results,
      total: results.length
    };
    
    logger.info('ExamsService', 'Exam history fetched successfully from local storage', { 
      resultsCount: response.results.length
    });
    
    return response;

    // Mock response - kept for debugging
    // logger.debug('ExamsService', 'Using mock exam history response');
    // await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    // 
    // const mockResponse = {
    //   results: [
    //     {
    //       id: "result_1",
    //       examSlug: "bahagian-c-car-simulasi",
    //       examTitle: "Bahagian C Car (Simulasi)",
    //       score: 85,
    //       passed: true,
    //       completedAt: "2025-01-20T10:30:00.000Z",
    //       timeSpent: 25
    //     },
    //     {
    //       id: "result_2",
    //       examSlug: "bahagian-b-car-latihan",
    //       examTitle: "Bahagian B Car (Latihan)",
    //       score: 92,
    //       passed: true,
    //       completedAt: "2025-01-18T14:15:00.000Z",
    //       timeSpent: 18
    //     }
    //   ],
    //   total: 2
    // };
    // 
    // logger.info('ExamsService', 'Exam history fetched successfully', { 
    //   resultsCount: mockResponse.results.length 
    // });
    // logger.apiResponse('GET', '/api/me/exam-history', 200, { 
    //   success: true, 
    //   resultsCount: mockResponse.results.length 
    // });
    // 
    // return mockResponse;
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
const saveExamResult = async (examResult) => {
  if (!storageService.isAvailable()) {
    logger.warn('ExamsService', 'Storage not available, cannot save exam result');
    return null;
  }

  try {
    const existingResults = await getExamResults();
    const newResults = [examResult, ...existingResults].slice(0, MAX_RESULTS);
    
    const success = await storageService.setItem(EXAM_RESULTS_STORAGE_KEY, newResults);
    
    if (success) {
      logger.debug('ExamsService', 'Exam result saved successfully', { 
        examSlug: examResult.examSlug,
        score: examResult.score 
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
    logger.warn('ExamsService', 'Storage not available, returning empty results');
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
    return allResults.filter(result => result.examSlug === examSlug);
  } catch (error) {
    logger.error('ExamsService', 'Failed to get exam results for exam', error);
    return [];
  }
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
    platform: storageService.platform || 'unknown'
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
    const success = await storageService.setItem(EXAM_RESULTS_STORAGE_KEY, importData.results);
    
    if (success) {
      logger.info('ExamsService', 'Exam results imported successfully', { 
        count: importData.results.length 
      });
      return true;
    }
  } catch (error) {
    logger.error('ExamsService', 'Failed to import exam results', error);
  }
  
  return false;
};