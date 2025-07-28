import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';
import { ExamTimer } from './ExamTimer';

interface ExamHeaderProps {
  examTitle: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  timerMode: 'total' | 'per-question';
  totalDuration?: number;
  questionDuration?: number;
  onTimeExpired: () => void;
  onQuestionTimeExpired?: () => void;
  isTimerActive: boolean;
  onExit: () => void;
}

export function ExamHeader({
  examTitle,
  currentQuestionIndex,
  totalQuestions,
  timerMode,
  totalDuration,
  questionDuration,
  onTimeExpired,
  onQuestionTimeExpired,
  isTimerActive,
  onExit,
}: ExamHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onExit}>
        <X size={24} color="#333333" />
      </TouchableOpacity>
      
      <View style={styles.headerCenter}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1}/{totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        <ExamTimer
          mode={timerMode}
          totalDuration={totalDuration}
          questionDuration={questionDuration}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
          onTimeExpired={onTimeExpired}
          onQuestionTimeExpired={onQuestionTimeExpired}
          isActive={isTimerActive}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#FFEEB4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 20,
  },
  headerRight: {
    alignItems: 'center',
  },
  progressContainer: {
    flex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 2,
  },
});