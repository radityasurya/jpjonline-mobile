import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react-native';

interface ExamNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number;
  hasCheckedAnswer: boolean;
  isOpenExam: boolean;
  isSubmitting: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCheckAnswer: () => void;
  onSubmit: () => void;
}

export function ExamNavigation({
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  hasCheckedAnswer,
  isOpenExam,
  isSubmitting,
  onPrevious,
  onNext,
  onCheckAnswer,
  onSubmit,
}: ExamNavigationProps) {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const canProceed = !isOpenExam || hasCheckedAnswer;
  const showCheckButton = isOpenExam && !hasCheckedAnswer && selectedAnswer !== -1;

  return (
    <View style={styles.navigation}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={onPrevious}
          disabled={currentQuestionIndex === 0}>
          <ChevronLeft size={20} color={currentQuestionIndex === 0 ? '#CCCCCC' : '#333333'} />
          <Text style={[
            styles.navButtonText,
            currentQuestionIndex === 0 && styles.disabledButtonText,
          ]}>
            Previous
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        {showCheckButton ? (
          <TouchableOpacity
            style={styles.checkButton}
            onPress={onCheckAnswer}>
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : isLastQuestion && canProceed ? (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        ) : !isLastQuestion && canProceed ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={onNext}>
            <Text style={styles.navButtonText}>Next</Text>
            <ChevronRight size={20} color="#333333" />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  leftSection: {
    flex: 1,
  },
  rightSection: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  checkButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginHorizontal: 4,
  },
  disabledButtonText: {
    color: '#CCCCCC',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});