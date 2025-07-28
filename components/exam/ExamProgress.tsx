import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { CircleCheck as CheckCircle, Menu } from 'lucide-react-native';

interface ExamProgressProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: number[];
  onQuestionSelect: (index: number) => void;
  onToggleQuestionSidebar: () => void;
}

export function ExamProgress({
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect,
  onToggleQuestionSidebar,
}: ExamProgressProps) {
  return (
    <View style={styles.questionNumbersBar}>
      <TouchableOpacity 
        style={styles.questionsButton}
        onPress={onToggleQuestionSidebar}>
        <Menu size={20} color="#333333" />
      </TouchableOpacity>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {questions.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.questionNumberButton,
              index === currentQuestionIndex && styles.currentQuestionNumber,
              answers[index] !== -1 && styles.answeredQuestionNumber,
            ]}
            onPress={() => onQuestionSelect(index)}>
            <Text style={[
              styles.questionNumberText,
              index === currentQuestionIndex && styles.currentQuestionNumberText,
              answers[index] !== -1 && styles.answeredQuestionNumberText,
            ]}>
              {index + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  questionNumbersBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  questionsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  questionNumberButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  currentQuestionNumber: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  answeredQuestionNumber: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  questionNumberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
  },
  currentQuestionNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  answeredQuestionNumberText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});