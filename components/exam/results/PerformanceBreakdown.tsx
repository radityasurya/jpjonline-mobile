import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PerformanceBreakdownProps {
  score: number;
  passingScore: number;
  correctAnswers: number;
  totalQuestions: number;
}

export function PerformanceBreakdown({
  score,
  passingScore,
  correctAnswers,
  totalQuestions,
}: PerformanceBreakdownProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#FF3B30';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Performance Breakdown</Text>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${score}%`,
              backgroundColor: getScoreColor(score),
            },
          ]}
        />
      </View>

      <View style={styles.breakdownStats}>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Your Score</Text>
          <Text
            style={[styles.breakdownValue, { color: getScoreColor(score) }]}
          >
            {score}%
          </Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Passing Score</Text>
          <Text style={styles.breakdownValue}>{passingScore}%</Text>
        </View>
        <View style={styles.breakdownItem}>
          <Text style={styles.breakdownLabel}>Correct Answers</Text>
          <Text style={styles.breakdownValue}>
            {correctAnswers}/{totalQuestions}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  breakdownStats: {
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#666666',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
});
