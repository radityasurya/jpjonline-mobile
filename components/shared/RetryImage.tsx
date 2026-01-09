import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Image,
  ActivityIndicator,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageStyle,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface RetryImageProps {
  uri: string;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  maxRetries?: number;
  retryDelay?: number;
  onLoad?: () => void;
  onError?: (error: any) => void;
  showZoomButton?: boolean;
  onZoomPress?: () => void;
  loadingSize?: 'small' | 'large';
  loadingColor?: string;
}

export function RetryImage({
  uri,
  style,
  containerStyle,
  resizeMode = 'contain',
  maxRetries = 3,
  retryDelay = 2000,
  onLoad,
  onError,
  showZoomButton = false,
  onZoomPress,
  loadingSize = 'large',
  loadingColor = '#facc15',
}: RetryImageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imageKey, setImageKey] = useState(0);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Reset states when URI changes
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setImageKey((prev) => prev + 1);

    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, [uri]);

  const handleImageLoad = () => {
    if (!isMountedRef.current) return;

    setLoading(false);
    setError(false);
    onLoad?.();
  };

  const handleImageError = (e: any) => {
    if (!isMountedRef.current) return;

    console.log(
      `Image load error (attempt ${retryCount + 1}/${maxRetries}):`,
      e?.nativeEvent?.error,
    );

    if (retryCount < maxRetries) {
      // Retry after delay
      setLoading(true);
      retryTimeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setRetryCount((prev) => prev + 1);
          setImageKey((prev) => prev + 1);
        }
      }, retryDelay);
    } else {
      // Max retries reached
      setError(true);
      setLoading(false);
      onError?.(e);
    }
  };

  const handleManualRetry = () => {
    setLoading(true);
    setError(false);
    setRetryCount(0);
    setImageKey((prev) => prev + 1);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={loadingSize} color={loadingColor} />
          {retryCount > 0 && (
            <Text style={styles.retryText}>
              Retrying... ({retryCount}/{maxRetries})
            </Text>
          )}
          {retryCount === 0 && (
            <Text style={styles.loadingText}>Loading image...</Text>
          )}
        </View>
      )}

      {!error && (
        <Image
          key={imageKey}
          source={{ uri }}
          style={[style, loading && styles.hiddenImage]}
          resizeMode={resizeMode}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {!loading && !error && showZoomButton && onZoomPress && (
        <TouchableOpacity
          onPress={onZoomPress}
          style={styles.zoomButton}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="image-outline" size={48} color="#CCCCCC" />
          <Text style={styles.errorText}>Failed to load image</Text>
          <Text style={styles.errorSubtext}>Tried {maxRetries} times</Text>
          <TouchableOpacity
            onPress={handleManualRetry}
            style={styles.retryButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={16} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  retryText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  hiddenImage: {
    opacity: 0,
  },
  errorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    zIndex: 1,
  },
  errorText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
    marginBottom: 4,
  },
  errorSubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#facc15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  zoomButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});
