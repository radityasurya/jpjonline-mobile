import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { Book, FileText, Trophy, Clock, Crown } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import api from '@/services/api';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalStudyTime: 0,
    bookmarkedNotes: 0,
    recentActivity: [],
    streak: 0
  });

  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
      return;
    }
    loadStats();
  }, [user]);

  if (isLoading || !user) {
    return null;
  }

  const loadStats = async () => {
    try {
      const response = await api.user.fetchUserStats(user!.id);
      if (response.success) {
        setStats(response.data!);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const quickActions = [
    {
      icon: Book,
      title: 'Study Notes',
      subtitle: 'Access learning materials',
      action: () => router.push('/(tabs)/notes'),
      color: '#4CAF50',
    },
    {
      icon: FileText,
      title: 'Practice Tests',
      subtitle: 'Start practice exam',
      action: () => router.push('/(tabs)/tests'),
      color: '#2196F3',
    },
    {
      icon: Trophy,
      title: 'My Progress',
      subtitle: 'View your progress',
      action: () => router.push('/(tabs)/profile'),
      color: '#FF9800',
    },
  ];

  const handleActivityClick = (activity: any) => {
    if (activity.type === 'exam_completed') {
      // Navigate to results page, it will load data from localStorage
      router.push(`/exam/result/${activity.examId}`);
    } else if (activity.type === 'note_viewed' || activity.type === 'note_bookmarked') {
      router.push(`/notes/${activity.noteId}`);
    }
  };
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <Text style={styles.userName}>{user.name}</Text>
        <View style={styles.subscriptionBadge}>
          {user.subscription === 'premium' && (
            <Crown size={14} color="#4CAF50" style={styles.premiumIcon} />
          )}
          <Text style={[
            styles.subscriptionText,
            { color: user.subscription === 'premium' ? '#4CAF50' : '#FF9800' }
          ]}>
            {user.subscription === 'premium' ? 'PREMIUM' : 'FREE'}
          </Text>
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={24} color="#facc15" />
          <Text style={styles.statNumber}>{Math.round(stats.totalStudyTime / 60)}</Text>
          <Text style={styles.statLabel}>Hours</Text>
        </View>
        <View style={styles.statItem}>
          <Trophy size={24} color="#facc15" />
          <Text style={styles.statNumber}>{stats.averageScore}%</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
        <View style={styles.statItem}>
          <FileText size={24} color="#facc15" />
          <Text style={styles.statNumber}>{stats.totalExams}</Text>
          <Text style={styles.statLabel}>Tests</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      
      {quickActions.map((action, index) => {
        const Icon = action.icon;
        return (
          <TouchableOpacity
            key={index}
            style={styles.actionCard}
            onPress={action.action}>
            <View style={[styles.actionIcon, { backgroundColor: action.color }]}>
              <Icon size={24} color="white" />
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      <View style={styles.recentActivity}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        {stats.recentActivity.length > 0 ? (
          stats.recentActivity.map((activity, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.activityItem}
              onPress={() => handleActivityClick(activity)}>
              <Text style={styles.activityTitle}>
                {activity.type === 'exam_completed' ? `Completed: ${activity.examTitle}` : 
                 activity.type === 'note_bookmarked' ? 'Bookmarked a note' : 
                 activity.type === 'note_viewed' ? `Viewed: ${activity.noteTitle}` :
                 'Recent Activity'}
              </Text>
              <Text style={styles.activityDate}>
                {new Date(activity.timestamp).toLocaleDateString()}
              </Text>
              {activity.score && (
                <Text style={styles.activityScore}>Score: {activity.score}%</Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity style={styles.activityItem}>
            <Text style={styles.activityTitle}>No recent activity</Text>
            <Text style={styles.activityDate}>Start learning to see your progress</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#facc15',
    paddingTop: 70,
    paddingBottom: 40,
  },
  greeting: {
    fontSize: 16,
    color: '#666666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 4,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  premiumIcon: {
    marginRight: 4,
  },
  subscriptionText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#333333',
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  recentActivity: {
    marginHorizontal: 20,
    marginBottom: 40,
  },
  activityItem: {
    backgroundColor: '#F8F9FA',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  activityDate: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  activityScore: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
});