import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { X, CircleCheck as CheckCircle } from 'lucide-react-native';

interface QuestionSidebarProps {
  visible: boolean;
  questions: any[];
  currentQuestionIndex: number;
  answers: number[];
  onQuestionSelect: (index: number) => void;
  onClose: () => void;
}

export function QuestionSidebar({
  visible,
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect,
  onClose,
}: QuestionSidebarProps) {
  if (!visible) return null;

  return (
    <View style={styles.sidebar}>
      <View style={styles.sidebarHeader}>
        <Text style={styles.sidebarTitle}>Questions</Text>
        <TouchableOpacity onPress={onClose}>
          <X size={20} color="#333333" />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.sidebarContent}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sidebarQuestionItem,
              index === currentQuestionIndex && styles.sidebarCurrentQuestion,
              answers[index] !== -1 && styles.sidebarAnsweredQuestion,
            ]}
            onPress={() => {
              onQuestionSelect(index);
              onClose();
            }}
          >
            <Text
              style={[
                styles.sidebarQuestionNumber,
                index === currentQuestionIndex &&
                  styles.sidebarCurrentQuestionText,
                answers[index] !== -1 && styles.sidebarAnsweredQuestionText,
              ]}
            >
              {index + 1}
            </Text>
            {answers[index] !== -1 && <CheckCircle size={16} color="#4CAF50" />}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    position: 'absolute',
    top: 180,
    left: 20,
    width: 200,
    maxHeight: 400,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sidebarTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
  },
  sidebarContent: {
    maxHeight: 300,
  },
  sidebarQuestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sidebarCurrentQuestion: {
    backgroundColor: '#E3F2FD',
  },
  sidebarAnsweredQuestion: {
    backgroundColor: '#E8F5E8',
  },
  sidebarQuestionNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  sidebarCurrentQuestionText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  sidebarAnsweredQuestionText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
});
