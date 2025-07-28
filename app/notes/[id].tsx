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
} from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { getNoteBySlug } from '@/services';
import { logger } from '@/utils/logger';
import { updateStats } from '@/services';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteIsBookmarked, setNoteIsBookmarked] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    setIsLoading(true);
    logger.debug('NoteDetailScreen', 'Fetching note by slug', { slug: id });
    try {
      const noteData = await getNoteBySlug(id as string);
      logger.info('NoteDetailScreen', 'Note loaded successfully', { 
        noteId: noteData.id, 
        title: noteData.title 
      });
      setNote(noteData);
      
      // Track note reading
      updateStats('note_read', {
        noteId: noteData.id,
        noteTitle: noteData.title,
        readTime: Math.ceil(noteData.content.length / 200), // Estimate read time
        category: noteData.topic?.category?.slug
      });
      
      // Check bookmark status
      setNoteIsBookmarked(isBookmarked(noteData.id));
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error fetching note', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    logger.userAction('Bookmark toggle attempted', { noteId: note?.id });
    try {
      // Track bookmark action
      updateStats('note_bookmarked', {
        noteId: note.id,
        noteTitle: note.title
      });
      
      const newBookmarkStatus = toggleBookmark(note.id);
      setNoteIsBookmarked(newBookmarkStatus);
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
          <Text key={index} style={styles.listItem}>
            • {line.substring(2)}
          </Text>
        );
      } else if (line.trim() === '') {
        elements.push(<View key={index} style={styles.spacing} />);
      } else if (line.match(/^\d+\./)) {
        elements.push(
          <Text key={index} style={styles.numberedItem}>
            {line}
          </Text>
        );
      } else if (line.startsWith('**') && line.endsWith('**')) {
        elements.push(
          <Text key={index} style={styles.bold}>
            {line.substring(2, line.length - 2)}
          </Text>
        );
      } else {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {line}
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
          >
            {noteIsBookmarked ? (
              <BookmarkCheck size={22} color="#facc15" />
            ) : (
              <Bookmark size={22} color="#333333" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.noteInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{note.topic?.category?.title || 'General'}</Text>
          </View>
          <View style={styles.metaInfo}>
            <View style={styles.readTime}>
              <Clock size={14} color="#666666" />
              <Text style={styles.readTimeText}>
                {Math.ceil(note.content.length / 200)} min read
              </Text>
            </View>
            <Text style={styles.dateText}>
              Updated: {formatDate(note.updatedAt)}
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
  noteInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    justifyContent: 'space-between',
    alignItems: 'center',
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
  listItem: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  numberedItem: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 8,
    marginLeft: 16,
  },
  bold: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    lineHeight: 24,
    marginBottom: 12,
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
