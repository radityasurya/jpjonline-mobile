import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import { ArrowUpDown, Check } from 'lucide-react-native';

export type SortOption =
  | 'name-asc'
  | 'name-desc'
  | 'questions-asc'
  | 'questions-desc'
  | 'newest'
  | 'oldest';

interface SortButtonProps {
  currentSort: SortOption;
  onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'questions-asc', label: 'Questions (Low to High)' },
  { value: 'questions-desc', label: 'Questions (High to Low)' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
];

export default function SortButton({
  currentSort,
  onSortChange,
}: SortButtonProps) {
  const [modalVisible, setModalVisible] = useState(false);

  const handleSortSelect = (sort: SortOption) => {
    onSortChange(sort);
    setModalVisible(false);
  };

  const getCurrentLabel = () => {
    const option = sortOptions.find((opt) => opt.value === currentSort);
    return option?.label || 'Sort';
  };

  return (
    <>
      <TouchableOpacity
        style={styles.sortButton}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <ArrowUpDown size={16} color="#374151" />
        <Text style={styles.sortButtonText}>Sort</Text>
      </TouchableOpacity>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sort By</Text>
            </View>

            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.sortOption}
                onPress={() => handleSortSelect(option.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    currentSort === option.value && styles.sortOptionTextActive,
                  ]}
                >
                  {option.label}
                </Text>
                {currentSort === option.value && (
                  <Check size={20} color="#facc15" />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    height: 48,
    borderRadius: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  sortOptionTextActive: {
    color: '#111827',
    fontWeight: '600',
  },
  cancelButton: {
    marginTop: 8,
    marginHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
