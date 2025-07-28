import { API_CONFIG, buildApiUrl, getAuthHeaders } from '../config/api.js';
import { logger } from '../utils/logger.js';

/**
 * Notes Service
 * 
 * This service handles all notes-related API calls.
 * Currently using mock responses - uncomment real API calls when CORS is configured.
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
    const queryParams = new URLSearchParams({
      groupByCategory: 'true',
      page: params.page || 1,
      limit: params.limit || 50,
      ...(params.search && { search: params.search })
    });

    logger.info('NotesService', 'Fetching notes grouped by category', params);
    logger.apiRequest('GET', `/api/notes?${queryParams.toString()}`);
    
    // TODO: Uncomment when CORS is configured on backend
    // const headers = token ? getAuthHeaders(token) : API_CONFIG.HEADERS;
    // const response = await fetch(buildApiUrl(`/api/notes?${queryParams.toString()}`), {
    //   method: 'GET',
    //   headers,
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Failed to fetch notes');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('NotesService', 'Using mock notes grouped response');
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
    
    const mockResponse = {
      notesByCategory: {
        "car-manual": {
          category: {
            id: "8a5f5407-b044-430b-8316-89ec09434473",
            title: "Car Manual",
            slug: "car-manual"
          },
          notes: [
            {
              id: "cmdi356l7006ls0bb3a7naq7x",
              title: "Manual Car Safety and Maintenance",
              slug: "manual-car-safety-and-maintenance",
              content: "# Manual Car Safety and Maintenance\n\nComprehensive guide to maintaining and safely operating manual transmission vehicles...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
              createdAt: "2025-01-25T00:30:52.315Z",
              updatedAt: "2025-01-25T00:30:52.315Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
                title: "Manual Car Safety and Maintenance",
                slug: "manual-car-safety-and-maintenance",
                category: {
                  id: "8a5f5407-b044-430b-8316-89ec09434473",
                  title: "Car Manual",
                  slug: "car-manual"
                }
              }
            },
            {
              id: "cmdi356kn0061s0bb7o5mtmtj",
              title: "Manual Transmission Driving Techniques",
              slug: "manual-transmission-driving-techniques",
              content: "# Manual Transmission Driving Techniques\n\nMaster the art of manual transmission driving with these essential techniques...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "3c6d3888-2397-41cb-80f5-a9be356391f1",
              createdAt: "2025-01-25T00:30:52.296Z",
              updatedAt: "2025-01-25T00:30:52.296Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "3c6d3888-2397-41cb-80f5-a9be356391f1",
                title: "Manual Transmission Driving Techniques",
                slug: "manual-transmission-driving-techniques",
                category: {
                  id: "8a5f5407-b044-430b-8316-89ec09434473",
                  title: "Car Manual",
                  slug: "car-manual"
                }
              }
            },
            {
              id: "cmdi356l8006ns0bbqmu1xmjq",
              title: "Clutch System Maintenance",
              slug: "clutch-system-maintenance",
              content: "Clutch System Maintenance\n\n### Clutch Inspection\n- **Clutch pedal feel**: Should have proper resistance and travel\n- **Engagement point**: Consistent friction point location...",
              order: 2,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
              createdAt: "2025-01-25T00:30:52.317Z",
              updatedAt: "2025-01-25T00:30:52.317Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
                title: "Manual Car Safety and Maintenance",
                slug: "manual-car-safety-and-maintenance",
                category: {
                  id: "8a5f5407-b044-430b-8316-89ec09434473",
                  title: "Car Manual",
                  slug: "car-manual"
                }
              }
            }
          ],
          count: 3
        },
        "motorcycle": {
          category: {
            id: "cee4221d-e099-4cae-9377-e6b967996a3e",
            title: "Motorcycle",
            slug: "motorcycle"
          },
          notes: [
            {
              id: "cmdi356jf004zs0bbijl6xvil",
              title: "Motorcycle Road Signs and Traffic Signals",
              slug: "motorcycle-road-signs-and-traffic-signals",
              content: "# Motorcycle Road Signs and Traffic Signals\n\nUnderstanding road signs and traffic signals specific to motorcycle operation...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "46f4b076-5631-445c-a9db-a1546e3b1733",
              createdAt: "2025-01-25T00:30:52.251Z",
              updatedAt: "2025-01-25T00:30:52.251Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "46f4b076-5631-445c-a9db-a1546e3b1733",
                title: "Motorcycle Road Signs and Traffic Signals",
                slug: "motorcycle-road-signs-and-traffic-signals",
                category: {
                  id: "cee4221d-e099-4cae-9377-e6b967996a3e",
                  title: "Motorcycle",
                  slug: "motorcycle"
                }
              }
            },
            {
              id: "cmdi356k2005hs0bbxk1eag3g",
              title: "Motorcycle Right-of-Way Rules",
              slug: "motorcycle-right-of-way-rules",
              content: "# Motorcycle Right-of-Way Rules\n\nEssential right-of-way rules every motorcycle rider must know...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "87dc8122-be00-4668-bc72-c9c9203691d5",
              createdAt: "2025-01-25T00:30:52.274Z",
              updatedAt: "2025-01-25T00:30:52.274Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "87dc8122-be00-4668-bc72-c9c9203691d5",
                title: "Motorcycle Right-of-Way Rules",
                slug: "motorcycle-right-of-way-rules",
                category: {
                  id: "cee4221d-e099-4cae-9377-e6b967996a3e",
                  title: "Motorcycle",
                  slug: "motorcycle"
                }
              }
            }
          ],
          count: 2
        },
        "car-automatic": {
          category: {
            id: "3ad51333-4c80-44b3-aadb-e68cb3e3bd4f",
            title: "Car Automatic",
            slug: "car-automatic"
          },
          notes: [
            {
              id: "cmdi356mf007ts0bbxjzhmwfw",
              title: "Automatic Car Maintenance and Troubleshooting",
              slug: "automatic-car-maintenance-and-troubleshooting",
              content: "# Automatic Car Maintenance and Troubleshooting\n\nComplete guide to maintaining automatic transmission vehicles...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "6e00efa7-8167-4641-95ce-aac74a4aec6c",
              createdAt: "2025-01-25T00:30:52.360Z",
              updatedAt: "2025-01-25T00:30:52.360Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "6e00efa7-8167-4641-95ce-aac74a4aec6c",
                title: "Automatic Car Maintenance and Troubleshooting",
                slug: "automatic-car-maintenance-and-troubleshooting",
                category: {
                  id: "3ad51333-4c80-44b3-aadb-e68cb3e3bd4f",
                  title: "Car Automatic",
                  slug: "car-automatic"
                }
              }
            },
            {
              id: "cmdi356lt0077s0bbaq9nur3e",
              title: "Automatic Transmission Operation",
              slug: "automatic-transmission-operation",
              content: "# Automatic Transmission Operation\n\nLearn how to properly operate automatic transmission vehicles...",
              order: 1,
              authorId: "cmdi3542c0000s0bbcpg01xdh",
              topicId: "b65c1089-5722-4490-b9ae-53f5770d3eba",
              createdAt: "2025-01-25T00:30:52.338Z",
              updatedAt: "2025-01-25T00:30:52.338Z",
              author: {
                id: "cmdi3542c0000s0bbcpg01xdh",
                name: "Admin User",
                email: "admin@jpjonline.com"
              },
              topic: {
                id: "b65c1089-5722-4490-b9ae-53f5770d3eba",
                title: "Automatic Transmission Operation",
                slug: "automatic-transmission-operation",
                category: {
                  id: "3ad51333-4c80-44b3-aadb-e68cb3e3bd4f",
                  title: "Car Automatic",
                  slug: "car-automatic"
                }
              }
            }
          ],
          count: 2
        }
      },
      allCategories: [
        {
          id: "3ad51333-4c80-44b3-aadb-e68cb3e3bd4f",
          title: "Car Automatic",
          slug: "car-automatic"
        },
        {
          id: "8a5f5407-b044-430b-8316-89ec09434473",
          title: "Car Manual",
          slug: "car-manual"
        },
        {
          id: "cee4221d-e099-4cae-9377-e6b967996a3e",
          title: "Motorcycle",
          slug: "motorcycle"
        }
      ],
      total: 7,
      page: 1,
      limit: 50,
      totalPages: 1,
      groupedByCategory: true
    };
    
    logger.info('NotesService', 'Notes grouped by category fetched successfully', { 
      categoriesCount: mockResponse.allCategories.length,
      totalNotes: mockResponse.total 
    });
    logger.apiResponse('GET', '/api/notes', 200, { 
      success: true, 
      categoriesCount: mockResponse.allCategories.length 
    });
    
    return mockResponse;
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
export const getNoteBySlug = async (slug, token = null) => {
  try {
    logger.info('NotesService', 'Fetching note by slug', { slug });
    logger.apiRequest('GET', `/api/notes/${slug}`);
    
    // TODO: Uncomment when CORS is configured on backend
    // const headers = token ? getAuthHeaders(token) : API_CONFIG.HEADERS;
    // const response = await fetch(buildApiUrl(`/api/notes/${slug}`), {
    //   method: 'GET',
    //   headers,
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Note not found');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('NotesService', 'Using mock note detail response');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    // Find note from mock data by slug
    const allMockNotes = [
      {
        id: "cmdi356l7006ls0bb3a7naq7x",
        title: "Manual Car Safety and Maintenance",
        slug: "manual-car-safety-and-maintenance",
        content: "# Manual Car Safety and Maintenance\n\n## Introduction\nManual transmission vehicles require specific safety considerations and maintenance practices. This comprehensive guide covers essential aspects of manual car operation and upkeep.\n\n## Safety Fundamentals\n\n### Pre-Drive Inspection\n- **Clutch pedal feel**: Check for proper resistance and travel\n- **Gear lever operation**: Ensure smooth shifting through all gears\n- **Parking brake**: Verify proper engagement and release\n- **Fluid levels**: Check clutch fluid and transmission oil\n\n### Starting Procedures\n1. **Clutch fully depressed**: Always press clutch when starting\n2. **Neutral gear**: Ensure transmission is in neutral\n3. **Parking brake engaged**: Keep parking brake on until ready to move\n4. **Check surroundings**: Ensure safe starting conditions\n\n## Maintenance Schedule\n\n### Daily Checks\n- Clutch pedal operation\n- Gear shifting smoothness\n- Unusual noises or vibrations\n- Fluid leak inspection\n\n### Monthly Maintenance\n- Clutch fluid level check\n- Transmission oil inspection\n- Linkage lubrication\n- Cable adjustment verification\n\n### Annual Service\n- Complete clutch system inspection\n- Transmission oil change\n- Clutch adjustment\n- Professional diagnosis\n\n## Common Issues and Solutions\n\n### Clutch Problems\n- **Slipping clutch**: Usually requires clutch replacement\n- **Hard pedal**: May indicate hydraulic or cable issues\n- **Grabbing clutch**: Often due to oil contamination\n- **Noise**: Could indicate worn release bearing\n\n### Transmission Issues\n- **Hard shifting**: May need fluid change or linkage adjustment\n- **Grinding gears**: Possible synchronizer wear\n- **Jumping out of gear**: Serious issue requiring immediate attention\n- **Leaking fluid**: Seal replacement usually needed\n\n## Safety Best Practices\n\n### Hill Driving\n- Use handbrake for hill starts\n- Master clutch control techniques\n- Prevent rollback situations\n- Choose appropriate gears for gradients\n\n### Emergency Procedures\n- Know how to stop safely in emergencies\n- Understand engine braking techniques\n- Practice stall recovery procedures\n- Maintain escape route awareness\n\n## Conclusion\nProper maintenance and safe operation of manual transmission vehicles ensures longevity, reliability, and safety. Regular inspections and adherence to maintenance schedules prevent costly repairs and dangerous situations.",
        order: 1,
        authorId: "cmdi3542c0000s0bbcpg01xdh",
        topicId: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
        createdAt: "2025-01-25T00:30:52.315Z",
        updatedAt: "2025-01-25T00:30:52.315Z",
        author: {
          id: "cmdi3542c0000s0bbcpg01xdh",
          name: "Admin User",
          email: "admin@jpjonline.com"
        },
        topic: {
          id: "d26f143d-a71d-49bc-b6e2-306ca76ae8f3",
          title: "Manual Car Safety and Maintenance",
          slug: "manual-car-safety-and-maintenance",
          category: {
            id: "8a5f5407-b044-430b-8316-89ec09434473",
            title: "Car Manual",
            slug: "car-manual"
          }
        }
      },
      {
        id: "cmdi356kn0061s0bb7o5mtmtj",
        title: "Manual Transmission Driving Techniques",
        slug: "manual-transmission-driving-techniques",
        content: "# Manual Transmission Driving Techniques\n\n## Introduction\nMastering manual transmission driving requires understanding proper techniques, timing, and vehicle control. This guide provides comprehensive instruction for safe and efficient manual driving.\n\n## Basic Operation\n\n### Clutch Control\n- **Friction point**: Learn to feel the engagement point\n- **Smooth release**: Gradual clutch release for smooth starts\n- **Coordination**: Balance clutch, throttle, and brake\n- **Practice**: Regular practice builds muscle memory\n\n### Gear Shifting\n1. **Press clutch fully**: Complete disengagement required\n2. **Move gear lever**: Smooth, deliberate movements\n3. **Release clutch gradually**: Coordinate with throttle\n4. **Match engine speed**: Rev matching for smooth shifts\n\n## Advanced Techniques\n\n### Hill Starts\n- **Handbrake method**: Use parking brake to prevent rollback\n- **Clutch control**: Find friction point before releasing brake\n- **Throttle coordination**: Apply appropriate engine power\n- **Smooth release**: Coordinate clutch, throttle, and brake\n\n### Downshifting\n- **Rev matching**: Blip throttle to match engine speed\n- **Smooth engagement**: Prevent jerky deceleration\n- **Engine braking**: Use lower gears to assist braking\n- **Heel-toe technique**: Advanced technique for performance driving\n\n## Traffic Situations\n\n### Stop-and-Go Traffic\n- **Clutch control**: Master slow-speed modulation\n- **Gap management**: Maintain safe following distance\n- **Minimize stops**: Anticipate traffic flow\n- **Clutch rest**: Don't ride clutch pedal in traffic\n\n### Highway Driving\n- **Smooth acceleration**: Progressive throttle application\n- **Efficient shifting**: Optimal shift points for fuel economy\n- **Passing technique**: Quick downshifts for acceleration\n- **Cruise control**: Maintain steady speeds when possible\n\n## Common Mistakes\n\n### Clutch Abuse\n- **Riding the clutch**: Keeping foot on pedal\n- **Slipping starts**: Excessive clutch slip\n- **Hard engagement**: Sudden clutch release\n- **Wrong gear selection**: Using inappropriate gears\n\n### Shifting Errors\n- **Grinding gears**: Incomplete clutch disengagement\n- **Forced shifting**: Forcing gear lever\n- **Wrong timing**: Poor shift timing\n- **No rev matching**: Ignoring engine speed matching\n\n## Maintenance Considerations\n\n### Driving Habits Impact\n- **Smooth operation**: Reduces component wear\n- **Proper technique**: Extends clutch life\n- **Appropriate speeds**: Prevents transmission stress\n- **Regular practice**: Maintains skill level\n\n### Warning Signs\n- **Clutch slip**: Engine revs without acceleration\n- **Hard shifting**: Difficulty engaging gears\n- **Unusual noises**: Grinding or whining sounds\n- **Vibrations**: Excessive drivetrain vibration\n\n## Conclusion\nProper manual transmission driving techniques ensure vehicle longevity, fuel efficiency, and driving safety. Regular practice and attention to proper technique development are essential for mastery.",
        order: 1,
        authorId: "cmdi3542c0000s0bbcpg01xdh",
        topicId: "3c6d3888-2397-41cb-80f5-a9be356391f1",
        createdAt: "2025-01-25T00:30:52.296Z",
        updatedAt: "2025-01-25T00:30:52.296Z",
        author: {
          id: "cmdi3542c0000s0bbcpg01xdh",
          name: "Admin User",
          email: "admin@jpjonline.com"
        },
        topic: {
          id: "3c6d3888-2397-41cb-80f5-a9be356391f1",
          title: "Manual Transmission Driving Techniques",
          slug: "manual-transmission-driving-techniques",
          category: {
            id: "8a5f5407-b044-430b-8316-89ec09434473",
            title: "Car Manual",
            slug: "car-manual"
          }
        }
      }
    ];
    
    const note = allMockNotes.find(n => n.slug === slug);
    
    if (!note) {
      logger.warn('NotesService', 'Note not found', { slug });
      throw new Error('Note not found');
    }
    
    logger.info('NotesService', 'Note fetched successfully', { 
      noteId: note.id, 
      slug: note.slug 
    });
    logger.apiResponse('GET', `/api/notes/${slug}`, 200, { success: true });
    
    return note;
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
    logger.info('NotesService', 'Searching notes', { query });
    logger.apiRequest('GET', `/api/notes/search?q=${encodeURIComponent(query)}`);
    
    // TODO: Uncomment when CORS is configured on backend
    // const headers = token ? getAuthHeaders(token) : API_CONFIG.HEADERS;
    // const response = await fetch(buildApiUrl(`/api/notes/search?q=${encodeURIComponent(query)}`), {
    //   method: 'GET',
    //   headers,
    // });
    // 
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Search failed');
    // }
    // 
    // return await response.json();

    // Mock response - remove when API is ready
    logger.debug('NotesService', 'Using mock search response');
    await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network delay
    
    // Simple mock search - in real implementation, backend handles this
    const mockResults = {
      results: [],
      total: 0,
      query: query
    };
    
    logger.info('NotesService', 'Search completed', { 
      query, 
      resultsCount: mockResults.total 
    });
    logger.apiResponse('GET', '/api/notes/search', 200, { 
      success: true, 
      resultsCount: mockResults.total 
    });
    
    return mockResults;
  } catch (error) {
    logger.error('NotesService', 'Search failed', error);
    throw error;
  }
};