import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';

interface Category {
  id: string;
  title: string;
  slug: string;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) {
  return (
    <View style={styles.categoriesContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesScrollContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.title &&
                styles.selectedCategoryButton,
            ]}
            onPress={() => onCategoryChange(category.title)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.title &&
                  styles.selectedCategoryText,
              ]}
            >
              {category.title}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.scrollHintContainer}>
        <View style={styles.scrollHintOverlay} />
        <View style={styles.scrollHintArrow}>
          <Text style={styles.scrollHintText}>→</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  categoriesContainer: {
    height: 50,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  categoriesScrollContent: {
    paddingHorizontal: 20,
    alignItems: 'center',
    paddingRight: 40, // Extra padding to show scroll hint
  },
  scrollHintContainer: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
  },
  scrollHintOverlay: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  scrollHintArrow: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollHintText: {
    fontSize: 18,
    color: '#999999',
    fontWeight: 'bold',
  },
  categoryButton: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedCategoryButton: {
    backgroundColor: '#333333',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  selectedCategoryText: {
    color: '#FFFFFF',
  },
});
