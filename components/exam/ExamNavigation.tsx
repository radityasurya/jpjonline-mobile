import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react-native';

interface ExamNavigationProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  selectedAnswer: number;
  hasCheckedAnswer: boolean;
  examMode: 'OPEN' | 'CLOSED';
  isSubmitting: boolean;
  canRetryQuestion: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onCheckAnswer: () => void;
  onRetryQuestion: () => void;
  onSubmit: () => void;
}

export function ExamNavigation({
  currentQuestionIndex,
  totalQuestions,
  selectedAnswer,
  hasCheckedAnswer,
  examMode,
  isSubmitting,
  canRetryQuestion,
  onPrevious,
  onNext,
  onCheckAnswer,
  onRetryQuestion,
  onSubmit,
}: ExamNavigationProps) {
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;

  // OPEN Mode: Must check answer before proceeding
  // CLOSED Mode: Can proceed immediately after selecting
  const canProceed =
    examMode === 'CLOSED' ? selectedAnswer !== -1 : hasCheckedAnswer;
  const showCheckButton =
    examMode === 'OPEN' && !hasCheckedAnswer && selectedAnswer !== -1;
  const showRetryButton =
    examMode === 'OPEN' && hasCheckedAnswer && canRetryQuestion;

  return (
    <View style={styles.navigation}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={[
            styles.navButton,
            currentQuestionIndex === 0 && styles.disabledButton,
          ]}
          onPress={onPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <ChevronLeft
            size={20}
            color={currentQuestionIndex === 0 ? '#CCCCCC' : '#333333'}
          />
          <Text
            style={[
              styles.navButtonText,
              currentQuestionIndex === 0 && styles.disabledButtonText,
            ]}
          >
            Previous
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.rightSection}>
        {showRetryButton ? (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={onRetryQuestion}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        ) : showCheckButton ? (
          <TouchableOpacity style={styles.checkButton} onPress={onCheckAnswer}>
            <Text style={styles.checkButtonText}>Check Answer</Text>
          </TouchableOpacity>
        ) : isLastQuestion && canProceed ? (
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.disabledButton]}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Submit</Text>
            )}
          </TouchableOpacity>
        ) : !isLastQuestion && canProceed ? (
          <TouchableOpacity style={styles.navButton} onPress={onNext}>
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
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButtonText: {
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
