import { API_CONFIG, getAuthHeaders, buildApiUrl } from '../config/api.js';

/**
 * Fetch page content by slug
 * @param {string} slug - Page slug (e.g., 'about')
 * @returns {Promise<Object>} Page data
 */
export const getPageBySlug = async (slug) => {
  try {
    const token = null; // Get from auth context if needed
    const response = await fetch(buildApiUrl(`/api/pages/slug/${slug}`), {
      method: 'GET',
      headers: getAuthHeaders(token),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching page:', error);
    throw error;
  }
};
