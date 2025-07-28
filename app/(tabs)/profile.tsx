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
import { User, Settings, Trophy, BookOpen, Clock, Crown, CreditCard as Edit3, Save, X, LogOut, Mail, Phone, Info, MessageCircle, ExternalLink } from 'lucide-react-native';
import api from '@/services/api';
import { AboutData, ContactRequest } from '@/types/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalExams: 0,
    averageScore: 0,
    passedExams: 0,
    totalStudyTime: 0,
    bookmarkedNotes: 0,
    streak: 0
  });
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isAboutModalVisible, setIsAboutModalVisible] = useState(false);
  const [isContactModalVisible, setIsContactModalVisible] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: ''
  });
  const [aboutData, setAboutData] = useState<AboutData | null>(null);
  const [contactForm, setContactForm] = useState<ContactRequest>({
    subject: '',
    message: '',
    email: user?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

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

  const handleEditProfile = () => {
    setEditedProfile({
      name: user?.name || '',
      email: user?.email || '',
      phone: ''
    });
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully!');
    }, 1000);
  };

  const handleAboutUs = async () => {
    setIsAboutModalVisible(true);
    setIsLoading(true);
    try {
      const response = await api.contact.fetchAboutData();
      if (response.success) {
        setAboutData(response.data!);
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactUs = () => {
    setContactForm({
      subject: '',
      message: '',
      email: user?.email || ''
    });
    setIsContactModalVisible(true);
  };

  const handleSubmitContact = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    setIsSubmittingContact(true);
    try {
      const response = await api.contact.submitContactForm(contactForm);
      if (response.success) {
        Alert.alert('Success', response.message!);
        setIsContactModalVisible(false);
        setContactForm({ subject: '', message: '', email: user?.email || '' });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const formatStudyTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
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
            <Text style={styles.userName}>{user?.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.subscriptionBadge}>
              {user?.subscription === 'premium' && (
                <Crown size={14} color="#4CAF50" style={styles.premiumIcon} />
              )}
              <Text style={[
                styles.subscriptionText,
                { color: user?.subscription === 'premium' ? '#4CAF50' : '#FF9800' }
              ]}>
                {user?.subscription === 'premium' ? 'PREMIUM' : 'FREE'}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
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
            <Text style={styles.statNumber}>{stats.totalExams}</Text>
            <Text style={styles.statLabel}>Tests Completed</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.averageScore}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          
          <View style={styles.statCard}>
            <Clock size={24} color="#2196F3" />
            <Text style={styles.statNumber}>{formatStudyTime(stats.totalStudyTime)}</Text>
            <Text style={styles.statLabel}>Study Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <BookOpen size={24} color="#FF9800" />
            <Text style={styles.statNumber}>{stats.bookmarkedNotes}</Text>
            <Text style={styles.statLabel}>Bookmarks</Text>
          </View>
        </View>

        <View style={styles.achievementCard}>
          <Text style={styles.achievementTitle}>Study Streak</Text>
          <Text style={styles.streakNumber}>{stats.streak}</Text>
          <Text style={styles.streakLabel}>days in a row</Text>
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
        presentationStyle="pageSheet">
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
                onChangeText={(text) => setEditedProfile(prev => ({ ...prev, name: text }))}
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
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, email: text }))}
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
                  onChangeText={(text) => setEditedProfile(prev => ({ ...prev, phone: text }))}
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
        presentationStyle="pageSheet">
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
                  <Text style={styles.aboutVersion}>Version: {aboutData.version}</Text>
                  <Text style={styles.aboutUpdated}>Last Updated: {aboutData.lastUpdated}</Text>
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
        presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setIsContactModalVisible(false)}>
              <X size={24} color="#666666" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Contact Us</Text>
            <TouchableOpacity onPress={handleSubmitContact} disabled={isSubmittingContact}>
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
                onChangeText={(text) => setContactForm(prev => ({ ...prev, email: text }))}
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
                onChangeText={(text) => setContactForm(prev => ({ ...prev, subject: text }))}
                placeholder="What is this about?"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={contactForm.message}
                onChangeText={(text) => setContactForm(prev => ({ ...prev, message: text }))}
                placeholder="Tell us more about your inquiry..."
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <Text style={styles.contactNote}>
              We typically respond within 24 hours. For urgent matters, please call our support line.
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
    backgroundColor: '#FFEEB4',
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
  userEmail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  subscriptionBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  premiumIcon: {
    marginRight: 4,
  },
  subscriptionText: {
    fontSize: 10,
    fontWeight: 'bold',
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