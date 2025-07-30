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
  Dimensions,
} from 'react-native';
import {
  Search,
  Bookmark,
  BookmarkCheck,
  Clock,
  Crown,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { logger } from '@/utils/logger';
import {
  getNotesGroupedByCategory,
  activityService,
  ACTIVITY_TYPES,
} from '@/services';
import bookmarkService from '@/services/bookmarkService';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

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
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search automotive notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          style={[
            styles.bookmarkIconFilter,
            showBookmarksOnly && styles.activeBookmarkIconFilter,
          ]}
          onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
        >
          <BookmarkCheck
            size={20}
            color={showBookmarksOnly ? '#FFFFFF' : '#666666'}
          />
        </TouchableOpacity>
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
                selectedCategory === category.title &&
                  styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category.title)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category.title &&
                    styles.selectedCategoryText,
                ]}
              >
                {category.title}
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

      <FlatList
        data={filteredNotes}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.notesContainer}
        columnWrapperStyle={styles.row}
        keyExtractor={(item) => item.id}
        renderItem={({ item: note }) => (
          <TouchableOpacity
            style={[
              styles.noteCard,
              // TODO: Add premium check when implemented
              // note.isPremium && user?.subscription !== 'premium' && styles.lockedCard,
            ]}
            onPress={() => openNote(note)}
          >
            <View style={styles.noteHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>
                  {note.topic.category.title}
                </Text>
              </View>
              <View style={styles.noteActions}>
                <TouchableOpacity onPress={() => handleToggleBookmark(note.id)}>
                  {featuresSupported && bookmarkStates[note.id] ? (
                    <BookmarkCheck size={18} color="#facc15" />
                  ) : featuresSupported ? (
                    <Bookmark size={18} color="#CCCCCC" />
                  ) : (
                    <Bookmark size={18} color="#E0E0E0" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.noteTitle} numberOfLines={2}>
              {note.title}
            </Text>
            <Text style={styles.notePreview} numberOfLines={3}>
              {note.content.substring(0, 150)}...
            </Text>

            <View style={styles.noteFooter}>
              <Text style={styles.dateText}>{formatDate(note.updatedAt)}</Text>
              <View style={styles.readTime}>
                <Clock size={12} color="#999999" />
                <Text style={styles.readTimeText}>
                  {Math.ceil(note.content.length / 200)}m
                </Text>
              </View>
            </View>
          </TouchableOpacity>
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

// Helper function to extract preview from content
const extractPreview = (content: string, maxLength: number = 150): string => {
  // Remove markdown headers and formatting
  const cleanContent = content
    .replace(/^#+\s+/gm, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();

  return cleanContent.length > maxLength
    ? cleanContent.substring(0, maxLength) + '...'
    : cleanContent;
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
  filtersContainer: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkIconFilter: {
    width: 44,
    height: 44,
    backgroundColor: '#F8F9FA',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 12,
  },
  activeBookmarkIconFilter: {
    backgroundColor: '#333333',
    borderColor: '#333333',
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
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
  notesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  noteCard: {
    width: cardWidth,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lockedCard: {
    opacity: 0.7,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#666666',
  },
  premiumIcon: {
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 6,
    lineHeight: 18,
  },
  notePreview: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
    marginBottom: 8,
    flex: 1,
  },
  noteFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 10,
    color: '#999999',
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: 10,
    color: '#999999',
    marginLeft: 2,
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
