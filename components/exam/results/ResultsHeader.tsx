import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  Trophy,
  Clock,
  CircleCheck as CheckCircle,
  Circle as XCircle,
} from 'lucide-react-native';

interface ResultsHeaderProps {
  examTitle: string;
  score: number;
  passed: boolean;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
}

export function ResultsHeader({
  examTitle,
  score,
  passed,
  passingScore,
  correctAnswers,
  totalQuestions,
  timeSpent,
}: ResultsHeaderProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#FF3B30';
  };

  const getPerformanceMessage = (score: number, passed: boolean) => {
    if (passed) {
      if (score >= 95) return 'Excellent! Outstanding performance!';
      if (score >= 85) return 'Congratulations! You passed with flying colors!';
      return 'Well done! You have successfully passed this exam!';
    }
    return 'Keep trying! Take the test again to reach the passing score.';
  };

  return (
    <View style={styles.container}>
      <View style={[styles.scoreCircle, { borderColor: getScoreColor(score) }]}>
        <Text style={[styles.scoreText, { color: getScoreColor(score) }]}>
          {score}%
        </Text>
        <Trophy size={32} color={getScoreColor(score)} />
      </View>

      <Text style={styles.examTitle}>{examTitle}</Text>
      <Text style={[styles.statusText, { color: getScoreColor(score) }]}>
        {passed ? 'PASSED' : 'FAILED'}
      </Text>
      <Text style={styles.messageText}>
        {getPerformanceMessage(score, passed)}
      </Text>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <CheckCircle size={24} color="#4CAF50" />
          <Text style={styles.statNumber}>{correctAnswers}</Text>
          <Text style={styles.statLabel}>Correct</Text>
        </View>

        <View style={styles.statItem}>
          <XCircle size={24} color="#FF3B30" />
          <Text style={styles.statNumber}>
            {totalQuestions - correctAnswers}
          </Text>
          <Text style={styles.statLabel}>Incorrect</Text>
        </View>

        <View style={styles.statItem}>
          <Clock size={24} color="#2196F3" />
          <Text style={styles.statNumber}>{timeSpent}</Text>
          <Text style={styles.statLabel}>Minutes</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#facc15',
    paddingTop: 80,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  examTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
});
