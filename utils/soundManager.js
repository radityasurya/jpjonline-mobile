/**
 * Sound Manager for Exam Feedback
 *
 * Manages audio feedback for correct/incorrect answers during exams.
 * Uses expo-audio for cross-platform audio support with local assets.
 *
 * IMPORTANT: Sound files must be actual audio files (WAV or MP3).
 * If sounds don't play, check that the files are valid audio files.
 * You can convert to MP3 using: ffmpeg -i input.wav -acodec libmp3lame output.mp3
 */

import { Audio } from 'expo-av';
import { Platform } from 'react-native';
import { logger } from './logger.js';

// Sound file configuration - using MP3 files
const SOUND_FILES = {
  correct: require('../assets/sounds/correct.mp3'),
  incorrect: require('../assets/sounds/wrong.mp3'),
  warning: require('../assets/sounds/correct.mp3'), // Using correct sound for warning
};

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
      // Try to load sounds, but don't fail if they don't work
      // iOS AVFoundation requires valid audio files (not text files)
      
      try {
        const correctSound = await Audio.Sound.createAsync(
          SOUND_FILES.correct,
          { shouldPlay: false, volume: 0.5 },
        );
        this.sounds.correct = correctSound.sound;
        logger.info('SoundManager', 'Correct sound loaded successfully');
      } catch (e) {
        logger.warn('SoundManager', 'Could not load correct sound - file may be invalid or corrupted', e.message);
        this.sounds.correct = null;
      }

      try {
        const incorrectSound = await Audio.Sound.createAsync(
          SOUND_FILES.incorrect,
          { shouldPlay: false, volume: 0.5 },
        );
        this.sounds.incorrect = incorrectSound.sound;
        logger.info('SoundManager', 'Incorrect sound loaded successfully');
      } catch (e) {
        logger.warn('SoundManager', 'Could not load incorrect sound - file may be invalid or corrupted', e.message);
        this.sounds.incorrect = null;
      }

      try {
        const warningSound = await Audio.Sound.createAsync(
          SOUND_FILES.warning,
          { shouldPlay: false, volume: 0.3 },
        );
        this.sounds.warning = warningSound.sound;
        logger.info('SoundManager', 'Warning sound loaded successfully');
      } catch (e) {
        logger.warn('SoundManager', 'Could not load warning sound - file may be invalid or corrupted', e.message);
        this.sounds.warning = null;
      }

      const loadedCount = Object.values(this.sounds).filter(s => s !== null).length;
      logger.info('SoundManager', `Sound loading completed: ${loadedCount}/3 sounds loaded`);
      
      if (loadedCount === 0) {
        logger.warn('SoundManager', 'No sounds loaded - check that audio files are valid WAV or MP3 files');
      }
    } catch (error) {
      logger.warn(
        'SoundManager',
        'Sound system unavailable, using haptic feedback only',
        error,
      );
      this.loadFallbackSounds();
    }
  }

  /**
   * Load fallback system sounds
   */
  loadFallbackSounds() {
    // For web and fallback scenarios, we'll use haptic feedback only
    this.sounds = {
      correct: null,
      incorrect: null,
      warning: null,
    };
    logger.info('SoundManager', 'Using haptic feedback only (no audio)');
  }

  /**
   * Play correct answer sound
   */
  async playCorrect() {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    // Always use haptic feedback first for immediate response
    this.playHapticFeedback('success');

    // Try to play sound if available
    try {
      if (this.sounds.correct) {
        await this.sounds.correct.replayAsync();
      }
    } catch (error) {
      logger.debug('SoundManager', 'Could not play correct sound, haptic feedback used');
    }
  }

  /**
   * Play incorrect answer sound
   */
  async playIncorrect() {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    // Always use haptic feedback first for immediate response
    this.playHapticFeedback('error');

    // Try to play sound if available
    try {
      if (this.sounds.incorrect) {
        await this.sounds.incorrect.replayAsync();
      }
    } catch (error) {
      logger.debug('SoundManager', 'Could not play incorrect sound, haptic feedback used');
    }
  }

  /**
   * Play timer warning sound
   */
  async playWarning() {
    if (!this.isEnabled || !this.isInitialized) {
      return;
    }

    // Use haptic feedback for warning
    this.playHapticFeedback('warning');

    // Try to play sound if available
    try {
      if (this.sounds.warning) {
        await this.sounds.warning.replayAsync();
      }
    } catch (error) {
      logger.debug('SoundManager', 'Could not play warning sound, haptic feedback used');
    }
  }

  /**
   * Haptic feedback (primary feedback mechanism)
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
      } catch (error) {
        // Silently fail if haptics not available
        logger.debug('SoundManager', 'Haptic feedback not available');
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
