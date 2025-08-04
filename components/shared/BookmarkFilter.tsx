import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
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
  if (!featuresSupported) {
    return null;
  }

  return (
    <View style={styles.filtersContainer}>
      <TouchableOpacity
        style={[
          styles.bookmarkIconFilter,
          showBookmarksOnly && styles.activeBookmarkIconFilter,
        ]}
        onPress={onToggle}
      >
        <BookmarkCheck
          size={20}
          color={showBookmarksOnly ? '#FFFFFF' : '#666666'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  filtersContainer: {
    paddingHorizontal: 0,
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
});
