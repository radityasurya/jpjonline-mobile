import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FileText, Trophy, Clock, Crown, Play } from 'lucide-react-native';

interface ApiExam {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  questionCount: number;
  crown?: boolean;
  accessible?: boolean;
  category: string;
  mode?: string;
  totalTimeDuration?: number | null;
  passRate?: number;
  timerType?: boolean;
}

interface ExamCardProps {
  exam: ApiExam;
  onPress: (exam: ApiExam) => void;
}

const formatDuration = (seconds: number) => {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  return `${minutes}m`;
};

export default function ExamCard({ exam, onPress }: ExamCardProps) {
  return (
    <TouchableOpacity
      style={styles.examCard}
      onPress={() => onPress(exam)}
      activeOpacity={0.9}
    >
      {/* Title and optional Crown */}
      <View style={styles.examHeader}>
        <Text style={styles.examTitle}>{exam.title}</Text>
        {exam.crown && (
          <View style={styles.crownBadge}>
            <Crown size={14} color="#000" />
          </View>
        )}
      </View>

      {/* Category Badge */}
      <View
        style={[
          styles.categoryBadge,
          exam.category === 'Open Practice'
            ? styles.categoryPractice
            : styles.categorySimulation,
        ]}
      >
        <Text style={styles.categoryBadgeText}>
          {exam.category === 'Open Practice' ? 'Practice' : 'Simulation'}
        </Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Info Grid: 2x2 */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <FileText size={14} color="#666" />
          <Text style={styles.infoText}>{exam.questionCount} questions</Text>
        </View>
        <View style={styles.infoCell}>
          <Clock size={14} color="#666" />
          <Text style={styles.infoText}>
            {exam.mode === 'OPEN' ? 'Open' : 'Closed'}
          </Text>
        </View>
        <View style={styles.infoCell}>
          <Clock size={14} color="#666" />
          <Text style={styles.infoText}>
            {exam.totalTimeDuration
              ? formatDuration(exam.totalTimeDuration)
              : 'Unlimited'}
          </Text>
        </View>
        {typeof exam.passRate === 'number' && (
          <View style={styles.infoCell}>
            <Trophy size={14} color="#666" />
            <Text style={styles.infoText}>{exam.passRate}% pass</Text>
          </View>
        )}
      </View>

      {/* Start Exam Button */}
      <TouchableOpacity
        style={styles.startButton}
        onPress={() => onPress(exam)}
      >
        <Play size={16} color={'#000'} />
        <Text style={styles.startButtonText}>Start Exam</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  examCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  examHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  examTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  crownBadge: {
    backgroundColor: '#facc15',
    borderRadius: 50,
    padding: 4,
  },
  categoryBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  categoryPractice: {
    backgroundColor: '#bfdbfe',
  },
  categorySimulation: {
    backgroundColor: '#fef08a',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1f2937',
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    marginVertical: 12,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoCell: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  infoText: {
    marginLeft: 6,
    fontSize: 13,
    color: '#374151',
  },
  startButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#facc15',
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});
