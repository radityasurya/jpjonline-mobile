import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {
  CircleCheck as CheckCircle,
  Menu,
  Volume2,
  VolumeX,
  Lock,
  Clock as Unlock,
} from 'lucide-react-native';

interface ExamProgressProps {
  questions: any[];
  currentQuestionIndex: number;
  answers: number[];
  onQuestionSelect: (index: number) => void;
  onToggleQuestionSidebar: () => void;
  isSoundEnabled: boolean;
  examMode: 'OPEN' | 'CLOSED';
  onToggleSound: () => void;
  onToggleMode: () => void;
}

export function ExamProgress({
  questions,
  currentQuestionIndex,
  answers,
  onQuestionSelect,
  onToggleQuestionSidebar,
  isSoundEnabled,
  examMode,
  onToggleSound,
  onToggleMode,
}: ExamProgressProps) {
  return (
    <View style={styles.navigationBar}>
      {/* Left Section: Questions Toggle Button and Question Numbers */}
      <View style={styles.leftSection}>
        {/* Questions Toggle Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.questionsButton]}
          onPress={onToggleQuestionSidebar}
        >
          <Menu size={18} color="#333333" />
        </TouchableOpacity>

        {/* Question Numbers */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.questionNumbersContainer}
          contentContainerStyle={styles.questionNumbersContent}
        >
          {questions.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.questionNumberButton,
                index === currentQuestionIndex && styles.currentQuestionNumber,
                answers[index] !== -1 && styles.answeredQuestionNumber,
              ]}
              onPress={() => onQuestionSelect(index)}
            >
              <Text
                style={[
                  styles.questionNumberText,
                  index === currentQuestionIndex &&
                    styles.currentQuestionNumberText,
                  answers[index] !== -1 && styles.answeredQuestionNumberText,
                ]}
              >
                {index + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Right Section: Sound and Mode Controls */}
      <View style={styles.rightSection}>
        {/* Sound Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.soundButton]}
          onPress={onToggleSound}
        >
          {isSoundEnabled ? (
            <Volume2 size={18} color="#4CAF50" />
          ) : (
            <VolumeX size={18} color="#FF3B30" />
          )}
        </TouchableOpacity>

        {/* Mode Button */}
        <TouchableOpacity
          style={[styles.controlButton, styles.modeButton]}
          onPress={onToggleMode}
        >
          {examMode === 'OPEN' ? (
            <Unlock size={18} color="#2196F3" />
          ) : (
            <Lock size={18} color="#FF9800" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navigationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  separator: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  soundButton: {
    borderColor: '#4CAF50',
  },
  modeButton: {
    borderColor: '#2196F3',
    marginRight: 0,
  },
  questionsButton: {
    borderColor: '#333333',
    marginRight: 12,
  },
  questionNumbersContainer: {
    flex: 1,
  },
  questionNumbersContent: {
    paddingRight: 16,
  },
  questionNumberButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
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
    fontSize: 12,
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
