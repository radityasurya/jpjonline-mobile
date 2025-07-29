import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';
import storageService from './storage.js';
import { makeAuthenticatedRequest } from './authService.js';

/**
 * Notes Service
 * 
 * This service handles all notes-related API calls.
 */

/**
 * Get Notes Grouped by Category
 * @param {string} [token] - JWT token (optional for mobile)
 * @param {Object} [params] - Query parameters
 * @param {number} [params.page] - Page number
 * @param {number} [params.limit] - Items per page
 * @param {string} [params.search] - Search query
 * @returns {Promise<Object>} Notes grouped by category
 */
export const getNotesGroupedByCategory = async (token = null, params = {}) => {
  try {
    // Get token from storage if not provided
    const authToken = token || await storageService.getItem('accessToken');
    
    const queryParams = new URLSearchParams({
      groupByCategory: 'true',
      page: params.page || 1,
      limit: params.limit || 50,
      ...(params.search && { search: params.search })
    });

    logger.info('NotesService', 'Fetching notes grouped by category', params);
    logger.apiRequest('GET', `${API_CONFIG.ENDPOINTS.NOTES.GROUPED_BY_CATEGORY}?${queryParams.toString()}`);
    
    const headers = getAuthHeaders(authToken);
    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.NOTES.GROUPED_BY_CATEGORY}?${queryParams.toString()}`), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch notes');
    }
    
    const data = await response.json();
    
    logger.info('NotesService', 'Notes grouped by category fetched successfully', { 
      categoriesCount: data.allCategories?.length || 0,
      totalNotes: data.total || 0
    });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.NOTES.GROUPED_BY_CATEGORY, 200, { 
      success: true, 
      categoriesCount: data.allCategories?.length || 0
    });
    
    return data;

    // Mock response - kept for debugging
    // logger.debug('NotesService', 'Using mock notes grouped response');
    // await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    // 
    // const mockResponse = {
    //   notesByCategory: {
    //     "car-manual": {
    //       category: {
    //         id: "8a5f5407-b044-430b-8316-89ec09434473",
    //         title: "Car Manual",
    //         slug: "car-manual"
    //       },
    //       notes: [
    //         {
    //           id: "cmdi356l7006ls0bb3a7naq7x",
    //           title: "Manual Car Safety and Maintenance",
    //           slug: "manual-car-safety-and-maintenance",
    //           content: "# Manual Car Safety and Maintenance\n\nComprehensive guide to maintaining and safely operating manual transmission vehicles...",
    //           order: 1,
    //           authorId: "cmdi3542c0000s0bbcpg01xdh",
    //           topicId: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
    //           createdAt: "2025-01-25T00:30:52.315Z",
    //           updatedAt: "2025-01-25T00:30:52.315Z",
    //           author: {
    //             id: "cmdi3542c0000s0bbcpg01xdh",
    //             name: "Admin User",
    //             email: "admin@jpjonline.com"
    //           },
    //           topic: {
    //             id: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
    //             title: "Manual Car Safety and Maintenance",
    //             slug: "manual-car-safety-and-maintenance",
    //             category: {
    //               id: "8a5f5407-b044-430b-8316-89ec09434473",
    //               title: "Car Manual",
    //               slug: "car-manual"
    //             }
    //           }
    //         }
    //       ],
    //       count: 3
    //     }
    //   },
    //   allCategories: [
    //     {
    //       id: "3ad51333-4c80-44b3-aadb-e68cb3e3bd4f",
    //       title: "Car Automatic",
    //       slug: "car-automatic"
    //     }
    //   ],
    //   total: 7,
    //   page: 1,
    //   limit: 50,
    //   totalPages: 1,
    //   groupedByCategory: true
    // };
    // 
    // logger.info('NotesService', 'Notes grouped by category fetched successfully', { 
    //   categoriesCount: mockResponse.allCategories.length,
    //   totalNotes: mockResponse.total 
    // });
    // logger.apiResponse('GET', '/api/notes', 200, { 
    //   success: true, 
    //   categoriesCount: mockResponse.allCategories.length 
    // });
    // 
    // return mockResponse;
  } catch (error) {
    logger.error('NotesService', 'Failed to fetch notes grouped by category', error);
    throw error;
  }
};

/**
 * Get Note by Slug
 * @param {string} slug - Note slug
 * @param {string} [token] - JWT token (optional for mobile)
 * @returns {Promise<Object>} Note details
 */
export const getNoteById = async (id, token = null) => {
  try {
    // Get token from storage if not provided
    const authToken = token || await storageService.getItem('accessToken');
    
    logger.info('NotesService', 'Fetching note by ID', { id });
    logger.apiRequest('GET', `${API_CONFIG.ENDPOINTS.NOTES.BY_ID}/${id}`);
    
    const headers = authToken ? getAuthHeaders(authToken) : API_CONFIG.HEADERS;
    const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.NOTES.BY_SLUG}/${slug}`), {
      method: 'GET',
      headers,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Note not found');
    }
    
    const data = await response.json();
    
    logger.info('NotesService', 'Note fetched successfully', { 
      noteId: data.id, 
      slug: data.slug 
    });
    logger.apiResponse('GET', `${API_CONFIG.ENDPOINTS.NOTES.BY_SLUG}/${slug}`, 200, { success: true });
    
    return data;

    // Mock response - kept for debugging
    // logger.debug('NotesService', 'Using mock note detail response');
    // await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    // 
    // // Find note from mock data by slug
    // const allMockNotes = [
    //   {
    //     id: "cmdi356l7006ls0bb3a7naq7x",
    //     title: "Manual Car Safety and Maintenance",
    //     slug: "manual-car-safety-and-maintenance",
    //     content: "# Manual Car Safety and Maintenance\n\n## Introduction\nManual transmission vehicles require specific safety considerations...",
    //     order: 1,
    //     authorId: "cmdi3542c0000s0bbcpg01xdh",
    //     topicId: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
    //     createdAt: "2025-01-25T00:30:52.315Z",
    //     updatedAt: "2025-01-25T00:30:52.315Z",
    //     author: {
    //       id: "cmdi3542c0000s0bbcpg01xdh",
    //       name: "Admin User",
    //       email: "admin@jpjonline.com"
    //     },
    //     topic: {
    //       id: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
    //       title: "Manual Car Safety and Maintenance",
    //       slug: "manual-car-safety-and-maintenance",
    //       category: {
    //         id: "8a5f5407-b044-430b-8316-89ec09434473",
    //         title: "Car Manual",
    //         slug: "car-manual"
    //       }
    //     }
    //   }
    // ];
    // 
    // const note = allMockNotes.find(n => n.slug === slug);
    // 
    // if (!note) {
    //   logger.warn('NotesService', 'Note not found', { slug });
    //   throw new Error('Note not found');
    // }
    // 
    // logger.info('NotesService', 'Note fetched successfully', { 
    //   noteId: note.id, 
    //   slug: note.slug 
    // });
    // logger.apiResponse('GET', `/api/notes/${slug}`, 200, { success: true });
    // 
    // return note;
  } catch (error) {
    logger.error('NotesService', 'Failed to fetch note by slug', error);
    throw error;
  }
};

/**
 * Search Notes
 * @param {string} query - Search query
 * @param {string} [token] - JWT token (optional for mobile)
 * @returns {Promise<Object>} Search results
 */
export const searchNotes = async (query, token = null) => {
  try {
    // Get token from storage if not provided
    const authToken = token || await storageService.getItem('accessToken');
    
    logger.info('NotesService', 'Searching notes', { query });
    logger.apiRequest('GET', `${API_CONFIG.ENDPOINTS.NOTES.SEARCH}?q=${encodeURIComponent(query)}`);
    
    const response = await makeAuthenticatedRequest(buildApiUrl(`${API_CONFIG.ENDPOINTS.NOTES.BY_ID}/${id}`), {
      method: 'GET',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Search failed');
    }
    
    const data = await response.json();
    
    logger.info('NotesService', 'Search completed', { 
      noteId: data.note.id, 
      slug: data.note.slug 
    });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.NOTES.SEARCH, 200, { 
      success: true, 
      resultsCount: data.total || 0
    }
    )
    logger.apiResponse('GET', `${API_CONFIG.ENDPOINTS.NOTES.BY_ID}/${id}`, 200, { success: true });
    
    return data.note;

    // Mock response - kept for debugging
    // logger.debug('NotesService', 'Using mock search response');
    // await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    // 
    // // Simple mock search - in real implementation, backend handles this
    // const mockResults = {
    //   results: [],
    //   total: 0,
    //   query: query
    // };
    // 
    // logger.info('NotesService', 'Search completed', { 
    //   query, 
    //   resultsCount: mockResults.total 
    // });
    // logger.apiResponse('GET', '/api/notes/search', 200, { 
    //   success: true, 
    //   resultsCount: mockResults.total 
    // });
    // 
    // return mockResults;
  } catch (error) {
    logger.error('NotesService', 'Failed to fetch note by ID', error);
    throw error;
  }
};