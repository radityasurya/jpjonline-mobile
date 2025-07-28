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
import api from '@/services/api';
import { Exam, ExamResult } from '@/types/api';

export default function TestsScreen() {
  const { user } = useAuth();
  const [allTests, setAllTests] = useState<Exam[]>([]);
  const [filteredTests, setFilteredTests] = useState<Exam[]>([]);
  const [testResults, setTestResults] = useState<ExamResult[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'available' | 'results'>(
    'available'
  );

  useEffect(() => {
    fetchCategories();
    fetchAllTests();
    fetchTestResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, allTests]);

  const fetchCategories = async () => {
    try {
      const response = await api.exams.fetchCategories();
      if (response.success) {
        setCategories(response.data!);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllTests = async () => {
    setIsLoading(true);
    try {
      const response = await api.exams.fetchExams(user?.subscription);
      if (response.success) {
        setAllTests(response.data!);
        setHasMore(response.data!.length > 10);
      }
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTests];

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((test) => test.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(query) ||
          test.description.toLowerCase().includes(query) ||
          test.category.toLowerCase().includes(query)
      );
    }

    setFilteredTests(filtered);
    setPage(1);
  };

  const fetchTestResults = async () => {
    try {
      const response = await api.exams.getExamResults();
      if (response.success) {
        setTestResults(response.data!);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
    }
  };

  const startTest = (test: Exam) => {
    router.push(`/exam/${test.id}`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return '#4CAF50';
      case 'Medium':
        return '#FF9800';
      case 'Hard':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderTestItem = ({ item: test }: { item: Exam }) => (
    <TestCard
      test={test}
      onPress={() => startTest(test)}
      getDifficultyColor={getDifficultyColor}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading tests...</Text>
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
            Available Tests
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
                  key={category}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category &&
                      styles.selectedCategoryButton,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.selectedCategoryText,
                    ]}
                  >
                    {category}
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
            data={filteredTests}
            renderItem={renderTestItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Trophy size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Tests Found</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery
                    ? 'Try adjusting your search terms'
                    : 'No tests available in this category'}
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
                    `/exam/result/${
                      result.examId
                    }?resultData=${encodeURIComponent(JSON.stringify(result))}`
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
                  <Text style={styles.resultStat}>
                    {result.correctAnswers} / {result.totalQuestions} correct
                  </Text>
                  <Text style={styles.resultStat}>
                    Status: {result.passed ? 'Passed' : 'Failed'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyState}>
                <Trophy size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>No Results</Text>
                <Text style={styles.emptyMessage}>
                  You haven't completed any tests yet. Start your first test
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

// Separate TestCard component for better performance
function TestCard({ test, onPress, getDifficultyColor }: any) {
  return (
    <View style={styles.testCard}>
      <View style={styles.testHeader}>
        <View style={styles.testInfo}>
          <Text style={styles.testTitle}>{test.title}</Text>
          <Text style={styles.testDescription}>{test.description}</Text>
        </View>
        <View style={styles.testBadges}>
          {test.isPremium && (
            <Crown size={16} color="#FF9800" style={styles.badgeIcon} />
          )}
          <Settings
            size={16}
            color={test.settings.type === 'open' ? '#4CAF50' : '#FF9800'}
            style={styles.badgeIcon}
          />
          {!test.isAccessible && <Lock size={16} color="#CCCCCC" />}
        </View>
      </View>

      <View style={styles.testDetails}>
        <View style={styles.detailItem}>
          <FileText size={16} color="#666666" />
          <Text style={styles.detailText}>{test.questions} questions</Text>
        </View>
        <View style={styles.detailItem}>
          <Clock size={16} color="#666666" />
          <Text style={styles.detailText}>{test.duration} min</Text>
        </View>
        <View style={styles.detailItem}>
          <Trophy size={16} color={getDifficultyColor(test.difficulty)} />
          <Text
            style={[
              styles.detailText,
              { color: getDifficultyColor(test.difficulty) },
            ]}
          >
            {test.difficulty}
          </Text>
        </View>
      </View>

      <View style={styles.testTypeIndicator}>
        <Text style={styles.testTypeText}>
          {test.settings.type === 'open'
            ? 'Open Test (Immediate Feedback)'
            : 'Closed Test (Review at End)'}
        </Text>
      </View>

      <View style={styles.testFooter}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{test.category}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.startButton,
            !test.isAccessible && styles.disabledButton,
          ]}
          onPress={onPress}
          disabled={!test.isAccessible}
        >
          <Play size={16} color="#FFFFFF" />
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

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
  selectedCategoryButton: {
    backgroundColor: '#333333',
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
  content: {
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  testCard: {
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
  testHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  testInfo: {
    flex: 1,
    marginRight: 12,
  },
  testBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeIcon: {
    marginLeft: 4,
  },
  testTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  testDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  testDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  testTypeIndicator: {
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 12,
  },
  testTypeText: {
    fontSize: 12,
    color: '#1976D2',
    fontWeight: '500',
  },
  testFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1976D2',
  },
  premiumBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
  },
  startButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
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
