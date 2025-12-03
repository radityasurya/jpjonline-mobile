Your notes are stored as Markdown text in the database and rendered using react-markdown on the web. For mobile, you'll need a React Native markdown renderer.

API Endpoints for Note Details
Option 1: Get Note by ID (Recommended)
Endpoint: GET /api/notes/{noteId}

⚠️ Fix Required: Remove admin-only restriction from app/api/notes/[id]/route.ts

Change from:

export const GET = withAuth(handleGet, {
  requireAuth: true,
  requiredRole: 'ADMIN',  // ❌ Only admins
});
Change to:

export const GET = withAuth(handleGet, {
  requireAuth: true,  // ✅ All authenticated users
});
Request:

GET <https://jpjonline.com/api/notes/{noteId}>
Headers:
  Authorization: Bearer {accessToken}
Response:

{
  "note": {
    "id": "note123",
    "title": "Traffic Signs and Signals",
    "slug": "traffic-signs-and-signals",
    "content": "# Traffic Signs\n\nTraffic signs are...",
    "order": 1,
    "topic": {
      "id": "topic123",
      "title": "Road Safety",
      "slug": "road-safety",
      "category": {
        "id": "cat123",
        "title": "Semua Kategori",
        "slug": "semua-kategori"
      }
    },
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
Option 2: Get Note by Slug (RESTful)
Endpoint: GET /api/notes/categories/{categorySlug}/topics/{topicSlug}/notes/{noteSlug}

Request:

GET <https://jpjonline.com/api/notes/categories/semua-kategori/topics/road-safety/notes/traffic-signs>
Headers:
  Authorization: Bearer {accessToken}
Response:

{
  "success": true,
  "data": {
    "id": "note123",
    "title": "Traffic Signs and Signals",
    "slug": "traffic-signs-and-signals",
    "content": "# Traffic Signs\n\nTraffic signs are...",
    "order": 1,
    "topicId": "topic123",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "Note fetched successfully"
}
Mobile Implementation

1. Install React Native Markdown Renderer
npm install react-native-markdown-display
2. Notes Service
// services/notesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = '<https://jpjonline.com>';

export class NotesService {
  private static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  /**

* Get a single note by ID
   */
  static async getNoteById(noteId: string): Promise<Note> {
    const accessToken = await this.getAccessToken();

    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(
      `${API_BASE_URL}/api/notes/${noteId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }

    const data = await response.json();
    return data.note;
  }

  /**

* Get note by slug (alternative)
   */
  static async getNoteBySlug(
    categorySlug: string,
    topicSlug: string,
    noteSlug: string
  ): Promise<Note> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${API_BASE_URL}/api/notes/categories/${categorySlug}/topics/${topicSlug}/notes/${noteSlug}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }

    const result = await response.json();
    return result.data;
  }
}
3. Note Detail Screen with Markdown Rendering
// screens/NoteDetailScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import Markdown from 'react-native-markdown-display';
import { NotesService } from '../services/notesService';
import { ArrowLeft, Share2 } from 'lucide-react-native';

export function NoteDetailScreen({ route, navigation }) {
  const { note: initialNote } = route.params;
  const [note, setNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Optional: Fetch fresh data
  useEffect(() => {
    if (initialNote?.id) {
      refreshNote();
    }
  }, [initialNote?.id]);

  const refreshNote = async () => {
    try {
      setLoading(true);
      const freshNote = await NotesService.getNoteById(initialNote.id);
      setNote(freshNote);
    } catch (err) {
      setError('Failed to load note');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !note) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  if (error && !note) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/*Header*/}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {note.title}
        </Text>
        <TouchableOpacity style={styles.shareButton}>
          <Share2 size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content}>
        {/* Meta Info */}
        <View style={styles.meta}>
          <Text style={styles.metaText}>
            {note.topic?.category?.title} / {note.topic?.title}
          </Text>
          <Text style={styles.readTime}>
            {Math.ceil(note.content.split(' ').length / 200)} min read
          </Text>
        </View>

        {/* Markdown Content */}
        <Markdown style={markdownStyles}>
          {note.content}
        </Markdown>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    backgroundColor: '#facc15',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  shareButton: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  meta: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  metaText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  readTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
});

// Markdown styles matching your web design
const markdownStyles = {
  body: {
    fontSize: 16,
    lineHeight: 24,
    color: '#1f2937',
  },
  heading1: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#000',
  },
  heading2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#000',
  },
  heading3: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#000',
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
    color: '#374151',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#374151',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f3f4f6',
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
  },
  link: {
    color: '#facc15',
    textDecorationLine: 'underline',
  },
  table: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  th: {
    backgroundColor: '#f9fafb',
    padding: 8,
    fontWeight: 'bold',
  },
  td: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
};
Required Dependencies
{
  "dependencies": {
    "react-native-markdown-display": "^7.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "lucide-react-native": "^0.400.0"
  }
}
npm install react-native-markdown-display @react-native-async-storage/async-storage lucide-react-native
