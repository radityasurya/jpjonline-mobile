import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface TabSelectorProps {
  activeTab: 'available' | 'results';
  onTabChange: (tab: 'available' | 'results') => void;
}

export default function TabSelector({
  activeTab,
  onTabChange,
}: TabSelectorProps) {
  return (
    <View style={styles.tabContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'available' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('available')}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'available' && styles.tabButtonTextActive,
          ]}
        >
          Available Exams
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === 'results' && styles.tabButtonActive,
        ]}
        onPress={() => onTabChange('results')}
      >
        <Text
          style={[
            styles.tabButtonText,
            activeTab === 'results' && styles.tabButtonTextActive,
          ]}
        >
          Results
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 4,
    marginBottom: 0,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  tabButtonTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
});
