import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { decodeHtmlEntities } from '@/utils/htmlDecoder';
import {
  splitTextWithImages,
  convertImageUrl,
} from '@/utils/markdownImageHandler';
import { ImageLightbox } from '@/components/shared/ImageLightbox';
import { RetryImage } from '@/components/shared/RetryImage';

// Helper function to extract HTML img tags and convert them to markdown image syntax
const convertHtmlImagesToMarkdown = (text: string): string => {
  if (!text) return text;
  
  // Match HTML <img> tags with various attributes
  const imgRegex = /<img\s+(?:[^>]*?\s+)?src=["']([^"']+)["'][^>]*>/gi;
  
  return text.replace(imgRegex, (match, src) => {
    const imageUrl = convertImageUrl(src);
    return `
![image](${imageUrl})
`;
  });
};

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
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImageUrl, setLightboxImageUrl] = useState('');

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
    // First convert HTML img tags to markdown image syntax
    const convertedText = convertHtmlImagesToMarkdown(text);
    const segments = splitTextWithImages(convertedText);

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
            <RetryImage
              uri={imageUrl}
              style={styles.markdownImage}
              resizeMode="contain"
              showZoomButton={true}
              onZoomPress={() => {
                setLightboxImageUrl(imageUrl);
                setLightboxVisible(true);
              }}
              maxRetries={3}
              retryDelay={2000}
            />
            {segment.alt && (
              <Text style={styles.markdownImageAlt}>{segment.alt}</Text>
            )}
          </View>
        );
      }
      return null;
    });
  };

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
                  <RetryImage
                    uri={optionImageUrl}
                    style={[
                      styles.optionImage,
                      isImageOnlyOptions && styles.imageOnlyOption,
                    ]}
                    containerStyle={[
                      isImageOnlyOptions && styles.imageOnlyOption,
                    ]}
                    resizeMode="contain"
                    showZoomButton={true}
                    onZoomPress={() => {
                      setLightboxImageUrl(optionImageUrl);
                      setLightboxVisible(true);
                    }}
                    maxRetries={3}
                    retryDelay={2000}
                  />
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
                      convertHtmlImagesToMarkdown(decodeHtmlEntities(textContent)),
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
  zoomIconButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 16,
    padding: 6,
    zIndex: 10,
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
