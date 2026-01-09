import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Modal,
  TextInput,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  User,
  UserPen,
  Trophy,
  Percent,
  Clock,
  BookOpen,
  Info,
  MessageCircle,
  LogOut,
  Trash2,
  Crown,
  ExternalLink,
  X,
  Save,
  Mail,
} from 'lucide-react-native';
import { useAuth } from '../../contexts/AuthContext';
import { progressService } from '../../services';
import { logger } from '../../utils/logger';
import { getPageBySlug } from '../../services/pagesService';
import { LAYOUT_CONSTANTS } from '@/constants/layout';
import {
  updateUserProfile,
  deleteUserAccount,
  getUserProfile,
} from '../../services/userService';

interface UserStats {
  totalExams: number;
  averageScore: number;
  passedExams: number;
  totalStudyTime: number;
  bookmarkedNotes: number;
  streak: number;
  recentActivity: any[];
  lastActivity: any;
}

interface AboutData {
  title: string;
  content: string;
  version: string;
  lastUpdated: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const featuresSupported = true; // Enable features for mobile

  // Subscribe to bookmark changes
  useEffect(() => {
    if (!featuresSupported) return;

    const { subscribe } = require('../../services/bookmarkService.js');
    if (subscribe) {
      const unsubscribe = subscribe(() => {
        // Refresh stats when bookmarks change
        loadStats();
      });
      return unsubscribe;
    }
  }, [featuresSupported]);

  const [stats, setStats] = useState<UserStats>({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalStudyTime: 0,
    bookmarkedNotes: 0,
    streak: 0,
    recentActivity: [],
    lastActivity: null,
  });

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      initializeUserProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Refresh stats when screen is focused (e.g., after completing an exam)
  useFocusEffect(
    React.useCallback(() => {
      if (user && featuresSupported) {
        loadStats();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, featuresSupported]),
  );

  const initializeUserProgress = async () => {
    if (!featuresSupported) {
      logger.info(
        'ProfileScreen',
        'Progress tracking disabled on web platform',
      );
      return;
    }

    try {
      logger.debug('ProfileScreen', 'Initializing user progress', {
        userId: user!.id,
      });
      await progressService.initializeUser(user!.id);
      await loadStats();
    } catch (error) {
      logger.error(
        'ProfileScreen',
        'Failed to initialize user progress',
        error,
      );
    }
  };

  const loadStats = async () => {
    if (!featuresSupported) {
      logger.info(
        'ProfileScreen',
        'Progress tracking disabled on web platform',
      );
      setStats({
        totalExams: 0,
        averageScore: 0,
        passedExams: 0,
        totalStudyTime: 0,
        bookmarkedNotes: 0,
        streak: 0,
        recentActivity: [],
        lastActivity: null,
      });
      return;
    }

    try {
      logger.debug('ProfileScreen', 'Loading user statistics');
      const response: any = await progressService.getDashboardSummary();
      if (response.success) {
        logger.debug(
          'ProfileScreen',
          'Stats loaded successfully',
          response.summary,
        );
        logger.debug('ProfileScreen', 'Bookmark count from stats', {
          bookmarkedNotes: response.summary.bookmarkedNotes,
        });
        setStats({
          ...response.summary,
          streak: response.summary.currentStreak || 0,
        });
      } else {
        logger.warn('ProfileScreen', 'Failed to load stats', response.error);
        // Fallback to default stats
        setStats({
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          streak: 0,
          recentActivity: [],
          lastActivity: null,
        });
      }
    } catch (error) {
      logger.error('ProfileScreen', 'Error loading stats', error);
    }
  };

  const handleEditProfile = () => {
    logger.userAction('Profile edit initiated');
    setEditedProfile({
      name: user?.name || '',
      email: user?.email || '',
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    logger.userAction('Profile save attempted', editedProfile);

    try {
      const response: any = await updateUserProfile(null, {
        name: editedProfile.name,
        email: editedProfile.email,
      });

      if (response.success) {
        setIsEditModalVisible(false);
        logger.info('ProfileScreen', 'Profile updated successfully', {
          message: response.message,
        });

        // Refresh user data after successful update
        try {
          const userResponse: any = await getUserProfile(null);
          logger.info(
            'ProfileScreen',
            'User data refreshed after profile update',
            { userId: userResponse.id },
          );
          // Note: In a real implementation, you would update the auth context here
          // For now, we'll just log the success and show the alert
        } catch (refreshError) {
          logger.warn(
            'ProfileScreen',
            'Failed to refresh user data',
            refreshError,
          );
          // Continue with success message even if refresh fails
        }

        Alert.alert(
          'Success',
          response.message || 'Profile updated successfully!',
        );
      } else {
        throw new Error('Update failed');
      }
    } catch (error) {
      logger.error('ProfileScreen', 'Failed to update profile', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAboutUs = async () => {
    logger.userAction('About us opened');
    setIsAboutModalVisible(true);
    setIsLoading(true);
    try {
      const response: any = await getPageBySlug('about');
      setAboutData({
        title: response.title,
        content: response.content,
        version: '1.0.0',
        lastUpdated: new Date(response.updatedAt).toLocaleDateString(),
      });
      logger.debug('ProfileScreen', 'About data loaded from API');
    } catch (error) {
      logger.error('ProfileScreen', 'Error loading about data', error);
      // Fallback to default data
      setAboutData({
        title: 'About Us',
        content: 'Unable to load about information at this time.',
        version: '1.0.0',
        lastUpdated: new Date().toLocaleDateString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactUs = async () => {
    logger.userAction('Contact us opened');
    const email = 'info@jpjonline.com';
    const subject = 'Support Request from Mobile App';
    const body = `Hello JPJOnline Support Team,

I am contacting you regarding:

[Please describe your inquiry here]

User Details:
- Name: ${user?.name || 'N/A'}
- Email: ${user?.email || 'N/A'}

Thank you for your assistance.

Best regards,
${user?.name || 'User'}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    try {
      const supported = await Linking.canOpenURL(mailtoUrl);
      if (supported) {
        await Linking.openURL(mailtoUrl);
        logger.info('ProfileScreen', 'Email client opened successfully');
      } else {
        Alert.alert(
          'Email Not Available',
          'Please send an email to info@jpjonline.com or contact us through other means.',
        );
        logger.warn('ProfileScreen', 'Email client not available');
      }
    } catch (error) {
      logger.error('ProfileScreen', 'Error opening email client', error);
      Alert.alert(
        'Error',
        'Unable to open email client. Please contact info@jpjonline.com directly.',
      );
    }
  };

  const handleLogout = () => {
    logger.userAction('Logout initiated');
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logger.info('ProfileScreen', 'User logged out');
          logout();
        },
      },
    ]);
  };

  const handleDeleteAccount = () => {
    logger.userAction('Delete account initiated');
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);

              // Call the delete account service
              await deleteUserAccount(null);

              logger.info('ProfileScreen', 'Account deletion confirmed');
              Alert.alert(
                'Account Deleted',
                'Your account has been deleted successfully.',
              );
              logout();
            } catch (error) {
              logger.error('ProfileScreen', 'Failed to delete account', error);
              Alert.alert(
                'Error',
                'Unable to delete account. Please try again later.',
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const renderContent = (content: string) => {
    // Simple markdown-like rendering
    const lines = content.split('\n');
    const elements: React.ReactElement[] = [];

    lines.forEach((line, index) => {
      // Process inline formatting first
      const processInlineFormatting = (text: string) => {
        const parts: (string | React.ReactElement)[] = [];

        // Bold text **text**
        const boldRegex = /\*\*(.*?)\*\*/g;
        let match;
        let lastIndex = 0;

        while ((match = boldRegex.exec(text)) !== null) {
          // Add text before match
          if (match.index > lastIndex) {
            parts.push(text.substring(lastIndex, match.index));
          }
          // Add bold text
          parts.push(
            <Text key={`bold-${match.index}`} style={styles.boldInline}>
              {match[1]}
            </Text>,
          );
          lastIndex = match.index + match[0].length;
        }

        // Add remaining text
        if (lastIndex < text.length) {
          parts.push(text.substring(lastIndex));
        }

        return parts;
      };

      if (line.startsWith('# ')) {
        elements.push(
          <Text key={index} style={styles.heading1}>
            {line.substring(2)}
          </Text>,
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <Text key={index} style={styles.heading2}>
            {line.substring(3)}
          </Text>,
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <Text key={index} style={styles.heading3}>
            {line.substring(4)}
          </Text>,
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <View key={index} style={styles.listItemContainer}>
            <Text style={styles.listBullet}>•</Text>
            <Text style={styles.listItem}>
              {processInlineFormatting(line.substring(2))}
            </Text>
          </View>,
        );
      } else if (line.trim() === '') {
        elements.push(<View key={index} style={styles.spacing} />);
      } else if (line.match(/^\d+\./)) {
        elements.push(
          <View key={index} style={styles.listItemContainer}>
            <Text style={styles.paragraph}>
              {processInlineFormatting(line)}
            </Text>
          </View>,
        );
      } else {
        elements.push(
          <Text key={index} style={styles.paragraph}>
            {processInlineFormatting(line)}
          </Text>,
        );
      }
    });

    return elements;
  };

  // Commented out unused function - can be enabled when activity navigation is implemented
  // const handleActivityClick = (activity: any) => {
  //   logger.userAction('Activity clicked', {
  //     type: activity.type,
  //     id: activity.id,
  //   });
  //   // Navigation logic can be added here when activity data is available
  // };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.profileInfo}>
          <View style={styles.avatar}>
            <User size={40} color="#666666" />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{user?.name}</Text>
              {user?.tier === 'PREMIUM' && (
                <Crown size={18} color="#FFD700" style={styles.premiumIcon} />
              )}
            </View>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <UserPen size={20} color="#666666" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Statistics */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={24} color="#4CAF50" />
            <Text style={styles.statNumber}>
              {featuresSupported ? stats.totalExams : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Tests Completed</Text>
          </View>

          <View style={styles.statCard}>
            <Percent size={24} color="#459410ff" />
            <Text style={styles.statNumber}>
              {featuresSupported ? `${stats.averageScore}%` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#2196F3" />
            <Text style={styles.statNumber}>
              {featuresSupported
                ? formatStudyTime(stats.totalStudyTime)
                : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>

          <TouchableOpacity
            style={styles.statCard}
            onPress={() => {
              logger.userAction('Bookmark stat card clicked', {
                count: stats.bookmarkedNotes,
              });
              router.push('/(tabs)/notes?showBookmarks=true');
            }}
            disabled={!featuresSupported}
          >
            <BookOpen size={24} color="#FF9800" />
            <Text style={styles.statNumber}>
              {featuresSupported ? stats.bookmarkedNotes : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Study Streak</Text>
          <Text style={styles.streakNumber}>
            {featuresSupported ? stats.streak || 0 : 'N/A'}
          </Text>
          <Text style={styles.streakLabel}>days in a row</Text>
          {!featuresSupported && (
            <Text style={styles.platformNote}>
              Statistics available on mobile app
            </Text>
          )}
        </View>
      </View>

      {/* Settings */}
      <View style={styles.settingsSection}>
        <Text style={styles.sectionTitle}>Settings</Text>

        <TouchableOpacity style={styles.settingItem} onPress={handleAboutUs}>
          <Info size={20} color="#666666" />
          <Text style={styles.settingText}>About Us</Text>
          <ExternalLink size={16} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleContactUs}>
          <MessageCircle size={20} color="#666666" />
          <Text style={styles.settingText}>Contact Us</Text>
          <ExternalLink size={16} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <LogOut size={20} color="#FF3B30" />
          <Text style={[styles.settingText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <View style={styles.divider} />

        <TouchableOpacity
          style={styles.settingItem}
          onPress={handleDeleteAccount}
        >
          <Trash2 size={20} color="#FF3B30" />
          <Text style={[styles.settingText, { color: '#FF3B30' }]}>
            Delete Account
          </Text>
        </TouchableOpacity>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsEditModalVisible(false)}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleSaveProfile} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Save size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={editedProfile.name}
                onChangeText={(text) =>
                  setEditedProfile((prev) => ({ ...prev, name: text }))
                }
                placeholder="Enter your full name"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputWithIcon}>
                <Mail size={20} color="#666666" />
                <TextInput
                  style={styles.inputWithIconText}
                  value={editedProfile.email}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, email: text }))
                  }
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <Text style={styles.helpText}>
              All fields are optional. Update only the information you want to
              change.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      {/* About Us Modal */}
      <Modal
        visible={isAboutModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsAboutModalVisible(false)}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>About Us</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4CAF50" />
                <Text style={styles.loadingText}>Loading...</Text>
              </View>
            ) : aboutData ? (
              <>
                <Text style={styles.aboutTitle}>{aboutData.title}</Text>
                <View style={styles.aboutContentContainer}>
                  {renderContent(aboutData.content)}
                </View>
                <View style={styles.aboutFooter}>
                  <Text style={styles.aboutVersion}>
                    Version: {aboutData.version}
                  </Text>
                  <Text style={styles.aboutUpdated}>
                    Last Updated: {aboutData.lastUpdated}
                  </Text>
                </View>
              </>
            ) : null}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#facc15',
    paddingTop: LAYOUT_CONSTANTS.headerPaddingTop,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  subscriptionBadge: {
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
  editButton: {
    padding: 8,
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
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
    textAlign: 'center',
  },
  achievementCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
    marginBottom: 8,
  },
  streakNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  streakLabel: {
    fontSize: 14,
    color: '#1976D2',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 20,
  },
  platformNote: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  settingsSection: {
    padding: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 12,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: LAYOUT_CONSTANTS.headerPaddingTop,
    paddingBottom: LAYOUT_CONSTANTS.headerPaddingBottom,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
  },
  inputWithIconText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666666',
  },
  aboutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
  },
  aboutContent: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 30,
  },
  aboutFooter: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 20,
  },
  aboutVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  aboutUpdated: {
    fontSize: 14,
    color: '#666666',
  },
  helpText: {
    fontSize: 14,
    color: '#666666',
    marginTop: 16,
    marginHorizontal: 4,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  aboutContentContainer: {
    marginBottom: 30,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
    lineHeight: 32,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 24,
    marginBottom: 12,
    lineHeight: 28,
  },
  heading3: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginTop: 20,
    marginBottom: 8,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
    marginBottom: 12,
  },
  listItemContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    marginLeft: 16,
  },
  listBullet: {
    fontSize: 16,
    color: '#444444',
    marginRight: 8,
    lineHeight: 24,
  },
  listItem: {
    flex: 1,
    fontSize: 16,
    color: '#444444',
    lineHeight: 24,
  },
  boldInline: {
    fontWeight: 'bold',
    color: '#333333',
  },
  spacing: {
    height: 12,
  },
});
