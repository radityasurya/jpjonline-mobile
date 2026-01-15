import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { imageCacheService, PreloadProgress } from '@/services/imageCacheService';

interface ImagePreloaderProps {
  exam: any;
  targetPercentage?: number;
  onComplete?: (success: boolean) => void;
  onCancel?: () => void;
  showDetails?: boolean;
}

export function ImagePreloader({
  exam,
  targetPercentage = 50,
  onComplete,
  onCancel,
  showDetails = true,
}: ImagePreloaderProps) {
  const [progress, setProgress] = useState<PreloadProgress>({
    total: 0,
    loaded: 0,
    failed: 0,
    percentage: 0,
    currentUri: null,
  });
  const [isPreloading, setIsPreloading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progressAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    const uris = imageCacheService.extractImageUrls(exam);
    
    if (uris.length === 0) {
      // No images to preload
      setIsPreloading(false);
      onComplete?.(true);
      return;
    }

    // Start preloading
    imageCacheService.preloadImages(
      uris,
      (progressData) => {
        setProgress(progressData);
        // Animate progress bar
        Animated.timing(progressAnim, {
          toValue: progressData.percentage,
          duration: 300,
          useNativeDriver: false,
        }).start();
      },
      (success, failedUris) => {
        setIsPreloading(false);
        if (!success && failedUris.length > 0) {
          setError(`Failed to load ${failedUris.length} image(s). You can still take the exam.`);
        }
        onComplete?.(success);
      },
      {
        maxConcurrent: 4,
        timeout: 15000,
        stopAtPercentage: targetPercentage,
      }
    );

    return () => {
      // Cleanup on unmount
      imageCacheService.cancelPreload();
    };
  }, [exam]);

  const handleSkip = () => {
    imageCacheService.cancelPreload();
    setIsPreloading(false);
    onComplete?.(false);
  };

  const handleCancel = () => {
    imageCacheService.cancelPreload();
    onCancel?.();
  };

  const getProgressColor = () => {
    if (progress.percentage >= 100) return '#4CAF50';
    if (progress.percentage >= 50) return '#facc15';
    return '#2196F3';
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <Ionicons name="images" size={64} color="#facc15" />
        </View>

        <Text style={styles.title}>Preparing Exam</Text>
        <Text style={styles.subtitle}>
          Loading images for smooth experience...
        </Text>

        <View style={styles.progressContainer}>
          <View style={styles.progressBarBackground}>
            <Animated.View
              style={[
                styles.progressBarFill,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
          <Text style={styles.percentageText}>
            {progress.percentage}%
          </Text>
        </View>

        {showDetails && (
          <View style={styles.detailsContainer}>
            <View style={styles.detailItem}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
              <Text style={styles.detailText}>
                Loaded: {progress.loaded}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="close-circle" size={16} color="#F44336" />
              <Text style={styles.detailText}>
                Failed: {progress.failed}
              </Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="time" size={16} color="#666666" />
              <Text style={styles.detailText}>
                Total: {progress.total}
              </Text>
            </View>
          </View>
        )}

        {isPreloading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#facc15" />
            <Text style={styles.loadingText}>
              {progress.currentUri ? 'Loading image...' : 'Initializing...'}
            </Text>
          </View>
        )}

        {!isPreloading && (
          <View style={styles.buttonContainer}>
            <Text style={styles.readyText}>
              {error || 'Ready to start!'}
            </Text>
            <Text style={styles.hintText}>
              Tap anywhere or press Start to begin
            </Text>
          </View>
        )}

        {isPreloading && (
          <View style={styles.buttonContainer}>
            <Text style={styles.skipHint} onPress={handleSkip}>
              Skip Preloading
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: Dimensions.get('window').width * 0.85,
    maxWidth: 400,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 32,
    textAlign: 'center',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 24,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 14,
    color: '#666666',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  readyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 8,
    textAlign: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  skipHint: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
});
