import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decodeHtmlEntities } from '@/utils/htmlDecoder';
import {
  splitTextWithImages,
  convertImageUrl,
} from '@/utils/markdownImageHandler';
import { ImageLightbox } from '@/components/shared/ImageLightbox';

interface AnswerOptionsProps {
  question: any;
  selectedAnswer: number;
  onAnswerSelect: (index: number) => void;
  hasValidation: boolean;
  isCorrect: boolean;
  examMode: 'OPEN' | 'CLOSED';
  disabled?: boolean;
}

export function AnswerOptions({
  question,
  selectedAnswer,
  onAnswerSelect,
  hasValidation,
  isCorrect,
  examMode,
  disabled = false,
}: AnswerOptionsProps) {
  const [imageLoadingStates, setImageLoadingStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [imageErrorStates, setImageErrorStates] = useState<{
    [key: number]: boolean;
  }>({});
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

  // Track the current question ID to prevent stale callbacks
  const currentQuestionIdRef = useRef(question.id);
  const imageLoadHandledRef = useRef<{ [key: number]: boolean }>({});

  // Normalize options and optionImages to handle both legacy and new API formats
  // Use useMemo to prevent recreating arrays on every render
  const { options, optionImages } = useMemo(() => {
    let normalizedOptions: string[] = [];
    let normalizedOptionImages: string[] = [];

    // Handle legacy format with options.choices
    if (question.options?.choices && Array.isArray(question.options.choices)) {
      normalizedOptions = question.options.choices.map((choice: any) =>
        typeof choice === 'string' ? choice : choice.text || '',
      );
      normalizedOptionImages = question.options.choices.map((choice: any) =>
        typeof choice === 'object' ? choice.image || null : null,
      );
    }
    // Handle new API format with options as array and separate optionImages
    else if (Array.isArray(question.options)) {
      normalizedOptions = question.options;
      normalizedOptionImages = question.optionImages || [];
    }

    return { options: normalizedOptions, optionImages: normalizedOptionImages };
  }, [question.id]); // Only recalculate when question changes

  // Custom component to render option text with markdown images
  const renderOptionTextWithImages = (text: string) => {
    const segments = splitTextWithImages(text);

    return segments.map((segment, index) => {
      if (segment.type === 'text') {
        return (
          <Text key={index} style={styles.optionText}>
            {segment.content}
          </Text>
        );
      } else if (segment.type === 'image') {
        const imageUrl = convertImageUrl(segment.src);
        return (
          <View key={index} style={styles.markdownImageContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: imageUrl }}
                style={styles.markdownImage}
                resizeMode="contain"
                onError={(error) => {
                  console.log(
                    'Markdown option image load error:',
                    error.nativeEvent.error,
                  );
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  setLightboxImageUrl(imageUrl);
                  setLightboxVisible(true);
                }}
                style={styles.zoomIconButton}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            {segment.alt && (
              <Text style={styles.markdownImageAlt}>{segment.alt}</Text>
            )}
          </View>
        );
      }
      return null;
    });
  };

  // Reset loading states when question changes
  useEffect(() => {
    currentQuestionIdRef.current = question.id;
    imageLoadHandledRef.current = {};

    const initialLoadingStates: { [key: number]: boolean } = {};

    optionImages.forEach((imageUrl: string | null, index: number) => {
      if (imageUrl && imageUrl.trim() !== '') {
        initialLoadingStates[index] = true;
      }
    });

    setImageLoadingStates(initialLoadingStates);
    setImageErrorStates({});
    // Only depend on question.id - optionImages is derived from question and is stable via useMemo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id]);

  // Stable callback for image load - prevents infinite loops
  const handleImageLoad = useCallback(
    (index: number) => {
      // Only handle if this is for the current question and hasn't been handled yet
      if (
        currentQuestionIdRef.current === question.id &&
        !imageLoadHandledRef.current[index]
      ) {
        imageLoadHandledRef.current[index] = true;
        setImageLoadingStates((prev) => ({ ...prev, [index]: false }));
      }
    },
    [question.id],
  );

  // Stable callback for image error
  const handleImageError = useCallback(
    (index: number) => {
      console.log('Option image load error at index:', index);
      if (
        currentQuestionIdRef.current === question.id &&
        !imageLoadHandledRef.current[index]
      ) {
        imageLoadHandledRef.current[index] = true;
        setImageLoadingStates((prev) => ({ ...prev, [index]: false }));
        setImageErrorStates((prev) => ({ ...prev, [index]: true }));
      }
    },
    [question.id],
  );

  const getAnswerOptionStyle = (optionIndex: number) => {
    const isSelected = selectedAnswer === optionIndex;
    // Support both answerIndex (from API) and correctAnswer (legacy)
    const correctAnswerIndex = question.answerIndex ?? question.correctAnswer;

    if (examMode === 'OPEN' && hasValidation) {
      if (isSelected) {
        return {
          backgroundColor: isCorrect ? '#E8F5E8' : '#FFEBEE',
          borderColor: isCorrect ? '#4CAF50' : '#F44336',
        };
      } else if (optionIndex === correctAnswerIndex) {
        return {
          backgroundColor: '#E8F5E8',
          borderColor: '#4CAF50',
        };
      }
    } else if (isSelected) {
      return {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
      };
    }

    return {
      backgroundColor: '#F8F9FA',
      borderColor: 'transparent',
    };
  };

  // Check if optionImages array exists and has images
  const hasOptionImages = optionImages.some(
    (img: string | null) => img && img.trim() !== '',
  );

  const isImageOnlyOptions =
    (typeof question.options === 'object' &&
      question.options.type === 'image' &&
      Array.isArray(options) &&
      options.every(
        (option: any) =>
          typeof option === 'object' && option.image && !option.text,
      )) ||
    (hasOptionImages &&
      options.every((opt: string) => !opt || opt.trim() === ''));

  return (
    <>
      <ImageLightbox
        visible={lightboxVisible}
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxVisible(false)}
      />
      <View style={styles.optionsContainer}>
        {options.map((option: any, index: number) => {
          const isImageLoading = imageLoadingStates[index] === true;
          const hasImageError = imageErrorStates[index] === true;

          // Get option image from normalized optionImages array
          const rawOptionImageUrl = optionImages[index] || null;

          // Convert relative URLs to absolute URLs using jpjonline.com domain
          const optionImageUrl =
            rawOptionImageUrl && rawOptionImageUrl.trim() !== ''
              ? convertImageUrl(rawOptionImageUrl)
              : null;

          const hasImage = optionImageUrl && optionImageUrl.trim() !== '';

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                isImageOnlyOptions && styles.imageOnlyOptionButton,
                getAnswerOptionStyle(index),
                disabled && styles.disabledOption,
              ]}
              onPress={() => !disabled && onAnswerSelect(index)}
              disabled={disabled}
            >
              <View
                style={[
                  styles.optionIndicator,
                  selectedAnswer === index && styles.selectedIndicator,
                  isImageOnlyOptions && styles.imageOnlyIndicator,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetter,
                    selectedAnswer === index && styles.selectedOptionLetter,
                  ]}
                >
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>

              {hasImage && (
                <View
                  style={[
                    styles.optionImageContainer,
                    isImageOnlyOptions && styles.imageOnlyContainer,
                  ]}
                >
                  {isImageLoading && (
                    <View style={styles.imageLoadingOverlay}>
                      <ActivityIndicator size="small" color="#666666" />
                      <Text style={styles.loadingText}>Loading...</Text>
                    </View>
                  )}
                  <Image
                    source={{ uri: optionImageUrl }}
                    style={[
                      styles.optionImage,
                      isImageOnlyOptions && styles.imageOnlyOption,
                      isImageLoading && styles.hiddenImage,
                    ]}
                    onLoad={() => handleImageLoad(index)}
                    onError={(error) => {
                      console.log('Image error:', error.nativeEvent.error);
                      handleImageError(index);
                    }}
                    resizeMode="contain"
                  />
                  {!isImageLoading && !hasImageError && (
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setLightboxImageUrl(optionImageUrl);
                        setLightboxVisible(true);
                      }}
                      style={styles.zoomIconButton}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="search" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  )}
                  {hasImageError && !isImageLoading && (
                    <View
                      style={[
                        styles.imageErrorContainer,
                        isImageOnlyOptions && styles.imageOnlyOption,
                      ]}
                    >
                      <Text style={styles.imageErrorText}>Failed to load</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Render text content only if it exists and is not empty */}
              {(() => {
                const textContent =
                  typeof option === 'string'
                    ? option
                    : option?.text || option?.image || '';
                return textContent.trim() !== '' ? (
                  <ScrollView style={{ flex: 1 }} nestedScrollEnabled>
                    {renderOptionTextWithImages(
                      decodeHtmlEntities(textContent),
                    )}
                  </ScrollView>
                ) : null;
              })()}
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 12,
    marginBottom: 100, // Extra spacing to prevent overlap with navigation
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  imageOnlyOptionButton: {
    padding: 8,
    justifyContent: 'center',
  },
  optionIndicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  imageOnlyIndicator: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 2,
    marginRight: 0,
  },
  selectedIndicator: {
    backgroundColor: '#2196F3',
  },
  optionLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
  },
  selectedOptionLetter: {
    color: '#FFFFFF',
  },
  optionImageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  imageOnlyContainer: {
    marginRight: 0,
    flex: 1,
  },
  optionImage: {
    width: 140,
    height: 105,
    borderRadius: 8,
  },
  imageOnlyOption: {
    width: '100%',
    height: 180,
    borderRadius: 8,
  },
  imageWrapper: {
    position: 'relative',
    width: '100%',
  },
  zoomIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
    zIndex: 10,
  },
  hiddenImage: {
    opacity: 0,
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 10,
    color: '#999999',
  },
  imageErrorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 140,
    height: 105,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageErrorText: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedOverlayText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    lineHeight: 22,
  },
  selectedOptionText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  hiddenText: {
    display: 'none',
  },
  disabledOption: {
    opacity: 0.6,
  },
  markdownImageContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  markdownImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  markdownImageAlt: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
