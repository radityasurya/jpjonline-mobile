import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Bookmark, BookmarkCheck, Clock } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 2 columns with padding

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

interface NoteCardProps {
  note: ApiNote;
  isBookmarked: boolean;
  featuresSupported: boolean;
  onPress: (note: ApiNote) => void;
  onToggleBookmark: (noteId: string) => void;
}

export default function NoteCard({
  note,
  isBookmarked,
  featuresSupported,
  onPress,
  onToggleBookmark,
}: NoteCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity
      style={[
        styles.noteCard,
        // TODO: Add premium check when implemented
        // note.isPremium && user?.subscription !== 'premium' && styles.lockedCard,
      ]}
      onPress={() => onPress(note)}
    >
      <View style={styles.noteHeader}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>
            {note.topic.category.title}
          </Text>
        </View>
        <View style={styles.noteActions}>
          <TouchableOpacity onPress={() => onToggleBookmark(note.id)}>
            {featuresSupported && isBookmarked ? (
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
      {/* <Text style={styles.notePreview} numberOfLines={3}>
        {note.content.substring(0, 150)}...
      </Text> */}

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
  );
}

const styles = StyleSheet.create({
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
});
