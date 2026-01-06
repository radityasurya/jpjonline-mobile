import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { logger } from '@/utils/logger';
import { Trophy } from 'lucide-react-native';
import { router } from 'expo-router';
import { getUserExams, getUserExamHistory } from '@/services';
import ExamCard from '@/components/tests/ExamCard';
import ResultCard from '@/components/tests/ResultCard';
import SearchBar from '@/components/shared/SearchBar';
import CategorySelector from '@/components/shared/CategorySelector';
import TabSelector from '@/components/tests/TabSelector';
import SortButton, { SortOption } from '@/components/tests/SortButton';

// Types for the new API structure
interface ApiExam {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
  crown?: boolean;
  accessible?: boolean;
  category: string;
  mode?: string;
  totalTimeDuration?: number | null;
  passRate?: number;
  timerType?: boolean;
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
  const { t } = useI18n();
  const [examsData, setExamsData] = useState<ExamsApiResponse | null>(null);
  const [filteredExams, setFilteredExams] = useState<ApiExam[]>([]);
  const [testResults, setTestResults] = useState<ExamResult[]>([]);
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'available' | 'results'>(
    'available',
  );
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');

  useEffect(() => {
    // Check if user is logged in before fetching exams
    if (!user) {
      logger.warn('TestsScreen', 'User not logged in, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    const fetchAllExams = async () => {
      setIsLoading(true);
      logger.debug('TestsScreen', 'Fetching available exams');
      try {
        const response = (await getUserExams('')) as ExamsApiResponse;
        logger.info('TestsScreen', 'Exams loaded successfully', {
          categoriesCount: response.categories.length,
          userTier: user?.tier,
          response: response,
        });
        setExamsData(response);

        // Show all categories without filtering
        setCategories([
          { id: 'all', name: 'All', accessible: true, exams: [] },
          ...response.categories,
        ]);
      } catch (error) {
        logger.error('TestsScreen', 'Error fetching exams', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchTestResults = async () => {
      logger.debug('TestsScreen', 'Fetching exam results');
      try {
        const response = (await getUserExamHistory('')) as {
          results: ExamResult[];
          total: number;
        };
        logger.debug('TestsScreen', 'Exam results loaded', {
          count: response.results.length,
        });
        setTestResults(response.results);
      } catch (error) {
        logger.error('TestsScreen', 'Error fetching exam results', error);
      }
    };

    fetchAllExams();
    fetchTestResults();
  }, [user]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, examsData, sortOption]);

  const applyFilters = () => {
    if (!examsData) {
      setFilteredExams([]);
      return;
    }

    // Flatten all exams from all categories
    let allExams: ApiExam[] = [];
    examsData.categories.forEach((category) => {
      allExams = [...allExams, ...category.exams];
    });

    let filtered = [...allExams];

    // Apply category filter
    if (selectedCategory !== 'All') {
      const selectedCategoryData = categories.find(
        (cat) => cat.name === selectedCategory,
      );
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
          (exam.description && exam.description.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    filtered = applySorting(filtered, sortOption);

    setFilteredExams(filtered);
  };

  const applySorting = (exams: ApiExam[], sort: SortOption): ApiExam[] => {
    const sorted = [...exams];

    switch (sort) {
      case 'name-asc':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'name-desc':
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'questions-asc':
        return sorted.sort((a, b) => a.questionCount - b.questionCount);
      case 'questions-desc':
        return sorted.sort((a, b) => b.questionCount - a.questionCount);
      case 'newest':
        return sorted.sort((a, b) => b.id.localeCompare(a.id));
      case 'oldest':
        return sorted.sort((a, b) => a.id.localeCompare(b.id));
      default:
        return sorted;
    }
  };

  const startExam = (exam: ApiExam) => {
    logger.userAction('Exam started', {
      examId: exam.id,
      examSlug: exam.slug,
      examTitle: exam.title,
      crown: exam.crown,
    });
    logger.navigation('Exam', { examSlug: exam.slug });
    router.push(`/exam/${exam.slug}`);
  };

  const handleResultPress = (result: ExamResult) => {
    router.push(
      `/exam/result/${result.examSlug}?resultData=${encodeURIComponent(JSON.stringify(result))}`,
    );
  };

  const renderExamItem = ({ item: exam }: { item: ApiExam }) => (
    <ExamCard exam={exam} onPress={startExam} />
  );

  const renderResultItem = ({ item: result }: { item: ExamResult }) => (
    <ResultCard result={result} onPress={handleResultPress} />
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
        <TabSelector activeTab={selectedTab} onTabChange={setSelectedTab} />
      </View>

      {selectedTab === 'available' && (
        <>
          <View style={styles.searchRow}>
            <SearchBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              placeholder={'Cari ' + t('exams.title').toLowerCase() + '...'}
            />
            <SortButton currentSort={sortOption} onSortChange={setSortOption} />
          </View>
          <View style={styles.categoryContainer}>
            <CategorySelector
              categories={categories.map((cat) => ({
                id: cat.id,
                title: cat.name,
                slug: cat.id,
              }))}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
            />
          </View>
        </>
      )}
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
              <Text style={styles.emptyTitle}>{t('exams.examNotFound')}</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Cuba laraskan istilah carian anda'
                  : 'Tiada ujian tersedia dalam kategori ini'}
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
          renderItem={renderResultItem}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Trophy size={64} color="#CCCCCC" />
              <Text style={styles.emptyTitle}>Tiada Keputusan</Text>
              <Text style={styles.emptyMessage}>
                Anda belum melengkapkan sebarang ujian lagi. Mulakan ujian
                pertama anda sekarang!
              </Text>
            </View>
          )}
        />
      )}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  categoryContainer: {
    marginBottom: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
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
