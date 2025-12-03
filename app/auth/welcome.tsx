import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CheckCircle } from 'lucide-react-native';

export default function WelcomeScreen() {
  const { name } = useLocalSearchParams<{ name: string }>();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Animate the welcome screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-navigate after 4 seconds if user doesn't click
    const autoNavigate = setTimeout(() => {
      router.replace('/(tabs)');
    }, 4000);

    return () => clearTimeout(autoNavigate);
  }, [fadeAnim, scaleAnim]);

  const handleGetStarted = () => {
    router.replace('/(tabs)');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Welcome to JPJOnline!</Text>
        <Text style={styles.subtitle}>
          Your account has been created successfully
        </Text>
      </View>

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.welcomeContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <CheckCircle size={60} color="#4CAF50" />
          </View>

          <Text style={styles.message}>
            Hi {name || 'there'}! You&apos;re now ready to start your JPJ
            driving test preparation journey.
          </Text>

          <Text style={styles.description}>
            Access comprehensive study materials, practice tests, and track your
            progress as you prepare for your Malaysian driving license exam.
          </Text>

          <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>

          <Text style={styles.autoText}>
            You&apos;ll be automatically redirected in a few seconds...
          </Text>
        </Animated.View>
      </View>
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
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    padding: 20,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 16,
    paddingHorizontal: 48,
    marginBottom: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 300,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  autoText: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
