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
import { router, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { logger } from '@/utils/logger';
import { activityService, ACTIVITY_TYPES } from '@/services';
import { getCategoryBySlug } from '@/services/notesService';
import {
  getPlatformInfo,
  isBookmarked,
  toggleBookmark,
  getBookmarks,
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
  const params = useLocalSearchParams();
  const [category, setCategory] = useState<CategoryData | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('all');
  const [showTopicDropdown, setShowTopicDropdown] = useState(false);
  const [filteredNotes, setFilteredNotes] = useState<ApiNote[]>([]);
  const [groupedNotes, setGroupedNotes] = useState<{
    [key: string]: ApiNote[];
  }>({});
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

    // Check if we should show bookmarks only (from profile page navigation)
    if (params.showBookmarks === 'true') {
      setShowBookmarksOnly(true);
    }

    fetchNotesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.showBookmarks]);

  // Reset topic selection when showing bookmarks only
  useEffect(() => {
    if (showBookmarksOnly && selectedTopicId !== 'all') {
      logger.debug(
        'NotesScreen',
        'Resetting topic selection for bookmarks view',
      );
      setSelectedTopicId('all');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBookmarksOnly]);

  useEffect(() => {
    if (!category || !user || !featuresSupported) return;
    loadBookmarkStates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, user, showBookmarksOnly]);

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

  // Refresh bookmark states when showBookmarksOnly changes
  useEffect(() => {
    if (showBookmarksOnly && featuresSupported) {
      logger.debug(
        'NotesScreen',
        'Refreshing bookmark states for bookmarks view',
      );
      loadBookmarkStates();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showBookmarksOnly]);

  const loadBookmarkStates = async () => {
    if (!category || !featuresSupported) {
      logger.info('NotesScreen', 'Bookmark features disabled on web platform');
      return;
    }

    logger.debug('NotesScreen', 'Loading bookmark states for all notes');
    const states: { [key: string]: boolean } = {};

    // Get all bookmarks once
    const allBookmarks = await getBookmarks();

    logger.debug('NotesScreen', 'Retrieved bookmarks from storage', {
      bookmarkCount: allBookmarks.length,
      bookmarkIds: allBookmarks,
    });

    category.topics.forEach((topic) => {
      topic.notes.forEach((note) => {
        const bookmarked = allBookmarks.includes(note.id);
        states[note.id] = bookmarked;
        if (bookmarked) {
          logger.debug('NotesScreen', 'Note is bookmarked', {
            noteId: note.id,
            title: note.title,
          });
        }
      });
    });
    logger.debug('NotesScreen', 'Bookmark states loaded', {
      totalNotes: Object.keys(states).length,
      bookmarkedCount: Object.values(states).filter(Boolean).length,
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
      setGroupedNotes({});
      return;
    }

    try {
      let filtered: ApiNote[] = [];
      const grouped: { [key: string]: ApiNote[] } = {};

      // If showing bookmarks only, get all notes from all topics first
      if (showBookmarksOnly) {
        // Get all notes from all topics
        category.topics.forEach((topic) => {
          const notesWithTopic = topic.notes.map((note) => ({
            ...note,
            topic: topic, // Ensure each note has the topic data
          }));
          filtered = [...filtered, ...notesWithTopic];
        });
        // Filter to only bookmarked notes
        filtered = filtered.filter((note) => bookmarkStates[note.id]);
      } else {
        // Get notes based on selected topic
        if (selectedTopicId === 'all') {
          // Show all notes from all topics - group by topic
          category.topics.forEach((topic) => {
            const notesWithTopic = topic.notes.map((note) => ({
              ...note,
              topic: topic, // Ensure each note has the topic data
            }));

            // Apply search filter to this topic's notes
            let topicNotes = notesWithTopic;
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              topicNotes = topicNotes.filter((note) =>
                note.title.toLowerCase().includes(query),
              );
            }

            if (topicNotes.length > 0) {
              grouped[topic.title] = topicNotes;
            }
            filtered = [...filtered, ...topicNotes];
          });
        } else {
          // Show notes from selected topic only
          const selectedTopic = category.topics.find(
            (t) => t.id === selectedTopicId,
          );
          if (selectedTopic) {
            const notesWithTopic = selectedTopic.notes.map((note) => ({
              ...note,
              topic: selectedTopic, // Ensure each note has the topic data
            }));

            // Apply search filter
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              filtered = notesWithTopic.filter((note) =>
                note.title.toLowerCase().includes(query),
              );
            } else {
              filtered = [...notesWithTopic];
            }
          }
        }
      }

      // Apply search filter for non-grouped view (single topic or bookmark only)
      if (selectedTopicId !== 'all' || showBookmarksOnly) {
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter((note) =>
            note.title.toLowerCase().includes(query),
          );
        }
      }

      setFilteredNotes(filtered);
      setGroupedNotes(grouped);
    } catch (error) {
      logger.error('NotesScreen', 'Error applying filters', error);
      setFilteredNotes([]);
      setGroupedNotes({});
    }
  };

  const formatTopicTitle = (title: string) => {
    return title
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getSelectedTopicTitle = () => {
    if (selectedTopicId === 'all') return 'All Topics';
    const topic = category?.topics.find((t) => t.id === selectedTopicId);
    return topic?.title || 'Select Topic';
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
      logger.debug('NotesScreen', 'Before toggle', {
        noteId,
        currentStatus: bookmarkStates[noteId],
      });

      const newBookmarkStatus = await toggleBookmark(noteId);

      logger.debug('NotesScreen', 'After toggle', {
        noteId,
        newStatus: newBookmarkStatus,
      });

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
        <Text style={styles.loadingText}>Loading notes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <SearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          placeholder={t('notes.searchTopics')}
        />
        <BookmarkFilter
          showBookmarksOnly={showBookmarksOnly}
          onToggle={() => setShowBookmarksOnly(!showBookmarksOnly)}
          featuresSupported={featuresSupported}
        />
      </View>

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
                          {formatTopicTitle('All Topics')}
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
        </View>
      </View>

      {selectedTopicId === 'all' && !showBookmarksOnly ? (
        // Render grouped notes for "All Topics" view
        <FlatList
          data={Object.keys(groupedNotes)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notesContainer}
          keyExtractor={(topicTitle) => topicTitle}
          renderItem={({ item: topicTitle }) => (
            <View style={styles.topicSection}>
              <Text style={styles.topicSectionHeader}>{topicTitle}</Text>
              {groupedNotes[topicTitle].map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isBookmarked={bookmarkStates[note.id] || false}
                  featuresSupported={featuresSupported}
                  onPress={openNote}
                  onToggleBookmark={handleToggleBookmark}
                  topicTitle={note.topic?.title}
                  categoryTitle={category?.title}
                />
              ))}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Tiada nota dijumpai</Text>
              <Text style={styles.emptyMessage}>
                {searchQuery
                  ? 'Cuba laraskan istilah carian anda'
                  : 'Tiada nota tersedia dalam kategori ini'}
              </Text>
            </View>
          )}
        />
      ) : (
        // Render regular flat list for filtered views
        <FlatList
          data={filteredNotes}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.notesContainer}
          keyExtractor={(item) => item.id}
          renderItem={({ item: note }) => (
            <NoteCard
              note={note}
              isBookmarked={bookmarkStates[note.id] || false}
              featuresSupported={featuresSupported}
              onPress={openNote}
              onToggleBookmark={handleToggleBookmark}
              topicTitle={note.topic?.title}
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    height: 48,
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
  topicSection: {
    marginBottom: 24,
  },
  topicSectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
});
