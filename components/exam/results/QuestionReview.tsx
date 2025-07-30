import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import {
  CircleCheck as CheckCircle,
  Circle as XCircle,
} from 'lucide-react-native';

interface QuestionReviewProps {
  questionResult: {
    questionId: string;
    question: string;
    userAnswer: number;
    correctAnswer: number;
    isCorrect: boolean;
    explanation: string;
    questionImage?: string;
    options: any;
    questionImage?: string;
    options: any;
  };
  questionIndex: number;
}

export function QuestionReview({
  questionResult,
  questionIndex,
}: QuestionReviewProps) {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [optionImageStates, setOptionImageStates] = useState<{
    [key: number]: { loading: boolean; error: boolean };
  }>({});

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleOptionImageLoad = (index: number) => {
    setOptionImageStates((prev) => ({
      ...prev,
      [index]: { ...prev[index], loading: false },
    }));
  };

  const handleOptionImageError = (index: number) => {
    setOptionImageStates((prev) => ({
      ...prev,
      [index]: { loading: false, error: true },
    }));
  };

  const renderAnswerOption = (option: any, index: number) => {
    const isUserAnswer = questionResult.userAnswer === index;
    const isCorrectAnswer = questionResult.correctAnswer === index;
    const optionState = optionImageStates[index] || {
      loading: true,
      error: false,
    };
    const hasImage = typeof option === 'object' && option.image;
    const hasText =
      typeof option === 'string' ||
      (typeof option === 'object' && option.text && option.text.trim());

    return (
      <View
        key={index}
        style={[
          styles.answerOption,
          isUserAnswer &&
            (questionResult.isCorrect
              ? styles.correctUserAnswer
              : styles.incorrectUserAnswer),
          isCorrectAnswer && !isUserAnswer && styles.correctAnswer,
        ]}
      >
        <View style={styles.answerHeader}>
          <Text style={styles.answerLetter}>
            {String.fromCharCode(65 + index)}
          </Text>
          {isUserAnswer && (
            <View style={styles.answerIndicator}>
              <Text style={styles.answerIndicatorText}>Your Answer</Text>
              {questionResult.isCorrect ? (
                <CheckCircle size={16} color="#4CAF50" />
              ) : (
                <XCircle size={16} color="#FF3B30" />
              )}
            </View>
          )}
          {isCorrectAnswer && !isUserAnswer && (
            <View style={styles.answerIndicator}>
              <Text style={styles.answerIndicatorText}>Correct Answer</Text>
              <CheckCircle size={16} color="#4CAF50" />
            </View>
          )}
        </View>

        {hasImage && (
          <View style={styles.optionImageContainer}>
            {optionState.loading && (
              <View style={styles.imageLoadingContainer}>
                <ActivityIndicator size="small" color="#666666" />
              </View>
            )}
            {!optionState.error && (
              <Image
                source={{ uri: option.image }}
                style={[
                  styles.optionImage,
                  optionState.loading && styles.hiddenImage,
                ]}
                onLoad={() => handleOptionImageLoad(index)}
                onError={() => handleOptionImageError(index)}
                resizeMode="cover"
              />
            )}
            {optionState.error && (
              <View style={styles.imageErrorContainer}>
                <Text style={styles.imageErrorText}>Failed to load image</Text>
              </View>
            )}
          </View>
        )}

        {hasText && (
          <Text style={styles.answerText}>
            {typeof option === 'string' ? option : option.text}
          </Text>
        )}
      </View>
    );
  };

  const options = Array.isArray(questionResult.options)
    ? questionResult.options
    : questionResult.options?.choices || [];

  return (
    <View style={styles.container}>
      <View style={styles.questionHeader}>
        <Text style={styles.questionNumber}>Question {questionIndex + 1}</Text>
        {questionResult.isCorrect ? (
          <CheckCircle size={20} color="#4CAF50" />
        ) : (
          <XCircle size={20} color="#FF3B30" />
        )}
      </View>

      {questionResult.questionImage && (
        <View style={styles.questionImageContainer}>
          {imageLoading && (
            <View style={styles.imageLoadingContainer}>
              <ActivityIndicator size="large" color="#facc15" />
              <Text style={styles.loadingText}>Loading image...</Text>
            </View>
          )}
          {!imageError && (
            <Image
              source={{ uri: questionResult.questionImage }}
              style={[styles.questionImage, imageLoading && styles.hiddenImage]}
              onLoad={handleImageLoad}
              onError={handleImageError}
              resizeMode="cover"
            />
          )}
          {imageError && (
            <View style={styles.imageErrorContainer}>
              <Text style={styles.imageErrorText}>
                Failed to load question image
              </Text>
            </View>
          )}
        </View>
      )}

      {questionResult.question && questionResult.question.trim() && (
        <Text style={styles.questionText}>{questionResult.question}</Text>
      )}

      <View style={styles.answersContainer}>
        {options.map((option: any, index: number) =>
          renderAnswerOption(option, index),
        )}
      </View>

      {questionResult.explanation && (
        <View style={styles.explanation}>
          <Text style={styles.explanationTitle}>Explanation:</Text>
          <Text style={styles.explanationText}>
            {questionResult.explanation}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
  },
  questionImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  questionImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  hiddenImage: {
    opacity: 0,
  },
  imageLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    height: 200,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
  },
  imageErrorContainer: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  imageErrorText: {
    fontSize: 14,
    color: '#999999',
  },
  questionText: {
    fontSize: 16,
    color: '#333333',
    marginBottom: 16,
    lineHeight: 22,
  },
  answersContainer: {
    gap: 8,
    marginBottom: 16,
  },
  answerOption: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  correctUserAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  incorrectUserAnswer: {
    backgroundColor: '#FFEBEE',
    borderColor: '#FF3B30',
  },
  correctAnswer: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  answerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  answerLetter: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
  },
  answerIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  answerIndicatorText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666666',
  },
  optionImageContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  optionImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  answerText: {
    fontSize: 14,
    color: '#333333',
    lineHeight: 20,
  },
  explanation: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
  },
  explanationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 4,
  },
  explanationText: {
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});
