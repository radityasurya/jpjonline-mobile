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
import api from '@/services/api';
import { Note } from '@/types/api';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

export default function NotesScreen() {
  const { user } = useAuth();
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
    fetchAllNotes();
  }, [showBookmarksOnly]);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory, allNotes]);

  const fetchCategories = async () => {
    try {
      const response = await api.notes.fetchCategories();
      if (response.success) {
        setCategories(response.data!);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchAllNotes = async () => {
    setIsLoading(true);
    try {
      if (showBookmarksOnly) {
        const response = await api.notes.getBookmarkedNotes();
        if (response.success) {
          setAllNotes(response.data!);
        }
      } else {
        const response = await api.notes.fetchNotes();
        if (response.success) {
          // Check bookmark status for each note
          const notesWithBookmarks = await Promise.all(
            response.data!.map(async (note) => ({
              ...note,
              isBookmarked:
                (await api.storage.getBookmarks()).data?.includes(note.id) ||
                false,
            }))
          );
          setAllNotes(notesWithBookmarks);
        }
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allNotes];

    // Apply bookmark filter first
    if (showBookmarksOnly) {
      filtered = filtered.filter((note) => note.isBookmarked);
    }

    // Apply category filter
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((note) => note.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredNotes(filtered);
  };
  const toggleBookmark = async (noteId: string) => {
    try {
      const response = await api.notes.toggleBookmark(noteId);
      if (!response.success) return;

      // Update local state
      setAllNotes((prev) =>
        prev.map((note) =>
          note.id === noteId ? { ...note, isBookmarked: response.data! } : note
        )
      );
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const openNote = (note: Note) => {
    if (note.isPremium && user?.subscription !== 'premium') {
      // Show premium upgrade prompt
      return;
    }

    // Add to activity history
    api.user.saveActivity({
      type: 'note_viewed',
      noteId: note.id,
      noteTitle: note.title,
    });

    // Navigate to note detail screen
    router.push(`/notes/${note.id}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
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
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton,
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.selectedCategoryText,
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
              note.isPremium &&
                user?.subscription !== 'premium' &&
                styles.lockedCard,
            ]}
            onPress={() => openNote(note)}
          >
            <View style={styles.noteHeader}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryBadgeText}>{note.category}</Text>
              </View>
              <View style={styles.noteActions}>
                {note.isPremium && (
                  <Crown size={16} color="#FF9800" style={styles.premiumIcon} />
                )}
                <TouchableOpacity onPress={() => toggleBookmark(note.id)}>
                  {note.isBookmarked ? (
                    <BookmarkCheck size={18} color="#facc15" />
                  ) : (
                    <Bookmark size={18} color="#CCCCCC" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.noteTitle} numberOfLines={2}>
              {note.title}
            </Text>
            <Text style={styles.notePreview} numberOfLines={3}>
              {note.preview}
            </Text>

            <View style={styles.noteFooter}>
              <Text style={styles.dateText}>
                {formatDate(note.dateModified)}
              </Text>
              <View style={styles.readTime}>
                <Clock size={12} color="#999999" />
                <Text style={styles.readTimeText}>{note.readTime}m</Text>
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
