import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import {
  User,
  Settings,
  Trophy,
  BookOpen,
  Clock,
  Crown,
  CreditCard as Edit3,
  Save,
  X,
  LogOut,
  Mail,
  Phone,
  Info,
  MessageCircle,
  ExternalLink,
} from 'lucide-react-native';
import { progressService } from '@/services';
import { AboutData, ContactRequest } from '@/types/api';
import { logger } from '@/utils/logger';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  
  // Check if features are supported on current platform
  const featuresSupported = progressService?.getPlatformInfo()?.supported || false;
  
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalStudyTime: 0,
    bookmarkedNotes: 0,
    streak: 0,
    recentActivity: [],
    lastActivity: null
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [contactForm, setContactForm] = useState<ContactRequest>({
    subject: '',
    message: '',
    email: user?.email || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  useEffect(() => {
    if (user) {
      initializeUserProgress();
    }
  }, [user]);

  const initializeUserProgress = async () => {
    if (!featuresSupported) {
      logger.info('ProfileScreen', 'Progress tracking disabled on web platform');
      return;
    }
    
    try {
      logger.debug('ProfileScreen', 'Initializing user progress', { userId: user!.id });
      progressService.initializeUser(user!.id);
      await loadStats();
    } catch (error) {
      logger.error('ProfileScreen', 'Failed to initialize user progress', error);
    }
  };

  const loadStats = async () => {
    if (!featuresSupported) {
      logger.info('ProfileScreen', 'Progress tracking disabled on web platform');
      setStats({
        totalExams: 0,
        averageScore: 0,
        passedExams: 0,
        totalStudyTime: 0,
        bookmarkedNotes: 0,
        currentStreak: 0,
        recentActivity: [],
        lastActivity: null
      });
      return;
    }
    
    try {
      logger.debug('ProfileScreen', 'Loading user statistics');
      const response = await progressService.getDashboardSummary();
      if (response.success) {
        logger.debug('ProfileScreen', 'Stats loaded successfully', response.summary);
        setStats(response.summary);
      } else {
        logger.warn('ProfileScreen', 'Failed to load stats', response.error);
        // Fallback to default stats
        setStats({
          totalExams: 0,
          averageScore: 0,
          passedExams: 0,
          totalStudyTime: 0,
          bookmarkedNotes: 0,
          currentStreak: 0,
          recentActivity: [],
          lastActivity: null
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
      phone: '',
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    logger.userAction('Profile save attempted', editedProfile);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalVisible(false);
      logger.info('ProfileScreen', 'Profile updated successfully');
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleAboutUs = async () => {
    logger.userAction('About us opened');
    setIsAboutModalVisible(true);
    setIsLoading(true);
    try {
      // Mock about data - replace with real API when available
      const mockAboutData = {
        title: "About JPJOnline",
        content: "JPJOnline is Malaysia's premier digital learning platform for driving license preparation. Our comprehensive system provides:\n\n• Interactive learning materials covering all aspects of Malaysian traffic laws\n• Practice tests that simulate the actual JPJ examination\n• Real-time progress tracking and performance analytics\n• Expert-curated content updated regularly\n\nOur mission is to make driving education accessible, engaging, and effective for all Malaysians. With over 10,000 successful students, we're committed to helping you pass your driving test with confidence.\n\nFounded in 2024, JPJOnline combines modern technology with proven educational methods to deliver the best learning experience possible.",
        version: "1.0.0",
        lastUpdated: "2024-01-15"
      };
      setAboutData(mockAboutData);
      logger.debug('ProfileScreen', 'About data loaded');
    } catch (error) {
      logger.error('ProfileScreen', 'Error loading about data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactUs = () => {
    logger.userAction('Contact us opened');
    setContactForm({
      subject: '',
      message: '',
      email: user?.email || '',
    });
    setIsContactModalVisible(true);
  };

  const handleSubmitContact = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsSubmittingContact(true);
    logger.userAction('Contact form submitted', { 
      subject: contactForm.subject,
      hasMessage: !!contactForm.message 
    });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      Alert.alert('Success', 'Thank you for your message! We will get back to you within 24 hours.');
      setIsContactModalVisible(false);
      setContactForm({ subject: '', message: '', email: user?.email || '' });
      logger.info('ProfileScreen', 'Contact form submitted successfully');
    } catch (error) {
      logger.error('ProfileScreen', 'Error submitting contact form', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
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
        }
      },
    ]);
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const handleActivityClick = (activity: any) => {
    logger.userAction('Activity clicked', { type: activity.type, id: activity.id });
    // Navigation logic can be added here when activity data is available
  };
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
            <Edit3 size={20} color="#666666" />
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
            <Text style={styles.statNumber}>
              {featuresSupported ? `${stats.averageScore}%` : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>

          <View style={styles.statCard}>
            <Clock size={24} color="#2196F3" />
            <Text style={styles.statNumber}>
              {featuresSupported ? formatStudyTime(stats.totalStudyTime) : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>

          <View style={styles.statCard}>
            <BookOpen size={24} color="#FF9800" />
            <Text style={styles.statNumber}>
              {featuresSupported ? stats.bookmarkedNotes : 'N/A'}
            </Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Study Streak</Text>
          <Text style={styles.streakNumber}>
            {featuresSupported ? (stats.currentStreak || 0) : 'N/A'}
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

        <TouchableOpacity style={styles.settingItem}>
          <Settings size={20} color="#666666" />
          <Text style={styles.settingText}>App Preferences</Text>
          <ExternalLink size={16} color="#CCCCCC" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem}>
          <BookOpen size={20} color="#666666" />
          <Text style={styles.settingText}>Study History</Text>
          <ExternalLink size={16} color="#CCCCCC" />
        </TouchableOpacity>

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
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <View style={styles.inputWithIcon}>
                <Phone size={20} color="#666666" />
                <TextInput
                  style={styles.inputWithIconText}
                  value={editedProfile.phone}
                  onChangeText={(text) =>
                    setEditedProfile((prev) => ({ ...prev, phone: text }))
                  }
                  placeholder="Enter your phone number"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
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
                <Text style={styles.aboutContent}>{aboutData.content}</Text>
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

      {/* Contact Us Modal */}
      <Modal
        visible={isContactModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsContactModalVisible(false)}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contact Us</Text>
            <TouchableOpacity
              onPress={handleSubmitContact}
              disabled={isSubmittingContact}
            >
              {isSubmittingContact ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <Text style={styles.sendButton}>Send</Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={contactForm.email}
                onChangeText={(text) =>
                  setContactForm((prev) => ({ ...prev, email: text }))
                }
                placeholder="Your email address"
                keyboardType="email-address"
                editable={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Subject *</Text>
              <TextInput
                style={styles.input}
                value={contactForm.subject}
                onChangeText={(text) =>
                  setContactForm((prev) => ({ ...prev, subject: text }))
                }
                placeholder="What is this about?"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) =>
                  setContactForm((prev) => ({ ...prev, message: text }))
                }
                placeholder="Tell us more about your inquiry..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <Text style={styles.contactNote}>
              We typically respond within 24 hours. For urgent matters, please
              call our support line.
            </Text>
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
    paddingTop: 70,
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
    paddingTop: 60,
    paddingBottom: 20,
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
  textArea: {
    height: 120,
    textAlignVertical: 'top',
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
  sendButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  contactNote: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 18,
  },
});