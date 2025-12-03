import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { logger } from '@/utils/logger';
import { activityService, ACTIVITY_TYPES } from '@/services';
import { getCategoryBySlug } from '@/services/notesService';
import {
  getPlatformInfo,
  isBookmarked,
  toggleBookmark,
} from '@/services/bookmarkService';
import SearchBar from '@/components/shared/SearchBar';
import BookmarkFilter from '@/components/shared/BookmarkFilter';
import NoteCard from '@/components/notes/NoteCard';

// Types for the new API structure
interface ApiNote {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
  authorId: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
  author?: {
    id: string;
    name: string;
    email: string;
  };
  topic?: {
    id: string;
    title: string;
    slug: string;
    category?: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface Topic {
  id: string;
  title: string;
  slug: string;
}

interface CategoryData {
  id: string;
  title: string;
  slug: string;
  topics: TopicWithNotes[];
}

interface TopicWithNotes extends Topic {
  notes: ApiNote[];
}

interface CategoryResponse {
  data: CategoryData;
}

export default function NotesScreen() {
  const { user } = useAuth();
  const { t } = useI18n();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<ApiNote[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkStates, setBookmarkStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Check if features are supported on current platform
  const platformInfo = getPlatformInfo() as { supported?: boolean } | undefined;
  const featuresSupported = platformInfo?.supported || false;

  useEffect(() => {
    // Check if user is logged in before fetching notes
    if (!user) {
      logger.warn('NotesScreen', 'User not logged in, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    fetchNotesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!category || !user || !featuresSupported) return;
    loadBookmarkStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, user]);

  useEffect(() => {
    applyFilters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedTopicId,
    searchQuery,
    showBookmarksOnly,
    bookmarkStates,
    category,
  ]);

  const loadBookmarkStates = () => {
    if (!category || !featuresSupported) {
      logger.info('NotesScreen', 'Bookmark features disabled on web platform');
      return;
    }

    const states: { [key: string]: boolean } = {};
    category.topics.forEach((topic) => {
      topic.notes.forEach((note) => {
        states[note.id] = isBookmarked(note.id);
      });
    });
    setBookmarkStates(states);
  };
  const fetchNotesData = async () => {
    setIsLoading(true);
    logger.debug('NotesScreen', 'Fetching semua-kategori category data');
    try {
      const categoryRes = await getCategoryBySlug('semua-kategori');
      const categoryData = categoryRes as CategoryResponse;
      setCategory(categoryData.data || null);

      logger.debug('NotesScreen', 'Category data loaded', {
        topicsCount: categoryData.data?.topics?.length || 0,
      });
    } catch (error) {
      logger.error('NotesScreen', 'Error fetching notes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!category) {
      setFilteredNotes([]);
      return;
    }

    try {
      let filtered: ApiNote[] = [];

      // If showing bookmarks only, get all notes from all topics first
      if (showBookmarksOnly) {
        // Get all notes from all topics
        category.topics.forEach((topic) => {
          filtered = [...filtered, ...topic.notes];
        });
        // Filter to only bookmarked notes
        filtered = filtered.filter((note) => bookmarkStates[note.id]);
      } else {
        // Get notes based on selected topic
        if (selectedTopicId === 'all') {
          // Show all notes from all topics
          category.topics.forEach((topic) => {
            filtered = [...filtered, ...topic.notes];
          });
        } else {
          // Show notes from selected topic only
          const selectedTopic = category.topics.find(
            (t) => t.id === selectedTopicId,
          );
          if (selectedTopic) {
            filtered = [...selectedTopic.notes];
          }
        }
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter((note) =>
          note.title.toLowerCase().includes(query),
        );
      }

      setFilteredNotes(filtered);
    } catch (error) {
      logger.error('NotesScreen', 'Error applying filters', error);
      setFilteredNotes([]);
    }
  };

  const getSelectedTopicTitle = () => {
    if (selectedTopicId === 'all') return 'Semua Topik';
    const topic = category?.topics.find((t) => t.id === selectedTopicId);
    return topic?.title || 'Pilih Topik';
  };

  const formatTopicTitle = (title: string) => {
    return title
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleTopicSelect = (topicId: string) => {
    setSelectedTopicId(topicId);
    setShowTopicDropdown(false);
  };

  const handleToggleBookmark = async (noteId: string) => {
    if (!featuresSupported) {
      logger.warn(
        'NotesScreen',
        'Bookmark features not available on web platform',
      );
      return;
    }

    logger.userAction('Bookmark toggled', { noteId });
    try {
      // Find note details for activity tracking
      const note = filteredNotes.find((n) => n.id === noteId);

      const newBookmarkStatus = toggleBookmark(noteId);
      setBookmarkStates((prev) => ({
        ...prev,
        [noteId]: newBookmarkStatus,
      }));

      // Track activity with note details
      if (note) {
        const activityType = newBookmarkStatus
          ? ACTIVITY_TYPES.NOTE_BOOKMARKED
          : ACTIVITY_TYPES.NOTE_UNBOOKMARKED;
        activityService.addActivity(activityType, {
          noteId: note.id,
          noteTitle: note.title,
          noteSlug: note.slug,
          category: note.topic?.category?.title,
          userId: user?.id,
        });
      }

      logger.info('NotesScreen', 'Bookmark toggled successfully', {
        noteId,
        newStatus: newBookmarkStatus,
      });
    } catch (error) {
      logger.error('NotesScreen', 'Error toggling bookmark', error);
    }
  };

  const openNote = (note: ApiNote) => {
    logger.userAction('Note opened', {
      noteId: note.id,
      title: note.title,
      slug: note.slug,
    });

    // Track note viewing activity
    activityService.addActivity(ACTIVITY_TYPES.NOTE_VIEWED, {
      noteId: note.id,
      noteTitle: note.title,
      noteSlug: note.slug,
      category: note.topic?.category?.title,
      userId: user?.id,
    });

    // Navigate to note detail screen using ID
    logger.navigation('NoteDetail', { noteId: note.id });
    router.push(`/notes/${note.id}`);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>{t('notes.failedToLoad')}...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder={t('notes.searchTopics')}
      />

      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {/* Topic Dropdown */}
          {category?.topics && category.topics.length > 0 && (
            <View style={styles.topicDropdownContainer}>
              <TouchableOpacity
                style={styles.topicDropdownButton}
                onPress={() => setShowTopicDropdown(true)}
              >
                <Text style={styles.topicDropdownText}>
                  {formatTopicTitle(getSelectedTopicTitle())}
                </Text>
                <ChevronDown size={20} color="#666666" />
              </TouchableOpacity>

              <Modal
                visible={showTopicDropdown}
                transparent
                animationType="fade"
                onRequestClose={() => setShowTopicDropdown(false)}
              >
                <TouchableOpacity
                  style={styles.modalOverlay}
                  activeOpacity={1}
                  onPress={() => setShowTopicDropdown(false)}
                >
                  <View style={styles.dropdownModal}>
                    <ScrollView>
                      <TouchableOpacity
                        style={[
                          styles.dropdownItem,
                          selectedTopicId === 'all' &&
                            styles.dropdownItemActive,
                        ]}
                        onPress={() => handleTopicSelect('all')}
                      >
                        <Text
                          style={[
                            styles.dropdownItemText,
                            selectedTopicId === 'all' &&
                              styles.dropdownItemTextActive,
                          ]}
                        >
                          {formatTopicTitle('Semua Topik')}
                        </Text>
                      </TouchableOpacity>
                      {category.topics.map((topic) => (
                        <TouchableOpacity
                          key={topic.id}
                          style={[
                            styles.dropdownItem,
                            selectedTopicId === topic.id &&
                              styles.dropdownItemActive,
                          ]}
                          onPress={() => handleTopicSelect(topic.id)}
                        >
                          <Text
                            style={[
                              styles.dropdownItemText,
                              selectedTopicId === topic.id &&
                                styles.dropdownItemTextActive,
                            ]}
                          >
                            {formatTopicTitle(topic.title)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </TouchableOpacity>
              </Modal>
            </View>
          )}

          <BookmarkFilter
            showBookmarksOnly={showBookmarksOnly}
            onToggle={() => setShowBookmarksOnly(!showBookmarksOnly)}
            featuresSupported={featuresSupported}
          />
        </View>
      </View>

      <FlatList
        data={filteredNotes}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notesContainer}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id}
        renderItem={({ item: note }) => (
          <NoteCard
            note={note}
            isBookmarked={bookmarkStates[note.id] || false}
            featuresSupported={featuresSupported}
            onPress={openNote}
            onToggleBookmark={handleToggleBookmark}
            topicTitle={
              selectedTopicId === 'all'
                ? note.topic?.title
                : category?.topics.find((t) => t.id === selectedTopicId)?.title
            }
            categoryTitle={category?.title}
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Tiada nota dijumpai</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery
                ? 'Cuba laraskan istilah carian anda'
                : showBookmarksOnly
                  ? 'Tiada nota yang ditanda buku'
                  : 'Tiada nota tersedia dalam kategori ini'}
            </Text>
          </View>
        )}
      />
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
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 12,
  },
  topicDropdownContainer: {
    flex: 1,
  },
  topicDropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
  },
  topicDropdownText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemActive: {
    backgroundColor: '#FFF9E6',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#333333',
  },
  dropdownItemTextActive: {
    fontWeight: '600',
    color: '#000000',
  },
});
