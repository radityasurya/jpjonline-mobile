import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import {
  FileText,
  Trophy,
  Clock,
  Crown,
  Play,
  Lock,
  Settings,
  Search,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { getUserExams, getUserExamHistory } from '@/services';

// Types for the new API structure
interface ApiExam {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
  premium: boolean;
  accessible: boolean;
}

interface ExamCategory {
  id: string;
  name: string;
  accessible: boolean;
  exams: ApiExam[];
}

interface ExamsApiResponse {
  categories: ExamCategory[];
}

interface ExamResult {
  id: string;
  examSlug: string;
  examTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
}

export default function TestsScreen() {
  const { user } = useAuth();
  const [examsData, setExamsData] = useState<ExamsApiResponse | null>(null);
  const [filteredExams, setFilteredExams] = useState<ApiExam[]>([]);
  const [testResults, setTestResults] = useState<ExamResult[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'available' | 'results'>(
    'available'
  );

  useEffect(() => {
    fetchAllExams();
    fetchTestResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, examsData]);

  const fetchAllExams = async () => {
    setIsLoading(true);
    logger.debug('TestsScreen', 'Fetching available exams');
    try {
      const response = await getUserExams(user?.token || 'mock-token');
      logger.info('TestsScreen', 'Exams loaded successfully', { 
        categoriesCount: response.categories.length,
        userTier: user?.subscription 
      });
      setExamsData(response);
      
      // Filter out categories that are not accessible to the user
      const accessibleCategories = response.categories.filter(category => 
        category.accessible && category.name !== 'Premium Only'
      );
      setCategories([{ id: 'all', name: 'All', accessible: true, exams: [] }, ...accessibleCategories]);
    } catch (error) {
      logger.error('TestsScreen', 'Error fetching exams', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!examsData) {
      setFilteredExams([]);
      return;
    }

    // Flatten all exams from all categories
    let allExams: ApiExam[] = [];
    examsData.categories.forEach(category => {
      allExams = [...allExams, ...category.exams];
    });

    let filtered = [...allExams];

    // Apply category filter
    if (selectedCategory !== 'All') {
      const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
      if (selectedCategoryData) {
        filtered = selectedCategoryData.exams;
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (exam) =>
          exam.title.toLowerCase().includes(query) ||
          (exam.description && exam.description.toLowerCase().includes(query))
      );
    }

    setFilteredExams(filtered);
  };

  const fetchTestResults = async () => {
    logger.debug('TestsScreen', 'Fetching exam results');
    try {
      const response = await getUserExamHistory(user?.token || 'mock-token');
      logger.debug('TestsScreen', 'Exam results loaded', { count: response.results.length });
      setTestResults(response.results);
    } catch (error) {
      logger.error('TestsScreen', 'Error fetching exam results', error);
    }
  };

  const startExam = (exam: ApiExam) => {
    if (!exam.accessible) {
      logger.warn('TestsScreen', 'Attempted to start inaccessible exam', { examSlug: exam.slug });
      return;
    }

    logger.userAction('Exam started', { 
      examId: exam.id, 
      examSlug: exam.slug,
      examTitle: exam.title,
      isPremium: exam.premium 
    });
    logger.navigation('Exam', { examSlug: exam.slug });
    router.push(`/exam/${exam.slug}`);
  };

  const getExamTypeColor = (premium: boolean) => {
    return premium ? '#FF9800' : '#4CAF50';
  };

  const getExamTypeText = (premium: boolean) => {
    return premium ? 'Premium' : 'Free';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderExamItem = ({ item: exam }: { item: ApiExam }) => (
    <TouchableOpacity
      style={[
        styles.examCard,
        !exam.accessible && styles.disabledCard,
      ]}
      onPress={() => startExam(exam)}
      disabled={!exam.accessible}
    >
      <View style={styles.examHeader}>
        <View style={styles.examInfo}>
          <Text style={styles.examTitle}>{exam.title}</Text>
          {exam.description && (
            <Text style={styles.examDescription} numberOfLines={2}>
              {exam.description}
            </Text>
          )}
        </View>
        <View style={styles.examBadges}>
          <View style={[
            styles.modeBadge,
            { backgroundColor: exam.examMode === 'OPEN' ? '#E8F5E8' : '#FFF3E0' }
          ]}>
            <Text style={[
              styles.modeText,
              { color: exam.examMode === 'OPEN' ? '#4CAF50' : '#FF9800' }
            ]}>
              {exam.examMode}
            </Text>
          </View>
          {exam.premium && (
            <Crown size={16} color="#FF9800" />
          )}
          {!exam.accessible && <Lock size={16} color="#CCCCCC" />}
        </View>
      </View>

      <View style={styles.examStats}>
        <View style={styles.statItem}>
          <FileText size={14} color="#666666" />
          <Text style={styles.statText}>{exam.questionCount} questions</Text>
        </View>
        
        {exam.totalTimeDuration && (
          <View style={styles.statItem}>
            <Clock size={14} color="#666666" />
            <Text style={styles.statText}>{formatDuration(exam.totalTimeDuration)}</Text>
          </View>
        )}
        
        <View style={styles.statItem}>
          <Trophy size={14} color="#666666" />
          <Text style={styles.statText}>{exam.passRate}% pass</Text>
        </View>
      </View>

      <View style={styles.examFooter}>
        <View style={styles.examType}>
          <Text style={[
            styles.examTypeText,
            { color: getExamTypeColor(exam.premium) }
          ]}>
            {getExamTypeText(exam.premium)}
          </Text>
        </View>
        
        {!exam.accessible && (
          <Text style={styles.lockedText}>Premium Required</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading exams...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'available' && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('available')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'available' && styles.activeTabText,
            ]}
          >
            Available Exams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            selectedTab === 'results' && styles.activeTabButton,
          ]}
          onPress={() => setSelectedTab('results')}
        >
          <Text
            style={[
              styles.tabText,
              selectedTab === 'results' && styles.activeTabText,
            ]}
          >
            Results
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'available' && (
        <>
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Search size={20} color="#666666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search tests..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category.name &&
                      styles.selectedCategoryButton,
                    !category.accessible && styles.disabledCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                  disabled={!category.accessible}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category.name &&
                        styles.selectedCategoryText,
                      !category.accessible && styles.disabledCategoryText,
                    ]}
                  >
                    {category.name}
                    {!category.accessible && ' 🔒'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.scrollHintContainer}>
              <View style={styles.scrollHintOverlay} />
              <View style={styles.scrollHintArrow}>
                <Text style={styles.scrollHintText}>→</Text>
              </View>
            </View>
          </View>
        </>
      )}

      <View style={styles.content}>
        {selectedTab === 'available' ? (
          <FlatList
            data={filteredExams}
            renderItem={renderExamItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Trophy size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Exams Found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No exams available in this category'}
                </Text>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={testResults}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item: result }) => (
              <TouchableOpacity
                style={styles.resultCard}
                onPress={() =>
                  router.push(
                    `/exam/result/${result.examSlug}?resultData=${encodeURIComponent(JSON.stringify(result))}`
                  )
                }
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultTitle}>{result.examTitle}</Text>
                  <View
                    style={[
                      styles.scoreBadge,
                      {
                        backgroundColor:
                          result.score >= 80
                            ? '#4CAF50'
                            : result.score >= 60
                            ? '#FF9800'
                            : '#F44336',
                      },
                    ]}
                  >
                    <Text style={styles.scoreText}>{result.score}%</Text>
                  </View>
                </View>
                <Text style={styles.resultDate}>
                  Completed on {formatDate(result.completedAt)}
                </Text>
                <View style={styles.resultStats}>
                  <Text style={styles.resultStat}>Score: {result.score}%</Text>
                  <Text style={styles.resultStat}>
                    Status: {result.passed ? 'Passed' : 'Failed'}
                  </Text>
                  <Text style={styles.resultStat}>
                    Time: {result.timeSpent} minutes
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Trophy size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Results</Text>
                <Text style={styles.emptyMessage}>
                  You haven't completed any exams yet. Start your first exam
                  now!
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}

  const formatDuration = (seconds: number) => {
    if (!seconds) return null;
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  activeTabText: {
    color: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333333',
  },
  categoriesContainer: {
    height: 50,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingRight: 40, // Extra padding to show scroll hint
  },
  scrollHintContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  scrollHintOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  scrollHintArrow: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollHintText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: 'bold',
  },
  categoryButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#333333',
  },
  disabledCategoryButton: {
    backgroundColor: '#F0F0F0',
    opacity: 0.6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  disabledCategoryText: {
    color: '#CCCCCC',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  examCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledCard: {
    opacity: 0.6,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  examInfo: {
    flex: 1,
    marginRight: 12,
  },
  examBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  modeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  examDescription: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  examStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  examFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  examFooterLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  examFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  startButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  lockedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  lockedText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#999999',
    marginLeft: 4,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 12,
  },
  scoreBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resultDate: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  resultStats: {
    gap: 8,
  },
  resultStat: {
    fontSize: 12,
    color: '#666666',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});