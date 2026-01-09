import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import {
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  Trash2,
} from 'lucide-react-native';

interface ExamResult {
  id: string;
  examSlug: string;
  examTitle: string;
  score: number;
  passed: boolean;
  completedAt: string;
  timeSpent: number;
}

interface ResultCardProps {
  result: ExamResult;
  onPress: (result: ExamResult) => void;
  onDelete?: (resultId: string) => Promise<void>;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export default function ResultCard({
  result,
  onPress,
  onDelete,
}: ResultCardProps) {
  const handleDelete = () => {
    if (onDelete) {
      Alert.alert(
        'Delete Result',
        'Are you sure you want to delete this exam result?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => onDelete(result.id),
          },
        ],
      );
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50';
    if (score >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <TouchableOpacity
      style={styles.resultCard}
      onPress={() => onPress(result)}
      activeOpacity={0.9}
    >
      {/* Title and Score Badge */}
      <View style={styles.resultHeader}>
        <Text style={styles.resultTitle}>{result.examTitle}</Text>
        <View
          style={[
            styles.scoreBadge,
            { backgroundColor: getScoreColor(result.score) },
          ]}
        >
          <Text style={styles.scoreText}>{result.score}%</Text>
        </View>
      </View>

      {/* Status Badge */}
      <View
        style={[
          styles.statusBadge,
          result.passed ? styles.statusPassed : styles.statusFailed,
        ]}
      >
        <Text style={styles.statusBadgeText}>
          {result.passed ? 'Passed' : 'Failed'}
        </Text>
      </View>

      {/* Separator */}
      <View style={styles.separator} />

      {/* Info Grid: 2x2 */}
      <View style={styles.infoGrid}>
        <View style={styles.infoCell}>
          <Trophy size={14} color="#666" />
          <Text style={styles.infoText}>{result.score}% score</Text>
        </View>
        <View style={styles.infoCell}>
          <Clock size={14} color="#666" />
          <Text style={styles.infoText}>{result.timeSpent} minutes</Text>
        </View>
        <View style={styles.infoCell}>
          <Calendar size={14} color="#666" />
          <Text style={styles.infoText}>{formatDate(result.completedAt)}</Text>
        </View>
        <View style={styles.infoCell}>
          {result.passed ? (
            <CheckCircle size={14} color="#4CAF50" />
          ) : (
            <XCircle size={14} color="#F44336" />
          )}
          <Text style={styles.infoText}>
            {result.passed ? 'Passed' : 'Failed'}
          </Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Trash2 size={16} color="#F44336" />
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => onPress(result)}
        >
          <Trophy size={16} color={'#000'} />
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
    marginRight: 8,
  },
  scoreBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 50,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statusBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  statusPassed: {
    backgroundColor: '#dcfce7',
  },
  statusFailed: {
    backgroundColor: '#fef2f2',
  },
  statusBadgeText: {
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
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    flex: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#facc15',
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
});
