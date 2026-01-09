import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BookmarkCheck } from 'lucide-react-native';

interface BookmarkFilterProps {
  showBookmarksOnly: boolean;
  onToggle: () => void;
  featuresSupported?: boolean;
}

export default function BookmarkFilter({
  showBookmarksOnly,
  onToggle,
  featuresSupported = true,
}: BookmarkFilterProps) {
  // Use key to force re-render when showBookmarksOnly changes
  const filterKey = `bookmark-filter-${showBookmarksOnly}`;
  if (!featuresSupported) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.bookmarkFilter,
        showBookmarksOnly && styles.activeBookmarkFilter,
      ]}
      onPress={onToggle}
    >
      <BookmarkCheck
        size={16}
        color={showBookmarksOnly ? '#FFFFFF' : '#374151'}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bookmarkFilter: {
    width: 44,
    height: 44,
    backgroundColor: '#F8F9FA',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeBookmarkFilter: {
    backgroundColor: '#333333',
    borderColor: '#333333',
  },
});
