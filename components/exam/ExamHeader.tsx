import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { X } from 'lucide-react-native';
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
  const handleExit = () => {
    // On web/desktop, exit directly without modal
    if (Platform.OS === 'web') {
      onExit();
    } else {
      // On mobile, show confirmation modal
      onExit();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleExit}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <X size={20} color="#666666" />
      </TouchableOpacity>

      <View style={styles.headerCenter}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    ((currentQuestionIndex + 1) / totalQuestions) * 100
                  }%`,
                },
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
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  headerRight: {
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#facc15',
    borderRadius: 3,
  },
});
