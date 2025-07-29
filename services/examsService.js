import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';

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
    logger.info('ExamsService', 'Fetching user exams');
    logger.apiRequest('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS);
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS), {
    //   method: 'GET',
    //   headers: getAuthHeaders(token),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to fetch exams');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('ExamsService', 'Using mock user exams response');
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    const mockResponse = {
      categories: [
        {
          id: "cmdi3567r000qs0bbww6kauqz",
          name: "Car",
          accessible: true,
          exams: [
            {
              id: "cmdi3568s001rs0bb7hy7abm1",
              slug: "bahagian-c-car-simulasi",
              title: "Bahagian C Car (Simulasi)",
              description: "Advanced car simulation test covering complex traffic scenarios",
              questionCount: 15,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi3568o001ls0bbln16ud5z",
              slug: "bahagian-c-car-latihan",
              title: "Bahagian C Car (Latihan)",
              description: "Practice test for car driving skills assessment",
              questionCount: 12,
              premium: false,
              accessible: true
            },
            {
              id: "cmdi3568j001fs0bbyw7zndlc",
              slug: "bahagian-b-car-simulasi",
              title: "Bahagian B Car (Simulasi)",
              description: "Intermediate car simulation covering road signs and rules",
              questionCount: 20,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi3568f0019s0bbzh43ak2o",
              slug: "bahagian-b-car-latihan",
              title: "Bahagian B Car (Latihan)",
              description: "Basic practice test for car theory knowledge",
              questionCount: 18,
              premium: false,
              accessible: true
            },
            {
              id: "cmdi3568a0011s0bb9coe6xoo",
              slug: "bahagian-a-car-simulasi",
              title: "Bahagian A Car (Simulasi)",
              description: "Foundation car theory simulation test",
              questionCount: 25,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi3567y000ts0bb9nkh2ua0",
              slug: "bahagian-a-car-latihan",
              title: "Bahagian A Car (Latihan)",
              description: "Basic car theory practice test for beginners",
              questionCount: 22,
              premium: false,
              accessible: true
            }
          ]
        },
        {
          id: "cmdi3567u000rs0bb792ad92k",
          name: "Motorcycle",
          accessible: true,
          exams: [
            {
              id: "cmdi3569j002vs0bb3s6jood6",
              slug: "bahagian-c-motorcycle-simulasi",
              title: "Bahagian C Motorcycle (Simulasi)",
              description: "Advanced motorcycle simulation test",
              questionCount: 15,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi3569e002ps0bb69u9t4zk",
              slug: "bahagian-c-motorcycle-latihan",
              title: "Bahagian C Motorcycle (Latihan)",
              description: "Practice test for motorcycle skills",
              questionCount: 12,
              premium: false,
              accessible: true
            },
            {
              id: "cmdi3569a002js0bbb5teg7px",
              slug: "bahagian-b-motorcycle-simulasi",
              title: "Bahagian B Motorcycle (Simulasi)",
              description: "Intermediate motorcycle theory simulation",
              questionCount: 20,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi35696002ds0bb2oeo3zl6",
              slug: "bahagian-b-motorcycle-latihan",
              title: "Bahagian B Motorcycle (Latihan)",
              description: "Basic motorcycle theory practice",
              questionCount: 18,
              premium: false,
              accessible: true
            },
            {
              id: "cmdi356910025s0bbzj63acx1",
              slug: "bahagian-a-motorcycle-simulasi",
              title: "Bahagian A Motorcycle (Simulasi)",
              description: "Foundation motorcycle theory simulation",
              questionCount: 25,
              premium: true,
              accessible: true
            },
            {
              id: "cmdi3568w001xs0bbn5a4wsru",
              slug: "bahagian-a-motorcycle-latihan",
              title: "Bahagian A Motorcycle (Latihan)",
              description: "Basic motorcycle theory for beginners",
              questionCount: 22,
              premium: false,
              accessible: true
            }
          ]
        },
        {
          id: "cmdi3567w000ss0bb123premium",
          name: "Premium Only",
          accessible: false,
          exams: [
            {
              id: "cmdi3569premium001",
              slug: "advanced-comprehensive-test",
              title: "Advanced Comprehensive Test",
              description: "Complete JPJ simulation test - Premium only",
              questionCount: 50,
              premium: true,
              accessible: false
            }
          ]
        }
      ]
    };
    
    logger.info('ExamsService', 'User exams fetched successfully', { 
      categoriesCount: mockResponse.categories.length,
      totalExams: mockResponse.categories.reduce((sum, cat) => sum + cat.exams.length, 0)
    });
    logger.apiResponse('GET', API_CONFIG.ENDPOINTS.EXAMS.USER_EXAMS, 200, { 
      success: true, 
      categoriesCount: mockResponse.categories.length 
    });
    
    return mockResponse;
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
    logger.info('ExamsService', 'Fetching exam by slug', { slug });
    logger.apiRequest('GET', `/api/exams/${slug}/full`);
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(`/api/exams/${slug}/full`), {
    //   method: 'GET',
    //   headers: getAuthHeaders(token),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Exam not found');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('ExamsService', 'Using mock exam detail response');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    // Mock exam data based on slug
    const mockExams = {
      "bahagian-c-car-simulasi": {
        id: "cmdi3568s001rs0bb7hy7abm1",
        slug: "bahagian-c-car-simulasi",
        title: "Bahagian C Car (Simulasi)",
        description: "Advanced car simulation test covering complex traffic scenarios",
        examMode: "CLOSED",
        totalTimeDuration: 2700,
        passRate: 90,
        category: {
          id: "cmdi3567r000qs0bbww6kauqz",
          name: "Car"
        },
        questions: [
          {
            id: "cmdi3568t001ts0bbq31af5ob",
            text: "Apakah tindakan jika melihat pejalan kaki melintas di zebra crossing?",
            options: [
              "Teruskan",
              "Beri laluan",
              "Bunyikan hon"
            ],
            answerIndex: 1,
            explanation: "Pejalan kaki mempunyai hak laluan di zebra crossing. Pemandu mesti berhenti dan memberi laluan.",
            imageUrl: "https://images.pexels.com/photos/3807277/pexels-photo-3807277.jpeg?auto=compress&w=400",
            order: 0
          },
          {
            id: "cmdi3568u001vs0bbtwnxxy4a",
            text: "Apakah warna lampu brek belakang kenderaan?",
            options: [
              "Merah",
              "Kuning",
              "Putih"
            ],
            answerIndex: 0,
            explanation: "Lampu brek belakang mestilah berwarna merah untuk memberikan amaran yang jelas kepada kenderaan di belakang.",
            imageUrl: "https://images.pexels.com/photos/97079/pexels-photo-97079.jpeg?auto=compress&w=400",
            order: 1
          },
          {
            id: "cmdi3568v001xs0bbtest003",
            text: "Bila perlu menggunakan lampu isyarat?",
            options: [
              "Hanya di persimpangan",
              "Sebelum menukar lorong atau membelok",
              "Hanya pada waktu malam",
              "Tidak perlu jika tiada kenderaan lain"
            ],
            answerIndex: 1,
            explanation: "Lampu isyarat mesti digunakan sebelum menukar lorong atau membelok untuk memberi amaran kepada pengguna jalan raya lain.",
            imageUrl: null,
            order: 2
          }
        ]
      },
      "bahagian-c-car-latihan": {
        id: "cmdi3568o001ls0bbln16ud5z",
        slug: "bahagian-c-car-latihan",
        title: "Bahagian C Car (Latihan)",
        description: "Practice test for car driving skills assessment",
        examMode: "OPEN",
        totalTimeDuration: 2700,
        passRate: 90,
        category: {
          id: "cmdi3567r000qs0bbww6kauqz",
          name: "Car"
        },
        questions: [
          {
            id: "cmdi3568p001ns0bbpractice1",
            text: "Apakah had laju maksimum di kawasan perumahan?",
            options: [
              "30 km/j",
              "50 km/j",
              "60 km/j",
              "70 km/j"
            ],
            answerIndex: 1,
            explanation: "Had laju maksimum di kawasan perumahan adalah 50 km/j untuk memastikan keselamatan penduduk.",
            imageUrl: null,
            order: 0
          },
          {
            id: "cmdi3568q001ps0bbpractice2",
            text: "Apakah yang dimaksudkan dengan 'berhenti penuh' di persimpangan?",
            options: [
              "Perlahan sahaja",
              "Berhenti sepenuhnya dan periksa kiri kanan",
              "Berhenti hanya jika ada kenderaan lain",
              "Hon dan teruskan"
            ],
            answerIndex: 1,
            explanation: "Berhenti penuh bermaksud kenderaan mesti berhenti sepenuhnya dan memastikan keselamatan sebelum meneruskan perjalanan.",
            imageUrl: "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&w=400",
            order: 1
          }
        ]
      }
    };
    
    const examData = mockExams[slug];
    
    if (!examData) {
      logger.warn('ExamsService', 'Exam not found', { slug });
      throw new Error('Exam not found');
    }
    
    logger.info('ExamsService', 'Exam fetched successfully', { 
      examId: examData.id, 
      slug: examData.slug,
      questionsCount: examData.questions.length
    });
    logger.apiResponse('GET', `/api/exams/${slug}/full`, 200, { success: true });
    
    return examData;
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
    logger.info('ExamsService', 'Submitting exam results', { 
      examSlug, 
      questionsAnswered: results.answers?.length || 0 
    });
    logger.apiRequest('POST', `/api/exams/${examSlug}/submit`, { 
      answersCount: results.answers?.length || 0 
    });
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl(`/api/exams/${examSlug}/submit`), {
    //   method: 'POST',
    //   headers: getAuthHeaders(token),
    //   body: JSON.stringify(results),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to submit exam results');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('ExamsService', 'Using mock exam submission response');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    
    // Calculate mock score based on answers
    const totalQuestions = results.answers?.length || 0;
    const correctAnswers = Math.floor(totalQuestions * (0.6 + Math.random() * 0.4)); // 60-100% range
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= 80;
    
    const mockResponse = {
      success: true,
      result: {
        id: `result_${Date.now()}`,
        examSlug: examSlug,
        score: score,
        correctAnswers: correctAnswers,
        totalQuestions: totalQuestions,
        passed: passed,
        completedAt: new Date().toISOString(),
        timeSpent: results.timeSpent || 0
      }
    };
    
    logger.info('ExamsService', 'Exam results submitted successfully', { 
      examSlug, 
      score: mockResponse.result.score,
      passed: mockResponse.result.passed
    });
    logger.apiResponse('POST', `/api/exams/${examSlug}/submit`, 200, { 
      success: true, 
      score: mockResponse.result.score 
    });
    
    return mockResponse;
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
    logger.info('ExamsService', 'Fetching user exam history');
    logger.apiRequest('GET', '/api/me/exam-history');
    
    // TODO: Uncomment when CORS is configured on backend
    // const response = await fetch(buildApiUrl('/api/me/exam-history'), {
    //   method: 'GET',
    //   headers: getAuthHeaders(token),
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to fetch exam history');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('ExamsService', 'Using mock exam history response');
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    
    const mockResponse = {
      results: [
        {
          id: "result_1",
          examSlug: "bahagian-c-car-simulasi",
          examTitle: "Bahagian C Car (Simulasi)",
          score: 85,
          passed: true,
          completedAt: "2025-01-20T10:30:00.000Z",
          timeSpent: 25
        },
        {
          id: "result_2",
          examSlug: "bahagian-b-car-latihan",
          examTitle: "Bahagian B Car (Latihan)",
          score: 92,
          passed: true,
          completedAt: "2025-01-18T14:15:00.000Z",
          timeSpent: 18
        }
      ],
      total: 2
    };
    
    logger.info('ExamsService', 'Exam history fetched successfully', { 
      resultsCount: mockResponse.results.length 
    });
    logger.apiResponse('GET', '/api/me/exam-history', 200, { 
      success: true, 
      resultsCount: mockResponse.results.length 
    });
    
    return mockResponse;
  } catch (error) {
    logger.error('ExamsService', 'Failed to fetch exam history', error);
    throw error;
  }
};