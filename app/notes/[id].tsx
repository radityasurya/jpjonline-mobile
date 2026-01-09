import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Share,
  Image,
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
import Markdown from 'react-native-markdown-display';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNoteById,
  progressService,
  activityService,
  ACTIVITY_TYPES,
} from '@/services';
import { logger } from '@/utils/logger';
import { LAYOUT_CONSTANTS } from '@/constants/layout';
import {
  getPlatformInfo,
  isBookmarked,
  toggleBookmark,
} from '@/services/bookmarkService';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [note, setNote] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [noteIsBookmarked, setNoteIsBookmarked] = useState(false);

  // Check if features are supported on current platform
  const platformInfo = getPlatformInfo() as { supported?: boolean } | undefined;
  const featuresSupported = platformInfo?.supported || false;

  useEffect(() => {
    // Check if user is logged in before fetching note
    if (!user) {
      logger.warn(
        'NoteDetailScreen',
        'User not logged in, redirecting to login',
      );
      router.replace('/auth/login');
      return;
    }

    fetchNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user]);

  const fetchNote = async () => {
    setIsLoading(true);
    logger.debug('NoteDetailScreen', 'Fetching note by id', { id: id });
    try {
      const noteDataRaw = (await getNoteById(id as string)) as any;
      const noteData = noteDataRaw.note || noteDataRaw;
      logger.info('NoteDetailScreen', 'Note loaded successfully', {
        noteId: noteData.id,
        title: noteData.title,
        noteData: noteData,
      });
      setNote(noteData);

      // Check bookmark status BEFORE tracking activity
      let bookmarked = false;
      if (featuresSupported) {
        bookmarked = await isBookmarked(noteData.id);
        logger.debug('NoteDetailScreen', 'Bookmark status checked', {
          noteId: noteData.id,
          bookmarked,
        });
        setNoteIsBookmarked(bookmarked);
      }

      // Track note reading
      activityService.addActivity(ACTIVITY_TYPES.NOTE_VIEWED, {
        noteId: noteData.id,
        noteTitle: noteData.title,
        noteSlug: noteData.slug || '',
        category: noteData.topic?.category?.title || 'General',
        userId: user?.id,
      });

      progressService.updateStats('note_read', {
        noteId: noteData.id,
        noteTitle: noteData.title,
        readTime: Math.ceil(noteData.content.length / 200), // Estimate read time
        category: noteData.topic?.category?.slug || 'general',
      });
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error fetching note', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!featuresSupported) {
      logger.warn(
        'NoteDetailScreen',
        'Bookmark features not available on web platform',
      );
      return;
    }

    logger.userAction('Bookmark toggle attempted', { noteId: note?.id });
    try {
      logger.debug('NoteDetailScreen', 'Before toggle', {
        noteId: note.id,
        currentStatus: noteIsBookmarked,
      });

      const newBookmarkStatus = await toggleBookmark(note.id);

      logger.debug('NoteDetailScreen', 'After toggle', {
        noteId: note.id,
        newStatus: newBookmarkStatus,
      });

      logger.debug('NoteDetailScreen', 'Setting noteIsBookmarked state', {
        noteId: note.id,
        newValue: newBookmarkStatus,
        oldValue: noteIsBookmarked,
      });

      setNoteIsBookmarked(newBookmarkStatus);

      // Track activity
      const activityType = newBookmarkStatus
        ? ACTIVITY_TYPES.NOTE_BOOKMARKED
        : ACTIVITY_TYPES.NOTE_UNBOOKMARKED;
      activityService.addActivity(activityType, {
        noteId: note.id,
        noteTitle: note.title,
        noteSlug: note.slug || '',
        category: note.topic?.category?.title || 'General',
        userId: user?.id,
      });

      logger.info('NoteDetailScreen', 'Bookmark toggled successfully', {
        noteId: note.id,
        newStatus: newBookmarkStatus,
      });
    } catch (error) {
      logger.error('NoteDetailScreen', 'Error toggling bookmark', error);
    }
  };

  const shareNote = async () => {
    logger.userAction('Note share initiated', {
      noteId: note?.id,
      title: note?.title,
    });
    try {
      await Share.share({
        message: `${note.title}\n\n${note.content.substring(
          0,
          200,
        )}...\n\nRead via JPJOnline`,
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

  // Custom rules for rendering markdown with proper image URLs
  const markdownRules = {
    image: (node: any, children: any, parent: any, styles: any) => {
      const { src, alt } = node.attributes;
      // Convert relative URLs to absolute URLs
      const imageUrl = src.startsWith('http')
        ? src
        : `https://jpjonline.com${src}`;

      return (
        <View key={node.key} style={imageContainerStyle}>
          <Image
            source={{ uri: imageUrl }}
            style={imageStyle}
            resizeMode="contain"
          />
          {alt && <Text style={imageCaptionStyle}>{alt}</Text>}
        </View>
      );
    },
  };

  // Styles for custom image rendering
  const imageContainerStyle: any = {
    marginVertical: 12,
    width: '100%',
  };

  const imageStyle: any = {
    width: '100%',
    height: 200,
    borderRadius: 8,
  };

  const imageCaptionStyle: any = {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic' as const,
    textAlign: 'center' as const,
    marginTop: 8,
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>Loading note...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Sila log masuk untuk melihat nota</Text>
        <Text style={styles.errorSubText}>
          Anda perlu log masuk untuk mengakses nota pembelajaran
        </Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace('/auth/login')}
        >
          <Text style={styles.loginButtonText}>Log Masuk</Text>
        </TouchableOpacity>
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
              <BookmarkCheck size={22} color="#333333" />
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

          {note.topic && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {note.topic.category?.title || 'General'} / {note.topic.title}
              </Text>
            </View>
          )}

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
              Last updated: {formatDate(note.updatedAt || note.createdAt)}
            </Text>
          </View>
        </View>

        <View style={styles.articleContent}>
          <Markdown style={markdownStyles} rules={markdownRules}>
            {note.content}
          </Markdown>
        </View>
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
  errorSubText: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 24,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  loginButton: {
    backgroundColor: '#facc15',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 12,
  },
  loginButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
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
    paddingTop: LAYOUT_CONSTANTS.headerPaddingTop,
    paddingBottom: LAYOUT_CONSTANTS.headerPaddingBottom,
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
});

// Markdown styles matching the design
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444444',
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 20,
    marginBottom: 12,
    color: '#333333',
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 10,
    color: '#333333',
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600' as const,
    marginTop: 12,
    marginBottom: 8,
    color: '#333333',
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#444444',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444444',
    marginBottom: 4,
  },
  bullet_list: {
    marginBottom: 12,
  },
  ordered_list: {
    marginBottom: 12,
  },
  strong: {
    fontWeight: 'bold' as const,
    color: '#333333',
  },
  em: {
    fontStyle: 'italic' as const,
  },
  code_inline: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#444444',
  },
  code_block: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginBottom: 12,
    fontSize: 14,
  },
  fence: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginBottom: 12,
    fontSize: 14,
  },
  blockquote: {
    backgroundColor: '#fef3c7',
    borderLeftWidth: 4,
    borderLeftColor: '#facc15',
    padding: 12,
    marginBottom: 12,
    borderRadius: 4,
  },
  link: {
    color: '#facc15',
    textDecorationLine: 'underline' as const,
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    borderRadius: 4,
  },
  thead: {
    backgroundColor: '#f9fafb',
  },
  th: {
    padding: 8,
    fontWeight: 'bold' as const,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  td: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tr: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  image: {
    marginVertical: 12,
    borderRadius: 8,
  },
  hr: {
    backgroundColor: '#e5e7eb',
    height: 1,
    marginVertical: 16,
  },
};
