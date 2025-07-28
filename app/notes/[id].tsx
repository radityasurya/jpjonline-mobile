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
import api from '@/services/api';
import { Note } from '@/types/api';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    fetchNote();
  }, [id]);

  const fetchNote = async () => {
    setIsLoading(true);
    try {
      const response = await api.notes.fetchNoteById(id as string);
      if (response.success) {
        setNote(response.data!);
        setIsBookmarked(response.data!.isBookmarked);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBookmark = async () => {
    try {
      const response = await api.notes.toggleBookmark(note!.id);
      if (response.success) {
        setIsBookmarked(response.data!);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const shareNote = async () => {
    try {
      await Share.share({
        message: `${note.title}\n\n${note.preview}\n\nDibaca melalui JPJOnline`,
        title: note.title,
      });
    } catch (error) {
      console.error('Error sharing note:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ms-MY', {
      day: 'numeric',
      month: 'long',
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
            onPress={toggleBookmark}
          >
            {isBookmarked ? (
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
            <Text style={styles.categoryText}>{note.category}</Text>
          </View>
          <View style={styles.metaInfo}>
            <View style={styles.readTime}>
              <Clock size={14} color="#666666" />
              <Text style={styles.readTimeText}>
                {note.readTime} minit bacaan
              </Text>
            </View>
            <Text style={styles.dateText}>
              Dikemaskini: {formatDate(note.dateModified)}
            </Text>
          </View>
        </View>

        <View style={styles.articleContent}>{renderContent(note.content)}</View>

        <View style={styles.tags}>
          <Text style={styles.tagsTitle}>Tag:</Text>
          <View style={styles.tagsList}>
            {note.tags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
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
  tags: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 12,
    color: '#666666',
  },
});
