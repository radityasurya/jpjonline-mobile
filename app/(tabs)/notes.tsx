import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import {
  getNotesGroupedByCategory,
  activityService,
  ACTIVITY_TYPES,
} from '@/services';
import bookmarkService from '@/services/bookmarkService';
import CategorySelector from '@/components/shared/CategorySelector';
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
  author: {
    id: string;
    name: string;
    email: string;
  };
  topic: {
    id: string;
    title: string;
    slug: string;
    category: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface CategoryGroup {
  category: {
    id: string;
    title: string;
    slug: string;
  };
  notes: ApiNote[];
  count: number;
}

interface NotesApiResponse {
  notesByCategory: Record<string, CategoryGroup>;
  allCategories: {
    id: string;
    title: string;
    slug: string;
  }[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  groupedByCategory: boolean;
}
export default function NotesScreen() {
  const { user } = useAuth();
  const [notesData, setNotesData] = useState<NotesApiResponse | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<ApiNote[]>([]);
  const [categories, setCategories] = useState<
    { id: string; title: string; slug: string }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkStates, setBookmarkStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Check if features are supported on current platform
  const featuresSupported =
    bookmarkService?.getPlatformInfo()?.supported || false;

  useEffect(() => {
    // Check if user is logged in before fetching notes
    if (!user) {
      logger.warn('NotesScreen', 'User not logged in, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    fetchNotesData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, notesData, showBookmarksOnly, user]);

  useEffect(() => {
    if (!notesData || !user || !featuresSupported) return;
    loadBookmarkStates();
  }, [notesData, user]);

  const loadBookmarkStates = () => {
    if (!notesData || !featuresSupported) {
      logger.info('NotesScreen', 'Bookmark features disabled on web platform');
      return;
    }

    const states: { [key: string]: boolean } = {};
    Object.values(notesData.notesByCategory).forEach((categoryGroup) => {
      categoryGroup.notes.forEach((note) => {
        states[note.id] = bookmarkService.isBookmarked(note.id);
      });
    });
    setBookmarkStates(states);
  };
  const fetchNotesData = async () => {
    setIsLoading(true);
    logger.debug('NotesScreen', 'Fetching notes grouped by category');
    try {
      const response = await getNotesGroupedByCategory();
      logger.debug('NotesScreen', 'Notes data loaded', {
        categoriesCount: response.allCategories.length,
        totalNotes: response.total,
      });

      setNotesData(response);
      setCategories([
        { id: 'all', title: 'All', slug: 'all' },
        ...response.allCategories,
      ]);
    } catch (error) {
      logger.error('NotesScreen', 'Error fetching notes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    if (!notesData) {
      setFilteredNotes([]);
      return;
    }

    // Flatten all notes from all categories
    let allNotes: ApiNote[] = [];
    Object.values(notesData.notesByCategory).forEach((categoryGroup) => {
      allNotes = [...allNotes, ...categoryGroup.notes];
    });

    let filtered = [...allNotes];

    if (showBookmarksOnly) {
      filtered = filtered.filter((note) => bookmarkStates[note.id]);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      const selectedCategoryData = categories.find(
        (cat) => cat.title === selectedCategory,
      );
      if (selectedCategoryData) {
        filtered = filtered.filter(
          (note) => note.topic.category.slug === selectedCategoryData.slug,
        );
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.topic.title.toLowerCase().includes(query) ||
          note.topic.category.title.toLowerCase().includes(query),
      );
    }

    setFilteredNotes(filtered);
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
      const isCurrentlyBookmarked = bookmarkService.isBookmarked(noteId);

      const newBookmarkStatus = bookmarkService.toggleBookmark(noteId);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
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
      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search study notes..."
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          marginBottom: 16,
        }}
      >
        <BookmarkFilter
          showBookmarksOnly={showBookmarksOnly}
          onToggle={() => setShowBookmarksOnly(!showBookmarksOnly)}
          featuresSupported={featuresSupported}
        />
        <View style={{ flex: 1 }}>
          <CategorySelector
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
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
          />
        )}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No notes found</Text>
            <Text style={styles.emptyMessage}>
              {searchQuery
                ? 'Try adjusting your search terms'
                : showBookmarksOnly
                  ? 'No bookmarked notes found'
                  : 'No notes available in this category'}
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
});
