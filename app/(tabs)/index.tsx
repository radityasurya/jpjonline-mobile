import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';
import { logger } from '@/utils/logger';
import { Book, FileText, Trophy, Clock, Crown } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { progressService, activityService, ACTIVITY_TYPES } from '@/services';

export default function HomeScreen() {
  const { user, logout, isLoading } = useAuth();

  // Check if features are supported on current platform
  const featuresSupported = progressService.getPlatformInfo().supported;

  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalStudyTime: 0,
    bookmarkedNotes: 0,
    recentActivity: [],
    currentStreak: 0,
    lastActivity: null,
  });

  useEffect(() => {
    if (!user) {
      logger.warn('HomeScreen', 'No user found, redirecting to login');
      router.replace('/auth/login');
      return;
    }

    // Initialize progress service for the user
    try {
      progressService.initializeUser(user.id);
    } catch (error) {
      logger.error(
        'HomeScreen',
        'Failed to initialize progress service',
        error
      );
    }

    logger.info('HomeScreen', 'Loading user stats', { userId: user.id });
    loadStats();
  }, [user]);

  if (isLoading || !user) {
    return null;
  }

  const loadStats = async () => {
    try {
      logger.debug('HomeScreen', 'Fetching user statistics');

      if (!featuresSupported) {
        logger.info('HomeScreen', 'Progress tracking disabled on web platform');
        setStats({
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          recentActivity: [],
          currentStreak: 0,
          lastActivity: null,
        });
        return;
      }

      const response = await progressService.getDashboardSummary();
      if (response.success) {
        logger.debug('HomeScreen', 'Stats loaded successfully', {
          totalExams: response.summary.totalExams,
          averageScore: response.summary.averageScore,
        });
        setStats(response.summary);
      } else {
        logger.warn('HomeScreen', 'Failed to load stats', response.error);
        // Set default stats on error
        setStats({
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          recentActivity: [],
          currentStreak: 0,
          lastActivity: null,
        });
      }
    } catch (error) {
      logger.error('HomeScreen', 'Error loading stats', error);
    }
  };

  const quickActions = [
    {
      icon: Book,
      title: 'Study Notes',
      subtitle: 'Access learning materials',
      action: () => {
        logger.userAction('Quick action clicked', { action: 'study_notes' });
        activityService.addActivity(ACTIVITY_TYPES.QUICK_ACTION, {
          action: 'study_notes',
          actionTitle: 'Study Notes',
          userId: user?.id,
        });
        router.push('/(tabs)/notes');
      },
      color: '#4CAF50',
    },
    {
      icon: FileText,
      title: 'Practice Tests',
      subtitle: 'Start practice exam',
      action: () => {
        logger.userAction('Quick action clicked', { action: 'practice_tests' });
        activityService.addActivity(ACTIVITY_TYPES.QUICK_ACTION, {
          action: 'practice_tests',
          actionTitle: 'Practice Tests',
          userId: user?.id,
        });
        router.push('/(tabs)/tests');
      },
      color: '#2196F3',
    },
    {
      icon: Trophy,
      title: 'My Progress',
      subtitle: 'View your progress',
      action: () => {
        logger.userAction('Quick action clicked', { action: 'my_progress' });
        activityService.addActivity(ACTIVITY_TYPES.QUICK_ACTION, {
          action: 'my_progress',
          actionTitle: 'My Progress',
          userId: user?.id,
        });
        router.push('/(tabs)/profile');
      },
      color: '#FF9800',
    },
  ];

  const handleActivityClick = (activity: any) => {
    if (!featuresSupported) {
      return;
    }

    logger.userAction('Activity clicked', {
      type: activity.type,
      id: activity.id,
    });

    if (!activity.isClickable) return;

    const activityData = activity.data || {};

    if (
      activity.type === ACTIVITY_TYPES.EXAM_COMPLETED &&
      activityData.examSlug
    ) {
      logger.navigation('ExamResult', { examSlug: activityData.examSlug });
      router.push(`/exam/result/${activityData.examSlug}`);
    } else if (
      (activity.type === ACTIVITY_TYPES.NOTE_VIEWED ||
        activity.type === ACTIVITY_TYPES.NOTE_BOOKMARKED) &&
      activityData.noteSlug
    ) {
      logger.navigation('NoteDetail', { noteId: activityData.noteId });
      router.push(`/notes/${activityData.noteId}`);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.greeting}>Welcome back,</Text>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName}>{user.name}</Text>
          {user.tier === 'PREMIUM' && (
            <View style={styles.subscriptionBadge}>
              <Crown size={18} color="#FFD700" style={styles.premiumIcon} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Clock size={24} color="#facc15" />
          <Text style={styles.statNumber}>
            {Math.round(stats.totalStudyTime / 60)}
          </Text>
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
            onPress={action.action}
          >
            <View
              style={[styles.actionIcon, { backgroundColor: action.color }]}
            >
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
              disabled={!activity.isClickable}
              onPress={() => handleActivityClick(activity)}
            >
              <View style={styles.activityHeader}>
                <Text style={styles.activityIcon}>{activity.displayIcon}</Text>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {activity.displayDescription}
                  </Text>
                  <Text style={styles.activityDate}>{activity.timeAgo}</Text>
                </View>
              </View>
              {activity.data?.score && (
                <Text style={styles.activityScore}>
                  Score: {activity.data.score}%
                </Text>
              )}
            </TouchableOpacity>
          ))
        ) : (
          <TouchableOpacity style={styles.activityItem}>
            <Text style={styles.activityTitle}>No recent activity</Text>
            <Text style={styles.activityDate}>
              Start learning to see your progress
            </Text>
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
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumIcon: {
    marginLeft: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
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
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
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
