import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Clock, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import soundManager from '@/utils/soundManager';

interface ExamTimerProps {
  mode: 'total' | 'per-question';
  totalDuration?: number; // in seconds
  questionDuration?: number; // in seconds per question
  currentQuestionIndex?: number;
  totalQuestions?: number;
  onTimeExpired: () => void;
  onQuestionTimeExpired?: () => void;
  isActive: boolean;
}

export function ExamTimer({
  mode,
  totalDuration = 3600,
  questionDuration = 60,
  currentQuestionIndex = 0,
  totalQuestions = 1,
  onTimeExpired,
  onQuestionTimeExpired,
  isActive,
}: ExamTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(
    mode === 'total' ? totalDuration : questionDuration
  );
  const [questionTimeRemaining, setQuestionTimeRemaining] = useState(questionDuration);
  const [hasWarned, setHasWarned] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const questionTimerRef = useRef<NodeJS.Timeout>();

  // Reset question timer when question changes
  useEffect(() => {
    if (mode === 'per-question') {
      setQuestionTimeRemaining(questionDuration);
      setHasWarned(false);
    }
  }, [currentQuestionIndex, questionDuration, mode]);

  // Main timer effect
  useEffect(() => {
    if (!isActive) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
      return;
    }

    if (mode === 'total') {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            onTimeExpired();
            return 0;
          }
          
          // Warning at 5 minutes (300 seconds)
          if (prev === 300 && !hasWarned) {
            setHasWarned(true);
            soundManager.playWarning();
            Alert.alert(
              'Time Warning',
              '5 minutes remaining!',
              [{ text: 'OK' }]
            );
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      // Per-question mode
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeRemaining(prev => {
          if (prev <= 1) {
            onQuestionTimeExpired?.();
            return questionDuration; // Reset for next question
          }
          
          // Warning at 10 seconds
          if (prev === 10 && !hasWarned) {
            setHasWarned(true);
            soundManager.playWarning();
            Alert.alert(
              'Time Warning',
              '10 seconds remaining for this question!',
              [{ text: 'OK' }]
            );
          }
          
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (questionTimerRef.current) clearInterval(questionTimerRef.current);
    };
  }, [isActive, mode, hasWarned, onTimeExpired, onQuestionTimeExpired, questionDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getTimeColor = (seconds: number, threshold: number) => {
    if (seconds <= threshold * 0.1) return '#FF3B30'; // Red for last 10%
    if (seconds <= threshold * 0.25) return '#FF9800'; // Orange for last 25%
    return '#4CAF50'; // Green for normal time
  };

  const displayTime = mode === 'total' ? timeRemaining : questionTimeRemaining;
  const threshold = mode === 'total' ? totalDuration : questionDuration;
  const timeColor = getTimeColor(displayTime, threshold);

  return (
    <View style={styles.container}>
      <View style={styles.timerContainer}>
        <Clock size={20} color={timeColor} />
        <Text style={[styles.timerText, { color: timeColor }]}>
          {formatTime(displayTime)}
        </Text>
        {displayTime <= threshold * 0.1 && (
          <AlertTriangle size={16} color="#FF3B30" />
        )}
      </View>
      
      {mode === 'per-question' && (
        <Text style={styles.modeText}>
          Question {currentQuestionIndex + 1}/{totalQuestions}
        </Text>
      )}
      
      {mode === 'total' && (
        <Text style={styles.modeText}>
          Total Time
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  modeText: {
    fontSize: 10,
    color: '#666666',
    marginTop: 2,
  },
});