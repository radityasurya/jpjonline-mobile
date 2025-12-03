# Mobile Notes Implementation Guide

## Overview

This guide provides complete details for displaying study notes in your mobile app. The notes are organized under the **"Semua Kategori"** (All Categories) category with topics and individual notes.

---

## Data Structure

### Notes Hierarchy

```
NoteCategory: "Semua Kategori" (slug: "semua-kategori")
  └── NoteTopic (e.g., "Road Safety", "Traffic Signs")
      └── Note (individual study materials)
```

### Database Models

#### NoteCategory

```typescript
{
  id: string;
  title: string;        // "Semua Kategori"
  slug: string;         // "semua-kategori"
  order: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### NoteTopic

```typescript
{
  id: string;
  title: string;        // e.g., "Road Safety"
  slug: string;
  description: string | null;
  order: number;
  categoryId: string;   // Links to "semua-kategori" category
  createdAt: Date;
  updatedAt: Date;
}
```

#### Note

```typescript
{
  id: string;
  title: string;
  slug: string;
  content: string;      // Markdown format
  order: number;
  authorId: string;
  topicId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. Get "Semua Kategori" Category with Topics and Notes

**GET** `/api/notes?categoryId={categoryId}`

**Headers:**

```
Authorization: Bearer {accessToken}
```

**Query Parameters:**

- `categoryId` - The ID of "semua-kategori" category (required)
- `page=1` - Page number (optional, default: 1)
- `limit=100` - Items per page (optional, default: 50)

#### Step 1: Get the Category ID

First, you need to get the "semua-kategori" category ID. You can either:

**Option A: Hardcode it** (if you know the ID)

```typescript
const SEMUA_KATEGORI_ID = "your-category-id-here";
```

**Option B: Fetch it dynamically** (recommended)

```typescript
// This endpoint doesn't exist yet, but you can query notes and extract it
// Or create a dedicated endpoint: GET /api/notes/categories
```

#### Step 2: Fetch Notes by Category

**Request:**

```
GET /api/notes?categoryId=cat-semua-kategori-id&limit=100
```

#### Response Structure

```json
{
  "notes": [
    {
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
      "author": {
        "id": "user123",
        "name": "Admin",
        "email": "admin@jpjonline.com"
      },
      "createdAt": "2025-01-01T00:00:00.000Z",
      "updatedAt": "2025-01-01T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 100,
  "totalPages": 1,
  "groupedByCategory": false
}
```

---

## Mobile Implementation

### 1. API Service (TypeScript)

```typescript
// services/notesService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://jpjonline.com';
const SEMUA_KATEGORI_SLUG = 'semua-kategori';

interface Note {
  id: string;
  title: string;
  slug: string;
  content: string;
  order: number;
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
  createdAt: string;
  updatedAt: string;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  notes: Note[];
}

interface NotesResponse {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class NotesService {
  private static async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem('accessToken');
  }

  /**
   * Get all notes from "Semua Kategori" category
   */
  static async getAllNotes(): Promise<NotesResponse> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('Not authenticated');
    }

    // First, get the category ID by fetching notes and extracting it
    // Or you can hardcode it if you know the ID
    const response = await fetch(
      `${API_BASE_URL}/api/notes?limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }

    const data: NotesResponse = await response.json();
    
    // Filter notes from "semua-kategori" category
    const semuaKategoriNotes = data.notes.filter(
      note => note.topic?.category?.slug === SEMUA_KATEGORI_SLUG
    );

    return {
      ...data,
      notes: semuaKategoriNotes,
      total: semuaKategoriNotes.length,
    };
  }

  /**
   * Get notes organized by topics
   */
  static async getNotesByTopics(): Promise<Topic[]> {
    const response = await this.getAllNotes();
    
    // Group notes by topic
    const topicsMap = new Map<string, Topic>();
    
    response.notes.forEach(note => {
      const topicId = note.topic.id;
      
      if (!topicsMap.has(topicId)) {
        topicsMap.set(topicId, {
          id: note.topic.id,
          title: note.topic.title,
          slug: note.topic.slug,
          notes: [],
        });
      }
      
      topicsMap.get(topicId)!.notes.push(note);
    });
    
    // Convert map to array and sort by topic title
    const topics = Array.from(topicsMap.values()).sort((a, b) => 
      a.title.localeCompare(b.title)
    );
    
    // Sort notes within each topic by order
    topics.forEach(topic => {
      topic.notes.sort((a, b) => a.order - b.order);
    });
    
    return topics;
  }

  /**
   * Search notes by keyword
   */
  static async searchNotes(keyword: string): Promise<Note[]> {
    const response = await this.getAllNotes();
    
    const lowerKeyword = keyword.toLowerCase();
    return response.notes.filter(note =>
      note.title.toLowerCase().includes(lowerKeyword) ||
      note.content.toLowerCase().includes(lowerKeyword)
    );
  }

  /**
   * Get notes by specific topic
   */
  static async getNotesByTopic(topicId: string): Promise<Note[]> {
    const response = await this.getAllNotes();
    
    return response.notes
      .filter(note => note.topic.id === topicId)
      .sort((a, b) => a.order - b.order);
  }
}
```

---

### 2. Notes Screen (Topics List)

```typescript
// screens/NotesScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  TextInput,
} from 'react-native';
import { NotesService } from '../services/notesService';
import { useI18n } from '../hooks/useI18n';

export function NotesScreen({ navigation }) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(true);
  const [topics, setTopics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTopics, setFilteredTopics] = useState([]);

  useEffect(() => {
    loadTopics();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTopics(topics);
    } else {
      const filtered = topics.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.notes.some(note =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
      setFilteredTopics(filtered);
    }
  }, [searchQuery, topics]);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const topicsData = await NotesService.getNotesByTopics();
      setTopics(topicsData);
      setFilteredTopics(topicsData);
    } catch (error) {
      console.error('Failed to load topics:', error);
      // Show error message to user
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#facc15" />
        <Text style={styles.loadingText}>{t('notes.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('notes.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('notes.subtitle')}</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={t('notes.searchTopics')}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Topics List */}
      <FlatList
        data={filteredTopics}
        keyExtractor={item => item.id}
        renderItem={({ item: topic }) => (
          <TouchableOpacity
            style={styles.topicCard}
            onPress={() => navigation.navigate('TopicNotes', { topic })}
          >
            <View style={styles.topicHeader}>
              <Text style={styles.topicTitle}>{topic.title}</Text>
              <Text style={styles.topicCount}>
                {topic.notes.length} {t('notes.notes')}
              </Text>
            </View>
            <Text style={styles.topicPreview} numberOfLines={2}>
              {topic.notes[0]?.title || ''}
            </Text>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadTopics}
      />
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
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#facc15',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#333',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  listContent: {
    padding: 16,
  },
  topicCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  topicTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  topicCount: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  topicPreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
```

---

### 3. Topic Notes Screen (Notes List)

```typescript
// screens/TopicNotesScreen.tsx
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useI18n } from '../hooks/useI18n';

export function TopicNotesScreen({ route, navigation }) {
  const { topic } = route.params;
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {/* Topic Header */}
      <View style={styles.header}>
        <Text style={styles.topicTitle}>{topic.title}</Text>
        <Text style={styles.noteCount}>
          {topic.notes.length} {t('notes.notes')}
        </Text>
      </View>

      {/* Notes List */}
      <FlatList
        data={topic.notes}
        keyExtractor={item => item.id}
        renderItem={({ item: note, index }) => (
          <TouchableOpacity
            style={styles.noteCard}
            onPress={() => navigation.navigate('NoteDetail', { note })}
          >
            <View style={styles.noteNumber}>
              <Text style={styles.noteNumberText}>{index + 1}</Text>
            </View>
            <View style={styles.noteContent}>
              <Text style={styles.noteTitle}>{note.title}</Text>
              <Text style={styles.notePreview} numberOfLines={2}>
                {note.content.substring(0, 100)}...
              </Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#facc15',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  noteCount: {
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    padding: 16,
  },
  noteCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noteNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#facc15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  noteNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  notePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
```

---

### 4. Note Detail Screen (with Markdown)

```typescript
// screens/NoteDetailScreen.tsx
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

export function NoteDetailScreen({ route }) {
  const { note } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Markdown style={markdownStyles}>
        {note.content}
      </Markdown>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
});

const markdownStyles = {
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
    color: '#333',
  },
  listItem: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  strong: {
    fontWeight: 'bold',
  },
  em: {
    fontStyle: 'italic',
  },
  code_inline: {
    backgroundColor: '#f5f5f5',
    padding: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontFamily: 'monospace',
    marginBottom: 12,
    fontSize: 14,
  },
  blockquote: {
    backgroundColor: '#fff9e6',
    borderLeftWidth: 4,
    borderLeftColor: '#facc15',
    padding: 12,
    marginBottom: 12,
  },
};
```

---

## Navigation Setup

```typescript
// navigation/AppNavigator.tsx
import { createStackNavigator } from '@react-navigation/stack';
import { NotesScreen } from '../screens/NotesScreen';
import { TopicNotesScreen } from '../screens/TopicNotesScreen';
import { NoteDetailScreen } from '../screens/NoteDetailScreen';

const Stack = createStackNavigator();

export function NotesNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Notes" 
        component={NotesScreen}
        options={{ title: 'Study Notes' }}
      />
      <Stack.Screen 
        name="TopicNotes" 
        component={TopicNotesScreen}
        options={({ route }) => ({ title: route.params.topic.title })}
      />
      <Stack.Screen 
        name="NoteDetail" 
        component={NoteDetailScreen}
        options={({ route }) => ({ title: route.params.note.title })}
      />
    </Stack.Navigator>
  );
}
```

---

## Required Dependencies

```json
{
  "dependencies": {
    "react-native-markdown-display": "^7.0.0",
    "@react-native-async-storage/async-storage": "^1.19.0",
    "@react-navigation/native": "^6.1.0",
    "@react-navigation/stack": "^6.3.0"
  }
}
```

### Installation

```bash
npm install react-native-markdown-display @react-native-async-storage/async-storage @react-navigation/native @react-navigation/stack
```

---

## Summary

**Category**: "Semua Kategori" (slug: "semua-kategori")

**Structure**:

1. Fetch all notes from API
2. Filter notes by "semua-kategori" category
3. Group notes by topics
4. Display topics list → notes list → note detail

**Key Features**:

- ✅ Organized by topics
- ✅ Search functionality
- ✅ Markdown content rendering
- ✅ Pull-to-refresh
- ✅ Clean, intuitive navigation

**Authentication**: Required (JWT Bearer token)

This implementation provides a complete, production-ready notes system focused on the "Semua Kategori" category!
