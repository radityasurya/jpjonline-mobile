/**
 * Sound Manager for Exam Feedback
 *
 * Manages audio feedback for correct/incorrect answers during exams.
 * Uses expo-audio for cross-platform audio support with local assets.
 */

import { Audio } from 'expo-audio';
import { Platform } from 'react-native';
import { logger } from './logger.js';

class SoundManager {
  constructor() {
    this.sounds = {};
    this.isEnabled = true;
    this.isInitialized = false;
    this.initializeAudio();
  }

  /**
   * Initialize audio system
   */
  async initializeAudio() {
    try {
      if (Platform.OS !== 'web') {
        // Configure audio session for mobile
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
      }

      await this.loadSounds();
      this.isInitialized = true;
      logger.info('SoundManager', 'Audio system initialized successfully');
    } catch (error) {
      logger.error('SoundManager', 'Failed to initialize audio system', error);
      this.isEnabled = false;
    }
  }

  /**
   * Load sound files from local assets
   */
  async loadSounds() {
    try {
      // Load correct answer sound
      const correctSound = await Audio.Sound.createAsync(
        require('../assets/sounds/correct.wav'),
        { shouldPlay: false, volume: 0.5 },
      );
      this.sounds.correct = correctSound.sound;

      // Load incorrect answer sound
      const incorrectSound = await Audio.Sound.createAsync(
        require('../assets/sounds/incorrect.wav'),
        { shouldPlay: false, volume: 0.5 },
      );
      this.sounds.incorrect = incorrectSound.sound;

      // Load timer warning sound
      const warningSound = await Audio.Sound.createAsync(
        require('../assets/sounds/warning.wav'),
        { shouldPlay: false, volume: 0.3 },
      );
      this.sounds.warning = warningSound.sound;

      logger.info('SoundManager', 'All sounds loaded successfully');
    } catch (error) {
      logger.error(
        'SoundManager',
        'Failed to load sounds, using fallback',
        error,
      );
      // Use system sounds as fallback
      this.loadFallbackSounds();
    }
  }

  /**
   * Load fallback system sounds
   */
  loadFallbackSounds() {
    // For web and fallback scenarios, we'll use silent operation
    this.sounds = {
      correct: null,
      incorrect: null,
      warning: null,
    };
    logger.info('SoundManager', 'Using fallback silent sounds');
  }

  /**
   * Play correct answer sound
   */
  async playCorrect() {
    if (!this.isEnabled || !this.isInitialized) {
      logger.debug('SoundManager', 'Sound disabled or not initialized');
      return;
    }

    try {
      if (this.sounds.correct) {
        await this.sounds.correct.replayAsync();
        logger.debug('SoundManager', 'Played correct answer sound');
      } else {
        // Fallback: Use haptic feedback if available
        this.playHapticFeedback('success');
      }
    } catch (error) {
      logger.error('SoundManager', 'Failed to play correct sound', error);
      this.playHapticFeedback('success');
    }
  }

  /**
   * Play incorrect answer sound
   */
  async playIncorrect() {
    if (!this.isEnabled || !this.isInitialized) {
      logger.debug('SoundManager', 'Sound disabled or not initialized');
      return;
    }

    try {
      if (this.sounds.incorrect) {
        await this.sounds.incorrect.replayAsync();
        logger.debug('SoundManager', 'Played incorrect answer sound');
      } else {
        // Fallback: Use haptic feedback if available
        this.playHapticFeedback('error');
      }
    } catch (error) {
      logger.error('SoundManager', 'Failed to play incorrect sound', error);
      this.playHapticFeedback('error');
    }
  }

  /**
   * Play timer warning sound
   */
  async playWarning() {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    try {
      if (this.sounds.warning) {
        await this.sounds.warning.replayAsync();
        logger.debug('SoundManager', 'Played warning sound');
      }
    } catch (error) {
      logger.error('SoundManager', 'Failed to play warning sound', error);
    }
  }

  /**
   * Haptic feedback fallback
   */
  playHapticFeedback(type) {
    if (Platform.OS !== 'web') {
      try {
        // Lazy load haptics to avoid import errors on web
        const Haptics = require('expo-haptics');

        switch (type) {
          case 'success':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            break;
          case 'error':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            break;
          case 'warning':
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            break;
          default:
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        logger.debug('SoundManager', `Played haptic feedback: ${type}`);
      } catch (error) {
        logger.warn('SoundManager', 'Haptic feedback not available', error);
      }
    }
  }

  /**
   * Enable/disable sounds
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    logger.info('SoundManager', `Sound ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Get sound status
   */
  getStatus() {
    return {
      isEnabled: this.isEnabled,
      isInitialized: this.isInitialized,
      soundsLoaded: Object.keys(this.sounds).length > 0,
      platform: Platform.OS,
    };
  }

  /**
   * Cleanup sounds
   */
  async cleanup() {
    try {
      for (const soundKey in this.sounds) {
        if (this.sounds[soundKey]) {
          await this.sounds[soundKey].unloadAsync();
        }
      }
      this.sounds = {};
      logger.info('SoundManager', 'Sounds cleaned up successfully');
    } catch (error) {
      logger.error('SoundManager', 'Failed to cleanup sounds', error);
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();

export default soundManager;
