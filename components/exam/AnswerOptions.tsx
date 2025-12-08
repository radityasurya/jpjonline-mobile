import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

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

  const handleImageLoad = (index: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [index]: false }));
  };

  const handleImageError = (index: number) => {
    setImageLoadingStates((prev) => ({ ...prev, [index]: false }));
    setImageErrorStates((prev) => ({ ...prev, [index]: true }));
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

  const options =
    typeof question.options === 'string' || Array.isArray(question.options)
      ? question.options
      : question.options?.choices || [];

  // Check if optionImages array exists and has images
  const optionImages = question.optionImages || [];
  const hasOptionImages = optionImages.some(
    (img: string) => img && img.trim() !== '',
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
    <View style={styles.optionsContainer}>
      {options.map((option: any, index: number) => {
        const isImageLoading = imageLoadingStates[index] !== false;
        const hasImageError = imageErrorStates[index] === true;

        // Get option image from optionImages array or from option object
        const optionImageUrl =
          optionImages[index] ||
          (typeof option === 'object' ? option.image : null);
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
            {!isImageOnlyOptions && (
              <View
                style={[
                  styles.optionIndicator,
                  selectedAnswer === index && styles.selectedIndicator,
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
            )}

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
                  </View>
                )}
                {!hasImageError && (
                  <Image
                    source={{ uri: optionImageUrl }}
                    style={[
                      styles.optionImage,
                      isImageOnlyOptions && styles.imageOnlyOption,
                      isImageLoading && styles.hiddenImage,
                    ]}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    resizeMode="cover"
                  />
                )}
                {hasImageError && (
                  <View
                    style={[
                      styles.imageErrorContainer,
                      isImageOnlyOptions && styles.imageOnlyOption,
                    ]}
                  >
                    <Text style={styles.imageErrorText}>Failed to load</Text>
                  </View>
                )}
                {isImageOnlyOptions && selectedAnswer === index && (
                  <View style={styles.selectedOverlay}>
                    <Text style={styles.selectedOverlayText}>
                      {String.fromCharCode(65 + index)}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {(typeof option === 'string' ||
              (typeof option === 'object' &&
                option.text &&
                option.text.trim())) && (
              <Text
                style={[
                  styles.optionText,
                  selectedAnswer === index && styles.selectedOptionText,
                  isImageOnlyOptions && styles.hiddenText,
                ]}
              >
                {typeof option === 'string' ? option : option.text}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 12,
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
    width: 120,
    height: 90,
    borderRadius: 6,
  },
  imageOnlyOption: {
    width: '100%',
    height: 120,
    borderRadius: 8,
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
    borderRadius: 6,
    zIndex: 1,
  },
  imageErrorContainer: {
    width: 120,
    height: 90,
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
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
});
