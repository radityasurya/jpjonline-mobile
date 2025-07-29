import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Share2,
  Clock,
  User,
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getNoteBySlug } from '@/services';
import { logger } from '@/utils/logger';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { progressService, activityService, ACTIVITY_TYPES } from '@/services';
import bookmarkService from '@/services/bookmarkService';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteIsBookmarked, setNoteIsBookmarked] = useState(false);
  
  // Check if features are supported on current platform
  const featuresSupported = bookmarkService?.getPlatformInfo()?.supported || false;

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    setIsLoading(true);
    logger.debug('NoteDetailScreen', 'Fetching note by slug', { slug: id });
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const noteData = await getNoteBySlug(id as string, token);
      logger.info('NoteDetailScreen', 'Note loaded successfully', { 
        noteId: noteData.id, 
        title: noteData.title 
      });
      setNote(noteData);
      
      // Track note reading
      activityService.addActivity(ACTIVITY_TYPES.NOTE_VIEWED, {
        noteId: noteData.id,
        noteTitle: noteData.title,
        noteSlug: noteData.slug,
        category: noteData.topic?.category?.title,
        userId: user?.id
      });
      
      progressService.updateStats('note_read', {
        noteId: noteData.id,
        noteTitle: noteData.title,
        readTime: Math.ceil(noteData.content.length / 200), // Estimate read time
        category: noteData.topic?.category?.slug
      });
      
      // Check bookmark status
      if (featuresSupported) {
        setNoteIsBookmarked(bookmarkService.isBookmarked(noteData.id));
      }
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error fetching note', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!featuresSupported) {
      logger.warn('NoteDetailScreen', 'Bookmark features not available on web platform');
      return;
    }

    logger.userAction('Bookmark toggle attempted', { noteId: note?.id });
    try {
      const isCurrentlyBookmarked = bookmarkService.isBookmarked(note.id);
      
      const newBookmarkStatus = bookmarkService.toggleBookmark(note.id);
      setNoteIsBookmarked(newBookmarkStatus);
      
      // Track activity
      const activityType = newBookmarkStatus ? ACTIVITY_TYPES.NOTE_BOOKMARKED : ACTIVITY_TYPES.NOTE_UNBOOKMARKED;
      activityService.addActivity(activityType, {
        noteId: note.id,
        noteTitle: note.title,
        noteSlug: note.slug,
        category: note.topic?.category?.title,
        userId: user?.id
      });
      
      logger.info('NoteDetailScreen', 'Bookmark toggled successfully', { 
        noteId: note.id, 
        newStatus: newBookmarkStatus 
      });
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error toggling bookmark', error);
    }
  };

  const shareNote = async () => {
    logger.userAction('Note share initiated', { noteId: note?.id, title: note?.title });
    try {
      await Share.share({
        message: `${note.title}\n\n${note.content.substring(0, 200)}...\n\nRead via JPJOnline`,
        title: note.title,
      });
      logger.info('NoteDetailScreen', 'Note shared successfully');
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error sharing note', error);
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

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    const elements: JSX.Element[] = [];

    lines.forEach((line, index) => {
      // Process inline formatting first
      const processInlineFormatting = (text: string) => {
        const parts: (string | JSX.Element)[] = [];
        let currentIndex = 0;
        
        // Bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        let lastIndex = 0;
        
        while ((match = boldRegex.exec(text)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          // Add bold text
          parts.push(
            <Text key={`bold-${match.index}`} style={styles.boldInline}>
              {match[1]}
            </Text>
          );
          lastIndex = match.index + match[0].length;
        }
        
        // Add remaining text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }
        
        return parts;
      };

      if (line.startsWith('# ')) {
        elements.push(
          <Text key={index} style={styles.heading1}>
            {line.substring(2)}
          </Text>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={index} style={styles.heading2}>
            {line.substring(3)}
          </Text>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Text key={index} style={styles.heading3}>
            {line.substring(4)}
          </Text>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <View key={index} style={styles.listItemContainer}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listItem}>
              {processInlineFormatting(line.substring(2))}
            </Text>
          </View>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={index} style={styles.spacing} />);
      } else if (line.match(/^\d+\./)) {
        elements.push(
          <View key={index} style={styles.listItemContainer}>
            <Text style={styles.paragraph}>
              {processInlineFormatting(line)}
            </Text>
          </View>
        );
      } else {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {processInlineFormatting(line)}
          </Text>
        );
      }
    });

    return elements;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Memuatkan nota...</Text>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Nota tidak dijumpai</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333333" />
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton} onPress={shareNote}>
            <Share2 size={22} color="#333333" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleToggleBookmark}
            disabled={!featuresSupported}
          >
            {featuresSupported && noteIsBookmarked ? (
              <BookmarkCheck size={22} color="#facc15" />
            ) : featuresSupported ? (
              <Bookmark size={22} color="#333333" />
            ) : (
              <Bookmark size={22} color="#E0E0E0" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.titleSection}>
          <Text style={styles.noteTitle}>{note.title}</Text>
          
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{note.topic?.category?.title || 'General'}</Text>
          </View>
          
          <View style={styles.metaInfo}>
            <View style={styles.authorInfo}>
              <User size={14} color="#666666" />
              <Text style={styles.authorText}>
                {note.author?.name || 'JPJOnline'}
              </Text>
            </View>
            <View style={styles.readTime}>
              <Clock size={14} color="#666666" />
              <Text style={styles.readTimeText}>
                {Math.ceil(note.content.length / 200)} min read
              </Text>
            </View>
          </View>
          
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>
              Last updated: {formatDate(note.updatedAt)}
            </Text>
          </View>
        </View>

        <View style={styles.articleContent}>{renderContent(note.content)}</View>

        {note.topic && (
          <View style={styles.topicInfo}>
            <Text style={styles.topicTitle}>Topic:</Text>
            <Text style={styles.topicText}>{note.topic.title}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#facc15',
  },
  headerButton: {
    padding: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  titleSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  noteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 32,
    marginBottom: 16,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 16,
    marginBottom: 8,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  readTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readTimeText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 6,
  },
  dateInfo: {
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#999999',
  },
  articleContent: {
    padding: 20,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 12,
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 16,
  },
  listBullet: {
    fontSize: 16,
    color: '#444444',
    marginRight: 8,
    lineHeight: 24,
  },
  listItem: {
    flex: 1,
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
  },
  boldInline: {
    fontWeight: 'bold',
    color: '#333333',
  },
  italicInline: {
    fontStyle: 'italic',
    color: '#444444',
  },
  underlineInline: {
    textDecorationLine: 'underline',
    color: '#444444',
  },
  codeInline: {
    fontFamily: 'monospace',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 16,
    color: '#444444',
  },
  spacing: {
    height: 12,
  },
  topicInfo: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  topicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  topicText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
});
