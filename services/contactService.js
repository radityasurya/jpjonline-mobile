import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';
import storageService from './storage.js';

/**
 * Contact Service
 *
 * This service handles contact form submissions and page content retrieval.
 */

/**
 * Submit Contact Form
 * @param {Object} formData - Contact form data
 * @param {string} formData.name - Sender name
 * @param {string} formData.email - Sender email
 * @param {string} formData.subject - Message subject
 * @param {string} formData.message - Message content
 * @returns {Promise<Object>} API response
 */
export const submitContactForm = async (formData) => {
    try {
        logger.info('ContactService', 'Submitting contact form', {
            email: formData.email,
            subject: formData.subject,
        });
        logger.apiRequest('POST', API_CONFIG.ENDPOINTS.CONTACT.SUBMIT, {
            email: formData.email,
            subject: formData.subject,
        });

        const response = await fetch(
            buildApiUrl(API_CONFIG.ENDPOINTS.CONTACT.SUBMIT),
            {
                method: 'POST',
                headers: API_CONFIG.HEADERS,
                body: JSON.stringify(formData),
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to send message');
        }

        const data = await response.json();

        logger.info('ContactService', 'Contact form submitted successfully', {
            ticketId: data.ticketId,
        });
        logger.apiResponse('POST', API_CONFIG.ENDPOINTS.CONTACT.SUBMIT, 200, {
            success: true,
        });

        return data;
    } catch (error) {
        logger.error('ContactService', 'Failed to submit contact form', error);
        throw error;
    }
};

/**
 * Fetch About Data
 * @returns {Promise<Object>} About page data
 */
export const fetchAboutData = async () => {
    try {
        logger.info('ContactService', 'Fetching about data');
        logger.apiRequest('GET', API_CONFIG.ENDPOINTS.PAGES.ABOUT);

        const response = await fetch(
            buildApiUrl(API_CONFIG.ENDPOINTS.PAGES.ABOUT),
            {
                method: 'GET',
                headers: API_CONFIG.HEADERS,
            },
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load about information');
        }

        const data = await response.json();

        logger.info('ContactService', 'About data fetched successfully');
        logger.apiResponse('GET', API_CONFIG.ENDPOINTS.PAGES.ABOUT, 200, {
            success: true,
        });

        return data;
    } catch (error) {
        logger.error('ContactService', 'Failed to fetch about data', error);
        throw error;
    }
};

/**
 * Legacy API compatibility functions (mock implementations)
 * These provide backward compatibility for existing code using services/api.ts
 */

/**
 * Submit Contact Form (Legacy API format)
 * @param {Object} formData - Contact form data
 * @returns {Promise<Object>} API response in legacy format
 */
export const submitContactFormLegacy = async (formData) => {
    try {
        // Simulate network delay for consistency with mock API
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Generate ticket ID
        const ticketId = `JPJ-${Date.now()}`;

        logger.info('ContactService', 'Contact form submitted (legacy format)', {
            ticketId,
        });

        return {
            success: true,
            data: ticketId,
            message:
                'Thank you for your message! We will get back to you within 24 hours.',
        };
    } catch (error) {
        logger.error('ContactService', 'Failed to submit contact form (legacy)', error);
        return {
            success: false,
            error: 'Failed to send message. Please try again.',
        };
    }
};

/**
 * Fetch About Data (Legacy API format)
 * @returns {Promise<Object>} About data in legacy format
 */
export const fetchAboutDataLegacy = async () => {
    try {
        // Simulate network delay for consistency with mock API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const aboutData = {
            title: 'About JPJOnline',
            description: "Malaysia's leading online platform for driving license preparation",
            features: [
                'Comprehensive Study Materials',
                'Expert Instructors',
                'High Success Rate',
                'Updated Content',
            ],
            achievements: {
                studentsTrained: '50,000+',
                passRate: '95%',
                studyMaterials: '500+',
                support: '24/7',
            },
            team: [
                {
                    name: 'Ahmad Rahman',
                    role: 'Chief Driving Instructor',
                    experience: '15+ years',
                    description: 'Certified JPJ instructor with expertise in Malaysian traffic laws',
                },
                {
                    name: 'Siti Nurhaliza',
                    role: 'Content Developer',
                    experience: '10+ years',
                    description: 'Educational content specialist focused on comprehensive study materials',
                },
                {
                    name: 'Raj Kumar',
                    role: 'Technology Director',
                    experience: '12+ years',
                    description: 'Leading the development of our innovative online learning platform',
                },
            ],
        };

        logger.info('ContactService', 'About data fetched (legacy format)');

        return {
            success: true,
            data: aboutData,
        };
    } catch (error) {
        logger.error('ContactService', 'Failed to fetch about data (legacy)', error);
        return {
            success: false,
            error: 'Failed to load about information',
        };
    }
};

/**
 * Fetch Page by Slug (Legacy API format)
 * @param {string} slug - Page slug
 * @returns {Promise<Object>} Page data in legacy format
 */
export const fetchPageBySlugLegacy = async (slug) => {
    try {
        // Simulate network delay for consistency with mock API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (slug === 'about') {
            const pageData = {
                id: 'cmdsielu6007anzmeb70ehvvf',
                title: 'About Us',
                slug: 'about',
                content: `
Malaysia's leading online platform for driving license preparation, helping thousands of students pass their JPJ exam with confidence.

## What We Offer

- **Comprehensive Study Materials**  
  Access detailed driving theory notes covering all JPJ exam topics and Malaysian road rules.

- **Expert Instructors**  
  Learn from certified driving instructors with years of experience in Malaysian driving education.

- **High Success Rate**  
  Over 95% of our students pass their JPJ exam on the first attempt.

- **Updated Content**  
  Our materials are regularly updated to reflect the latest JPJ regulations and requirements.

## Our Achievements

- **50,000+** Students Trained
- **95%** Pass Rate
- **500+** Study Materials
- **24/7** Support Available

## Why Choose Us?

- Comprehensive study materials
- Real JPJ exam questions
- Progress tracking
- 24/7 online access
- Expert support

## Our Team

**Ahmad Rahman**  
Chief Driving Instructor  
15+ years experience  
Certified JPJ instructor with expertise in Malaysian traffic laws and regulations.

**Siti Nurhaliza**  
Content Developer  
10+ years experience  
Educational content specialist focused on creating comprehensive study materials.

**Raj Kumar**  
Technology Director  
12+ years experience  
Leading the development of our innovative online learning platform.
`,
                createdAt: '2025-08-01T07:35:47.982Z',
                updatedAt: '2025-08-01T07:35:47.982Z',
            };

            logger.info('ContactService', 'Page fetched by slug (legacy format)', {
                slug,
            });

            return {
                success: true,
                data: pageData,
            };
        }

        return {
            success: false,
            error: 'Page not found',
        };
    } catch (error) {
        logger.error('ContactService', 'Failed to fetch page by slug (legacy)', error);
        return {
            success: false,
            error: 'Failed to load page information',
        };
    }
};